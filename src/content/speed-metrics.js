// FastBrowse Speed Metrics Collector
// Collects Navigation/Paint/LCP/Resource timings and reports to background

(function() {
  function getNavTimings() {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return {};
      return {
        startTime: nav.startTime,
        responseStart: nav.responseStart,
        domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
        loadEventEnd: nav.loadEventEnd,
        duration: nav.duration,
        transferSize: nav.transferSize || 0,
        encodedBodySize: nav.encodedBodySize || 0,
        decodedBodySize: nav.decodedBodySize || 0
      };
    } catch (_) { return {}; }
  }

  function getPaints() {
    const out = {};
    try {
      const paints = performance.getEntriesByType('paint');
      for (const p of paints) {
        if (p.name === 'first-paint') out.firstPaint = p.startTime;
        if (p.name === 'first-contentful-paint') out.firstContentfulPaint = p.startTime;
      }
    } catch (_) {}
    return out;
  }

  let lcpTime = 0;
  try {
    const po = new PerformanceObserver((list) => {
      try {
        const entries = list.getEntries();
        for (const e of entries) {
          if (e && e.renderTime) lcpTime = Math.max(lcpTime, e.renderTime);
          else if (e && e.loadTime) lcpTime = Math.max(lcpTime, e.loadTime);
          else if (e && e.startTime) lcpTime = Math.max(lcpTime, e.startTime);
        }
      } catch (_) {}
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_) {}

  function getResourceSample(max = 40) {
    const list = [];
    try {
      const resources = performance.getEntriesByType('resource');
      for (const r of resources) {
        list.push({
          name: r.name,
          initiatorType: r.initiatorType,
          startTime: Math.round(r.startTime),
          duration: Math.round(r.duration),
          transferSize: r.transferSize || 0,
          encodedBodySize: r.encodedBodySize || 0
        });
      }
    } catch (_) {}
    // Keep the N slowest by duration
    list.sort((a, b) => b.duration - a.duration);
    return list.slice(0, max);
  }

  function sendReport() {
    try {
      const payload = {
        url: location.href,
        timings: getNavTimings(),
        paints: getPaints(),
        lcp: Math.round(lcpTime),
        resources: getResourceSample(40)
      };
      chrome.runtime.sendMessage({ action: 'recordSpeedMetrics', data: payload }, () => {});
    } catch (_) {}
  }

  // Report after onload + short delay to capture late resources
  function scheduleReport() {
    setTimeout(sendReport, 1500);
  }

  if (document.readyState === 'complete') scheduleReport();
  else window.addEventListener('load', scheduleReport, { once: true });
})();
