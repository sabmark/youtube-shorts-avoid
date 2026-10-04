const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

async function popup(t, { failSettings = false } = {}) {
  const dom = new JSDOM(readFileSync(join(__dirname, '../extension/popup.html'), 'utf8'), { runScripts: 'outside-only', url: 'https://extension.test/popup.html' });
  t.after(() => dom.window.close());
  const calls = [];
  dom.window.chrome = {
    tabs: {
      async query() { calls.push('query'); return []; },
      async create() { calls.push('create'); return { id: 1 }; },
      async sendMessage() { calls.push('message'); return { status: 'ready', entries: [], hasMore: false }; }
    },
    runtime: { async openOptionsPage() { calls.push('settings'); if (failSettings) throw new Error('blocked'); } }
  };
  dom.window.eval(readFileSync(join(__dirname, '../extension/src/popup.js'), 'utf8'));
  await new Promise(resolve => setImmediate(resolve));
  return { w: dom.window, calls };
}

test('opening the menu offers both histories without reading or opening Google activity', async t => {
  const { w, calls } = await popup(t);
  assert.deepEqual(calls, []);
  const links = [...w.document.querySelectorAll('a')];
  assert.equal(links.length, 2);
  assert.equal(links[0].textContent.trim(), 'Not Interested history');
  assert.equal(links[0].href, 'https://myactivity.google.com/page?hl=en&page=youtube_user_feedback');
  assert.equal(links[1].textContent.trim(), 'Liked videos history');
  assert.equal(links[1].href, 'https://myactivity.google.com/page?hl=en&page=youtube_likes');
  for (const link of links) {
    assert.equal(link.target, '_blank');
    assert.match(link.rel, /noopener/);
  }
  assert.equal(w.document.querySelector('#entries'), null);
  assert.equal(w.document.querySelector('#confirm-remove'), null);
});

test('Shortcut settings opens the existing options page', async t => {
  const { w, calls } = await popup(t);
  w.document.querySelector('#settings').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['settings']);
});

test('settings failure offers a browser extensions fallback', async t => {
  const { w } = await popup(t, { failSettings: true });
  w.document.querySelector('#settings').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(w.document.querySelector('[role=status]').textContent, /browser extensions page/i);
});

test('native popup rounds fractional content height up to avoid clipping', async t => {
  const dom = new JSDOM(readFileSync(join(__dirname, '../extension/popup.html'), 'utf8'), { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  dom.window.chrome = { runtime: { openOptionsPage: async () => {} } };
  let observed;
  let callback;
  dom.window.ResizeObserver = class {
    constructor(fn) { callback = fn; }
    observe(element) { observed = element; }
  };
  dom.window.document.querySelector('main').getBoundingClientRect = () => ({ height: 285.71875 });
  dom.window.eval(readFileSync(join(__dirname, '../extension/src/popup.js'), 'utf8'));
  assert.ok(observed, 'popup content must be observed for size changes');
  callback();
  assert.equal(dom.window.document.documentElement.style.height, '286px');
});
