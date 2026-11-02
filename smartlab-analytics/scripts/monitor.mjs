import { readFile, writeFile, rename, mkdir, open, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readVisits } from './monitor-client.mjs';

// Private paths are supplied by the scheduler. Never print credential values or
// remote response bodies, including on failure.
const [command = 'check', stateArg, credentialArg, batchId] = process.argv.slice(2);
if (!['check', 'ack'].includes(command) || !stateArg || !credentialArg) {
  console.error('Uso: node scripts/monitor.mjs check|ack /percorso/state.json /percorso/credentials.json [batch-id]');
  process.exit(1);
}
const statePath = resolve(stateArg), credentialPath = resolve(credentialArg);
await mkdir(dirname(statePath), { recursive: true, mode: 0o700 });
let lock;
async function save(state) {
  const temp = statePath + '.' + randomUUID() + '.tmp';
  await writeFile(temp, JSON.stringify(state, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  await rename(temp, statePath);
}
try {
  lock = await open(statePath + '.lock', 'wx', 0o600);
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  const credentials = JSON.parse(await readFile(credentialPath, 'utf8'));
  if (state.dashboard_url !== credentials.base || !Number.isSafeInteger(state.last_successful_check_ms)) throw new Error('STATE_MISMATCH');
  if (command === 'ack') {
    if (!state.pending || state.pending.id !== batchId) throw new Error('BATCH_MISMATCH');
    state.after = state.pending.after;
    state.last_successful_check_ms = state.pending.checkedAt;
    state.last_delivered_batch = state.pending.id;
    delete state.pending;
    await save(state);
    console.log(JSON.stringify({ status: 'acknowledged', batch: batchId }));
  } else if (state.pending) {
    console.log(JSON.stringify({ status: 'new_views', batch: state.pending, replay: true }));
  } else {
    const result = await readVisits({ base: credentials.base, token: credentials.token, after: state.after ?? 0, since: state.after === undefined ? state.last_successful_check_ms : null, excluded: state.excluded_test_event_ids ?? [] });
    if (result.total) {
      state.pending = { ...result, id: randomUUID(), checkedAt: Date.now() };
      await save(state);
      console.log(JSON.stringify({ status: 'new_views', batch: state.pending, replay: false }));
    } else {
      state.after = result.after;
      state.last_successful_check_ms = Date.now();
      await save(state);
      console.log(JSON.stringify({ status: 'unchanged' }));
    }
  }
} catch (error) {
  // Only enumerated local codes may be logged. Do not stringify arbitrary errors.
  const code = /^(HTTP_\d{3}|HTTPS_REQUIRED|TOKEN_REQUIRED|INVALID_\w+|SNAPSHOT_CHANGED|PAGE_LIMIT|STATE_MISMATCH|BATCH_MISMATCH)$/.test(error.message) ? error.message : (error.code === 'EEXIST' ? 'LOCKED' : error.code === 'ENOENT' ? 'CONFIGURATION_MISSING' : 'CHECK_FAILED');
  console.error(JSON.stringify({ status: 'error', code }));
  process.exitCode = 1;
} finally {
  if (lock) { await lock.close(); await unlink(statePath + '.lock'); }
}
