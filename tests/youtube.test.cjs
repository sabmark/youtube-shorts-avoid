const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, player, installMenu, notice } = require('./helpers.cjs');

test('binds the visible Shorts renderer to the route identity', t => {
  const w = fixture(t, player());
  assert.equal(typeof w.ShortsAvoid?.YoutubeAdapter, 'function', 'the DOM adapter is not implemented');
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 30 });
  const target = adapter.current();
  assert.equal(target.id, 'first-video');
  assert.equal(target.element.tagName, 'YTD-REEL-VIDEO-RENDERER');
  w.history.pushState({}, '', '/');
  assert.equal(adapter.current(), null);
});

test('ignores hidden and offscreen renderers', t => {
  const w = fixture(t, '<ytd-reel-video-renderer hidden></ytd-reel-video-renderer><ytd-reel-video-renderer data-top="-600"></ytd-reel-video-renderer>' + player());
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w);
  assert.equal(adapter.current().element.querySelector('[aria-label="More actions"]').tagName, 'BUTTON');
});

test('mount location is the current renderer action rail', t => {
  const w = fixture(t, player());
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w);
  assert.equal(adapter.rail(adapter.current()).tagName, 'REEL-ACTION-BAR-VIEW-MODEL');
});

test('preflight finds both options without submitting feedback', async t => {
  const w = fixture(t, player());
  let submissions = 0;
  installMenu(w, { onFeedback: () => submissions++ });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  await adapter.preflight(adapter.current());
  assert.equal(submissions, 0);
});

test('missing channel option stops before submitting any feedback', async t => {
  const w = fixture(t, player());
  let submissions = 0;
  installMenu(w, { items: ['Not interested', 'Report'], onFeedback: () => submissions++ });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  await assert.rejects(adapter.preflight(adapter.current()), { code: 'missing-options' });
  assert.equal(submissions, 0);
});

test('an unrelated open menu is never used for feedback', async t => {
  const w = fixture(t, player() + '<div role="menu"><button role="menuitem">Not interested</button><button role="menuitem">Don\'t recommend channel</button></div>');
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  await assert.rejects(adapter.preflight(adapter.current()), { code: 'menu-open' });
});

test('hidden menu items cannot satisfy preflight', async t => {
  const w = fixture(t, player());
  installMenu(w);
  w.document.querySelector('[aria-label="More actions"]').addEventListener('click', () => {
    const items = w.document.querySelectorAll('[role="menuitem"]');
    items[1].hidden = true;
  });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  await assert.rejects(adapter.preflight(adapter.current()), { code: 'missing-options' });
});

test('feedback requires fresh visible confirmation and handles apostrophe variants', async t => {
  const w = fixture(t, player());
  const sent = [];
  installMenu(w, { items: ['Not interested', 'Don’t recommend this channel'], onFeedback: label => {
    sent.push(label);
    notice(w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel");
  } });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  const target = adapter.current();
  await adapter.preflight(target);
  await adapter.feedback(target, 'not-interested');
  await adapter.feedback(target, 'channel');
  assert.deepEqual(sent, ['Not interested', 'Don’t recommend this channel']);
});

test('closing a menu without confirmation is not success', async t => {
  const w = fixture(t, player());
  installMenu(w, { onFeedback: () => {} });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 30 });
  const target = adapter.current();
  await adapter.preflight(target);
  await assert.rejects(adapter.feedback(target, 'not-interested'), { code: 'timeout' });
});

test('a stale success toast cannot confirm a new feedback request', async t => {
  const w = fixture(t, player());
  notice(w, 'Video removed');
  installMenu(w, { onFeedback: () => {} });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 30 });
  const target = adapter.current();
  await adapter.preflight(target);
  await assert.rejects(adapter.feedback(target, 'not-interested'), { code: 'timeout' });
});

test('unsupported reason prompts remain for the viewer to answer', async t => {
  const w = fixture(t, player());
  installMenu(w, { onFeedback: () => {
    const dialog = w.document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.innerHTML = '<h2>Tell us why you are not interested</h2><input type="radio"><button>Submit</button>';
    w.document.body.append(dialog);
  } });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  const target = adapter.current();
  await adapter.preflight(target);
  await assert.rejects(adapter.feedback(target, 'not-interested'), { code: 'required-reason' });
  assert.equal(w.document.querySelector('input').checked, false);
  assert.ok(w.document.querySelector('[role="dialog"]'));
});

test('optional Tell us why buttons are left untouched', async t => {
  const w = fixture(t, player());
  let answered = false;
  installMenu(w, { onFeedback: () => {
    const status = notice(w, 'Video removed');
    const why = w.document.createElement('button');
    why.textContent = 'Tell us why';
    why.onclick = () => { answered = true; };
    status.append(why);
  } });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  const target = adapter.current();
  await adapter.preflight(target);
  await adapter.feedback(target, 'not-interested');
  assert.equal(answered, false);
});

test('a changed route rejects feedback for the original Short', async t => {
  const w = fixture(t, player());
  let submissions = 0;
  installMenu(w, { onFeedback: () => submissions++ });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  const target = adapter.current();
  await adapter.preflight(target);
  w.history.pushState({}, '', '/shorts/second-video');
  await assert.rejects(adapter.feedback(target, 'not-interested'), { code: 'changed-short' });
  assert.equal(submissions, 0);
});

test('replacing the renderer also rejects feedback for the old target', async t => {
  const w = fixture(t, player());
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  const target = adapter.current();
  target.element.replaceWith(w.document.createElement('ytd-reel-video-renderer'));
  await assert.rejects(adapter.feedback(target, 'not-interested'), { code: 'changed-short' });
});

test('next clicks once and waits for a new Shorts route', async t => {
  const w = fixture(t, player());
  let count = 0;
  w.document.querySelector('[aria-label="Next video"]').onclick = () => {
    count++;
    w.history.pushState({}, '', '/shorts/second-video');
  };
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 });
  await adapter.next(adapter.current());
  assert.equal(count, 1);
  assert.equal(w.location.pathname, '/shorts/second-video');
});

test('a next button that does not navigate cannot report completion', async t => {
  const w = fixture(t, player());
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 30 });
  await assert.rejects(adapter.next(adapter.current()), { code: 'timeout' });
});
