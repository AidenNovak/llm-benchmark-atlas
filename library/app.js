(function () {
  'use strict';

  const state = {
    query: '',
    family: 'all',
    sourceType: 'all',
    vendor: 'all',
    view: 'gallery',
    selected: null
  };

  const esc = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');

  function unique(values) {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }

  function optionMarkup(values) {
    return values.map(value => `<option value='${esc(value)}'>${esc(value)}</option>`).join('');
  }

  function searchableText(entry) {
    return [
      entry.name,
      entry.chartLabel,
      entry.family,
      entry.source,
      entry.sourceType,
      entry.visualSystem,
      entry.grammar,
      entry.description,
      entry.useWhen,
      ...entry.tags
    ].join(' ').toLocaleLowerCase('zh-CN');
  }

  function filteredComponents() {
    const query = state.query.trim().toLocaleLowerCase('zh-CN');
    return window.BENCHMARK_COMPONENTS.filter(entry => {
      if (state.family !== 'all' && entry.family !== state.family) return false;
      if (state.sourceType !== 'all' && entry.sourceType !== state.sourceType) return false;
      if (state.vendor !== 'all' && entry.source !== state.vendor) return false;
      return !query || searchableText(entry).includes(query);
    });
  }

  function cardMarkup(entry, index) {
    return `
      <article class='component-card' data-id='${esc(entry.id)}' style='--chart-bg:${entry.palette.bg}'>
        <button class='preview-button' type='button' data-open='${esc(entry.id)}' aria-label='放大查看 ${esc(entry.name)}'>
          <span class='chart-preview'>${window.renderBenchmark(entry)}</span>
        </button>
        <div class='card-body'>
          <div class='card-head'>
            <div>
              <p class='card-kicker'>${esc(entry.family)}</p>
              <h3 class='card-title'>${esc(entry.name)}</h3>
            </div>
            <span class='card-index'>${String(index + 1).padStart(2, '0')}</span>
          </div>
          <p class='card-description'>${esc(entry.description)}</p>
          <div class='card-foot'>
            <span class='chip'>${esc(entry.sourceType)}</span>
            <span class='chip'>${esc(entry.grammar.split(' + ')[0])}</span>
            <span class='source-name'>${esc(entry.source)}</span>
          </div>
        </div>
      </article>`;
  }

  function renderCatalog() {
    const entries = filteredComponents();
    const grid = document.getElementById('component-grid');
    const empty = document.getElementById('empty-state');
    grid.classList.toggle('compact', state.view === 'compact');
    grid.innerHTML = entries.map(cardMarkup).join('');
    empty.hidden = entries.length !== 0;
    document.getElementById('result-count').textContent = entries.length;

    const summary = [];
    summary.push(state.family === 'all' ? '全部家族' : state.family);
    summary.push(state.sourceType === 'all' ? '全部来源' : state.sourceType);
    if (state.vendor !== 'all') summary.push(state.vendor);
    if (state.query.trim()) summary.push(`“${state.query.trim()}”`);
    document.getElementById('active-summary').textContent = summary.join(' · ');
    document.getElementById('reset-filters').hidden = state.family === 'all' && state.sourceType === 'all' && state.vendor === 'all' && !state.query.trim();
  }

  function renderCoverage() {
    const components = window.BENCHMARK_COMPONENTS;
    const families = unique(components.map(entry => entry.family));
    const max = Math.max(...families.map(family => components.filter(entry => entry.family === family).length));
    const rows = families.map(family => {
      const entries = components.filter(entry => entry.family === family);
      const sources = new Set(entries.map(entry => entry.source)).size;
      const grammars = new Set(entries.map(entry => entry.grammar)).size;
      return `
        <tr>
          <td><strong>${esc(family)}</strong></td>
          <td>${sources} 个来源谱系</td>
          <td>${grammars} 个独立语法</td>
          <td><span class='coverage-bar' aria-hidden='true'><i style='width:${entries.length / max * 100}%'></i></span>${entries.length}</td>
        </tr>`;
    }).join('');
    document.getElementById('family-coverage').innerHTML = `
      <table class='coverage-table'>
        <thead><tr><th>图表家族</th><th>来源</th><th>唯一性</th><th>组件</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function renderSources() {
    const components = window.BENCHMARK_COMPONENTS;
    const sourceKeys = unique(components.map(entry => entry.sourceKey));
    document.getElementById('source-index').innerHTML = sourceKeys.map(key => {
      const source = window.BENCHMARK_SOURCES[key];
      const count = components.filter(entry => entry.sourceKey === key).length;
      return `
        <article class='source-item'>
          <strong>${esc(source.name)}</strong>
          <span>${esc(source.type)} · ${count} 个组件谱系</span>
          <a href='${esc(source.url)}' target='_blank' rel='noreferrer'>${esc(source.url)}</a>
        </article>`;
    }).join('');
  }

  function renderStats() {
    const components = window.BENCHMARK_COMPONENTS;
    document.getElementById('stat-components').textContent = components.length;
    document.getElementById('stat-grammars').textContent = new Set(components.map(entry => entry.grammar)).size;
    document.getElementById('stat-lineages').textContent = new Set(components.map(entry => entry.sourceKey)).size;
  }

  function openDialog(id) {
    const entry = window.BENCHMARK_COMPONENTS.find(item => item.id === id);
    if (!entry) return;
    state.selected = entry;
    const dialog = document.getElementById('detail-dialog');
    document.getElementById('dialog-kicker').textContent = `${entry.family} / ${entry.visualSystem}`;
    document.getElementById('dialog-title').textContent = entry.name;
    document.getElementById('dialog-preview').style.setProperty('--chart-bg', entry.palette.bg);
    document.getElementById('dialog-preview').innerHTML = window.renderBenchmark(entry);
    document.getElementById('dialog-description').textContent = entry.description;
    document.getElementById('dialog-use').innerHTML = `<strong>适用判断：</strong>${esc(entry.useWhen)}`;
    document.getElementById('dialog-facts').innerHTML = [
      ['图表家族', entry.family],
      ['唯一语法', entry.grammar],
      ['视觉系统', entry.visualSystem],
      ['来源类型', entry.sourceType],
      ['来源谱系', entry.source],
      ['数据状态', '示意数据']
    ].map(([label, value]) => `<dl class='fact'><dt>${esc(label)}</dt><dd>${esc(value)}</dd></dl>`).join('');
    document.getElementById('dialog-json').textContent = JSON.stringify({
      id: entry.id,
      renderer: entry.renderer,
      grammar: entry.grammar,
      source: entry.source,
      sourceUrl: entry.sourceUrl,
      dataNote: entry.dataNote,
      data: entry.data
    }, null, 2);
    document.getElementById('source-link').href = entry.sourceUrl;
    if (!dialog.open) dialog.showModal();
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2200);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  function downloadSelectedSvg() {
    if (!state.selected) return;
    const svg = window.renderBenchmark(state.selected);
    const blob = new Blob([`<?xml version='1.0' encoding='UTF-8'?>\n${svg}`], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.selected.id}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('SVG 已下载');
  }

  function populateFilters() {
    const components = window.BENCHMARK_COMPONENTS;
    document.getElementById('family-filter').insertAdjacentHTML('beforeend', optionMarkup(unique(components.map(entry => entry.family))));
    document.getElementById('source-filter').insertAdjacentHTML('beforeend', optionMarkup(unique(components.map(entry => entry.sourceType))));
    document.getElementById('vendor-filter').insertAdjacentHTML('beforeend', optionMarkup(unique(components.map(entry => entry.source))));
  }

  function resetFilters() {
    state.query = '';
    state.family = 'all';
    state.sourceType = 'all';
    state.vendor = 'all';
    document.getElementById('search').value = '';
    document.getElementById('family-filter').value = 'all';
    document.getElementById('source-filter').value = 'all';
    document.getElementById('vendor-filter').value = 'all';
    renderCatalog();
  }

  function bindEvents() {
    document.getElementById('search').addEventListener('input', event => {
      state.query = event.target.value;
      renderCatalog();
    });
    document.getElementById('family-filter').addEventListener('change', event => {
      state.family = event.target.value;
      renderCatalog();
    });
    document.getElementById('source-filter').addEventListener('change', event => {
      state.sourceType = event.target.value;
      renderCatalog();
    });
    document.getElementById('vendor-filter').addEventListener('change', event => {
      state.vendor = event.target.value;
      renderCatalog();
    });
    document.querySelector('.view-switch').addEventListener('click', event => {
      const button = event.target.closest('[data-view]');
      if (!button) return;
      state.view = button.dataset.view;
      document.querySelectorAll('[data-view]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderCatalog();
    });
    document.getElementById('component-grid').addEventListener('click', event => {
      const trigger = event.target.closest('[data-open]');
      if (trigger) openDialog(trigger.dataset.open);
    });
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    document.getElementById('close-dialog').addEventListener('click', () => document.getElementById('detail-dialog').close());
    document.getElementById('detail-dialog').addEventListener('click', event => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    });
    document.getElementById('download-svg').addEventListener('click', downloadSelectedSvg);
    document.getElementById('copy-json').addEventListener('click', async () => {
      if (!state.selected) return;
      const payload = document.getElementById('dialog-json').textContent;
      try {
        await copyText(payload);
        showToast('组件 JSON 已复制');
      } catch (error) {
        showToast('复制失败，请手动选择数据');
      }
    });
  }

  function init() {
    populateFilters();
    renderStats();
    renderCatalog();
    renderCoverage();
    renderSources();
    bindEvents();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
