// FastBrowse State Snapshot Content Script
// Captures minimal tab state (scroll position and form fields) and restores it on demand

// Cross-browser shim: map chrome.* to browser.* in Firefox so async/await works
(function(){
  try {
    const isFirefox = typeof browser !== 'undefined' && browser && typeof browser.runtime !== 'undefined';
    if (isFirefox) {
      globalThis.chrome = browser;
    }
  } catch (_) {}
})();

(() => {
  function buildSelector(el) {
    try {
      if (!el || !(el instanceof Element)) return null;
      if (el.id) return `#${CSS.escape(el.id)}`;
      if (el.name) {
        const nameSel = `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
        // If unique among same selectors, use it
        if (document.querySelectorAll(nameSel).length === 1) return nameSel;
      }
      // Build a path using tag and nth-of-type up to a shallow depth
      const parts = [];
      let cur = el;
      let depth = 0;
      while (cur && cur.nodeType === 1 && depth < 5) {
        let part = cur.tagName.toLowerCase();
        // Only add nth-of-type if there are siblings with same tag
        const parent = cur.parentElement;
        if (parent) {
          const sameTagSiblings = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
          if (sameTagSiblings.length > 1) {
            const idx = sameTagSiblings.indexOf(cur) + 1;
            part += `:nth-of-type(${idx})`;
          }
        }
        parts.unshift(part);
        cur = parent;
        depth++;
      }
      const selector = parts.join(' > ');
      return selector || null;
    } catch (_) {
      return null;
    }
  }

  function collectFormFields() {
    const fields = [];
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((el) => {
      try {
        const tag = el.tagName.toLowerCase();
        const type = tag === 'input' ? (el.getAttribute('type') || 'text').toLowerCase() : tag;
        // Skip sensitive inputs
        if (type === 'password' || type === 'hidden') return;
        const selector = buildSelector(el);
        if (!selector) return;

        let value = null;
        if (tag === 'select') {
          value = el.multiple ? Array.from(el.selectedOptions).map(o => o.value) : el.value;
        } else if (type === 'checkbox' || type === 'radio') {
          value = el.checked;
        } else {
          value = el.value;
        }
        // Only persist non-empty values to minimize storage
        const hasMeaningful = (Array.isArray(value) ? value.length > 0 : (value !== null && String(value).length > 0));
        if (!hasMeaningful) return;

        fields.push({ selector, type, value });
      } catch (_) {}
    });
    return fields;
  }

  function applyFormFields(fields) {
    if (!Array.isArray(fields)) return 0;
    let applied = 0;
    fields.forEach((f) => {
      try {
        const el = document.querySelector(f.selector);
        if (!el) return;
        const tag = el.tagName.toLowerCase();
        const type = tag === 'input' ? (el.getAttribute('type') || 'text').toLowerCase() : tag;
        if (tag === 'select') {
          if (el.multiple && Array.isArray(f.value)) {
            Array.from(el.options).forEach(opt => { opt.selected = f.value.includes(opt.value); });
          } else {
            el.value = f.value;
          }
          el.dispatchEvent(new Event('change', { bubbles: true }));
          applied++;
        } else if (type === 'checkbox' || type === 'radio') {
          el.checked = !!f.value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          applied++;
        } else {
          el.value = f.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          applied++;
        }
      } catch (_) {}
    });
    return applied;
  }

  function getScroll() {
    return { x: window.scrollX || 0, y: window.scrollY || 0 };
  }

  function setScroll(pos) {
    try {
      if (!pos) return false;
      window.scrollTo({ left: pos.x || 0, top: pos.y || 0, behavior: 'auto' });
      return true;
    } catch (_) {
      return false;
    }
  }

  async function snapshotState() {
    try {
      const snapshot = {
        url: location.href,
        title: document.title,
        scroll: getScroll(),
        forms: collectFormFields(),
        ts: Date.now()
      };
      return { success: true, data: snapshot };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function restoreState(state) {
    try {
      if (!state || typeof state !== 'object') {
        return { success: false, error: 'Invalid state' };
      }
      // Apply after DOM is ready
      if (document.readyState === 'loading') {
        await new Promise((res) => document.addEventListener('DOMContentLoaded', res, { once: true }));
      }
      const appliedForms = applyFormFields(state.forms || []);
      const scrolled = setScroll(state.scroll);
      return { success: true, data: { appliedForms, scrolled } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
      try {
        if (request.action === 'snapshotTabState') {
          const result = await snapshotState();
          sendResponse(result);
        } else if (request.action === 'restoreTabState') {
          const result = await restoreState(request.state);
          sendResponse(result);
        } else if (request.action === 'getLiteModeStatus') {
          // Keep compatibility with popup checks if this script happens to be injected
          sendResponse({ success: true, data: { active: false } });
        }
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true; // async
  });

  // Log minimal message for debug
  try { console.debug('FastBrowse State Snapshot script ready'); } catch (_) {}
})();