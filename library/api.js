(function () {
  'use strict';

  const sources = window.BENCHMARK_SOURCES;
  const components = window.BENCHMARK_COMPONENTS;
  const renderers = window.BENCHMARK_RENDERERS;

  const clone = value => JSON.parse(JSON.stringify(value));
  const normalize = value => String(value || '').trim().toLocaleLowerCase();

  function assertUnique(field, value, exceptId) {
    const duplicate = components.find(entry => entry.id !== exceptId && entry[field] === value);
    if (duplicate) throw new Error(`${field} already used by ${duplicate.id}`);
  }

  function validateSource(key, source) {
    if (!key || !/^[a-z][a-zA-Z0-9]*$/.test(key)) throw new Error('source key must be lower camelCase');
    if (!source?.name || !source?.type || !source?.url?.startsWith('https://')) {
      throw new Error('source requires name, type, and an HTTPS url');
    }
  }

  function validateComponent(entry) {
    const required = ['id', 'name', 'family', 'sourceKey', 'visualSystem', 'grammar', 'renderer', 'description', 'useWhen', 'data'];
    const missing = required.filter(field => !entry[field]);
    if (missing.length) throw new Error(`component missing: ${missing.join(', ')}`);
    if (!sources[entry.sourceKey]) throw new Error(`unknown sourceKey: ${entry.sourceKey}`);
    if (!renderers[entry.renderer]) throw new Error(`unknown renderer: ${entry.renderer}`);
    ['id', 'grammar', 'visualSystem', 'renderer'].forEach(field => assertUnique(field, entry[field], entry.id));
  }

  function hydrateSource(entry) {
    const source = sources[entry.sourceKey];
    return Object.assign({}, entry, {
      source: source.name,
      sourceType: source.type,
      sourceUrl: source.url,
      dataNote: entry.dataNote || '示意数据，仅复现信息结构，不代表最新榜单结果。'
    });
  }

  const api = {
    version: '0.4.0',

    stats() {
      return {
        components: components.length,
        grammars: new Set(components.map(entry => entry.grammar)).size,
        visualSystems: new Set(components.map(entry => entry.visualSystem)).size,
        renderers: new Set(components.map(entry => entry.renderer)).size,
        sources: new Set(components.map(entry => entry.sourceKey)).size,
        families: new Set(components.map(entry => entry.family)).size
      };
    },

    list() {
      return components.map(clone);
    },

    get(id) {
      const entry = components.find(component => component.id === id);
      return entry ? clone(entry) : null;
    },

    query(filters = {}) {
      const query = normalize(filters.query);
      return components.filter(entry => {
        if (filters.family && filters.family !== 'all' && entry.family !== filters.family) return false;
        if (filters.sourceType && filters.sourceType !== 'all' && entry.sourceType !== filters.sourceType) return false;
        if (filters.source && filters.source !== 'all' && entry.source !== filters.source) return false;
        if (filters.tags?.length && !filters.tags.every(tag => entry.tags.includes(tag))) return false;
        if (!query) return true;
        const haystack = normalize([
          entry.id,
          entry.name,
          entry.chartLabel,
          entry.family,
          entry.source,
          entry.sourceType,
          entry.grammar,
          entry.description,
          entry.useWhen,
          ...entry.tags
        ].join(' '));
        return haystack.includes(query);
      }).map(clone);
    },

    listSources() {
      return Object.entries(sources).map(([key, source]) => ({ key, ...clone(source) }));
    },

    render(idOrEntry) {
      const entry = typeof idOrEntry === 'string'
        ? components.find(component => component.id === idOrEntry)
        : idOrEntry;
      if (!entry) throw new Error('component not found');
      return window.renderBenchmark(entry);
    },

    registerSource(key, source) {
      validateSource(key, source);
      if (sources[key]) throw new Error(`source already exists: ${key}`);
      sources[key] = clone(source);
      return clone(sources[key]);
    },

    registerRenderer(name, renderer) {
      if (!name || typeof renderer !== 'function') throw new Error('renderer name and function are required');
      if (renderers[name]) throw new Error(`renderer already exists: ${name}`);
      renderers[name] = renderer;
      return name;
    },

    registerComponent(entry) {
      const hydrated = hydrateSource(clone(entry));
      validateComponent(hydrated);
      components.push(hydrated);
      return clone(hydrated);
    }
  };

  window.BenchmarkAtlas = Object.freeze(api);
})();
