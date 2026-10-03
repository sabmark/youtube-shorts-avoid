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

function nativePage(t, html) {
  const w = page(t, html);
  for (const [index, card] of [...w.document.querySelectorAll('[role=listitem]')].entries()) {
    const owner = w.document.createElement('c-wiz'); owner.id = `activity-owner-${index}`; owner.setAttribute('jscontroller','Dlfr9');
    card.replaceWith(owner); owner.append(card);
  }
  return w;
}

function nativeDeleteDialog(w, finish, { title = 'Confirm you would like to delete this activity', disabled = false, owner = w.document.querySelector('c-wiz')?.id } = {}) {
  const dialog = w.document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('jsname', 'WCCDZe');
  if (owner) dialog.setAttribute('jsowner', owner);
  dialog.setAttribute('aria-labelledby', 'native-confirm-title');
  dialog.innerHTML = `<div id="native-confirm-title" role="heading"><img alt=""></div><span jsname="bN97Pc"><p>${title}</p><p>This will not show again</p></span><div style="display:none"><div role="button" data-id="EBS5u">Delete</div></div><div role="button" data-id="IbE0S">Cancel</div><div role="button" data-id="EBS5u" aria-disabled="${disabled}">Delete</div>`;
  const buttons = [...dialog.querySelectorAll('[role=button]')];
  for (const button of buttons) button.getBoundingClientRect = () => ({ width: 64, height: 36 });
  buttons[0].onclick = () => assert.fail('hidden template Delete must not be clicked');
  buttons.at(-1).onclick = finish;
  w.document.body.append(dialog);
  return dialog;
}

test('popup-confirmed removal completes only its new single-activity Google dialog once', async t => {
  const w = nativePage(t, card() + card('Second video','second-456') + '<div role="listitem" aria-label="Card showing an activity from YouTube"><button aria-label="Delete activity item Channel">Delete</button><a href="https://www.youtube.com/channel/example">Channel</a></div>');
  const a = adapter(w); const id = (await a.snapshot()).entries[0].id;
  const selected = w.document.querySelector('[role=listitem]');
  let initialClicks = 0, finalClicks = 0;
  selected.querySelector('button').onclick = () => {
    initialClicks++;
    const dialog = nativeDeleteDialog(w, () => {
      finalClicks++;
      w.setTimeout(() => { selected.remove(); dialog.remove(); }, 15);
    });
  };
  assert.equal((await a.remove(id)).status, 'removed');
  assert.equal(initialClicks, 1); assert.equal(finalClicks, 1);
  assert.equal(w.document.querySelectorAll('[role=listitem]').length, 2);
});

test('pre-existing single-activity confirmations are never completed for another popup item', async t => {
  const w = nativePage(t); const a = adapter(w); const id = (await a.snapshot()).entries[0].id;
  let clicks = 0;
  nativeDeleteDialog(w, () => clicks++);
  w.document.querySelector('main button').onclick = () => clicks++;
  assert.equal((await a.remove(id)).status, 'confirmation'); assert.equal(clicks, 0);
});

test('unrelated bulk disabled and replaced-target confirmations never receive final Delete', async t => {
  for (const mode of ['bulk','disabled','changed-video','changed-account','changed-route','old-hidden']) {
    const w = nativePage(t); const a = adapter(w); const id = (await a.snapshot()).entries[0].id;
    let finalClicks = 0;
    let old;
    if(mode === 'old-hidden') { old = nativeDeleteDialog(w, () => finalClicks++); old.hidden = true; }
    w.document.querySelector('main button').onclick = () => {
      if(old) old.hidden = false;
      else nativeDeleteDialog(w, () => finalClicks++, {title:mode === 'bulk' ? 'Delete all activity' : undefined, disabled:mode === 'disabled'});
      if(mode === 'changed-video') w.document.querySelector('main a').href = 'https://www.youtube.com/watch?v=changed';
      if(mode === 'changed-account') w.document.querySelector('[aria-label^="Google Account:"]').setAttribute('aria-label','Google Account: Other');
      if(mode === 'changed-route') w.history.pushState({},'', '/myactivity');
    };
    assert.notEqual((await a.remove(id)).status, 'removed', mode);
    assert.equal(finalClicks, 0, mode);
  }
});

test('clicking the final Google Delete without disappearance never reports success or retries', async t => {
  const w = nativePage(t); const a = adapter(w); const id = (await a.snapshot()).entries[0].id;
  let finalClicks = 0;
  w.document.querySelector('main button').onclick = () => nativeDeleteDialog(w, () => finalClicks++);
  assert.equal((await a.remove(id)).status, 'error'); assert.equal(finalClicks, 1);
  assert.equal(w.document.querySelectorAll('[role=listitem]').length, 1);
});


test('an unrelated exact single-item dialog with another activity owner is never confirmed', async t => {
  const w = nativePage(t, card() + card('Other video','other-456'));
  const a = adapter(w); const id = (await a.snapshot()).entries[0].id;
  let finalClicks = 0;
  w.document.querySelector('main button').onclick = () => w.setTimeout(() => {
    nativeDeleteDialog(w, () => finalClicks++, {owner:'activity-owner-1'});
  }, 10);
  assert.notEqual((await a.remove(id)).status, 'removed');
  assert.equal(finalClicks, 0);
});

test('Google may assign the activity owner id only while opening confirmation', async t => {
  const w = nativePage(t, card() + card('Other video','other-456'));
  const owner = w.document.querySelector('c-wiz'); owner.removeAttribute('id');
  const a = adapter(w); const id = (await a.snapshot()).entries[0].id;
  const selected = owner.querySelector('[role=listitem]'); let finalClicks = 0;
  selected.querySelector('button').onclick = () => {
    owner.id = 'new-google-owner';
    const dialog = nativeDeleteDialog(w, () => {finalClicks++; selected.remove();dialog.remove();});
  };
  assert.equal((await a.remove(id)).status, 'removed');
  assert.equal(finalClicks, 1);
});

function nativeReceipt(w, finish) {
  const d=w.document.createElement('div'); d.setAttribute('role','dialog');d.setAttribute('jsname','OSlCJe');
  d.innerHTML='<div jsname="bN97Pc"><div jscontroller="oehLEf"><div>Deletion complete</div><div>The activity you selected is being permanently deleted from your account and no longer tied to you.</div><input type="checkbox" checked><button aria-label="Close this dialog">close</button><button>Got it</button></div></div>';
  const close=d.querySelector('[aria-label="Close this dialog"]');close.getBoundingClientRect=()=>({width:48,height:48});close.onclick=finish;
  d.querySelector('input').onclick=()=>assert.fail('receipt preference must stay unchanged');d.querySelectorAll('button')[1].onclick=()=>assert.fail('Got it must not change receipt preferences');w.document.body.append(d);return d;
}

test('the Google completion receipt is closed before confirming selected-card disappearance',async t=>{
  const w=nativePage(t,card()+card('Other','other-456'));const a=adapter(w);const id=(await a.snapshot()).entries[0].id;const selected=w.document.querySelector('[role=listitem]');let finalClicks=0,closeClicks=0;
  selected.querySelector('button').onclick=()=>{const confirmation=nativeDeleteDialog(w,()=>{finalClicks++;confirmation.remove();const receipt=nativeReceipt(w,()=>{closeClicks++;receipt.remove();selected.remove();});});};
  assert.equal((await a.remove(id)).status,'removed');assert.equal(finalClicks,1);assert.equal(closeClicks,1);assert.equal(w.document.querySelectorAll('[role=listitem]').length,1);
});

test('a one-step Google deletion may require closing its completion receipt',async t=>{
  const w=nativePage(t,card()+card('Other','other-456'));const a=adapter(w);const id=(await a.snapshot()).entries[0].id;const selected=w.document.querySelector('[role=listitem]');let closes=0;
  selected.querySelector('button').onclick=()=>{const d=nativeReceipt(w,()=>{closes++;d.remove();selected.remove();});};
  assert.equal((await a.remove(id)).status,'removed');assert.equal(closes,1);
});

test('an existing completion receipt can finish pending removal without another Delete click',async t=>{
  const w=nativePage(t,card()+card('Other','other-456'));const a=adapter(w);const id=(await a.snapshot()).entries[0].id;const selected=w.document.querySelector('[role=listitem]');let deletes=0;
  selected.querySelector('button').onclick=()=>deletes++;
  const receipt=nativeReceipt(w,()=>{selected.remove();receipt.remove();});
  assert.equal((await a.remove(id)).status,'removed');assert.equal(deletes,0);
});

test('closing a receipt for another item never deletes the selected video or reports its removal',async t=>{
  const w=nativePage(t,card()+card('Other','other-456'));const a=adapter(w);const id=(await a.snapshot()).entries[0].id;let deletes=0;
  w.document.querySelector('[role=listitem] button').onclick=()=>deletes++;
  const receipt=nativeReceipt(w,()=>receipt.remove());
  assert.notEqual((await a.remove(id)).status,'removed');assert.equal(deletes,0);
});
