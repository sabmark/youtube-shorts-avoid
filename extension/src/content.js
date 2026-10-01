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
      .status { box-sizing: border-box; position: fixed; inset: auto 16px 20px auto; margin: 0; z-index: 2100;
        width: min(260px, calc(100vw - 32px)); padding: 12px 14px; border: 1px solid var(--sa-border, #767676);
        border-radius: 8px; background: var(--sa-bg, #f1f1f1); color: var(--sa-fg, #171717);
        font: 13px/1.5 Arial, sans-serif; overflow-wrap: anywhere; box-shadow: 0 2px 8px #0002; }
      [hidden] { display: none !important; }`;
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
  const status = document.createElement('div');
  status.id = 'result';
  status.className = 'status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  status.hidden = true;
  root.append(style, button, label);
  const noticeHost = document.createElement('shorts-avoid-notice');
  const noticeRoot = noticeHost.attachShadow({ mode: 'open' });
  noticeRoot.append(style.cloneNode(true), status);
  let scheduled = null;

  function show(state) {
    button.disabled = state.status === 'busy';
    button.setAttribute('aria-busy', String(button.disabled));
    let text = state.status === 'busy' ? 'Updating recommendations...' : state.message || '';
    if (state.status === 'partial') {
      text = state.completed.length === 1
        ? `Not interested confirmed. Channel feedback was not confirmed. ${text}`
        : `Both feedback actions confirmed. ${text}`;
    }
    status.textContent = text;
    status.hidden = !text;
  }

  function refresh() {
    scheduled = null;
    const target = adapter.current();
    if (!target) {
      host.remove();
      noticeHost.remove();
      return;
    }
    const rail = adapter.rail(target);
    if (!rail) {
      host.remove();
      noticeHost.remove();
      return;
    }
    if (host.parentElement !== rail) rail.append(host);
    if (!noticeHost.isConnected) document.body.append(noticeHost);
    const space = window.innerWidth - rail.getBoundingClientRect().right - 32;
    status.style.width = `${Math.min(260, Math.max(100, space))}px`;
    button.disabled = workflow.busy;
  }

  function schedule() {
    if (!window.location.pathname.startsWith('/shorts/') && !host.isConnected) return;
    if (scheduled === null) scheduled = window.setTimeout(refresh, 80);
  }

  button.addEventListener('click', () => {
    if (!workflow.busy) void workflow.run(show).then(refresh);
  });
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
