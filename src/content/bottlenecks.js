// FastBrowse Bottleneck Detector
// - Slow Resource Detection (third-party scripts/trackers)
// - CPU Hog Warning via Long Tasks API

// Cross-browser shim: map chrome.* to browser.* in Firefox so async/await works
(function(){
  try {
    const isFirefox = typeof browser !== 'undefined' && browser && typeof browser.runtime !== 'undefined';
    if (isFirefox) {
      globalThis.chrome = browser;
    }
  } catch (_) {}
})();

(function() {
  const conf = {
    enable: true,
    longTaskWindowMs: 10000
  };

  // Long tasks aggregation
  let longTaskTotal = 0;
  let windowStart = performance.now();

  function resetWindowIfNeeded() {
    const now = performance.now();
    if (now - windowStart > conf.longTaskWindowMs) {
      longTaskTotal = 0;
      windowStart = now;
    }
  }

  try {
    const po = new PerformanceObserver((list) => {
      try {
        resetWindowIfNeeded();
        for (const e of list.getEntries()) {
          longTaskTotal += e.duration || 0;
        }
      } catch (_) {}
    });
    po.observe({ type: 'longtask', buffered: true });
  } catch (_) {}

  function getResources(max = 50) {
    const out = [];
    try {
      const res = performance.getEntriesByType('resource');
      for (const r of res) {
        out.push({
          name: r.name,
          initiatorType: r.initiatorType,
          duration: Math.round(r.duration),
          encodedBodySize: r.encodedBodySize || 0
        });
      }
    } catch (_) {}
    // focus on slowest
    out.sort((a, b) => b.duration - a.duration);
    return out.slice(0, max);
  }

  function report() {
    try {
      chrome.runtime.sendMessage({
        action: 'reportBottlenecks',
        data: {
          url: location.href,
          longTasks: { totalDurationMs: Math.round(longTaskTotal) },
          resources: getResources(50)
        }
      }, () => {});
    } catch (_) {}
  }

  // Report soon after load and also a short follow-up to capture late scripts
  function scheduleReports() {
    setTimeout(report, 2000);
    setTimeout(report, 6000);
  }

  if (document.readyState === 'complete') scheduleReports();
  else window.addEventListener('load', scheduleReports, { once: true });
})();
