(() => {
  'use strict';
  const api = globalThis.ShortsAvoid = globalThis.ShortsAvoid || {};
  function videoUrl(raw) {
    try {
      const url = new URL(raw);
      if (url.origin !== 'https://www.youtube.com') return null;
      const id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/shorts\/([\w-]+)$/)?.[1];
      return id && /^[\w-]+$/.test(id) ? `https://www.youtube.com/watch?v=${id}` : null;
    } catch { return null; }
  }
  class FeedbackAdapter {
    constructor(win, { timeoutMs = 6000, settleMs = 350 } = {}) {
      this.win = win;
      this.doc = win.document;
      this.timeoutMs = timeoutMs;
      this.settleMs = settleMs;
      this.cards = new Map();
      this.ids = new WeakMap();
      this.identity = '';
      this.busy = false;
    }
    onFeedbackPage() {
      const url = new URL(this.win.location.href);
      return url.origin === 'https://myactivity.google.com' && /^\/(?:u\/\d+\/)?page$/.test(url.pathname) &&
        url.searchParams.get('page') === 'youtube_user_feedback';
    }
    account() { return this.doc.querySelector('[aria-label^="Google Account:"]')?.getAttribute('aria-label') || ''; }
    context() { return `${this.win.location.href}\n${this.account()}`; }
    buttons() { return [...this.doc.querySelectorAll('button,[role="button"]')]; }
    moreButton() { return this.buttons().find(el => el.textContent.trim() === 'Load more' && !el.disabled && !el.hidden); }
    async waitFor(check) {
      const start = Date.now();
      do {
        const value = check();
        if (value) return value;
        await new Promise(resolve => this.win.setTimeout(resolve, 50));
      } while (Date.now() - start < this.timeoutMs);
      return null;
    }
    async loadMore() {
      const before = await this.snapshot();
      if (before.status !== 'ready' || this.busy) return { ...before, status: 'error' };
      const button = this.moreButton();
      if (!button) return before;
      this.busy = true;
      const identity = this.context();
      const count = this.doc.querySelectorAll('[role="listitem"]').length;
      try {
        button.click();
        const changed = await this.waitFor(() => this.context() !== identity ||
          this.doc.querySelectorAll('[role="listitem"]').length > count || !button.isConnected);
        if (!changed || this.context() !== identity || !this.onFeedbackPage()) return { status: 'error', entries: [], hasMore: false };
        return await this.snapshot();
      } finally { this.busy = false; }
    }
    async remove(id) {
      const target = this.cards.get(id);
      if (target?.observer.takeRecords().length) target.stale = true;
      if (!target || target.stale || !this.onFeedbackPage() || target.identity !== this.context() ||
          !target.card.isConnected || !target.button.isConnected ||
          target.button.getAttribute('aria-label') !== `Delete activity item ${target.title}` ||
          ![...target.card.querySelectorAll('a[href]')].some(a => videoUrl(a.href) === target.url)) return { status: 'stale' };
      if (this.busy) return { status: 'error', message: 'Another operation is pending.' };
      if (this.doc.querySelector('[role="dialog"],dialog[open]')) return { status: 'confirmation' };
      this.busy = true;
      target.stale = true;
      target.observer.disconnect();
      let absentSince = null;
      const matchingCards = () => [...this.doc.querySelectorAll('[role="listitem"][aria-label="Card showing an activity from YouTube"]')].filter(card =>
        card.querySelector('button[aria-label], [role="button"][aria-label]')?.getAttribute('aria-label') === `Delete activity item ${target.title}` &&
        [...card.querySelectorAll('a[href]')].some(a => videoUrl(a.href) === target.url));
      const originalCount = matchingCards().length;
      try {
        target.button.click();
        const result = await this.waitFor(() => {
          if (!this.onFeedbackPage() || target.identity !== this.context()) return 'stale';
          if (this.doc.querySelector('[role="dialog"],dialog[open]')) return 'confirmation';
          if ([...this.doc.querySelectorAll('[role="alert"]')].some(el => /error|failed|try again/i.test(el.textContent))) return 'error';
          if (!target.card.isConnected) {
            if (matchingCards().length >= originalCount) return 'error';
            const loaded = this.doc.querySelector('[role="listitem"][aria-label="Card showing an activity from YouTube"]') ||
              /No activity|No results|You have no activity/i.test(this.doc.body.textContent);
            if (!loaded) { absentSince = null; return null; }
            if (absentSince === null) absentSince = Date.now();
            if (Date.now() - absentSince >= this.settleMs) return 'removed';
          }
          return null;
        });
        return { status: result || 'error' };
      } finally { this.busy = false; }
    }
    async snapshot() {
      const empty = { entries: [], hasMore: false };
      if (!this.account() && this.doc.querySelector('a[href*="accounts.google.com/ServiceLogin"]')) return { status: 'sign-in', ...empty };
      if (!this.onFeedbackPage()) return { status: 'unsupported', ...empty };
      if (!this.account()) return { status: 'verification', ...empty };
      if (this.context() !== this.identity) {
        for (const record of this.cards.values()) record.observer.disconnect();
        this.cards.clear(); this.ids = new WeakMap(); this.identity = this.context();
      }
      const all = [...this.doc.querySelectorAll('[role="listitem"][aria-label="Card showing an activity from YouTube"]')];
      const entries = [];
      for (const [id, record] of this.cards) {
        if (!record.card.isConnected) { record.observer.disconnect(); this.cards.delete(id); }
      }
      for (const card of all) {
        const button = card.querySelector('button[aria-label^="Delete activity item "],[role="button"][aria-label^="Delete activity item "]');
        const link = [...card.querySelectorAll('a[href]')].find(a => videoUrl(a.href));
        if (!button || !link) continue;
        const url = videoUrl(link.href);
        const title = button.getAttribute('aria-label').slice('Delete activity item '.length).trim();
        if (!title) continue;
        const channel = [...card.querySelectorAll('a[href]')].find(a => /^https:\/\/www\.youtube\.com\/channel\//.test(a.href))?.textContent.trim() || '';
        let id = this.ids.get(card);
        const previous = this.cards.get(id);
        if (previous && previous.observer.takeRecords().length) previous.stale = true;
        if (!previous || previous.stale) {
          previous?.observer.disconnect();
          if (id) this.cards.delete(id);
          id = this.win.crypto.randomUUID(); this.ids.set(card, id);
          const record = { card, button, url, title, identity: this.identity, stale: false };
          record.observer = new this.win.MutationObserver(() => { record.stale = true; });
          record.observer.observe(card, { subtree: true, childList: true, attributes: true, characterData: true });
          this.cards.set(id, record);
        }
        entries.push({ id, title, channel, url });
      }
      const text = this.doc.body.textContent;
      const ready = all.length > 0 || /No activity|No results|You have no activity/i.test(text);
      return { status: ready ? 'ready' : 'loading', entries, hasMore: !!this.moreButton() };
    }
  }
  api.FeedbackAdapter = FeedbackAdapter;
  api.feedbackVideoUrl = videoUrl;
  if (globalThis.chrome?.runtime?.onMessage) {
    const adapter = new FeedbackAdapter(window);
    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if (sender.id !== chrome.runtime.id || message?.type !== 'shorts-avoid-feedback' ||
          !['snapshot', 'loadMore', 'remove'].includes(message.action)) return false;
      const work = message.action === 'remove' ? adapter.remove(message.id) : adapter[message.action]();
      work.then(respond).catch(() => respond({ status: 'error', entries: [], hasMore: false }));
      return true;
    });
  }
})();
