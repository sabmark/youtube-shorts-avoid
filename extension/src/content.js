(() => {
  'use strict';
  const api = globalThis.ShortsAvoid;
  if (!api?.YoutubeAdapter || !api.Workflow || api.controller) return;
  const adapter = new api.YoutubeAdapter(window);
  const workflow = new api.Workflow(adapter);
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
  let scheduled = null;

  function updateButton(state) {
    button.disabled = state.status === 'busy';
    button.setAttribute('aria-busy', String(button.disabled));
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
    button.disabled = workflow.busy;
  }

  function schedule() {
    if (!window.location.pathname.startsWith('/shorts/') && !host.isConnected) return;
    if (scheduled === null) scheduled = window.setTimeout(refresh, 80);
  }

  function activate() {
    if (!workflow.busy) void workflow.run(updateButton).then(refresh);
  }

  button.addEventListener('click', activate);
  document.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' || event.defaultPrevented || event.isComposing ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const editable = event.composedPath().some(node => node instanceof Element &&
      (node.matches('input, textarea, select') || node.isContentEditable ||
       node.closest('[contenteditable]:not([contenteditable="false"])')));
    if (editable || !window.location.pathname.startsWith('/shorts/') ||
        !host.isConnected || !adapter.current()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!event.repeat) activate();
  }, { capture: true });
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
