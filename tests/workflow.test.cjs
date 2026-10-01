const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, player, installMenu, notice } = require('./helpers.cjs');

function setup(t, options) {
  const w = fixture(t, player());
  installMenu(w, options);
  let advances = 0;
  w.document.querySelector('[aria-label="Next video"]').onclick = () => {
    advances++;
    w.history.pushState({}, '', '/shorts/second-video');
  };
  assert.equal(typeof w.ShortsAvoid.Workflow, 'function', 'workflow is not implemented');
  const flow = new w.ShortsAvoid.Workflow(new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 60 }));
  return { w, flow, advances: () => advances };
}

test('one activation submits both actions in order then advances once', async t => {
  const sent = [];
  let w;
  const env = setup(t, { onFeedback: label => {
    sent.push(label);
    notice(w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel");
  } });
  w = env.w;
  const states = [];
  const result = await env.flow.run(state => states.push(state.status));
  assert.equal(result.status, 'complete');
  assert.deepEqual(Array.from(result.completed), ['not-interested', 'channel']);
  assert.deepEqual(sent, ['Not interested', "Don't recommend channel"]);
  assert.equal(env.advances(), 1);
  assert.equal(w.location.pathname, '/shorts/second-video');
  assert.deepEqual(states, ['busy', 'complete']);
});

test('preflight rejects an unsupported menu without submitting or scrolling', async t => {
  const sent = [];
  const env = setup(t, { items: ['Not interested', 'Report'], onFeedback: label => sent.push(label) });
  const result = await env.flow.run();
  assert.equal(result.status, 'stopped');
  assert.equal(result.code, 'missing-options');
  assert.equal(sent.length, 0);
  assert.equal(env.advances(), 0);
});

test('a vanished second option reports partial completion without advancing', async t => {
  let w;
  const items = ['Not interested', "Don't recommend channel"];
  const env = setup(t, { items, onFeedback: () => {
    notice(w, 'Video removed');
    items.pop();
  } });
  w = env.w;
  const result = await env.flow.run();
  assert.equal(result.status, 'partial');
  assert.deepEqual(Array.from(result.completed), ['not-interested']);
  assert.equal(result.code, 'missing-options');
  assert.equal(env.advances(), 0);
});

test('automatic advancement after the first action never dismisses the next Short', async t => {
  let w;
  const sent = [];
  const env = setup(t, { onFeedback: label => {
    sent.push(label);
    notice(w, 'Video removed');
    w.history.pushState({}, '', '/shorts/second-video');
  } });
  w = env.w;
  const result = await env.flow.run();
  assert.equal(result.status, 'partial');
  assert.equal(result.code, 'changed-short');
  assert.deepEqual(Array.from(result.completed), ['not-interested']);
  assert.deepEqual(sent, ['Not interested']);
  assert.equal(env.advances(), 0);
});

test('automatic advancement after both actions is not followed by an extra skip', async t => {
  let w;
  const env = setup(t, { onFeedback: label => {
    notice(w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel");
    if (label !== 'Not interested') w.history.pushState({}, '', '/shorts/second-video');
  } });
  w = env.w;
  const result = await env.flow.run();
  assert.equal(result.status, 'complete');
  assert.equal(env.advances(), 0);
  assert.equal(w.location.pathname, '/shorts/second-video');
});

test('delayed automatic advancement after both confirmations avoids a second skip', async t => {
  const env = setup(t, { onFeedback: label => {
    notice(env.w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel");
    if (label !== 'Not interested') env.w.setTimeout(() => {
      env.w.history.pushState({}, '', env.w.location.pathname === '/shorts/first-video'
        ? '/shorts/second-video' : '/shorts/third-video');
    }, 30);
  } });
  const result = await env.flow.run();
  await new Promise(resolve => env.w.setTimeout(resolve, 50));
  assert.equal(result.status, 'complete');
  assert.equal(env.advances(), 0);
  assert.equal(env.w.location.pathname, '/shorts/second-video');
});

test('a second activation is ignored while feedback is pending', async t => {
  let w;
  const sent = [];
  const env = setup(t, { onFeedback: label => {
    sent.push(label);
    w.setTimeout(() => notice(w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel"), 15);
  } });
  w = env.w;
  const first = env.flow.run();
  const second = await env.flow.run();
  assert.equal(second.status, 'busy');
  assert.equal((await first).status, 'complete');
  assert.equal(sent.length, 2);
  assert.equal(env.advances(), 1);
  assert.equal(env.flow.busy, false);
});

test('unsupported reasons stop the workflow without selecting an answer', async t => {
  let w;
  const env = setup(t, { onFeedback: () => {
    const dialog = w.document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.innerHTML = '<h2>Tell us why</h2><input type="radio"><button>Submit</button>';
    w.document.body.append(dialog);
  } });
  w = env.w;
  const result = await env.flow.run();
  assert.equal(result.status, 'stopped');
  assert.equal(result.code, 'required-reason');
  assert.equal(w.document.querySelector('input').checked, false);
  assert.equal(env.advances(), 0);
});

test('unconfirmed feedback is reported honestly without continuing', async t => {
  const env = setup(t, { onFeedback: () => {} });
  const result = await env.flow.run();
  assert.equal(result.status, 'stopped');
  assert.equal(result.code, 'timeout');
  assert.match(result.message, /may have been sent/i);
  assert.equal(env.advances(), 0);
});

test('an unsupported reason appearing while the second menu opens blocks channel feedback', async t => {
  const sent = [];
  const env = setup(t, { onFeedback: label => {
    sent.push(label);
    notice(env.w, 'Video removed');
  } });
  let openings = 0;
  env.w.document.querySelector('[aria-label="More actions"]').addEventListener('click', () => {
    if (++openings !== 2) return;
    const dialog = env.w.document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.textContent = 'Choose a reason';
    env.w.document.body.append(dialog);
  });
  const result = await env.flow.run();
  assert.equal(result.code, 'required-reason');
  assert.deepEqual(sent, ['Not interested']);
  assert.deepEqual(Array.from(result.completed), ['not-interested']);
  assert.equal(env.advances(), 0);
});
