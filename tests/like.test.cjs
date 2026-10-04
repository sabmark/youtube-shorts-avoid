const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, player, installMenu } = require('./helpers.cjs');

function setup(t, { liked = false, confirm = true, missing = false } = {}) {
  const w = fixture(t, player());
  const native = w.document.createElement('button');
  native.setAttribute('aria-label', 'like this video along with 123 other people');
  native.setAttribute('aria-pressed', String(liked));
  let clicks = 0;
  native.onclick = () => {
    clicks++;
    if (confirm) native.setAttribute('aria-pressed', 'true');
  };
  if (!missing) w.document.querySelector('reel-action-bar-view-model').prepend(native);
  let advances = 0;
  w.document.querySelector('[aria-label="Next video"]').onclick = () => {
    advances++;
    w.history.pushState({}, '', '/shorts/second-video');
  };
  const flow = new w.ShortsAvoid.Workflow(new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 40 }));
  return { w, native, flow, clicks: () => clicks, advances: () => advances };
}

test('like workflow confirms the current video like and advances once without negative feedback', async t => {
  const env = setup(t);
  installMenu(env.w, { onFeedback: () => assert.fail('like must not send negative feedback') });
  const result = await env.flow.run(() => {}, 'like');
  assert.equal(result.status, 'complete');
  assert.equal(env.native.getAttribute('aria-pressed'), 'true');
  assert.equal(env.clicks(), 1);
  assert.equal(env.advances(), 1);
});

test('like workflow keeps an existing like while advancing', async t => {
  const env = setup(t, { liked: true });
  assert.equal((await env.flow.run(() => {}, 'like')).status, 'complete');
  assert.equal(env.clicks(), 0);
  assert.equal(env.advances(), 1);
});

for (const [name, options] of [['unconfirmed', { confirm: false }], ['missing', { missing: true }]]) {
  test(`${name} like never advances`, async t => {
    const env = setup(t, options);
    const result = await env.flow.run(() => {}, 'like');
    assert.equal(result.status, 'stopped');
    assert.equal(env.advances(), 0);
    assert.equal(env.clicks(), options.missing ? 0 : 1);
  });
}

test('navigation during like confirmation does not click or skip the successor', async t => {
  const env = setup(t, { confirm: false });
  env.native.onclick = () => env.w.history.pushState({}, '', '/shorts/second-video');
  assert.equal((await env.flow.run(() => {}, 'like')).code, 'changed-short');
  assert.equal(env.advances(), 0);
});

for (const trigger of ['button', 'ArrowRight']) {
  test(`${trigger} likes once and shares the busy guard with Avoid`, async t => {
    const env = setup(t);
    // Use a short observation window for synthetic browser behavior.
    env.w.ShortsAvoid.YoutubeAdapter.prototype.next = function(target) {
      this.assertCurrent(target);
      this.document.querySelector('[aria-label="Next video"]').click();
    };
    const root = env.w.document.querySelector('shorts-avoid-control').shadowRoot;
    const like = root.querySelector('[aria-label="Like video and go to next"]');
    assert.ok(like, 'like control must exist');
    if (trigger === 'button') like.click();
    else {
      const key = new env.w.KeyboardEvent('keydown', { key: trigger, bubbles: true, cancelable: true });
      env.w.document.dispatchEvent(key);
      assert.equal(key.defaultPrevented, true);
    }
    assert.equal(root.querySelector('button').disabled, true);
    assert.equal(like.disabled, true);
    like.click();
    root.querySelector('button').click();
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(env.clicks(), 1);
    assert.equal(env.advances(), 1);
    assert.equal(like.disabled, false);
  });
}

test('a saved Right Arrow Avoid shortcut takes priority over the like shortcut', async t => {
  const { storage } = require('./storage.cjs');
  const w = fixture(t, player(), undefined, { beforeScripts(w) {
    w.chrome = { storage: storage({ avoidShortcut: { key: 'ArrowRight' } }) };
  } });
  await new Promise(resolve => setImmediate(resolve));
  let negative = 0;
  installMenu(w, { onFeedback: () => { negative++; w.history.pushState({}, '', '/shorts/second-video'); } });
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 80));
  assert.equal(negative, 1);
});

for (const binding of [{ key: 'l', ctrlKey: true }, { type: 'mouse', button: 1, altKey: true }]) {
  test(`saved Like ${binding.type || 'keyboard'} shortcut activates and updates live`, async t => {
    const { storage } = require('./storage.cjs');
    const store = storage({ likeShortcut: binding });
    const w = fixture(t, player(), undefined, { beforeScripts(w) { w.chrome = { storage: store }; } });
    await new Promise(resolve => setImmediate(resolve));
    const native = w.document.createElement('button');native.setAttribute('aria-label', 'Like');native.setAttribute('aria-pressed', 'false');
    let likes=0;native.onclick=()=>{likes++;native.setAttribute('aria-pressed','true')};
    w.document.querySelector('reel-action-bar-view-model').prepend(native);
    w.ShortsAvoid.YoutubeAdapter.prototype.next = async function(target) { this.assertCurrent(target);w.history.pushState({}, '', '/shorts/second-video'); };
    const emit = value => {
      const event = value.type === 'mouse' ? new w.MouseEvent('mousedown', { ...value, bubbles:true,cancelable:true })
        : new w.KeyboardEvent('keydown', { ...value, bubbles:true,cancelable:true });
      w.document.body.dispatchEvent(event);return event;
    };
    assert.equal(emit({key:'ArrowRight'}).defaultPrevented,false,'saved Like replaces its default');
    assert.equal(emit(binding).defaultPrevented,true);
    await new Promise(resolve=>setTimeout(resolve,70));assert.equal(likes,1);assert.equal(w.location.pathname,'/shorts/second-video');
    native.setAttribute('aria-pressed','false');
    await store.local.set({likeShortcut:{key:'k'}});
    assert.equal(emit(binding).defaultPrevented,false);
    assert.equal(emit({key:'k'}).defaultPrevented,true);
    await new Promise(resolve=>setTimeout(resolve,70));assert.equal(likes,2);
  });
}
