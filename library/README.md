# Benchmark Atlas component library

`library/` is the reusable, data-driven part of this workspace. It is separate
from the screenshot archive and from the Cola-specific promo experiments.

## Open locally

```bash
cd ~/benchmark-promo-charts
python3 -m http.server 4173
# http://127.0.0.1:4173/library/
```

The page also works from `file://`, except that browser clipboard behavior may
be more restrictive.

## Current contract

- 71 components
- 71 renderer functions
- 71 unique chart grammars
- 71 unique visual-system identifiers
- 35 source lineages
- 10 chart families
- searchable and filterable catalog
- enlarged inspection dialog
- self-contained SVG export
- JSON data inspection/copy

All preview values are illustrative. The source link documents the visual or
evaluation lineage; it is not used to claim that the demo value is a current
leaderboard result.

## Files

| File | Role |
|---|---|
| `index.html` | Semantic page shell, filters, catalog, dialog |
| `styles.css` | Responsive application layout |
| `catalog.js` | Source registry, component metadata, demo data |
| `renderers.js` | One pure SVG renderer per component |
| `vendor-series.js` | Maintainable second-pass vendor release series |
| `research-series.js` | Detailed vendor and paper-figure extension series |
| `asian-series.js` | Figure-verified Kimi research series |
| `lab-series.js` | Figure-verified MiniMax and GLM research series |
| `api.js` | Query, render, and validated extension registration API |
| `catalog.generated.json` | Machine-readable registry snapshot |
| `app.js` | Search, filters, detail view, copy, SVG download |
| `../scripts/validate-library.mjs` | Duplication, coverage, rendering, and accessibility checks |

## Validate

```bash
node scripts/validate-library.mjs
```

The validator fails on duplicate IDs, duplicate chart grammars, duplicate visual
systems, duplicate renderers, missing required LLM vendors, missing sources,
runtime SVG errors, leaked `NaN`/`undefined`, absent accessible SVG metadata, or
missing figure-level evidence in the Asian model-lab family.

## Add a component

1. Add or reuse a grounded source in `BENCHMARK_SOURCES`.
2. Add one entry to `BENCHMARK_COMPONENTS` with a new `id`, `grammar`,
   `visualSystem`, and `renderer`.
3. Implement a pure renderer in `renderers.js`.
4. Keep values explicitly illustrative unless importing a versioned dataset.
5. Run the validator and visually inspect desktop and mobile layouts.

Changing only color, labels, or vendor name does not qualify as a new component.
