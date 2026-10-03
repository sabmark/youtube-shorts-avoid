(() => {
  'use strict';
  const shortcut = globalThis.ShortsAvoid.Shortcut;
  const field = document.querySelector('#shortcut');
  const save = document.querySelector('#save');
  const reset = document.querySelector('#reset');
  const status = document.querySelector('#status');
  const retry = document.querySelector('#retry');
  let saved = shortcut.defaultShortcut;
  let pending = saved;
  let busy = true;
  function render() {
    field.value = shortcut.label(pending);
    field.disabled = busy;
    reset.disabled = busy;
    save.disabled = busy || JSON.stringify(pending) === JSON.stringify(saved);
  }
  field.addEventListener('keydown', event => {
    if (event.key === 'Tab') return;
    event.preventDefault();
    if (event.key === 'Escape') pending = saved;
    else {
      const candidate = shortcut.fromEvent(event);
      if (candidate) pending = candidate;
    }
    status.textContent = '';
    render();
  });
  async function persist(value) {
    busy = true;
    render();
    try {
      await chrome.storage.local.set({ avoidShortcut: value });
      saved = value;
      pending = value;
      status.textContent = 'Shortcut saved. Open Shorts tabs will use it immediately.';
    } catch {
      status.textContent = 'Could not save the shortcut. Try again.';
    } finally {
      busy = false;
      render();
    }
  }
  save.addEventListener('click', () => void persist(pending));
  reset.addEventListener('click', () => void persist(shortcut.defaultShortcut));
  async function loadSettings() {
    retry.hidden = true;
    status.textContent = '';
    try {
      const result = await chrome.storage.local.get('avoidShortcut');
      saved = shortcut.normalize(result.avoidShortcut) || shortcut.defaultShortcut;
      pending = saved;
      busy = false;
      render();
    } catch {
      retry.hidden = false;
      status.textContent = 'Could not load settings. Retry to load your saved shortcut.';
    }
  }
  retry.addEventListener('click', () => void loadSettings());
  void loadSettings();
})();
