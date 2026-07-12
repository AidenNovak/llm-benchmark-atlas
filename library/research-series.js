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
  const median = values => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };

  Object.assign(sources, {
    arenaPaper: { name: 'Chatbot Arena Paper', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2403.04132', note: '人类偏好、排名迁移与评审一致性' },
    longBenchPaper: { name: 'LongBench', type: 'arXiv 论文', url: 'https://arxiv.org/abs/2308.14508', note: '长上下文长度、深度与任务退化' },
    evalHarnessPaper: { name: 'Language Model Evaluation Harness', type: 'arXiv / 开源评测', url: 'https://arxiv.org/abs/2110.14168', note: 'benchmark 集合、任务交集与统一评测' },
    mtebPaper: { name: 'MTEB', type: 'arXiv / 独立评测', url: 'https://arxiv.org/abs/2210.07316', note: '多任务 embedding 评测与分布比较' }
  });

  function add(baseId, overrides) {
    const base = byId(baseId);
    if (!base) throw new Error(`Missing base component: ${baseId}`);
    const entry = Object.assign({}, base, clone(overrides));
    const source = sources[entry.sourceKey];
    if (source) Object.assign(entry, { source: source.name, sourceType: source.type, sourceUrl: source.url });
    components.push(entry);
  }

  function frame(entry, content) {
    const p = entry.palette;
    const id = entry.id.replace(/[^a-z0-9]/gi, '');
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
      <text class='s' x='28' y='48'>${esc(entry.source)}</text>
      <text class='s' x='612' y='30' text-anchor='end'>DEMO DATA</text>
      ${content}
    </svg>`;
  }

  function contextSparkRows(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = index => map(index, 0, data.lengths.length - 1, 188, 590);
    let body = '';
    data.lengths.forEach((label, index) => body += `<line class='g' x1='${x(index)}' y1='78' x2='${x(index)}' y2='344'/><text class='s' x='${x(index)}' y='367' text-anchor='middle'>${esc(label)}</text>`);
    data.models.forEach((model, rowIndex) => {
      const rowTop = 88 + rowIndex * 62;
      const y = value => map(value, 0, 100, rowTop + 45, rowTop);
      const color = [p.c1, p.c2, p.c3, p.c4][rowIndex];
      const points = model.values.map((value, index) => [x(index), y(value)]);
      body += `<text class='v' x='164' y='${rowTop + 25}' text-anchor='end'>${esc(model.label)}</text><path d='${path(points)}' fill='none' stroke='${color}' stroke-width='3'/>`;
      points.forEach((point, index) => body += `<circle cx='${point[0]}' cy='${point[1]}' r='5' fill='${p.bg}' stroke='${color}' stroke-width='2'/><text class='s' x='${point[0]}' y='${point[1] - 8}' text-anchor='middle'>${model.values[index]}</text>`);
    });
    return frame(entry, body);
  }

  function centeredWinBars(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 25, 75, 180, 590);
    let body = `<line x1='${x(50)}' y1='80' x2='${x(50)}' y2='344' stroke='${p.ink}' stroke-width='2'/><text class='s' x='${x(50)}' y='73' text-anchor='middle'>EVEN</text>`;
    [25, 35, 50, 65, 75].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='84' x2='${x(tick)}' y2='344'/><text class='l' x='${x(tick)}' y='366' text-anchor='middle'>${tick}%</text>`);
    data.items.forEach((item, index) => {
      const y = 105 + index * 50;
      const positive = item.value >= 50;
      const color = positive ? p.c1 : p.c2;
      const left = Math.min(x(50), x(item.value));
      const width = Math.abs(x(item.value) - x(50));
      body += `<text class='v' x='164' y='${y + 4}' text-anchor='end'>${esc(item.label)}</text><rect x='${left}' y='${y - 9}' width='${width}' height='18' fill='${color}' fill-opacity='.72'/><line x1='${x(item.low)}' y1='${y}' x2='${x(item.high)}' y2='${y}' stroke='${p.ink}' stroke-width='2'/><line x1='${x(item.low)}' y1='${y - 5}' x2='${x(item.low)}' y2='${y + 5}' stroke='${p.ink}'/><line x1='${x(item.high)}' y1='${y - 5}' x2='${x(item.high)}' y2='${y + 5}' stroke='${p.ink}'/><circle cx='${x(item.value)}' cy='${y}' r='6' fill='${color}'/><text class='v' x='${x(item.value) + (positive ? 10 : -10)}' y='${y - 12}' text-anchor='${positive ? 'start' : 'end'}'>${item.value}%</text>`;
    });
    return frame(entry, body);
  }

  function divergingOutcomeStrips(entry) {
    const p = entry.palette;
    const data = entry.data;
    const center = 340;
    const scale = 4.1;
    let body = `<line x1='${center}' y1='80' x2='${center}' y2='345' stroke='${p.ink}' stroke-width='2'/><text class='s' x='${center}' y='72' text-anchor='middle'>TIE CENTER</text>`;
    data.items.forEach((item, index) => {
      const y = 99 + index * 50;
      const lossW = item.loss * scale;
      const tieW = item.tie * scale;
      const winW = item.win * scale;
      body += `<text class='v' x='142' y='${y + 15}' text-anchor='end'>${esc(item.label)}</text><rect x='${center - tieW / 2 - lossW}' y='${y}' width='${lossW}' height='24' fill='${p.c1}' fill-opacity='.82'/><rect x='${center - tieW / 2}' y='${y}' width='${tieW}' height='24' fill='${p.c3}' fill-opacity='.48'/><rect x='${center + tieW / 2}' y='${y}' width='${winW}' height='24' fill='${p.c2}' fill-opacity='.86'/><text class='s' x='${center - tieW / 2 - lossW / 2}' y='${y + 16}' text-anchor='middle'>${item.loss}</text><text class='s' x='${center + tieW / 2 + winW / 2}' y='${y + 16}' text-anchor='middle'>${item.win}</text>`;
    });
    body += `<rect x='176' y='369' width='13' height='9' fill='${p.c1}'/><text class='l' x='195' y='377'>loss</text><rect x='275' y='369' width='13' height='9' fill='${p.c3}' fill-opacity='.5'/><text class='l' x='294' y='377'>tie</text><rect x='365' y='369' width='13' height='9' fill='${p.c2}'/><text class='l' x='384' y='377'>win</text>`;
    return frame(entry, body);
  }

  function moeActivationRails(entry) {
    const p = entry.palette;
    const data = entry.data;
    const maxTotal = Math.max(...data.items.map(item => item.total));
    let body = '';
    data.items.forEach((item, index) => {
      const y = 96 + index * 63;
      const totalW = map(item.total, 0, maxTotal, 0, 350);
      const activeW = map(item.active, 0, maxTotal, 0, 350);
      const scoreX = map(item.score, 50, 95, 458, 590);
      body += `<text class='v' x='148' y='${y + 17}' text-anchor='end'>${esc(item.label)}</text><rect x='166' y='${y}' width='${totalW}' height='31' rx='15' fill='${p.c5}' fill-opacity='.2' stroke='${p.c1}'/><rect x='166' y='${y + 7}' width='${Math.max(10, activeW)}' height='17' rx='8' fill='${p.c1}'/><text class='s' x='${166 + totalW + 8}' y='${y + 19}'>${item.active} / ${item.total}B</text><line x1='458' y1='${y + 15}' x2='590' y2='${y + 15}' stroke='${p.grid}'/><circle cx='${scoreX}' cy='${y + 15}' r='7' fill='${p.c2}'/><text class='v' x='${scoreX}' y='${y - 4}' text-anchor='middle'>${item.score}</text>`;
    });
    body += `<text class='s' x='166' y='371'>inner = active parameters · outer = total parameters</text><text class='s' x='525' y='371' text-anchor='middle'>benchmark score</text>`;
    return frame(entry, body);
  }

  function contextContour(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 174;
    const y0 = 90;
    const cw = 78;
    const rh = 48;
    let body = '';
    data.lengths.forEach((label, index) => body += `<text class='s' x='${x0 + index * cw + 36}' y='80' text-anchor='middle'>${esc(label)}</text>`);
    data.depths.forEach((label, rowIndex) => {
      body += `<text class='v' x='155' y='${y0 + rowIndex * rh + 29}' text-anchor='end'>${esc(label)}</text>`;
      data.values[rowIndex].forEach((value, colIndex) => {
        const opacity = map(value, 30, 100, .12, .96);
        body += `<rect x='${x0 + colIndex * cw}' y='${y0 + rowIndex * rh}' width='${cw - 4}' height='${rh - 4}' fill='${p.c1}' fill-opacity='${opacity}'/><text x='${x0 + colIndex * cw + 37}' y='${y0 + rowIndex * rh + 27}' text-anchor='middle' style='font:700 10px ui-sans-serif;fill:${opacity > .55 ? '#fff' : p.ink}'>${value}</text>`;
      });
    });
    body += `<path d='M 174 261 C 250 240, 310 222, 382 198 S 500 146, 558 132' fill='none' stroke='${p.c2}' stroke-width='3'/><path d='M 174 305 C 250 292, 330 268, 402 240 S 510 202, 558 186' fill='none' stroke='${p.c3}' stroke-width='2' stroke-dasharray='6 4'/><text class='s' x='575' y='130'>80 iso</text><text class='s' x='575' y='184'>60 iso</text><text class='s' x='366' y='372' text-anchor='middle'>context length → · needle depth ↓</text>`;
    return frame(entry, body);
  }

  function phaseLadder(entry) {
    const p = entry.palette;
    const data = entry.data;
    let body = `<path d='M 64 325 H 170 V 270 H 276 V 215 H 382 V 160 H 488 V 105 H 594' fill='none' stroke='${p.grid}' stroke-width='16' stroke-linejoin='round'/>`;
    data.stages.forEach((stage, index) => {
      const x = 76 + index * 106;
      const y = 292 - index * 55;
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5][index];
      body += `<rect x='${x}' y='${y}' width='84' height='46' rx='4' fill='${color}' fill-opacity='.88'/><text x='${x + 42}' y='${y + 19}' text-anchor='middle' style='font:700 10px ui-sans-serif;fill:${p.bg}'>${esc(stage.label)}</text><text x='${x + 42}' y='${y + 35}' text-anchor='middle' style='font:700 13px ui-sans-serif;fill:${p.bg}'>${stage.score}</text>`;
      if (index < data.stages.length - 1) body += `<text class='v' x='${x + 94}' y='${y - 8}' fill='${p.c1}'>+${data.stages[index + 1].score - stage.score}</text>`;
    });
    body += `<text class='s' x='320' y='374' text-anchor='middle'>post-training stage → cumulative benchmark reward</text>`;
    return frame(entry, body);
  }

  function latencyRangeBands(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 4, 190, 584);
    let body = '';
    [0, 1, 2, 3, 4].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='82' x2='${x(tick)}' y2='345'/><text class='l' x='${x(tick)}' y='368' text-anchor='middle'>${tick}s</text>`);
    data.items.forEach((item, index) => {
      const y = 104 + index * 50;
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5][index];
      body += `<text class='v' x='170' y='${y + 4}' text-anchor='end'>${esc(item.label)}</text><line x1='${x(item.p50)}' y1='${y}' x2='${x(item.p95)}' y2='${y}' stroke='${color}' stroke-width='12' stroke-linecap='round' stroke-opacity='.38'/><circle cx='${x(item.p50)}' cy='${y}' r='7' fill='${color}'/><circle cx='${x(item.p95)}' cy='${y}' r='6' fill='${p.bg}' stroke='${color}' stroke-width='3'/><circle cx='${x(item.p50)}' cy='${y}' r='${map(item.quality, 60, 95, 4, 13)}' fill='none' stroke='${color}' stroke-width='2'/><text class='s' x='${x(item.p95) + 10}' y='${y + 4}'>q${item.quality}</text>`;
    });
    body += `<text class='s' x='338' y='387' text-anchor='middle'>filled = p50 · open = p95 · ring size = quality</text>`;
    return frame(entry, body);
  }

  function generationArrows(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 40, 180, 72, 590);
    const y = value => map(value, 60, 95, 336, 88);
    let body = '';
    [40, 80, 120, 160].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='88' x2='${x(tick)}' y2='336'/><text class='l' x='${x(tick)}' y='360' text-anchor='middle'>${tick}</text>`);
    [60, 70, 80, 90].forEach(tick => body += `<line class='g' x1='72' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='61' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    data.items.forEach((item, index) => {
      const color = [p.c1, p.c2, p.c3, p.c4][index];
      const a = [x(item.before[0]), y(item.before[1])];
      const b = [x(item.after[0]), y(item.after[1])];
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const left = [b[0] - Math.cos(angle - .55) * 11, b[1] - Math.sin(angle - .55) * 11];
      const right = [b[0] - Math.cos(angle + .55) * 11, b[1] - Math.sin(angle + .55) * 11];
      body += `<line x1='${a[0]}' y1='${a[1]}' x2='${b[0]}' y2='${b[1]}' stroke='${color}' stroke-width='4'/><path d='M ${b[0]} ${b[1]} L ${left[0]} ${left[1]} L ${right[0]} ${right[1]} Z' fill='${color}'/><circle cx='${a[0]}' cy='${a[1]}' r='6' fill='${p.bg}' stroke='${color}' stroke-width='2'/><text class='v' x='${b[0] + 9}' y='${b[1] - 10}'>${esc(item.label)}</text>`;
    });
    body += `<text class='s' x='330' y='387' text-anchor='middle'>generation speed →</text><text class='s' x='18' y='220' text-anchor='middle' transform='rotate(-90 18 220)'>quality →</text>`;
    return frame(entry, body);
  }

  function upsetPlot(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = index => 226 + index * 61;
    const barY = value => map(value, 0, Math.max(...data.sets.map(set => set.count)), 190, 84);
    let body = '';
    data.sets.forEach((set, index) => {
      const xx = x(index);
      const top = barY(set.count);
      body += `<rect x='${xx - 17}' y='${top}' width='34' height='${190 - top}' fill='${index === 0 ? p.c1 : p.c3}'/><text class='v' x='${xx}' y='${top - 7}' text-anchor='middle'>${set.count}</text>`;
      const active = set.members;
      data.benchmarks.forEach((label, rowIndex) => {
        const yy = 231 + rowIndex * 31;
        body += `<circle cx='${xx}' cy='${yy}' r='6' fill='${active.includes(rowIndex) ? p.ink : p.grid}'/>`;
      });
      if (active.length > 1) body += `<line x1='${xx}' y1='${231 + Math.min(...active) * 31}' x2='${xx}' y2='${231 + Math.max(...active) * 31}' stroke='${p.ink}' stroke-width='3'/>`;
    });
    data.benchmarks.forEach((label, index) => body += `<text class='v' x='198' y='${235 + index * 31}' text-anchor='end'>${esc(label)}</text><line class='g' x1='208' y1='${231 + index * 31}' x2='602' y2='${231 + index * 31}'/>`);
    body += `<text class='s' x='125' y='126' text-anchor='middle'>intersection size ↑</text><text class='s' x='410' y='378' text-anchor='middle'>benchmark membership combinations</text>`;
    return frame(entry, body);
  }

  function alluvialRanks(entry) {
    const p = entry.palette;
    const data = entry.data;
    const xs = [118, 320, 522];
    const y = rank => map(rank, 1, data.items.length, 98, 324);
    let body = '';
    data.periods.forEach((period, index) => body += `<text class='s' x='${xs[index]}' y='76' text-anchor='middle'>${esc(period)}</text><line class='g' x1='${xs[index]}' y1='88' x2='${xs[index]}' y2='338'/>`);
    data.items.forEach((item, index) => {
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5][index];
      const points = item.ranks.map((rank, periodIndex) => [xs[periodIndex], y(rank)]);
      body += `<path d='M ${points[0][0]} ${points[0][1]} C 190 ${points[0][1]}, 245 ${points[1][1]}, ${points[1][0]} ${points[1][1]} C 390 ${points[1][1]}, 450 ${points[2][1]}, ${points[2][0]} ${points[2][1]}' fill='none' stroke='${color}' stroke-width='12' stroke-opacity='.34'/><circle cx='${points[0][0]}' cy='${points[0][1]}' r='8' fill='${color}'/><circle cx='${points[1][0]}' cy='${points[1][1]}' r='8' fill='${color}'/><circle cx='${points[2][0]}' cy='${points[2][1]}' r='8' fill='${color}'/><text class='v' x='${points[2][0] + 14}' y='${points[2][1] + 4}'>${esc(item.label)}</text>`;
    });
    return frame(entry, body);
  }

  function raincloud(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 30, 95, 172, 590);
    let body = '';
    [30, 50, 70, 90].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='80' x2='${x(tick)}' y2='344'/><text class='l' x='${x(tick)}' y='367' text-anchor='middle'>${tick}</text>`);
    data.groups.forEach((group, groupIndex) => {
      const cy = 112 + groupIndex * 69;
      const sorted = [...group.values].sort((a, b) => a - b);
      const center = median(sorted);
      const cloud = sorted.map((value, index) => [x(value), cy - (Math.sin(Math.PI * index / (sorted.length - 1)) * 25 + 3)]);
      const color = [p.c1, p.c2, p.c3, p.c4][groupIndex];
      body += `<text class='v' x='151' y='${cy + 5}' text-anchor='end'>${esc(group.label)}</text><path d='M ${cloud[0][0]} ${cy} ${path(cloud).replace(/^M /, 'L ')} L ${cloud.at(-1)[0]} ${cy} Z' fill='${color}' fill-opacity='.25' stroke='${color}' stroke-width='2'/><line x1='${x(sorted[2])}' y1='${cy + 9}' x2='${x(sorted.at(-3))}' y2='${cy + 9}' stroke='${color}' stroke-width='8' stroke-linecap='round'/><line x1='${x(center)}' y1='${cy + 2}' x2='${x(center)}' y2='${cy + 16}' stroke='${p.ink}' stroke-width='3'/>`;
      sorted.forEach((value, index) => body += `<circle cx='${x(value)}' cy='${cy + 25 + ((index * 7) % 15)}' r='3.5' fill='${color}' fill-opacity='.68'/>`);
    });
    return frame(entry, body);
  }

  function ternaryPlot(entry) {
    const p = entry.palette;
    const data = entry.data;
    const a = [110, 332];
    const b = [530, 332];
    const c = [320, 84];
    const point = values => [
      (values[0] * a[0] + values[1] * b[0] + values[2] * c[0]) / 100,
      (values[0] * a[1] + values[1] * b[1] + values[2] * c[1]) / 100
    ];
    let body = `<path d='M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]} Z' fill='none' stroke='${p.ink}' stroke-width='2'/>`;
    [20, 40, 60, 80].forEach(level => {
      const t = level / 100;
      const p1 = [a[0] * (1 - t) + c[0] * t, a[1] * (1 - t) + c[1] * t];
      const p2 = [b[0] * (1 - t) + c[0] * t, b[1] * (1 - t) + c[1] * t];
      body += `<line class='g' x1='${p1[0]}' y1='${p1[1]}' x2='${p2[0]}' y2='${p2[1]}'/>`;
    });
    body += `<text class='v' x='90' y='354'>COST</text><text class='v' x='550' y='354'>SPEED</text><text class='v' x='320' y='72' text-anchor='middle'>QUALITY</text>`;
    data.items.forEach((item, index) => {
      const position = point(item.values);
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5][index];
      body += `<circle cx='${position[0]}' cy='${position[1]}' r='9' fill='${color}'/><text class='v' x='${position[0] + 11}' y='${position[1] - 9}'>${esc(item.label)}</text>`;
    });
    body += `<text class='s' x='320' y='382' text-anchor='middle'>each point sums to 100% preference weight</text>`;
    return frame(entry, body);
  }

  Object.assign(renderers, {
    contextSparkRows,
    centeredWinBars,
    divergingOutcomeStrips,
    moeActivationRails,
    contextContour,
    phaseLadder,
    latencyRangeBands,
    generationArrows,
    upsetPlot,
    alluvialRanks,
    raincloud,
    ternaryPlot
  });

  add('claude-error-forest', {
    id: 'claude-mrcr-context-rows', name: 'MRCR Context Spark Rows', chartLabel: 'Long-context retrieval · aligned model rows', family: '厂商发布复现系列', visualSystem: 'VS-49 Claude MRCR row traces', grammar: '模型分行 sparkline + 共享 context 横轴 + 每点直接分数', renderer: 'contextSparkRows',
    description: '复现 Claude 长上下文发布图的 MRCR 叙事，把每个模型放在独立行中避免曲线交叉遮挡。', useWhen: '适合模型数少、context 档位多且需要逐点读数的 MRCR 或 needle 评测。', tags: ['claude', 'mrcr', 'context'],
    data: { lengths: ['4k', '16k', '64k', '256k', '1m'], models: [{ label: 'Opus', values: [98, 96, 92, 86, 74] }, { label: 'Sonnet', values: [97, 93, 87, 76, 61] }, { label: 'Gemini', values: [96, 92, 85, 79, 69] }, { label: 'GPT', values: [94, 89, 81, 68, 52] }] }
  });

  add('openai-reliability', {
    id: 'openai-expert-winrate', name: 'Expert Preference Win-rate', chartLabel: 'Expert preference against baseline', family: '厂商发布复现系列', visualSystem: 'VS-50 OpenAI centered preference', grammar: '50% 中心胜率柱 + 双侧方向 + 置信区间 whisker', renderer: 'centeredWinBars',
    description: '复现 OpenAI 面向专家评审的胜率图，以 50% 为中性中心并保留置信区间。', useWhen: '适合成对偏好评审；必须显示评审样本量和区间方法。', tags: ['openai', 'preference', 'experts'],
    data: { items: [{ label: 'Coding', value: 66, low: 62, high: 70 }, { label: 'Science', value: 61, low: 57, high: 65 }, { label: 'Writing', value: 55, low: 51, high: 59 }, { label: 'Search', value: 48, low: 44, high: 52 }, { label: 'Math', value: 69, low: 65, high: 73 }] }
  });

  add('cohere-capability-glyphs', {
    id: 'cohere-outcome-strips', name: 'Enterprise Win–Tie–Loss Strips', chartLabel: 'Command A vs baseline · task outcomes', family: '厂商发布复现系列', visualSystem: 'VS-51 Cohere outcome strips', grammar: '以 tie 为中心的 100% 发散堆叠条 + win/loss 双向标签', renderer: 'divergingOutcomeStrips',
    description: '复现 Cohere 企业评测中的 win-rate 叙事，同时保留 tie 和 loss，而不是只报胜率。', useWhen: '适合成对人工或 judge 比较，并且每行三类结果总和为 100。', tags: ['cohere', 'win-tie-loss', 'enterprise'],
    data: { items: [{ label: 'RAG', win: 62, tie: 18, loss: 20 }, { label: 'SQL', win: 57, tie: 21, loss: 22 }, { label: 'Tools', win: 65, tie: 17, loss: 18 }, { label: 'Agents', win: 54, tie: 24, loss: 22 }, { label: 'Instruction', win: 59, tie: 20, loss: 21 }] }
  });

  add('qwen-thinking-budget', {
    id: 'qwen-moe-activation-rails', name: 'MoE Activation Rails', chartLabel: 'Total vs active parameters · quality rail', family: '厂商发布复现系列', visualSystem: 'VS-52 Qwen MoE nested rails', grammar: '总参数外胶囊 + 激活参数内胶囊 + 右侧 benchmark 点轴', renderer: 'moeActivationRails',
    description: '把 MoE 的总参数和每 token 激活参数分开编码，并在同一行保留质量得分。', useWhen: '适合 MoE 家族说明规模与实际推理负载的差别。', tags: ['qwen', 'moe', 'active-parameters'],
    data: { items: [{ label: 'Qwen 30B-A3B', total: 30, active: 3, score: 74 }, { label: 'Qwen 80B-A8B', total: 80, active: 8, score: 82 }, { label: 'Qwen 235B-A22B', total: 235, active: 22, score: 89 }, { label: 'Dense 70B', total: 70, active: 70, score: 84 }] }
  });

  add('llama-scaling-law', {
    id: 'longbench-context-contour', name: 'Context Length × Depth Surface', chartLabel: 'Needle retrieval · length and depth surface', family: '论文图表复现', sourceKey: 'longBenchPaper', source: sources.longBenchPaper.name, sourceType: sources.longBenchPaper.type, sourceUrl: sources.longBenchPaper.url, visualSystem: 'VS-53 LongBench context contour field', grammar: 'context-length × needle-depth 矩阵 + 双等值线 + 单元格读数', renderer: 'contextContour',
    description: '把长上下文评测同时展开为长度与 needle 深度两个维度，避免只报一个平均值。', useWhen: '适合检索位置显著影响结果的长上下文评测。', tags: ['longbench', 'long-context', 'contour'],
    data: { lengths: ['8k', '32k', '128k', '512k', '1m'], depths: ['10%', '30%', '50%', '70%', '90%'], values: [[98, 97, 94, 87, 76], [98, 95, 91, 82, 69], [97, 94, 88, 76, 61], [96, 91, 83, 69, 53], [94, 88, 78, 62, 44]] }
  });

  add('nemotron-score-rings', {
    id: 'nemotron-posttrain-ladder', name: 'Post-training Phase Ladder', chartLabel: 'Cumulative reward across post-training stages', family: '厂商发布复现系列', visualSystem: 'VS-54 NVIDIA post-train staircase', grammar: '训练阶段阶梯 + 每级 score 盒 + 阶段间增量标签', renderer: 'phaseLadder',
    description: '用阶梯而非折线说明 post-training 阶段是离散累积过程，突出每一步贡献。', useWhen: '适合 SFT、reward model、RL、rejection sampling 等明确阶段。', tags: ['nvidia', 'post-training', 'ladder'],
    data: { stages: [{ label: 'BASE', score: 54 }, { label: 'SFT', score: 66 }, { label: 'RM', score: 74 }, { label: 'RL', score: 84 }, { label: 'ALIGN', score: 89 }] }
  });

  add('nova-polar-rose', {
    id: 'nova-latency-range-bands', name: 'Nova Latency Range Bands', chartLabel: 'p50–p95 latency with quality rings', family: '厂商发布复现系列', visualSystem: 'VS-55 AWS latency range instrument', grammar: 'p50-p95 粗区间带 + 开闭端点 + 质量环半径编码', renderer: 'latencyRangeBands',
    description: '在一张图里保留服务延迟中位数、长尾和质量，避免只比较单点 latency。', useWhen: '适合模型家族的服务层选型；延迟测试必须使用同一硬件和负载。', tags: ['aws', 'latency', 'range-band'],
    data: { items: [{ label: 'Nova Micro', p50: .32, p95: .74, quality: 68 }, { label: 'Nova Lite', p50: .58, p95: 1.12, quality: 76 }, { label: 'Nova Pro', p50: 1.08, p95: 2.34, quality: 88 }, { label: 'Peer A', p50: 1.42, p95: 3.18, quality: 90 }, { label: 'Peer B', p50: .86, p95: 2.72, quality: 82 }] }
  });

  add('grok-latency-ridges', {
    id: 'grok-generation-arrows', name: 'Generation Leap Arrows', chartLabel: 'Model generation movement · speed and quality', family: '厂商发布复现系列', visualSystem: 'VS-56 xAI generation vectors', grammar: '旧版空心点 → 新版箭头 + 速度质量二维坐标 + 系列直标', renderer: 'generationArrows',
    description: '用向量同时展示新一代模型的速度与质量变化，避免把两个改善拆成无关联图。', useWhen: '适合同一系列的 before/after；两代测试环境必须一致。', tags: ['xai', 'generation', 'arrow-scatter'],
    data: { items: [{ label: 'Grok', before: [72, 74], after: [142, 88] }, { label: 'Fast', before: [110, 66], after: [171, 79] }, { label: 'Reason', before: [48, 81], after: [93, 92] }, { label: 'Mini', before: [130, 63], after: [178, 72] }] }
  });

  add('helm-capability-heatmap', {
    id: 'arxiv-benchmark-upset', name: 'Benchmark Set UpSet', chartLabel: 'Dataset overlap across evaluation suites', family: '论文图表复现', sourceKey: 'evalHarnessPaper', source: sources.evalHarnessPaper.name, sourceType: sources.evalHarnessPaper.type, sourceUrl: sources.evalHarnessPaper.url, visualSystem: 'VS-57 Evaluation harness UpSet', grammar: '交集柱 + benchmark membership 点阵 + 连线组合', renderer: 'upsetPlot',
    description: '用 UpSet 取代难读的多集合 Venn，展示 benchmark 套件之间的任务交集。', useWhen: '适合 4 个以上集合及其主要交集；集合定义必须一致。', tags: ['arxiv', 'upset', 'benchmark-overlap'],
    data: { benchmarks: ['MMLU', 'BBH', 'HELM', 'OpenCompass'], sets: [{ count: 42, members: [0] }, { count: 31, members: [0, 2] }, { count: 27, members: [0, 1, 3] }, { count: 23, members: [1] }, { count: 19, members: [1, 2] }, { count: 15, members: [2, 3] }] }
  });

  add('arena-rank-slope', {
    id: 'arxiv-rank-alluvial', name: 'Rank Migration Alluvial', chartLabel: 'Model rank migration across evaluation snapshots', family: '论文图表复现', sourceKey: 'arenaPaper', source: sources.arenaPaper.name, sourceType: sources.arenaPaper.type, sourceUrl: sources.arenaPaper.url, visualSystem: 'VS-58 Preference rank alluvial', grammar: '三时点排名节点 + 半透明宽 ribbon + 末端系列直标', renderer: 'alluvialRanks',
    description: '把模型在三次榜单快照中的排名迁移画成 alluvial ribbon，突出稳定和剧烈换位。', useWhen: '适合 3 个时点、少量对象和离散名次；更多时点改用 bump chart。', tags: ['arxiv', 'alluvial', 'rank-migration'],
    data: { periods: ['APR', 'MAY', 'JUN'], items: [{ label: 'A', ranks: [1, 2, 3] }, { label: 'B', ranks: [3, 1, 1] }, { label: 'C', ranks: [2, 3, 2] }, { label: 'D', ranks: [5, 4, 4] }, { label: 'E', ranks: [4, 5, 5] }] }
  });

  add('arxiv-violin-distribution', {
    id: 'arxiv-prompt-raincloud', name: 'Prompt Sensitivity Raincloud', chartLabel: 'Prompt-template sensitivity by model', family: '论文图表复现', sourceKey: 'mtebPaper', source: sources.mtebPaper.name, sourceType: sources.mtebPaper.type, sourceUrl: sources.mtebPaper.url, visualSystem: 'VS-59 Paper raincloud specimen', grammar: '半小提琴云 + IQR 粗线 + median + 原始点雨', renderer: 'raincloud',
    description: '用 raincloud 同时展示 prompt 模板造成的密度、四分位和逐次得分。', useWhen: '适合 prompt 敏感性、seed 方差或多任务分布；样本少时不要平滑密度。', tags: ['arxiv', 'raincloud', 'prompt-sensitivity'],
    data: { groups: [{ label: 'Model A', values: [51, 57, 61, 63, 66, 69, 72, 78, 82] }, { label: 'Model B', values: [48, 54, 59, 65, 68, 74, 79, 81, 86] }, { label: 'Model C', values: [56, 61, 64, 70, 73, 76, 84, 87, 90] }, { label: 'Model D', values: [43, 52, 58, 60, 67, 71, 75, 80, 88] }] }
  });

  add('deepseek-price-pareto', {
    id: 'arxiv-selection-ternary', name: 'Quality–Speed–Cost Ternary', chartLabel: 'Three-way model selection trade-off', family: '论文图表复现', sourceKey: 'helm', source: sources.helm.name, sourceType: sources.helm.type, sourceUrl: sources.helm.url, visualSystem: 'VS-60 Ternary selection field', grammar: '三元重心坐标 + 三顶点权重 + 模型点直标', renderer: 'ternaryPlot',
    description: '把质量、速度与成本权重归一到三元坐标，显示不同模型适合的选型偏好。', useWhen: '适合三项占比总和为 100% 的权重或资源分配；不是原始指标散点。', tags: ['arxiv', 'ternary', 'model-selection'],
    data: { items: [{ label: 'Premium', values: [12, 18, 70] }, { label: 'Balanced', values: [30, 32, 38] }, { label: 'Fast', values: [18, 65, 17] }, { label: 'Budget', values: [68, 21, 11] }, { label: 'Agent', values: [22, 29, 49] }] }
  });

  window.renderBenchmark = function renderBenchmark(entry) {
    const renderer = window.BENCHMARK_RENDERERS[entry.renderer];
    if (!renderer) throw new Error(`Missing renderer: ${entry.renderer}`);
    return renderer(entry).trim();
  };
})();
