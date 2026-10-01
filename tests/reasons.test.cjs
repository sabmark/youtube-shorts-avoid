const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, player, installMenu, notice } = require('./helpers.cjs');

function prompt(window, { choices = ['Already watched', 'Other'], buttons = false, wrapped = false, submit = true, close = true, textInput = false, extraInputOnChoice = false } = {}) {
  const doc = window.document;
  const dialog = doc.createElement('div');
  dialog.setAttribute('role', 'dialog');
  const heading = doc.createElement('h2');
  heading.textContent = "Tell us why you're not interested";
  dialog.append(heading);
  const addTextInput = () => {
    const input = doc.createElement('input');
    input.type = 'text';
    input.placeholder = 'Tell us more';
    dialog.append(input);
  };
  if (textInput) addTextInput();
  const selected = [];
  for (const label of choices) {
    const choice = doc.createElement(buttons ? 'button' : wrapped ? 'label' : 'div');
    choice.textContent = label;
    if (wrapped) {
      const input = doc.createElement('input');
      input.type = 'radio';
      input.hidden = true;
      choice.append(input);
    } else if (!buttons) choice.setAttribute('role', 'radio');
    choice.onclick = event => {
      if (event.target !== choice) return;
      selected.push(label);
      choice.setAttribute('aria-checked', 'true');
      if (extraInputOnChoice) addTextInput();
      if (!submit) { dialog.remove(); notice(window, 'Video removed'); }
    };
    dialog.append(choice);
  }
  let submissions = 0;
  if (submit) {
    const button = doc.createElement('button');
    button.textContent = 'Submit';
    button.onclick = () => {
      submissions++;
      if (close) { dialog.remove(); notice(window, 'Video removed'); }
    };
    dialog.append(button);
  }
  doc.body.append(dialog);
  return { dialog, selected, submissions: () => submissions };
}

async function processReason(t, options) {
  const w = fixture(t, player());
  let dialog;
  const sent = [];
  installMenu(w, { onFeedback: label => {
    sent.push(label);
    if (label === 'Not interested') dialog = prompt(w, options);
    else notice(w, "We won't recommend videos from this channel");
  } });
  let advances = 0;
  w.document.querySelector('[aria-label="Next video"]').onclick = () => {
    advances++;
    w.history.pushState({}, '', '/shorts/second-video');
  };
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 60 });
  const result = await new w.ShortsAvoid.Workflow(adapter).run();
  return { w, dialog, sent, result, advances };
}

test('an opened reason dialog prefers Other, submits once, then continues and advances', async t => {
  const env = await processReason(t);
  assert.equal(env.result.status, 'complete');
  assert.deepEqual(env.dialog.selected, ['Other']);
  assert.equal(env.dialog.submissions(), 1);
  assert.deepEqual(env.sent, ['Not interested', "Don't recommend channel"]);
  assert.equal(env.advances, 1);
});

test('reason selection falls back to the first choice when Other is absent', async t => {
  const env = await processReason(t, { choices: ['Already watched', "I don't like the video"] });
  assert.equal(env.result.status, 'complete');
  assert.deepEqual(env.dialog.selected, ['Already watched']);
});

test('reason choices rendered as buttons can close the dialog without a Submit button', async t => {
  const env = await processReason(t, { buttons: true, submit: false });
  assert.equal(env.result.status, 'complete');
  assert.deepEqual(env.dialog.selected, ['Other']);
  assert.equal(env.dialog.submissions(), 0);
});

test('visible reason labels work with hidden native radio inputs', async t => {
  const env = await processReason(t, { wrapped: true });
  assert.equal(env.result.status, 'complete');
  assert.deepEqual(env.dialog.selected, ['Other']);
});

test('a pre-existing reason prompt is not answered by a new activation', async t => {
  const w = fixture(t, player());
  const dialog = prompt(w);
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 30 });
  const result = await new w.ShortsAvoid.Workflow(adapter).run();
  assert.equal(result.code, 'required-reason');
  assert.deepEqual(dialog.selected, []);
  assert.equal(dialog.submissions(), 0);
});

test('an unclosed reason dialog times out without repeating selection or submission', async t => {
  const env = await processReason(t, { close: false });
  assert.equal(env.result.status, 'stopped');
  assert.equal(env.result.code, 'timeout');
  assert.deepEqual(env.dialog.selected, ['Other']);
  assert.equal(env.dialog.submissions(), 1);
  assert.deepEqual(env.sent, ['Not interested']);
  assert.equal(env.advances, 0);
});

test('a reason prompt on a changed Short remains untouched', async t => {
  const w = fixture(t, player());
  let dialog;
  installMenu(w, { onFeedback: () => {
    dialog = prompt(w);
    w.history.pushState({}, '', '/shorts/second-video');
  } });
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 30 });
  const result = await new w.ShortsAvoid.Workflow(adapter).run();
  assert.equal(result.code, 'changed-short');
  assert.deepEqual(dialog.selected, []);
  assert.equal(dialog.submissions(), 0);
});

test('a later reason after Not interested confirmation stays untouched and stops channel feedback', async t => {
  const w = fixture(t, player());
  let dialog;
  const sent = [];
  installMenu(w, { onFeedback: label => {
    sent.push(label);
    if (label !== 'Not interested') assert.equal(dialog.dialog.isConnected, false);
    notice(w, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel");
  } });
  let openings = 0;
  w.document.querySelector('[aria-label="More actions"]').addEventListener('click', () => {
    if (++openings === 2) dialog = prompt(w);
  });
  w.document.querySelector('[aria-label="Next video"]').onclick = () => w.history.pushState({}, '', '/shorts/second-video');
  const adapter = new w.ShortsAvoid.YoutubeAdapter(w, { timeoutMs: 60 });
  const result = await new w.ShortsAvoid.Workflow(adapter).run();
  assert.equal(result.status, 'partial');
  assert.equal(result.code, 'required-reason');
  assert.deepEqual(dialog.selected, []);
  assert.equal(dialog.submissions(), 0);
  assert.deepEqual(sent, ['Not interested']);
});

test('a reason dialog with an enabled text field is not selected or submitted', async t => {
  const env = await processReason(t, { textInput: true });
  assert.equal(env.result.code, 'required-reason');
  assert.deepEqual(env.dialog.selected, []);
  assert.equal(env.dialog.submissions(), 0);
  assert.deepEqual(env.sent, ['Not interested']);
  assert.equal(env.advances, 0);
});

test('a text field revealed by choosing Other prevents reason submission', async t => {
  const env = await processReason(t, { extraInputOnChoice: true });
  assert.equal(env.result.code, 'required-reason');
  assert.deepEqual(env.dialog.selected, ['Other']);
  assert.equal(env.dialog.submissions(), 0);
  assert.deepEqual(env.sent, ['Not interested']);
  assert.equal(env.advances, 0);
});
