# Changelog

All notable changes to this project will be documented here.

## [0.6.0] - 2026-07-13

### Added

- Four PDF-verified system grammars: Hunyuan-Large capacity-aware recycle
  routing, Seed1.5-VL loss-to-benchmark transfer calibration, and DeepSeek-V3
  mixed-precision lifecycle plus fine-grained quantization accumulation.
- Three source lineages and browser QA for 83 components, 23 Asian model-lab
  entries, Hunyuan/Seed discovery, and both FP8 components.
- An Apple-inspired product story page with live component renders, provenance
  walkthroughs, responsive layout, and a dedicated browser QA suite.
- A custom three-bar Benchmark Atlas favicon, PNG fallback, Apple Touch Icon,
  and matching browser theme metadata across the catalog and product story.

### Research decisions

- Rejected DeepSeek-V3 Figure 9 as a new component because its expert-load
  heatmap information grammar overlaps the existing matrix family.

## [0.5.0] - 2026-07-13

### Added

- Eight PDF-verified model-lab components: InternLM2 orthogonal MFU stress,
  ERNIE 5.0 replay-buffer scheduling, entropy-collapse diagnostics and expert
  collaboration, Step-3 hardware roofline and objective reversal, plus Yi
  continuous/discrete emergence and layer-token similarity bands.
- Four source lineages with figure locators and rendered PDF page evidence.
- Browser QA assertions for 79 components, 19 Asian model-lab components,
  ERNIE search coverage, and the hardware-roofline grammar.

### Changed

- Corrected false candidate citations during research: unrelated arXiv records
  were rejected after title and first-page verification rather than entering the
  source inventory.

## [0.4.0] - 2026-07-12

### Added

- Seven PDF-verified MiniMax and GLM components: equal-quality isoflop gaps,
  attention throughput cliffs, hierarchical instruction coverage, matched-quality
  RL speedup, training/inference probability agreement, curriculum
  counterfactuals, and a known/undisclosed parameter frontier.
- Machine-readable `evidence` metadata with publication figure locator, rendered
  PDF page, verification date, and a concise visual-evidence summary.
- Evidence surfaced in the inspection dialog and validated for all 11 Asian
  model-lab components.
- Dedicated MiniMax and GLM browser QA, plus a refreshed catalog preview.
- Deterministic static-site assembly and a runner-independent `gh-pages`
  deployment command.

## [0.3.0] - 2026-07-12

### Added

- Figure-verified Kimi K2 series: sparsity scaling trajectories, attention-head
  facets, pipeline overlap schedule, and paired real/synthetic tool embeddings.
- Dedicated Asian model-lab family and browser QA assertion.
- Kimi K2 source evidence mapped to Figures 5, 6, 7, and 9.
- Published JSON Schema and TypeScript declarations for the component API.

## [0.2.0] - 2026-07-12

### Added

- 12 detailed vendor and paper-figure grammars: MRCR spark rows, centered expert
  win rate, enterprise win/tie/loss, MoE activation rails, context contour,
  post-training ladder, latency ranges, generation vectors, UpSet, alluvial,
  raincloud, and ternary selection.
- Four additional paper and benchmark source lineages.
- Source metadata consistency checks across every extension module.
- Dedicated browser QA for vendor-release and paper-reproduction families.

## [0.1.0] - 2026-07-12

### Added

- 40 core benchmark visualization grammars and pure SVG renderers.
- 8 vendor-release reproduction components for Gemini, OpenAI, Claude,
  DeepSeek, Qwen, Mistral, and Thinking Machines Lab.
- Source registry covering 27 vendor, leaderboard, lab, and paper lineages.
- Search, family/source/vendor filters, gallery and compact views.
- Enlarged detail view, JSON inspection, SVG export, and source links.
- Contract validator for uniqueness, provenance, runtime SVG integrity, and
  accessibility.
- Desktop and 390px mobile interaction QA.
- Browser query/render/extension API and generated machine-readable catalog.
- GitHub Actions validation and Pages deployment workflows.
