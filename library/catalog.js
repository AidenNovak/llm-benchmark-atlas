(function () {
  "use strict";

  const sources = {
    anthropic: {
      name: "Anthropic / Claude",
      type: "厂商发布",
      url: "https://www.anthropic.com/news/claude-opus-4-6",
      note: "暖纸、珊瑚主系列、强表格与误差区间"
    },
    openai: {
      name: "OpenAI / ChatGPT",
      type: "厂商发布",
      url: "https://openai.com/index/introducing-o3-and-o4-mini/",
      note: "高留白、单一强调色、compute 与 reliability 叙事"
    },
    deepseek: {
      name: "DeepSeek",
      type: "厂商发布",
      url: "https://api-docs.deepseek.com/news/news250120",
      note: "蓝色斜线纹理、分组 benchmark 与价格效率"
    },
    mistral: {
      name: "Mistral AI",
      type: "厂商发布",
      url: "https://mistral.ai/news/mistral-large-2407",
      note: "暖色编辑风格与差值叙事"
    },
    arena: {
      name: "LMArena / Chatbot Arena",
      type: "独立榜单",
      url: "https://lmarena.ai/leaderboard",
      note: "Elo、胜率、置信区间与排名变化"
    },
    artificialAnalysis: {
      name: "Artificial Analysis",
      type: "独立榜单",
      url: "https://artificialanalysis.ai/leaderboards/models",
      note: "质量、速度、价格与前沿模型的多轴比较"
    },
    qwen: {
      name: "Alibaba Qwen",
      type: "厂商发布",
      url: "https://qwenlm.github.io/blog/qwen3/",
      note: "紫色系统、thinking budget 与 MoE 效率"
    },
    qwenPaper: {
      name: "Qwen3 Technical Report",
      type: "arXiv 论文",
      url: "https://arxiv.org/abs/2505.09388",
      note: "训练阶段、消融、缩放与多任务评测"
    },
    llama: {
      name: "Meta / Llama",
      type: "arXiv 论文",
      url: "https://arxiv.org/abs/2407.21783",
      note: "缩放曲线、模型族比较与安全诊断"
    },
    phi: {
      name: "Microsoft / Phi",
      type: "技术报告",
      url: "https://www.microsoft.com/en-us/research/publication/phi-4-technical-report/",
      note: "小模型参数效率与数据质量"
    },
    opencompass: {
      name: "OpenCompass",
      type: "独立榜单",
      url: "https://opencompass.org.cn/leaderboard-llm",
      note: "多维能力、中文评测与并行坐标"
    },
    gemini: {
      name: "Google / Gemini",
      type: "厂商发布",
      url: "https://deepmind.google/models/gemini/",
      note: "Google 原色、小多图与长上下文"
    },
    helm: {
      name: "Stanford HELM",
      type: "独立榜单",
      url: "https://crfm.stanford.edu/helm/lite/latest/",
      note: "场景矩阵、透明评测与多指标折衷"
    },
    nova: {
      name: "Amazon Nova",
      type: "厂商发布",
      url: "https://aws.amazon.com/ai/generative-ai/nova/",
      note: "AWS 橙、模态覆盖与径向构图"
    },
    cohere: {
      name: "Cohere / Command",
      type: "厂商发布",
      url: "https://cohere.com/blog/command-a",
      note: "珊瑚、薄荷与企业能力矩阵"
    },
    nvidia: {
      name: "NVIDIA / Nemotron",
      type: "技术报告",
      url: "https://research.nvidia.com/labs/adlr/Nemotron-4-340B/",
      note: "高对比黑绿与分项得分环"
    },
    cognition: {
      name: "Cognition / SWE research",
      type: "研究博客",
      url: "https://cognition.ai/blog/swe-grep",
      note: "行为散点、分布诊断与训练过程"
    },
    xai: {
      name: "xAI / Grok",
      type: "厂商发布",
      url: "https://x.ai/news/grok-3",
      note: "黑白界面、速度与推理延迟"
    },
    swebench: {
      name: "SWE-bench",
      type: "独立榜单",
      url: "https://www.swebench.com/",
      note: "软件工程任务、Agent 行为与解题轨迹"
    },
    vending: {
      name: "Vending-Bench",
      type: "独立评测",
      url: "https://andonlabs.com/evals/vending-bench",
      note: "长时程 Agent 收益与风险时间序列"
    },
    terminalBench: {
      name: "Terminal-Bench",
      type: "独立榜单",
      url: "https://www.tbench.ai/",
      note: "终端任务轨迹与阶段耗时"
    },
    toolbench: {
      name: "ToolBench",
      type: "arXiv / 开源评测",
      url: "https://github.com/OpenBMB/ToolBench",
      note: "工具选择、调用与结果链路"
    },
    agentbench: {
      name: "AgentBench",
      type: "arXiv / 开源评测",
      url: "https://github.com/THUDM/AgentBench",
      note: "跨环境 Agent 完成率与存活曲线"
    },
    livecodebench: {
      name: "LiveCodeBench",
      type: "独立榜单",
      url: "https://livecodebench.github.io/leaderboard.html",
      note: "时间切片、防污染与累计解题"
    },
    halueval: {
      name: "HaluEval",
      type: "arXiv / 开源评测",
      url: "https://github.com/RUCAIBox/HaluEval",
      note: "幻觉类型与失败构成"
    },
    mmlu: {
      name: "MMLU",
      type: "arXiv 论文",
      url: "https://arxiv.org/abs/2009.03300",
      note: "学科域覆盖与宏观能力"
    },
    mmmu: {
      name: "MMMU",
      type: "arXiv / 独立评测",
      url: "https://mmmu-benchmark.github.io/",
      note: "多模态题型与样本分布"
    }
  };

  const P = {
    claude: { bg: "#f4efe5", ink: "#211b16", muted: "#7b7168", grid: "#d8d0c5", c1: "#d96f4f", c2: "#2c6e63", c3: "#3270a8", c4: "#c8bfaf", c5: "#f0b354", c6: "#704f92" },
    openai: { bg: "#ffffff", ink: "#141414", muted: "#70706d", grid: "#dededb", c1: "#d6409f", c2: "#9f87ff", c3: "#ffdd57", c4: "#55a99d", c5: "#dadad6", c6: "#111111" },
    deepseek: { bg: "#f8fbff", ink: "#172239", muted: "#64708a", grid: "#d9e2ef", c1: "#4d6bfe", c2: "#86a0ff", c3: "#b9c7ff", c4: "#d9e1f4", c5: "#27355c", c6: "#7db6ff" },
    mistral: { bg: "#fff7e8", ink: "#24140c", muted: "#876f5e", grid: "#ead6bd", c1: "#ff7000", c2: "#ffb000", c3: "#e63b24", c4: "#7e2b18", c5: "#ffe0a6", c6: "#332018" },
    arena: { bg: "#f7f7f5", ink: "#191919", muted: "#72726e", grid: "#dcdcd8", c1: "#2f65d9", c2: "#e04b42", c3: "#28a17a", c4: "#8c62c4", c5: "#e2a928", c6: "#4f4f4b" },
    dark: { bg: "#111311", ink: "#f6f7f2", muted: "#a8aca4", grid: "#3a3d38", c1: "#b4f451", c2: "#66d9c1", c3: "#ff7b72", c4: "#a9a7ff", c5: "#ffd166", c6: "#f4f4ef" },
    qwen: { bg: "#f6f3ff", ink: "#24174a", muted: "#756b91", grid: "#ded5f3", c1: "#6657d9", c2: "#28b8c7", c3: "#ffb12b", c4: "#d75b9b", c5: "#a59af0", c6: "#2c2850" },
    paper: { bg: "#fffefa", ink: "#171717", muted: "#6c6a64", grid: "#d8d5cb", c1: "#171717", c2: "#8b8b85", c3: "#c7c4ba", c4: "#e2604b", c5: "#4777a9", c6: "#69825a" },
    llama: { bg: "#fbf5eb", ink: "#201c18", muted: "#736b62", grid: "#dfd5c8", c1: "#3559c7", c2: "#d64d3a", c3: "#e3a72f", c4: "#3f8b72", c5: "#8b66b0", c6: "#201c18" },
    phi: { bg: "#f2f8ff", ink: "#102a43", muted: "#647b91", grid: "#d4e2ef", c1: "#0078d4", c2: "#55a7e0", c3: "#e0529c", c4: "#7b61c9", c5: "#36a18b", c6: "#ffb900" },
    compass: { bg: "#fffdf8", ink: "#212121", muted: "#77736d", grid: "#e0ddd4", c1: "#e73b35", c2: "#2e63d7", c3: "#efb532", c4: "#2b9b77", c5: "#8e62c4", c6: "#222222" },
    google: { bg: "#ffffff", ink: "#202124", muted: "#6b7075", grid: "#e1e4e8", c1: "#4285f4", c2: "#ea4335", c3: "#fbbc04", c4: "#34a853", c5: "#a142f4", c6: "#24c1e0" },
    stanford: { bg: "#fffaf7", ink: "#2e2d29", muted: "#736f69", grid: "#e2d9d2", c1: "#8c1515", c2: "#d8786c", c3: "#4d7f89", c4: "#e5b754", c5: "#7f6ca8", c6: "#2e2d29" },
    aws: { bg: "#0f1b2a", ink: "#f5f7fa", muted: "#aab5c3", grid: "#344154", c1: "#ff9900", c2: "#36c2b4", c3: "#759cff", c4: "#e86f92", c5: "#f3d35f", c6: "#f5f7fa" },
    cohere: { bg: "#fff4ed", ink: "#241f1b", muted: "#7b6d62", grid: "#e7d5c8", c1: "#d65b4a", c2: "#84c7a9", c3: "#f0ba52", c4: "#466b8a", c5: "#a975a3", c6: "#241f1b" },
    nvidia: { bg: "#10130d", ink: "#f1f5e9", muted: "#aab2a2", grid: "#394032", c1: "#76b900", c2: "#b7db69", c3: "#58c7a6", c4: "#f6cc55", c5: "#8fa8ff", c6: "#f1f5e9" },
    research: { bg: "#fbfbfb", ink: "#202020", muted: "#707070", grid: "#dedede", c1: "#7049a8", c2: "#36a58b", c3: "#e18b35", c4: "#cf5268", c5: "#4e81bd", c6: "#222222" },
    cognition: { bg: "#ffffff", ink: "#151515", muted: "#737373", grid: "#e0e0e0", c1: "#2355d9", c2: "#ee5b7f", c3: "#5ec0a7", c4: "#f1b247", c5: "#9b73d3", c6: "#151515" },
    terminal: { bg: "#111913", ink: "#e9f3ea", muted: "#92a695", grid: "#304235", c1: "#63d17d", c2: "#57a6ff", c3: "#eecb68", c4: "#e06c75", c5: "#c678dd", c6: "#e9f3ea" },
    vivid: { bg: "#fffdf8", ink: "#1e1c19", muted: "#756f66", grid: "#ded8cd", c1: "#ee4b3f", c2: "#2b68d2", c3: "#f0bd30", c4: "#2eaa77", c5: "#8f60bf", c6: "#161616" }
  };

  function component(def) {
    const source = sources[def.sourceKey];
    return Object.assign({
      source: source.name,
      sourceType: source.type,
      sourceUrl: source.url,
      dataNote: "示意数据，仅复现信息结构，不代表最新榜单结果。"
    }, def);
  }

  const components = [
    component({
      id: "claude-master-table", name: "Master Benchmark Table", chartLabel: "Frontier model benchmark sheet", family: "排名与横向对比", sourceKey: "anthropic", visualSystem: "VS-01 Warm editorial table", grammar: "分组行 + 主模型描边 + 单元格双层高亮", renderer: "masterTable", palette: P.claude,
      description: "将 coding、reasoning、agentic search 等异质指标放进一张可扫描总表，保留测试条件脚注。", useWhen: "适合模型发布总览；不适合指标口径差异过大且无法写清脚注的场景。", tags: ["table", "multi-benchmark", "release"],
      data: { columns: ["Opus 4.6", "Opus 4.5", "GPT-5.x", "Gemini Pro"], rows: [
        { group: "CODING", label: "SWE-bench", values: [82.1, 78.4, 76.8, 74.2] },
        { group: "AGENT", label: "Terminal-Bench", values: [65.8, 58.9, 61.4, 57.1] },
        { group: "REASON", label: "GPQA Diamond", values: [91.3, 88.1, 90.2, 87.4] },
        { group: "SEARCH", label: "BrowseComp", values: [84.7, 76.9, 86.2, 80.1] }
      ] }
    }),
    component({
      id: "openai-lollipop-rank", name: "Direct-label Lollipop Rank", chartLabel: "AIME · pass rate", family: "排名与横向对比", sourceKey: "openai", visualSystem: "VS-02 Clinical magenta", grammar: "水平棒棒糖 + 末端直标 + 目标线", renderer: "lollipop", palette: P.openai,
      description: "用细杆和端点替代面积更重的柱图，在紧凑空间里突出冠军和目标阈值。", useWhen: "适合单指标模型排名，以及需要把 90% 等目标线放进图中的场景。", tags: ["ranking", "single-metric", "target"],
      data: { target: 90, items: [{ label: "o-series", value: 96.4 }, { label: "GPT-series", value: 91.8 }, { label: "Gemini", value: 88.7 }, { label: "Claude", value: 86.9 }, { label: "Qwen", value: 82.5 }] }
    }),
    component({
      id: "deepseek-hatched-groups", name: "Hatched Multi-bench Bars", chartLabel: "Six tasks · grouped accuracy", family: "排名与横向对比", sourceKey: "deepseek", visualSystem: "VS-03 Blueprint hatch", grammar: "多组柱 + 自家斜线纹理 + 双层类目轴", renderer: "groupedHatch", palette: P.deepseek,
      description: "用纹理而不只用颜色标记主模型，适合密集 benchmark 横评与黑白打印。", useWhen: "适合 3–5 个模型跨 4–8 个指标；系列更多时应改用热力图。", tags: ["grouped-bar", "hatch", "print-safe"],
      data: { series: ["DeepSeek", "Qwen", "Llama"], groups: [
        { label: "AIME", values: [79, 75, 61] }, { label: "GPQA", values: [71, 68, 62] }, { label: "MMLU", values: [89, 87, 84] }, { label: "SWE", values: [49, 44, 37] }, { label: "MATH", values: [92, 88, 80] }
      ] }
    }),
    component({
      id: "mistral-dumbbell-delta", name: "Release Delta Dumbbells", chartLabel: "Previous → current release", family: "排名与横向对比", sourceKey: "mistral", visualSystem: "VS-04 Sunlit editorial", grammar: "双端点差值图 + 方向箭头 + 增量直标", renderer: "dumbbell", palette: P.mistral,
      description: "把新旧版本的绝对值和提升幅度同时呈现，避免只宣传相对百分比。", useWhen: "适合同一模型家族迭代对比；不用于不同测试口径的跨版本结果。", tags: ["delta", "release", "before-after"],
      data: { items: [{ label: "Coding", before: 61, after: 74 }, { label: "Math", before: 72, after: 86 }, { label: "Multilingual", before: 78, after: 84 }, { label: "Tool use", before: 49, after: 69 }, { label: "Long context", before: 68, after: 77 }] }
    }),
    component({
      id: "arena-rank-slope", name: "Two-snapshot Rank Slope", chartLabel: "Arena rank · two snapshots", family: "排名与横向对比", sourceKey: "arena", visualSystem: "VS-05 Neutral civic ranking", grammar: "双时点坡度图 + 名次反向轴 + 交叉直标", renderer: "slopegraph", palette: P.arena,
      description: "直接显示模型在两次榜单快照之间的名次升降，并保留交叉关系。", useWhen: "适合两个时间点、6 个以内对象的名次变化；更多时间点用 bump chart。", tags: ["rank-change", "slopegraph", "arena"],
      data: { left: "MAY", right: "JUN", items: [{ label: "Model A", left: 1, right: 3 }, { label: "Model B", left: 4, right: 1 }, { label: "Model C", left: 2, right: 2 }, { label: "Model D", left: 5, right: 4 }, { label: "Model E", left: 3, right: 5 }] }
    }),
    component({
      id: "aa-rank-bump", name: "Frontier Rank Bump Chart", chartLabel: "Quality index rank · 5 releases", family: "排名与横向对比", sourceKey: "artificialAnalysis", visualSystem: "VS-06 Dark analyst terminal", grammar: "多时点名次 bump + 端点标签 + 首末高亮", renderer: "bump", palette: P.dark,
      description: "跟踪多家模型在连续发布周期中的排名换位，强调前沿竞争的动态性。", useWhen: "适合 3–6 个系列和 3 个以上时间点，值本身不重要、名次变化重要。", tags: ["bump", "timeline", "frontier"],
      data: { periods: ["Q1", "Q2", "Q3", "Q4", "Q5"], series: [{ label: "A", values: [1, 2, 2, 1, 3] }, { label: "B", values: [3, 1, 1, 2, 1] }, { label: "C", values: [2, 3, 4, 3, 2] }, { label: "D", values: [5, 4, 3, 4, 4] }, { label: "E", values: [4, 5, 5, 5, 5] }] }
    }),

    component({
      id: "openai-compute-frontier", name: "Compute Frontier Curve", chartLabel: "Accuracy vs inference compute", family: "规模、成本与效率", sourceKey: "openai", visualSystem: "VS-07 Reasoning compute field", grammar: "对数横轴 + 前沿曲线 + effort 节点注释", renderer: "frontier", palette: P.openai,
      description: "展示推理算力增加时的收益曲线，并标出 low、medium、high 等 effort 档位。", useWhen: "适合可调 thinking budget 的模型；必须同时说明横轴是 tokens、时间还是美元。", tags: ["compute", "frontier", "reasoning"],
      data: { series: [{ label: "reasoning", points: [[1, 42], [2, 58], [4, 71], [8, 80], [16, 85], [32, 88]] }, { label: "baseline", points: [[1, 39], [2, 45], [4, 50], [8, 54], [16, 56], [32, 57]] }] }
    }),
    component({
      id: "qwen-thinking-budget", name: "Thinking Budget Saturation", chartLabel: "Reward vs thinking tokens", family: "规模、成本与效率", sourceKey: "qwen", visualSystem: "VS-08 Violet budget dial", grammar: "饱和曲线 + 边际收益分段 + 最佳预算窗", renderer: "saturation", palette: P.qwen,
      description: "将 thinking token 增长、边际收益递减和推荐预算窗放到一条连续曲线上。", useWhen: "适合回答“多想多久最划算”，而不是只展示最高分。", tags: ["thinking-budget", "saturation", "marginal-gain"],
      data: { optimum: [8, 16], points: [[0, 38], [2, 55], [4, 67], [8, 78], [12, 83], [16, 86], [24, 87.5], [32, 88]] }
    }),
    component({
      id: "arxiv-dual-axis", name: "Training Dual-axis Trace", chartLabel: "Loss and held-out score", family: "规模、成本与效率", sourceKey: "qwenPaper", visualSystem: "VS-09 Monochrome preprint", grammar: "双纵轴折线 + 训练阶段带 + 最佳 checkpoint", renderer: "dualAxis", palette: P.paper,
      description: "同时呈现训练 loss 下降与 held-out benchmark 上升，并标出阶段切换。", useWhen: "适合技术报告中的训练动态；双轴必须明确单位并避免暗示虚假相关。", tags: ["training", "dual-axis", "checkpoint"],
      data: { stages: [2, 5], points: [{ x: 0, loss: 3.2, score: 31 }, { x: 1, loss: 2.6, score: 43 }, { x: 2, loss: 2.2, score: 52 }, { x: 3, loss: 1.9, score: 61 }, { x: 4, loss: 1.7, score: 69 }, { x: 5, loss: 1.56, score: 74 }, { x: 6, loss: 1.49, score: 76 }, { x: 7, loss: 1.46, score: 77 }] }
    }),
    component({
      id: "llama-scaling-law", name: "Log-log Scaling Law", chartLabel: "Model size vs validation loss", family: "规模、成本与效率", sourceKey: "llama", visualSystem: "VS-10 Field-note scaling", grammar: "log-log 散点 + 拟合线 + 模型规模标注", renderer: "logScaling", palette: P.llama,
      description: "用对数尺度检验模型规模与 loss 的幂律关系，保留偏离拟合线的点。", useWhen: "适合跨数量级的参数量、数据量或 compute；不应用在线性范围很窄的数据。", tags: ["scaling-law", "log-log", "fit"],
      data: { points: [{ label: "1B", x: 1, y: 2.8 }, { label: "3B", x: 3, y: 2.46 }, { label: "8B", x: 8, y: 2.2 }, { label: "27B", x: 27, y: 1.98 }, { label: "70B", x: 70, y: 1.83 }, { label: "405B", x: 405, y: 1.61 }] }
    }),
    component({
      id: "phi-efficiency-bubbles", name: "Parameter Efficiency Bubbles", chartLabel: "Quality vs active parameters", family: "规模、成本与效率", sourceKey: "phi", visualSystem: "VS-11 Azure research cloud", grammar: "气泡散点 + 气泡面积参数 + 效率等高线", renderer: "bubble", palette: P.phi,
      description: "同时编码质量、推理成本和参数规模，突出小模型落在效率前沿的位置。", useWhen: "适合三变量比较；气泡面积必须有图例，不能用半径直接代表数值。", tags: ["bubble", "efficiency", "small-model"],
      data: { points: [{ label: "Phi", x: 3.8, y: 76, r: 8 }, { label: "Qwen", x: 7.1, y: 79, r: 14 }, { label: "Mistral", x: 10.5, y: 81, r: 20 }, { label: "Llama", x: 18, y: 84, r: 30 }, { label: "Frontier", x: 31, y: 87, r: 44 }] }
    }),
    component({
      id: "deepseek-price-pareto", name: "Price–Quality Pareto", chartLabel: "Blended cost vs quality index", family: "规模、成本与效率", sourceKey: "deepseek", visualSystem: "VS-12 Icy Pareto ledger", grammar: "价格-质量散点 + 非支配前沿 + 象限注释", renderer: "pareto", palette: P.deepseek,
      description: "把“更强”和“更便宜”放在同一坐标系，用非支配前沿区分真正有竞争力的模型。", useWhen: "适合成本选型；价格需注明输入输出权重、缓存和批量折扣口径。", tags: ["pareto", "price", "quality"],
      data: { points: [{ label: "DeepSeek", x: 1.1, y: 78, frontier: true }, { label: "Qwen", x: 1.8, y: 80, frontier: true }, { label: "Mistral", x: 3.2, y: 79 }, { label: "Gemini", x: 5.3, y: 86, frontier: true }, { label: "Claude", x: 9.4, y: 88, frontier: true }, { label: "GPT", x: 12.5, y: 87 }] }
    }),

    component({
      id: "opencompass-radar", name: "Capability Radar", chartLabel: "Six normalized capability axes", family: "多维能力概览", sourceKey: "opencompass", visualSystem: "VS-13 Compass primary", grammar: "六轴雷达 + 参考轮廓 + 直接系列标记", renderer: "radar", palette: P.compass,
      description: "用统一归一化口径展示模型能力形状，强调强弱结构而非平均分。", useWhen: "只适合轴数少、量纲已统一的概览；精确比较应回到表格。", tags: ["radar", "capability", "normalized"],
      data: { axes: ["Reason", "Code", "Math", "Agent", "Vision", "Chinese"], series: [{ label: "Model A", values: [88, 79, 92, 70, 82, 91] }, { label: "Model B", values: [84, 88, 81, 79, 76, 72] }] }
    }),
    component({
      id: "gemini-small-multiples", name: "Benchmark Small Multiples", chartLabel: "Four tasks · independent scales", family: "多维能力概览", sourceKey: "gemini", visualSystem: "VS-14 Google primary facets", grammar: "小多图柱 + 每面板独立基线 + 冠军标记", renderer: "smallMultiples", palette: P.google,
      description: "把不同量纲或不同分数区间的 benchmark 分开成对齐面板，避免共用轴压扁差异。", useWhen: "适合 3–6 个 benchmark 的发布对比，面板顺序要稳定。", tags: ["small-multiples", "facets", "multimodal"],
      data: { panels: [{ label: "AIME", values: [92, 88, 81] }, { label: "MMMU", values: [84, 79, 76] }, { label: "SWE", values: [73, 69, 65] }, { label: "MRCR", values: [68, 61, 55] }], series: ["Gemini", "Peer A", "Peer B"] }
    }),
    component({
      id: "helm-parallel-coordinates", name: "Transparent Trade-off Lines", chartLabel: "Quality, bias, toxicity, efficiency", family: "多维能力概览", sourceKey: "helm", visualSystem: "VS-15 Stanford transparency", grammar: "平行坐标 + 方向统一标签 + 单模型聚焦", renderer: "parallel", palette: P.stanford,
      description: "让质量、安全、公平和效率在同一图中显露折衷，不用一个综合分抹平差异。", useWhen: "适合多指标画像和审计；轴方向必须统一为越高越好或明确反转。", tags: ["parallel-coordinates", "trade-off", "responsible-ai"],
      data: { axes: ["Accuracy", "Robustness", "Fairness", "Safety", "Efficiency"], series: [{ label: "A", values: [88, 73, 64, 81, 52] }, { label: "B", values: [82, 78, 76, 69, 71] }, { label: "C", values: [75, 68, 83, 88, 79] }] }
    }),
    component({
      id: "nova-polar-rose", name: "Multimodal Polar Rose", chartLabel: "Modality coverage and depth", family: "多维能力概览", sourceKey: "nova", visualSystem: "VS-16 AWS night rose", grammar: "等角极坐标柱 + 模态分区 + 外圈基准", renderer: "polarRose", palette: P.aws,
      description: "用极坐标柱表示文本、图像、视频、语音等模态的覆盖深度，形状一眼可辨。", useWhen: "适合周期性或模态类目；不适合精确读取相近值。", tags: ["polar", "multimodal", "coverage"],
      data: { items: [{ label: "TEXT", value: 92 }, { label: "IMAGE", value: 81 }, { label: "VIDEO", value: 68 }, { label: "AUDIO", value: 73 }, { label: "DOC", value: 86 }, { label: "CODE", value: 77 }] }
    }),
    component({
      id: "cohere-capability-glyphs", name: "Capability Glyph Matrix", chartLabel: "Enterprise task profile", family: "多维能力概览", sourceKey: "cohere", visualSystem: "VS-17 Enterprise glyph sheet", grammar: "行列字形矩阵 + 四分圆编码 + 缺口显式化", renderer: "glyphGrid", palette: P.cohere,
      description: "每个单元格以四个扇区编码质量、延迟、工具使用与检索，形成紧凑能力指纹。", useWhen: "适合高密度模型 × 任务画像；必须提供图例和可访问数值。", tags: ["glyph", "matrix", "enterprise"],
      data: { rows: ["Command A", "Peer B", "Peer C"], cols: ["RAG", "Tools", "Code", "Agents"], values: [[82, 91, 76, 88], [78, 74, 85, 70], [70, 80, 72, 79]] }
    }),
    component({
      id: "nemotron-score-rings", name: "Concentric Score Rings", chartLabel: "Post-training evaluation suite", family: "多维能力概览", sourceKey: "nvidia", visualSystem: "VS-18 Black-green instrumentation", grammar: "同心进度环 + 起点对齐 + 中心综合分", renderer: "rings", palette: P.nvidia,
      description: "把少量核心指标压缩为仪表式同心环，中心保留平均分而非营销口号。", useWhen: "适合 3–5 个比例指标的单模型快照；不适合模型间精确横比。", tags: ["radial", "scorecard", "post-training"],
      data: { items: [{ label: "Reasoning", value: 91 }, { label: "Coding", value: 84 }, { label: "Instruction", value: 88 }, { label: "Safety", value: 79 }] }
    }),

    component({
      id: "claude-error-forest", name: "Confidence Interval Forest", chartLabel: "Mean score with 95% CI", family: "分布与不确定性", sourceKey: "anthropic", visualSystem: "VS-19 Clay statistical editorial", grammar: "森林图 + 置信区间 + 零差值参考线", renderer: "forest", palette: P.claude,
      description: "显示均值和置信区间，避免把 0.3 分噪声包装成确定性领先。", useWhen: "适合重复采样、bootstrap 或多 seed 结果；必须说明区间方法。", tags: ["error-bar", "confidence", "forest"],
      data: { baseline: 70, items: [{ label: "Claude", value: 82, low: 79, high: 85 }, { label: "GPT", value: 79, low: 76, high: 82 }, { label: "Gemini", value: 77, low: 72, high: 81 }, { label: "Qwen", value: 74, low: 71, high: 77 }, { label: "DeepSeek", value: 73, low: 68, high: 78 }] }
    }),
    component({
      id: "arxiv-violin-distribution", name: "Seed Distribution Violins", chartLabel: "Score distribution across 32 seeds", family: "分布与不确定性", sourceKey: "qwenPaper", visualSystem: "VS-20 Violet lab notebook", grammar: "小提琴密度 + 中位数 + 原始 seed 点", renderer: "violin", palette: P.research,
      description: "同时展示多次运行的密度形状、中位数和离群 seed，揭示平均值背后的稳定性。", useWhen: "适合 RL、Agent 或 prompt 敏感评测；样本太少时改用点图。", tags: ["violin", "distribution", "seeds"],
      data: { groups: [{ label: "Base", values: [52, 57, 58, 61, 62, 63, 65, 69] }, { label: "+SFT", values: [61, 64, 66, 67, 68, 71, 72, 75] }, { label: "+RL", values: [66, 70, 73, 74, 76, 79, 82, 84] }, { label: "+Tools", values: [70, 74, 75, 80, 82, 84, 87, 89] }] }
    }),
    component({
      id: "cognition-boxplot", name: "Repository Box Plots", chartLabel: "Patch quality by repository", family: "分布与不确定性", sourceKey: "cognition", visualSystem: "VS-21 Pixel research scatter", grammar: "箱线图 + 抖动点 + 样本量脚注", renderer: "boxplot", palette: P.cognition,
      description: "比较不同代码仓库的分布、四分位和离群点，不让高方差被整体均值隐藏。", useWhen: "适合 repo、语言或任务族分层；每组要有足够样本。", tags: ["boxplot", "repository", "variance"],
      data: { groups: [{ label: "Django", min: 41, q1: 56, median: 65, q3: 73, max: 86, outliers: [34, 90] }, { label: "Flask", min: 47, q1: 61, median: 70, q3: 78, max: 88, outliers: [40] }, { label: "Pandas", min: 35, q1: 49, median: 58, q3: 68, max: 82, outliers: [29, 89] }, { label: "Sympy", min: 43, q1: 54, median: 63, q3: 72, max: 84, outliers: [38] }] }
    }),
    component({
      id: "grok-latency-ridges", name: "Latency Ridgeline", chartLabel: "Time-to-first-token distribution", family: "分布与不确定性", sourceKey: "xai", visualSystem: "VS-22 Black signal ridges", grammar: "重叠山脊密度 + p50/p95 刻度 + 长尾标注", renderer: "ridge", palette: P.dark,
      description: "用山脊密度比较不同负载下的延迟形状，明确长尾而非只报平均响应时间。", useWhen: "适合 serving 或 agent step latency；不是吞吐量图。", tags: ["ridgeline", "latency", "tail"],
      data: { series: [{ label: "LOW", values: [0.1, 0.3, 0.8, 1, 0.6, 0.2] }, { label: "MED", values: [0.05, 0.2, 0.55, 0.9, 0.75, 0.35] }, { label: "HIGH", values: [0.02, 0.1, 0.35, 0.66, 0.9, 0.62] }, { label: "BURST", values: [0.01, 0.05, 0.18, 0.44, 0.72, 1] }] }
    }),
    component({
      id: "openai-passk-ecdf", name: "Pass@k ECDF", chartLabel: "Tasks solved by sample budget", family: "分布与不确定性", sourceKey: "openai", visualSystem: "VS-23 Magenta probability steps", grammar: "经验累计分布阶梯 + k 预算线 + 面积差", renderer: "ecdf", palette: P.openai,
      description: "显示随着样本预算 k 增加，累计有多少任务至少被解出一次。", useWhen: "适合代码生成和采样式推理；不能把 pass@k 当作单次成功率。", tags: ["ecdf", "pass-at-k", "sampling"],
      data: { series: [{ label: "Reasoning", points: [[1, 42], [2, 57], [4, 69], [8, 78], [16, 84], [32, 88]] }, { label: "Base", points: [[1, 34], [2, 45], [4, 55], [8, 62], [16, 67], [32, 70]] }] }
    }),
    component({
      id: "openai-reliability", name: "Reliability Calibration", chartLabel: "Confidence vs observed accuracy", family: "分布与不确定性", sourceKey: "openai", visualSystem: "VS-24 Reliability pink grid", grammar: "校准柱 + 对角完美线 + ECE 缺口", renderer: "reliability", palette: P.openai,
      description: "比较模型自信度与真实正确率，直接呈现过度自信或保守区间。", useWhen: "适合选择性回答、路由和风险控制；分箱方案必须稳定。", tags: ["calibration", "reliability", "confidence"],
      data: { bins: [{ confidence: 10, accuracy: 14 }, { confidence: 30, accuracy: 27 }, { confidence: 50, accuracy: 43 }, { confidence: 70, accuracy: 62 }, { confidence: 90, accuracy: 78 }] }
    }),

    component({
      id: "helm-capability-heatmap", name: "Scenario Heatmap", chartLabel: "Models × evaluation scenarios", family: "诊断与矩阵", sourceKey: "helm", visualSystem: "VS-25 Audit heat grid", grammar: "连续热力矩阵 + 行列聚类顺序 + 最差格标记", renderer: "heatmap", palette: P.stanford,
      description: "在高密度矩阵中扫描模型的强项、弱项和异常场景，支持统一归一化。", useWhen: "适合 5 个以上模型或场景；少量比较用分组柱更易读。", tags: ["heatmap", "scenario", "audit"],
      data: { rows: ["Model A", "Model B", "Model C", "Model D", "Model E"], cols: ["QA", "Math", "Code", "Bias", "Robust", "Toxic"], values: [[88, 82, 79, 64, 74, 81], [84, 76, 85, 71, 78, 74], [79, 89, 72, 77, 69, 83], [75, 68, 78, 84, 81, 87], [71, 73, 69, 82, 77, 79]] }
    }),
    component({
      id: "llamaguard-confusion", name: "Safety Confusion Matrix", chartLabel: "Llama Guard decision audit", family: "诊断与矩阵", sourceKey: "llama", visualSystem: "VS-26 Safety field matrix", grammar: "2×2 混淆矩阵 + 边际总量 + 错误成本标注", renderer: "confusion", palette: P.llama,
      description: "把安全分类的 TP、TN、FP、FN 与业务成本放在同一矩阵，而不是只给 accuracy。", useWhen: "适合 guardrail 和拒答分类；必须明确哪个错误更昂贵。", tags: ["confusion-matrix", "safety", "guardrail"],
      data: { labels: ["Unsafe", "Safe"], values: [[184, 16], [27, 773]], costs: ["miss", "over-refusal"] }
    }),
    component({
      id: "gemini-context-decay", name: "Long-context Decay Strips", chartLabel: "Retrieval accuracy by context length", family: "诊断与矩阵", sourceKey: "gemini", visualSystem: "VS-27 Google context spectrum", grammar: "多模型水平色带 + 上下文断点 + 退化阈值", renderer: "contextDecay", palette: P.google,
      description: "将 8k 到 1m context 上的 retrieval 准确率编码成连续色带，突出何处开始退化。", useWhen: "适合 needle、MRCR 或长文档评测；横轴应按 token 比例或对数标注。", tags: ["long-context", "decay", "strip"],
      data: { columns: ["8k", "32k", "128k", "512k", "1m"], rows: [{ label: "Gemini", values: [98, 97, 94, 89, 82] }, { label: "Claude", values: [98, 95, 91, 80, 68] }, { label: "Qwen", values: [96, 92, 85, 71, 55] }, { label: "Llama", values: [94, 88, 73, 54, 38] }] }
    }),
    component({
      id: "qwen-ablation-waterfall", name: "Ablation Waterfall", chartLabel: "Contribution to final reward", family: "诊断与矩阵", sourceKey: "qwenPaper", visualSystem: "VS-28 Purple ablation ledger", grammar: "正负增量瀑布 + 累计基线 + 最终值", renderer: "waterfall", palette: P.qwen,
      description: "按训练或系统模块逐项展示对最终分数的正负贡献，保留累计基线。", useWhen: "适合消融和 feature contribution；只有在增量可加时使用。", tags: ["waterfall", "ablation", "contribution"],
      data: { start: 54, steps: [{ label: "+SFT mix", delta: 9 }, { label: "+RL", delta: 13 }, { label: "+Tools", delta: 7 }, { label: "Noisy data", delta: -4 }, { label: "+Verifier", delta: 6 }] }
    }),
    component({
      id: "arena-winrate-matrix", name: "Pairwise Win-rate Matrix", chartLabel: "Head-to-head preference", family: "诊断与矩阵", sourceKey: "arena", visualSystem: "VS-29 Diverging arena board", grammar: "反对称胜率矩阵 + 50% 中性线 + 对角禁用", renderer: "winMatrix", palette: P.arena,
      description: "用成对胜率矩阵揭示循环优势和风格偏好，避免 Elo 单排名掩盖 matchup。", useWhen: "适合 4–8 个模型的 head-to-head；样本不足的格子要明确缺失。", tags: ["pairwise", "win-rate", "matrix"],
      data: { models: ["A", "B", "C", "D", "E"], values: [[50, 57, 61, 48, 66], [43, 50, 55, 52, 59], [39, 45, 50, 63, 54], [52, 48, 37, 50, 58], [34, 41, 46, 42, 50]] }
    }),
    component({
      id: "swebench-behavior-quadrant", name: "Behavior Quadrant", chartLabel: "Patch precision vs exploration", family: "诊断与矩阵", sourceKey: "cognition", visualSystem: "VS-30 Research behavior field", grammar: "四象限散点 + 密度阴影 + 策略标签", renderer: "quadrant", palette: P.cognition,
      description: "将 patch precision 与 repository exploration 交叉，定位“乱改”“过早收敛”等 Agent 行为。", useWhen: "适合行为诊断和 policy comparison；象限阈值必须有依据。", tags: ["quadrant", "behavior", "agent"],
      data: { xThreshold: 55, yThreshold: 60, points: [{ label: "A", x: 74, y: 81 }, { label: "B", x: 62, y: 54 }, { label: "C", x: 46, y: 72 }, { label: "D", x: 38, y: 44 }, { label: "E", x: 83, y: 66 }, { label: "F", x: 57, y: 76 }] }
    }),

    component({
      id: "vending-agent-timeseries", name: "Long-horizon Agent Ledger", chartLabel: "Net worth over simulated days", family: "Agent 与过程评测", sourceKey: "vending", visualSystem: "VS-31 Mercantile time series", grammar: "多线时间序列 + 失败事件旗标 + 零收益线", renderer: "timeSeries", palette: P.claude,
      description: "跟踪长时程 Agent 的净值、波动和失败事件，区分最后结果与过程风险。", useWhen: "适合 Vending-Bench 等持续环境；不能只截取最终盈利点。", tags: ["time-series", "long-horizon", "risk"],
      data: { periods: ["D0", "D5", "D10", "D15", "D20", "D25", "D30"], series: [{ label: "Agent A", values: [100, 108, 119, 114, 132, 145, 151] }, { label: "Agent B", values: [100, 104, 110, 88, 91, 95, 102] }, { label: "Agent C", values: [100, 97, 103, 109, 116, 121, 128] }], events: [{ index: 3, label: "stockout" }] }
    }),
    component({
      id: "qwen-token-area", name: "Token Allocation Stack", chartLabel: "Thinking budget by step", family: "Agent 与过程评测", sourceKey: "qwen", visualSystem: "VS-32 Layered reasoning stream", grammar: "100% 堆叠面积 + step 边界 + token 类别层", renderer: "stackedArea", palette: P.qwen,
      description: "展示规划、工具调用、验证和回答在多步推理中的 token 占比如何变化。", useWhen: "适合 part-to-whole 随过程变化；绝对 token 总量需另行标注。", tags: ["stacked-area", "token-allocation", "reasoning"],
      data: { labels: ["1", "2", "3", "4", "5", "6", "7"], layers: [{ label: "Plan", values: [42, 31, 24, 18, 15, 12, 8] }, { label: "Tool", values: [8, 24, 38, 42, 47, 41, 25] }, { label: "Verify", values: [12, 14, 18, 23, 25, 32, 37] }, { label: "Answer", values: [38, 31, 20, 17, 13, 15, 30] }] }
    }),
    component({
      id: "terminal-bench-trajectory", name: "Terminal Task Swimlane", chartLabel: "One successful agent trajectory", family: "Agent 与过程评测", sourceKey: "terminalBench", visualSystem: "VS-33 Terminal trace", grammar: "事件泳道 + 时间轴 + 并发段 + 重试标记", renderer: "swimlane", palette: P.terminal,
      description: "把思考、shell、测试和修复沿统一时间轴展开，显示并发、等待与重试成本。", useWhen: "适合单次轨迹剖析和 Agent latency；不用于模型总体排名。", tags: ["swimlane", "trajectory", "terminal"],
      data: { lanes: [{ label: "PLAN", segments: [[0, 12], [66, 74]] }, { label: "SHELL", segments: [[10, 31], [44, 63], [78, 91]] }, { label: "TEST", segments: [[29, 45], [61, 79], [90, 100]] }, { label: "PATCH", segments: [[37, 57], [72, 88]] }], retries: [44, 78] }
    }),
    component({
      id: "toolbench-outcome-sankey", name: "Tool-call Outcome Flow", chartLabel: "Intent → tool → outcome", family: "Agent 与过程评测", sourceKey: "toolbench", visualSystem: "VS-34 Tool routing map", grammar: "三阶段 Sankey + 失败支流 + 流量直标", renderer: "sankey", palette: P.compass,
      description: "追踪 Agent 意图如何路由到工具以及最终成功、重试或失败，揭示损耗发生在哪一层。", useWhen: "适合工具路由和多阶段转化；流量必须守恒。", tags: ["sankey", "tool-use", "outcome"],
      data: { left: [{ label: "Search", value: 42 }, { label: "Compute", value: 35 }, { label: "Action", value: 23 }], middle: [{ label: "Web", value: 37 }, { label: "Code", value: 39 }, { label: "API", value: 24 }], right: [{ label: "Success", value: 71 }, { label: "Retry", value: 18 }, { label: "Fail", value: 11 }] }
    }),
    component({
      id: "agentbench-survival", name: "Task Survival Curve", chartLabel: "Fraction unfinished over time", family: "Agent 与过程评测", sourceKey: "agentbench", visualSystem: "VS-35 Survival analysis paper", grammar: "Kaplan–Meier 阶梯 + censor 标记 + 中位完成时", renderer: "survival", palette: P.paper,
      description: "显示任务随时间被完成的比例，并保留超时 censor，而不是只统计最终完成率。", useWhen: "适合带超时的 Agent 评测；需明确 survival 是未完成还是仍成功运行。", tags: ["survival", "time-to-complete", "censor"],
      data: { series: [{ label: "Agent A", points: [[0, 100], [10, 91], [20, 74], [30, 53], [45, 31], [60, 18]] }, { label: "Agent B", points: [[0, 100], [10, 95], [20, 84], [30, 72], [45, 55], [60, 43]] }] }
    }),
    component({
      id: "livecode-solve-curve", name: "Cumulative Solve Curve", chartLabel: "Problems solved by elapsed minute", family: "Agent 与过程评测", sourceKey: "livecodebench", visualSystem: "VS-36 Live contest ribbon", grammar: "累计阶梯 + 解题事件点 + 领先区间色带", renderer: "cumulative", palette: P.vivid,
      description: "按比赛时间累计解题数，显示模型是快速拿到简单题还是后程解决难题。", useWhen: "适合时间预算固定的 coding benchmark；题目难度顺序要随机或已知。", tags: ["cumulative", "coding", "time-budget"],
      data: { series: [{ label: "Model A", points: [[0, 0], [8, 1], [18, 2], [33, 3], [47, 4], [55, 5]] }, { label: "Model B", points: [[0, 0], [12, 1], [25, 2], [39, 3], [58, 4]] }] }
    }),

    component({
      id: "qwen-cylinder-bars", name: "Cylindrical Benchmark Columns", chartLabel: "Model family · normalized score", family: "特殊编码与覆盖", sourceKey: "qwen", visualSystem: "VS-37 Purple cylinder stage", grammar: "圆柱柱图 + 顶面椭圆 + 基座刻度", renderer: "cylinder", palette: P.qwen,
      description: "用圆柱体替代平面柱，保留统一基线和顶面读数，满足发布视觉中的立体表达。", useWhen: "只用于少量类别的宣传图；精确分析应切回平面柱图。", tags: ["cylinder", "3d-bar", "promo"],
      data: { items: [{ label: "0.6B", value: 41 }, { label: "4B", value: 63 }, { label: "30B", value: 79 }, { label: "235B", value: 91 }] }
    }),
    component({
      id: "halueval-waffle", name: "Failure-mode Waffle", chartLabel: "100 audited hallucinations", family: "特殊编码与覆盖", sourceKey: "halueval", visualSystem: "VS-38 Categorical audit tiles", grammar: "10×10 waffle + 连续类别块 + 样本总量固定", renderer: "waffle", palette: P.cohere,
      description: "将 100 个审计样本按事实、推理、引用和拒答失败类型拆分，直观呈现构成。", useWhen: "适合固定总量的 part-to-whole；类别超过 5 个时可读性下降。", tags: ["waffle", "hallucination", "part-to-whole"],
      data: { parts: [{ label: "Factual", value: 37 }, { label: "Reasoning", value: 28 }, { label: "Citation", value: 19 }, { label: "Refusal", value: 11 }, { label: "Other", value: 5 }] }
    }),
    component({
      id: "mmlu-domain-treemap", name: "Benchmark Domain Treemap", chartLabel: "MMLU task coverage", family: "特殊编码与覆盖", sourceKey: "mmlu", visualSystem: "VS-39 Academic domain blocks", grammar: "层级 treemap + 面积样本量 + 色彩学科族", renderer: "treemap", palette: P.llama,
      description: "用面积编码题目数量，用颜色区分 STEM、humanities、social science 等上层学科。", useWhen: "适合说明 benchmark 构成和不平衡；不是得分图。", tags: ["treemap", "coverage", "taxonomy"],
      data: { items: [{ label: "STEM", value: 38 }, { label: "Humanities", value: 24 }, { label: "Social", value: 19 }, { label: "Medicine", value: 11 }, { label: "Business", value: 8 }] }
    }),
    component({
      id: "mmmu-beeswarm", name: "Multimodal Task Beeswarm", chartLabel: "Per-question score distribution", family: "特殊编码与覆盖", sourceKey: "mmmu", visualSystem: "VS-40 Multimodal specimen plot", grammar: "分类 beeswarm + 中位短线 + 图形题型标记", renderer: "beeswarm", palette: P.google,
      description: "展示不同多模态题型的逐题分数分布和中位数，保留离群难题。", useWhen: "适合样本级分布与类别比较；点多时需采样或透明度控制。", tags: ["beeswarm", "multimodal", "per-item"],
      data: { groups: [{ label: "Charts", values: [38, 42, 47, 51, 58, 61, 63, 71, 74, 82] }, { label: "Diagrams", values: [35, 44, 49, 55, 57, 66, 68, 72, 78, 85] }, { label: "Photos", values: [48, 54, 59, 62, 67, 70, 76, 80, 83, 89] }, { label: "Documents", values: [41, 46, 52, 60, 64, 69, 73, 75, 81, 87] }] }
    })
  ];

  window.BENCHMARK_SOURCES = sources;
  window.BENCHMARK_COMPONENTS = components;
})();
