const { JSDOM } = require('jsdom');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const feedbackUrl = 'https://myactivity.google.com/page?hl=en&page=youtube_user_feedback';
function card(title = 'Example video', id = 'example-123', channel = 'Example channel') {
  return `<div role="listitem" aria-label="Card showing an activity from YouTube"><span>YouTube</span>
    <button aria-label="Delete activity item ${title}">Delete</button>
    <a href="https://www.youtube.com/watch?v=${id}">${title}</a>
    <a href="https://www.youtube.com/channel/example">${channel}</a></div>`;
}
function page(t, html = card(), url = feedbackUrl, { beforeScripts } = {}) {
  const dom = new JSDOM(`<button aria-label="Google Account: Example">Account</button><main>${html}</main>`, {
    url, runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  beforeScripts?.(dom.window);
  const path = join(__dirname, '../extension/src/feedback.js');
  if (existsSync(path)) dom.window.eval(readFileSync(path, 'utf8'));
  return dom.window;
}
const adapter = w => w.ShortsAvoid?.FeedbackAdapter ? new w.ShortsAvoid.FeedbackAdapter(w, { timeoutMs: 120, settleMs: 20 }) : {
  async snapshot() { return { status: 'unsupported', entries: [], hasMore: false }; },
  async loadMore() { return this.snapshot(); }, async remove() { return { status: 'error' }; }
};
module.exports = { page, card, adapter, feedbackUrl };
