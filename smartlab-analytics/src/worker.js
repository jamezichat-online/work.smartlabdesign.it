import sites from '../public/catalog.json' with { type: 'json' };

const ready = new WeakMap();
const enc = new TextEncoder();
const cookieName = '__Host-smartlab';
const sessionSeconds = 12 * 60 * 60;
const security = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow'
};
function json(value, status = 200, headers = {}) {
  return Response.json(value, { status, headers: { ...security, ...headers } });
}
function fault(message, status = 400) { return json({ error: message }, status); }
function configured(env) { return typeof env.ADMIN_TOKEN === 'string' && env.ADMIN_TOKEN.length >= 20; }
async function digest(value) { return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value))); }
async function equal(a, b) {
  const x = await digest(a), y = await digest(b);
  let result = 0; for (let i = 0; i < x.length; i++) result |= x[i] ^ y[i];
  return result === 0;
}
async function signature(value, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
  return Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('');
}
async function authenticated(request, env) {
  if (!configured(env)) return false;
  const value = request.headers.get('Cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  if (!value) return false;
  const [expiry, nonce, mac] = value.split('.');
  const remaining = Number(expiry) - Math.floor(Date.now() / 1000);
  if (!(remaining > 0 && remaining <= sessionSeconds) || !/^[a-f0-9-]{36}$/.test(nonce || '') || !/^[a-f0-9]{64}$/.test(mac || '')) return false;
  return equal(mac, await signature(expiry + '.' + nonce, env.ADMIN_TOKEN));
}
function sameOrigin(request) {
  return request.headers.get('Origin') === new URL(request.url).origin;
}
async function limitedBody(request, max = 2048) {
  if (Number(request.headers.get('Content-Length') || 0) > max) throw new Error('BODY');
  if (!request.body) return '';
  const reader = request.body.getReader(); let size = 0; const chunks = [];
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.length; if (size > max) { await reader.cancel(); throw new Error('BODY'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let pos = 0;
  for (const chunk of chunks) { bytes.set(chunk, pos); pos += chunk.length; }
  return new TextDecoder().decode(bytes);
}
async function ensure(db) {
  if (!db) throw new Error('DB');
  if (!ready.has(db)) {
    const promise = db.batch([
      db.prepare('CREATE TABLE IF NOT EXISTS views (id TEXT PRIMARY KEY, site TEXT NOT NULL, path TEXT NOT NULL, ts INTEGER NOT NULL)'),
      db.prepare('CREATE INDEX IF NOT EXISTS views_time ON views(ts DESC)'),
      db.prepare('CREATE INDEX IF NOT EXISTS views_site_time ON views(site, ts DESC)')
    ]).catch(error => { ready.delete(db); throw error; });
    ready.set(db, promise);
  }
  await ready.get(db);
}
export function matchSite(origin, path) {
  let url; try { url = new URL(origin); } catch { return null; }
  if (url.protocol !== 'https:' || !/^\/[a-zA-Z0-9_./%~-]*$/.test(path) || path.length > 600 || /%2f|%5c|%2e|\.\./i.test(path)) return null;
  return sites.filter(s => s.host === url.hostname && (s.path === '/' ? path === '/' || path === '/index.html' : path === s.path.slice(0, -1) || path.startsWith(s.path)))
    .sort((a, b) => b.path.length - a.path.length)[0] || null;
}
export function startOfDayRome(now = Date.now()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
  const utcMidnight = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  // Determine offset at midnight, including the two DST transition days.
  const utcHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', hourCycle: 'h23' }).format(utcMidnight - 3 * 3600000));
  const offset = (utcHour - 21 + 24) % 24;
  return utcMidnight - offset * 3600000;
}
async function collect(request, env) {
  const origin = request.headers.get('Origin');
  if (!sites.some(s => 'https://' + s.host === origin)) return fault('Origine non autorizzata.', 403);
  const cors = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', ...security };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  if (request.method !== 'POST') return fault('Metodo non consentito.', 405);
  if (request.headers.get('Sec-GPC') === '1') return new Response(null, { status: 204, headers: cors });
  let data; try { data = JSON.parse(await limitedBody(request)); } catch { return json({ error: 'Dati non validi.' }, 400, cors); }
  const site = typeof data?.path === 'string' && matchSite(origin, data.path);
  if (!site || typeof data.eventId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(data.eventId)) return json({ error: 'Pagina non registrata.' }, 400, cors);
  try {
    await ensure(env.DB);
    await env.DB.prepare('INSERT OR IGNORE INTO views (id, site, path, ts) VALUES (?, ?, ?, ?)').bind(data.eventId, site.id, data.path, Date.now()).run();
    return new Response(null, { status: 204, headers: cors });
  } catch { return json({ error: 'Raccolta temporaneamente non disponibile.' }, 503, cors); }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname;
    if (path === '/api/collect') return collect(request, env);
    if (path === '/api/login') {
      if (request.method !== 'POST' || !sameOrigin(request)) return fault('Richiesta non autorizzata.', 403);
      if (!configured(env)) return fault('Configura il secret ADMIN_TOKEN su Cloudflare (almeno 20 caratteri).', 503);
      let data; try { data = JSON.parse(await limitedBody(request)); } catch { return fault('Richiesta non valida.'); }
      if (typeof data.password !== 'string' || !(await equal(data.password, env.ADMIN_TOKEN))) return fault('Password non corretta.', 401);
      const payload = Math.floor(Date.now() / 1000) + sessionSeconds + '.' + crypto.randomUUID();
      const value = payload + '.' + await signature(payload, env.ADMIN_TOKEN);
      return json({ ok: true }, 200, { 'Set-Cookie': cookieName + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + sessionSeconds });
    }
    if (path === '/api/logout') {
      if (request.method !== 'POST' || !sameOrigin(request)) return fault('Richiesta non autorizzata.', 403);
      return json({ ok: true }, 200, { 'Set-Cookie': cookieName + '=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
    }
    if (path === '/catalog.json' || path.startsWith('/api/')) {
      if (!(await authenticated(request, env))) return fault('Accedi alla tua area privata.', 401);
      if (request.method !== 'GET') return fault('Metodo non consentito.', 405);
      if (path === '/api/sites' || path === '/catalog.json') return json(sites);
      const days = Number(url.searchParams.get('days') || 7);
      if (![1, 7, 30, 90].includes(days)) return fault('Periodo non valido.');
      const from = startOfDayRome(startOfDayRome() + 12 * 3600000 - (days - 1) * 86400000);
      try {
        await ensure(env.DB);
        if (path === '/api/summary') {
          const rows = await env.DB.prepare('SELECT site, COUNT(*) AS total, SUM(CASE WHEN ts >= ? THEN 1 ELSE 0 END) AS today, MAX(ts) AS last FROM views WHERE ts >= ? GROUP BY site').bind(startOfDayRome(), from).all();
          const daily = await env.DB.prepare('SELECT CAST(ts / 3600000 AS INTEGER) * 3600000 AS hour, COUNT(*) AS total FROM views WHERE ts >= ? GROUP BY hour ORDER BY hour').bind(from).all();
          return json({ sites: rows.results, hours: daily.results, from, updatedAt: Date.now() });
        }
        if (path === '/api/views') {
          const site = url.searchParams.get('site');
          if (site && !sites.some(s => s.id === site)) return fault('Sito non valido.');
          const before = url.searchParams.get('before');
          let cursor = null;
          if (before) { try { cursor = JSON.parse(before); } catch { return fault('Pagina non valida.'); }
            if (!Number.isSafeInteger(cursor.ts) || typeof cursor.id !== 'string' || cursor.id.length > 100) return fault('Pagina non valida.'); }
          const conditions = ['ts >= ?']; const params = [from];
          if (site) { conditions.push('site = ?'); params.push(site); }
          if (cursor) { conditions.push('(ts < ? OR (ts = ? AND id < ?))'); params.push(cursor.ts, cursor.ts, cursor.id); }
          const result = await env.DB.prepare('SELECT id, site, path, ts FROM views WHERE ' + conditions.join(' AND ') + ' ORDER BY ts DESC, id DESC LIMIT 51').bind(...params).all();
          const records = result.results.slice(0, 50); const last = records.at(-1);
          return json({ records, next: result.results.length > 50 ? { ts: last.ts, id: last.id } : null });
        }
        return fault('Pagina non trovata.', 404);
      } catch { return fault('Database temporaneamente non disponibile. Verifica il binding DB e le quote Free.', 503); }
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff'); headers.set('Referrer-Policy', 'no-referrer'); headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if (path === '/tracker.js') headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { status: response.status, headers });
  }
};
