const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const entries = n => Array.from({length:n},(_,i)=>({id:`item-${i}`,title:`Video ${i}`,channel:'Channel',url:`https://www.youtube.com/watch?v=video-${i}`}));
async function flush() { await new Promise(resolve=>setImmediate(resolve)); }
async function popup(t, {data=entries(11),handle,existing=true,screenWidth=1920}={}) {
  const dom = new JSDOM(readFileSync(join(__dirname,'../extension/popup.html'),'utf8'),{runScripts:'outside-only',url:'https://extension.test/popup.html'});
  t.after(dom.window.close.bind(dom.window));
  Object.defineProperty(dom.window.screen, 'availWidth', {value:screenWidth});
  const calls=[];
  dom.window.close=()=>calls.push(['close']);
  dom.window.chrome={
    tabs:{async query(){return existing?[{id:7,url:'https://myactivity.google.com/page?page=youtube_user_feedback'}]:[];},
      async create(opts){calls.push(['create',opts]);return {id:8};},
      async update(id,opts){calls.push(['update',id,opts]);return {id,windowId:3};},
      async reload(id){calls.push(['reload',id]);},
      async sendMessage(id,msg){calls.push(['message',id,msg]);return handle?handle(msg):{status:'ready',entries:data,hasMore:false};}},
    windows:{async update(id,opts){calls.push(['window-update',id,opts]);return {id};},
      async create(opts){calls.push(['window-create',opts]);return {id:10};}},
    runtime:{async openOptionsPage(){calls.push(['settings']);}}
  };
  const script=join(__dirname,'../extension/src/popup.js');
  if(existsSync(script)) dom.window.eval(readFileSync(script,'utf8'));
  await flush();
  return {w:dom.window,calls};
}
async function click(w,id) {w.document.querySelector(id).click();await flush();}

test('popup paginates 11 loaded entries as 10 then 1 and navigates back',async t=>{
  const {w}=await popup(t);
  assert.equal(w.document.querySelectorAll('#entries li').length,10);
  await click(w,'#next');
  assert.equal(w.document.querySelectorAll('#entries li').length,1);
  assert.match(w.document.querySelector('#entries').textContent,/Video 10/);
  await click(w,'#previous');
  assert.equal(w.document.querySelectorAll('#entries li').length,10);
});

test('popup creates an inactive Google tab when needed and renders remote titles as text',async t=>{
  const {w,calls}=await popup(t,{existing:false,data:[{...entries(1)[0],title:'<img src=x onerror=alert(1)>'}]});
  assert.match(w.document.querySelector('#entries').textContent,/<img src=x/);
  assert.equal(w.document.querySelector('#entries a img'),null);
  assert.equal(w.document.querySelectorAll('#entries img').length,1);
  assert.equal(w.document.querySelector('#entries img').hasAttribute('onerror'),false);
  assert.equal(calls.find(c=>c[0]==='create')[1].active,false);
});

test('removal requires confirmation, cancel sends nothing, and successful removal refreshes the page',async t=>{
  let data=entries(11);
  const {w,calls}=await popup(t,{handle:msg=>{
    if(msg.action==='remove'){data=data.filter(e=>e.id!==msg.id);return {status:'removed'};}
    return {status:'ready',entries:data,hasMore:false};
  }});
  await click(w,'#entries li button');
  assert.equal(w.document.querySelector('#confirmation').hidden,false);
  await click(w,'#cancel');
  assert.equal(calls.filter(c=>c[0]==='message'&&c[2].action==='remove').length,0);
  await click(w,'#next');
  await click(w,'#entries li button');
  await click(w,'#confirm-remove');
  assert.equal(w.document.querySelectorAll('#entries li').length,10);
  assert.match(w.document.querySelector('#status').textContent,/removed/i);
  assert.equal(calls.filter(c=>c[0]==='message'&&c[2].action==='remove').length,1);
});

test('native confirmation activates the history tab; stale and failed removal never report success',async t=>{
  for(const status of ['confirmation','stale','error']){
    const {w,calls}=await popup(t,{handle:msg=>msg.action==='remove'?{status}:{status:'ready',entries:entries(1),hasMore:false}});
    await click(w,'#entries li button');await click(w,'#confirm-remove');
    assert.equal(w.document.querySelectorAll('#entries li').length,1);
    assert.doesNotMatch(w.document.querySelector('#status').textContent,/feedback removed/i);
    if(status==='confirmation') assert.ok(calls.some(c=>c[0]==='update'&&c[2].active));
  }
});

test('Load older feedback adds entries and unsafe video URLs are excluded',async t=>{
  const {w}=await popup(t,{handle:msg=>({status:'ready',entries:msg.action==='loadMore'?entries(21):[...entries(1),{...entries(1)[0],id:'bad',url:'javascript:alert(1)'}],hasMore:true})});
  assert.equal(w.document.querySelectorAll('#entries li').length,1);
  await click(w,'#older');
  assert.equal(w.document.querySelectorAll('#entries li').length,10);
  assert.match(w.document.querySelector('#page').textContent,/21 loaded/);
});

test('signed-out status offers Google history and shortcut settings',async t=>{
  const {w,calls}=await popup(t,{handle:()=>({status:'sign-in',entries:[],hasMore:false})});
  assert.match(w.document.querySelector('#status').textContent,/sign in/i);
  await click(w,'#google');await click(w,'#settings');
  assert.ok(calls.some(c=>c[0]==='update'&&c[2].active));
  assert.ok(calls.some(c=>c[0]==='settings'));
});

test('a tab closed during removal reports failure without retrying deletion',async t=>{
  const {w,calls}=await popup(t,{handle:msg=>{if(msg.action==='remove') throw new Error('No tab with id: 7');return {status:'ready',entries:entries(1),hasMore:false};}});
  await click(w,'#entries li button');await click(w,'#confirm-remove');
  assert.match(w.document.querySelector('#status').textContent,/could not|failed/i);
  assert.equal(calls.filter(c=>c[0]==='message'&&c[2].action==='remove').length,1);
});

test('a missing receiver reloads the Google tab once and recovers the loaded list',async t=>{
  let reads=0;
  const {w,calls}=await popup(t,{handle:()=>{
    if(reads++===0) throw new Error('Could not establish connection. Receiving end does not exist.');
    return {status:'ready',entries:entries(1),hasMore:false};
  }});
  await new Promise(resolve=>setTimeout(resolve,350));
  assert.equal(w.document.querySelectorAll('#entries li').length,1);
  assert.equal(calls.filter(c=>c[0]==='reload').length,1);
});

test('extension icon shows feedback inside its popup without opening another window', async t => {
  const {w,calls}=await popup(t);
  assert.equal(w.document.querySelectorAll('#entries li').length,10);
  assert.equal(calls.some(c=>c[0]==='window-create'),false);
  assert.equal(calls.some(c=>c[0]==='close'),false);
});

test('popup retains its explicit screen-based width', async t => {
  for(const [screenWidth,expected] of [[1920,640],[2560,800],[1280,480],[0,640]]){
    const {w}=await popup(t,{screenWidth});
    assert.equal(w.document.documentElement.style.width, `${expected}px`);
  }
});

test('video rows show thumbnails derived from validated video IDs without sending a referrer', async t => {
  const {w} = await popup(t, {data:[{...entries(1)[0],url:'https://www.youtube.com/watch?v=sample-ID_1&list=ignored',thumbnail:'https://untrusted.test/image'}]});
  const image = w.document.querySelector('#entries li img');
  assert.ok(image, 'video thumbnail is rendered');
  assert.equal(image.src, 'https://i.ytimg.com/vi/sample-ID_1/mqdefault.jpg');
  assert.equal(image.referrerPolicy, 'no-referrer');
  assert.equal(image.alt, '');
  assert.equal(image.loading, 'lazy');
});

test('unavailable thumbnails leave a stable fallback and readable video title', async t => {
  const {w} = await popup(t, {data:entries(1)});
  const image = w.document.querySelector('#entries li img');
  assert.ok(image);
  image.dispatchEvent(new w.Event('error'));
  assert.equal(image.hidden, true);
  assert.match(w.document.querySelector('#entries li').textContent,/Video 0/);
  assert.equal(w.document.querySelector('#entries li .thumbnail').getAttribute('aria-hidden'),'true');
});

test('Google history brings its existing browser window to the front', async t => {
  const {w,calls}=await popup(t);
  await click(w,'#google');
  const focused=calls.find(c=>c[0]==='window-update');
  assert.ok(focused,'the Google tab browser window is focused');
  assert.equal(focused[1],3);
  assert.equal(focused[2].focused,true);
});
