# Browser API

The static catalog exposes `window.BenchmarkAtlas` after `api.js` loads.

```html
<script src="catalog.js"></script>
<script src="renderers.js"></script>
<script src="vendor-series.js"></script>
<script src="api.js"></script>
```

## Read and render

```js
BenchmarkAtlas.stats();
BenchmarkAtlas.list();
BenchmarkAtlas.get('claude-master-table');
BenchmarkAtlas.query({ query: 'context', sourceType: '厂商发布' });
BenchmarkAtlas.listSources();

const svg = BenchmarkAtlas.render('openai-compute-frontier');
```

Every read method returns a defensive JSON clone. `render()` returns a complete,
self-contained SVG string.

## Register an extension

```js
BenchmarkAtlas.registerSource('myLab', {
  name: 'My Lab',
  type: 'Technical report',
  url: 'https://example.com/report',
  note: 'A concise provenance note'
});

BenchmarkAtlas.registerRenderer('myGrammar', entry => {
  return `<svg role="img" viewBox="0 0 640 400">...</svg>`;
});

BenchmarkAtlas.registerComponent({
  id: 'my-lab-new-grammar',
  name: 'New Grammar',
  chartLabel: 'A useful chart label',
  family: 'Extension family',
  sourceKey: 'myLab',
  visualSystem: 'VS-X My lab system',
  grammar: 'a materially unique information grammar',
  renderer: 'myGrammar',
  description: 'What evidence this component communicates.',
  useWhen: 'When it is appropriate and when it is not.',
  tags: ['extension'],
  palette: { /* standard palette tokens */ },
  data: { /* renderer schema */ }
});
```

Registration rejects duplicate IDs, grammars, visual systems, and renderer
names. It also rejects unknown sources or renderers.

## Generated catalog

`library/catalog.generated.json` contains the full source registry, metadata,
palettes, demo data, and aggregate stats without executable code. Regenerate it
after any catalog change:

```bash
npm run catalog
```

The validator compares the generated manifest with the runtime registry and
fails when it is stale.
