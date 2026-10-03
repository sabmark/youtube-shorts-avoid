(() => {
  'use strict';
  const api = globalThis.ShortsAvoid = globalThis.ShortsAvoid || {};
  const defaultShortcut = { key: 'ArrowRight', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
  const modifiers = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];
  function normalize(value) {
    if (!value || typeof value.key !== 'string' ||
        !(value.key.length === 1 || /^(Arrow(Left|Right|Up|Down)|Home|End|PageUp|PageDown|Insert|Delete|Backspace|Enter|F([1-9]|1[0-9]|2[0-4]))$/.test(value.key)) ||
        modifiers.some(name => value[name] !== undefined && typeof value[name] !== 'boolean')) return null;
    return { key: value.key.length === 1 ? value.key.toLowerCase() : value.key,
      ...Object.fromEntries(modifiers.map(name => [name, !!value[name]])) };
  }
  function fromEvent(event) {
    if (event.isComposing || event.repeat) return null;
    return normalize(event);
  }
  function matches(event, shortcut) {
    const candidate = normalize(event);
    return !!candidate && !!shortcut && candidate.key === shortcut.key &&
      modifiers.every(name => candidate[name] === shortcut[name]);
  }
  function label(value) {
    return [value.ctrlKey && 'Ctrl', value.altKey && 'Alt', value.shiftKey && 'Shift', value.metaKey && 'Meta',
      value.key === ' ' ? 'Space' : value.key.replace('Arrow', '')].filter(Boolean).join(' + ');
  }
  api.Shortcut = { defaultShortcut, normalize, fromEvent, matches, label };
})();
