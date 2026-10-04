(() => {
  'use strict';
  const api = globalThis.ShortsAvoid;
  if (!api?.YoutubeAdapter || !api.Workflow || api.controller) return;
  const adapter = new api.YoutubeAdapter(window);
  const workflow = new api.Workflow(adapter);
  const storage = globalThis.chrome?.storage;
  let shortcut = storage ? null : api.Shortcut.defaultShortcut;
  let likeShortcut = storage ? null : api.Shortcut.likeShortcut;
  let feedbackMode = 'both';
  let feedbackReady = !storage;
  const revisions = { avoidShortcut: 0, likeShortcut: 0, avoidFeedback: 0 };
  function applySetting(name, value) {
    if (name === 'avoidShortcut') shortcut = api.Shortcut.normalize(value) || api.Shortcut.defaultShortcut;
    else if (name === 'likeShortcut') likeShortcut = api.Shortcut.normalize(value) || api.Shortcut.likeShortcut;
    else {
      feedbackMode = api.Feedback.normalize(value);
      feedbackReady = true;
      button.setAttribute('aria-label', api.Feedback.label(feedbackMode));
      button.title = api.Feedback.label(feedbackMode);
      updateButton({ status: workflow.busy ? 'busy' : 'idle' });
    }
  }
  if (storage) {
    storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      for (const name of Object.keys(revisions)) {
        if (!changes[name]) continue;
        revisions[name]++;
        applySetting(name, changes[name].newValue);
      }
    });
    const initialRevisions = { ...revisions };
    storage.local.get(Object.keys(revisions)).then(result => {
      for (const name of Object.keys(revisions)) {
        if (initialRevisions[name] === revisions[name]) applySetting(name, result[name]);
      }
    }).catch(() => { /* Leave shortcuts inactive if settings cannot be read. */ });
  }
  function actionFor(event) {
    return api.Shortcut.matches(event, shortcut) ? 'avoid'
      : api.Shortcut.matches(event, likeShortcut) ? 'like' : null;
  }
  const host = document.createElement('shorts-avoid-control');
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
      :host { display: flex; flex-direction: column; align-items: center; flex: none; font: 12px/1.4 Arial, sans-serif; }
      button { box-sizing: border-box; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;
        padding: 10px; border: 1px solid var(--sa-border, #767676); border-radius: 50%; cursor: pointer;
        background: var(--sa-bg, #f1f1f1); color: var(--sa-fg, #171717); }
      button:hover { filter: brightness(.92); }
      button:focus-visible { outline: 3px solid var(--sa-focus, #0958b9); outline-offset: 3px; }
      button:disabled { cursor: wait; opacity: .6; }
      svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2; }
      .label { margin-top: 5px; color: var(--sa-fg, #171717); }
`;
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Avoid video and channel');
  button.title = 'Avoid video and channel';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 28 28');
  svg.setAttribute('aria-hidden', 'true');
  for (const data of ['M10 3 21 7a4 4 0 0 1 1 7l-4 2 2 1a4 4 0 0 1-1 7l-11 1a4 4 0 0 1-3-7l4-2-2-1a4 4 0 0 1 0-7Z', 'M10 14h9']) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', data);
    svg.append(path);
  }
  button.append(svg);
  const label = document.createElement('span');
  label.className = 'label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = 'Avoid';
  root.append(style, button, label);
  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.setAttribute('aria-label', 'Like video and go to next');
  likeButton.title = 'Like video and go to next';
  const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  heart.setAttribute('viewBox', '0 0 28 28');
  heart.setAttribute('aria-hidden', 'true');
  const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  heartPath.setAttribute('d', 'M14 24 4 14C-3 6 7-2 14 6 21-2 31 6 24 14Z');
  heart.append(heartPath);
  likeButton.append(heart);
  likeButton.style.marginTop = '12px';
  const likeLabel = document.createElement('span');
  likeLabel.className = 'label';
  likeLabel.setAttribute('aria-hidden', 'true');
  likeLabel.textContent = 'Like';
  root.append(likeButton, likeLabel);
  let scheduled = null;

  function updateButton(state) {
    for (const control of [button, likeButton]) {
      control.disabled = state.status === 'busy' || (control === button && !feedbackReady);
      control.setAttribute('aria-busy', String(state.status === 'busy'));
    }
  }

  function refresh() {
    scheduled = null;
    const target = adapter.current();
    if (!target) {
      host.remove();
      return;
    }
    const rail = adapter.rail(target);
    if (!rail) {
      host.remove();
      return;
    }
    if (host.parentElement !== rail) rail.append(host);
    updateButton({ status: workflow.busy ? 'busy' : 'idle' });
  }

  function schedule() {
    if (!window.location.pathname.startsWith('/shorts/') && !host.isConnected) return;
    if (scheduled === null) scheduled = window.setTimeout(refresh, 80);
  }

  function activate(action = 'avoid') {
    if (!workflow.busy && (action === 'like' || feedbackReady)) {
      void workflow.run(updateButton, action, feedbackMode).then(refresh);
    }
  }

  button.addEventListener('click', () => activate());
  likeButton.addEventListener('click', () => activate('like'));
  function canUseShortcut(event, overrideDefault = false) {
    if ((!overrideDefault && event.defaultPrevented) || event.isComposing) return false;
    const editable = event.composedPath().some(node => node instanceof Element &&
      (node.matches('input, textarea, select') || node.isContentEditable ||
       node.closest('[contenteditable]:not([contenteditable="false"])')));
    if (editable || !window.location.pathname.startsWith('/shorts/') ||
        !host.isConnected || !adapter.current()) return false;
    return true;
  }
  function consume(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  document.addEventListener('keydown', event => {
    if (!canUseShortcut(event)) return;
    const action = actionFor(event);
    if (!action) return;
    consume(event);
    if (!event.repeat) activate(action);
  }, { capture: true });
  let mouseGesture = null;
  let ignoreCompatibilityMouse = false;
  window.addEventListener('pointerdown', event => {
    mouseGesture = null;
    ignoreCompatibilityMouse = !!event.pointerType && event.pointerType !== 'mouse';
    if (ignoreCompatibilityMouse) return;
    const action = actionFor(event);
    if (!action || !canUseShortcut(event, true)) return;
    mouseGesture = { button: event.button, target: event.composedPath()[0], pointer: true };
    consume(event);
    activate(action);
  }, { capture: true });
  window.addEventListener('mousedown', event => {
    if (ignoreCompatibilityMouse) return;
    if (mouseGesture?.pointer && mouseGesture.button === event.button) {
      consume(event);
      return;
    }
    mouseGesture = null;
    const action = actionFor(event);
    if (!action || !canUseShortcut(event)) return;
    mouseGesture = { button: event.button, target: event.composedPath()[0] };
    consume(event);
    activate(action);
  }, { capture: true });
  for (const type of ['pointerup', 'mouseup', 'click', 'auxclick', 'contextmenu']) {
    window.addEventListener(type, event => {
      if (type === 'pointerup' && event.pointerType && event.pointerType !== 'mouse') return;
      if (!mouseGesture || event.button !== mouseGesture.button ||
          ((type === 'click' || type === 'auxclick') && event.detail === 0)) return;
      const target = event.composedPath()[0];
      const related = target === mouseGesture.target || (target instanceof Node && mouseGesture.target instanceof Node &&
        (target.contains(mouseGesture.target) || mouseGesture.target.contains(target)));
      if (type !== 'pointerup' && type !== 'mouseup' && !related) return;
      consume(event);
      if (type === 'click' || type === 'auxclick') mouseGesture = null;
    }, { capture: true });
  }
  document.addEventListener('yt-navigate-finish', refresh);
  window.addEventListener('popstate', refresh);
  window.addEventListener('resize', refresh);
  document.addEventListener('scroll', schedule, { capture: true, passive: true });
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ['hidden', 'aria-hidden', 'style', 'class', 'is-active']
  });
  api.controller = { refresh };
  refresh();
})();
