import { mkdir, readFile, writeFile, unlink, chmod, realpath } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';

const directory = process.argv[2] && resolve(process.argv[2]);
if (!directory) { console.error('Indica una cartella privata esterna al repository.'); process.exit(1); }
const base = 'https://smartlab-analytics.smartlabdesign-tools.workers.dev';
process.umask(0o077);
await mkdir(directory, { recursive: true, mode: 0o700 });
const repoRoot = await realpath(fileURLToPath(new URL('../../', import.meta.url)));
const location = relative(repoRoot, await realpath(directory));
if (!location || (location !== '..' && !location.startsWith('..' + sep) && !isAbsolute(location))) throw new Error('La cartella privata deve essere esterna al repository.');
await chmod(directory, 0o700);
const credentialPath = join(directory, 'credentials.json');
let credentials;
try { credentials = JSON.parse(await readFile(credentialPath, 'utf8')); }
catch (error) {
  if (error.code !== 'ENOENT') throw new Error('Configurazione locale non valida.');
  credentials = { base, token: randomBytes(32).toString('hex') };
  await writeFile(credentialPath, JSON.stringify(credentials), { mode: 0o600, flag: 'wx' });
}
if (credentials.base !== base || typeof credentials.token !== 'string' || !/^[0-9a-f]{64}$/.test(credentials.token)) throw new Error('Credenziali non valide: nessun deploy eseguito.');
await chmod(credentialPath, 0o600);
const secretPath = join(directory, 'deploy-' + randomUUID() + '.json');
try {
  await writeFile(secretPath, JSON.stringify({ MONITORING_TOKEN: credentials.token }), { mode: 0o600, flag: 'wx' });
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--secrets-file', secretPath, '--strict'], {
      stdio: 'inherit', env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: '1341950440d70424b72c6e5bb0d20ead', WRANGLER_SEND_METRICS: 'false' }
    });
    child.on('error', reject); child.on('exit', done);
  });
  if (code !== 0) throw new Error('Deploy non riuscito. Credenziali private conservate per riprovare.');
  const response = await fetch(base + '/api/monitoring/visits?after=0&limit=1', {
    headers: { Authorization: 'Bearer ' + credentials.token }, redirect: 'error', signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error('Deploy effettuato; verifica autenticata non riuscita.');
  const data = await response.json();
  if (data.source !== 'smartlab-analytics/views/v1') throw new Error('Risposta API inattesa.');
  console.log('Deploy e lettura autenticata riusciti. Token salvato soltanto nella cartella privata indicata.');
} finally { await unlink(secretPath).catch(() => {}); }
