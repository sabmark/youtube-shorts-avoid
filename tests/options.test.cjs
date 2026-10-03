const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { storage } = require('./storage.cjs');
async function options(t, store) {
  const base = join(__dirname, '../extension');
  const dom = new JSDOM(readFileSync(join(base, 'options.html'), 'utf8'), { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  dom.window.chrome = { storage: store };
  for (const name of ['shortcut.js', 'options.js']) {
    const path = join(base, 'src', name);
    if (existsSync(path)) dom.window.eval(readFileSync(path, 'utf8'));
  }
  await new Promise(resolve => setImmediate(resolve));
  return dom.window;
}
const field = w => w.document.querySelector('#shortcut');
function key(w, name, extra = {}) {
  const event = new w.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...extra });
  field(w).dispatchEvent(event);
  return event;
}
async function click(w, id) {
  w.document.querySelector(id).click();
  await new Promise(resolve => setImmediate(resolve));
}

test('settings captures, saves and reloads a modified shortcut and resets the default', async t => {
  const store = storage();
  const w = await options(t, store);
  assert.equal(field(w).value, 'Right');
  key(w, 'k', { ctrlKey: true });
  assert.equal(field(w).value, 'Ctrl + k');
  await click(w, '#save');
  assert.match(w.document.querySelector('#status').textContent, /saved/i);
  const reopened = await options(t, store);
  assert.equal(field(reopened).value, 'Ctrl + k');
  await click(reopened, '#reset');
  const reset = await options(t, store);
  assert.equal(field(reset).value, 'Right');
});

test('Tab moves focus, modifier-only keys are ignored and Escape cancels the pending change', async t => {
  const w = await options(t, storage());
  assert.equal(key(w, 'Tab').defaultPrevented, false);
  key(w, 'Control', { ctrlKey: true });
  assert.equal(field(w).value, 'Right');
  key(w, 'j');
  assert.equal(field(w).value, 'j');
  key(w, 'Escape');
  assert.equal(field(w).value, 'Right');
  assert.equal(w.document.querySelector('#save').disabled, true);
});

test('failed saving reports an error and does not replace the stored shortcut', async t => {
  const store = storage();
  store.local.set = async () => { throw new Error('quota'); };
  const w = await options(t, store);
  key(w, 'j');
  await click(w, '#save');
  assert.match(w.document.querySelector('#status').textContent, /could not save/i);
  const reopened = await options(t, store);
  assert.equal(field(reopened).value, 'Right');
});

test('a failed initial settings read can be retried without reopening the page', async t => {
  const store = storage({ avoidShortcut: { key: 'j' } });
  const get = store.local.get;
  store.local.get = async () => { throw new Error('temporarily unavailable'); };
  const w = await options(t, store);
  assert.match(w.document.querySelector('#status').textContent, /could not load/i);
  assert.equal(field(w).disabled, true);
  assert.ok(w.document.querySelector('#retry'), 'settings read failure needs a retry control');
  store.local.get = get;
  await click(w, '#retry');
  assert.equal(field(w).disabled, false);
  assert.equal(field(w).value, 'j');
});

function mouse(w, type, button, extra = {}) {
  const event = new w.MouseEvent(type, { button, bubbles: true, cancelable: true, ...extra });
  field(w).dispatchEvent(event);
  return event;
}

test('mouse capture requires focus and persists a modified mouse binding', async t => {
  const store = storage();
  const w = await options(t, store);
  assert.equal(mouse(w, 'mousedown', 0).defaultPrevented, false);
  assert.equal(field(w).value, 'Right', 'clicking to focus must not replace the binding');
  field(w).focus();
  assert.equal(mouse(w, 'mousedown', 1, { ctrlKey: true }).defaultPrevented, true);
  assert.equal(field(w).value, 'Ctrl + Middle mouse');
  assert.equal(mouse(w, 'auxclick', 1).defaultPrevented, true);
  await click(w, '#save');
  const reopened = await options(t, store);
  assert.equal(field(reopened).value, 'Ctrl + Middle mouse');
  key(reopened, 'j');
  assert.equal(field(reopened).value, 'j');
  key(reopened, 'Escape');
  assert.equal(field(reopened).value, 'Ctrl + Middle mouse');
  await click(reopened, '#reset');
  assert.equal(field(reopened).value, 'Right');
});

test('settings captures all five standard mouse buttons and suppresses the context menu', async t => {
  const w = await options(t, storage());
  field(w).focus();
  for (const [button, label] of ['Left mouse', 'Middle mouse', 'Right mouse', 'Mouse Back', 'Mouse Forward'].entries()) {
    mouse(w, 'mousedown', button);
    assert.equal(field(w).value, label);
  }
  mouse(w, 'mousedown', 2);
  assert.equal(mouse(w, 'contextmenu', 2).defaultPrevented, true);
});
