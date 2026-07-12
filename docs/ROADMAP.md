# Roadmap

## 0.2 - Package boundary

- expose an ESM registration and rendering API;
- publish JSON Schema for component metadata and renderer datasets;
- add deterministic PNG export tooling;
- split core renderers by chart family without changing IDs.

## 0.3 - Versioned data adapters

- LMArena snapshots with confidence intervals;
- Open LLM Leaderboard and OpenCompass adapters;
- SWE-bench and LiveCodeBench versioned loaders;
- evaluation-condition footnotes generated from metadata.

## 0.4 - Visual reliability

- screenshot baselines at 390px, 768px, and 1440px;
- per-component clipping and text-overlap assertions;
- color-vision and grayscale audits;
- exported-SVG round-trip rendering checks.

## Ongoing source coverage

- verified releases from Asian model labs: ERNIE, Yi, StepFun, Baichuan, and InternLM;
- additional first-party Meta, Mistral, Cohere, AWS, NVIDIA, and xAI figures;
- arXiv grammars such as UpSet, alluvial, posterior intervals, correlation
  matrices, token alignment ribbons, and sourced multilingual maps;
- independent safety, tool-use, multimodal, and long-horizon leaderboards.

New grammars are added only when a real benchmark use case and source justify
them. The roadmap is not a component-count target.
