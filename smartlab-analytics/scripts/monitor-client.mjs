const source = 'smartlab-analytics/views/v1';
const safe = n => Number.isSafeInteger(n) && n >= 0;

export async function readVisits({ base, token, after = 0, since = null, excluded = [], fetchImpl = fetch }) {
  const endpoint = new URL('/api/monitoring/visits', base);
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(endpoint.hostname))) throw new Error('HTTPS_REQUIRED');
  if (typeof token !== 'string' || token.length < 32) throw new Error('TOKEN_REQUIRED');
  endpoint.searchParams.set('after', String(after));
  if (since !== null) endpoint.searchParams.set('since', String(since));
  endpoint.searchParams.set('limit', '500');
  let through, previous = after;
  const groups = new Map(), ids = new Set(), excludedIds = new Set(excluded);
  let total = 0;
  for (let page = 0; page < 2000; page++) {
    const response = await fetchImpl(endpoint, { headers: { Authorization: 'Bearer ' + token }, redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('HTTP_' + response.status);
    const data = await response.json();
    if (data.schemaVersion !== 1 || data.source !== source || !safe(data.through) || data.through < after || data.after !== previous || !Array.isArray(data.records) || data.records.length > 500 || !safe(data.nextAfter)) throw new Error('INVALID_RESPONSE');
    through ??= data.through;
    if (data.through !== through) throw new Error('SNAPSHOT_CHANGED');
    for (const row of data.records) {
      if (!safe(row.sequence) || row.sequence <= previous || row.sequence > through || typeof row.id !== 'string' || ids.has(row.id) || typeof row.site !== 'string' || !safe(row.ts) || typeof row.name !== 'string') throw new Error('INVALID_RECORD');
      previous = row.sequence; ids.add(row.id);
      if (excludedIds.has(row.id)) continue;
      const group = groups.get(row.site) ?? { site: row.site, name: row.name.slice(0, 200), total: 0, first: row.ts, last: row.ts };
      group.total++; group.first = Math.min(group.first, row.ts); group.last = Math.max(group.last, row.ts);
      groups.set(row.site, group); total++;
    }
    if (data.nextCursor === null) {
      if (data.nextAfter !== through) throw new Error('INVALID_CHECKPOINT');
      return { source, after: through, total, sites: [...groups.values()] };
    }
    if (typeof data.nextCursor !== 'string' || data.nextCursor.length > 1024 || !data.records.length || data.nextAfter !== previous) throw new Error('INVALID_CURSOR');
    endpoint.search = '';
    endpoint.searchParams.set('cursor', data.nextCursor);
    endpoint.searchParams.set('limit', '500');
  }
  throw new Error('PAGE_LIMIT');
}
