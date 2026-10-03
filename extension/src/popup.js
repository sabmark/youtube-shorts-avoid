(() => {
  'use strict';
  const viewer = new URL(location.href).searchParams.get('view') === 'window';
  document.documentElement.dataset.view = viewer ? 'window' : 'launcher';
  if (!viewer) {
    async function openViewer() {
      const url = chrome.runtime.getURL('popup.html?view=window');
      const contexts = await chrome.runtime.getContexts({ contextTypes: ['TAB'], documentUrls: [url] });
      const existing = contexts.find(context => context.windowId >= 0);
      if (existing) {
        try {
          await chrome.windows.update(existing.windowId, { focused: true });
          window.close();
          return;
        } catch (error) {
          // A viewer closed after enumeration may be replaced; other failures stay visible.
          if (!/No window with id/i.test(error.message)) throw error;
        }
      }
      const availableWidth = screen.availWidth || 1920;
      const availableHeight = screen.availHeight || 1000;
      const width = Math.min(800, Math.max(480, Math.round(availableWidth / 3)));
      const height = Math.round(availableHeight * .9);
      await chrome.windows.create({
        url, type: 'popup', width, height,
        left: (screen.availLeft || 0) + Math.round((availableWidth - width) / 2),
        top: (screen.availTop || 0) + Math.round((availableHeight - height) / 2)
      });
      window.close();
    }
    void openViewer().catch(() => {
      document.getElementById('status').textContent = 'Could not open feedback window. Close this popup and click the extension icon to try again.';
    });
    return;
  }
  document.getElementById('status').textContent = 'Loading feedback...';
  const theme = window.matchMedia?.('(prefers-color-scheme: dark)');
  const applyTheme = () => document.documentElement.setAttribute('data-bs-theme', theme?.matches ? 'dark' : 'light');
  applyTheme();
  theme?.addEventListener('change', applyTheme);
  const historyUrl = 'https://myactivity.google.com/page?utm_source=my-activity&hl=en&page=youtube_user_feedback';
  const el = id => document.getElementById(id);
  let tabId = null;
  let entries = [];
  let page = 0;
  let hasMore = false;
  let busy = false;
  let chosen = null;
  function validVideoUrl(raw) {
    try {
      const url = new URL(raw);
      return url.origin === 'https://www.youtube.com' && url.pathname === '/watch' &&
        /^[\w-]+$/.test(url.searchParams.get('v') || '') ? url.href : null;
    } catch { return null; }
  }
  function feedbackTab(raw) {
    try {
      const url = new URL(raw);
      return url.origin === 'https://myactivity.google.com' && /^\/(?:u\/\d+\/)?page$/.test(url.pathname) &&
        url.searchParams.get('page') === 'youtube_user_feedback';
    } catch { return false; }
  }
  async function ensureTab() {
    if (tabId !== null) return tabId;
    const tabs = await chrome.tabs.query({ url: 'https://myactivity.google.com/*' });
    const matches = tabs.filter(tab => feedbackTab(tab.url));
    const tab = matches.find(tab => tab.active) || matches[0] || await chrome.tabs.create({ url: historyUrl, active: false });
    tabId = tab.id;
    return tabId;
  }
  async function send(action, id) {
    return chrome.tabs.sendMessage(await ensureTab(), { type: 'shorts-avoid-feedback', action, ...(id ? { id } : {}) });
  }
  async function snapshot() {
    let reloaded = false;
    let failure;
    for (let attempt = 0; attempt < 25; attempt++) {
      try {
        const result = await send('snapshot');
        if (result?.status !== 'loading') return result;
      } catch (error) {
        failure = error;
        if (/No tab with id/i.test(error.message)) { tabId = null; throw error; }
        if (!reloaded && /Receiving end does not exist|Could not establish connection/i.test(error.message)) {
          reloaded = true;
          await chrome.tabs.reload(await ensureTab());
        }
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    throw failure || new Error('Feedback loading timed out.');
  }
  function render() {
    page = Math.max(0, Math.min(page, Math.ceil(entries.length / 10) - 1));
    el('entries').replaceChildren();
    for (const entry of entries.slice(page * 10, page * 10 + 10)) {
      const row = document.createElement('li');
      row.className = 'list-group-item feedback-row';
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail';
      thumbnail.setAttribute('aria-hidden', 'true');
      const image = document.createElement('img');
      image.alt = '';
      image.width = 112;
      image.height = 63;
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', () => { image.hidden = true; }, { once: true });
      const videoId = new URL(validVideoUrl(entry.url)).searchParams.get('v');
      image.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      thumbnail.append(image);
      const details = document.createElement('div');
      const link = document.createElement('a');
      link.textContent = entry.title;
      link.href = entry.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const channel = document.createElement('span');
      channel.className = 'channel text-body-secondary';
      channel.textContent = entry.channel;
      details.append(link, channel);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn btn-outline-danger';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove feedback for ${entry.title}`);
      remove.disabled = busy;
      remove.addEventListener('click', () => {
        chosen = entry;
        el('confirm-text').textContent = `Remove Not Interested feedback for "${entry.title}"? Channel feedback will stay.`;
        el('confirmation').hidden = false;
        el('confirm-remove').focus();
      });
      row.append(thumbnail, details, remove);
      el('entries').append(row);
    }
    el('page').textContent = entries.length ? `Page ${page + 1} of ${Math.ceil(entries.length / 10)} - ${entries.length} loaded` : '0 loaded';
    el('previous').disabled = busy || page === 0;
    el('next').disabled = busy || (page + 1) * 10 >= entries.length;
    el('older').disabled = busy || !hasMore;
    for (const id of ['refresh', 'settings', 'confirm-remove', 'cancel']) el(id).disabled = busy;
  }
  function apply(result) {
    entries = result?.status === 'ready' && Array.isArray(result.entries) ? result.entries.filter(entry =>
      entry && typeof entry.id === 'string' && typeof entry.title === 'string' &&
      typeof entry.channel === 'string' && validVideoUrl(entry.url)) : [];
    hasMore = result?.status === 'ready' && result.hasMore === true;
    const messages = {
      'sign-in': 'Sign in to Google using Open Google history, then return here and Refresh.',
      verification: 'Open Google history to verify your account, then Refresh.',
      unsupported: 'This Google page is not supported. Open Google history and Refresh.',
      error: 'Could not load feedback. Open Google history to check it, then Refresh.',
      loading: 'Feedback is still loading. Try Refresh.'
    };
    el('status').textContent = result?.status === 'ready' ? (entries.length ? 'Loaded video feedback. Channel feedback is excluded.' : 'No video feedback is currently loaded.') :
      (messages[result?.status] || messages.error);
  }
  async function operate(work) {
    if (busy) return;
    busy = true;
    render();
    try { await work(); }
    catch {
      el('status').textContent = 'Could not complete the request. Open Google history to check the result, then Refresh.';
      tabId = null;
    } finally { busy = false; render(); }
  }
  async function openGoogle() {
    const tab = await chrome.tabs.update(await ensureTab(), { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  }
  el('previous').addEventListener('click', () => { page--; render(); });
  el('next').addEventListener('click', () => { page++; render(); });
  el('refresh').addEventListener('click', () => void operate(async () => {
    chosen = null; el('confirmation').hidden = true;
    el('status').textContent = 'Loading feedback...'; apply(await snapshot());
  }));
  el('older').addEventListener('click', () => void operate(async () => {
    el('status').textContent = 'Loading older feedback...'; apply(await send('loadMore'));
  }));
  el('google').addEventListener('click', () => { void openGoogle().catch(() => {
    tabId = null; el('status').textContent = 'Could not open Google history. Try again.';
  }); });
  el('settings').addEventListener('click', () => { void chrome.runtime.openOptionsPage().catch(() => {
    el('status').textContent = 'Could not open settings. Use the browser extensions page.';
  }); });
  el('cancel').addEventListener('click', () => { chosen = null; el('confirmation').hidden = true; });
  el('confirm-remove').addEventListener('click', () => {
    const entry = chosen;
    if (!entry) return;
    chosen = null;
    el('confirmation').hidden = true;
    void operate(async () => {
      el('status').textContent = 'Removing feedback...';
      const result = await send('remove', entry.id);
      if (result?.status === 'removed') {
        apply(await snapshot());
        el('status').textContent = 'Video feedback removed. Channel feedback was kept.';
      } else if (result?.status === 'confirmation') {
        el('status').textContent = 'Complete the confirmation in Google history, then Refresh.';
        await openGoogle();
      } else if (result?.status === 'stale') {
        el('status').textContent = 'This entry changed. Refresh the list before removing feedback.';
      } else {
        el('status').textContent = 'Could not confirm removal. Check Google history before trying again.';
      }
    });
  });
  void operate(async () => apply(await snapshot()));
})();
