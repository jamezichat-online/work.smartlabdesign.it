import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/worker.js';
import { readVisits } from '../scripts/monitor-client.mjs';

const token = 'test-only-monitoring-01234567890123456789';
const base = 'https://analytics.example';
function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('CREATE TABLE views (id TEXT PRIMARY KEY, site TEXT NOT NULL, path TEXT NOT NULL, ts INTEGER NOT NULL)');
  const queries = [];
  const db = { withSession(mode) { assert.equal(mode, 'first-primary'); return this; }, prepare(query) {
    assert.match(query, /^SELECT /); queries.push(query);
    let params = [];
    return { bind(...values) { params = values; return this; }, async all() { return { results: sql.prepare(query).all(...params) }; } };
  } };
  const env = { DB: db, ADMIN_TOKEN: 'admin-test-only-01234567890123456789', MONITORING_TOKEN: token };
  const fetchImpl = (url, options) => worker.fetch(new Request(url, options), env);
  const get = (query = '', credentials = token, method = 'GET') => fetchImpl(base + '/api/monitoring/visits' + query, { method, headers: { Authorization: 'Bearer ' + credentials } });
  const insert = (id, ts = 100) => sql.prepare('INSERT INTO views (id,site,path,ts) VALUES (?, ?, ?, ?)').run(id, 'auxcore', '/auxcore/', ts);
  return { sql, db, env, queries, get, insert, fetchImpl };
}
test('monitoring: fail closed, independent token, no cookie or URL authentication', async () => {
  const f = fixture();
  for (const secret of [undefined, 'short', f.env.ADMIN_TOKEN]) {
    assert.equal((await worker.fetch(new Request(base + '/api/monitoring/visits'), { ...f.env, MONITORING_TOKEN: secret })).status, 503);
  }
  assert.equal((await f.get('', 'wrong')).status, 401);
  assert.equal((await f.get('', f.env.ADMIN_TOKEN)).status, 401);
  assert.equal((await worker.fetch(new Request(base + '/api/monitoring/visits?token=' + token), f.env)).status, 401);
  for (const path of ['/api/views', '/api/summary', '/api/sites', '/catalog.json']) {
    assert.equal((await f.fetchImpl(base + path, { headers: { Authorization: 'Bearer ' + token } })).status, 401);
  }
  assert.equal(f.queries.length, 0);
});
test('monitoring: GET only, private response, strict parameters, SELECT only', async () => {
  const f = fixture(); f.insert('one');
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']) assert.equal((await f.get('', token, method)).status, 405);
  for (const query of ['?limit=0', '?limit=501', '?after=-1', '?after=1e2', '?after=9007199254740992', '?since=x', '?after=0&after=1', '?unknown=x', '?cursor=x', '?cursor=null']) assert.equal((await f.get(query)).status, 400);
  const response = await f.get();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(response.headers.get('Set-Cookie'), null);
  const data = await response.json();
  assert.equal(data.records.length, 1);
  assert.deepEqual(Object.keys(data.records[0]).sort(), ['id', 'name', 'sequence', 'site', 'ts']);
  assert.equal(f.sql.prepare('SELECT COUNT(*) AS n FROM views').get().n, 1);
});
test('monitoring: signed pagination, identical timestamps, concurrent late commit, incremental read', async () => {
  const f = fixture(); for (let i = 0; i < 503; i++) f.insert('event-' + i);
  const first = await (await f.get('?limit=500')).json();
  assert.equal(first.records.length, 500); assert.equal(first.through, 503);
  assert.equal((await f.get('?cursor=' + first.nextCursor + 'x')).status, 400);
  assert.equal((await f.get('?cursor=' + first.nextCursor + '&after=0')).status, 400);
  f.insert('late-commit', 1);
  const second = await (await f.get('?cursor=' + encodeURIComponent(first.nextCursor))).json();
  assert.equal(second.records.length, 3); assert.equal(second.nextAfter, 503);
  assert.equal(new Set([...first.records, ...second.records].map(x => x.id)).size, 503);
  const result = await readVisits({ base, token, after: second.nextAfter, fetchImpl: f.fetchImpl });
  assert.equal(result.total, 1); assert.equal(result.after, 504); assert.equal(result.sites[0].first, 1);
  assert.equal((await readVisits({ base, token, after: result.after, fetchImpl: f.fetchImpl })).total, 0);
  assert.equal((await f.get('?after=999')).status, 409);
});
test('monitoring: legacy bootstrap cutoff, excluded tests and pagination completion', async () => {
  const f = fixture(); f.insert('old', 99); f.insert('excluded', 100); f.insert('new', 101);
  const result = await readVisits({ base, token, since: 100, excluded: ['excluded'], fetchImpl: f.fetchImpl });
  assert.equal(result.total, 1); assert.equal(result.after, 3); assert.equal(result.sites[0].first, 101);
});
test('monitoring: database failure and partial page failure never return a checkpoint', async () => {
  const f = fixture(); f.env.DB = null;
  assert.equal((await f.get()).status, 503);
  const g = fixture(); for (let i = 0; i < 501; i++) g.insert('event-' + i);
  let calls = 0;
  await assert.rejects(readVisits({ base, token, fetchImpl: (...args) => ++calls === 1 ? g.fetchImpl(...args) : Promise.resolve(new Response('unavailable', { status: 503 })) }), /HTTP_503/);
  await assert.rejects(readVisits({ base, token, fetchImpl: () => Promise.resolve(Response.json({ schemaVersion: 1, source: 'wrong', records: [] })) }), /INVALID_RESPONSE/);
});
