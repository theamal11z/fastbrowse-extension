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
      aggressivePrefetchEnabled: true,
      maxPrefetchHosts: 5,
      preconnectTopN: 2,
      maxAggressivePrefetch: 6,
      idleDelayMs: 1500
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

  function topCandidateLinks() {
    try {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      const scored = anchors.map(a => {
        try {
          const href = new URL(a.getAttribute('href'), location.href).toString();
          const host = new URL(href).hostname;
          const sameHost = host === location.hostname;
          const depth = (new URL(href).pathname || '/').split('/').length;
          // Simple score: prefer same-host and shallow paths
          const score = (sameHost ? 10 : 0) + Math.max(0, 5 - depth);
          return { href, score };
        } catch (_) { return null; }
      }).filter(Boolean);
      scored.sort((a,b)=>b.score-a.score);
      const unique = [];
      const seen = new Set();
      for (const s of scored) {
        if (!seen.has(s.href)) { unique.push(s.href); seen.add(s.href); }
      }
      return unique;
    } catch (_) { return []; }
  }

  function aggressivePrefetch() {
    if (!state.config.aggressivePrefetchEnabled) return 0;
    const links = topCandidateLinks();
    let count = 0;
    links.slice(0, Math.max(0, state.config.maxAggressivePrefetch)).forEach(href => {
      try { addLinkOnce({ rel: 'prefetch', href, as: 'document' }, state.injectedPrefetch) && count++; } catch(_){}
    });
    return count;
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
          state.config.aggressivePrefetchEnabled = s.aggressivePrefetchEnabled !== false && (s.smartCacheEnabled !== false);
          state.config.maxAggressivePrefetch = Math.max(0, Number(s.precacheMaxLinks || 6));
          state.config.idleDelayMs = Math.max(0, Number(s.precacheIdleDelayMs || 1500));
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
      // Aggressive prefetch during idle
      try {
        const startAggressive = () => { try { aggressivePrefetch(); } catch(_){} };
        if ('requestIdleCallback' in window) {
          requestIdleCallback(startAggressive, { timeout: state.config.idleDelayMs + 500 });
        } else {
          setTimeout(startAggressive, state.config.idleDelayMs);
        }
      } catch (_) {}
      try { console.debug('FastBrowse Network Optimization active'); } catch (_) {}
    } catch (e) {
      try { console.debug('Network Optimization init failed:', e); } catch (_) {}
    }
  }

  // Messages
  try {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      try {
        if (req && req.action === 'aggressivePrefetchNow') {
          const n = aggressivePrefetch();
          sendResponse && sendResponse({ success: true, count: n });
          return true;
        }
      } catch (e) { sendResponse && sendResponse({ success: false, error: e.message }); }
      return false;
    });
  } catch (_) {}

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSettings, { once: true });
  } else {
    loadSettings();
  }
})();
