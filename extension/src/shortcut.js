(() => {
  'use strict';
  const api = globalThis.ShortsAvoid = globalThis.ShortsAvoid || {};
  const defaultShortcut = { key: 'ArrowLeft', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
  const modifiers = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];
  const mouseLabels = ['Left mouse', 'Middle mouse', 'Right mouse', 'Mouse Back', 'Mouse Forward'];
  function normalize(value) {
    if (!value || modifiers.some(name => value[name] !== undefined && typeof value[name] !== 'boolean')) return null;
    const flags = Object.fromEntries(modifiers.map(name => [name, !!value[name]]));
    if (value.type === 'mouse') {
      return Number.isInteger(value.button) && value.button >= 0 && value.button < mouseLabels.length && value.key === undefined
        ? { type: 'mouse', button: value.button, ...flags } : null;
    }
    if ((value.type !== undefined && value.type !== 'keyboard') || typeof value.key !== 'string' ||
        !(value.key.length === 1 || /^(Arrow(Left|Right|Up|Down)|Home|End|PageUp|PageDown|Insert|Delete|Backspace|Enter|F([1-9]|1[0-9]|2[0-4]))$/.test(value.key))) return null;
    return { key: value.key.length === 1 ? value.key.toLowerCase() : value.key,
      ...flags };
  }
  function fromEvent(event) {
    if (event.isComposing || event.repeat) return null;
    if (event.type === 'mousedown' || event.type === 'pointerdown') return normalize({ type: 'mouse', button: event.button,
      ...Object.fromEntries(modifiers.map(name => [name, event[name]])) });
    return normalize({ key: event.key, ...Object.fromEntries(modifiers.map(name => [name, event[name]])) });
  }
  function matches(event, shortcut) {
    const candidate = event.type === 'mousedown' || event.type === 'pointerdown' ? fromEvent(event) : normalize({ key: event.key,
      ...Object.fromEntries(modifiers.map(name => [name, event[name]])) });
    return !!candidate && !!shortcut && candidate.type === shortcut.type &&
      (candidate.type === 'mouse' ? candidate.button === shortcut.button : candidate.key === shortcut.key) &&
      modifiers.every(name => candidate[name] === shortcut[name]);
  }
  function label(value) {
    return [value.ctrlKey && 'Ctrl', value.altKey && 'Alt', value.shiftKey && 'Shift', value.metaKey && 'Meta',
      value.type === 'mouse' ? mouseLabels[value.button] : value.key === ' ' ? 'Space' : value.key.replace('Arrow', '')].filter(Boolean).join(' + ');
  }
  const likeShortcut = { ...defaultShortcut, key: 'ArrowRight' };
  api.Shortcut = { defaultShortcut, likeShortcut, normalize, fromEvent, matches, label };
})();
