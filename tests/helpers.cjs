const { JSDOM, VirtualConsole } = require('jsdom');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

function fixture(t, html, url = 'https://www.youtube.com/shorts/first-video', { beforeScripts } = {}) {
  const runtimeErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => runtimeErrors.push(error.message));
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  const observers = [];
  const NativeObserver = dom.window.MutationObserver;
  dom.window.MutationObserver = class extends NativeObserver {
    constructor(...args) {
      super(...args);
      observers.push(this);
    }
  };
  t.after(async () => {
    for (const observer of observers) observer.disconnect();
    dom.window.close();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(runtimeErrors, [], 'Unexpected errors in the DOM fixture');
  });
  // jsdom has no layout engine. Supply rectangles for synthetic rendered elements.
  dom.window.Element.prototype.getBoundingClientRect = function () {
    const top = Number(this.dataset.top || 0);
    return { x: 0, y: top, top, bottom: top + 400, left: 0, right: 300, width: 300, height: 400 };
  };
  beforeScripts?.(dom.window);
  for (const script of ['youtube.js', 'workflow.js', 'content.js']) {
    const path = join(__dirname, '..', 'extension', 'src', script);
    if (existsSync(path)) dom.window.eval(readFileSync(path, 'utf8'));
  }
  return dom.window;
}

function player() {
  return '<ytd-reel-video-renderer><div id="menu-button"><button aria-label="More actions">More</button></div><reel-action-bar-view-model></reel-action-bar-view-model></ytd-reel-video-renderer><button aria-label="Next video">Next</button>';
}

function installMenu(window, { items = ['Not interested', "Don't recommend channel"], onFeedback } = {}) {
  const doc = window.document;
  const button = doc.querySelector('[aria-label="More actions"]');
  button.addEventListener('click', () => {
    doc.querySelector('[role="menu"]')?.remove();
    const menu = doc.createElement('div');
    menu.setAttribute('role', 'menu');
    for (const label of items) {
      const item = doc.createElement('button');
      item.setAttribute('role', 'menuitem');
      item.textContent = label;
      item.addEventListener('click', () => {
        menu.remove();
        if (onFeedback) onFeedback(label);
        else notice(window, label === 'Not interested' ? 'Video removed' : "We won't recommend videos from this channel");
      });
      menu.append(item);
    }
    doc.body.append(menu);
  });
}

function notice(window, text) {
  let el = window.document.querySelector('[role="status"]');
  if (!el) {
    el = window.document.createElement('div');
    el.setAttribute('role', 'status');
    window.document.body.append(el);
  }
  el.textContent = text;
  return el;
}

module.exports = { fixture, player, installMenu, notice };
