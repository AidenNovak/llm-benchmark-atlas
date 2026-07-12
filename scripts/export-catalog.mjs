import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = relative => fs.readFileSync(new URL(relative, root), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);

for (const file of ['catalog.js', 'renderers.js', 'vendor-series.js', 'research-series.js', 'asian-series.js', 'api.js']) {
  vm.runInContext(read(`library/${file}`), sandbox, { filename: file });
}

const payload = {
  schemaVersion: 1,
  generatedAt: '2026-07-12',
  stats: sandbox.window.BenchmarkAtlas.stats(),
  sources: sandbox.window.BenchmarkAtlas.listSources(),
  components: sandbox.window.BenchmarkAtlas.list()
};

fs.writeFileSync(
  new URL('library/catalog.generated.json', root),
  `${JSON.stringify(payload, null, 2)}\n`,
  'utf8'
);

console.log(`wrote ${payload.components.length} components to library/catalog.generated.json`);
