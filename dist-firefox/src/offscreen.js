// Offscreen audio controller for FastBrowse
(() => {
  let audio = null;
  let currentSrc = null;
  let isLoop = true;
  let previewTimer = null;

  function ensureAudio() {
    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0.25; // default comfortable volume
      audio.addEventListener('error', (e) => {
        chrome.runtime.sendMessage({ action: 'offscreenAudioError', error: audio.error?.code || 'unknown' });
      });
    }
    return audio;
  }

  async function setTrack(path, { loop = true, autoplay = true, volume = 0.25 } = {}) {
    const a = ensureAudio();
    isLoop = loop;
    a.loop = loop;
    a.volume = volume;
    const src = path && path !== 'none' ? chrome.runtime.getURL(path) : null;

    try {
      if (previewTimer) {
        clearTimeout(previewTimer);
        previewTimer = null;
      }
      if (!src) {
        if (!a.paused) a.pause();
        a.removeAttribute('src');
        a.load();
        currentSrc = null;
        return { playing: false };
      }
      if (currentSrc !== src) {
        a.src = src;
        currentSrc = src;
      }
      if (autoplay) {
        await a.play();
        return { playing: true };
      }
    } catch (e) {
      chrome.runtime.sendMessage({ action: 'offscreenAudioError', error: String(e) });
    }
    return { playing: false };
  }

  function stop() {
    const a = ensureAudio();
    try {
      if (!a.paused) a.pause();
      a.removeAttribute('src');
      a.load();
      currentSrc = null;
    } catch (_) {}
  }

  chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    switch (msg?.action) {
      case 'focusMusicPlay':
        setTrack(msg.track, { loop: true, autoplay: true, volume: msg.volume ?? 0.25 });
        break;
      case 'focusMusicStop':
        stop();
        break;
      case 'focusMusicPreview': {
        const duration = Math.min(Math.max(Number(msg.durationMs || 10000), 2000), 60000);
        setTrack(msg.track, { loop: false, autoplay: true, volume: msg.volume ?? 0.25 }).then(() => {
          if (previewTimer) clearTimeout(previewTimer);
          previewTimer = setTimeout(() => {
            stop();
          }, duration);
        });
        break;
      }
    }
  });

  // Notify ready (optional)
  chrome.runtime.sendMessage({ action: 'offscreenReady' });
})();
