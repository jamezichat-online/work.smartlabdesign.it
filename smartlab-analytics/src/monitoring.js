// This route deliberately performs SELECT queries only. No schema initialization,
// session login, collection, or administrative operation is reachable with its token.
const encoder = new TextEncoder();
const headers = {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow'
};
const reply = (body, status = 200, extra = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });
const source = 'smartlab-analytics/views/v1';
const integer = value => typeof value === 'string' && /^(0|[1-9]\d{0,15})$/.test(value) && Number.isSafeInteger(Number(value));
async function key(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function tokenValid(provided, secret) {
  const k = await key(secret);
  const signature = await crypto.subtle.sign('HMAC', k, encoder.encode(secret));
  return crypto.subtle.verify('HMAC', k, signature, encoder.encode(provided));
}
function base64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); }
function decode(value) { return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0)); }
async function pack(value, secret) {
  const payload = base64(encoder.encode(JSON.stringify(value)));
  return payload + '.' + base64(await crypto.subtle.sign('HMAC', await key(secret), encoder.encode('cursor:v1:' + payload)));
}
async function unpack(value, secret) {
  const [payload, mac, extra] = value.split('.');
  if (extra !== undefined || !payload || !mac || !/^[\w-]+$/.test(payload + mac)) throw new Error('cursor');
  if (!(await crypto.subtle.verify('HMAC', await key(secret), decode(mac), encoder.encode('cursor:v1:' + payload)))) throw new Error('cursor');
  return JSON.parse(new TextDecoder().decode(decode(payload)));
}

export async function monitoring(request, env, sites) {
  const secret = env.MONITORING_TOKEN;
  if (typeof secret !== 'string' || secret.length < 32 || secret === env.ADMIN_TOKEN) return reply({ error: 'Monitoraggio non configurato.' }, 503);
  const authorization = request.headers.get('Authorization') || '';
  if (authorization.length > 1024 || !authorization.startsWith('Bearer ') || !(await tokenValid(authorization.slice(7), secret))) {
    return reply({ error: 'Accesso non autorizzato.' }, 401, { 'WWW-Authenticate': 'Bearer realm="smartlab-monitoring"' });
  }
  if (request.method !== 'GET') return reply({ error: 'Metodo non consentito.' }, 405, { Allow: 'GET' });
  const params = new URL(request.url).searchParams;
  for (const name of params.keys()) {
    if (!['after', 'since', 'cursor', 'limit'].includes(name) || params.getAll(name).length !== 1) return reply({ error: 'Parametri non validi.' }, 400);
  }
  const limitText = params.get('limit') ?? '100';
  if (!integer(limitText) || Number(limitText) < 1 || Number(limitText) > 500) return reply({ error: 'Limite non valido.' }, 400);
  let after, through, since;
  try {
    if (params.has('cursor')) {
      if (params.has('after') || params.has('since') || params.get('cursor').length > 1024) throw new Error('cursor');
      const c = await unpack(params.get('cursor'), secret);
      ({ after, through, since } = c);
      if (c.v !== 1 || !Number.isSafeInteger(after) || after < 0 || !Number.isSafeInteger(through) || through < after || (since !== null && (!Number.isSafeInteger(since) || since < 0))) throw new Error('cursor');
    } else {
      if (!integer(params.get('after') ?? '0') || (params.has('since') && !integer(params.get('since')))) throw new Error('cursor');
      after = Number(params.get('after') ?? 0);
      since = params.has('since') ? Number(params.get('since')) : null;
    }
  } catch { return reply({ error: 'Cursore non valido.' }, 400); }
  try {
    // The append-only views table has a stable SQLite rowid. Unlike event time,
    // insertion order also includes requests committed after an earlier check.
    const db = env.DB.withSession('first-primary');
    const high = await db.prepare('SELECT COALESCE(MAX(rowid), 0) AS high FROM views').all();
    const current = high.results[0].high;
    if (after > current || (through !== undefined && through > current)) return reply({ error: 'Registro arretrato o ripristinato: verifica manuale richiesta.' }, 409);
    through ??= current;
    const conditions = ['rowid > ?', 'rowid <= ?'];
    const values = [after, through];
    if (since !== null) { conditions.push('ts >= ?'); values.push(since); }
    const result = await db.prepare('SELECT rowid AS sequence, id, site, ts FROM views WHERE ' + conditions.join(' AND ') + ' ORDER BY rowid ASC LIMIT ?').bind(...values, Number(limitText) + 1).all();
    const records = result.results.slice(0, Number(limitText)).map(row => ({ ...row, name: sites.find(site => site.id === row.site)?.name ?? row.site }));
    const more = result.results.length > Number(limitText);
    const nextAfter = more ? records.at(-1).sequence : through;
    const nextCursor = more ? await pack({ v: 1, after: nextAfter, through, since }, secret) : null;
    return reply({ schemaVersion: 1, source, after, through, nextAfter, nextCursor, records });
  } catch {
    return reply({ error: 'Registro temporaneamente non disponibile.' }, 503);
  }
}
