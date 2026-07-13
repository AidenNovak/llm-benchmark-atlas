(function () {
  'use strict';

  const W = 640;
  const H = 400;
  const TAU = Math.PI * 2;

  const esc = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const map = (value, d0, d1, r0, r1) => lerp(r0, r1, (value - d0) / (d1 - d0));
  const polar = (cx, cy, radius, angle) => [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  const path = points => points.map((point, index) => `${index ? 'L' : 'M'} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(' ');
  const median = values => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  function sectorPath(cx, cy, inner, outer, start, end) {
    const a = polar(cx, cy, outer, start);
    const b = polar(cx, cy, outer, end);
    const c = polar(cx, cy, inner, end);
    const d = polar(cx, cy, inner, start);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${a[0]} ${a[1]} A ${outer} ${outer} 0 ${large} 1 ${b[0]} ${b[1]} L ${c[0]} ${c[1]} A ${inner} ${inner} 0 ${large} 0 ${d[0]} ${d[1]} Z`;
  }

  function stepPath(points, xScale, yScale) {
    let d = '';
    points.forEach((point, index) => {
      const x = xScale(point[0]);
      const y = yScale(point[1]);
      if (index === 0) d = `M ${x} ${y}`;
      else d += ` H ${x} V ${y}`;
    });
    return d;
  }

  function frame(entry, content, options = {}) {
    const p = entry.palette;
    const id = entry.id.replace(/[^a-z0-9]/gi, '');
    const title = esc(entry.chartLabel || entry.name);
    const subtitle = esc(options.subtitle || entry.source);
    return `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' role='img' aria-labelledby='${id}-title ${id}-desc' style='background:${p.bg};color:${p.ink}'>
        <title id='${id}-title'>${title}</title>
        <desc id='${id}-desc'>${esc(entry.description)} ${esc(entry.dataNote)}</desc>
        <defs>
          <pattern id='${id}-hatch' width='8' height='8' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
            <rect width='8' height='8' fill='${p.c2}' fill-opacity='.22'/>
            <line x1='0' y1='0' x2='0' y2='8' stroke='${p.c1}' stroke-width='3'/>
          </pattern>
          <style>
            .t{font:700 15px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}
            .s{font:10px ui-monospace,"SFMono-Regular",Consolas,monospace;fill:${p.muted}}
            .l{font:10px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.muted}}
            .v{font:700 11px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:${p.ink}}
            .g{stroke:${p.grid};stroke-width:1;shape-rendering:crispEdges}
            .a{stroke:${p.ink};stroke-width:1;shape-rendering:crispEdges}
          </style>
        </defs>
        <text class='t' x='28' y='30'>${title}</text>
        <text class='s' x='28' y='48'>${subtitle}</text>
        <text class='s' x='612' y='30' text-anchor='end'>DEMO DATA</text>
        ${content}
      </svg>`;
  }

  function masterTable(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 168;
    const y0 = 88;
    const cw = 106;
    const rh = 58;
    let body = `<rect x='24' y='68' width='592' height='306' fill='${p.bg}' stroke='${p.grid}'/>`;
    body += `<rect x='${x0}' y='68' width='${cw}' height='306' fill='${p.c1}' fill-opacity='.08' stroke='${p.c1}' stroke-width='2'/>`;
    data.columns.forEach((column, index) => {
      body += `<text class='v' x='${x0 + index * cw + cw / 2}' y='86' text-anchor='middle'>${esc(column)}</text>`;
    });
    data.rows.forEach((row, rowIndex) => {
      const y = y0 + rowIndex * rh;
      const best = Math.max(...row.values);
      body += `<line class='g' x1='24' y1='${y + 17}' x2='616' y2='${y + 17}'/>`;
      body += `<text class='s' x='36' y='${y + 37}'>${esc(row.group)}</text><text class='v' x='36' y='${y + 54}'>${esc(row.label)}</text>`;
      row.values.forEach((value, colIndex) => {
        const cx = x0 + colIndex * cw + cw / 2;
        if (value === best) body += `<rect x='${cx - 29}' y='${y + 28}' width='58' height='25' rx='3' fill='${p.c1}' fill-opacity='.17'/>`;
        body += `<text class='v' x='${cx}' y='${y + 46}' text-anchor='middle'>${value.toFixed(1)}</text>`;
      });
    });
    body += `<text class='s' x='36' y='360'>conditions · tools on where applicable · normalized display</text>`;
    return frame(entry, body);
  }

  function lollipop(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 35, 100, 190, 590);
    const y0 = 103;
    const row = 51;
    let body = `<line class='a' x1='190' y1='86' x2='190' y2='352'/>`;
    [40, 60, 80, 100].forEach(tick => {
      body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='352'/><text class='l' x='${x(tick)}' y='370' text-anchor='middle'>${tick}%</text>`;
    });
    body += `<line x1='${x(data.target)}' y1='78' x2='${x(data.target)}' y2='352' stroke='${p.c3}' stroke-width='2' stroke-dasharray='5 5'/><text class='s' x='${x(data.target)}' y='74' text-anchor='middle'>TARGET ${data.target}</text>`;
    data.items.forEach((item, index) => {
      const y = y0 + index * row;
      const color = index === 0 ? p.c1 : p.c5;
      body += `<text class='v' x='176' y='${y + 4}' text-anchor='end'>${esc(item.label)}</text>`;
      body += `<line x1='190' y1='${y}' x2='${x(item.value)}' y2='${y}' stroke='${color}' stroke-width='4'/>`;
      body += `<circle cx='${x(item.value)}' cy='${y}' r='8' fill='${p.bg}' stroke='${color}' stroke-width='4'/><text class='v' x='${x(item.value) + 14}' y='${y + 4}'>${item.value.toFixed(1)}%</text>`;
    });
    return frame(entry, body);
  }

  function groupedHatch(entry) {
    const p = entry.palette;
    const data = entry.data;
    const top = 92;
    const bottom = 332;
    const groupW = 104;
    const start = 74;
    let body = '';
    [0, 25, 50, 75, 100].forEach(tick => {
      const y = map(tick, 0, 100, bottom, top);
      body += `<line class='g' x1='48' y1='${y}' x2='614' y2='${y}'/><text class='l' x='39' y='${y + 3}' text-anchor='end'>${tick}</text>`;
    });
    data.groups.forEach((group, groupIndex) => {
      const gx = start + groupIndex * groupW;
      group.values.forEach((value, seriesIndex) => {
        const barW = 20;
        const x = gx + seriesIndex * 24;
        const y = map(value, 0, 100, bottom, top);
        const fill = seriesIndex === 0 ? `url(#${entry.id.replace(/[^a-z0-9]/gi, '')}-hatch)` : [p.c3, p.c4][seriesIndex - 1];
        body += `<rect x='${x}' y='${y}' width='${barW}' height='${bottom - y}' fill='${fill}' stroke='${seriesIndex === 0 ? p.c1 : p.grid}'/>`;
      });
      body += `<text class='v' x='${gx + 28}' y='352' text-anchor='middle'>${esc(group.label)}</text>`;
    });
    data.series.forEach((label, index) => {
      const x = 70 + index * 132;
      const fill = index === 0 ? `url(#${entry.id.replace(/[^a-z0-9]/gi, '')}-hatch)` : [p.c3, p.c4][index - 1];
      body += `<rect x='${x}' y='371' width='14' height='10' fill='${fill}'/><text class='l' x='${x + 20}' y='380'>${esc(label)}</text>`;
    });
    return frame(entry, body);
  }

  function dumbbell(entry) {
    const p = entry.palette;
    const items = entry.data.items;
    const x = value => map(value, 40, 95, 205, 585);
    let body = '';
    [40, 60, 80, 95].forEach(tick => {
      body += `<line class='g' x1='${x(tick)}' y1='85' x2='${x(tick)}' y2='352'/><text class='l' x='${x(tick)}' y='371' text-anchor='middle'>${tick}</text>`;
    });
    items.forEach((item, index) => {
      const y = 106 + index * 53;
      const delta = item.after - item.before;
      body += `<text class='v' x='185' y='${y + 4}' text-anchor='end'>${esc(item.label)}</text>`;
      body += `<line x1='${x(item.before)}' y1='${y}' x2='${x(item.after)}' y2='${y}' stroke='${p.c2}' stroke-width='5'/>`;
      body += `<circle cx='${x(item.before)}' cy='${y}' r='7' fill='${p.bg}' stroke='${p.c4}' stroke-width='3'/><circle cx='${x(item.after)}' cy='${y}' r='8' fill='${p.c1}'/>`;
      body += `<text class='s' x='${x(item.before)}' y='${y - 13}' text-anchor='middle'>${item.before}</text><text class='v' x='${x(item.after)}' y='${y - 13}' text-anchor='middle'>${item.after}</text>`;
      body += `<text class='v' x='605' y='${y + 4}' text-anchor='end' fill='${p.c1}'>+${delta}</text>`;
    });
    return frame(entry, body);
  }

  function slopegraph(entry) {
    const p = entry.palette;
    const data = entry.data;
    const y = rank => map(rank, 1, data.items.length, 100, 330);
    let body = `<text class='s' x='150' y='78' text-anchor='middle'>${esc(data.left)}</text><text class='s' x='490' y='78' text-anchor='middle'>${esc(data.right)}</text>`;
    body += `<line class='a' x1='150' y1='90' x2='150' y2='343'/><line class='a' x1='490' y1='90' x2='490' y2='343'/>`;
    data.items.forEach((item, index) => {
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5][index % 5];
      body += `<line x1='158' y1='${y(item.left)}' x2='482' y2='${y(item.right)}' stroke='${color}' stroke-width='3'/>`;
      body += `<circle cx='150' cy='${y(item.left)}' r='6' fill='${color}'/><circle cx='490' cy='${y(item.right)}' r='6' fill='${color}'/>`;
      body += `<text class='v' x='136' y='${y(item.left) + 4}' text-anchor='end'>${item.left} · ${esc(item.label)}</text>`;
      body += `<text class='v' x='504' y='${y(item.right) + 4}'>${item.right} · ${esc(item.label)}</text>`;
    });
    return frame(entry, body);
  }

  function bump(entry) {
    const p = entry.palette;
    const data = entry.data;
    const colors = [p.c1, p.c2, p.c3, p.c4, p.c5];
    const x = index => map(index, 0, data.periods.length - 1, 76, 548);
    const y = rank => map(rank, 1, data.series.length, 96, 326);
    let body = '';
    data.periods.forEach((period, index) => {
      body += `<line class='g' x1='${x(index)}' y1='86' x2='${x(index)}' y2='342'/><text class='s' x='${x(index)}' y='366' text-anchor='middle'>${esc(period)}</text>`;
    });
    data.series.forEach((series, index) => {
      const points = series.values.map((rank, i) => [x(i), y(rank)]);
      body += `<path d='${path(points)}' fill='none' stroke='${colors[index]}' stroke-width='4'/>`;
      points.forEach((point, i) => body += `<circle cx='${point[0]}' cy='${point[1]}' r='7' fill='${p.bg}' stroke='${colors[index]}' stroke-width='3'/><text class='v' x='${point[0]}' y='${point[1] + 4}' text-anchor='middle' fill='${colors[index]}'>${series.values[i]}</text>`);
      body += `<text class='v' x='${points.at(-1)[0] + 17}' y='${points.at(-1)[1] + 4}' fill='${colors[index]}'>${esc(series.label)}</text>`;
    });
    return frame(entry, body);
  }

  function frontier(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(Math.log2(value), 0, 5, 78, 580);
    const y = value => map(value, 35, 90, 338, 86);
    let body = '';
    [1, 2, 4, 8, 16, 32].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='338'/><text class='l' x='${x(tick)}' y='360' text-anchor='middle'>${tick}×</text>`);
    [40, 50, 60, 70, 80, 90].forEach(tick => body += `<line class='g' x1='68' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='58' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    data.series.forEach((series, index) => {
      const color = index === 0 ? p.c1 : p.c5;
      const points = series.points.map(point => [x(point[0]), y(point[1])]);
      body += `<path d='${path(points)}' fill='none' stroke='${color}' stroke-width='4'/>`;
      points.forEach((point, pointIndex) => {
        body += `<circle cx='${point[0]}' cy='${point[1]}' r='6' fill='${p.bg}' stroke='${color}' stroke-width='3'/>`;
        if (index === 0 && [0, 3, 5].includes(pointIndex)) body += `<text class='s' x='${point[0]}' y='${point[1] - 12}' text-anchor='middle'>${['LOW', 'MED', 'HIGH'][[0, 3, 5].indexOf(pointIndex)]}</text>`;
      });
    });
    body += `<text class='s' x='328' y='386' text-anchor='middle'>relative inference compute (log scale)</text>`;
    return frame(entry, body);
  }

  function saturation(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 32, 70, 590);
    const y = value => map(value, 35, 90, 336, 88);
    let body = `<rect x='${x(data.optimum[0])}' y='82' width='${x(data.optimum[1]) - x(data.optimum[0])}' height='260' fill='${p.c2}' fill-opacity='.13'/><text class='s' x='${(x(data.optimum[0]) + x(data.optimum[1])) / 2}' y='78' text-anchor='middle'>RECOMMENDED WINDOW</text>`;
    [0, 8, 16, 24, 32].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='88' x2='${x(tick)}' y2='336'/><text class='l' x='${x(tick)}' y='358' text-anchor='middle'>${tick}k</text>`);
    [40, 50, 60, 70, 80, 90].forEach(tick => body += `<line class='g' x1='70' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='58' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    const points = data.points.map(point => [x(point[0]), y(point[1])]);
    body += `<path d='${path(points)}' fill='none' stroke='${p.c1}' stroke-width='5'/>`;
    points.forEach((point, index) => body += `<circle cx='${point[0]}' cy='${point[1]}' r='${index === 4 ? 8 : 5}' fill='${index === 4 ? p.c3 : p.bg}' stroke='${p.c1}' stroke-width='3'/>`);
    body += `<text class='v' x='${points.at(-1)[0]}' y='${points.at(-1)[1] - 13}' text-anchor='end'>+1.0 / +16k</text>`;
    return frame(entry, body);
  }

  function dualAxis(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 7, 72, 586);
    const yLoss = value => map(value, 1.4, 3.3, 330, 88);
    const yScore = value => map(value, 30, 80, 330, 88);
    let body = '';
    data.stages.forEach((stage, index) => {
      const next = index + 1 < data.stages.length ? data.stages[index + 1] : 7;
      body += `<rect x='${x(stage)}' y='84' width='${x(next) - x(stage)}' height='250' fill='${index ? p.c5 : p.c4}' fill-opacity='.07'/><line x1='${x(stage)}' y1='82' x2='${x(stage)}' y2='336' stroke='${p.c2}' stroke-dasharray='4 4'/><text class='s' x='${x(stage) + 5}' y='100'>PHASE ${index + 2}</text>`;
    });
    [0, 1, 2, 3, 4, 5, 6, 7].forEach(tick => body += `<text class='l' x='${x(tick)}' y='356' text-anchor='middle'>${tick}</text>`);
    [40, 60, 80].forEach(tick => body += `<line class='g' x1='68' y1='${yScore(tick)}' x2='590' y2='${yScore(tick)}'/><text class='l' x='58' y='${yScore(tick) + 3}' text-anchor='end'>${tick}</text>`);
    const lossPoints = data.points.map(point => [x(point.x), yLoss(point.loss)]);
    const scorePoints = data.points.map(point => [x(point.x), yScore(point.score)]);
    body += `<path d='${path(lossPoints)}' fill='none' stroke='${p.c1}' stroke-width='3'/><path d='${path(scorePoints)}' fill='none' stroke='${p.c4}' stroke-width='4'/>`;
    body += `<text class='v' x='590' y='${lossPoints.at(-1)[1] - 10}' text-anchor='end'>loss ↓</text><text class='v' x='590' y='${scorePoints.at(-1)[1] - 10}' text-anchor='end' fill='${p.c4}'>held-out ↑</text>`;
    return frame(entry, body);
  }

  function logScaling(entry) {
    const p = entry.palette;
    const points = entry.data.points;
    const x = value => map(Math.log10(value), 0, Math.log10(500), 76, 584);
    const y = value => map(value, 1.5, 3.0, 330, 88);
    let body = '';
    [1, 10, 100, 500].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='334'/><text class='l' x='${x(tick)}' y='356' text-anchor='middle'>${tick}B</text>`);
    [1.5, 2, 2.5, 3].forEach(tick => body += `<line class='g' x1='70' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='59' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    body += `<line x1='${x(1)}' y1='${y(2.86)}' x2='${x(405)}' y2='${y(1.58)}' stroke='${p.c2}' stroke-width='3' stroke-dasharray='7 5'/><text class='s' x='250' y='140' transform='rotate(-17 250 140)'>power-law fit</text>`;
    points.forEach((point, index) => body += `<circle cx='${x(point.x)}' cy='${y(point.y)}' r='${6 + index}' fill='${p.c1}'/><text class='v' x='${x(point.x) + 9}' y='${y(point.y) - 8}'>${esc(point.label)}</text>`);
    body += `<text class='s' x='330' y='385' text-anchor='middle'>active parameters · log scale</text>`;
    return frame(entry, body);
  }

  function bubble(entry) {
    const p = entry.palette;
    const points = entry.data.points;
    const x = value => map(value, 0, 35, 74, 586);
    const y = value => map(value, 70, 90, 336, 88);
    let body = '';
    [0, 10, 20, 30].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='338'/><text class='l' x='${x(tick)}' y='359' text-anchor='middle'>${tick}</text>`);
    [70, 75, 80, 85, 90].forEach(tick => body += `<line class='g' x1='72' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='60' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    body += `<path d='M 80 308 Q 260 190 560 108' fill='none' stroke='${p.c2}' stroke-width='2' stroke-dasharray='6 5'/><text class='s' x='390' y='164'>efficiency frontier</text>`;
    points.forEach((point, index) => {
      const color = [p.c1, p.c3, p.c4, p.c2, p.c5][index];
      const radius = 7 + Math.sqrt(point.r) * 2.1;
      body += `<circle cx='${x(point.x)}' cy='${y(point.y)}' r='${radius}' fill='${color}' fill-opacity='.55' stroke='${color}' stroke-width='2'/><text class='v' x='${x(point.x)}' y='${y(point.y) - radius - 7}' text-anchor='middle'>${esc(point.label)}</text>`;
    });
    body += `<text class='s' x='330' y='386' text-anchor='middle'>relative inference cost →</text>`;
    return frame(entry, body);
  }

  function pareto(entry) {
    const p = entry.palette;
    const points = entry.data.points;
    const x = value => map(value, 0, 14, 72, 590);
    const y = value => map(value, 72, 90, 335, 87);
    let body = `<text class='s' x='85' y='101'>BETTER</text><path d='M 77 113 L 77 91 L 99 91' fill='none' stroke='${p.c1}' stroke-width='2'/>`;
    [0, 4, 8, 12].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='337'/><text class='l' x='${x(tick)}' y='359' text-anchor='middle'>$${tick}</text>`);
    [72, 78, 84, 90].forEach(tick => body += `<line class='g' x1='70' y1='${y(tick)}' x2='592' y2='${y(tick)}'/><text class='l' x='59' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    const frontierPoints = points.filter(point => point.frontier).sort((a, b) => a.x - b.x).map(point => [x(point.x), y(point.y)]);
    body += `<path d='${path(frontierPoints)}' fill='none' stroke='${p.c1}' stroke-width='3' stroke-dasharray='7 4'/>`;
    points.forEach((point, index) => {
      const color = point.frontier ? p.c1 : p.c4;
      body += `<circle cx='${x(point.x)}' cy='${y(point.y)}' r='${point.frontier ? 9 : 6}' fill='${point.frontier ? p.bg : color}' stroke='${color}' stroke-width='3'/><text class='v' x='${x(point.x) + (index % 2 ? 8 : -8)}' y='${y(point.y) - 13}' text-anchor='${index % 2 ? 'start' : 'end'}'>${esc(point.label)}</text>`;
    });
    return frame(entry, body);
  }

  function radar(entry) {
    const p = entry.palette;
    const data = entry.data;
    const cx = 320;
    const cy = 225;
    const radius = 125;
    let body = '';
    [25, 50, 75, 100].forEach(level => {
      const points = data.axes.map((_, index) => polar(cx, cy, radius * level / 100, -Math.PI / 2 + index * TAU / data.axes.length));
      body += `<path d='${path([...points, points[0]])}' fill='none' stroke='${p.grid}'/>`;
    });
    data.axes.forEach((axis, index) => {
      const angle = -Math.PI / 2 + index * TAU / data.axes.length;
      const end = polar(cx, cy, radius, angle);
      const label = polar(cx, cy, radius + 28, angle);
      body += `<line class='g' x1='${cx}' y1='${cy}' x2='${end[0]}' y2='${end[1]}'/><text class='v' x='${label[0]}' y='${label[1] + 4}' text-anchor='middle'>${esc(axis)}</text>`;
    });
    data.series.forEach((series, index) => {
      const color = index === 0 ? p.c1 : p.c2;
      const points = series.values.map((value, axisIndex) => polar(cx, cy, radius * value / 100, -Math.PI / 2 + axisIndex * TAU / data.axes.length));
      body += `<path d='${path([...points, points[0]])}' fill='${color}' fill-opacity='.13' stroke='${color}' stroke-width='3'/>`;
      points.forEach(point => body += `<circle cx='${point[0]}' cy='${point[1]}' r='4' fill='${color}'/>`);
      body += `<rect x='${220 + index * 120}' y='368' width='16' height='4' fill='${color}'/><text class='l' x='${242 + index * 120}' y='373'>${esc(series.label)}</text>`;
    });
    return frame(entry, body);
  }

  function smallMultiples(entry) {
    const p = entry.palette;
    const data = entry.data;
    let body = '';
    data.panels.forEach((panel, panelIndex) => {
      const col = panelIndex % 2;
      const row = Math.floor(panelIndex / 2);
      const x0 = 38 + col * 300;
      const y0 = 82 + row * 143;
      const base = y0 + 103;
      body += `<rect x='${x0}' y='${y0}' width='272' height='126' fill='${p.bg}' stroke='${p.grid}'/><text class='v' x='${x0 + 12}' y='${y0 + 18}'>${esc(panel.label)}</text>`;
      panel.values.forEach((value, index) => {
        const h = map(value, 40, 100, 18, 78);
        const x = x0 + 50 + index * 67;
        const color = [p.c1, p.c2, p.c3][index];
        body += `<rect x='${x}' y='${base - h}' width='36' height='${h}' fill='${color}'/><text class='v' x='${x + 18}' y='${base - h - 5}' text-anchor='middle'>${value}</text>`;
      });
    });
    data.series.forEach((label, index) => body += `<rect x='${180 + index * 115}' y='373' width='12' height='8' fill='${[p.c1, p.c2, p.c3][index]}'/><text class='l' x='${198 + index * 115}' y='381'>${esc(label)}</text>`);
    return frame(entry, body);
  }

  function parallel(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = index => map(index, 0, data.axes.length - 1, 78, 568);
    const y = value => map(value, 40, 100, 334, 88);
    let body = '';
    data.axes.forEach((axis, index) => {
      body += `<line class='a' x1='${x(index)}' y1='88' x2='${x(index)}' y2='334'/><text class='v' x='${x(index)}' y='359' text-anchor='middle'>${esc(axis)}</text>`;
      [50, 75, 100].forEach(tick => body += `<circle cx='${x(index)}' cy='${y(tick)}' r='2' fill='${p.muted}'/>`);
    });
    data.series.forEach((series, index) => {
      const color = [p.c1, p.c3, p.c4][index];
      const points = series.values.map((value, axisIndex) => [x(axisIndex), y(value)]);
      body += `<path d='${path(points)}' fill='none' stroke='${color}' stroke-width='${index === 0 ? 5 : 3}' stroke-opacity='${index === 0 ? 1 : .68}'/>`;
      points.forEach(point => body += `<circle cx='${point[0]}' cy='${point[1]}' r='4' fill='${color}'/>`);
      body += `<text class='v' x='${585}' y='${points.at(-1)[1] + 4}' fill='${color}'>${esc(series.label)}</text>`;
    });
    return frame(entry, body);
  }

  function polarRose(entry) {
    const p = entry.palette;
    const data = entry.data;
    const cx = 320;
    const cy = 221;
    const inner = 42;
    const max = 128;
    let body = `<circle cx='${cx}' cy='${cy}' r='${max}' fill='none' stroke='${p.grid}'/><circle cx='${cx}' cy='${cy}' r='${inner}' fill='${p.bg}' stroke='${p.grid}'/>`;
    data.items.forEach((item, index) => {
      const start = -Math.PI / 2 + index * TAU / data.items.length + .04;
      const end = -Math.PI / 2 + (index + 1) * TAU / data.items.length - .04;
      const outer = map(item.value, 0, 100, inner + 8, max);
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5, p.c6][index];
      body += `<path d='${sectorPath(cx, cy, inner, outer, start, end)}' fill='${color}' fill-opacity='.88'/>`;
      const label = polar(cx, cy, max + 29, (start + end) / 2);
      body += `<text class='v' x='${label[0]}' y='${label[1] + 4}' text-anchor='middle'>${esc(item.label)}</text>`;
    });
    body += `<text class='t' x='${cx}' y='${cy + 5}' text-anchor='middle'>NOVA</text>`;
    return frame(entry, body);
  }

  function glyphGrid(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 190;
    const y0 = 112;
    const cw = 92;
    const rh = 72;
    let body = '';
    data.cols.forEach((col, index) => body += `<text class='v' x='${x0 + index * cw}' y='85' text-anchor='middle'>${esc(col)}</text>`);
    data.rows.forEach((row, rowIndex) => {
      body += `<text class='v' x='130' y='${y0 + rowIndex * rh + 4}' text-anchor='end'>${esc(row)}</text>`;
      data.values[rowIndex].forEach((value, colIndex) => {
        const cx = x0 + colIndex * cw;
        const cy = y0 + rowIndex * rh;
        const colors = [p.c1, p.c2, p.c3, p.c4];
        for (let q = 0; q < 4; q++) {
          const opacity = clamp((value - q * 7) / 100, .12, .95);
          body += `<path d='${sectorPath(cx, cy, 4, 22, -Math.PI / 2 + q * Math.PI / 2, -Math.PI / 2 + (q + 1) * Math.PI / 2)}' fill='${colors[q]}' fill-opacity='${opacity}'/>`;
        }
        body += `<circle cx='${cx}' cy='${cy}' r='4' fill='${p.ink}'/><text class='s' x='${cx}' y='${cy + 37}' text-anchor='middle'>${value}</text>`;
      });
    });
    ['quality', 'latency', 'tools', 'retrieval'].forEach((label, index) => body += `<rect x='${130 + index * 106}' y='363' width='12' height='8' fill='${[p.c1, p.c2, p.c3, p.c4][index]}'/><text class='l' x='${148 + index * 106}' y='371'>${label}</text>`);
    return frame(entry, body);
  }

  function rings(entry) {
    const p = entry.palette;
    const data = entry.data;
    const cx = 270;
    const cy = 222;
    let body = '';
    data.items.forEach((item, index) => {
      const radius = 52 + index * 24;
      const circumference = TAU * radius;
      const dash = circumference * item.value / 100;
      const color = [p.c1, p.c2, p.c3, p.c4][index];
      body += `<circle cx='${cx}' cy='${cy}' r='${radius}' fill='none' stroke='${p.grid}' stroke-width='12'/><circle cx='${cx}' cy='${cy}' r='${radius}' fill='none' stroke='${color}' stroke-width='12' stroke-linecap='round' stroke-dasharray='${dash} ${circumference - dash}' transform='rotate(-90 ${cx} ${cy})'/>`;
      body += `<rect x='455' y='${130 + index * 47}' width='15' height='10' fill='${color}'/><text class='v' x='480' y='${139 + index * 47}'>${esc(item.label)}</text><text class='v' x='578' y='${139 + index * 47}' text-anchor='end'>${item.value}</text>`;
    });
    const avg = Math.round(data.items.reduce((sum, item) => sum + item.value, 0) / data.items.length);
    body += `<text x='${cx}' y='${cy - 4}' text-anchor='middle' style='font:700 36px ui-sans-serif;fill:${p.ink}'>${avg}</text><text class='s' x='${cx}' y='${cy + 20}' text-anchor='middle'>MEAN</text>`;
    return frame(entry, body);
  }

  function forest(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 60, 90, 190, 585);
    let body = `<line x1='${x(data.baseline)}' y1='82' x2='${x(data.baseline)}' y2='343' stroke='${p.c2}' stroke-width='2' stroke-dasharray='5 5'/><text class='s' x='${x(data.baseline)}' y='76' text-anchor='middle'>BASELINE</text>`;
    [60, 70, 80, 90].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='343'/><text class='l' x='${x(tick)}' y='365' text-anchor='middle'>${tick}</text>`);
    data.items.forEach((item, index) => {
      const y = 110 + index * 49;
      const color = index === 0 ? p.c1 : p.c3;
      body += `<text class='v' x='170' y='${y + 4}' text-anchor='end'>${esc(item.label)}</text><line x1='${x(item.low)}' y1='${y}' x2='${x(item.high)}' y2='${y}' stroke='${color}' stroke-width='3'/><line x1='${x(item.low)}' y1='${y - 7}' x2='${x(item.low)}' y2='${y + 7}' stroke='${color}' stroke-width='2'/><line x1='${x(item.high)}' y1='${y - 7}' x2='${x(item.high)}' y2='${y + 7}' stroke='${color}' stroke-width='2'/><circle cx='${x(item.value)}' cy='${y}' r='7' fill='${color}'/><text class='v' x='${x(item.high) + 10}' y='${y + 4}'>${item.value}</text>`;
    });
    return frame(entry, body);
  }

  function violin(entry) {
    const p = entry.palette;
    const groups = entry.data.groups;
    const y = value => map(value, 45, 95, 334, 88);
    let body = '';
    [50, 60, 70, 80, 90].forEach(tick => body += `<line class='g' x1='66' y1='${y(tick)}' x2='600' y2='${y(tick)}'/><text class='l' x='56' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    groups.forEach((group, groupIndex) => {
      const cx = 126 + groupIndex * 134;
      const sorted = [...group.values].sort((a, b) => a - b);
      const left = sorted.map((value, index) => [cx - (5 + Math.sin(Math.PI * index / (sorted.length - 1)) * 27), y(value)]);
      const right = [...sorted].reverse().map((value, revIndex) => {
        const index = sorted.length - 1 - revIndex;
        return [cx + (5 + Math.sin(Math.PI * index / (sorted.length - 1)) * 27), y(value)];
      });
      const color = [p.c1, p.c2, p.c3, p.c4][groupIndex];
      body += `<path d='${path([...left, ...right])} Z' fill='${color}' fill-opacity='.24' stroke='${color}' stroke-width='2'/>`;
      sorted.forEach((value, index) => body += `<circle cx='${cx + ((index % 3) - 1) * 5}' cy='${y(value)}' r='2.7' fill='${color}' fill-opacity='.72'/>`);
      body += `<line x1='${cx - 22}' y1='${y(median(sorted))}' x2='${cx + 22}' y2='${y(median(sorted))}' stroke='${p.ink}' stroke-width='3'/><text class='v' x='${cx}' y='360' text-anchor='middle'>${esc(group.label)}</text>`;
    });
    return frame(entry, body);
  }

  function boxplot(entry) {
    const p = entry.palette;
    const groups = entry.data.groups;
    const y = value => map(value, 25, 95, 336, 88);
    let body = '';
    [30, 50, 70, 90].forEach(tick => body += `<line class='g' x1='64' y1='${y(tick)}' x2='604' y2='${y(tick)}'/><text class='l' x='54' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    groups.forEach((group, index) => {
      const cx = 126 + index * 136;
      const color = [p.c1, p.c2, p.c3, p.c4][index];
      body += `<line x1='${cx}' y1='${y(group.min)}' x2='${cx}' y2='${y(group.max)}' stroke='${p.ink}' stroke-width='2'/><line x1='${cx - 14}' y1='${y(group.min)}' x2='${cx + 14}' y2='${y(group.min)}' stroke='${p.ink}' stroke-width='2'/><line x1='${cx - 14}' y1='${y(group.max)}' x2='${cx + 14}' y2='${y(group.max)}' stroke='${p.ink}' stroke-width='2'/>`;
      body += `<rect x='${cx - 29}' y='${y(group.q3)}' width='58' height='${y(group.q1) - y(group.q3)}' fill='${color}' fill-opacity='.25' stroke='${color}' stroke-width='2'/><line x1='${cx - 29}' y1='${y(group.median)}' x2='${cx + 29}' y2='${y(group.median)}' stroke='${p.ink}' stroke-width='4'/>`;
      group.outliers.forEach((value, outlierIndex) => body += `<circle cx='${cx + (outlierIndex % 2 ? 9 : -9)}' cy='${y(value)}' r='4' fill='none' stroke='${color}' stroke-width='2'/>`);
      [group.min, group.q1, group.median, group.q3, group.max].forEach((value, pointIndex) => body += `<circle cx='${cx + ((pointIndex * 11) % 23) - 11}' cy='${y(value)}' r='2.5' fill='${color}' fill-opacity='.65'/>`);
      body += `<text class='v' x='${cx}' y='361' text-anchor='middle'>${esc(group.label)}</text>`;
    });
    return frame(entry, body);
  }

  function ridge(entry) {
    const p = entry.palette;
    const series = entry.data.series;
    let body = '';
    [0, 1, 2, 3, 4, 5].forEach(tick => body += `<line class='g' x1='${map(tick, 0, 5, 160, 590)}' y1='82' x2='${map(tick, 0, 5, 160, 590)}' y2='342'/><text class='l' x='${map(tick, 0, 5, 160, 590)}' y='368' text-anchor='middle'>${tick}s</text>`);
    series.forEach((item, index) => {
      const base = 133 + index * 64;
      const points = item.values.map((value, pointIndex) => [map(pointIndex, 0, item.values.length - 1, 160, 590), base - value * 44]);
      const color = [p.c1, p.c2, p.c3, p.c4][index];
      body += `<line x1='150' y1='${base}' x2='596' y2='${base}' stroke='${p.grid}'/><path d='M 160 ${base} ${path(points).replace(/^M /, 'L ')} L 590 ${base} Z' fill='${color}' fill-opacity='.28' stroke='${color}' stroke-width='2'/><text class='v' x='137' y='${base - 7}' text-anchor='end'>${esc(item.label)}</text>`;
      body += `<line x1='${points[3][0]}' y1='${base - 47}' x2='${points[3][0]}' y2='${base + 4}' stroke='${color}' stroke-dasharray='3 3'/><text class='s' x='${points[3][0]}' y='${base - 52}' text-anchor='middle'>p50</text>`;
    });
    return frame(entry, body);
  }

  function ecdf(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(Math.log2(value), 0, 5, 72, 590);
    const y = value => map(value, 30, 90, 336, 88);
    let body = '';
    [1, 2, 4, 8, 16, 32].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='338'/><text class='l' x='${x(tick)}' y='360' text-anchor='middle'>k=${tick}</text>`);
    [40, 50, 60, 70, 80, 90].forEach(tick => body += `<line class='g' x1='70' y1='${y(tick)}' x2='592' y2='${y(tick)}'/><text class='l' x='58' y='${y(tick) + 3}' text-anchor='end'>${tick}%</text>`);
    data.series.forEach((series, index) => {
      const color = index === 0 ? p.c1 : p.c2;
      body += `<path d='${stepPath(series.points, x, y)}' fill='none' stroke='${color}' stroke-width='4'/>`;
      series.points.forEach(point => body += `<circle cx='${x(point[0])}' cy='${y(point[1])}' r='4' fill='${p.bg}' stroke='${color}' stroke-width='2'/>`);
      const last = series.points.at(-1);
      body += `<text class='v' x='${x(last[0]) - 6}' y='${y(last[1]) - 10}' text-anchor='end' fill='${color}'>${esc(series.label)}</text>`;
    });
    return frame(entry, body);
  }

  function reliability(entry) {
    const p = entry.palette;
    const bins = entry.data.bins;
    const x = value => map(value, 0, 100, 82, 580);
    const y = value => map(value, 0, 100, 338, 86);
    let body = `<line x1='${x(0)}' y1='${y(0)}' x2='${x(100)}' y2='${y(100)}' stroke='${p.c5}' stroke-width='3' stroke-dasharray='7 5'/><text class='s' x='478' y='123' transform='rotate(-25 478 123)'>perfect calibration</text>`;
    [0, 20, 40, 60, 80, 100].forEach(tick => {
      body += `<line class='g' x1='${x(tick)}' y1='86' x2='${x(tick)}' y2='338'/><line class='g' x1='82' y1='${y(tick)}' x2='580' y2='${y(tick)}'/><text class='l' x='${x(tick)}' y='360' text-anchor='middle'>${tick}</text><text class='l' x='69' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`;
    });
    bins.forEach((bin, index) => {
      const barX = x(bin.confidence) - 22;
      const color = index === bins.length - 1 ? p.c1 : p.c2;
      body += `<rect x='${barX}' y='${y(bin.accuracy)}' width='44' height='${y(0) - y(bin.accuracy)}' fill='${color}' fill-opacity='.72'/><line x1='${x(bin.confidence)}' y1='${y(bin.accuracy)}' x2='${x(bin.confidence)}' y2='${y(bin.confidence)}' stroke='${p.c1}' stroke-width='3'/><text class='v' x='${x(bin.confidence)}' y='${y(bin.accuracy) - 8}' text-anchor='middle'>${bin.accuracy}</text>`;
    });
    body += `<text class='s' x='330' y='386' text-anchor='middle'>reported confidence →</text>`;
    return frame(entry, body);
  }

  function heatmap(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 164;
    const y0 = 104;
    const cw = 70;
    const rh = 48;
    let body = '';
    data.cols.forEach((col, index) => body += `<text class='v' x='${x0 + index * cw + cw / 2}' y='86' text-anchor='middle'>${esc(col)}</text>`);
    data.rows.forEach((row, rowIndex) => {
      body += `<text class='v' x='148' y='${y0 + rowIndex * rh + 29}' text-anchor='end'>${esc(row)}</text>`;
      data.values[rowIndex].forEach((value, colIndex) => {
        const opacity = map(value, 60, 90, .12, .92);
        const worst = value === Math.min(...data.values[rowIndex]);
        body += `<rect x='${x0 + colIndex * cw}' y='${y0 + rowIndex * rh}' width='${cw - 4}' height='${rh - 4}' fill='${p.c1}' fill-opacity='${opacity}' stroke='${worst ? p.c4 : p.bg}' stroke-width='${worst ? 3 : 1}'/><text x='${x0 + colIndex * cw + (cw - 4) / 2}' y='${y0 + rowIndex * rh + 28}' text-anchor='middle' style='font:700 11px ui-sans-serif;fill:${opacity > .58 ? p.bg : p.ink}'>${value}</text>`;
      });
    });
    body += `<rect x='500' y='366' width='76' height='8' fill='${p.c1}' fill-opacity='.9'/><rect x='424' y='366' width='76' height='8' fill='${p.c1}' fill-opacity='.25'/><text class='s' x='418' y='375' text-anchor='end'>LOW</text><text class='s' x='584' y='375'>HIGH</text>`;
    return frame(entry, body);
  }

  function confusion(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 214;
    const y0 = 96;
    const cell = 118;
    const max = Math.max(...data.values.flat());
    let body = `<text class='s' x='332' y='75' text-anchor='middle'>PREDICTED</text><text class='s' x='72' y='221' text-anchor='middle' transform='rotate(-90 72 221)'>ACTUAL</text>`;
    data.labels.forEach((label, index) => {
      body += `<text class='v' x='${x0 + index * cell + cell / 2}' y='90' text-anchor='middle'>${esc(label)}</text><text class='v' x='198' y='${y0 + index * cell + cell / 2 + 4}' text-anchor='end'>${esc(label)}</text>`;
    });
    data.values.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
      const correct = rowIndex === colIndex;
      const color = correct ? p.c4 : p.c2;
      const opacity = .15 + value / max * .72;
      body += `<rect x='${x0 + colIndex * cell}' y='${y0 + rowIndex * cell}' width='${cell - 5}' height='${cell - 5}' fill='${color}' fill-opacity='${opacity}'/><text x='${x0 + colIndex * cell + (cell - 5) / 2}' y='${y0 + rowIndex * cell + 56}' text-anchor='middle' style='font:700 25px ui-sans-serif;fill:${p.ink}'>${value}</text><text class='s' x='${x0 + colIndex * cell + (cell - 5) / 2}' y='${y0 + rowIndex * cell + 76}' text-anchor='middle'>${correct ? 'correct' : esc(data.costs[colIndex])}</text>`;
    }));
    const total = data.values.flat().reduce((sum, value) => sum + value, 0);
    body += `<text class='s' x='332' y='362' text-anchor='middle'>n=${total} · false negative cost weighted ×3</text>`;
    return frame(entry, body);
  }

  function contextDecay(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 165;
    const y0 = 104;
    const cw = 82;
    const rh = 54;
    let body = '';
    data.columns.forEach((col, index) => body += `<text class='v' x='${x0 + index * cw + cw / 2}' y='87' text-anchor='middle'>${esc(col)}</text>`);
    data.rows.forEach((row, rowIndex) => {
      body += `<text class='v' x='149' y='${y0 + rowIndex * rh + 33}' text-anchor='end'>${esc(row.label)}</text>`;
      row.values.forEach((value, colIndex) => {
        const opacity = map(value, 35, 100, .12, .96);
        const critical = value < 60;
        body += `<rect x='${x0 + colIndex * cw}' y='${y0 + rowIndex * rh}' width='${cw - 5}' height='${rh - 7}' fill='${p.c1}' fill-opacity='${opacity}' stroke='${critical ? p.c2 : p.bg}' stroke-width='${critical ? 3 : 1}'/><text x='${x0 + colIndex * cw + (cw - 5) / 2}' y='${y0 + rowIndex * rh + 29}' text-anchor='middle' style='font:700 12px ui-sans-serif;fill:${opacity > .58 ? '#ffffff' : p.ink}'>${value}</text>`;
      });
    });
    body += `<line x1='${x0 + 3 * cw - 3}' y1='95' x2='${x0 + 3 * cw - 3}' y2='326' stroke='${p.c2}' stroke-width='2' stroke-dasharray='5 4'/><text class='s' x='${x0 + 3 * cw + 5}' y='347'>degradation zone</text>`;
    return frame(entry, body);
  }

  function waterfall(entry) {
    const p = entry.palette;
    const data = entry.data;
    const values = [data.start];
    data.steps.forEach(step => values.push(values.at(-1) + step.delta));
    const minValue = Math.min(...values) - 4;
    const maxValue = Math.max(...values) + 4;
    const y = value => map(value, minValue, maxValue, 335, 92);
    const x0 = 82;
    const cw = 82;
    let body = '';
    [50, 60, 70, 80, 90].filter(tick => tick >= minValue && tick <= maxValue).forEach(tick => body += `<line class='g' x1='58' y1='${y(tick)}' x2='600' y2='${y(tick)}'/><text class='l' x='49' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    body += `<rect x='${x0}' y='${y(data.start)}' width='48' height='${y(minValue) - y(data.start)}' fill='${p.c5}'/><text class='v' x='${x0 + 24}' y='${y(data.start) - 8}' text-anchor='middle'>${data.start}</text><text class='l' x='${x0 + 24}' y='359' text-anchor='middle'>BASE</text>`;
    let current = data.start;
    data.steps.forEach((step, index) => {
      const next = current + step.delta;
      const x = x0 + (index + 1) * cw;
      const top = Math.min(y(current), y(next));
      const height = Math.abs(y(current) - y(next));
      const color = step.delta >= 0 ? p.c2 : p.c4;
      body += `<line x1='${x - cw + 48}' y1='${y(current)}' x2='${x}' y2='${y(current)}' stroke='${p.muted}' stroke-dasharray='3 3'/><rect x='${x}' y='${top}' width='48' height='${Math.max(3, height)}' fill='${color}'/><text class='v' x='${x + 24}' y='${step.delta >= 0 ? top - 7 : top + height + 16}' text-anchor='middle'>${step.delta > 0 ? '+' : ''}${step.delta}</text><text class='l' x='${x + 24}' y='359' text-anchor='middle'>${esc(step.label)}</text>`;
      current = next;
    });
    body += `<line x1='${x0}' y1='${y(values.at(-1))}' x2='${x0 + data.steps.length * cw + 48}' y2='${y(values.at(-1))}' stroke='${p.c1}' stroke-width='2'/><text class='s' x='598' y='${y(values.at(-1)) - 7}' text-anchor='end'>FINAL ${values.at(-1)}</text>`;
    return frame(entry, body);
  }

  function winMatrix(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x0 = 196;
    const y0 = 84;
    const cell = 54;
    let body = '';
    data.models.forEach((model, index) => {
      body += `<text class='v' x='${x0 + index * cell + cell / 2}' y='76' text-anchor='middle'>${esc(model)}</text><text class='v' x='${x0 - 12}' y='${y0 + index * cell + 32}' text-anchor='end'>${esc(model)}</text>`;
    });
    data.values.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
      const neutral = rowIndex === colIndex;
      const color = neutral ? p.c5 : value > 50 ? p.c1 : p.c2;
      const opacity = neutral ? .18 : .16 + Math.abs(value - 50) / 20 * .64;
      body += `<rect x='${x0 + colIndex * cell}' y='${y0 + rowIndex * cell}' width='${cell - 3}' height='${cell - 3}' fill='${color}' fill-opacity='${clamp(opacity, .15, .92)}'/><text x='${x0 + colIndex * cell + 25}' y='${y0 + rowIndex * cell + 31}' text-anchor='middle' style='font:700 11px ui-sans-serif;fill:${p.ink}'>${neutral ? '—' : value + '%'}</text>`;
    }));
    body += `<text class='s' x='331' y='373' text-anchor='middle'>row model win rate against column model</text>`;
    return frame(entry, body);
  }

  function quadrant(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 25, 90, 74, 590);
    const y = value => map(value, 30, 90, 338, 88);
    const tx = x(data.xThreshold);
    const ty = y(data.yThreshold);
    let body = `<rect x='${tx}' y='88' width='${590 - tx}' height='${ty - 88}' fill='${p.c3}' fill-opacity='.08'/><rect x='74' y='${ty}' width='${tx - 74}' height='${338 - ty}' fill='${p.c2}' fill-opacity='.08'/><line x1='${tx}' y1='88' x2='${tx}' y2='338' stroke='${p.muted}' stroke-dasharray='5 4'/><line x1='74' y1='${ty}' x2='590' y2='${ty}' stroke='${p.muted}' stroke-dasharray='5 4'/>`;
    body += `<text class='s' x='575' y='104' text-anchor='end'>PRECISE + EXPLORATORY</text><text class='s' x='88' y='326'>LOW-SIGNAL EDITING</text>`;
    [40, 60, 80].forEach(tick => {
      body += `<line class='g' x1='${x(tick)}' y1='88' x2='${x(tick)}' y2='338'/><line class='g' x1='74' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='${x(tick)}' y='359' text-anchor='middle'>${tick}</text><text class='l' x='63' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`;
    });
    data.points.forEach((point, index) => {
      const color = [p.c1, p.c2, p.c3, p.c4, p.c5, p.c6][index];
      body += `<circle cx='${x(point.x)}' cy='${y(point.y)}' r='9' fill='${color}' fill-opacity='.8'/><text class='v' x='${x(point.x) + 11}' y='${y(point.y) - 9}'>${esc(point.label)}</text>`;
    });
    return frame(entry, body);
  }

  function timeSeries(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = index => map(index, 0, data.periods.length - 1, 72, 590);
    const y = value => map(value, 80, 160, 338, 88);
    let body = '';
    data.periods.forEach((period, index) => body += `<line class='g' x1='${x(index)}' y1='88' x2='${x(index)}' y2='338'/><text class='l' x='${x(index)}' y='360' text-anchor='middle'>${esc(period)}</text>`);
    [80, 100, 120, 140, 160].forEach(tick => body += `<line class='g' x1='70' y1='${y(tick)}' x2='592' y2='${y(tick)}'/><text class='l' x='59' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    body += `<line x1='70' y1='${y(100)}' x2='592' y2='${y(100)}' stroke='${p.c5}' stroke-width='2' stroke-dasharray='4 4'/>`;
    data.series.forEach((series, index) => {
      const color = [p.c1, p.c2, p.c3][index];
      const points = series.values.map((value, pointIndex) => [x(pointIndex), y(value)]);
      body += `<path d='${path(points)}' fill='none' stroke='${color}' stroke-width='${index === 0 ? 4 : 3}'/>`;
      points.forEach(point => body += `<circle cx='${point[0]}' cy='${point[1]}' r='4' fill='${p.bg}' stroke='${color}' stroke-width='2'/>`);
      body += `<text class='v' x='${points.at(-1)[0] - 5}' y='${points.at(-1)[1] - 9}' text-anchor='end' fill='${color}'>${esc(series.label)}</text>`;
    });
    data.events.forEach(event => body += `<line x1='${x(event.index)}' y1='88' x2='${x(event.index)}' y2='338' stroke='${p.c4}' stroke-width='2'/><path d='M ${x(event.index)} 88 l 44 0 l -8 14 l -36 0 Z' fill='${p.c4}'/><text x='${x(event.index) + 20}' y='98' text-anchor='middle' style='font:700 8px ui-sans-serif;fill:${p.bg}'>${esc(event.label)}</text>`);
    return frame(entry, body);
  }

  function stackedArea(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = index => map(index, 0, data.labels.length - 1, 72, 590);
    const y = value => map(value, 0, 100, 338, 88);
    const lower = new Array(data.labels.length).fill(0);
    let body = '';
    [0, 25, 50, 75, 100].forEach(tick => body += `<line class='g' x1='70' y1='${y(tick)}' x2='592' y2='${y(tick)}'/><text class='l' x='59' y='${y(tick) + 3}' text-anchor='end'>${tick}%</text>`);
    data.labels.forEach((label, index) => body += `<text class='l' x='${x(index)}' y='360' text-anchor='middle'>${esc(label)}</text>`);
    data.layers.forEach((layer, layerIndex) => {
      const upper = lower.map((value, index) => value + layer.values[index]);
      const topPoints = upper.map((value, index) => [x(index), y(value)]);
      const bottomPoints = [...lower].map((value, index) => [x(index), y(value)]).reverse();
      const color = [p.c1, p.c2, p.c3, p.c4][layerIndex];
      body += `<path d='${path([...topPoints, ...bottomPoints])} Z' fill='${color}' fill-opacity='.82' stroke='${p.bg}' stroke-width='1.5'/>`;
      for (let i = 0; i < lower.length; i++) lower[i] = upper[i];
      body += `<rect x='${118 + layerIndex * 120}' y='374' width='14' height='8' fill='${color}'/><text class='l' x='${138 + layerIndex * 120}' y='382'>${esc(layer.label)}</text>`;
    });
    return frame(entry, body);
  }

  function swimlane(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 100, 156, 592);
    let body = '';
    [0, 20, 40, 60, 80, 100].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='82' x2='${x(tick)}' y2='342'/><text class='l' x='${x(tick)}' y='367' text-anchor='middle'>${tick}s</text>`);
    data.lanes.forEach((lane, laneIndex) => {
      const y = 105 + laneIndex * 61;
      const color = [p.c1, p.c2, p.c3, p.c4][laneIndex];
      body += `<text class='v' x='139' y='${y + 16}' text-anchor='end'>${esc(lane.label)}</text><line x1='156' y1='${y + 12}' x2='592' y2='${y + 12}' stroke='${p.grid}'/>`;
      lane.segments.forEach((segment, segmentIndex) => body += `<rect x='${x(segment[0])}' y='${y}' width='${x(segment[1]) - x(segment[0])}' height='25' rx='3' fill='${color}' fill-opacity='${segmentIndex ? .62 : .9}'/><text x='${(x(segment[0]) + x(segment[1])) / 2}' y='${y + 17}' text-anchor='middle' style='font:700 8px ui-monospace;fill:${p.bg}'>${segment[1] - segment[0]}s</text>`);
    });
    data.retries.forEach(value => body += `<path d='M ${x(value)} 78 l 7 10 l -14 0 Z' fill='${p.c4}'/><text class='s' x='${x(value)}' y='73' text-anchor='middle'>RETRY</text>`);
    return frame(entry, body);
  }

  function sankey(entry) {
    const p = entry.palette;
    const data = entry.data;
    const columns = [data.left, data.middle, data.right];
    const xs = [64, 286, 522];
    const nodeW = 54;
    const usable = 232;
    const gap = 13;
    const layouts = columns.map(column => {
      let cursor = 98;
      return column.map(node => {
        const height = node.value / 100 * usable;
        const layout = { ...node, y: cursor, h: height, cy: cursor + height / 2 };
        cursor += height + gap;
        return layout;
      });
    });
    const leftFlows = [[30, 8, 4], [4, 28, 3], [3, 3, 17]];
    const rightFlows = [[30, 5, 2], [27, 8, 4], [14, 5, 5]];
    let body = '';
    leftFlows.forEach((row, from) => row.forEach((value, to) => {
      body += `<path d='M ${xs[0] + nodeW} ${layouts[0][from].cy} C 190 ${layouts[0][from].cy}, 205 ${layouts[1][to].cy}, ${xs[1]} ${layouts[1][to].cy}' fill='none' stroke='${[p.c1, p.c2, p.c3][from]}' stroke-width='${Math.max(3, value * .65)}' stroke-opacity='.3'/>`;
    }));
    rightFlows.forEach((row, from) => row.forEach((value, to) => {
      body += `<path d='M ${xs[1] + nodeW} ${layouts[1][from].cy} C 410 ${layouts[1][from].cy}, 435 ${layouts[2][to].cy}, ${xs[2]} ${layouts[2][to].cy}' fill='none' stroke='${[p.c4, p.c5, p.c1][to]}' stroke-width='${Math.max(3, value * .65)}' stroke-opacity='.3'/>`;
    }));
    layouts.forEach((column, colIndex) => column.forEach((node, nodeIndex) => {
      const color = colIndex === 2 ? [p.c4, p.c5, p.c1][nodeIndex] : [p.c1, p.c2, p.c3][nodeIndex];
      body += `<rect x='${xs[colIndex]}' y='${node.y}' width='${nodeW}' height='${node.h}' fill='${color}'/><text class='v' x='${xs[colIndex] + nodeW / 2}' y='${node.cy + 4}' text-anchor='middle'>${node.value}</text><text class='l' x='${xs[colIndex] + nodeW / 2}' y='${node.y - 6}' text-anchor='middle'>${esc(node.label)}</text>`;
    }));
    body += `<text class='s' x='91' y='372' text-anchor='middle'>INTENT</text><text class='s' x='313' y='372' text-anchor='middle'>TOOL</text><text class='s' x='549' y='372' text-anchor='middle'>OUTCOME</text>`;
    return frame(entry, body);
  }

  function survival(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 60, 72, 590);
    const y = value => map(value, 0, 100, 338, 88);
    let body = `<line x1='72' y1='${y(50)}' x2='590' y2='${y(50)}' stroke='${p.c3}' stroke-width='2' stroke-dasharray='5 4'/><text class='s' x='586' y='${y(50) - 7}' text-anchor='end'>median unfinished</text>`;
    [0, 15, 30, 45, 60].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='88' x2='${x(tick)}' y2='338'/><text class='l' x='${x(tick)}' y='360' text-anchor='middle'>${tick}m</text>`);
    [0, 25, 50, 75, 100].forEach(tick => body += `<line class='g' x1='72' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='60' y='${y(tick) + 3}' text-anchor='end'>${tick}%</text>`);
    data.series.forEach((series, index) => {
      const color = index === 0 ? p.c4 : p.c5;
      body += `<path d='${stepPath(series.points, x, y)}' fill='none' stroke='${color}' stroke-width='4'/>`;
      const last = series.points.at(-1);
      body += `<text class='v' x='${x(last[0]) - 4}' y='${y(last[1]) - 10}' text-anchor='end'>${esc(series.label)}</text><path d='M ${x(52) - 5} ${y(index ? 50 : 25)} l 10 10 M ${x(52) + 5} ${y(index ? 50 : 25)} l -10 10' stroke='${color}' stroke-width='2'/>`;
    });
    return frame(entry, body);
  }

  function cumulative(entry) {
    const p = entry.palette;
    const data = entry.data;
    const x = value => map(value, 0, 60, 72, 590);
    const y = value => map(value, 0, 6, 338, 88);
    let body = '';
    [0, 10, 20, 30, 40, 50, 60].forEach(tick => body += `<line class='g' x1='${x(tick)}' y1='88' x2='${x(tick)}' y2='338'/><text class='l' x='${x(tick)}' y='360' text-anchor='middle'>${tick}m</text>`);
    [0, 1, 2, 3, 4, 5, 6].forEach(tick => body += `<line class='g' x1='72' y1='${y(tick)}' x2='590' y2='${y(tick)}'/><text class='l' x='61' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    data.series.forEach((series, index) => {
      const color = index === 0 ? p.c1 : p.c2;
      body += `<path d='${stepPath(series.points, x, y)}' fill='none' stroke='${color}' stroke-width='5'/>`;
      series.points.slice(1).forEach(point => body += `<circle cx='${x(point[0])}' cy='${y(point[1])}' r='5' fill='${p.bg}' stroke='${color}' stroke-width='3'/>`);
      const last = series.points.at(-1);
      body += `<text class='v' x='${x(last[0]) - 6}' y='${y(last[1]) - 10}' text-anchor='end'>${esc(series.label)} · ${last[1]}</text>`;
    });
    return frame(entry, body);
  }

  function cylinder(entry) {
    const p = entry.palette;
    const items = entry.data.items;
    const bottom = 326;
    let body = `<line class='a' x1='58' y1='${bottom + 8}' x2='600' y2='${bottom + 8}'/>`;
    [0, 25, 50, 75, 100].forEach(tick => {
      const y = map(tick, 0, 100, bottom, 91);
      body += `<line class='g' x1='58' y1='${y}' x2='600' y2='${y}'/><text class='l' x='48' y='${y + 3}' text-anchor='end'>${tick}</text>`;
    });
    items.forEach((item, index) => {
      const cx = 126 + index * 134;
      const width = 68;
      const height = map(item.value, 0, 100, 0, 226);
      const top = bottom - height;
      const color = [p.c5, p.c2, p.c1, p.c4][index];
      body += `<ellipse cx='${cx}' cy='${bottom}' rx='${width / 2}' ry='11' fill='${color}' fill-opacity='.45'/><rect x='${cx - width / 2}' y='${top}' width='${width}' height='${height}' fill='${color}' fill-opacity='.78'/><ellipse cx='${cx}' cy='${top}' rx='${width / 2}' ry='11' fill='${color}'/><ellipse cx='${cx}' cy='${bottom}' rx='${width / 2}' ry='11' fill='none' stroke='${color}' stroke-width='2'/><text class='v' x='${cx}' y='${top - 20}' text-anchor='middle'>${item.value}</text><text class='v' x='${cx}' y='364' text-anchor='middle'>${esc(item.label)}</text>`;
    });
    return frame(entry, body);
  }

  function waffle(entry) {
    const p = entry.palette;
    const parts = entry.data.parts;
    const colors = [p.c1, p.c2, p.c3, p.c4, p.c5];
    const starts = [];
    let cursor = 0;
    parts.forEach(part => { starts.push(cursor); cursor += part.value; });
    let body = '';
    for (let i = 0; i < 100; i++) {
      const partIndex = parts.findIndex((part, index) => i >= starts[index] && i < starts[index] + part.value);
      const col = i % 10;
      const row = 9 - Math.floor(i / 10);
      body += `<rect x='${66 + col * 29}' y='${92 + row * 25}' width='23' height='19' rx='2' fill='${colors[partIndex]}' fill-opacity='.88'/>`;
    }
    parts.forEach((part, index) => {
      body += `<rect x='405' y='${108 + index * 47}' width='16' height='16' fill='${colors[index]}'/><text class='v' x='433' y='${121 + index * 47}'>${esc(part.label)}</text><text class='v' x='578' y='${121 + index * 47}' text-anchor='end'>${part.value}%</text>`;
    });
    body += `<text class='s' x='210' y='363' text-anchor='middle'>100 manually audited outputs</text>`;
    return frame(entry, body);
  }

  function treemap(entry) {
    const p = entry.palette;
    const items = entry.data.items;
    const x = 48;
    const y = 86;
    const width = 544;
    const height = 250;
    const firstW = width * .38;
    const remainingW = width - firstW;
    const topH = height * (items[1].value / 62);
    const colors = [p.c1, p.c2, p.c3, p.c4, p.c5];
    let body = `<rect x='${x}' y='${y}' width='${firstW - 4}' height='${height}' fill='${colors[0]}' fill-opacity='.82'/><text x='${x + 16}' y='${y + 28}' style='font:700 17px ui-sans-serif;fill:${p.bg}'>${esc(items[0].label)}</text><text x='${x + 16}' y='${y + 50}' style='font:700 12px ui-sans-serif;fill:${p.bg}'>${items[0].value}%</text>`;
    body += `<rect x='${x + firstW}' y='${y}' width='${remainingW}' height='${topH - 4}' fill='${colors[1]}' fill-opacity='.82'/><text class='t' x='${x + firstW + 14}' y='${y + 28}'>${esc(items[1].label)}</text><text class='v' x='${x + firstW + 14}' y='${y + 48}'>${items[1].value}%</text>`;
    const bottomY = y + topH;
    const bottomH = height - topH;
    const bottomTotal = items.slice(2).reduce((sum, item) => sum + item.value, 0);
    let bx = x + firstW;
    items.slice(2).forEach((item, index) => {
      const w = remainingW * item.value / bottomTotal;
      body += `<rect x='${bx}' y='${bottomY}' width='${w - 4}' height='${bottomH}' fill='${colors[index + 2]}' fill-opacity='.82'/><text class='v' x='${bx + 10}' y='${bottomY + 24}'>${esc(item.label)}</text><text class='s' x='${bx + 10}' y='${bottomY + 43}'>${item.value}%</text>`;
      bx += w;
    });
    body += `<text class='s' x='320' y='369' text-anchor='middle'>area = share of benchmark questions</text>`;
    return frame(entry, body);
  }

  function beeswarm(entry) {
    const p = entry.palette;
    const groups = entry.data.groups;
    const y = value => map(value, 30, 95, 338, 88);
    let body = '';
    [30, 50, 70, 90].forEach(tick => body += `<line class='g' x1='64' y1='${y(tick)}' x2='602' y2='${y(tick)}'/><text class='l' x='54' y='${y(tick) + 3}' text-anchor='end'>${tick}</text>`);
    groups.forEach((group, groupIndex) => {
      const cx = 124 + groupIndex * 137;
      const color = [p.c1, p.c2, p.c3, p.c4][groupIndex];
      group.values.forEach((value, valueIndex) => {
        const jitter = (((valueIndex * 7 + groupIndex * 3) % 11) - 5) * 3.8;
        body += `<circle cx='${cx + jitter}' cy='${y(value)}' r='6' fill='${color}' fill-opacity='.58' stroke='${p.bg}' stroke-width='1.5'/>`;
      });
      const mid = median(group.values);
      body += `<line x1='${cx - 34}' y1='${y(mid)}' x2='${cx + 34}' y2='${y(mid)}' stroke='${p.ink}' stroke-width='4'/><text class='v' x='${cx}' y='363' text-anchor='middle'>${esc(group.label)}</text><text class='s' x='${cx}' y='${y(mid) - 8}' text-anchor='middle'>med ${mid}</text>`;
    });
    return frame(entry, body);
  }

  const renderers = {
    masterTable,
    lollipop,
    groupedHatch,
    dumbbell,
    slopegraph,
    bump,
    frontier,
    saturation,
    dualAxis,
    logScaling,
    bubble,
    pareto,
    radar,
    smallMultiples,
    parallel,
    polarRose,
    glyphGrid,
    rings,
    forest,
    violin,
    boxplot,
    ridge,
    ecdf,
    reliability,
    heatmap,
    confusion,
    contextDecay,
    waterfall,
    winMatrix,
    quadrant,
    timeSeries,
    stackedArea,
    swimlane,
    sankey,
    survival,
    cumulative,
    cylinder,
    waffle,
    treemap,
    beeswarm
  };

  window.BENCHMARK_RENDERERS = renderers;
  window.renderBenchmark = function renderBenchmark(entry) {
    const renderer = renderers[entry.renderer];
    if (!renderer) throw new Error(`Missing renderer: ${entry.renderer}`);
    return renderer(entry).trim();
  };
})();
