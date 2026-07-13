(function () {
  'use strict';

  function renderChart(id, target) {
    const entry = window.BenchmarkAtlas.get(id);
    if (!entry || !target) return;
    target.innerHTML = window.BenchmarkAtlas.render(entry);
  }

  function initStats() {
    const stats = window.BenchmarkAtlas.stats();
    Object.entries(stats).forEach(([key, value]) => {
      const target = document.querySelector(`[data-stat='${key}']`);
      if (target) target.textContent = value;
    });
  }

  function initCharts() {
    renderChart('seed-loss-metric-transfer', document.getElementById('hero-chart'));
    document.querySelectorAll('[data-chart-target]').forEach(target => {
      renderChart(target.dataset.chartTarget, target);
    });
  }

  initStats();
  initCharts();
})();
