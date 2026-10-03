const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, player, installMenu, notice } = require('./helpers.cjs');

const host = w => w.document.querySelector('shorts-avoid-control');
const button = w => host(w)?.shadowRoot.querySelector('button');
const status = w => w.document.querySelector('shorts-avoid-notice')?.shadowRoot.querySelector('[role="status"]');
async function until(check, timeoutMs = 800) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeoutMs) assert.fail('expected UI state did not appear');
    await new Promise(resolve => setTimeout(resolve, 15));
  }
}

test('mounts one accessible button beside the Shorts actions', t => {
  const w = fixture(t, player());
  assert.ok(button(w), 'the extension control is not implemented');
  assert.equal(button(w).getAttribute('aria-label'), 'Avoid video and channel');
  assert.equal(button(w).type, 'button');
  assert.equal(host(w).parentElement.tagName, 'REEL-ACTION-BAR-VIEW-MODEL');
  assert.equal(status(w), undefined);
  w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  assert.equal(w.document.querySelectorAll('shorts-avoid-control').length, 1);
});

test('the control mounts when the page requires TrustedHTML for HTML sinks', t => {
  const w = fixture(t, player(), 'https://www.youtube.com/shorts/first-video', {
    beforeScripts(window) {
      Object.defineProperty(window.ShadowRoot.prototype, 'innerHTML', {
        set() { throw new TypeError('This document requires TrustedHTML assignment.'); }
      });
    }
  });
  assert.ok(button(w));
  assert.equal(button(w).getAttribute('aria-label'), 'Avoid video and channel');
});

test('stays absent on other YouTube routes and mounts after SPA navigation', t => {
  const w = fixture(t, player(), 'https://www.youtube.com/');
  assert.equal(host(w), null);
  w.history.pushState({}, '', '/shorts/first-video');
  w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  assert.ok(button(w), 'a control should mount after entering Shorts');
});

test('disables repeated activation and completes feedback without extension notifications', async t => {
  const w = fixture(t, player());
  let submissions = 0;
  installMenu(w, { onFeedback: label => {
    submissions++;
    w.setTimeout(() => notice(w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel"), 25);
  } });
  w.document.querySelector('[aria-label="Next video"]').onclick = () => {
    w.history.pushState({}, '', '/shorts/second-video');
    w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  };
  assert.ok(button(w), 'the extension control is not implemented');
  button(w).click();
  assert.equal(button(w).disabled, true);
  assert.equal(status(w), undefined, 'no progress notification');
  button(w).click();
  await until(() => !button(w).disabled, 6000);
  assert.equal(status(w), undefined, 'no completion notification');
  assert.equal(submissions, 2);
  assert.equal(button(w).disabled, false);
  assert.equal(w.location.pathname, '/shorts/second-video');
});

test('a missing option stops without an extension notification', async t => {
  const w = fixture(t, player());
  installMenu(w, { items: ['Description', 'Report'] });
  assert.ok(button(w), 'the extension control is not implemented');
  button(w).click();
  await until(() => !button(w).disabled);
  assert.equal(status(w), undefined);
  assert.equal(button(w).disabled, false);
  assert.equal(w.location.pathname, '/shorts/first-video');
});

test('partial completion stops without an extension notification or successor feedback', async t => {
  const w = fixture(t, player());
  let submissions = 0;
  installMenu(w, { onFeedback: () => {
    submissions++;
    notice(w, 'Video removed');
    w.history.pushState({}, '', '/shorts/second-video');
  } });
  assert.ok(button(w), 'the extension control is not implemented');
  button(w).click();
  await until(() => !button(w).disabled);
  assert.equal(status(w), undefined);
  assert.equal(submissions, 1);
  assert.equal(w.location.pathname, '/shorts/second-video');
});

test('removes the control on leaving Shorts', t => {
  const w = fixture(t, player());
  assert.ok(button(w), 'the extension control is not implemented');
  w.history.pushState({}, '', '/watch?v=example');
  w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  assert.equal(host(w), null);
  assert.equal(w.document.querySelector('shorts-avoid-notice'), null);
});

test('replacing the renderer during an operation cannot start another workflow', async t => {
  const w = fixture(t, player());
  let submissions = 0;
  installMenu(w, { onFeedback: () => submissions++ });
  assert.ok(button(w), 'the extension control is not implemented');
  button(w).click();
  await until(() => submissions === 1);
  w.document.querySelector('ytd-reel-video-renderer').outerHTML = player().split('<button aria-label="Next video">')[0];
  w.history.pushState({}, '', '/shorts/second-video');
  w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  assert.equal(button(w).disabled, true);
  button(w).click();
  await until(() => !button(w).disabled);
  assert.equal(submissions, 1);
  assert.equal(status(w), undefined);
});

function arrow(w, target = w.document, options = {}) {
  const event = new w.KeyboardEvent('keydown', {
    key: 'ArrowRight', bubbles: true, composed: true, cancelable: true, ...options
  });
  target.dispatchEvent(event);
  return event;
}

test('Right Arrow runs the button workflow once and blocks repeated activation', async t => {
  const w = fixture(t, player());
  let submissions = 0;
  let advances = 0;
  installMenu(w, { onFeedback: label => {
    submissions++;
    w.setTimeout(() => notice(w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel"), 25);
  } });
  w.document.querySelector('[aria-label="Next video"]').onclick = () => {
    advances++;
    w.history.pushState({}, '', '/shorts/second-video');
    w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  };
  assert.equal(arrow(w).defaultPrevented, true);
  assert.equal(button(w).disabled, true);
  arrow(w);
  arrow(w, w.document, { repeat: true });
  button(w).click();
  await until(() => !button(w).disabled, 6000);
  assert.equal(submissions, 2);
  assert.equal(advances, 1);
  assert.equal(w.location.pathname, '/shorts/second-video');
  assert.equal(arrow(w, w.document, { repeat: true }).defaultPrevented, true);
  assert.equal(button(w).disabled, false);
});

test('Right Arrow ignores editable fields, modifiers and previously handled events', t => {
  const w = fixture(t, player());
  for (const markup of ['<input>', '<textarea></textarea>', '<select><option>A</option></select>',
    '<div contenteditable="true"><span>typing</span></div>']) {
    const container = w.document.createElement('div');
    container.innerHTML = markup;
    w.document.body.append(container);
    assert.equal(arrow(w, container.querySelector('span') || container.firstElementChild).defaultPrevented, false);
    assert.equal(button(w).disabled, false);
  }
  const shadowHost = w.document.createElement('div');
  w.document.body.append(shadowHost);
  const shadow = shadowHost.attachShadow({ mode: 'open' });
  shadow.innerHTML = '<input>';
  assert.equal(arrow(w, shadow.querySelector('input')).defaultPrevented, false);
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'isComposing']) {
    assert.equal(arrow(w, w.document, { [modifier]: true }).defaultPrevented, false);
    assert.equal(button(w).disabled, false);
  }
  w.addEventListener('keydown', event => event.preventDefault(), { capture: true, once: true });
  arrow(w);
  assert.equal(button(w).disabled, false);
});

test('Right Arrow stays inactive outside Shorts or without an active control', t => {
  const w = fixture(t, player(), 'https://www.youtube.com/');
  assert.equal(arrow(w).defaultPrevented, false);
  w.history.pushState({}, '', '/shorts/first-video');
  w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  assert.ok(button(w));
  w.history.pushState({}, '', '/watch?v=example');
  assert.equal(arrow(w).defaultPrevented, false, 'route check must not wait for refresh');
  w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  assert.equal(arrow(w).defaultPrevented, false);
  w.history.pushState({}, '', '/shorts/first-video');
  w.document.querySelector('reel-action-bar-view-model').remove();
  w.document.dispatchEvent(new w.Event('yt-navigate-finish'));
  assert.equal(arrow(w).defaultPrevented, false);
});

test('Right Arrow intercepts an earlier page bubble handler before it changes the Short', async t => {
  let nativeCalls = 0;
  const w = fixture(t, player(), 'https://www.youtube.com/shorts/first-video', {
    beforeScripts(window) {
      window.document.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') {
          nativeCalls++;
          window.history.pushState({}, '', '/shorts/second-video');
        }
      });
    }
  });
  installMenu(w, { items: ['Report'] });
  arrow(w, w.document.body);
  assert.equal(nativeCalls, 0);
  assert.equal(w.location.pathname, '/shorts/first-video');
  assert.equal(button(w).disabled, true);
  await until(() => !button(w).disabled);
});
