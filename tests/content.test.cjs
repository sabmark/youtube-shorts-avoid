const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, player, installMenu, notice } = require('./helpers.cjs');

const host = w => w.document.querySelector('shorts-avoid-control');
const button = w => host(w)?.shadowRoot.querySelector('button');
const status = w => w.document.querySelector('shorts-avoid-notice')?.shadowRoot.querySelector('[role="status"]');
async function until(check) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > 800) assert.fail('expected UI state did not appear');
    await new Promise(resolve => setTimeout(resolve, 15));
  }
}

test('mounts one accessible button beside the Shorts actions', t => {
  const w = fixture(t, player());
  assert.ok(button(w), 'the extension control is not implemented');
  assert.equal(button(w).getAttribute('aria-label'), 'Avoid video and channel');
  assert.equal(button(w).type, 'button');
  assert.equal(host(w).parentElement.tagName, 'REEL-ACTION-BAR-VIEW-MODEL');
  assert.equal(status(w).getAttribute('aria-live'), 'polite');
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

test('disables repeated activation while feedback is pending and reports completion', async t => {
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
  button(w).click();
  await until(() => status(w).textContent.includes('Feedback sent'));
  assert.equal(submissions, 2);
  assert.equal(button(w).disabled, false);
  assert.equal(w.location.pathname, '/shorts/second-video');
});

test('a missing option produces an honest stopped status', async t => {
  const w = fixture(t, player());
  installMenu(w, { items: ['Description', 'Report'] });
  assert.ok(button(w), 'the extension control is not implemented');
  button(w).click();
  await until(() => status(w).textContent.includes('required feedback options'));
  assert.equal(button(w).disabled, false);
  assert.equal(w.location.pathname, '/shorts/first-video');
});

test('partial completion names the confirmed action and unfinished channel feedback', async t => {
  const w = fixture(t, player());
  installMenu(w, { onFeedback: () => {
    notice(w, 'Video removed');
    w.history.pushState({}, '', '/shorts/second-video');
  } });
  assert.ok(button(w), 'the extension control is not implemented');
  button(w).click();
  await until(() => !button(w).disabled);
  assert.match(status(w).textContent, /Not interested confirmed/);
  assert.match(status(w).textContent, /channel feedback was not confirmed/i);
  assert.doesNotMatch(status(w).textContent, /Feedback sent\./);
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
  assert.match(status(w).textContent, /changed/i);
});
