const test = require('node:test');
const assert = require('node:assert/strict');
const { page, card, adapter } = require('./feedback-fixture.cjs');

test('snapshot exposes video feedback and excludes channel-only cards', async t => {
  const channel = '<div role="listitem" aria-label="Card showing an activity from YouTube"><button aria-label="Delete activity item Example channel">Delete</button><a href="https://www.youtube.com/channel/example">Dismissed channel</a></div>';
  const w = page(t, channel + card() + '<button>Load more</button>');
  const result = await adapter(w).snapshot();
  assert.equal(result.status, 'ready');
  assert.equal(result.entries.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(result.entries.map(({title,channel,url})=>({title,channel,url})))),
    [{title:'Example video',channel:'Example channel',url:'https://www.youtube.com/watch?v=example-123'}]);
  assert.ok(result.entries[0].id);
  assert.equal(result.hasMore, true);
});

test('wrong activity route and signed-out pages never expose entries', async t => {
  const wrong = page(t, card(), 'https://myactivity.google.com/myactivity');
  assert.equal((await adapter(wrong).snapshot()).entries.length, 0);
  const w = page(t, '<h1>Welcome to My Activity</h1><a href="https://accounts.google.com/ServiceLogin">Sign in</a>');
  w.document.querySelector('[aria-label^="Google Account:"]').remove();
  assert.equal((await adapter(w).snapshot()).status, 'sign-in');
});

test('Load more refreshes the snapshot after older feedback appears', async t => {
  const w = page(t, card() + '<button>Load more</button>');
  const a = adapter(w);
  w.document.querySelector('main > button').onclick = () => {
    w.document.querySelector('main').insertAdjacentHTML('beforeend', card('Older video', 'older-456'));
    w.document.querySelector('main > button').remove();
  };
  const result = await (a.loadMore?.() || a.snapshot());
  assert.equal(result.entries.length, 2);
  assert.equal(result.hasMore, false);
});

test('removal clicks only the selected video card and confirms its disappearance', async t => {
  const w = page(t, card() + card('Second video','second-456'));
  const a = adapter(w);
  const before = await a.snapshot();
  const cards = w.document.querySelectorAll('[role=listitem]');
  let wrongClicks = 0;
  cards[0].querySelector('button').onclick = () => wrongClicks++;
  cards[1].querySelector('button').onclick = () => cards[1].remove();
  const result = await (a.remove?.(before.entries[1].id) || {status:'error'});
  assert.equal(result.status, 'removed');
  assert.equal(wrongClicks, 0);
  assert.equal((await a.snapshot()).entries.length, 1);
});

test('disconnected cards and changed accounts are stale and never clicked', async t => {
  for (const change of ['disconnect','account','route']) {
    const w = page(t);
    const a = adapter(w);
    const id = (await a.snapshot()).entries[0].id;
    let clicks = 0;
    w.document.querySelector('main button').onclick = () => clicks++;
    if (change === 'disconnect') w.document.querySelector('[role=listitem]').remove();
    if (change === 'account') w.document.querySelector('[aria-label^="Google Account:"]').setAttribute('aria-label','Google Account: Other');
    if (change === 'route') w.history.pushState({}, '', '/myactivity');
    assert.equal((await (a.remove?.(id) || {status:'error'})).status, 'stale');
    assert.equal(clicks, 0);
  }
});

test('native confirmation and unchanged cards are not reported as removed', async t => {
  for (const confirmation of [true,false]) {
    const w = page(t);
    const a = adapter(w);
    const id = (await a.snapshot()).entries[0].id;
    w.document.querySelector('main button').onclick = () => {
      if (confirmation) w.document.body.insertAdjacentHTML('beforeend','<div role="dialog"><button>Delete</button><button>Cancel</button></div>');
    };
    assert.equal((await (a.remove?.(id) || {status:'error'})).status, confirmation ? 'confirmation' : 'error');
    assert.equal(w.document.querySelectorAll('[role=listitem]').length, 1);
  }
});

test('internal-message bridge rejects another sender and unknown actions', async t => {
  let listener;
  const w = page(t, card(), undefined, { beforeScripts(w) {
    w.chrome = { runtime: { id: 'our-extension', onMessage: { addListener(fn) { listener = fn; } } } };
  } });
  let responses = 0;
  assert.equal(listener({type:'shorts-avoid-feedback',action:'snapshot'},{id:'another-extension'},()=>responses++),false);
  assert.equal(listener({type:'shorts-avoid-feedback',action:'deleteAll'},{id:'our-extension'},()=>responses++),false);
  assert.equal(responses,0);
  const result = await new Promise(resolve => listener({type:'shorts-avoid-feedback',action:'snapshot'},{id:'our-extension'},resolve));
  assert.equal(result.status,'ready');
  assert.equal(result.entries.length,1);
});

test('a rebuilt equivalent card is not reported as successful deletion', async t => {
  const w = page(t);
  const a = adapter(w);
  const id = (await a.snapshot()).entries[0].id;
  const original = w.document.querySelector('[role=listitem]');
  original.querySelector('button').onclick = () => { original.outerHTML = card(); };
  assert.notEqual((await a.remove(id)).status, 'removed');
  assert.equal((await a.snapshot()).entries.length, 1);
});

test('a card recycled in place with the same title and URL invalidates its old identifier', async t => {
  const w = page(t);
  const a = adapter(w);
  const id = (await a.snapshot()).entries[0].id;
  const original = w.document.querySelector('[role=listitem]');
  original.setAttribute('jsdata', 'Activity;replacement;2');
  let clicks = 0;
  original.querySelector('button').onclick = () => clicks++;
  assert.equal((await a.remove(id)).status, 'stale');
  assert.equal((await a.remove(id)).status, 'stale', 'a consumed mutation must keep the old id stale');
  assert.equal(clicks, 0);
});

test('Google non-modal navigation drawer does not block individual video removal', async t => {
  const drawer = '<div role="dialog" aria-label="navigational drawer" aria-modal="false" aria-expanded="true" aria-hidden="false"><nav><a href="/myactivity">My Activity</a><a href="/more">Other activity</a></nav></div>';
  const w = page(t, drawer + card() + card('Second video','second-456'));
  const a = adapter(w);
  const before = await a.snapshot();
  let clicks = 0;
  const selected = w.document.querySelector('[role=listitem]');
  selected.querySelector('button').onclick = () => { clicks++; selected.remove(); };
  assert.equal((await a.remove(before.entries[0].id)).status,'removed');
  assert.equal(clicks,1);
  assert.ok(w.document.querySelector('[aria-label="navigational drawer"]'));
  assert.equal(w.document.querySelectorAll('[role=listitem]').length,1);
});

test('hidden dialogs do not block removal but visible dialogs still require confirmation', async t => {
  for(const hidden of [true,false]) {
    const w=page(t, `<div role="dialog" ${hidden?'style="display:none"':''}><button>Delete</button><button>Cancel</button></div>`+card()+card('Second','second-456'));
    const a=adapter(w);const before=await a.snapshot();
    let clicks=0;const selected=w.document.querySelector('[role=listitem]');
    selected.querySelector('button').onclick=()=>{clicks++;selected.remove();};
    assert.equal((await a.remove(before.entries[0].id)).status,hidden?'removed':'confirmation');
    assert.equal(clicks,hidden?1:0);
  }
});

test('a visible native alert dialog after clicking Delete remains a confirmation', async t => {
  const w=page(t,card()+card('Second','second-456'));
  const a=adapter(w);const before=await a.snapshot();
  w.document.querySelector('[role=listitem] button').onclick=()=>w.document.body.insertAdjacentHTML('beforeend','<div role="alertdialog"><button>Delete</button><button>Cancel</button></div>');
  assert.equal((await a.remove(before.entries[0].id)).status,'confirmation');
  assert.equal(w.document.querySelectorAll('[role=listitem]').length,2);
});

test('a non-modal dialog containing navigation still requires confirmation unless it is the observed drawer', async t => {
  const w=page(t,'<div role="dialog" aria-label="Confirm removal" aria-modal="false"><nav><a href="/help">Help</a></nav><button>Delete</button><button>Cancel</button></div>'+card());
  const a=adapter(w);const before=await a.snapshot();
  let clicks=0;w.document.querySelector('[role=listitem] button').onclick=()=>clicks++;
  assert.equal((await a.remove(before.entries[0].id)).status,'confirmation');
  assert.equal(clicks,0);
});

test('a confirmation appearing when a delayed poll resumes is checked before timing out', async t => {
  const w = page(t);
  const a = adapter(w);
  const id = (await a.snapshot()).entries[0].id;
  let now = 0;
  w.eval('Date.now = () => window.testNow');
  w.testNow = now;
  w.setTimeout = callback => {
    w.testNow = now += 1000;
    w.document.body.insertAdjacentHTML('beforeend', '<div role="dialog" aria-labelledby="confirm-title"><p id="confirm-title">Confirm you would like to delete this activity</p><button>Cancel</button><button>Delete</button></div>');
    callback();
  };
  let deleteClicks = 0;
  w.document.querySelector('main button').onclick = () => deleteClicks++;
  assert.equal((await a.remove(id)).status, 'confirmation');
  assert.equal(deleteClicks, 1);
  assert.equal(w.document.querySelectorAll('[role=listitem]').length, 1);
});
