import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker, { matchSite, startOfDayRome } from '../src/worker.js';

function database() {
  const sql = new DatabaseSync(':memory:');
  const db = { prepare(query) {
    let params = [];
    return { bind(...values) { params = values; return this; },
      async run() { return sql.prepare(query).run(...params); },
      async all() { return { results: sql.prepare(query).all(...params) }; },
      execute() { return { results: sql.prepare(query).all(...params) }; } };
  }, async batch(statements) { return statements.map(s => s.execute()); } };
  return { db, sql };
}
const secret = 'test-secret-only-0123456789-never-use-in-production';
const base = 'https://analytics.example';
function request(path, method = 'GET', body, origin = base, cookie) {
  const headers = { Origin: origin };
  if (cookie) headers.Cookie = cookie;
  return new Request(base + path, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
async function login(env) {
  const response = await worker.fetch(request('/api/login', 'POST', { password: secret }), env);
  assert.equal(response.status, 200);
  return response.headers.get('Set-Cookie').split(';')[0];
}
test('registrazione del sito con controllo origin e percorsi', () => {
  assert.equal(matchSite('https://live.smartlabdesign.it', '/auxcore/').id, 'auxcore');
  assert.equal(matchSite('https://sites.smartlabdesign.it', '/giggiooo-burger/').id, 'burger');
  assert.equal(matchSite('https://sites.smartlabdesign.it', '/').id, 'portfolio');
  for (const path of ['/auxcoreevil/', '/auxcore/../secret', '/auxcore/?email=x', '/auxcore/#x', '/auxcore/%2e%2e/x']) assert.equal(matchSite('https://live.smartlabdesign.it', path), null);
  assert.equal(matchSite('https://attacker.example', '/auxcore/'), null);
});
test('mezzanotte italiana e cambio ora legale', () => {
  assert.equal(new Date(startOfDayRome(Date.parse('2026-09-30T10:00:00Z'))).toISOString(), '2026-09-29T22:00:00.000Z');
  assert.equal(new Date(startOfDayRome(Date.parse('2026-10-25T15:00:00Z'))).toISOString(), '2026-10-24T22:00:00.000Z');
  assert.equal(new Date(startOfDayRome(Date.parse('2026-03-29T15:00:00Z'))).toISOString(), '2026-03-28T23:00:00.000Z');
});
test('nessun dato accessibile senza autenticazione, anche catalogo', async () => {
  const env = { ADMIN_TOKEN: secret };
  for (const path of ['/api/views', '/api/summary', '/api/sites', '/catalog.json']) assert.equal((await worker.fetch(request(path), env)).status, 401);
});
test('secret assente o breve: accesso chiuso', async () => {
  for (const env of [{}, { ADMIN_TOKEN: 'short' }]) assert.equal((await worker.fetch(request('/api/login', 'POST', { password: 'short' }), env)).status, 503);
});
test('login, cookie sicuro, tentativo CSRF e sessione alterata', async () => {
  const env = { ADMIN_TOKEN: secret };
  assert.equal((await worker.fetch(request('/api/login', 'POST', { password: 'wrong' }), env)).status, 401);
  assert.equal((await worker.fetch(request('/api/login', 'POST', { password: secret }, 'https://evil.example'), env)).status, 403);
  const response = await worker.fetch(request('/api/login', 'POST', { password: secret }), env);
  const setCookie = response.headers.get('Set-Cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', '__Host-']) assert.ok(setCookie.includes(flag));
  const cookie = setCookie.split(';')[0];
  assert.equal((await worker.fetch(request('/api/sites', 'GET', undefined, base, cookie), env)).status, 200);
  assert.equal((await worker.fetch(request('/api/sites', 'GET', undefined, base, cookie + 'a'), env)).status, 401);
});
test('raccolta anonima, idempotenza e minimizzazione dei dati', async () => {
  const { db, sql } = database(); const env = { DB: db, ADMIN_TOKEN: secret };
  const event = { path: '/auxcore/', eventId: crypto.randomUUID(), email: 'must-not-be-stored@example.test', ip: '127.0.0.1' };
  for (let i = 0; i < 2; i++) {
    const response = await worker.fetch(request('/api/collect', 'POST', event, 'https://live.smartlabdesign.it'), env);
    assert.equal(response.status, 204); assert.equal(response.headers.get('Set-Cookie'), null);
  }
  const rows = sql.prepare('SELECT * FROM views').all(); assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]).sort(), ['id', 'path', 'site', 'ts']);
  assert.equal(rows[0].site, 'auxcore'); assert.ok(Math.abs(rows[0].ts - Date.now()) < 5000);
});
test('origini esterne e dati non validi non scrivono nel database', async () => {
  const { db } = database(); const env = { DB: db };
  assert.equal((await worker.fetch(request('/api/collect', 'POST', { path: '/auxcore/', eventId: crypto.randomUUID() }, 'https://evil.example'), env)).status, 403);
  for (const path of ['/auxcore/?email=secret', '/not-registered/']) assert.equal((await worker.fetch(request('/api/collect', 'POST', { path, eventId: crypto.randomUUID() }, 'https://live.smartlabdesign.it'), env)).status, 400);
});
test('payload eccessivo rifiutato', async () => {
  const { db } = database();
  assert.equal((await worker.fetch(request('/api/collect', 'POST', { path: '/auxcore/', eventId: crypto.randomUUID(), large: 'x'.repeat(3000) }, 'https://live.smartlabdesign.it'), { DB: db })).status, 400);
});
test('registro, riepilogo e paginazione senza duplicati a parità di timestamp', async () => {
  const { db, sql } = database(); const env = { DB: db, ADMIN_TOKEN: secret }; const cookie = await login(env);
  await worker.fetch(request('/api/collect', 'POST', { path: '/auxcore/', eventId: crypto.randomUUID() }, 'https://live.smartlabdesign.it'), env);
  const now = Date.now(); const insert = sql.prepare('INSERT INTO views (id, site, path, ts) VALUES (?, ?, ?, ?)');
  for (let i = 0; i < 103; i++) insert.run('id-' + String(i).padStart(3, '0'), i < 80 ? 'auxcore' : 'ras', '/auxcore/', now);
  const fetchJson = async path => (await worker.fetch(request(path, 'GET', undefined, base, cookie), env)).json();
  const summary = await fetchJson('/api/summary?days=7'); assert.equal(summary.sites.reduce((n, s) => n + s.total, 0), 104);
  const first = await fetchJson('/api/views?days=7'); assert.equal(first.records.length, 50);
  const second = await fetchJson('/api/views?days=7&before=' + encodeURIComponent(JSON.stringify(first.next)));
  assert.equal(second.records.length, 50); assert.equal(new Set([...first.records, ...second.records].map(r => r.id)).size, 100);
  const site = await fetchJson('/api/views?days=7&site=ras'); assert.equal(site.records.length, 23);
  assert.equal((await worker.fetch(request('/api/views?days=999', 'GET', undefined, base, cookie), env)).status, 400);
});
test('consenso browser al non tracciamento e errori DB', async () => {
  const r = request('/api/collect', 'POST', { path: '/auxcore/', eventId: crypto.randomUUID() }, 'https://live.smartlabdesign.it'); r.headers.set('Sec-GPC', '1');
  assert.equal((await worker.fetch(r, {})).status, 204);
  assert.equal((await worker.fetch(request('/api/collect', 'POST', { path: '/auxcore/', eventId: crypto.randomUUID() }, 'https://live.smartlabdesign.it'), {})).status, 503);
});
test('logout rimuove la sessione e non accetta richieste da altre origini', async () => {
  const env = { ADMIN_TOKEN: secret };
  const cookie = await login(env);
  assert.equal((await worker.fetch(request('/api/logout', 'POST', undefined, 'https://evil.example', cookie), env)).status, 403);
  const response = await worker.fetch(request('/api/logout', 'POST', undefined, base, cookie), env);
  assert.ok(response.headers.get('Set-Cookie').includes('Max-Age=0'));
});
