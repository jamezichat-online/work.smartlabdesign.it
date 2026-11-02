import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const exec = promisify(execFile);
const folder = await mkdtemp(join(tmpdir(), 'smartlab-monitor-e2e-'));
const token = randomBytes(32).toString('hex'), admin = randomBytes(32).toString('hex');
const bundle = await build({ entryPoints: ['src/worker.js'], bundle: true, format: 'esm', platform: 'browser', write: false });
const settings = convertV4MiniflareOptions({ modules: true, script: bundle.outputFiles[0].text, compatibilityDate: '2026-09-30',
  d1Databases: { DB: 'isolated-test-only' }, resourcePersistencePath: join(folder, 'd1'),
  bindings: { MONITORING_TOKEN: token, ADMIN_TOKEN: admin },
  host: '127.0.0.1', port: 0 });
let mf;
try {
  mf = new Miniflare(settings);
  const base = (await mf.ready).origin;
  const statePath = join(folder, 'state.json'), credentialsPath = join(folder, 'credentials.json');
  const excluded = randomUUID();
  await writeFile(statePath, JSON.stringify({ dashboard_url: base, last_successful_check_ms: 0, excluded_test_event_ids: [excluded] }), { mode: 0o600 });
  await writeFile(credentialsPath, JSON.stringify({ base, token }), { mode: 0o600 });
  const monitor = async (command = 'check', batch) => {
    const { stdout } = await exec(process.execPath, ['scripts/monitor.mjs', command, statePath, credentialsPath, ...(batch ? [batch] : [])]);
    assert.ok(!stdout.includes(token)); return JSON.parse(stdout);
  };
  const collect = async eventId => {
    const response = await fetch(base + '/api/collect', { method: 'POST', headers: { Origin: 'https://live.smartlabdesign.it', 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/auxcore/', eventId }) });
    assert.equal(response.status, 204);
  };
  const firstId = randomUUID();
  await collect(firstId); await collect(firstId); await collect(excluded);
  const db = await mf.getD1Database('DB');
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM views').first()).n, 2);
  assert.equal((await fetch(base + '/api/monitoring/visits')).status, 401);
  const auth = { Authorization: 'Bearer ' + token };
  for (const path of ['/api/views', '/api/summary', '/api/sites', '/catalog.json']) assert.equal((await fetch(base + path, { headers: auth })).status, 401);
  assert.equal((await fetch(base + '/api/monitoring/visits', { method: 'DELETE', headers: auth })).status, 405);
  const login = await fetch(base + '/api/login', { method: 'POST', headers: { Origin: base }, body: JSON.stringify({ password: admin }) });
  assert.equal(login.status, 200);
  assert.equal((await fetch(base + '/api/summary', { headers: { Cookie: login.headers.get('Set-Cookie').split(';')[0] } })).status, 200);
  const first = await monitor();
  assert.equal(first.status, 'new_views'); assert.equal(first.batch.total, 1);
  const replay = await monitor();
  assert.equal(replay.batch.id, first.batch.id); assert.equal(replay.replay, true);
  const pending = await readFile(statePath, 'utf8');
  await assert.rejects(monitor('ack', 'wrong-batch'));
  assert.equal(await readFile(statePath, 'utf8'), pending);
  await monitor('ack', first.batch.id);
  assert.equal((await monitor()).status, 'unchanged');
  const checkpoint = await readFile(statePath, 'utf8');
  await writeFile(credentialsPath, JSON.stringify({ base, token: 'invalid-secret-000000000000000000000000000' }));
  await assert.rejects(monitor());
  assert.equal(await readFile(statePath, 'utf8'), checkpoint);
  await writeFile(credentialsPath, JSON.stringify({ base, token }));
  await collect(randomUUID());
  const second = await monitor(); assert.equal(second.batch.total, 1);
  await monitor('ack', second.batch.id);
  assert.equal((await monitor()).status, 'unchanged');
  await mf.dispose();
  mf = new Miniflare(settings);
  await mf.ready;
  const persisted = await mf.getD1Database('DB');
  assert.equal((await persisted.prepare('SELECT COUNT(*) AS n FROM views').first()).n, 3);
  console.log('PASS: real Workers runtime + local D1 persistence, collection idempotency, admin compatibility, read-only authentication, incremental check, excluded tests, pending replay, ack, quiet unchanged result and failure checkpoint preservation.');
} finally {
  if (mf) await mf.dispose();
  await rm(folder, { recursive: true, force: true });
}
