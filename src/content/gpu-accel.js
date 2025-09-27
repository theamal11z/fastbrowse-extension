// FastBrowse GPU Acceleration Control Content Script
// - Hardware Acceleration Tuner (placeholder hooks)
// - WebGL Performance Profiles: tweak WebGL context attributes safely

(function () {
  const cfg = {
    gpuMode: 'auto',
    webglProfile: 'performance',
    webglForceHighPerf: true,
    webglAntialias: false,
    webglPreserveDrawingBuffer: false
  };

  function applyProfileOverrides(attrs = {}) {
    const out = { ...attrs };
    try {
      // WebGL attributes
      if (cfg.webglProfile === 'performance') {
        if (out.antialias === undefined) out.antialias = !!cfg.webglAntialias; // default false
        if (out.preserveDrawingBuffer === undefined) out.preserveDrawingBuffer = !!cfg.webglPreserveDrawingBuffer; // default false
        // powerPreference is Canvas/WebGL2 attribute (best-effort)
        out.powerPreference = cfg.webglForceHighPerf ? 'high-performance' : (out.powerPreference || 'default');
        // Prefer non-alpha for performance if not specified
        if (out.alpha === undefined) out.alpha = false;
      } else if (cfg.webglProfile === 'quality') {
        if (out.antialias === undefined) out.antialias = true;
        if (out.preserveDrawingBuffer === undefined) out.preserveDrawingBuffer = true;
        out.powerPreference = cfg.webglForceHighPerf ? 'high-performance' : (out.powerPreference || 'default');
      } else {
        // compatibility: minimal changes, still respect explicit toggles
        if (cfg.webglForceHighPerf) out.powerPreference = 'high-performance';
      }
    } catch (_) {}
    return out;
  }

  function wrapGetContextOn(proto, kind) {
    try {
      const original = proto.getContext;
      if (typeof original !== 'function') return;
      if (original.__fastbrowse_wrapped) return;
      proto.getContext = function(type, attrs) {
        try {
          if (type === 'webgl' || type === 'experimental-webgl' || type === 'webgl2') {
            const finalAttrs = applyProfileOverrides(attrs || {});
            return original.call(this, type, finalAttrs);
          }
        } catch (_) {}
        return original.apply(this, arguments);
      };
      proto.getContext.__fastbrowse_wrapped = true;
    } catch (_) {}
  }

  function maybeAddCompositingHints() {
    // Placeholder for future GPU tuner CSS hints based on cfg.gpuMode.
    // We keep this no-op by default to avoid site regressions.
  }

  function loadSettingsAndInit() {
    try {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (resp) => {
        try {
          if (resp && resp.success && resp.data) {
            const s = resp.data;
            cfg.gpuMode = s.gpuMode || 'auto';
            cfg.webglProfile = s.webglProfile || 'performance';
            cfg.webglForceHighPerf = s.webglForceHighPerf !== false;
            cfg.webglAntialias = !!s.webglAntialias;
            cfg.webglPreserveDrawingBuffer = !!s.webglPreserveDrawingBuffer;
          }
        } catch (_) {}
        init();
      });
    } catch (_) {
      init();
    }
  }

  function init() {
    try {
      wrapGetContextOn(HTMLCanvasElement.prototype, 'canvas');
      if (typeof OffscreenCanvas !== 'undefined') {
        wrapGetContextOn(OffscreenCanvas.prototype, 'offscreen');
      }
      maybeAddCompositingHints();
      try { console.debug('FastBrowse GPU Acceleration Control active'); } catch (_) {}
    } catch (e) {
      try { console.debug('GPU Acceleration init failed:', e); } catch (_) {}
    }
  }

  loadSettingsAndInit();
})();
