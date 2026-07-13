# Benchmark visualization taxonomy

## Families implemented

| Family | Implemented grammars |
|---|---|
| Ranking and comparison | master table, lollipop rank, hatched grouped bars, dumbbell delta, slopegraph, bump chart |
| Scale, cost, and efficiency | compute frontier, saturation, dual-axis training trace, log-log scaling, efficiency bubbles, Pareto scatter |
| Multi-dimensional profile | radar, small multiples, parallel coordinates, polar rose, glyph matrix, concentric rings |
| Distribution and uncertainty | forest interval, violin, box plot, ridgeline, ECDF, calibration |
| Diagnostics and matrices | heatmap, confusion matrix, context-decay strips, waterfall ablation, pairwise win matrix, behavior quadrant |
| Agent and process evaluation | long-horizon time series, stacked token area, swimlane, Sankey, survival curve, cumulative solve curve |
| Special encoding and coverage | cylindrical columns, waffle, treemap, beeswarm |
| Vendor release reproduction | Google triptych, OpenAI thinking outlines, Claude language intervals and broken axis, DeepSeek protocol uplift, TML frontier, Qwen language dots, Mistral selection quadrants |
| Asian model-lab papers | Kimi, MiniMax, GLM, InternLM2, ERNIE 5.0, Step-3, and Yi figure-verified grammars |

## Non-qualifying duplicates

The following do not create a new component by themselves:

- light and dark versions of the same chart;
- changing Claude to GPT or Qwen labels;
- changing bar colors without changing the information grammar;
- exporting one chart as PNG, WebP, GIF, and SVG;
- copying one screenshot into several vendor folders;
- swapping benchmark names while keeping identical data structure and reading order.

## Next gap scan

Potential future grammars should be added only after source verification:

- UpSet plot for benchmark-set overlap;
- ternary quality/cost/latency comparison;
- alluvial rank migration across benchmark versions;
- Bayesian posterior interval chart;
- correlation matrix with marginal distributions;
- posterior predictive check for benchmark judge models;
- token-level alignment ribbon;
- multilingual geographic coverage using sourced boundaries.

These are a research queue, not filler targets. Each must earn its place with a
real LLM evaluation use case and a distinct renderer.
