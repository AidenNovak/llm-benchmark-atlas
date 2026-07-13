import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const site = new URL('_site/', root);

fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(site, { recursive: true });
fs.cpSync(new URL('library/', root), site, { recursive: true });

const read = relative => fs.readFileSync(new URL(relative, root), 'utf8');
const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
const escapeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');
const sandbox = { window: {} };
vm.createContext(sandbox);

for (const file of ['catalog.js', 'renderers.js', 'vendor-series.js', 'research-series.js', 'asian-series.js', 'lab-series.js', 'lab-systems-series.js', 'frontier-systems-series.js', 'api.js']) {
  vm.runInContext(read(`library/${file}`), sandbox, { filename: file });
}

const components = sandbox.window.BenchmarkAtlas.list();
const render = entry => sandbox.window.BenchmarkAtlas.render(entry);
const componentDirectory = new URL('components/', site);
fs.mkdirSync(componentDirectory, { recursive: true });

function componentPage(entry) {
  const pageUrl = `https://aidennovak.github.io/llm-benchmark-atlas/components/${entry.id}.html`;
  const imageUrl = 'https://aidennovak.github.io/llm-benchmark-atlas/social-card.png';
  const keywords = [...new Set(['LLM benchmark', 'data visualization', 'SVG component', entry.family, entry.source, ...entry.tags])];
  const evidence = entry.evidence
    ? `<section class="component-section"><p class="eyebrow">Figure-level evidence</p><h2>${escapeHtml(entry.evidence.locator)} · PDF p.${entry.evidence.page}</h2><p>${escapeHtml(entry.evidence.summary)}</p><dl class="evidence-facts"><div><dt>Verified</dt><dd>${escapeHtml(entry.evidence.verifiedAt)}</dd></div><div><dt>Paper source</dt><dd><a href="${escapeHtml(entry.sourceUrl)}" rel="noreferrer">${escapeHtml(entry.source)}</a></dd></div></dl></section>`
    : `<section class="component-section"><p class="eyebrow">Source lineage</p><h2>${escapeHtml(entry.source)}</h2><p>${escapeHtml(sandbox.window.BENCHMARK_SOURCES[entry.sourceKey].note)}</p><a class="text-link" href="${escapeHtml(entry.sourceUrl)}" rel="noreferrer">Open formal source ↗</a></section>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: `${entry.name} · Benchmark Atlas`,
    description: entry.description,
    url: pageUrl,
    codeRepository: 'https://github.com/AidenNovak/llm-benchmark-atlas',
    programmingLanguage: ['JavaScript', 'SVG'],
    license: 'https://opensource.org/license/mit',
    author: { '@type': 'Person', name: 'Aiden Novak', url: 'https://x.com/logiclogic1223', sameAs: ['https://x.com/logiclogic1223', 'https://github.com/AidenNovak'] },
    isPartOf: { '@type': 'SoftwareApplication', name: 'Benchmark Atlas', url: 'https://aidennovak.github.io/llm-benchmark-atlas/' },
    keywords: keywords.join(', ')
  };
  const related = components
    .filter(candidate => candidate.id !== entry.id && candidate.family === entry.family)
    .slice(0, 4);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(entry.description)} ${escapeHtml(entry.useWhen)}">
  <meta name="keywords" content="${escapeHtml(keywords.join(', '))}">
  <meta name="author" content="Aiden Novak">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#f4f4f1">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Benchmark Atlas">
  <meta property="og:title" content="${escapeHtml(entry.name)} · Benchmark Atlas">
  <meta property="og:description" content="${escapeHtml(entry.description)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:creator" content="@logiclogic1223">
  <meta name="twitter:title" content="${escapeHtml(entry.name)} · Benchmark Atlas">
  <meta name="twitter:description" content="${escapeHtml(entry.description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <title>${escapeHtml(entry.name)} · LLM Benchmark SVG Component</title>
  <link rel="canonical" href="${pageUrl}">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="stylesheet" href="../component-page.css">
  <script type="application/ld+json">${escapeJson(schema)}</script>
</head>
<body>
  <header class="component-nav"><a class="component-brand" href="../">Benchmark Atlas</a><nav><a href="../about.html">产品详解</a><a href="https://x.com/logiclogic1223" rel="me noreferrer">X · @logiclogic1223</a><a href="https://github.com/AidenNovak/llm-benchmark-atlas">GitHub</a></nav></header>
  <main>
    <nav class="breadcrumbs" aria-label="面包屑"><a href="../">组件目录</a><span>/</span><span>${escapeHtml(entry.family)}</span><span>/</span><span aria-current="page">${escapeHtml(entry.name)}</span></nav>
    <article>
      <header class="component-hero">
        <p class="eyebrow">${escapeHtml(entry.family)} · ${escapeHtml(entry.sourceType)}</p>
        <h1>${escapeHtml(entry.name)}</h1>
        <p class="component-lede">${escapeHtml(entry.description)}</p>
        <div class="component-tags">${entry.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </header>
      <figure class="component-figure" style="--chart-bg:${escapeHtml(entry.palette.bg)}">${render(entry)}<figcaption>Illustrative demo data · renderer: <code>${escapeHtml(entry.renderer)}</code></figcaption></figure>
      <div class="component-columns">
        <section class="component-section"><p class="eyebrow">Information grammar</p><h2>它如何组织信息</h2><p>${escapeHtml(entry.grammar)}</p><dl class="evidence-facts"><div><dt>Visual system</dt><dd>${escapeHtml(entry.visualSystem)}</dd></div><div><dt>Component ID</dt><dd><code>${escapeHtml(entry.id)}</code></dd></div></dl></section>
        <section class="component-section component-use"><p class="eyebrow">Use when</p><h2>适用判断</h2><p>${escapeHtml(entry.useWhen)}</p></section>
      </div>
      ${evidence}
      <section class="component-section"><p class="eyebrow">Structured data</p><h2>可替换的数据模型</h2><p>${escapeHtml(entry.dataNote)}</p><pre><code>${escapeHtml(JSON.stringify(entry.data, null, 2))}</code></pre></section>
      <section class="component-section"><p class="eyebrow">Related components</p><h2>同一图表家族的其他语法</h2><div class="related-grid">${related.map(candidate => `<a href="${candidate.id}.html"><strong>${escapeHtml(candidate.name)}</strong><span>${escapeHtml(candidate.grammar)}</span></a>`).join('')}</div></section>
      <nav class="component-actions" aria-label="后续操作"><a href="../#catalog">浏览全部 83 个组件</a><a href="https://github.com/AidenNovak/llm-benchmark-atlas">在 GitHub 查看源码</a></nav>
    </article>
  </main>
  <footer><span>Benchmark Atlas · source-grounded, duplication-checked</span><a href="https://x.com/logiclogic1223" rel="me noreferrer">Built by @logiclogic1223</a></footer>
</body>
</html>`;
}

for (const entry of components) {
  fs.writeFileSync(new URL(`${entry.id}.html`, componentDirectory), componentPage(entry), 'utf8');
}

const families = [...new Set(components.map(entry => entry.family))];
const componentIndex = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Benchmark Atlas 的 83 个 LLM benchmark SVG 组件静态索引，按图表家族浏览模型发布、排行榜和论文图表语法。">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="Benchmark Atlas · 83 个 LLM Benchmark SVG 组件">
  <meta property="og:description" content="按图表家族浏览 83 个来源可追溯、语法去重的 benchmark 可视化组件。">
  <meta property="og:url" content="https://aidennovak.github.io/llm-benchmark-atlas/components/">
  <meta property="og:image" content="https://aidennovak.github.io/llm-benchmark-atlas/social-card.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:creator" content="@logiclogic1223">
  <title>83 个 LLM Benchmark SVG 组件 · Benchmark Atlas</title>
  <link rel="canonical" href="https://aidennovak.github.io/llm-benchmark-atlas/components/">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../component-page.css">
</head>
<body>
  <header class="component-nav"><a class="component-brand" href="../">Benchmark Atlas</a><nav><a href="../about.html">产品详解</a><a href="https://x.com/logiclogic1223" rel="me noreferrer">X · @logiclogic1223</a><a href="https://github.com/AidenNovak/llm-benchmark-atlas">GitHub</a></nav></header>
  <main>
    <header class="component-hero"><p class="eyebrow">Static component index</p><h1>83 个组件。<br>83 种信息语法。</h1><p class="component-lede">无需运行 JavaScript，即可按图表家族浏览 Benchmark Atlas 的全部独立组件、来源谱系和适用场景。</p></header>
    ${families.map(family => `<section class="index-family"><div><p class="eyebrow">${escapeHtml(family)}</p><h2>${components.filter(entry => entry.family === family).length} 个组件</h2></div><div class="index-links">${components.filter(entry => entry.family === family).map(entry => `<a href="${entry.id}.html"><strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.source)} · ${escapeHtml(entry.renderer)}</span><small>${escapeHtml(entry.description)}</small></a>`).join('')}</div></section>`).join('')}
  </main>
  <footer><span>Benchmark Atlas · static component index</span><a href="https://x.com/logiclogic1223" rel="me noreferrer">Built by @logiclogic1223</a></footer>
</body>
</html>`;
fs.writeFileSync(new URL('index.html', componentDirectory), componentIndex, 'utf8');

const llmsText = `# Benchmark Atlas

> A source-grounded, duplication-checked component atlas for LLM benchmark charts, model launches, independent leaderboards, and research-paper figures.

## Primary pages

- [Product story](https://aidennovak.github.io/llm-benchmark-atlas/about.html): Editorial explanation of the product principles, provenance workflow, and quality gates.
- [Interactive catalog](https://aidennovak.github.io/llm-benchmark-atlas/): Search, filter, inspect, export SVG, and copy component JSON.
- [Static component index](https://aidennovak.github.io/llm-benchmark-atlas/components/): Crawlable list of all 83 components.
- [Machine-readable catalog](https://aidennovak.github.io/llm-benchmark-atlas/catalog.generated.json): Full source registry and component metadata.
- [JSON Schema](https://aidennovak.github.io/llm-benchmark-atlas/schema/catalog.schema.json): Catalog data contract.
- [GitHub repository](https://github.com/AidenNovak/llm-benchmark-atlas): MIT-licensed source code.

## Identity

- Author: Aiden Novak
- X: https://x.com/logiclogic1223
- GitHub: https://github.com/AidenNovak

## Component pages

${components.map(entry => `- [${entry.name}](https://aidennovak.github.io/llm-benchmark-atlas/components/${entry.id}.html): ${entry.description}`).join('\n')}
`;
fs.writeFileSync(new URL('llms.txt', site), llmsText, 'utf8');

for (const directory of ['schema', 'types']) {
  const destination = new URL(`${directory}/`, site);
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(new URL(`${directory}/`, root), destination, { recursive: true });
}

fs.writeFileSync(new URL('.nojekyll', site), '', 'utf8');

const staticUrls = [
  { loc: 'https://aidennovak.github.io/llm-benchmark-atlas/', priority: '1.0', changefreq: 'weekly' },
  { loc: 'https://aidennovak.github.io/llm-benchmark-atlas/about.html', priority: '0.9', changefreq: 'monthly' },
  { loc: 'https://aidennovak.github.io/llm-benchmark-atlas/components/', priority: '0.9', changefreq: 'weekly' }
];
const componentUrls = components.map(entry => ({ loc: `https://aidennovak.github.io/llm-benchmark-atlas/components/${entry.id}.html`, priority: '0.7', changefreq: 'monthly' }));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...componentUrls].map(item => `  <url><loc>${item.loc}</loc><lastmod>2026-07-13</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority></url>`).join('\n')}
</urlset>\n`;
fs.writeFileSync(new URL('sitemap.xml', site), sitemap, 'utf8');
console.log(`assembled static site in _site/ with ${components.length} indexable component pages`);
