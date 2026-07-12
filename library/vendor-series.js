(function () {
  'use strict';

  const components = window.BENCHMARK_COMPONENTS;
  const renderers = window.BENCHMARK_RENDERERS;
  window.BENCHMARK_SOURCES.tml = {
    name: 'Thinking Machines Lab',
    type: '研究博客',
    url: 'https://thinkingmachines.ai/blog/interaction-models/',
    note: '智能-交互前沿与研究方向二维叙事'
  };
  const byId = id => components.find(entry => entry.id === id);
  const clone = value => JSON.parse(JSON.stringify(value));

  const esc = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');
  const map = (value, d0, d1, r0, r1) => r0 + (r1 - r0) * ((value - d0) / (d1 - d0));
  const linePath = points => points.map((point, index) => `${index ? 'L' : 'M'} ${point[0]} ${point[1]}`).join(' ');

  function addComponent(baseId, overrides) {
    const base = byId(baseId);
    if (!base) throw new Error(`Missing base component: ${baseId}`);
    const entry = Object.assign({}, base, clone(overrides));
    components.push(entry);
    return entry;
  }

  function svgFrame(entry, content) {
    const p = entry.palette;
    const safeId = entry.id.replace(/[^a-z0-9]/gi, '');
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400' role='img' aria-labelledby='${safeId}-title ${safeId}-desc' style='background:${p.bg};color:${p.ink}'>
      <title id='${safeId}-title'>${esc(entry.chartLabel)}</title>
      <desc id='${safeId}-desc'>${esc(entry.description)} ${esc(entry.dataNote)}</desc>
      <defs><style>
        .t{font:700 15px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}
        .s{font:10px ui-monospace,"SFMono-Regular",Consolas,monospace;fill:${p.muted}}
        .l{font:10px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.muted}}
        .v{font:700 11px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}
        .g{stroke:${p.grid};stroke-width:1;shape-rendering:crispEdges}
      </style></defs>
      <text class='t' x='28' y='30'>${esc(entry.chartLabel)}</text>
      <text class='s' x='28' y='48'>${esc(entry.source)}</text>
      <text class='s' x='612' y='30' text-anchor='end'>DEMO DATA</text>
      ${content}
    </svg>`;
  }

  function benchmarkTriptych(entry) {
    const p = entry.palette;
    const data = entry.data;
    let body = '';
    data.panels.forEach((panel, panelIndex) => {
      const x0 = 28 + panelIndex * 202;
      const y0 = 84;
      const width = 182;
      const bottom = 320;
      body += `<rect x='${x0}' y='${y0}' width='${width}' height='252' fill='${p.bg}' stroke='${p.grid}'/><text class='v' x='${x0 + 12}' y='${y0 + 19}'>${esc(panel.label)}</text><text class='s' x='${x0 + 12}' y='${y0 + 35}'>${esc(panel.sub)}</text>`;
      panel.values.forEach((value, index) => {
        const h = map(value, panel.min, panel.max, 20, 170);
        const barX = x0 + 19 + index * 39;
        const color = index === 0 ? p.c1 : [p.c2, p.c3, p.c5][index - 1];
        body += `<rect x='${barX}' y='${bottom - h}' width='27' height='${h}' fill='${color}' fill-opacity='${index ? .45 : .9}'/><text class='v' x='${barX + 13.5}' y='${bottom - h - 6}' text-anchor='middle'>${value}</text>`;
      });
      body += `<text class='s' x='${x0 + width / 2}' y='${bottom + 21}' text-anchor='middle'>${esc(panel.note)}</text>`;
    });
    return svgFrame(entry, body);
  }

  function thinkingOutlineBars(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 72;
    const bottom = 326;
    const groupW = 112;
    let body = '';
    [0, 25, 50, 75, 100].forEach(tick => {
      const y = map(tick, 0, 100, bottom, 88);
      body += `<line class='g' x1='58' y1='${y}' x2='606' y2='${y}'/><text class='l' x='48' y='${y + 3}' text-anchor='end'>${tick}</text>`;
    });
    data.groups.forEach((group, groupIndex) => {
      const gx = x0 + groupIndex * groupW;
      group.values.forEach((item, index) => {
        const barX = gx + index * 38;
        const y = map(item.value, 0, 100, bottom, 88);
        const filled = item.mode === 'thinking';
        body += `<rect x='${barX}' y='${y}' width='28' height='${bottom - y}' fill='${filled ? p.c1 : p.bg}' fill-opacity='${filled ? .78 : 1}' stroke='${p.c1}' stroke-width='2'/><text class='v' x='${barX + 14}' y='${y - 7}' text-anchor='middle'>${item.value}</text>`;
      });
      body += `<text class='l' x='${gx + 33}' y='350' text-anchor='middle'>${esc(group.label)}</text>`;
    });
    body += `<circle cx='208' cy='375' r='5' fill='${p.c1}'/><text class='l' x='220' y='379'>with thinking</text><circle cx='342' cy='375' r='5' fill='${p.bg}' stroke='${p.c1}' stroke-width='2'/><text class='l' x='354' y='379'>without thinking</text>`;
    return svgFrame(entry, body);
  }

  function groupedErrorBars(entry) {
    const p = entry.palette;
    const data = entry.data;
    const bottom = 326;
    const top = 88;
    const groupW = 68;
    let body = '';
    [40, 60, 80, 100].forEach(tick => {
      const y = map(tick, 40, 100, bottom, top);
      body += `<line class='g' x1='52' y1='${y}' x2='610' y2='${y}'/><text class='l' x='44' y='${y + 3}' text-anchor='end'>${tick}</text>`;
    });
    data.groups.forEach((group, groupIndex) => {
      const gx = 74 + groupIndex * groupW;
      group.values.forEach((item, seriesIndex) => {
        const x = gx + seriesIndex * 18;
        const y = map(item.value, 40, 100, bottom, top);
        const errTop = map(item.value + item.error, 40, 100, bottom, top);
        const errBottom = map(item.value - item.error, 40, 100, bottom, top);
        const color = [p.c1, p.c2, p.c3][seriesIndex];
        body += `<rect x='${x}' y='${y}' width='14' height='${bottom - y}' fill='${color}' fill-opacity='.84'/><line x1='${x + 7}' y1='${errTop}' x2='${x + 7}' y2='${errBottom}' stroke='${p.ink}' stroke-width='1.5'/><line x1='${x + 3}' y1='${errTop}' x2='${x + 11}' y2='${errTop}' stroke='${p.ink}'/><line x1='${x + 3}' y1='${errBottom}' x2='${x + 11}' y2='${errBottom}' stroke='${p.ink}'/>`;
      });
      body += `<text class='s' x='${gx + 23}' y='349' text-anchor='middle'>${esc(group.label)}</text>`;
    });
    data.series.forEach((label, index) => body += `<rect x='${180 + index * 112}' y='373' width='13' height='9' fill='${[p.c1, p.c2, p.c3][index]}'/><text class='l' x='${199 + index * 112}' y='381'>${esc(label)}</text>`);
    return svgFrame(entry, body);
  }

  function brokenAxisBars(entry) {
    const p = entry.palette;
    const data = entry.data;
    const y = value => map(value, data.min, data.max, 325, 96);
    let body = `<path d='M 43 287 l 8 -8 l 8 8 l 8 -8' fill='none' stroke='${p.ink}' stroke-width='2'/><text class='s' x='51' y='309' text-anchor='middle'>axis break</text>`;
    data.items.forEach((item, index) => {
      const x = 92 + index * 104;
      const top = y(item.value);
      const color = index === 0 ? p.c1 : [p.c2, p.c3, p.c5, p.c4][index - 1];
      body += `<rect x='${x}' y='${top}' width='62' height='${325 - top}' fill='${color}' fill-opacity='${index ? .62 : .9}'/><text class='v' x='${x + 31}' y='${top - 9}' text-anchor='middle'>${item.value.toFixed(1)}</text><text class='v' x='${x + 31}' y='349' text-anchor='middle'>${esc(item.label)}</text>`;
    });
    [data.min, (data.min + data.max) / 2, data.max].forEach(tick => {
      const yy = y(tick);
      body += `<line class='g' x1='62' y1='${yy}' x2='604' y2='${yy}'/><text class='l' x='52' y='${yy + 3}' text-anchor='end'>${tick}</text>`;
    });
    return svgFrame(entry, body);
  }

  function pairedProtocolBars(entry) {
    const p = entry.palette;
    const data = entry.data;
    const bottom = 326;
    const y = value => map(value, 0, 100, bottom, 88);
    let body = '';
    [0, 25, 50, 75, 100].forEach(tick => {
      body += `<line class='g' x1='54' y1='${y(tick)}' x2='608' y2='${y(tick)}'/><text class='l' x='44' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`;
    });
    data.items.forEach((item, index) => {
      const gx = 92 + index * 122;
      const values = [item.base, item.protocol];
      values.forEach((value, valueIndex) => {
        const x = gx + valueIndex * 38;
        const top = y(value);
        body += `<rect x='${x}' y='${top}' width='31' height='${bottom - top}' fill='${valueIndex ? p.c1 : p.bg}' fill-opacity='${valueIndex ? .82 : 1}' stroke='${valueIndex ? p.c1 : p.c2}' stroke-width='2'/><text class='v' x='${x + 15.5}' y='${top - 7}' text-anchor='middle'>${value}</text>`;
      });
      body += `<line x1='${gx + 15}' y1='${y(item.base) - 18}' x2='${gx + 53}' y2='${y(item.protocol) - 18}' stroke='${p.c3}' stroke-width='2' marker-end='url(#none)'/><text class='s' x='${gx + 34}' y='${Math.min(y(item.base), y(item.protocol)) - 23}' text-anchor='middle'>+${item.protocol - item.base}</text><text class='v' x='${gx + 34}' y='350' text-anchor='middle'>${esc(item.label)}</text>`;
    });
    body += `<rect x='210' y='373' width='13' height='9' fill='${p.bg}' stroke='${p.c2}'/><text class='l' x='230' y='381'>base</text><rect x='330' y='373' width='13' height='9' fill='${p.c1}'/><text class='l' x='350' y='381'>agent protocol</text>`;
    return svgFrame(entry, body);
  }

  function frontierScatter(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 20, 100, 74, 590);
    const y = value => map(value, 20, 100, 336, 88);
    let body = '';
    [20, 40, 60, 80, 100].forEach(tick => {
      body += `<line class='g' x1='${x(tick)}' y1='88' x2='${x(tick)}' y2='336'/><line class='g' x1='74' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='${x(tick)}' y='359' text-anchor='middle'>${tick}</text><text class='l' x='63' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`;
    });
    const frontier = data.points.filter(point => point.frontier).sort((a, b) => a.x - b.x).map(point => [x(point.x), y(point.y)]);
    body += `<path d='${linePath(frontier)}' fill='none' stroke='${p.c1}' stroke-width='3' stroke-dasharray='7 4'/>`;
    data.points.forEach((point, index) => {
      const color = point.frontier ? p.c1 : [p.c2, p.c3, p.c4, p.c5][index % 4];
      body += `<circle cx='${x(point.x)}' cy='${y(point.y)}' r='${point.frontier ? 9 : 6}' fill='${p.bg}' stroke='${color}' stroke-width='3'/><text class='v' x='${x(point.x) + 9}' y='${y(point.y) - 10}'>${esc(point.label)}</text>`;
    });
    body += `<text class='s' x='330' y='386' text-anchor='middle'>interaction efficiency →</text><text class='s' x='18' y='220' text-anchor='middle' transform='rotate(-90 18 220)'>task intelligence →</text>`;
    return svgFrame(entry, body);
  }

  function languageDotPlot(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 40, 95, 194, 590);
    let body = '';
    [40, 60, 80, 95].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='84' x2='${x(tick)}' y2='345'/><text class='l' x='${x(tick)}' y='367' text-anchor='middle'>${tick}</text>`);
    data.items.forEach((item, index) => {
      const y = 104 + index * 43;
      body += `<text class='v' x='176' y='${y + 4}' text-anchor='end'>${esc(item.label)}</text><line x1='${x(item.values[2])}' y1='${y}' x2='${x(item.values[0])}' y2='${y}' stroke='${p.grid}' stroke-width='4'/>`;
      item.values.forEach((value, seriesIndex) => body += `<circle cx='${x(value)}' cy='${y}' r='${seriesIndex === 0 ? 7 : 5}' fill='${[p.c1, p.c2, p.c3][seriesIndex]}'/><text class='s' x='${x(value)}' y='${y - 10}' text-anchor='middle'>${value}</text>`);
    });
    data.series.forEach((label, index) => body += `<circle cx='${222 + index * 126}' cy='380' r='5' fill='${[p.c1, p.c2, p.c3][index]}'/><text class='l' x='${234 + index * 126}' y='384'>${esc(label)}</text>`);
    return svgFrame(entry, body);
  }

  function costQualityQuadrants(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 20, 74, 590);
    const y = value => map(value, 60, 95, 336, 88);
    const splitX = x(data.splitX);
    const splitY = y(data.splitY);
    let body = `<rect x='74' y='88' width='${splitX - 74}' height='${splitY - 88}' fill='${p.c2}' fill-opacity='.1'/><rect x='${splitX}' y='${splitY}' width='${590 - splitX}' height='${336 - splitY}' fill='${p.c4}' fill-opacity='.08'/><line x1='${splitX}' y1='88' x2='${splitX}' y2='336' stroke='${p.muted}' stroke-dasharray='5 4'/><line x1='74' y1='${splitY}' x2='590' y2='${splitY}' stroke='${p.muted}' stroke-dasharray='5 4'/><text class='s' x='88' y='104'>HIGH QUALITY · LOW COST</text>`;
    data.points.forEach((point, index) => {
      const color = index === 0 ? p.c1 : [p.c2, p.c3, p.c4, p.c5][index % 4];
      body += `<circle cx='${x(point.x)}' cy='${y(point.y)}' r='${index === 0 ? 10 : 7}' fill='${color}' fill-opacity='.8'/><text class='v' x='${x(point.x) + 10}' y='${y(point.y) - 10}'>${esc(point.label)}</text>`;
    });
    [0, 5, 10, 15, 20].forEach(tick => body += `<text class='l' x='${x(tick)}' y='359' text-anchor='middle'>$${tick}</text>`);
    [60, 70, 80, 90].forEach(tick => body += `<text class='l' x='62' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    return svgFrame(entry, body);
  }

  renderers.benchmarkTriptych = benchmarkTriptych;
  renderers.thinkingOutlineBars = thinkingOutlineBars;
  renderers.groupedErrorBars = groupedErrorBars;
  renderers.brokenAxisBars = brokenAxisBars;
  renderers.pairedProtocolBars = pairedProtocolBars;
  renderers.frontierScatter = frontierScatter;
  renderers.languageDotPlot = languageDotPlot;
  renderers.costQualityQuadrants = costQualityQuadrants;

  addComponent('gemini-small-multiples', {
    id: 'gemini-deepthink-triptych',
    name: 'Gemini Deep Think Triptych',
    chartLabel: 'Deep Think · three benchmark panels',
    family: '厂商发布复现系列',
    visualSystem: 'VS-41 Google Deep Think triptych',
    grammar: '三联独立柱面板 + 自家蓝强调 + benchmark 条件脚注',
    renderer: 'benchmarkTriptych',
    description: '复现 Gemini 发布页常见的三联 benchmark 结构，用一致模型顺序并排呈现推理、科学与视觉任务。',
    useWhen: '适合一次发布要讲三个核心 benchmark，且每项分数区间不同的场景。',
    tags: ['gemini', 'triptych', 'release'],
    data: { panels: [
      { label: 'Humanity’s Last Exam', sub: 'reasoning', min: 10, max: 55, values: [48, 37, 31, 22], note: 'tools off' },
      { label: 'GPQA Diamond', sub: 'science', min: 60, max: 95, values: [93, 88, 84, 81], note: 'pass@1' },
      { label: 'ARC-AGI-2', sub: 'abstraction', min: 0, max: 55, values: [46, 29, 18, 13], note: 'verified' }
    ] }
  });

  addComponent('openai-lollipop-rank', {
    id: 'openai-thinking-outline-bars',
    name: 'Thinking vs Direct Bars',
    chartLabel: 'With thinking vs without thinking',
    family: '厂商发布复现系列',
    visualSystem: 'VS-42 OpenAI outline comparison',
    grammar: '填充/空心配对柱 + thinking 模式图例 + 单 benchmark 排序',
    renderer: 'thinkingOutlineBars',
    description: '复现 OpenAI 常用的“思考 / 不思考”填充与空心配对柱，直接展示推理模式带来的增益。',
    useWhen: '适合同一模型两种推理协议；不适合把不同模型和不同协议混成同一因果结论。',
    tags: ['openai', 'thinking', 'paired-bars'],
    data: { groups: [
      { label: 'o-series', values: [{ mode: 'thinking', value: 91 }, { mode: 'direct', value: 74 }] },
      { label: 'GPT-series', values: [{ mode: 'thinking', value: 87 }, { mode: 'direct', value: 69 }] },
      { label: 'Gemini', values: [{ mode: 'thinking', value: 84 }, { mode: 'direct', value: 72 }] },
      { label: 'Claude', values: [{ mode: 'thinking', value: 82 }, { mode: 'direct', value: 70 }] }
    ] }
  });

  addComponent('claude-error-forest', {
    id: 'claude-multilingual-errorbars',
    name: 'Multilingual Coding Error Bars',
    chartLabel: 'SWE-bench Multilingual · language detail',
    family: '厂商发布复现系列',
    visualSystem: 'VS-43 Claude multilingual intervals',
    grammar: '语言分组窄柱 + 每柱误差棒 + 三模型稳定顺序',
    renderer: 'groupedErrorBars',
    description: '复现 Claude 发布图里按编程语言拆分的 grouped bars，并保留 seed 或 bootstrap 误差。',
    useWhen: '适合语言、仓库或领域分层结果；误差条来源必须明确。',
    tags: ['claude', 'multilingual', 'error-bars'],
    data: { series: ['Opus', 'Sonnet', 'Peer'], groups: [
      { label: 'C', values: [{ value: 83, error: 5 }, { value: 76, error: 6 }, { value: 69, error: 7 }] },
      { label: 'C++', values: [{ value: 78, error: 6 }, { value: 72, error: 7 }, { value: 65, error: 8 }] },
      { label: 'Go', values: [{ value: 71, error: 6 }, { value: 66, error: 8 }, { value: 59, error: 7 }] },
      { label: 'Java', values: [{ value: 91, error: 4 }, { value: 84, error: 5 }, { value: 76, error: 6 }] },
      { label: 'JS', values: [{ value: 79, error: 5 }, { value: 75, error: 5 }, { value: 68, error: 7 }] },
      { label: 'PHP', values: [{ value: 74, error: 6 }, { value: 70, error: 7 }, { value: 67, error: 8 }] },
      { label: 'Ruby', values: [{ value: 72, error: 7 }, { value: 69, error: 6 }, { value: 65, error: 7 }] },
      { label: 'Rust', values: [{ value: 85, error: 5 }, { value: 79, error: 6 }, { value: 71, error: 7 }] }
    ] }
  });

  addComponent('claude-master-table', {
    id: 'claude-broken-axis-release',
    name: 'High-score Broken Axis',
    chartLabel: 'Coding benchmark · compressed high range',
    family: '厂商发布复现系列',
    visualSystem: 'VS-44 Claude compressed score rail',
    grammar: '高分段断轴柱 + 轴断裂符号 + 柱顶一位小数',
    renderer: 'brokenAxisBars',
    description: '复现 Claude 在高分 benchmark 上使用的断轴结构，放大 70–90 区间内的真实差别。',
    useWhen: '仅当完整坐标会掩盖差异、且断轴被清晰披露时使用。',
    tags: ['claude', 'broken-axis', 'high-score'],
    data: { min: 70, max: 90, items: [{ label: 'Opus', value: 87.6 }, { label: 'Sonnet', value: 82.4 }, { label: 'GPT', value: 79.8 }, { label: 'Gemini', value: 77.9 }, { label: 'Qwen', value: 75.4 }] }
  });

  addComponent('deepseek-hatched-groups', {
    id: 'deepseek-protocol-uplift',
    name: 'Agent Protocol Uplift',
    chartLabel: 'Base prompting vs agent protocol',
    family: '厂商发布复现系列',
    visualSystem: 'VS-45 DeepSeek protocol blue',
    grammar: '每任务 base/protocol 配对柱 + 增量桥线 + 开放/填充编码',
    renderer: 'pairedProtocolBars',
    description: '把模型本体分数和 agent protocol 后的分数配对，避免把系统增益误写成模型能力。',
    useWhen: '适合展示 scaffold、tool use 或 search protocol 的贡献。',
    tags: ['deepseek', 'protocol', 'agent-uplift'],
    data: { items: [{ label: 'Browse', base: 54, protocol: 71 }, { label: 'SWE', base: 47, protocol: 66 }, { label: 'Tool', base: 62, protocol: 82 }, { label: 'Math', base: 78, protocol: 89 }] }
  });

  addComponent('aa-rank-bump', {
    id: 'tml-intelligence-interactivity',
    name: 'Intelligence × Interactivity Frontier',
    chartLabel: 'Interaction models · two-dimensional frontier',
    family: '厂商发布复现系列',
    sourceKey: 'tml',
    source: 'Thinking Machines Lab',
    sourceType: '研究博客',
    sourceUrl: 'https://thinkingmachines.ai/blog/interaction-models/',
    visualSystem: 'VS-46 TML frontier field',
    grammar: '智能-交互二维散点 + 非支配前沿 + 研究方向箭头',
    renderer: 'frontierScatter',
    description: '复现 Thinking Machines Lab 用二维前沿表达模型智能与交互性的方式，强调产品形态不只是静态分数。',
    useWhen: '适合两个互相独立且都越高越好的研究维度。',
    tags: ['thinking-machines', 'frontier', 'interaction'],
    data: { points: [{ label: 'Static LLM', x: 28, y: 78 }, { label: 'Chat model', x: 52, y: 80, frontier: true }, { label: 'Tool agent', x: 68, y: 86, frontier: true }, { label: 'Realtime', x: 83, y: 77 }, { label: 'Interactive learner', x: 92, y: 93, frontier: true }, { label: 'Small local', x: 44, y: 57 }] }
  });

  addComponent('opencompass-radar', {
    id: 'qwen-multilingual-dotplot',
    name: 'Multilingual Capability Dot Plot',
    chartLabel: 'Language family benchmark detail',
    family: '厂商发布复现系列',
    visualSystem: 'VS-47 Qwen language constellation',
    grammar: '语言横向点图 + 系列范围线 + 三模型紧凑比较',
    renderer: 'languageDotPlot',
    description: '用点而非柱对比多语言结果，压缩空间同时保留每种语言的模型差距。',
    useWhen: '适合 5–10 个语言或领域和 2–4 个模型。',
    tags: ['qwen', 'multilingual', 'dot-plot'],
    data: { series: ['Qwen', 'Peer A', 'Peer B'], items: [
      { label: 'Chinese', values: [92, 84, 79] }, { label: 'English', values: [88, 90, 86] }, { label: 'Arabic', values: [81, 73, 69] }, { label: 'Japanese', values: [86, 78, 75] }, { label: 'Korean', values: [84, 76, 72] }, { label: 'Spanish', values: [87, 82, 80] }
    ] }
  });

  addComponent('deepseek-price-pareto', {
    id: 'mistral-cost-quality-quadrants',
    name: 'Cost–Quality Quadrants',
    chartLabel: 'Enterprise model selection map',
    family: '厂商发布复现系列',
    visualSystem: 'VS-48 Mistral selection canvas',
    grammar: '成本-质量四象限 + 推荐区底色 + 自家大点突出',
    renderer: 'costQualityQuadrants',
    description: '把企业模型选型拆成成本与质量四象限，复现 Mistral 常见的性价比叙事。',
    useWhen: '适合选型地图；必须说明价格混合口径和质量指数来源。',
    tags: ['mistral', 'cost', 'quadrant'],
    data: { splitX: 8, splitY: 80, points: [{ label: 'Mistral', x: 4, y: 85 }, { label: 'Open model', x: 2, y: 72 }, { label: 'Gemini', x: 7, y: 87 }, { label: 'Claude', x: 14, y: 91 }, { label: 'GPT', x: 17, y: 90 }, { label: 'Small', x: 1, y: 66 }] }
  });

  window.renderBenchmark = function renderBenchmark(entry) {
    const renderer = window.BENCHMARK_RENDERERS[entry.renderer];
    if (!renderer) throw new Error(`Missing renderer: ${entry.renderer}`);
    return renderer(entry).trim();
  };
})();
