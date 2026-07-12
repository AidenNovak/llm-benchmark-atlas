# Component contract

Each catalog entry is a structured object.

```js
{
  id: "claude-master-table",
  name: "Master Benchmark Table",
  chartLabel: "Frontier model benchmark sheet",
  family: "Ranking and comparison",
  sourceKey: "anthropic",
  source: "Anthropic / Claude",
  sourceType: "Vendor release",
  sourceUrl: "https://...",
  visualSystem: "VS-01 Warm editorial table",
  grammar: "grouped rows + primary outline + two-level highlight",
  renderer: "masterTable",
  description: "What the component communicates.",
  useWhen: "When to use it and when not to.",
  tags: ["table", "multi-benchmark"],
  palette: { bg, ink, muted, grid, c1, c2, c3, c4, c5, c6 },
  dataNote: "Demo-data disclosure.",
  data: { /* renderer-specific schema */ }
}
```

## Identity fields

`id`, `grammar`, `visualSystem`, and `renderer` are uniqueness keys. A new entry
must introduce all four. This deliberately prevents renamed or recolored copies
from inflating coverage.

## Provenance fields

`sourceKey` points to the source registry. `source`, `sourceType`, and
`sourceUrl` are resolved onto the entry so the UI and exported metadata do not
depend on another lookup.

The source identifies formal lineage, not ownership or endorsement.

## Data fields

Every renderer owns a small explicit schema. Demo datasets should use plausible
shape and range but must not reproduce current benchmark claims without a
versioned citation. Production adapters should attach evaluation date, metric,
unit, protocol, uncertainty method, and dataset version.

## Renderer contract

A renderer is a pure function:

```js
const svg = renderer(componentEntry);
```

It must return a complete SVG string with:

- `viewBox="0 0 640 400"` or an explicitly documented stable alternative;
- `role="img"`;
- linked `<title>` and `<desc>`;
- inline style tokens so downloaded SVG remains intact;
- visible data-status disclosure;
- no external fonts, images, scripts, or network calls.
