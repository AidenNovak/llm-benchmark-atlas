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

  Object.assign(sources, {
    internlm2: { name: 'InternLM2 Technical Report', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2403.17297', note: '分布式训练扩展效率与长序列吞吐' },
    ernie5: { name: 'ERNIE 5.0 Technical Report', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2602.04705', note: 'replay buffer、RL 熵稳定性与跨模态专家路由' },
    step3: { name: 'Step-3 Technical Report', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2507.19427', note: '模型-系统协同、硬件 roofline 与解码成本' },
    yiReport: { name: 'Yi Technical Report', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2403.04652', note: 'in-context emergence、SFT data scaling 与 depth upscaling' }
  });

  const palettes = {
    intern: { bg: '#fbfbff', ink: '#171926', muted: '#6e7184', grid: '#dfe2ec', c1: '#6794ee', c2: '#6557c9', c3: '#e1a83f', c4: '#55a28b', c5: '#d8668a', c6: '#8e91a7' },
    ernie: { bg: '#fbfdff', ink: '#18212c', muted: '#677588', grid: '#dce5ef', c1: '#1677dc', c2: '#54b5ef', c3: '#f09b38', c4: '#3ca77b', c5: '#d14d77', c6: '#888f99' },
    step: { bg: '#fffdfb', ink: '#1d1b1a', muted: '#756d68', grid: '#e5ddd8', c1: '#ee3b38', c2: '#13aeb0', c3: '#3b68d8', c4: '#7165ba', c5: '#e29c2e', c6: '#85817d' },
    yi: { bg: '#fbfbff', ink: '#181923', muted: '#6e7080', grid: '#dfe0ea', c1: '#4e55c7', c2: '#b43b35', c3: '#933e9d', c4: '#2aa1a6', c5: '#3b9b55', c6: '#e77b2d' }
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
      <title id='${id}-title'>${esc(entry.chartLabel)}</title><desc id='${id}-desc'>${esc(entry.description)} ${esc(entry.dataNote)}</desc>
      <defs><style>.t{font:700 15px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}.s{font:10px ui-monospace,"SFMono-Regular",Consolas,monospace;fill:${p.muted}}.l{font:10px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.muted}}.v{font:700 11px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}.g{stroke:${p.grid};stroke-width:1;shape-rendering:crispEdges}</style></defs>
      <text class='t' x='28' y='30'>${esc(entry.chartLabel)}</text><text class='s' x='28' y='48'>${esc(entry.source + locator)}</text><text class='s' x='612' y='30' text-anchor='end'>DEMO DATA</text>${content}</svg>`;
  }

  function orthogonalEfficiencyPanels(entry) {
    const p = entry.palette;
    let body = '';
    entry.data.panels.forEach((panel, panelIndex) => {
      const x0 = 45 + panelIndex * 305;
      const y0 = 82;
      const width = 260;
      const height = 246;
      const barWidth = 30;
      const step = 45;
      body += `<text class='v' x='${x0}' y='72'>${esc(panel.label)}</text>`;
      [.5, .6, .7, .8, .9].forEach(tick => {
        const yy = map(tick, .45, .95, y0 + height, y0);
        body += `<line class='g' x1='${x0}' y1='${yy}' x2='${x0 + width}' y2='${yy}'/><text class='s' x='${x0 - 9}' y='${yy + 3}' text-anchor='end'>${Math.round(tick * 100)}%</text>`;
      });
      panel.values.forEach((item, index) => {
        const xx = x0 + 18 + index * step;
        const yy = map(item.value, .45, .95, y0 + height, y0);
        body += `<rect x='${xx}' y='${yy}' width='${barWidth}' height='${y0 + height - yy}' fill='${panelIndex ? p.c4 : p.c1}' fill-opacity='.82'/><text class='v' x='${xx + barWidth / 2}' y='${yy - 7}' text-anchor='middle'>${Math.round(item.value * 100)}%</text><text class='s' x='${xx + barWidth / 2}' y='${y0 + height + 18}' text-anchor='middle'>${esc(item.label)}</text>`;
      });
      body += `<text class='s' x='${x0 + width / 2}' y='${y0 + height + 40}' text-anchor='middle'>${esc(panel.axis)}</text>`;
    });
    body += `<text class='s' x='320' y='388' text-anchor='middle'>same training stack · one axis stresses communication, the other long-sequence execution</text>`;
    return frame(entry, body);
  }

  function replayBufferSchedule(entry) {
    const p = entry.palette;
    const data = entry.data;
    let body = '';
    data.methods.forEach((method, methodIndex) => {
      const y0 = 82 + methodIndex * 94;
      body += `<text class='v' x='86' y='${y0 + 34}' text-anchor='end'>${esc(method.label)}</text>`;
      method.gpus.forEach((gpu, gpuIndex) => {
        const yy = y0 + gpuIndex * 32;
        body += `<text class='s' x='105' y='${yy + 15}' text-anchor='end'>GPU ${gpuIndex}</text>`;
        gpu.forEach((cell, index) => {
          const xx = 120 + index * 31;
          const fill = cell.state === 'current' ? p.c1 : cell.state === 'next' ? p.c2 : cell.state === 'unfinished' ? p.c3 : p.grid;
          body += `<rect x='${xx}' y='${yy}' width='27' height='23' rx='3' fill='${fill}' fill-opacity='${cell.state === 'unfinished' ? .25 : .68}'${cell.state === 'unfinished' ? ` stroke='${p.c3}' stroke-dasharray='3 2'` : ''}/><text class='s' x='${xx + 13.5}' y='${yy + 15}' text-anchor='middle' style='fill:${p.ink}'>${esc(cell.id)}</text>`;
        });
      });
      const stopX = 120 + method.stopAfter * 31;
      body += `<line x1='${stopX}' y1='${y0 - 4}' x2='${stopX}' y2='${y0 + 58}' stroke='${p.c5}' stroke-width='2' stroke-dasharray='5 3'/><path d='M ${stopX + 17} ${y0 + 27} h 35' stroke='${p.ink}' stroke-width='3'/><path d='M ${stopX + 52} ${y0 + 27} l -8 -5 v 10 Z' fill='${p.ink}'/><rect x='${stopX + 68}' y='${y0 + 2}' width='77' height='51' fill='${p.c4}' fill-opacity='.08' stroke='${p.c4}' stroke-dasharray='4 3'/><text class='s' x='${stopX + 106}' y='${y0 + 23}' text-anchor='middle'>train set</text><text class='v' x='${stopX + 106}' y='${y0 + 39}' text-anchor='middle'>${method.trainingCount}</text>`;
    });
    body += `<rect x='120' y='373' width='12' height='8' fill='${p.c1}' fill-opacity='.68'/><text class='l' x='139' y='381'>current</text><rect x='215' y='373' width='12' height='8' fill='${p.c2}' fill-opacity='.68'/><text class='l' x='234' y='381'>next iteration</text><rect x='345' y='373' width='12' height='8' fill='${p.c3}' fill-opacity='.25' stroke='${p.c3}'/><text class='l' x='364' y='381'>unfinished long tail</text>`;
    return frame(entry, body);
  }

  function entropyCollapseDiagnostic(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = index => map(index, 0, data.steps.length - 1, 78, 590);
    const topY = value => map(value, .54, .74, 184, 78);
    const bottomY = value => map(value, .27, .47, 342, 236);
    let body = `<text class='v' x='78' y='69'>ACCURACY ↑</text><text class='v' x='78' y='226'>POLICY ENTROPY · stable band preferred</text>`;
    [0, 50, 100, 150, 200].forEach((tick, index) => body += `<line class='g' x1='${x(index * 2)}' y1='78' x2='${x(index * 2)}' y2='342'/><text class='s' x='${x(index * 2)}' y='363' text-anchor='middle'>${tick}</text>`);
    body += `<rect x='78' y='${bottomY(.35)}' width='512' height='${bottomY(.30) - bottomY(.35)}' fill='${p.c4}' fill-opacity='.08'/><text class='s' x='586' y='${bottomY(.35) - 5}' text-anchor='end'>healthy entropy band</text>`;
    data.series.forEach((series, index) => {
      const color = index ? p.c2 : p.c1;
      const accuracy = series.accuracy.map((value, pointIndex) => [x(pointIndex), topY(value)]);
      const entropy = series.entropy.map((value, pointIndex) => [x(pointIndex), bottomY(value)]);
      body += `<path d='${path(accuracy)}' fill='none' stroke='${color}' stroke-width='2.7'/><path d='${path(entropy)}' fill='none' stroke='${color}' stroke-width='2.7'/>`;
      body += `<line x1='${145 + index * 205}' y1='70' x2='${165 + index * 205}' y2='70' stroke='${color}' stroke-width='2.7'/><text class='l' x='${172 + index * 205}' y='74'>${esc(series.label)}</text>`;
    });
    const collapseX = x(data.collapseIndex);
    body += `<line x1='${collapseX}' y1='78' x2='${collapseX}' y2='342' stroke='${p.c5}' stroke-dasharray='5 3'/><text class='v' x='${collapseX + 8}' y='252'>entropy collapse</text><text class='s' x='334' y='387' text-anchor='middle'>training iteration →</text>`;
    return frame(entry, body);
  }

  function expertCollaborationFacets(entry) {
    const p = entry.palette;
    const data = entry.data;
    const colors = [p.c1, p.c5, p.c3, p.c4, p.c2, p.c6];
    let body = '';
    data.layers.forEach((layer, layerIndex) => {
      const x0 = 30 + layerIndex * 204;
      const y0 = 76;
      const width = 184;
      const rowH = 35;
      body += `<text class='v' x='${x0 + width / 2}' y='68' text-anchor='middle'>${esc(layer.label)}</text>`;
      layer.rows.forEach((row, rowIndex) => {
        const yy = y0 + rowIndex * rowH;
        body += `<text class='s' x='${x0 + 63}' y='${yy + 15}' text-anchor='end'>${esc(row.label)}</text>`;
        const max = Math.max(...row.values);
        row.values.forEach((value, index) => {
          const xx = x0 + 69 + index * 16;
          const height = map(value, 0, max, 1, 25);
          body += `<rect x='${xx}' y='${yy + 25 - height}' width='11' height='${height}' fill='${colors[rowIndex]}' fill-opacity='.8'/>`;
        });
      });
    });
    body += `<text class='s' x='320' y='299' text-anchor='middle'>expert utilization bars · each row normalized within modality</text>`;
    data.overlap.forEach((item, index) => {
      const x0 = 48 + index * 194;
      body += `<rect x='${x0}' y='318' width='173' height='47' fill='${colors[index]}' fill-opacity='.08' stroke='${colors[index]}'/><text class='v' x='${x0 + 8}' y='336'>${esc(item.label)}</text><text class='t' x='${x0 + 164}' y='346' text-anchor='end'>IoU ${item.value}</text>`;
    });
    body += `<text class='s' x='320' y='389' text-anchor='middle'>representative cross-modality top-expert overlap</text>`;
    return frame(entry, body);
  }

  function hardwareRoofline(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 3.5, 82, 590);
    const y = value => map(value, 0, 650, 338, 78);
    let body = '';
    [0, .5, 1, 2, 3].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='78' x2='${x(tick)}' y2='338'/><text class='s' x='${x(tick)}' y='359' text-anchor='middle'>${tick}</text>`);
    [0, 150, 300, 450, 600].forEach(tick => body += `<line class='g' x1='82' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='s' x='70' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    data.hardware.forEach((item, index) => {
      const end = [1.0 + index * .55, item.compute];
      body += `<line x1='${x(0)}' y1='${y(0)}' x2='${x(end[0])}' y2='${y(end[1])}' stroke='${p.c6}' stroke-width='1.4' stroke-dasharray='6 3'/><text class='s' x='${x(end[0]) - 3}' y='${y(end[1]) - 5}' text-anchor='end'>${esc(item.label)}</text>`;
    });
    data.models.forEach((model, index) => {
      const color = [p.c1, p.c3, p.c2][index];
      const points = model.points.map(point => [x(point[0]), y(point[1])]);
      body += `<path d='${path(points)}' fill='none' stroke='${color}' stroke-width='2.7'/><circle cx='${points[0][0]}' cy='${points[0][1]}' r='6' fill='${color}'/><circle cx='${points[1][0]}' cy='${points[1][1]}' r='6' fill='${p.bg}' stroke='${color}' stroke-width='2.5'/><text class='v' x='${points[1][0] + 8}' y='${points[1][1] - 8}'>${esc(model.label)} · 32K</text>`;
    });
    body += `<text class='s' x='336' y='387' text-anchor='middle'>KV memory access per token (GB) →</text><text class='s' x='18' y='218' text-anchor='middle' transform='rotate(-90 18 218)'>attention compute (GFLOPs) ↑</text>`;
    return frame(entry, body);
  }

  function objectiveReversalBars(entry) {
    const p = entry.palette;
    const data = entry.data;
    const y = index => 94 + index * 83;
    const x = value => map(value, 0, .42, 170, 580);
    let body = '';
    [.1, .2, .3, .4].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='75' x2='${x(tick)}' y2='340'/><text class='s' x='${x(tick)}' y='361' text-anchor='middle'>$${tick.toFixed(1)}</text>`);
    data.scenarios.forEach((scenario, index) => {
      const yy = y(index);
      body += `<text class='v' x='150' y='${yy + 18}' text-anchor='end'>${esc(scenario.label)}</text>`;
      const aWidth = x(scenario.a) - x(0);
      const bWidth = x(scenario.b) - x(0);
      body += `<rect x='${x(0)}' y='${yy}' width='${aWidth}' height='21' fill='${p.c1}' fill-opacity='.78'/><rect x='${x(0)}' y='${yy + 27}' width='${bWidth}' height='21' fill='${p.c2}' fill-opacity='.82'/><text class='s' x='${x(scenario.a) + 7}' y='${yy + 15}'>${scenario.a}</text><text class='s' x='${x(scenario.b) + 7}' y='${yy + 42}'>${scenario.b}</text>`;
      const winnerY = scenario.a < scenario.b ? yy + 10 : yy + 37;
      body += `<path d='M 158 ${winnerY - 6} l 7 6 l -7 6 Z' fill='${p.c5}'/>`;
    });
    body += `<rect x='198' y='373' width='12' height='8' fill='${p.c1}'/><text class='l' x='218' y='381'>Pangu Pro MoE</text><rect x='353' y='373' width='12' height='8' fill='${p.c2}'/><text class='l' x='373' y='381'>Step-3</text><text class='s' x='590' y='361' text-anchor='end'>cost per 1M tokens →</text>`;
    return frame(entry, body);
  }

  function continuousDiscreteEmergence(entry) {
    const p = entry.palette;
    const data = entry.data;
    let body = '';
    data.tasks.forEach((task, taskIndex) => {
      const y0 = 78 + taskIndex * 141;
      const x = index => map(index, 0, data.shots.length - 1, 82, 590);
      const continuousY = value => map(value, task.continuousRange[0], task.continuousRange[1], y0 + 98, y0 + 18);
      const exactY = value => map(value, 0, task.exactMax, y0 + 98, y0 + 18);
      body += `<rect x='78' y='${y0}' width='516' height='108' fill='${taskIndex ? p.c3 : p.c1}' fill-opacity='.025' stroke='${p.grid}'/><text class='v' x='86' y='${y0 + 15}'>${esc(task.label)}</text>`;
      task.models.forEach((model, index) => {
        const color = [p.c2, p.c3, p.c4, p.c5][index];
        const continuous = model.continuous.map((value, pointIndex) => [x(pointIndex), continuousY(value)]);
        const exact = model.exact.map((value, pointIndex) => [x(pointIndex), exactY(value)]);
        body += `<path d='${path(continuous)}' fill='none' stroke='${color}' stroke-width='1.8' stroke-opacity='.7'/><path d='${path(exact)}' fill='none' stroke='${color}' stroke-width='2.7' stroke-dasharray='5 3'/>`;
      });
      body += `<text class='s' x='590' y='${y0 + 102}' text-anchor='end'>shots →</text><text class='s' x='85' y='${y0 + 100}'>solid: error ↓ · dashed: exact match ↑</text>`;
    });
    body += `<text class='s' x='320' y='389' text-anchor='middle'>continuous error reveals gradual learning before discontinuous exact-match emergence</text>`;
    return frame(entry, body);
  }

  function layerTokenSimilarityBands(entry) {
    const p = entry.palette;
    const data = entry.data;
    const colors = [p.c1, p.c2, p.c3, p.c4, p.c5];
    let body = '';
    data.panels.forEach((panel, panelIndex) => {
      const y0 = 80 + panelIndex * 138;
      const x = layer => map(layer, 0, panel.maxLayer, 78, 590);
      const y = value => map(value, 0, 1, y0 + 95, y0 + 13);
      body += `<rect x='78' y='${y0}' width='512' height='104' fill='${p.c1}' fill-opacity='.02' stroke='${p.grid}'/><text class='v' x='86' y='${y0 + 15}'>${esc(panel.label)}</text>`;
      if (panel.duplicated) {
        body += `<rect x='${x(panel.duplicated[0])}' y='${y0}' width='${x(panel.duplicated[1]) - x(panel.duplicated[0])}' height='104' fill='${p.c3}' fill-opacity='.09'/><text class='s' x='${(x(panel.duplicated[0]) + x(panel.duplicated[1])) / 2}' y='${y0 + 30}' text-anchor='middle'>duplicated layers</text>`;
      }
      panel.tokens.forEach((token, index) => {
        const points = token.values.map((value, layer) => [x(layer), y(value)]);
        body += `<path d='${path(points)}' fill='none' stroke='${colors[index]}' stroke-width='1.8'/>`;
      });
      body += `<text class='s' x='590' y='${y0 + 99}' text-anchor='end'>layer →</text>`;
    });
    data.panels[0].tokens.forEach((token, index) => body += `<line x1='${92 + index * 101}' y1='371' x2='${110 + index * 101}' y2='371' stroke='${colors[index]}' stroke-width='2'/><text class='l' x='${116 + index * 101}' y='375'>${esc(token.label)}</text>`);
    body += `<text class='s' x='18' y='214' text-anchor='middle' transform='rotate(-90 18 214)'>input/output cosine similarity</text>`;
    return frame(entry, body);
  }

  Object.assign(renderers, { orthogonalEfficiencyPanels, replayBufferSchedule, entropyCollapseDiagnostic, expertCollaborationFacets, hardwareRoofline, objectiveReversalBars, continuousDiscreteEmergence, layerTokenSimilarityBands });

  add('gemini-small-multiples', {
    id: 'internlm-orthogonal-efficiency', name: 'Orthogonal Training Efficiency', chartLabel: 'MFU under GPU-scale and sequence-length stress', family: '亚洲模型实验室', sourceKey: 'internlm2', visualSystem: 'VS-72 InternLM orthogonal MFU panels', grammar: 'GPU 数量扩展面板 + 固定 GPU 长序列面板 + 同一 MFU 纵轴的正交压力测试', renderer: 'orthogonalEfficiencyPanels', palette: palettes.intern,
    description: '复现 InternLM2 Figure 1：把横向 GPU 扩展效率与固定 128 GPU 下的长序列执行效率并排检查。', useWhen: '适合分布式训练栈验收；两个面板必须共享模型、批量定义与 MFU 口径。', tags: ['internlm', 'mfu', 'distributed-training', 'scaling'],
    evidence: { locator: 'Figure 1', page: 5, verifiedAt: '2026-07-13', summary: '左侧随 GPU 数量扩展，右侧在 128 GPU 下随序列长度变化的 MFU。' },
    data: { panels: [
      { label: 'COMMUNICATION STRESS', axis: 'GPU count →', values: [{ label: '8', value: .64 }, { label: '32', value: .62 }, { label: '128', value: .61 }, { label: '512', value: .57 }, { label: '1024', value: .53 }] },
      { label: 'SEQUENCE STRESS', axis: 'sequence length →', values: [{ label: '16K', value: .71 }, { label: '32K', value: .78 }, { label: '64K', value: .86 }, { label: '128K', value: .87 }, { label: '256K', value: .92 }] }
    ] }
  });

  add('terminal-bench-trajectory', {
    id: 'ernie-unbiased-replay-buffer', name: 'Unbiased Replay Buffer Schedule', chartLabel: 'Long-tail rollout scheduling · Sync vs APRIL vs U-RB', family: '亚洲模型实验室', sourceKey: 'ernie5', visualSystem: 'VS-73 ERNIE replay-buffer scheduler', grammar: '三种 rollout 方法分行 + 双 GPU query 时隙 + generation stop + next-iteration 缓冲状态', renderer: 'replayBufferSchedule', palette: palettes.ernie,
    description: '复现 ERNIE 5.0 Figure 5：展示同步 RL、APRIL 与 U-RB 如何处理长尾 query、提前停止和下一轮缓冲。', useWhen: '适合解释 rollout 调度与数据无偏性；每个 query 必须保持唯一索引和 iteration 归属。', tags: ['ernie', 'replay-buffer', 'rollout', 'scheduler'],
    evidence: { locator: 'Figure 5', page: 12, verifiedAt: '2026-07-13', summary: '两张 GPU 时间线比较 Sync RL、APRIL 和 U-RB 的长尾 rollout 与训练批组装。' },
    data: { methods: [
      { label: 'SYNC RL', stopAfter: 12, trainingCount: 16, gpus: [[{ id: 0, state: 'current' }, { id: 1, state: 'current' }, { id: 2, state: 'current' }, { id: 3, state: 'current' }, { id: 8, state: 'current' }, { id: 9, state: 'current' }, { id: 10, state: 'current' }, { id: 11, state: 'unfinished' }], [{ id: 4, state: 'current' }, { id: 5, state: 'current' }, { id: 6, state: 'current' }, { id: 7, state: 'current' }, { id: 12, state: 'current' }, { id: 13, state: 'current' }, { id: 14, state: 'current' }, { id: 15, state: 'current' }]] },
      { label: 'APRIL', stopAfter: 10, trainingCount: 16, gpus: [[{ id: 0, state: 'current' }, { id: 1, state: 'current' }, { id: 2, state: 'current' }, { id: 3, state: 'current' }, { id: 8, state: 'current' }, { id: 9, state: 'current' }, { id: 10, state: 'current' }, { id: 11, state: 'unfinished' }], [{ id: 4, state: 'current' }, { id: 5, state: 'current' }, { id: 6, state: 'current' }, { id: 7, state: 'current' }, { id: 12, state: 'current' }, { id: 13, state: 'current' }, { id: 14, state: 'current' }, { id: 16, state: 'next' }]] },
      { label: 'U-RB', stopAfter: 12, trainingCount: 16, gpus: [[{ id: 0, state: 'current' }, { id: 1, state: 'current' }, { id: 2, state: 'current' }, { id: 3, state: 'current' }, { id: 8, state: 'current' }, { id: 9, state: 'current' }, { id: 10, state: 'current' }, { id: 11, state: 'unfinished' }], [{ id: 4, state: 'current' }, { id: 5, state: 'current' }, { id: 6, state: 'current' }, { id: 7, state: 'current' }, { id: 12, state: 'current' }, { id: 13, state: 'current' }, { id: 16, state: 'next' }, { id: 17, state: 'next' }]] }
    ] }
  });

  add('arxiv-dual-axis', {
    id: 'ernie-entropy-collapse', name: 'Entropy Collapse Diagnostic', chartLabel: 'RL accuracy and policy entropy · stable vs collapse', family: '亚洲模型实验室', sourceKey: 'ernie5', visualSystem: 'VS-74 ERNIE entropy-collapse diagnostic', grammar: '上下对齐 accuracy/entropy 双面板 + 健康熵带 + collapse 垂线 + 方法共享横轴', renderer: 'entropyCollapseDiagnostic', palette: palettes.ernie,
    description: '复现 ERNIE 5.0 Figure 6：同一训练进程中并排观察准确率增长和策略熵坍塌，区分表面增益与训练失稳。', useWhen: '适合 RL 稳定性诊断；不能只看 accuracy，熵的方向与合理区间需要按策略定义。', tags: ['ernie', 'entropy', 'rl', 'stability'],
    evidence: { locator: 'Figure 6', page: 13, verifiedAt: '2026-07-13', summary: '两种 IcePop 目标在 accuracy 与 train-logits entropy 上的同步训练动态。' },
    data: { steps: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200], collapseIndex: 7, series: [
      { label: 'MISC / Mixed IcePop', accuracy: [.55, .58, .61, .64, .66, .68, .69, .71, .72, .73, .735], entropy: [.33, .325, .318, .31, .3, .295, .294, .29, .291, .287, .278] },
      { label: 'GSPO IcePop', accuracy: [.55, .57, .6, .63, .66, .67, .685, .67, .64, .65, .655], entropy: [.33, .33, .335, .33, .335, .34, .35, .38, .46, .47, .47] }
    ] }
  });

  add('cohere-capability-glyphs', {
    id: 'ernie-expert-collaboration', name: 'Cross-modal Expert Collaboration Facets', chartLabel: 'Expert utilization and modality overlap across depth', family: '亚洲模型实验室', sourceKey: 'ernie5', visualSystem: 'VS-75 ERNIE expert collaboration facets', grammar: '首中末层列分面 + 模态行 expert 条码 + 底部跨模态 top-expert IoU 摘要', renderer: 'expertCollaborationFacets', palette: palettes.ernie,
    description: '合并复现 ERNIE 5.0 Figures 8-9：用首层、中层、末层的专家条码和 IoU 摘要观察专家专门化与跨模态协作。', useWhen: '适合 MoE routing 诊断；每行需要相同 expert ID 顺序，IoU 的 top-k 口径必须固定。', tags: ['ernie', 'moe', 'experts', 'multimodal'],
    evidence: { locator: 'Figures 8-9', page: 24, verifiedAt: '2026-07-13', summary: '六种模态/任务在首中末层的 expert utilization，以及 top 25% experts 的跨模态 IoU。' },
    data: { layers: [
      { label: 'FIRST LAYER', rows: [{ label: 'Text', values: [2, 4, 3, 1, 2, 3] }, { label: 'Image U', values: [11, 3, 18, 2, 5, 1] }, { label: 'Video U', values: [24, 4, 12, 1, 6, 2] }, { label: 'Image G', values: [2, 18, 4, 1, 8, 3] }, { label: 'Video G', values: [1, 3, 2, 22, 7, 4] }, { label: 'Audio', values: [1, 12, 3, 29, 4, 20] }] },
      { label: 'MIDDLE LAYER', rows: [{ label: 'Text', values: [3, 6, 2, 3, 4, 1] }, { label: 'Image U', values: [4, 2, 6, 3, 19, 2] }, { label: 'Video U', values: [8, 2, 5, 3, 7, 8] }, { label: 'Image G', values: [2, 14, 3, 7, 24, 4] }, { label: 'Video G', values: [1, 9, 2, 16, 40, 3] }, { label: 'Audio', values: [65, 20, 4, 2, 3, 5] }] },
      { label: 'LAST LAYER', rows: [{ label: 'Text', values: [2, 3, 13, 2, 5, 1] }, { label: 'Image U', values: [2, 5, 42, 3, 7, 1] }, { label: 'Video U', values: [2, 15, 27, 3, 7, 2] }, { label: 'Image G', values: [8, 2, 31, 22, 15, 3] }, { label: 'Video G', values: [15, 2, 26, 35, 5, 40] }, { label: 'Audio', values: [3, 14, 30, 7, 4, 2] }] }
    ], overlap: [{ label: 'image ↔ video understanding', value: .64 }, { label: 'image ↔ video generation', value: .78 }, { label: 'text ↔ audio', value: .40 }] }
  });

  add('phi-efficiency-bubbles', {
    id: 'step3-hardware-roofline', name: 'Attention Hardware Roofline', chartLabel: 'Attention compute vs KV memory access', family: '亚洲模型实验室', sourceKey: 'step3', visualSystem: 'VS-76 Step-3 hardware roofline', grammar: 'compute-memory 坐标 + 多硬件 roofline 射线 + 8K→32K 模型轨迹 + 端点直标', renderer: 'hardwareRoofline', palette: palettes.step,
    description: '复现 Step-3 Figure 5：把 attention 计算量与 KV 访存量放到硬件 computation-bandwidth roofline 上判断瓶颈匹配。', useWhen: '适合硬件感知 attention 设计；必须使用相同精度、batch 和 context 定义估算 compute 与访存。', tags: ['stepfun', 'roofline', 'hardware', 'attention'],
    evidence: { locator: 'Figure 5', page: 8, verifiedAt: '2026-07-13', summary: 'DSv3、Qwen3 MoE、Step-3 的 8K-32K 轨迹与 H800/H20/A800/910B roofline。' },
    data: { hardware: [{ label: 'H800', compute: 620 }, { label: '910B', compute: 520 }, { label: 'A800', compute: 430 }, { label: 'H20', compute: 250 }], models: [
      { label: 'DSv3', points: [[.25, 145], [1.15, 590]] }, { label: 'Qwen3 MoE', points: [[.55, 25], [3.15, 100]] }, { label: 'Step-3', points: [[.2, 30], [1.0, 130]] }
    ] }
  });

  add('deepseek-hatched-groups', {
    id: 'step3-objective-reversal', name: 'Training–Decoding Objective Reversal', chartLabel: 'The cheapest model changes with the objective', family: '亚洲模型实验室', sourceKey: 'step3', visualSystem: 'VS-77 Step-3 objective reversal bars', grammar: '同两模型三场景双条 + 每行赢家箭头 + decoding/training 目标反转', renderer: 'objectiveReversalBars', palette: palettes.step,
    description: '复现 Step-3 Figure 4：同一对模型在 8K/32K decoding 与 training 成本上的赢家发生反转。', useWhen: '适合揭示“训练便宜”不等于“推理解码便宜”；三种成本必须归一到相同 token 口径。', tags: ['stepfun', 'cost', 'training', 'decoding'],
    evidence: { locator: 'Figure 4', page: 8, verifiedAt: '2026-07-13', summary: 'Step-3 与 Pangu Pro MoE 在两档 decoding 和一档 training 成本上的相反趋势。' },
    data: { scenarios: [{ label: 'DECODING · 8K', a: .114, b: .078 }, { label: 'DECODING · 32K', a: .395, b: .168 }, { label: 'TRAINING · 8K', a: .076, b: .213 }] }
  });

  add('gemini-small-multiples', {
    id: 'yi-continuous-discrete-emergence', name: 'Continuous vs Discrete Emergence', chartLabel: 'In-context learning · error and exact-match views', family: '亚洲模型实验室', sourceKey: 'yiReport', visualSystem: 'VS-78 Yi continuous-discrete emergence', grammar: '任务难度分行 + 连续误差实线 + exact-match 虚线 + shots 共享横轴', renderer: 'continuousDiscreteEmergence', palette: palettes.yi,
    description: '复现 Yi Figure 3：在同一 few-shot 任务上并列连续误差与离散 exact match，避免把测量阈值误当作能力突然出现。', useWhen: '适合研究 emergent ability 与测量伪影；连续、离散指标必须来自同一预测样本。', tags: ['yi', 'emergence', 'in-context-learning', 'measurement'],
    evidence: { locator: 'Figure 3', page: 11, verifiedAt: '2026-07-13', summary: '两个线性系数推断任务，比较 difference-to-target 与 exact match 随 shots 变化。' },
    data: { shots: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40], tasks: [
      { label: '2 COEFFICIENTS · [1, -1]', continuousRange: [0, 50], exactMax: .6, models: [{ label: 'Yi-34B', continuous: [43, 35, 28, 20, 16, 18, 14, 12, 8, 10], exact: [.08, .28, .3, .38, .36, .28, .45, .32, .47, .26] }, { label: 'Llama-2-70B', continuous: [46, 39, 37, 33, 30, 28, 26, 24, 23, 22], exact: [.02, .1, .2, .35, .42, .45, .4, .38, .46, .55] }, { label: 'Yi-6B', continuous: [49, 42, 39, 36, 31, 22, 20, 25, 18, 17], exact: [0, .02, .04, .08, .1, .16, .06, .14, .08, .12] }] },
      { label: '5 COEFFICIENTS · [1, 1, 1, 1, 1]', continuousRange: [0, 170], exactMax: .8, models: [{ label: 'Yi-34B', continuous: [150, 54, 45, 41, 38, 47, 36, 34, 37, 39], exact: [0, 0, .01, .02, .01, .03, .02, .04, .01, .03] }, { label: 'Llama-2-70B', continuous: [60, 14, 8, 5, 10, 7, 6, 11, 8, 6], exact: [.12, .44, .56, .78, .56, .74, .66, .72, .68, .76] }, { label: 'Yi-6B', continuous: [165, 83, 76, 57, 45, 39, 34, 36, 29, 31], exact: [0, 0, .02, 0, .03, 0, .02, .01, .03, .01] }] }
    ] }
  });

  add('gemini-context-decay', {
    id: 'yi-layer-token-similarity', name: 'Layer–Token Similarity Bands', chartLabel: 'Input/output cosine similarity across model depth', family: '亚洲模型实验室', sourceKey: 'yiReport', visualSystem: 'VS-79 Yi layer-token similarity bands', grammar: '原模型/深度扩展双带 + token 多线 + duplicated-layer 区间底色 + 层端退化', renderer: 'layerTokenSimilarityBands', palette: palettes.yi,
    description: '复现 Yi Figure 8：逐 token 查看每层输入/输出余弦相似度，并突出 depth upscaling 新复制层接近恒等映射。', useWhen: '适合选择可复制或可跳过的层；相似度需按 token 展开，不能只报整层平均。', tags: ['yi', 'layers', 'cosine-similarity', 'depth-upscaling'],
    evidence: { locator: 'Figure 8', page: 17, verifiedAt: '2026-07-13', summary: 'Yi-6B 与 Yi-9B 初始化的 token-wise layer cosine similarity，新增 16 层接近 1。' },
    data: { panels: [
      { label: 'YI-6B · 32 LAYERS', maxLayer: 32, tokens: [{ label: 'Write', values: [.25, .92, .85, .98, .99, .98, .02, .97, .99, .98, .99, .98, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .96, .04, .01] }, { label: 'a', values: [.24, .88, .45, .83, .86, .9, .88, .89, .91, .88, .9, .91, .89, .92, .9, .91, .92, .92, .93, .94, .94, .95, .95, .96, .97, .96, .97, .97, .98, .97, .5, .4] }, { label: 'quiz', values: [.2, .76, .82, .85, .88, .9, .87, .9, .91, .89, .91, .92, .9, .92, .93, .93, .94, .94, .95, .95, .96, .96, .96, .97, .97, .98, .97, .98, .98, .98, .48, .42] }, { label: 'about', values: [.3, .9, .7, .82, .87, .89, .84, .88, .9, .87, .89, .91, .88, .91, .92, .92, .93, .93, .94, .94, .95, .95, .96, .96, .97, .97, .98, .97, .98, .98, .5, .45] }, { label: 'bits', values: [.25, .84, .78, .86, .9, .91, .87, .9, .91, .89, .9, .92, .91, .92, .93, .93, .94, .94, .95, .95, .96, .96, .96, .97, .97, .97, .98, .98, .98, .98, .45, .38] }] },
      { label: 'YI-9B INITIALIZATION · 48 LAYERS', maxLayer: 48, duplicated: [12, 28], tokens: [{ label: 'Write', values: [.25, .92, .85, .98, .99, .98, .02, .97, .99, .98, .99, .98, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .99, .98, .97, .96, .1] }, { label: 'a', values: [.24, .88, .45, .83, .86, .9, .88, .89, .91, .88, .9, .91, .98, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .98, .9, .91, .89, .92, .9, .91, .92, .92, .93, .94, .94, .95, .95, .96, .97, .96, .97, .97, .95, .5] }, { label: 'quiz', values: [.2, .76, .82, .85, .88, .9, .87, .9, .91, .89, .91, .92, .98, .98, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .98, .9, .92, .93, .93, .94, .94, .95, .95, .96, .96, .96, .97, .97, .98, .97, .98, .98, .98, .95, .48] }, { label: 'about', values: [.3, .9, .7, .82, .87, .89, .84, .88, .9, .87, .89, .91, .98, .98, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .98, .88, .91, .92, .92, .93, .93, .94, .94, .95, .95, .96, .96, .97, .97, .98, .97, .98, .98, .94, .45] }, { label: 'bits', values: [.25, .84, .78, .86, .9, .91, .87, .9, .91, .89, .9, .92, .98, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .99, .98, .91, .92, .93, .93, .94, .94, .95, .95, .96, .96, .96, .97, .97, .97, .98, .98, .98, .98, .93, .42] }] }
    ] }
  });

  window.renderBenchmark = function renderBenchmark(entry) {
    const renderer = window.BENCHMARK_RENDERERS[entry.renderer];
    if (!renderer) throw new Error(`Missing renderer: ${entry.renderer}`);
    return renderer(entry).trim();
  };
})();
