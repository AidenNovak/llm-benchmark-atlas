# Benchmark chart source inventory

Last checked: 2026-07-12 (Asia/Shanghai)

## Audit of the previous archive

- Media files inspected: 237
- Exact duplicate groups: 76
- Redundant media copies: 150
- Exact-unique media files: 87
- Reusable live components before this pass: 6

The archive was useful as visual evidence, but directory count overstated real
coverage. The new library counts an item only when its chart grammar and
renderer are unique.

## First-party vendor and lab lineages

| Lineage | Primary source | Grammar extracted |
|---|---|---|
| Anthropic / Claude | <https://www.anthropic.com/news/claude-opus-4-6> | master table, warm editorial bars, uncertainty, long-horizon ledger |
| OpenAI / ChatGPT | <https://openai.com/index/introducing-o3-and-o4-mini/> | direct labels, compute frontier, pass@k, reliability |
| Google / Gemini | <https://deepmind.google/models/gemini/> | primary-color facets, multimodal panels, context decay |
| DeepSeek | <https://api-docs.deepseek.com/news/news250120> | hatched groups, price/quality comparison |
| Qwen | <https://qwenlm.github.io/blog/qwen3/> | thinking budget, MoE scale, purple system, cylinder promo |
| Qwen3 report | <https://arxiv.org/abs/2505.09388> | dual-axis training, ablation, distribution |
| Meta / Llama | <https://arxiv.org/abs/2407.21783> | scaling law, model-family and safety diagnostics |
| Mistral | <https://mistral.ai/news/mistral-large-2407> | release deltas and editorial comparison |
| Microsoft / Phi | <https://www.microsoft.com/en-us/research/publication/phi-4-technical-report/> | parameter efficiency |
| xAI / Grok | <https://x.ai/news/grok-3> | black high-contrast speed and latency language |
| Amazon Nova | <https://aws.amazon.com/ai/generative-ai/nova/> | multimodal radial coverage |
| Cohere Command | <https://cohere.com/blog/command-a> | enterprise capability matrix |
| NVIDIA Nemotron | <https://research.nvidia.com/labs/adlr/Nemotron-4-340B/> | black/green post-training scorecard |
| Cognition SWE research | <https://cognition.ai/blog/swe-grep> | behavioral scatter and repository distributions |
| Thinking Machines Lab | <https://thinkingmachines.ai/blog/interaction-models/> | intelligence-interactivity frontier |
| Kimi K2 report | <https://arxiv.org/abs/2507.20534> | sparsity scaling, attention-head facets, pipeline overlap, paired t-SNE |
| MiniMax-01 report | <https://arxiv.org/abs/2501.08313> | equal-quality isoflop gaps, sequence throughput cliff, hierarchical data coverage |
| MiniMax-M1 report | <https://arxiv.org/abs/2506.13585> | matched-quality RL speedup, training/inference probability agreement |
| GLM-4.5 report | <https://arxiv.org/abs/2508.06471> | RL curriculum counterfactuals, known/undisclosed parameter frontier |

## Independent leaderboards and benchmark lineages

| Lineage | Primary source | Grammar extracted |
|---|---|---|
| LMArena | <https://lmarena.ai/leaderboard> | Elo/rank movement and pairwise win matrix |
| Artificial Analysis | <https://artificialanalysis.ai/leaderboards/models> | frontier rank over time and price/quality thinking |
| OpenCompass | <https://opencompass.org.cn/leaderboard-llm> | normalized capability radar and Chinese evaluation axes |
| Stanford HELM | <https://crfm.stanford.edu/helm/lite/latest/> | scenario heatmap and transparent trade-offs |
| SWE-bench | <https://www.swebench.com/> | repository and behavior diagnostics |
| Vending-Bench | <https://andonlabs.com/evals/vending-bench> | long-horizon financial time series |
| Terminal-Bench | <https://www.tbench.ai/> | terminal trajectory swimlane |
| ToolBench | <https://github.com/OpenBMB/ToolBench> | intent-to-tool outcome flow |
| AgentBench | <https://github.com/THUDM/AgentBench> | task survival / time-to-completion |
| LiveCodeBench | <https://livecodebench.github.io/leaderboard.html> | cumulative solve curve |
| HaluEval | <https://github.com/RUCAIBox/HaluEval> | failure-mode composition |
| MMLU | <https://arxiv.org/abs/2009.03300> | domain coverage treemap |
| MMMU | <https://mmmu-benchmark.github.io/> | per-item multimodal distribution |

## Local evidence retained

The original pages and images remain under `_archive/`, including saved source
HTML for Anthropic, OpenAI, Google, DeepSeek, Meta, Mistral, Microsoft, xAI,
Cognition, and Thinking Machines. They are evidence and reference material, not
the public component API.

## Scope note

No finite static catalog can prove that every benchmark image on the internet
has been captured. The maintainable completion criterion is therefore:

1. cover each materially different chart grammar;
2. cover each major LLM vendor and independent leaderboard lineage;
3. reject color-only or label-only variants;
4. record sources and the date checked;
5. keep an explicit gap list for newly observed grammars.

### Figure-level Kimi evidence

- Figure 5: sparsity scaling with fixed active/shared experts and varying total experts.
- Figure 6: validation-loss scaling for heads=layers versus doubled heads.
- Figure 7: computation, communication, and offload overlap across PP phases.
- Figure 9: paired t-SNE maps for real MCP tools and synthetic tool domains.

### Figure-level MiniMax evidence

- MiniMax-01 Figure 4, PDF page 5: MoE versus dense isoflop curves across five benchmarks, with dashed equal-quality compute gaps.
- MiniMax-01 Figure 8, PDF page 10: attention-mechanism training throughput across 1K-65K sequence length and observed OOM limits.
- MiniMax-01 Figure 17, PDF page 36: two-level hierarchy of major multimodal capability groups and their top instruction tags.
- MiniMax-M1 Figure 2, PDF page 6: GRPO, DAPO, and CISPO training trajectories with an explicit 2x matched-quality step comparison.
- MiniMax-M1 Figure 3, PDF page 8: token-level training-mode versus inference-mode probabilities before and after the FP32 output-head fix.

### Figure-level GLM evidence

- GLM-4.5 Figure 2, PDF page 3: SWE-bench Verified against disclosed model parameters, with proprietary models placed in a separate Unknown lane.
- GLM-4.5 Figures 5-6, PDF page 8: difficulty-switch curriculum and single-stage versus progressive output-length RL counterfactuals.

This inventory is the evidence base for the current 71-component release, not a
claim that internet research can never discover another valid grammar.
