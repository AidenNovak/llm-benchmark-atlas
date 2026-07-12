(function () {
  'use strict';

  const components = window.BENCHMARK_COMPONENTS;
  const renderers = window.BENCHMARK_RENDERERS;
  const sources = window.BENCHMARK_SOURCES;
  const byId = id => components.find(entry => entry.id === id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const map = (value, d0, d1, r0, r1) => r0 + (r1 - r0) * ((value - d0) / (d1 - d0));
  const path = points => points.map((point, index) => `${index ? 'L' : 'M'} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(' ');

  Object.assign(sources, {
    minimax01: {
      name: 'MiniMax-01 Technical Report',
      type: 'arXiv 论文',
      url: 'https://arxiv.org/abs/2501.08313',
      note: 'MoE isoflop、attention throughput 与 VLM 数据层级覆盖'
    },
    minimaxM1: {
      name: 'MiniMax-M1 Technical Report',
      type: 'arXiv 论文',
      url: 'https://arxiv.org/abs/2506.13585',
      note: 'RL 算法等质量加速与训练/推理概率一致性'
    },
    glm45: {
      name: 'GLM-4.5 Technical Report',
      type: 'arXiv 论文',
      url: 'https://arxiv.org/abs/2508.06471',
      note: '参数效率、难度课程与上下文课程消融'
    }
  });

  const minimaxPalette = {
    bg: '#fffafb', ink: '#171518', muted: '#6f6870', grid: '#e5dde2',
    c1: '#ed4966', c2: '#168f91', c3: '#f0a33a', c4: '#5b63ce',
    c5: '#2d9b62', c6: '#8b58b7'
  };

  const glmPalette = {
    bg: '#f8fbff', ink: '#17202b', muted: '#687587', grid: '#d9e3ee',
    c1: '#1689e8', c2: '#35aa7c', c3: '#ef5a50', c4: '#7764d8',
    c5: '#e7a532', c6: '#667487'
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

  function isoflopGapFacets(entry) {
    const p = entry.palette;
    let body = '';
    entry.data.facets.forEach((facet, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x0 = 34 + col * 303;
      const y0 = 72 + row * 148;
      const width = 270;
      const height = 126;
      const x = value => map(value, 0, 14, x0 + 31, x0 + width - 14);
      const y = value => map(value, facet.min, facet.max, y0 + height - 22, y0 + 25);
      const dense = facet.dense.map(point => [x(point[0]), y(point[1])]);
      const moe = facet.moe.map(point => [x(point[0]), y(point[1])]);
      const targetY = y(facet.target);
      const moeX = x(facet.moeMatch);
      const denseX = x(facet.denseMatch);
      body += `<rect x='${x0}' y='${y0}' width='${width}' height='${height}' fill='${p.c4}' fill-opacity='.025' stroke='${p.grid}'/>`;
      body += `<text class='v' x='${x0 + 10}' y='${y0 + 17}'>${esc(facet.label)}</text>`;
      body += `<path d='${path(dense)}' fill='none' stroke='${p.c4}' stroke-width='2.5'/><path d='${path(moe)}' fill='none' stroke='${p.c1}' stroke-width='2.5'/>`;
      dense.forEach(point => { body += `<circle cx='${point[0]}' cy='${point[1]}' r='3.2' fill='${p.c4}'/>`; });
      moe.forEach(point => { body += `<circle cx='${point[0]}' cy='${point[1]}' r='3.2' fill='${p.c1}'/>`; });
      body += `<line x1='${moeX}' y1='${targetY}' x2='${denseX}' y2='${targetY}' stroke='${p.muted}' stroke-width='1.2' stroke-dasharray='4 3'/><line x1='${moeX}' y1='${targetY}' x2='${moeX}' y2='${y0 + height - 15}' stroke='${p.muted}' stroke-dasharray='4 3'/><line x1='${denseX}' y1='${targetY}' x2='${denseX}' y2='${y0 + height - 15}' stroke='${p.muted}' stroke-dasharray='4 3'/>`;
      body += `<text class='s' x='${(moeX + denseX) / 2}' y='${targetY - 6}' text-anchor='middle'>${(facet.denseMatch / facet.moeMatch).toFixed(1)}× compute gap</text>`;
      body += `<text class='s' x='${x0 + width - 9}' y='${y0 + height - 6}' text-anchor='end'>ZFLOPs →</text>`;
    });
    body += `<circle cx='220' cy='378' r='4' fill='${p.c1}'/><text class='l' x='230' y='382'>2B active MoE</text><circle cx='354' cy='378' r='4' fill='${p.c4}'/><text class='l' x='364' y='382'>7B dense</text>`;
    return frame(entry, body);
  }

  function throughputCliffLines(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(Math.log2(value), 10, 16, 82, 580);
    const y = value => map(value, 5000, 18000, 335, 84);
    const colors = [p.c1, p.c4, p.c2, p.c3, p.c6];
    let body = '';
    [1024, 4096, 16384, 65536].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='78' x2='${x(tick)}' y2='338'/><text class='s' x='${x(tick)}' y='359' text-anchor='middle'>${tick >= 1024 ? `${tick / 1024}k` : tick}</text>`);
    [6000, 10000, 14000, 18000].forEach(tick => body += `<line class='g' x1='82' y1='${y(tick)}' x2='580' y2='${y(tick)}'/><text class='s' x='70' y='${y(tick) + 3}' text-anchor='end'>${tick / 1000}k</text>`);
    data.series.forEach((series, index) => {
      const color = colors[index];
      const points = data.lengths.map((length, pointIndex) => series.values[pointIndex] == null ? null : [x(length), y(series.values[pointIndex])]).filter(Boolean);
      body += `<path d='${path(points)}' fill='none' stroke='${color}' stroke-width='2.6'${index > 2 ? " stroke-dasharray='6 3'" : ''}/>`;
      points.forEach(point => { body += `<circle cx='${point[0]}' cy='${point[1]}' r='3.7' fill='${p.bg}' stroke='${color}' stroke-width='2'/>`; });
      const labelX = 100 + (index % 3) * 169;
      const labelY = 73 + Math.floor(index / 3) * 17;
      body += `<line x1='${labelX}' y1='${labelY - 3}' x2='${labelX + 20}' y2='${labelY - 3}' stroke='${color}' stroke-width='2.5'/><text class='l' x='${labelX + 26}' y='${labelY}'>${esc(series.label)}</text>`;
      if (series.oomAt) {
        const last = points.at(-1);
        body += `<path d='M ${last[0] + 8} ${last[1] - 6} l 8 8 m -8 0 l 8 -8' stroke='${color}' stroke-width='2'/><text class='s' x='${last[0] + 20}' y='${last[1] + 2}'>OOM @ ${series.oomAt / 1024}k</text>`;
      }
    });
    body += `<text class='s' x='331' y='385' text-anchor='middle'>sequence length (log₂) →</text><text class='s' x='17' y='218' text-anchor='middle' transform='rotate(-90 17 218)'>tokens / GPU / second ↑</text>`;
    return frame(entry, body);
  }

  function arcPoint(cx, cy, radius, angle) {
    const radians = angle * Math.PI / 180;
    return [cx + Math.cos(radians) * radius, cy + Math.sin(radians) * radius];
  }

  function donutArc(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
    const outerStart = arcPoint(cx, cy, outerRadius, startAngle);
    const outerEnd = arcPoint(cx, cy, outerRadius, endAngle);
    const innerEnd = arcPoint(cx, cy, innerRadius, endAngle);
    const innerStart = arcPoint(cx, cy, innerRadius, startAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${outerStart[0]} ${outerStart[1]} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd[0]} ${outerEnd[1]} L ${innerEnd[0]} ${innerEnd[1]} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${innerStart[0]} ${innerStart[1]} Z`;
  }

  function hierarchicalCoverageSunburst(entry) {
    const p = entry.palette;
    const colors = [p.c1, p.c3, p.c4, p.c5, p.c2, p.c6];
    const cx = 320;
    const cy = 223;
    let angle = -90;
    let body = '';
    entry.data.categories.forEach((category, categoryIndex) => {
      const span = category.share * 3.6;
      const end = angle + span;
      const color = colors[categoryIndex];
      body += `<path d='${donutArc(cx, cy, 49, 98, angle + .5, end - .5)}' fill='${color}' fill-opacity='.9' stroke='${p.bg}' stroke-width='2'/>`;
      const mid = (angle + end) / 2;
      const label = arcPoint(cx, cy, 75, mid);
      body += `<text x='${label[0]}' y='${label[1] - 2}' text-anchor='middle' style='font:700 8px ui-sans-serif;fill:${p.bg}'>${esc(category.label)}</text><text x='${label[0]}' y='${label[1] + 9}' text-anchor='middle' style='font:700 8px ui-monospace;fill:${p.bg}'>${category.share}%</text>`;
      let tagAngle = angle;
      category.tags.forEach((tag, tagIndex) => {
        const tagSpan = span * (tag.share / category.share);
        const tagEnd = tagAngle + tagSpan;
        body += `<path d='${donutArc(cx, cy, 102, 148, tagAngle + .5, tagEnd - .5)}' fill='${color}' fill-opacity='${.36 + tagIndex * .18}' stroke='${p.bg}' stroke-width='1.5'/>`;
        const tagMid = (tagAngle + tagEnd) / 2;
        const tagLabel = arcPoint(cx, cy, 125, tagMid);
        const rotation = tagMid > 90 && tagMid < 270 ? tagMid + 180 : tagMid;
        body += `<text class='s' x='${tagLabel[0]}' y='${tagLabel[1]}' text-anchor='middle' transform='rotate(${rotation} ${tagLabel[0]} ${tagLabel[1]})'>${esc(tag.label)}</text>`;
        tagAngle = tagEnd;
      });
      angle = end;
    });
    body += `<circle cx='${cx}' cy='${cy}' r='45' fill='${p.bg}' stroke='${p.grid}'/><text class='t' x='${cx}' y='${cy - 2}' text-anchor='middle'>1M</text><text class='s' x='${cx}' y='${cy + 14}' text-anchor='middle'>sampled pairs</text>`;
    body += `<text class='s' x='320' y='388' text-anchor='middle'>inner ring = capability family · outer ring = top instruction tags</text>`;
    return frame(entry, body);
  }

  function matchedQualitySpeedup(entry) {
    const p = entry.palette;
    const data = entry.data;
    const colors = [p.c5, p.c4, p.c1];
    const x = value => map(value, 0, 1500, 78, 590);
    const y = value => map(value, 0, 48, 338, 78);
    let body = '';
    [0, 300, 600, 900, 1200, 1500].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='78' x2='${x(tick)}' y2='338'/><text class='s' x='${x(tick)}' y='359' text-anchor='middle'>${tick}</text>`);
    [0, 10, 20, 30, 40].forEach(tick => body += `<line class='g' x1='78' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='s' x='66' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    data.series.forEach((series, index) => {
      const points = data.steps.map((step, pointIndex) => [x(step), y(series.values[pointIndex])]);
      body += `<path d='${path(points)}' fill='none' stroke='${colors[index]}' stroke-width='2.7'/>`;
      points.forEach((point, pointIndex) => { if (pointIndex % 2 === 0) body += `<circle cx='${point[0]}' cy='${point[1]}' r='3.4' fill='${colors[index]}'/>`; });
      body += `<line x1='${118 + index * 145}' y1='70' x2='${138 + index * 145}' y2='70' stroke='${colors[index]}' stroke-width='2.7'/><text class='l' x='${144 + index * 145}' y='74'>${esc(series.label)}</text>`;
    });
    const arrowY = y(data.match.score) - 12;
    const candidateX = x(data.match.candidateStep);
    const referenceX = x(data.match.referenceStep);
    body += `<line x1='${candidateX}' y1='${arrowY}' x2='${referenceX}' y2='${arrowY}' stroke='${p.ink}' stroke-width='2'/><path d='M ${candidateX} ${arrowY} l 8 -5 v 10 Z M ${referenceX} ${arrowY} l -8 -5 v 10 Z' fill='${p.ink}'/><line x1='${candidateX}' y1='${arrowY - 8}' x2='${candidateX}' y2='${y(data.match.score) + 8}' stroke='${p.ink}' stroke-dasharray='3 3'/><line x1='${referenceX}' y1='${arrowY - 8}' x2='${referenceX}' y2='${y(data.match.score) + 8}' stroke='${p.ink}' stroke-dasharray='3 3'/><text class='v' x='${(candidateX + referenceX) / 2}' y='${arrowY - 8}' text-anchor='middle'>${data.match.speedup.toFixed(1)}× fewer steps</text>`;
    body += `<text class='s' x='332' y='386' text-anchor='middle'>RL training step →</text><text class='s' x='18' y='218' text-anchor='middle' transform='rotate(-90 18 218)'>AIME avg@32 ↑</text>`;
    return frame(entry, body);
  }

  function agreementResidualPair(entry) {
    const p = entry.palette;
    let body = '';
    entry.data.panels.forEach((panel, panelIndex) => {
      const x0 = 34 + panelIndex * 303;
      const y0 = 78;
      const size = 260;
      const x = value => map(value, 0, 1, x0 + 30, x0 + size - 12);
      const y = value => map(value, 0, 1, y0 + size - 25, y0 + 27);
      body += `<rect x='${x0}' y='${y0}' width='${size}' height='${size}' fill='${p.c4}' fill-opacity='.025' stroke='${p.grid}'/><text class='v' x='${x0 + 12}' y='${y0 + 17}'>${esc(panel.label)}</text>`;
      [.25, .5, .75].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='${y0 + 27}' x2='${x(tick)}' y2='${y0 + size - 25}'/><line class='g' x1='${x0 + 30}' y1='${y(tick)}' x2='${x0 + size - 12}' y2='${y(tick)}'/>`);
      body += `<line x1='${x(0)}' y1='${y(0)}' x2='${x(1)}' y2='${y(1)}' stroke='${p.c1}' stroke-width='2' stroke-dasharray='6 4'/>`;
      for (let index = 0; index < panel.count; index++) {
        const probability = ((index * 37) % panel.count) / (panel.count - 1);
        const wave = (Math.sin((index + 1) * 4.17) + .55 * Math.sin((index + 1) * 9.31)) / 1.55;
        const stripe = index % 23 === 0 ? panel.residual * 1.8 : 0;
        const training = clamp(probability + wave * panel.residual * (.35 + .65 * Math.sin(Math.PI * probability)) + stripe, 0, 1);
        const error = Math.abs(training - probability);
        body += `<circle cx='${x(probability)}' cy='${y(training)}' r='2.2' fill='${error > panel.residual * .85 ? p.c3 : p.c4}' fill-opacity='${error > panel.residual * .85 ? .82 : .48}'/>`;
      }
      body += `<rect x='${x0 + size - 102}' y='${y0 + size - 49}' width='90' height='20' fill='${p.bg}' stroke='${p.grid}'/><text class='s' x='${x0 + size - 57}' y='${y0 + size - 36}' text-anchor='middle'>r = ${panel.correlation}</text>`;
      body += `<text class='s' x='${x0 + size / 2}' y='${y0 + size + 18}' text-anchor='middle'>inference probability →</text>`;
    });
    body += `<text class='s' x='16' y='210' text-anchor='middle' transform='rotate(-90 16 210)'>training probability ↑</text><circle cx='223' cy='378' r='4' fill='${p.c4}' fill-opacity='.55'/><text class='l' x='233' y='382'>low residual</text><circle cx='361' cy='378' r='4' fill='${p.c3}'/><text class='l' x='371' y='382'>large residual</text>`;
    return frame(entry, body);
  }

  function curriculumCounterfactualPanels(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 82;
    const width = 500;
    let body = '';

    const top = { y0: 75, height: 124, min: 74, max: 85 };
    const tx = index => map(index, 0, data.difficulty.steps.length - 1, x0, x0 + width);
    const ty = value => map(value, top.min, top.max, top.y0 + top.height, top.y0);
    const switchX = tx(data.difficulty.switchIndex);
    body += `<rect x='${x0}' y='${top.y0}' width='${switchX - x0}' height='${top.height}' fill='${p.c6}' fill-opacity='.05'/><rect x='${switchX}' y='${top.y0}' width='${x0 + width - switchX}' height='${top.height}' fill='${p.c1}' fill-opacity='.045'/><text class='v' x='${x0}' y='${top.y0 - 7}'>DIFFICULTY SWITCH · AIME24</text><text class='s' x='${(x0 + switchX) / 2}' y='${top.y0 + 14}' text-anchor='middle'>STAGE 1 · moderate</text><text class='s' x='${(switchX + x0 + width) / 2}' y='${top.y0 + 14}' text-anchor='middle'>STAGE 2 · extreme branch</text>`;
    [76, 80, 84].forEach(tick => body += `<line class='g' x1='${x0}' y1='${ty(tick)}' x2='${x0 + width}' y2='${ty(tick)}'/><text class='s' x='${x0 - 12}' y='${ty(tick) + 3}' text-anchor='end'>${tick}</text>`);
    const moderatePoints = data.difficulty.moderate.map((value, index) => [tx(index), ty(value)]);
    const extremePoints = data.difficulty.extreme.map((value, index) => value == null ? null : [tx(index), ty(value)]).filter(Boolean);
    body += `<path d='${path(moderatePoints)}' fill='none' stroke='${p.c3}' stroke-width='2.5'/><path d='${path(extremePoints)}' fill='none' stroke='${p.c1}' stroke-width='3'/><line x1='${switchX}' y1='${top.y0}' x2='${switchX}' y2='${top.y0 + top.height}' stroke='${p.c4}' stroke-dasharray='5 3'/>`;
    moderatePoints.forEach(point => { body += `<circle cx='${point[0]}' cy='${point[1]}' r='2.8' fill='${p.c3}'/>`; });
    extremePoints.forEach(point => { body += `<rect x='${point[0] - 3}' y='${point[1] - 3}' width='6' height='6' fill='${p.c1}'/>`; });
    body += `<text class='v' x='${extremePoints.at(-1)[0] - 4}' y='${extremePoints.at(-1)[1] - 8}' text-anchor='end'>${data.difficulty.extreme.at(-1)}%</text>`;

    const bottom = { y0: 236, height: 116, min: 60, max: 85 };
    const bx = index => map(index, 0, data.context.steps.length - 1, x0, x0 + width);
    const by = value => map(value, bottom.min, bottom.max, bottom.y0 + bottom.height, bottom.y0);
    let stageStart = 0;
    data.context.stages.forEach((stage, index) => {
      const startX = bx(stageStart);
      const endX = bx(stage.endIndex);
      body += `<rect x='${startX}' y='${bottom.y0}' width='${Math.max(1, endX - startX)}' height='${bottom.height}' fill='${[p.c4, p.c5, p.c3, p.c2][index]}' fill-opacity='.045'/><text class='s' x='${(startX + endX) / 2}' y='${bottom.y0 + 14}' text-anchor='middle'>${esc(stage.label)}</text>`;
      if (index) body += `<line x1='${startX}' y1='${bottom.y0}' x2='${startX}' y2='${bottom.y0 + bottom.height}' stroke='${p.muted}' stroke-dasharray='4 3'/>`;
      stageStart = stage.endIndex;
    });
    body += `<text class='v' x='${x0}' y='${bottom.y0 - 7}'>OUTPUT-LENGTH CURRICULUM · SINGLE VS MULTI-STAGE</text>`;
    [65, 75, 85].forEach(tick => body += `<line class='g' x1='${x0}' y1='${by(tick)}' x2='${x0 + width}' y2='${by(tick)}'/><text class='s' x='${x0 - 12}' y='${by(tick) + 3}' text-anchor='end'>${tick}</text>`);
    const single = data.context.single.map((value, index) => [bx(index), by(value)]);
    const multi = data.context.multi.map((value, index) => [bx(index), by(value)]);
    body += `<path d='${path(single)}' fill='none' stroke='${p.c3}' stroke-width='2.7'/><path d='${path(multi)}' fill='none' stroke='${p.c1}' stroke-width='2.7'/>`;
    body += `<text class='v' x='${single.at(-1)[0] - 5}' y='${single.at(-1)[1] - 7}' text-anchor='end'>single ${data.context.single.at(-1)}%</text><text class='v' x='${multi.at(-1)[0] - 5}' y='${multi.at(-1)[1] + 15}' text-anchor='end'>multi ${data.context.multi.at(-1)}%</text>`;
    body += `<line x1='178' y1='378' x2='198' y2='378' stroke='${p.c3}' stroke-width='2.5'/><text class='l' x='204' y='382'>baseline / single-stage</text><line x1='376' y1='378' x2='396' y2='378' stroke='${p.c1}' stroke-width='2.5'/><text class='l' x='402' y='382'>intervention / multi-stage</text>`;
    return frame(entry, body);
  }

  function unknownParameterFrontier(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 1100, 82, 478);
    const y = value => map(value, 34, 72, 335, 82);
    const unknownX = 558;
    let body = '';
    [0, 250, 500, 750, 1000].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='82' x2='${x(tick)}' y2='335'/><text class='s' x='${x(tick)}' y='357' text-anchor='middle'>${tick}</text>`);
    [40, 50, 60, 70].forEach(tick => body += `<line class='g' x1='82' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='s' x='70' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    const frontier = data.frontier.map(point => [x(point[0]), y(point[1])]);
    body += `<path d='M ${x(0)} ${y(50)} ${path(frontier).replace(/^M /, 'L ')} L ${x(0)} ${y(72)} Z' fill='${p.c1}' fill-opacity='.12'/><path d='${path(frontier)}' fill='none' stroke='${p.c1}' stroke-width='2.5' stroke-dasharray='6 3'/>`;
    body += `<rect x='522' y='82' width='68' height='253' fill='${p.c6}' fill-opacity='.06'/><line x1='${unknownX}' y1='82' x2='${unknownX}' y2='335' stroke='${p.muted}' stroke-dasharray='4 3'/><text class='s' x='${unknownX}' y='72' text-anchor='middle'>UNDISCLOSED</text>`;
    data.known.forEach((item, index) => {
      const px = x(item.parameters);
      const py = y(item.score);
      const color = item.frontier ? p.c1 : [p.c4, p.c2, p.c5, p.c6][index % 4];
      body += `<circle cx='${px}' cy='${py}' r='${item.frontier ? 7 : 5}' fill='${color}' stroke='${p.bg}' stroke-width='2'/><text class='v' x='${px + item.dx}' y='${py + item.dy}' text-anchor='${item.dx < 0 ? 'end' : 'start'}'>${esc(item.label)}</text>`;
    });
    data.unknown.forEach((item, index) => {
      const py = y(item.score);
      body += `<rect x='${unknownX - 5}' y='${py - 5}' width='10' height='10' transform='rotate(45 ${unknownX} ${py})' fill='${[p.c3, p.c4, p.c2][index]}'/><text class='s' x='${unknownX - 10}' y='${py + 3}' text-anchor='end'>${esc(item.label)}</text>`;
    });
    body += `<path d='M 492 331 l 7 8 l 7 -8 l 7 8' fill='none' stroke='${p.ink}' stroke-width='2'/><text class='s' x='322' y='386' text-anchor='middle'>known model parameters (B) →</text><text class='s' x='18' y='216' text-anchor='middle' transform='rotate(-90 18 216)'>SWE-bench Verified ↑</text>`;
    return frame(entry, body);
  }

  Object.assign(renderers, {
    isoflopGapFacets,
    throughputCliffLines,
    hierarchicalCoverageSunburst,
    matchedQualitySpeedup,
    agreementResidualPair,
    curriculumCounterfactualPanels,
    unknownParameterFrontier
  });

  add('gemini-small-multiples', {
    id: 'minimax-isoflop-gaps', name: 'Isoflop Equal-Quality Gaps', chartLabel: 'MoE vs dense · equal-quality compute gaps', family: '亚洲模型实验室', sourceKey: 'minimax01', visualSystem: 'VS-65 MiniMax isoflop gap facets', grammar: 'benchmark 小多图双拟合曲线 + 等性能水平桥 + 两端算力垂线与倍率', renderer: 'isoflopGapFacets', palette: minimaxPalette,
    description: '复现 MiniMax-01 Figure 4：在多个 benchmark 中，以同一性能水平反查 MoE 与 dense 所需算力差。', useWhen: '适合回答“达到同一质量要多少 compute”；不同训练 token 或激活参数设置不可混在同一桥线。', tags: ['minimax', 'moe', 'isoflop', 'compute-gap'],
    evidence: { locator: 'Figure 4', page: 5, verifiedAt: '2026-07-12', summary: '五个 benchmark facet 比较 2B-active MoE 与 7B dense 的等性能算力差。' },
    data: { facets: [
      { label: 'HellaSwag', min: 54, max: 74, target: 70, moeMatch: 3.4, denseMatch: 10.2, moe: [[.5, 58], [1.2, 63], [2.1, 67], [3.4, 70], [4.2, 72]], dense: [[.5, 55], [2, 60], [5, 66], [9, 69], [13, 72]] },
      { label: 'WinoGrande', min: 56, max: 69, target: 65, moeMatch: 3.1, denseMatch: 9.6, moe: [[.5, 58], [1.3, 61], [2.2, 63], [3.1, 65], [4.1, 66]], dense: [[.5, 57], [2.5, 60], [5.5, 63], [9.6, 65], [13, 67]] },
      { label: 'Natural Questions', min: 5, max: 16, target: 13, moeMatch: 3.7, denseMatch: 11.6, moe: [[.5, 7], [1.3, 9], [2.3, 11], [3.7, 13], [4.4, 15]], dense: [[.5, 6], [2.8, 8.5], [6, 10], [9, 11], [11.6, 13], [13.5, 14.5]] },
      { label: 'PIQA', min: 70, max: 80, target: 77, moeMatch: 2.8, denseMatch: 11.8, moe: [[.5, 73], [1.2, 75], [2, 76], [2.8, 77], [3.8, 79]], dense: [[.5, 71.5], [3, 74], [6, 75], [9, 76], [11.8, 77], [13.5, 77.4]] }
    ] }
  });

  add('grok-latency-ridges', {
    id: 'minimax-attention-throughput-cliff', name: 'Attention Throughput Cliff', chartLabel: 'Training throughput · sequence-length pressure test', family: '亚洲模型实验室', sourceKey: 'minimax01', visualSystem: 'VS-66 MiniMax throughput cliff', grammar: 'log sequence 横轴多机制吞吐线 + 末端 OOM 叉标 + 长上下文保持率直读', renderer: 'throughputCliffLines', palette: Object.assign({}, minimaxPalette, { bg: '#fffdf9', c1: '#ef5b4d', c3: '#e08b20' }),
    description: '复现 MiniMax-01 Figure 8：比较 softmax、lightning、hybrid 与其他线性 attention 在序列拉长时的吞吐和 OOM 边界。', useWhen: '适合统一 GPU、并行度和 batch 条件下的长序列压力测试；不可跨硬件比较绝对吞吐。', tags: ['minimax', 'attention', 'throughput', 'oom'],
    evidence: { locator: 'Figure 8', page: 10, verifiedAt: '2026-07-12', summary: '五种 attention 机制在 1K-65K 序列长度下的 token/GPU/s 曲线。' },
    data: { lengths: [1024, 2048, 4096, 8192, 16384, 32768, 65536], series: [
      { label: 'Hybrid-lightning', values: [16200, 15900, 15700, 15300, 14600, 13800, 12900] },
      { label: 'Lightning', values: [15400, 15600, 15700, 15100, 15000, 15400, 15700] },
      { label: 'Softmax', values: [16600, 15800, 14500, 12700, 10100, 6800, null], oomAt: 65536 },
      { label: 'HGRN2', values: [14300, 14200, 14100, 14000, 13900, 14200, 14500] },
      { label: 'Mamba2', values: [12900, 13000, 12900, 12800, 12800, 13000, null], oomAt: 65536 }
    ] }
  });

  add('mmlu-domain-treemap', {
    id: 'minimax-data-taxonomy-sunburst', name: 'Instruction Coverage Sunburst', chartLabel: 'Hierarchical instruction-data coverage', family: '亚洲模型实验室', sourceKey: 'minimax01', visualSystem: 'VS-67 MiniMax hierarchical coverage wheel', grammar: '能力族内环占比 + 高频 instruction tag 外环分裂 + 中心样本口径', renderer: 'hierarchicalCoverageSunburst', palette: Object.assign({}, minimaxPalette, { bg: '#fffcf8' }),
    description: '复现 MiniMax-01 Figure 17 的两层层级结构，用能力大类和细粒度 tag 检查多模态数据覆盖。', useWhen: '适合训练集或评测集 taxonomy 覆盖审计；扇区面积只编码样本占比，不能替代质量评估。', tags: ['minimax', 'sunburst', 'taxonomy', 'data-coverage'],
    evidence: { locator: 'Figure 17', page: 36, verifiedAt: '2026-07-12', summary: '内层展示 14 个大类占比，外层展示各类 top instruction tags。' },
    data: { categories: [
      { label: 'TEXT QA', share: 30, tags: [{ label: 'retrieval', share: 17 }, { label: 'comprehension', share: 13 }] },
      { label: 'IMAGE QA', share: 22, tags: [{ label: 'VQA', share: 12 }, { label: 'captioning', share: 10 }] },
      { label: 'OBJECT', share: 16, tags: [{ label: 'detection', share: 9 }, { label: 'counting', share: 7 }] },
      { label: 'REASON', share: 13, tags: [{ label: 'spatial', share: 7 }, { label: 'causal', share: 6 }] },
      { label: 'DOCUMENT', share: 11, tags: [{ label: 'OCR', share: 7 }, { label: 'layout', share: 4 }] },
      { label: 'TOOLS', share: 8, tags: [{ label: 'code', share: 5 }, { label: 'agent', share: 3 }] }
    ] }
  });

  add('livecode-solve-curve', {
    id: 'minimax-m1-matched-quality-speedup', name: 'Matched-quality RL Speedup', chartLabel: 'RL algorithms · steps to matched quality', family: '亚洲模型实验室', sourceKey: 'minimaxM1', visualSystem: 'VS-68 MiniMax matched-quality speed arrow', grammar: '多算法训练轨迹 + 同分水平双向步数箭头 + 等质量 speedup 直标', renderer: 'matchedQualitySpeedup', palette: Object.assign({}, minimaxPalette, { bg: '#fffefe', c5: '#2c9860' }),
    description: '复现 MiniMax-M1 Figure 2：除最终分数外，直接比较 CISPO 与 DAPO 达到相同性能所需的训练步数。', useWhen: '适合算法训练效率对比；匹配点必须来自同一任务、模型底座、采样与评测协议。', tags: ['minimax', 'cispo', 'rl', 'speedup'],
    evidence: { locator: 'Figure 2', page: 6, verifiedAt: '2026-07-12', summary: 'GRPO、DAPO、CISPO 的 AIME avg@32 训练轨迹及 2x matched-quality speedup。' },
    data: { steps: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500], series: [
      { label: 'GRPO', values: [2, 10, 17, 20, 22, 21, 21, 22, 23, 22, 23, 24, 23, 24, 22, 23] },
      { label: 'DAPO', values: [2, 8, 15, 21, 21, 26, 24, 27, 29, 28, 31, 28, 32, 28, 33, 34] },
      { label: 'CISPO', values: [2, 9, 24, 26, 28, 33, 35, 36, 38, 42, 41, 44, 40, 42, 41, 39] }
    ], match: { score: 33, candidateStep: 500, referenceStep: 1000, speedup: 2 } }
  });

  add('openai-reliability', {
    id: 'minimax-m1-probability-agreement', name: 'Training–Inference Agreement Audit', chartLabel: 'Token probabilities · before and after numerical fix', family: '亚洲模型实验室', sourceKey: 'minimaxM1', visualSystem: 'VS-69 MiniMax paired residual agreement', grammar: '修复前/后概率散点对照 + y=x 精确线 + 残差强度编码 + 相关系数盒', renderer: 'agreementResidualPair', palette: Object.assign({}, minimaxPalette, { bg: '#fbfbff', c3: '#e8a52b', c4: '#4f62b8' }),
    description: '复现 MiniMax-M1 Figure 3：逐 token 检查 training-mode 与 inference-mode 概率在数值修复前后的对角一致性。', useWhen: '适合训练/服务实现一致性审计；高相关系数不能替代对尾部大残差和系统性偏移的检查。', tags: ['minimax', 'probability', 'agreement', 'numerics'],
    evidence: { locator: 'Figure 3', page: 8, verifiedAt: '2026-07-12', summary: 'FP32 output-head 修复前后，token 概率散点相对 y=x 的残差与 Pearson 相关性。' },
    data: { panels: [
      { label: 'BEFORE FIX', count: 160, residual: .145, correlation: .9873 },
      { label: 'AFTER FP32 FIX', count: 160, residual: .045, correlation: .9971 }
    ] }
  });

  add('arxiv-dual-axis', {
    id: 'glm-curriculum-counterfactuals', name: 'RL Curriculum Counterfactuals', chartLabel: 'Difficulty and output-length curriculum ablations', family: '亚洲模型实验室', sourceKey: 'glm45', visualSystem: 'VS-70 GLM curriculum counterfactual panels', grammar: '共享前缀难度分支面板 + 分段 context 背景的 single/multi-stage 反事实面板', renderer: 'curriculumCounterfactualPanels', palette: glmPalette,
    description: '合并复现 GLM-4.5 Figures 5-6：上层显示切换极难样本后的分叉，下层显示逐级 context 课程造成的不可逆落后。', useWhen: '适合课程学习与干预消融；阶段边界、样本池和最大输出长度必须随数据一同记录。', tags: ['glm', 'curriculum', 'rl', 'counterfactual'],
    evidence: { locator: 'Figures 5-6', page: 8, verifiedAt: '2026-07-12', summary: '难度课程切换与 16K→64K 多阶段输出长度课程的两组控制实验。' },
    data: {
      difficulty: { steps: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200], switchIndex: 7, moderate: [75, 76, 74.5, 77.5, 79, 78.2, 80.5, 81.8, 80.1, 81.0, 80.4, 80.2], extreme: [null, null, null, null, null, null, null, 81.8, 80.9, 82.2, 81.7, 83.4] },
      context: { steps: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200], stages: [{ label: '16K', endIndex: 3 }, { label: '32K', endIndex: 6 }, { label: '48K', endIndex: 9 }, { label: '64K', endIndex: 11 }], single: [75, 76, 77, 79, 80, 79, 81, 80, 82, 81, 82, 83.4], multi: [61, 65, 68, 71, 72, 73, 75, 74, 78, 79, 78.5, 80.6] }
    }
  });

  add('deepseek-price-pareto', {
    id: 'glm-parameter-frontier-unknown-lane', name: 'Known vs Undisclosed Parameter Frontier', chartLabel: 'SWE-bench quality vs known and undisclosed parameters', family: '亚洲模型实验室', sourceKey: 'glm45', visualSystem: 'VS-71 GLM mixed-domain parameter frontier', grammar: '连续参数 Pareto 区 + 断轴后的 undisclosed 垂直通道 + 前沿楔形与异形点', renderer: 'unknownParameterFrontier', palette: Object.assign({}, glmPalette, { bg: '#fbfdff' }),
    description: '复现 GLM-4.5 Figure 2：已知参数模型使用连续横轴，闭源且参数未披露的模型进入断轴后的专用通道。', useWhen: '适合参数效率比较又必须保留未披露模型时；未知参数点不可被放到虚构的连续坐标。', tags: ['glm', 'swe-bench', 'parameters', 'pareto'],
    evidence: { locator: 'Figure 2', page: 3, verifiedAt: '2026-07-12', summary: '开源模型按总参数定位，专有模型在右侧 Unknown 通道比较 SWE-bench Verified。' },
    data: {
      frontier: [[0, 51], [106, 57], [355, 64], [650, 72]],
      known: [
        { label: 'GLM-4.5-Air', parameters: 106, score: 57.2, frontier: true, dx: 10, dy: -8 },
        { label: 'GLM-4.5', parameters: 355, score: 64.2, frontier: true, dx: 10, dy: -9 },
        { label: 'MiniMax-M1', parameters: 456, score: 55.7, frontier: false, dx: 10, dy: 16 },
        { label: 'DeepSeek-R1', parameters: 671, score: 57.3, frontier: false, dx: 10, dy: -8 },
        { label: 'Qwen3', parameters: 235, score: 35.6, frontier: false, dx: 10, dy: -8 },
        { label: 'Kimi K2', parameters: 1043, score: 64.9, frontier: false, dx: -10, dy: -8 }
      ],
      unknown: [
        { label: 'Claude', score: 69.8 },
        { label: 'Gemini', score: 62.4 },
        { label: 'GPT-4.1', score: 54.8 }
      ]
    }
  });

  window.renderBenchmark = function renderBenchmark(entry) {
    const renderer = window.BENCHMARK_RENDERERS[entry.renderer];
    if (!renderer) throw new Error(`Missing renderer: ${entry.renderer}`);
    return renderer(entry).trim();
  };
})();
