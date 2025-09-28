// FastBrowse Page Load Acceleration Content Script
// - Lazy Loading Override
// - Render Blocking CSS Optimizer (heuristic deferral)
// - JavaScript Deferral (safe heuristic)

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
  const config = {
    lazyOverrideEnabled: true,
    cssDeferEnabled: false,
    jsDeferralEnabled: false,
    cssDeferMax: 2,
    jsDeferralMode: 'safe'
  };

  function readSettingsAndInit() {
    try {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (resp) => {
        try {
          if (resp && resp.success && resp.data) {
            const s = resp.data;
            config.lazyOverrideEnabled = s.lazyOverrideEnabled !== false;
            config.cssDeferEnabled = !!s.cssDeferEnabled;
            config.jsDeferralEnabled = !!s.jsDeferralEnabled;
            config.cssDeferMax = Math.max(0, Number(s.cssDeferMax || 2));
            config.jsDeferralMode = s.jsDeferralMode || 'safe';
          }
        } catch (_) {}
        init();
      });
    } catch (_) {
      init();
    }
  }

  function inInitialViewport(el, margin = 100) {
    try {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth || 0;
      const vh = window.innerHeight || 0;
      return rect.top < vh + margin && rect.left < vw + margin;
    } catch (_) { return true; }
  }

  function lazyOverride() {
    if (!config.lazyOverrideEnabled) return;
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      try {
        if (!inInitialViewport(img)) {
          img.loading = 'lazy';
          img.decoding = 'async';
        } else {
          // allow browser default for above-the-fold
          if (!img.getAttribute('loading')) img.loading = 'eager';
        }
      } catch (_) {}
    });

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(f => {
      try {
        if (!inInitialViewport(f)) {
          f.loading = 'lazy';
        }
      } catch (_) {}
    });

    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
      try {
        if (!inInitialViewport(v)) {
          if (!v.hasAttribute('preload')) v.setAttribute('preload', 'metadata');
          if (v.hasAttribute('autoplay')) v.removeAttribute('autoplay');
        }
      } catch (_) {}
    });
  }

  function hostname(u) { try { return new URL(u, location.href).hostname; } catch (_) { return null; } }

  const KNOWN_NONCRITICAL_CSS = [/fonts.googleapis.com/i, /use.typekit.net/i, /cdnjs.cloudflare.com/i, /bootstrap/i];

  function isNonCriticalStylesheet(link) {
    try {
      if (link.rel !== 'stylesheet') return false;
      const href = link.getAttribute('href') || '';
      if (!href) return false;
      const h = hostname(href);
      if (!h) return false;
      // Heuristics: cross-origin or known non-critical providers
      const cross = h !== location.hostname;
      const known = KNOWN_NONCRITICAL_CSS.some(r => r.test(href));
      return cross || known;
    } catch (_) { return false; }
  }

  function deferStylesheets() {
    if (!config.cssDeferEnabled) return;
    let deferred = 0;
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of links) {
      if (deferred >= config.cssDeferMax) break;
      if (!isNonCriticalStylesheet(link)) continue;
      try {
        // Convert to preload + onload rel=stylesheet
        link.rel = 'preload';
        link.as = 'style';
        link.addEventListener('load', () => {
          try { link.rel = 'stylesheet'; link.as = ''; } catch (_) {}
        }, { once: true });
        deferred++;
      } catch (_) {}
    }
  }

  const KNOWN_NONESSENTIAL_SCRIPT = [/google-analytics\.com/i, /googletagmanager\.com/i, /gtag\/js/i, /adsystem/i, /doubleclick\.net/i, /facebook\.net/i, /hotjar\.com/i, /segment\.com/i];

  function shouldDeferScript(script) {
    try {
      if (script.hasAttribute('async') || script.hasAttribute('defer')) return false;
      if (!script.src) return false; // skip inline; too risky
      const src = script.getAttribute('src');
      const h = hostname(src);
      if (!h) return false;
      if (config.jsDeferralMode === 'aggressive') {
        // Defer any cross-origin script by default
        return h !== location.hostname;
      }
      // Safe: Defer known non-essential providers
      return KNOWN_NONESSENTIAL_SCRIPT.some(r => r.test(src));
    } catch (_) { return false; }
  }

  function deferScripts() {
    if (!config.jsDeferralEnabled) return;
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(s => {
      try {
        if (shouldDeferScript(s)) {
          s.setAttribute('defer', '');
        }
      } catch (_) {}
    });

    // Observe new scripts added dynamically
    try {
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes && m.addedNodes.forEach(node => {
            try {
              if (node.tagName === 'SCRIPT' && node.src) {
                if (shouldDeferScript(node)) node.setAttribute('defer', '');
              }
            } catch (_) {}
          });
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch (_) {}
  }

  function init() {
    try {
      lazyOverride();
      // Defer tasks once DOM is ready to avoid fighting the parser
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          deferStylesheets();
          deferScripts();
        }, { once: true });
      } else {
        deferStylesheets();
        deferScripts();
      }
    } catch (e) {
      try { console.debug('Page Acceleration failed:', e); } catch (_) {}
    }
  }

  readSettingsAndInit();
})();
