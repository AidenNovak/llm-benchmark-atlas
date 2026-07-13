(function () {
  'use strict';

  const components = window.BENCHMARK_COMPONENTS;
  const renderers = window.BENCHMARK_RENDERERS;
  const sources = window.BENCHMARK_SOURCES;
  const byId = id => components.find(entry => entry.id === id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
  const map = (value, d0, d1, r0, r1) => r0 + (r1 - r0) * ((value - d0) / (d1 - d0));
  const linePath = points => points.map((point, index) => `${index ? 'L' : 'M'} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(' ');

  Object.assign(sources, {
    deepseekV3: { name: 'DeepSeek-V3 Technical Report', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2412.19437', note: 'FP8 mixed-precision lifecycle and fine-grained quantization' },
    hunyuanLarge: { name: 'Hunyuan-Large Technical Report', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2411.02265', note: 'capacity-aware recycle routing for overloaded MoE experts' },
    seed15vl: { name: 'Seed1.5-VL Technical Report', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2505.07062', note: 'subcategory loss scaling and downstream metric transfer calibration' }
  });

  const palettes = {
    deepseek: { bg: '#fbfeff', ink: '#17232b', muted: '#667780', grid: '#d9e5e9', c1: '#21a6b4', c2: '#67b85b', c3: '#eeae42', c4: '#cf6ca4', c5: '#687f90', c6: '#d96556' },
    hunyuan: { bg: '#fcfdff', ink: '#17212e', muted: '#687487', grid: '#dbe2eb', c1: '#135ad8', c2: '#5c8ff0', c3: '#d95247', c4: '#42a278', c5: '#96a2b4', c6: '#f1b447' },
    seed: { bg: '#fffefe', ink: '#19212c', muted: '#6c7480', grid: '#dfe3e8', c1: '#247bc1', c2: '#ef5546', c3: '#49a574', c4: '#8b63c6', c5: '#e39b2f', c6: '#7b8795' }
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
    const locator = ` · ${entry.evidence.locator} / PDF p.${entry.evidence.page}`;
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400' role='img' aria-labelledby='${id}-title ${id}-desc' style='background:${p.bg};color:${p.ink}'>
      <title id='${id}-title'>${esc(entry.chartLabel)}</title><desc id='${id}-desc'>${esc(entry.description)} ${esc(entry.dataNote)}</desc>
      <defs><style>.t{font:700 15px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}.s{font:10px ui-monospace,"SFMono-Regular",Consolas,monospace;fill:${p.muted}}.l{font:10px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.muted}}.v{font:700 11px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}.g{stroke:${p.grid};stroke-width:1;shape-rendering:crispEdges}</style><marker id='${id}-arrow' markerWidth='8' markerHeight='8' refX='7' refY='4' orient='auto'><path d='M0 0 L8 4 L0 8 Z' fill='context-stroke'/></marker></defs>
      <text class='t' x='28' y='30'>${esc(entry.chartLabel)}</text><text class='s' x='28' y='48'>${esc(entry.source + locator)}</text><text class='s' x='612' y='30' text-anchor='end'>DEMO DATA</text>${content}</svg>`;
  }

  function recycleRoutingComparison(entry) {
    const p = entry.palette;
    const marker = `${entry.id.replace(/[^a-z0-9]/gi, '')}-arrow`;
    let body = '';
    entry.data.methods.forEach((method, panelIndex) => {
      const x0 = 28 + panelIndex * 305;
      const tokenY = 82;
      body += `<text class='v' x='${x0 + 137}' y='68' text-anchor='middle'>${esc(method.label)}</text>`;
      method.tokens.forEach((token, index) => {
        const xx = x0 + index * 38;
        const active = token !== 'D';
        body += `<rect x='${xx}' y='${tokenY}' width='31' height='20' rx='4' fill='${active ? p.c1 : p.c3}' fill-opacity='${active ? .09 : .17}' stroke='${active ? p.c1 : p.c3}'${active ? '' : " stroke-width='2'"}/><text class='s' x='${xx + 15.5}' y='${tokenY + 14}' text-anchor='middle'>${token}</text>`;
      });
      const routerX = x0 + 112;
      body += `<path d='M ${x0 + 129} 103 C ${x0 + 129} 123 ${routerX + 16} 125 ${routerX + 16} 140' fill='none' stroke='${p.c1}' stroke-width='1.6' marker-end='url(#${marker})'/><rect x='${routerX}' y='145' width='34' height='24' rx='5' fill='${p.c1}' fill-opacity='.12' stroke='${p.c1}'/><text class='s' x='${routerX + 17}' y='161' text-anchor='middle'>router</text>`;
      method.experts.forEach((expert, expertIndex) => {
        const xx = x0 + expertIndex * 53;
        body += `<rect x='${xx}' y='230' width='43' height='83' fill='${p.c1}' fill-opacity='.025' stroke='${p.grid}' stroke-dasharray='3 3'/><text class='s' x='${xx + 21.5}' y='328' text-anchor='middle'>E${expertIndex + 1}</text>`;
        expert.forEach((token, tokenIndex) => body += `<rect x='${xx + 6}' y='${238 + tokenIndex * 30}' width='31' height='22' rx='4' fill='${token === 'D' ? p.c6 : p.c2}' fill-opacity='.14' stroke='${token === 'D' ? p.c6 : p.c2}'/><text class='s' x='${xx + 21.5}' y='${253 + tokenIndex * 30}' text-anchor='middle'>${token}</text>`);
      });
      body += `<path d='M ${routerX + 17} 170 C ${routerX + 17} 195 ${x0 + 22} 198 ${x0 + 22} 226' fill='none' stroke='${p.c1}' stroke-width='1.5' marker-end='url(#${marker})'/>`;
      if (method.recycle) {
        body += `<path d='M ${x0 + 22} 220 C ${x0 + 65} 184 ${x0 + 178} 184 ${x0 + 181} 226' fill='none' stroke='${p.c6}' stroke-width='2' marker-end='url(#${marker})'/><text class='s' x='${x0 + 116}' y='190' text-anchor='middle' style='fill:${p.c6}'>capacity-aware second pass</text>`;
      } else {
        body += `<path d='M ${x0 + 22} 205 l -7 10 m 0 -10 l 7 10' stroke='${p.c3}' stroke-width='3'/><text class='v' x='${x0 + 33}' y='215' style='fill:${p.c3}'>DROP D</text>`;
      }
    });
    body += `<text class='s' x='320' y='365' text-anchor='middle'>expert capacity = 2 · overloaded token either disappears or is reassigned to an available expert</text><text class='s' x='320' y='384' text-anchor='middle'>state transition preserves the individual token identity across both panels</text>`;
    return frame(entry, body);
  }

  function lossMetricTransferFacets(entry) {
    const p = entry.palette;
    let body = '';
    entry.data.rows.forEach((row, rowIndex) => {
      const y0 = 78 + rowIndex * 145;
      row.panels.forEach((panel, panelIndex) => {
        const x0 = 40 + panelIndex * 197;
        const width = 165;
        const height = 94;
        body += `<rect x='${x0}' y='${y0}' width='${width}' height='${height}' fill='${panelIndex ? p.c3 : p.c1}' fill-opacity='.025' stroke='${p.grid}'/><text class='s' x='${x0 + 5}' y='${y0 + 12}'>${esc(panel.label)}</text>`;
        [0, .5, 1].forEach(tick => body += `<line class='g' x1='${x0}' y1='${y0 + height * tick}' x2='${x0 + width}' y2='${y0 + height * tick}'/>`);
        const points = panel.points.map(point => [map(point[0], 0, 1, x0 + 8, x0 + width - 8), map(point[1], 0, 1, y0 + height - 8, y0 + 20)]);
        body += `<path d='${linePath([[x0 + 8, y0 + height - 10], [x0 + width - 8, y0 + 22]])}' fill='none' stroke='${p.c2}' stroke-width='1.8' stroke-dasharray='5 3'/>`;
        points.forEach(point => body += `<circle cx='${point[0]}' cy='${point[1]}' r='2.6' fill='${panelIndex ? p.c3 : p.c1}'/>`);
        body += `<text class='s' x='${x0 + width / 2}' y='${y0 + height + 15}' text-anchor='middle'>${esc(panel.axis)}</text>`;
      });
      body += `<text class='v' x='18' y='${y0 + 48}' text-anchor='middle' transform='rotate(-90 18 ${y0 + 48})'>${esc(row.label)}</text><path d='M 211 ${y0 + 47} h 19 M 408 ${y0 + 47} h 19' stroke='${p.c5}' stroke-width='1.5' marker-end='url(#${entry.id.replace(/[^a-z0-9]/gi, '')}-arrow)'/>`;
    });
    body += `<text class='s' x='320' y='383' text-anchor='middle'>training tokens → subcategory loss → multiple related downstream metrics · local calibration only</text>`;
    return frame(entry, body);
  }

  function mixedPrecisionLifecycle(entry) {
    const p = entry.palette;
    const marker = `${entry.id.replace(/[^a-z0-9]/gi, '')}-arrow`;
    const node = (x, y, w, label, precision, fill) => `<rect x='${x}' y='${y}' width='${w}' height='38' rx='6' fill='${fill}' fill-opacity='.09' stroke='${fill}'/><text class='v' x='${x + w / 2}' y='${y + 17}' text-anchor='middle'>${esc(label)}</text><text class='s' x='${x + w / 2}' y='${y + 31}' text-anchor='middle'>${precision}</text>`;
    const edge = (x1, y1, x2, y2, label, color = p.c5) => `<path d='M ${x1} ${y1} L ${x2} ${y2}' fill='none' stroke='${color}' stroke-width='1.6' marker-end='url(#${marker})'/><text class='s' x='${(x1 + x2) / 2}' y='${(y1 + y2) / 2 - 5}' text-anchor='middle'>${esc(label)}</text>`;
    let body = `<text class='v' x='320' y='73' text-anchor='middle'>LINEAR OPERATOR · PRECISION DOMAINS</text>`;
    body += node(34, 116, 82, 'Input', 'BF16', p.c1) + node(156, 105, 92, 'Fprop GEMM', 'FP8 → FP32', p.c3) + node(288, 116, 82, 'Output', 'BF16', p.c1);
    body += node(34, 264, 82, 'Input grad', 'BF16', p.c1) + node(156, 253, 92, 'Dgrad GEMM', 'FP8 → FP32', p.c3) + node(288, 264, 82, 'Output grad', 'BF16', p.c1);
    body += node(434, 105, 92, 'Wgrad GEMM', 'FP8 → FP32', p.c3) + node(434, 181, 92, 'Weight grad', 'FP32', p.c4) + node(434, 264, 92, 'Optimizer', 'FP32 states', p.c4) + node(548, 181, 70, 'Master W', 'FP32', p.c4);
    body += edge(116, 135, 156, 124, 'to FP8') + edge(248, 124, 288, 135, 'to BF16') + edge(288, 283, 248, 272, 'to FP8') + edge(156, 272, 116, 283, 'to BF16');
    body += edge(116, 116, 434, 116, 'cached activation · FP8', p.c2) + edge(370, 135, 434, 124, 'to FP8') + edge(480, 143, 480, 181, 'accumulate FP32', p.c4) + edge(480, 219, 480, 264, 'update', p.c4) + edge(526, 283, 583, 219, 'retain FP32', p.c4) + edge(548, 200, 248, 200, 'to FP8 weight', p.c2);
    body += `<rect x='142' y='91' width='398' height='220' rx='14' fill='none' stroke='${p.c3}' stroke-dasharray='5 4'/><text class='s' x='151' y='325'>FP8 for compute-dense GEMMs · BF16 at activation boundaries · FP32 for accumulation and optimizer state</text><text class='s' x='320' y='382' text-anchor='middle'>precision is encoded on every conversion edge, not inferred from node color alone</text>`;
    return frame(entry, body);
  }

  function quantizationAccumulator(entry) {
    const p = entry.palette;
    let body = `<text class='v' x='160' y='72' text-anchor='middle'>FINE-GRAINED QUANTIZATION</text><text class='v' x='470' y='72' text-anchor='middle'>PERIODIC HIGH-PRECISION ACCUMULATION</text>`;
    body += `<text class='s' x='34' y='96'>activation · 1 × 128 tiles</text>`;
    [0, 1, 2].forEach(row => [0, 1, 2, 3].forEach(col => {
      const shade = [p.c1, p.c2, p.c3, p.c4][col];
      body += `<rect x='${34 + col * 57}' y='${106 + row * 25}' width='51' height='19' fill='${shade}' fill-opacity='${.08 + row * .04}' stroke='${shade}'/><text class='s' x='${59 + col * 57}' y='${120 + row * 25}' text-anchor='middle'>s${row}${col}</text>`;
    }));
    body += `<text class='s' x='34' y='205'>weight · 128 × 128 blocks</text>`;
    [0, 1, 2].forEach(row => [0, 1, 2].forEach(col => {
      const shade = [p.c4, p.c3, p.c2][col];
      body += `<rect x='${60 + col * 66}' y='${216 + row * 42}' width='58' height='36' fill='${shade}' fill-opacity='${.08 + row * .035}' stroke='${shade}'/><text class='s' x='${89 + col * 66}' y='${238 + row * 42}' text-anchor='middle'>scale ${row + 1}.${col + 1}</text>`;
    }));
    body += `<line x1='318' y1='78' x2='318' y2='348' stroke='${p.grid}' stroke-width='2'/><text class='s' x='352' y='102'>low-precision MMA sequence</text>`;
    entry.data.groups.forEach((group, groupIndex) => {
      const y = 125 + groupIndex * 63;
      group.forEach((cell, index) => {
        const x = 352 + index * 42;
        body += `<rect x='${x}' y='${y}' width='30' height='24' rx='3' fill='${p.c3}' fill-opacity='.18' stroke='${p.c3}'/><text class='s' x='${x + 15}' y='${y + 16}' text-anchor='middle'>${cell}</text>`;
      });
      const promoteX = 352 + group.length * 42 + 6;
      body += `<path d='M ${promoteX - 10} ${y + 12} h 20' stroke='${p.c5}' marker-end='url(#${entry.id.replace(/[^a-z0-9]/gi, '')}-arrow)'/><rect x='${promoteX + 16}' y='${y - 4}' width='64' height='32' rx='5' fill='${p.c4}' fill-opacity='.13' stroke='${p.c4}'/><text class='s' x='${promoteX + 48}' y='${y + 10}' text-anchor='middle'>FP32</text><text class='s' x='${promoteX + 48}' y='${y + 22}' text-anchor='middle'>register</text>`;
    });
    body += `<path d='M 356 337 H 584' stroke='${p.c1}' stroke-width='3'/><path d='M 356 331 v 12 M 432 331 v 12 M 508 331 v 12 M 584 331 v 12' stroke='${p.c1}'/><text class='s' x='470' y='359' text-anchor='middle'>promotion interval N₍C₎ = 128 elements</text><text class='s' x='320' y='385' text-anchor='middle'>local scales contain outliers; scheduled FP32 promotion limits long accumulation error</text>`;
    return frame(entry, body);
  }

  Object.assign(renderers, { recycleRoutingComparison, lossMetricTransferFacets, mixedPrecisionLifecycle, quantizationAccumulator });

  add('toolbench-outcome-sankey', {
    id: 'hunyuan-recycle-routing', name: 'Capacity-aware Recycle Routing', chartLabel: 'Overloaded MoE tokens · drop vs recycle', family: '亚洲模型实验室', sourceKey: 'hunyuanLarge', visualSystem: 'VS-80 Hunyuan token-preserving recycle route', grammar: '传统/回收双路由面板 + token 身份保持 + expert 容量槽 + overloaded token 丢弃/二次分配状态转换', renderer: 'recycleRoutingComparison', palette: palettes.hunyuan,
    description: '复现 Hunyuan-Large Figure 2：同一个 overloaded token 在传统 top-k 中被丢弃，在 recycle routing 中被二次分配给未满专家。', useWhen: '适合解释 MoE 容量溢出策略；必须同时展示容量上限、token 身份和二次路由结果。', tags: ['hunyuan', 'moe', 'routing', 'capacity', 'token-flow'],
    evidence: { locator: 'Figure 2', page: 6, verifiedAt: '2026-07-13', summary: 'Expert 1 容量为 2；Token D 从丢弃状态变为重新分配到未满的 Expert 4。' },
    data: { methods: [{ label: 'TRADITIONAL TOP-K', tokens: ['A', 'B', 'C', 'D', 'E', 'F'], experts: [['A', 'C'], [], [], ['B'], []], recycle: false }, { label: 'RECYCLE ROUTING', tokens: ['A', 'B', 'C', 'D', 'E', 'F'], experts: [['A', 'C'], [], [], ['B', 'D'], []], recycle: true }] }
  });

  add('gemini-small-multiples', {
    id: 'seed-loss-metric-transfer', name: 'Loss-to-Benchmark Transfer Calibration', chartLabel: 'Training tokens → subcategory loss → downstream metrics', family: '亚洲模型实验室', sourceKey: 'seed15vl', visualSystem: 'VS-81 Seed linked loss-transfer facets', grammar: '能力子类分行 + token-loss 幂律首面板 + 同一 loss 映射多个下游指标的局部 log-linear 双面板 + 因果阅读箭头', renderer: 'lossMetricTransferFacets', palette: palettes.seed,
    description: '复现 Seed1.5-VL Figure 3：把 OCR/grounding 子类 loss 的 token 缩放与相关下游评测指标的局部校准关系串成两段证据链。', useWhen: '适合用训练代理指标预测相关 benchmark；只应在论文支持的局部 loss 区间内解释，不外推到饱和区。', tags: ['seed', 'vlm', 'scaling-law', 'calibration', 'transfer'],
    evidence: { locator: 'Figure 3', page: 14, verifiedAt: '2026-07-13', summary: '六分面分别连接 OCR/grounding loss 的 token 幂律与 ChartQA、InfoVQA、RefCOCO、RefCOCO+ 指标。' },
    data: { rows: [
      { label: 'OCR', panels: [{ label: 'loss vs training tokens', axis: 'log tokens →', points: [[.04, .92], [.15, .82], [.28, .77], [.4, .64], [.54, .55], [.65, .43], [.76, .32], [.9, .16], [.98, .08]] }, { label: 'ChartQA vs -log loss', axis: '-log OCR loss →', points: [[.08, .12], [.2, .24], [.32, .3], [.46, .48], [.62, .55], [.76, .71], [.91, .84]] }, { label: 'InfoVQA vs -log loss', axis: '-log OCR loss →', points: [[.06, .1], [.22, .2], [.38, .36], [.54, .47], [.68, .64], [.82, .78], [.95, .86]] }] },
      { label: 'GROUNDING', panels: [{ label: 'loss vs training tokens', axis: 'log tokens →', points: [[.02, .94], [.17, .85], [.31, .71], [.46, .62], [.6, .48], [.73, .37], [.86, .23], [.98, .1]] }, { label: 'RefCOCO vs -log loss', axis: '-log grounding loss →', points: [[.08, .16], [.22, .28], [.36, .25], [.49, .52], [.63, .58], [.77, .73], [.93, .9]] }, { label: 'RefCOCO+ vs -log loss', axis: '-log grounding loss →', points: [[.07, .12], [.22, .3], [.37, .36], [.51, .49], [.66, .64], [.8, .76], [.95, .92]] }] }
    ] }
  });

  add('toolbench-outcome-sankey', {
    id: 'deepseek-fp8-precision-lifecycle', name: 'Mixed-precision Training Lifecycle', chartLabel: 'FP8 GEMMs with BF16 boundaries and FP32 state', family: '亚洲模型实验室', sourceKey: 'deepseekV3', visualSystem: 'VS-82 DeepSeek precision-domain lifecycle', grammar: 'Fprop/Dgrad/Wgrad 三 GEMM 闭环 + 每条转换边的精度协议 + BF16 激活边界 + FP32 master/optimizer 状态域', renderer: 'mixedPrecisionLifecycle', palette: palettes.deepseek,
    description: '复现 DeepSeek-V3 Figure 6：把线性层前向、激活反传、权重反传和优化器更新放进一个显式精度转换闭环。', useWhen: '适合审计混合精度训练的数据类型边界；节点和转换边都必须标明精度，不能仅靠颜色暗示。', tags: ['deepseek', 'fp8', 'mixed-precision', 'training-system', 'dataflow'],
    evidence: { locator: 'Figure 6', page: 15, verifiedAt: '2026-07-13', summary: 'Fprop、Dgrad、Wgrad 使用 FP8 GEMM；激活边界保留 BF16，累加、master weight、gradient 与 optimizer state 保留 FP32。' },
    data: { domains: ['FP8 GEMM', 'BF16 activation', 'FP32 accumulation', 'FP32 optimizer state'] }
  });

  add('helm-capability-heatmap', {
    id: 'deepseek-fine-grained-quantization', name: 'Fine-grained Quantization Accumulator', chartLabel: 'Local scaling blocks with periodic FP32 promotion', family: '亚洲模型实验室', sourceKey: 'deepseekV3', visualSystem: 'VS-83 DeepSeek local-scale accumulation instrument', grammar: 'activation 1×128 tile scales + weight 128×128 block scales + low-precision MMA 批次 + 固定间隔 FP32 promotion 时间轴', renderer: 'quantizationAccumulator', palette: Object.assign({}, palettes.deepseek, { bg: '#fffefd' }),
    description: '复现 DeepSeek-V3 Figure 7：并排展示局部 scale 如何隔离 outlier，以及低精度 MMA 如何按固定间隔提升到 CUDA Core 做 FP32 累加。', useWhen: '适合说明量化误差控制由空间分组和时间累加两部分共同完成；必须保留两种分组形状与 promotion 间隔。', tags: ['deepseek', 'fp8', 'quantization', 'outlier', 'accumulation'],
    evidence: { locator: 'Figure 7', page: 16, verifiedAt: '2026-07-13', summary: 'Activation 按 1×128 tile、weight 按 128×128 block 独立缩放，并每 128 个 MMA 元素提升到 FP32 累加。' },
    data: { groups: [['M1', 'M2', 'M3', 'M4'], ['M5', 'M6', 'M7', 'M8'], ['M9', 'M10', 'M11', 'M12']] }
  });

  window.renderBenchmark = function renderBenchmark(entry) {
    const renderer = window.BENCHMARK_RENDERERS[entry.renderer];
    if (!renderer) throw new Error(`Missing renderer: ${entry.renderer}`);
    return renderer(entry).trim();
  };
})();
