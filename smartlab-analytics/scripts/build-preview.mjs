import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const standaloneIndex = process.argv.indexOf('--standalone');
const standalonePath = standaloneIndex >= 0 ? process.argv[standaloneIndex + 1] : null;
if (standaloneIndex >= 0 && !standalonePath) throw new Error('Indica il percorso del file HTML dopo --standalone.');
const catalog = JSON.parse(await readFile(resolve(root, 'public/catalog.json'), 'utf8'));
await writeFile(resolve(root, 'public/preview-catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
for (const site of catalog) {
  if (standalonePath) {
    const image = await readFile(resolve(root, 'public', site.image));
    site.image = 'data:image/webp;base64,' + image.toString('base64');
  } else site.image = './public/' + site.image.replace(/^\.\//, '');
}
let html = await readFile(resolve(root, 'public/preview.html'), 'utf8');
const json = JSON.stringify(catalog).replace(/</g, '\\u003c');
html = html.replace('class="wordmark" href="./"', 'class="wordmark" href="#workspace"');
const catalogScript = '<script id="preview-catalog" type="application/json">' + json + '</script>';
if (standalonePath) {
  const css = await readFile(resolve(root, 'public/style.css'), 'utf8');
  const js = (await readFile(resolve(root, 'public/app.js'), 'utf8')).replace(/<\/script/gi, '<\\/script');
  const favicon = await readFile(resolve(root, 'public/favicon.svg'), 'utf8');
  html = html.replace('href="./favicon.svg"', 'href="data:image/svg+xml,' + encodeURIComponent(favicon) + '"');
  html = html.replace('<link rel="stylesheet" href="./style.css"><script defer src="./app.js"></script>', () => '<style>' + css + '</style>');
  html = html.replace('</body>', () => catalogScript + '<script>' + js + '</script></body>');
} else {
  html = html.replace('href="./favicon.svg"', 'href="./public/favicon.svg"');
  html = html.replace('href="./style.css"', 'href="./public/style.css"').replace('src="./app.js"', 'src="./public/app.js"');
  html = html.replace('</body>', () => catalogScript + '</body>');
}
await writeFile(standalonePath ? resolve(standalonePath) : resolve(root, 'anteprima.html'), html);
console.log(standalonePath ? 'Anteprima autonoma aggiornata con immagini incorporate.' : 'Anteprima repository e catalogo sincronizzati.');
