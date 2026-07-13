(function () {
  'use strict';

  const components = window.BENCHMARK_COMPONENTS;
  const renderers = window.BENCHMARK_RENDERERS;
  const sources = window.BENCHMARK_SOURCES;
  const byId = id => components.find(entry => entry.id === id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
  const map = (value, d0, d1, r0, r1) => r0 + (r1 - r0) * ((value - d0) / (d1 - d0));
  const path = points => points.map((point, index) => `${index ? 'L' : 'M'} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(' ');

  sources.kimiK2 = {
    name: 'Kimi K2 Technical Report',
    type: 'arXiv 论文',
    url: 'https://arxiv.org/abs/2507.20534',
    note: '稀疏缩放、attention heads、流水线重叠与工具 embedding'
  };

  const kimiPalette = {
    bg: '#fffefd', ink: '#19212b', muted: '#6e7682', grid: '#dce1e7',
    c1: '#f47a1f', c2: '#2f9e54', c3: '#8e58c7', c4: '#3978c5',
    c5: '#e34f83', c6: '#1aa3ad'
  };

  function add(baseId, overrides) {
    const base = byId(baseId);
    if (!base) throw new Error(`Missing base component: ${baseId}`);
    const entry = Object.assign({}, base, clone(overrides));
    const source = sources[entry.sourceKey];
    Object.assign(entry, { source: source.name, sourceType: source.type, sourceUrl: source.url });
    components.push(entry);
  }

  function frame(entry, content) {
    const p = entry.palette;
    const id = entry.id.replace(/[^a-z0-9]/gi, '');
    const locator = entry.evidence ? ` · ${entry.evidence.locator} / PDF p.${entry.evidence.page}` : '';
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400' role='img' aria-labelledby='${id}-title ${id}-desc' style='background:${p.bg};color:${p.ink}'>
      <title id='${id}-title'>${esc(entry.chartLabel)}</title>
      <desc id='${id}-desc'>${esc(entry.description)} ${esc(entry.dataNote)}</desc>
      <defs><style>
        .t{font:700 15px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}
        .s{font:10px ui-monospace,"SFMono-Regular",Consolas,monospace;fill:${p.muted}}
        .l{font:10px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.muted}}
        .v{font:700 11px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}
        .g{stroke:${p.grid};stroke-width:1;shape-rendering:crispEdges}
      </style></defs>
      <text class='t' x='28' y='30'>${esc(entry.chartLabel)}</text>
      <text class='s' x='28' y='48'>${esc(entry.source + locator)}</text>
      <text class='s' x='612' y='30' text-anchor='end'>DEMO DATA</text>
      ${content}
    </svg>`;
  }

  function sparsityScalingCurves(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(Math.log10(value), 20, 21.1, 76, 590);
    const y = value => map(value, 1.25, 1.85, 336, 86);
    let body = '';
    [1e20, 3e20, 1e21].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='336'/><text class='s' x='${x(tick)}' y='359' text-anchor='middle'>${tick === 1e20 ? '10²⁰' : tick === 1e21 ? '10²¹' : '3×10²⁰'}</text>`);
    [1.3, 1.5, 1.7, 1.85].forEach(tick => body += `<line class='g' x1='76' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='64' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    data.series.forEach((series, index) => {
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5][index];
      const points = series.points.map(point => [x(point[0]), y(point[1])]);
      body += `<path d='${path(points)}' fill='none' stroke='${color}' stroke-width='2.5' stroke-opacity='.78'/><path d='M ${points[0][0]} ${points[0][1] + 9} L ${points.at(-1)[0]} ${points.at(-1)[1] - 8}' fill='none' stroke='${color}' stroke-width='2' stroke-dasharray='7 4'/>`;
      points.forEach((point, pointIndex) => body += `<circle cx='${point[0]}' cy='${point[1]}' r='${pointIndex === points.length - 1 ? 5 : 3.5}' fill='${color}'/>`);
      body += `<circle cx='${438 + (index % 2) * 95}' cy='${91 + Math.floor(index / 2) * 17}' r='4' fill='${color}'/><text class='s' x='${448 + (index % 2) * 95}' y='${95 + Math.floor(index / 2) * 17}'>s=${series.sparsity}</text>`;
    });
    body += `<text class='s' x='333' y='385' text-anchor='middle'>training FLOPs (log scale) →</text><text class='s' x='18' y='220' text-anchor='middle' transform='rotate(-90 18 220)'>validation loss ↓</text>`;
    return frame(entry, body);
  }

  function attentionHeadFacets(entry) {
    const p = entry.palette;
    const data = entry.data;
    let body = '';
    data.facets.forEach((facet, facetIndex) => {
      const col = facetIndex % 2;
      const row = Math.floor(facetIndex / 2);
      const x0 = 38 + col * 300;
      const y0 = 80 + row * 141;
      const width = 270;
      const height = 118;
      const x = index => map(index, 0, facet.base.length - 1, x0 + 30, x0 + width - 18);
      const y = value => map(value, facet.min, facet.max, y0 + height - 18, y0 + 22);
      const basePoints = facet.base.map((value, index) => [x(index), y(value)]);
      const doublePoints = facet.double.map((value, index) => [x(index), y(value)]);
      body += `<rect x='${x0}' y='${y0}' width='${width}' height='${height}' fill='${p.c4}' fill-opacity='.035' stroke='${p.grid}'/><text class='v' x='${x0 + 10}' y='${y0 + 16}'>${esc(facet.label)}</text><path d='${path(basePoints)}' fill='none' stroke='${p.c4}' stroke-width='2.5'/><path d='${path(doublePoints)}' fill='none' stroke='${p.c5}' stroke-width='2.5' stroke-dasharray='5 3'/>`;
      basePoints.forEach(point => body += `<rect x='${point[0] - 3}' y='${point[1] - 3}' width='6' height='6' fill='${p.c4}'/>`);
      doublePoints.forEach(point => body += `<circle cx='${point[0]}' cy='${point[1]}' r='3.5' fill='${p.c5}'/>`);
      body += `<text class='s' x='${x0 + width - 12}' y='${y0 + 18}' text-anchor='end'>Δ ${facet.delta}%</text>`;
    });
    body += `<rect x='188' y='373' width='9' height='9' fill='${p.c4}'/><text class='l' x='205' y='381'>heads = layers</text><circle cx='351' cy='377' r='4' fill='${p.c5}'/><text class='l' x='363' y='381'>2× heads</text>`;
    return frame(entry, body);
  }

  function pipelineOverlapGrid(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 118;
    const y0 = 94;
    const cellW = 42;
    const rowH = 47;
    let body = '';
    data.phases.forEach((phase, index) => body += `<text class='s' x='${x0 + index * cellW + cellW / 2}' y='80' text-anchor='middle'>${esc(phase)}</text>`);
    data.rows.forEach((row, rowIndex) => {
      const y = y0 + rowIndex * rowH;
      body += `<text class='v' x='101' y='${y + 19}' text-anchor='end'>${esc(row.label)}</text>`;
      row.cells.forEach((cell, colIndex) => {
        if (!cell) return;
        const color = cell.kind === 'F' ? p.c4 : cell.kind === 'B' ? p.c1 : cell.kind === 'C' ? p.c2 : p.c3;
        body += `<rect x='${x0 + colIndex * cellW}' y='${y}' width='${cellW - 4}' height='29' fill='${color}' fill-opacity='${cell.kind === 'O' ? .48 : .86}'/><text x='${x0 + colIndex * cellW + (cellW - 4) / 2}' y='${y + 19}' text-anchor='middle' style='font:700 8px ui-monospace;fill:${p.bg}'>${esc(cell.text)}</text>`;
      });
    });
    data.bands.forEach((band, index) => {
      const y = 300 + index * 22;
      body += `<text class='s' x='101' y='${y + 11}' text-anchor='end'>${esc(band.label)}</text><rect x='${x0 + band.start * cellW}' y='${y}' width='${(band.end - band.start) * cellW - 4}' height='14' fill='${[p.c2, p.c3][index]}' fill-opacity='.55'/>`;
    });
    body += `<rect x='165' y='372' width='12' height='8' fill='${p.c4}'/><text class='l' x='183' y='380'>forward</text><rect x='270' y='372' width='12' height='8' fill='${p.c1}'/><text class='l' x='288' y='380'>backward</text><rect x='382' y='372' width='12' height='8' fill='${p.c2}'/><text class='l' x='400' y='380'>communication</text>`;
    return frame(entry, body);
  }

  function pairedEmbeddingClusters(entry) {
    const p = entry.palette;
    const data = entry.data;
    let body = '';
    data.panels.forEach((panel, panelIndex) => {
      const x0 = 34 + panelIndex * 306;
      const y0 = 82;
      const width = 278;
      const height = 255;
      body += `<rect x='${x0}' y='${y0}' width='${width}' height='${height}' fill='${p.bg}' stroke='${p.grid}'/><text class='v' x='${x0 + 12}' y='${y0 + 19}'>${esc(panel.label)}</text>`;
      panel.clusters.forEach((cluster, clusterIndex) => {
        const color = [p.c1, p.c2, p.c3, p.c4, p.c5, p.c6][clusterIndex % 6];
        const cx = x0 + map(cluster.center[0], -1, 1, 42, width - 35);
        const cy = y0 + map(cluster.center[1], -1, 1, height - 35, 40);
        for (let i = 0; i < cluster.count; i++) {
          const angle = i * 2.399 + clusterIndex;
          const radius = 5 + (i % 7) * (panelIndex ? 2.6 : 4.1);
          const px = cx + Math.cos(angle) * radius * cluster.spread;
          const py = cy + Math.sin(angle) * radius * cluster.spread * .72;
          body += `<circle cx='${px.toFixed(2)}' cy='${py.toFixed(2)}' r='2.2' fill='${color}' fill-opacity='.62'/>`;
        }
      });
      body += `<text class='s' x='${x0 + width / 2}' y='${y0 + height + 19}' text-anchor='middle'>t-SNE 1 →</text>`;
    });
    body += `<text class='s' x='320' y='379' text-anchor='middle'>real categories disperse · synthetic domains form designed coverage</text>`;
    return frame(entry, body);
  }

  Object.assign(renderers, {
    sparsityScalingCurves,
    attentionHeadFacets,
    pipelineOverlapGrid,
    pairedEmbeddingClusters
  });

  add('llama-scaling-law', {
    id: 'kimi-sparsity-scaling', name: 'Kimi Sparsity Scaling Law', chartLabel: 'Sparsity scaling · validation loss vs training FLOPs', family: '亚洲模型实验室', sourceKey: 'kimiK2', visualSystem: 'VS-61 Kimi sparsity trajectories', grammar: '多 sparsity 训练轨迹 + log FLOPs 横轴 + 每系列虚线缩放拟合', renderer: 'sparsityScalingCurves', palette: kimiPalette,
    description: '复现 Kimi K2 Figure 5：固定激活专家数、改变总专家数，比较不同 sparsity 下的训练缩放。', useWhen: '适合 MoE 稀疏度实验；横轴 compute 和激活专家配置必须一致。', tags: ['kimi', 'sparsity', 'scaling-law'],
    evidence: { locator: 'Figure 5', page: 7, verifiedAt: '2026-07-12', summary: '固定激活专家数，以总专家数变化比较 sparsity scaling law。' },
    data: { series: [
      { sparsity: 8, points: [[1.1e20, 1.78], [2.2e20, 1.66], [4.3e20, 1.55], [8.5e20, 1.43], [1.1e21, 1.39]] },
      { sparsity: 16, points: [[1.0e20, 1.73], [2.0e20, 1.62], [4.0e20, 1.51], [8.0e20, 1.40], [1.05e21, 1.35]] },
      { sparsity: 32, points: [[1.0e20, 1.69], [1.9e20, 1.58], [3.8e20, 1.48], [7.5e20, 1.37], [1.0e21, 1.31]] },
      { sparsity: 42, points: [[1.2e20, 1.70], [2.3e20, 1.59], [4.6e20, 1.49], [8.7e20, 1.38], [1.08e21, 1.32]] },
      { sparsity: 64, points: [[1.1e20, 1.68], [2.1e20, 1.57], [4.2e20, 1.46], [8.2e20, 1.36], [1.02e21, 1.30]] }
    ] }
  });

  add('gemini-small-multiples', {
    id: 'kimi-attention-head-scaling', name: 'Attention-head Scaling Facets', chartLabel: 'Validation loss · heads equal layers vs doubled heads', family: '亚洲模型实验室', sourceKey: 'kimiK2', visualSystem: 'VS-62 Kimi head-count facets', grammar: '四 compute 档折线小多图 + 方/圆 marker 协议 + loss 改善直标', renderer: 'attentionHeadFacets', palette: Object.assign({}, kimiPalette, { bg: '#f8fbff', c4: '#3978c5', c5: '#e4539a' }),
    description: '复现 Kimi K2 Figure 6：在不同 compute 档位比较 heads=layers 与 doubled heads 的验证 loss。', useWhen: '适合架构消融跨多个 compute scale 的比较。', tags: ['kimi', 'attention-heads', 'facets'],
    evidence: { locator: 'Figure 6', page: 7, verifiedAt: '2026-07-12', summary: '不同训练 compute 下比较 heads=layers 与 doubled heads 的 validation loss。' },
    data: { facets: [
      { label: '1.2e20 FLOPs', min: 1.62, max: 1.76, delta: 0.5, base: [1.74, 1.70, 1.67, 1.66, 1.67], double: [1.73, 1.69, 1.66, 1.64, 1.65] },
      { label: '2.2e20 FLOPs', min: 1.53, max: 1.65, delta: 0.7, base: [1.63, 1.59, 1.57, 1.56, 1.58], double: [1.62, 1.58, 1.55, 1.54, 1.56] },
      { label: '4.5e20 FLOPs', min: 1.43, max: 1.54, delta: 0.9, base: [1.52, 1.49, 1.47, 1.46, 1.48], double: [1.51, 1.48, 1.45, 1.44, 1.46] },
      { label: '9.0e20 FLOPs', min: 1.34, max: 1.43, delta: 1.2, base: [1.41, 1.39, 1.38, 1.37, 1.39], double: [1.40, 1.38, 1.36, 1.35, 1.37] }
    ] }
  });

  add('terminal-bench-trajectory', {
    id: 'kimi-pipeline-overlap', name: 'Pipeline Parallel Overlap Grid', chartLabel: 'Compute, communication and offload overlap', family: '亚洲模型实验室', sourceKey: 'kimiK2', visualSystem: 'VS-63 Kimi pipeline schedule', grammar: 'microbatch 二维时隙网格 + forward/backward 色块 + communication/offload 下层带', renderer: 'pipelineOverlapGrid', palette: Object.assign({}, kimiPalette, { bg: '#fffaf5', c1: '#ef6256', c4: '#4a65ee' }),
    description: '复现 Kimi K2 Figure 7 的 PP 调度结构，展示 forward、backward、通信与 offload 如何重叠。', useWhen: '适合训练系统 pipeline 调度；每格必须对应同一时间粒度。', tags: ['kimi', 'pipeline-parallel', 'overlap'],
    evidence: { locator: 'Figure 7', page: 8, verifiedAt: '2026-07-12', summary: '不同 PP phase 中 computation、communication 与 offloading 的重叠调度。' },
    data: { phases: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10'], rows: [
      { label: 'PP0', cells: [{ kind: 'F', text: 'F1' }, { kind: 'F', text: 'F2' }, { kind: 'C', text: 'C' }, null, { kind: 'B', text: 'B1' }, { kind: 'B', text: 'B2' }, null, null, null, null, null] },
      { label: 'PP1', cells: [null, { kind: 'F', text: 'F1' }, { kind: 'F', text: 'F2' }, { kind: 'C', text: 'C' }, null, { kind: 'B', text: 'B1' }, { kind: 'B', text: 'B2' }, null, null, null, null] },
      { label: 'PP2', cells: [null, null, { kind: 'F', text: 'F1' }, { kind: 'F', text: 'F2' }, { kind: 'C', text: 'C' }, null, { kind: 'B', text: 'B1' }, { kind: 'B', text: 'B2' }, null, null, null] },
      { label: 'PP3', cells: [null, null, null, { kind: 'F', text: 'F1' }, { kind: 'F', text: 'F2' }, { kind: 'C', text: 'C' }, null, { kind: 'B', text: 'B1' }, { kind: 'B', text: 'B2' }, null, null] }
    ], bands: [{ label: 'all-to-all', start: 2, end: 8 }, { label: 'offload', start: 4, end: 10 }] }
  });

  add('swebench-behavior-quadrant', {
    id: 'kimi-tool-embedding-pair', name: 'Real vs Synthetic Tool Embeddings', chartLabel: 'Paired t-SNE maps · MCP tools and synthetic domains', family: '亚洲模型实验室', sourceKey: 'kimiK2', visualSystem: 'VS-64 Kimi paired embedding atlas', grammar: '真实/合成双 t-SNE 面板 + 共享类别色 + 规则化聚类密度', renderer: 'pairedEmbeddingClusters', palette: Object.assign({}, kimiPalette, { bg: '#fffefe' }),
    description: '复现 Kimi K2 Figure 9：并排比较真实 MCP 工具自然聚类与合成工具预定义域覆盖。', useWhen: '适合比较两套 embedding 空间的覆盖结构；t-SNE 距离不应被解释为绝对相似度。', tags: ['kimi', 'tsne', 'tool-embeddings'],
    evidence: { locator: 'Figure 9', page: 10, verifiedAt: '2026-07-12', summary: '真实 MCP 工具与合成工具 collection 的 paired t-SNE embedding。' },
    data: { panels: [
      { label: 'REAL MCP TOOLS', clusters: [{ center: [-.55, .4], count: 18, spread: 1.8 }, { center: [.2, .5], count: 20, spread: 2.2 }, { center: [.5, -.35], count: 18, spread: 1.9 }, { center: [-.25, -.4], count: 22, spread: 2.5 }, { center: [.05, .05], count: 24, spread: 2.8 }] },
      { label: 'SYNTHETIC TOOLS', clusters: [{ center: [-.62, .55], count: 22, spread: 1.2 }, { center: [.52, .48], count: 22, spread: 1.1 }, { center: [.58, -.52], count: 22, spread: 1.15 }, { center: [-.55, -.5], count: 22, spread: 1.2 }, { center: [0, .05], count: 22, spread: 1.3 }] }
    ] }
  });

  window.renderBenchmark = function renderBenchmark(entry) {
    const renderer = window.BENCHMARK_RENDERERS[entry.renderer];
    if (!renderer) throw new Error(`Missing renderer: ${entry.renderer}`);
    return renderer(entry).trim();
  };
})();
