# Architecture

## Runtime flow

```text
source registry + component metadata + demo data
                         |
                         v
                   pure renderer
                         |
                         v
              self-contained accessible SVG
                         |
             +-----------+-----------+
             |                       |
             v                       v
       catalog preview         detail / export
```

There is no network request, build tool, framework runtime, or charting-library
dependency. The catalog can be served as static files.

## Modules

### `catalog.js`

Owns the source registry, palettes, component metadata, and demo datasets for
the core grammar set. Every component resolves its source at registration time.

### `renderers.js`

Owns the core pure renderers and shared SVG primitives. A renderer receives one
component entry and returns a complete SVG string with a stable `viewBox`,
title, description, inline styles, and `DEMO DATA` disclosure.

### `vendor-series.js`

Demonstrates the extension boundary for coherent vendor or research series. It
registers new sources, new components, and new renderers without changing the
core catalog implementation.

### `app.js`

Owns presentation-only state: query, filters, density, selected component,
dialog rendering, JSON copy, and SVG download. It does not own chart data.

## Invariants

- `id`, `grammar`, `visualSystem`, and `renderer` are globally unique.
- Every `sourceKey` resolves to a source with an HTTPS URL.
- Every renderer returns self-contained SVG with `<title>` and `<desc>`.
- No rendered SVG may contain `NaN`, `undefined`, or `null`.
- Every component has a description, `useWhen`, structured data, and disclosure.
- Required major model-lab lineages remain represented.

The validator treats these as executable product constraints.

## Extension strategy

Keep the core stable. Add a separate extension module when at least three
components share a coherent provenance or product surface. Register it after
`renderers.js` and before `app.js`, then include it in the validator VM context.

The future ESM package will expose `registerSource`, `registerRenderer`,
`registerComponent`, and `renderBenchmark` without relying on browser globals.
