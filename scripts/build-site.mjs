import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const site = new URL('_site/', root);

fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(site, { recursive: true });
fs.cpSync(new URL('library/', root), site, { recursive: true });

for (const directory of ['schema', 'types']) {
  const destination = new URL(`${directory}/`, site);
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(new URL(`${directory}/`, root), destination, { recursive: true });
}

fs.writeFileSync(new URL('.nojekyll', site), '', 'utf8');
console.log('assembled static site in _site/');
