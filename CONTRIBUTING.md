# Contributing

Benchmark Atlas values coverage, provenance, and information design over raw
component count.

## Before proposing a chart

Open a new-chart issue and include:

- a first-party vendor, benchmark, lab, or paper URL;
- a screenshot or figure number for research context (do not commit copyrighted
  source artwork without permission);
- the benchmark question the chart answers;
- the proposed grammar and why no existing component can express it;
- the expected data schema.

## Acceptance rules

A chart is accepted only when all of the following are true:

1. Its `id`, `grammar`, `visualSystem`, and `renderer` are unique.
2. It communicates a materially different benchmark story.
3. It has a valid source lineage and a concise `useWhen` statement.
4. Its SVG contains an accessible title and description.
5. It is readable at 390px and 1440px without horizontal overflow.
6. Demo values are marked `DEMO DATA`; real values cite a versioned source.
7. `npm run validate` passes.

Color changes, dark-mode duplicates, renamed models, and alternate image exports
do not meet the uniqueness requirement.

## Development

```bash
npm run validate
npm run serve
# in another terminal, after installing Python Playwright + Chromium
python3 -m pip install -r requirements-dev.txt
playwright install chromium
npm run qa
```

Core grammars belong in `library/renderers.js`. A coherent vendor or research
series belongs in a separate extension module following `vendor-series.js`.
Keep renderers pure: input metadata and data in, self-contained SVG out.

## Pull requests

- Keep one chart series or one infrastructure change per PR.
- Explain the source, grammar, user value, and validation performed.
- Do not add archived web pages, vendor image dumps, credentials, or `.env`
  files.
- Update `research/SOURCES.md`, `research/TAXONOMY.md`, and `CHANGELOG.md` when
  coverage changes.
