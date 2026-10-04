(() => {
  'use strict';
  const shortcut = globalThis.ShortsAvoid.Shortcut;
  const status = document.querySelector('#status');
  const retry = document.querySelector('#retry');
  let busy = true;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const controls = [
    { name: 'avoidShortcut', field: '#shortcut', save: '#save', reset: '#reset', fallback: shortcut.defaultShortcut },
    { name: 'likeShortcut', field: '#like-shortcut', save: '#like-save', reset: '#like-reset', fallback: shortcut.likeShortcut }
  ].map(config => ({ ...config, field: document.querySelector(config.field), save: document.querySelector(config.save),
    reset: document.querySelector(config.reset), saved: config.fallback, pending: config.fallback }));
  function render() {
    for (const control of controls) {
      control.field.value = shortcut.label(control.pending);
      control.field.disabled = busy;
      control.reset.disabled = busy;
      control.save.disabled = busy || same(control.pending, control.saved);
    }
  }
  async function persist(control, value) {
    if (busy) return;
    busy = true;
    render();
    try {
      await navigator.locks.request('shorts-avoid-shortcut-settings', async () => {
        // Another Options tab may have saved since this page was opened.
        const current = await chrome.storage.local.get(controls.map(item => item.name));
        for (const item of controls) {
          const unchanged = same(item.pending, item.saved);
          item.saved = shortcut.normalize(current[item.name]) || item.fallback;
          if (unchanged) item.pending = item.saved;
        }
        const other = controls.find(item => item !== control);
        if (same(value, other.saved)) {
          status.textContent = 'This shortcut is already used by the other action. Choose a different shortcut.';
          control.field.setAttribute('aria-invalid', 'true');
          return;
        }
        await chrome.storage.local.set({ [control.name]: value });
        control.saved = value;
        control.pending = value;
        status.textContent = 'Shortcut saved. Open Shorts tabs will use it immediately.';
        control.field.removeAttribute('aria-invalid');
      });
    } catch {
      status.textContent = 'Could not save the shortcut. Try again.';
    } finally {
      busy = false;
      render();
    }
  }
  for (const control of controls) {
    control.field.addEventListener('keydown', event => {
      if (busy || event.key === 'Tab') return;
      event.preventDefault();
      if (event.key === 'Escape') control.pending = control.saved;
      else {
        const candidate = shortcut.fromEvent(event);
        if (candidate) control.pending = candidate;
      }
      control.field.removeAttribute('aria-invalid');
      status.textContent = '';
      render();
    });
    control.field.addEventListener('mousedown', event => {
      if (busy || document.activeElement !== control.field) return;
      const candidate = shortcut.fromEvent(event);
      if (!candidate) return;
      event.preventDefault();
      control.pending = candidate;
      control.field.removeAttribute('aria-invalid');
      status.textContent = '';
      render();
    });
    for (const type of ['mouseup', 'click', 'auxclick', 'contextmenu']) {
      control.field.addEventListener(type, event => {
        if (!busy && document.activeElement === control.field) event.preventDefault();
      });
    }
    control.save.addEventListener('click', () => void persist(control, control.pending));
    control.reset.addEventListener('click', () => void persist(control, control.fallback));
  }
  async function loadSettings() {
    retry.hidden = true;
    status.textContent = '';
    try {
      const result = await chrome.storage.local.get(controls.map(control => control.name));
      for (const control of controls) {
        control.saved = shortcut.normalize(result[control.name]) || control.fallback;
        control.pending = control.saved;
      }
      busy = false;
      render();
      if (same(controls[0].saved, controls[1].saved)) {
        status.textContent = 'Your shortcuts overlap. Avoid takes priority. Choose a different shortcut for one action.';
      }
    } catch {
      retry.hidden = false;
      status.textContent = 'Could not load settings. Retry to load your saved shortcuts.';
    }
  }
  retry.addEventListener('click', () => void loadSettings());
  render();
  void loadSettings();
})();
