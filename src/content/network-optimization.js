// FastBrowse Network Optimization Content Script
// Features:
// - DNS Prefetch: Pre-resolve hostnames found in page links
// - Preconnect: Warm connections to top external domains
// - Prefetch on hover: Prefetch likely next pages on anchor hover

(function () {
  const state = {
    injectedDns: new Set(),
    injectedPreconnect: new Set(),
    injectedPrefetch: new Set(),
    config: {
      dnsPrefetchEnabled: true,
      preconnectEnabled: true,
      prefetchOnHoverEnabled: true,
      maxPrefetchHosts: 5,
      preconnectTopN: 2
    }
  };

  function isHttpUrl(url) {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
  }

  function hostnameFromUrl(url) {
    try { return new URL(url, location.href).hostname; } catch (_) { return null; }
  }

  function ensureHead() {
    if (!document.head) {
      const head = document.createElement('head');
      document.documentElement.insertBefore(head, document.documentElement.firstChild);
    }
    return document.head;
  }

  function addLinkOnce(attrs, set) {
    try {
      const key = JSON.stringify(attrs);
      if (set.has(key)) return false;
      const link = document.createElement('link');
      Object.entries(attrs).forEach(([k, v]) => link.setAttribute(k, v));
      ensureHead().appendChild(link);
      set.add(key);
      return true;
    } catch (_) {
      return false;
    }
  }

  function analyzeAnchors() {
    const counts = new Map();
    const anchors = document.querySelectorAll('a[href]');
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const abs = isHttpUrl(href) ? href : new URL(href, location.href).toString();
      const host = hostnameFromUrl(abs);
      if (!host) return;
      if (host === location.hostname) return; // external only for preconnect/prefetch default
      counts.set(host, (counts.get(host) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a,b) => b[1]-a[1]).map(([h]) => h);
  }

  function injectDnsPrefetch(hosts, maxHosts) {
    if (!state.config.dnsPrefetchEnabled) return 0;
    let injected = 0;
    hosts.slice(0, Math.max(0, maxHosts)).forEach(host => {
      if (!host) return;
      const ok = addLinkOnce({ rel: 'dns-prefetch', href: `//${host}` }, state.injectedDns);
      if (ok) injected++;
    });
    return injected;
  }

  function injectPreconnect(hosts, topN) {
    if (!state.config.preconnectEnabled) return 0;
    let injected = 0;
    hosts.slice(0, Math.max(0, topN)).forEach(host => {
      if (!host) return;
      const ok = addLinkOnce({ rel: 'preconnect', href: `https://${host}`, crossorigin: '' }, state.injectedPreconnect);
      if (ok) injected++;
    });
    return injected;
  }

  function installHoverPrefetch() {
    if (!state.config.prefetchOnHoverEnabled) return;
    let hoverTimer = null;

    function queuePrefetch(url) {
      if (!isHttpUrl(url)) return;
      try {
        // Use as=document; some browsers ignore as for prefetch
        addLinkOnce({ rel: 'prefetch', href: url, as: 'document' }, state.injectedPrefetch);
      } catch (_) {}
    }

    function onMouseOver(e) {
      const a = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      let abs;
      try { abs = new URL(href, location.href).toString(); } catch (_) { return; }
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => queuePrefetch(abs), 75);
    }

    function onPointerDown(e) {
      const a = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      let abs;
      try { abs = new URL(href, location.href).toString(); } catch (_) { return; }
      queuePrefetch(abs);
    }

    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
  }

  async function loadSettings() {
    // Attempt to get settings via runtime messaging (background handler is present)
    try {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (resp) => {
        if (resp && resp.success && resp.data) {
          const s = resp.data;
          state.config.dnsPrefetchEnabled = s.dnsPrefetchEnabled !== false;
          state.config.preconnectEnabled = s.preconnectEnabled !== false;
          state.config.prefetchOnHoverEnabled = s.prefetchOnHoverEnabled !== false;
          state.config.maxPrefetchHosts = Math.max(0, Number(s.maxPrefetchHosts || 5));
          state.config.preconnectTopN = Math.max(0, Number(s.preconnectTopN || 2));
        }
        init();
      });
    } catch (_) {
      init();
    }
  }

  function init() {
    try {
      const hosts = analyzeAnchors();
      injectDnsPrefetch(hosts, state.config.maxPrefetchHosts);
      injectPreconnect(hosts, state.config.preconnectTopN);
      installHoverPrefetch();
      try { console.debug('FastBrowse Network Optimization active'); } catch (_) {}
    } catch (e) {
      try { console.debug('Network Optimization init failed:', e); } catch (_) {}
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSettings, { once: true });
  } else {
    loadSettings();
  }
})();
