import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = relative => fs.readFileSync(new URL(relative, root), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('library/catalog.js'), sandbox, { filename: 'catalog.js' });
vm.runInContext(read('library/renderers.js'), sandbox, { filename: 'renderers.js' });
vm.runInContext(read('library/vendor-series.js'), sandbox, { filename: 'vendor-series.js' });
vm.runInContext(read('library/api.js'), sandbox, { filename: 'api.js' });

const components = sandbox.window.BENCHMARK_COMPONENTS;
const sources = sandbox.window.BENCHMARK_SOURCES;
const renderers = sandbox.window.BENCHMARK_RENDERERS;
const renderBenchmark = sandbox.window.renderBenchmark;
const api = sandbox.window.BenchmarkAtlas;
const errors = [];

function requireUnique(field) {
  const values = components.map(entry => entry[field]);
  if (new Set(values).size !== values.length) {
    errors.push(`${field} must be unique for all components`);
  }
}

function requireVendor(pattern, label) {
  if (!components.some(entry => pattern.test(entry.source))) {
    errors.push(`required lineage missing: ${label}`);
  }
}

if (components.length < 48) errors.push(`expected at least 48 components, found ${components.length}`);
requireUnique('id');
requireUnique('grammar');
requireUnique('visualSystem');
requireUnique('renderer');

[
  [/OpenAI/, 'OpenAI / ChatGPT'],
  [/Anthropic/, 'Anthropic / Claude'],
  [/Google/, 'Google / Gemini'],
  [/DeepSeek/, 'DeepSeek'],
  [/Qwen/, 'Qwen'],
  [/Meta/, 'Meta / Llama'],
  [/Mistral/, 'Mistral'],
  [/xAI/, 'xAI / Grok']
].forEach(([pattern, label]) => requireVendor(pattern, label));

for (const entry of components) {
  if (!sources[entry.sourceKey]) errors.push(`${entry.id}: unknown sourceKey ${entry.sourceKey}`);
  if (!renderers[entry.renderer]) errors.push(`${entry.id}: missing renderer ${entry.renderer}`);
  if (!entry.sourceUrl?.startsWith('https://')) errors.push(`${entry.id}: source URL must use https`);
  if (!entry.description || !entry.useWhen || !entry.data) errors.push(`${entry.id}: incomplete component contract`);
  try {
    const svg = renderBenchmark(entry);
    if (!svg.startsWith('<svg')) errors.push(`${entry.id}: renderer did not return SVG`);
    if (/NaN|undefined|null/.test(svg)) errors.push(`${entry.id}: invalid value leaked into SVG`);
    if (!svg.includes('<title') || !svg.includes('<desc')) errors.push(`${entry.id}: SVG lacks accessible title/description`);
    if (!svg.includes('DEMO DATA')) errors.push(`${entry.id}: demo-data disclosure missing`);
  } catch (error) {
    errors.push(`${entry.id}: render failed: ${error.message}`);
  }
}

const index = read('library/index.html');
for (const asset of ['styles.css', 'catalog.js', 'renderers.js', 'vendor-series.js', 'api.js', 'app.js']) {
  if (!index.includes(asset)) errors.push(`index.html does not load ${asset}`);
}

const generated = JSON.parse(read('library/catalog.generated.json'));
if (generated.components.length !== components.length) errors.push('generated catalog component count is stale');
if (generated.sources.length !== Object.keys(sources).length) errors.push('generated catalog source count is stale');
if (generated.stats.components !== api.stats().components) errors.push('generated catalog stats are stale');
if (generated.components.map(entry => entry.id).join('|') !== components.map(entry => entry.id).join('|')) {
  errors.push('generated catalog component order or IDs are stale');
}

const apiCopy = api.get('claude-master-table');
if (!apiCopy || apiCopy.id !== 'claude-master-table') errors.push('API get() failed');
apiCopy.name = 'mutated outside registry';
if (api.get('claude-master-table').name === apiCopy.name) errors.push('API get() did not return a defensive clone');
if (api.query({ query: 'Sankey' }).length !== 1) errors.push('API query() failed');
if (!api.render('openai-compute-frontier').startsWith('<svg')) errors.push('API render() failed');
try {
  api.registerSource('anthropic', sources.anthropic);
  errors.push('API accepted a duplicate source');
} catch (error) {
  // Expected contract rejection.
}

const report = {
  components: components.length,
  uniqueGrammars: new Set(components.map(entry => entry.grammar)).size,
  uniqueVisualSystems: new Set(components.map(entry => entry.visualSystem)).size,
  uniqueRenderers: new Set(components.map(entry => entry.renderer)).size,
  sourceLineages: new Set(components.map(entry => entry.sourceKey)).size,
  families: new Set(components.map(entry => entry.family)).size,
  errors
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
