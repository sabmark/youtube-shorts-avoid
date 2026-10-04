(() => {
  'use strict';
  const api = globalThis.ShortsAvoid ||= {};
  const normalize = text => (text || '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  const labels = { 'not-interested': ['not interested'], channel: ["don't recommend channel", "don't recommend this channel"] };
  const noticeSelector = '[role="status"], [role="alert"], tp-yt-paper-toast, ytd-notification-action-renderer, yt-notification-action-renderer';
  function problem(code, message) {
    return Object.assign(new Error(message), { code });
  }

  function visible(window, element) {
    if (!element?.isConnected) return false;
    for (let node = element; node?.nodeType === 1; node = node.parentElement) {
      const style = window.getComputedStyle(node);
      if (node.hidden || node.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden') return false;
    }
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  }

  class YoutubeAdapter {
    constructor(window, { timeoutMs = 4000 } = {}) {
      this.window = window;
      this.document = window.document;
      this.timeoutMs = timeoutMs;
      this.openedMenu = null;
      this.reasonOwner = null;
    }

    current() {
      const match = this.window.location.pathname.match(/^\/shorts\/([\w-]+)\/?$/);
      if (!match) return null;
      const candidates = [...this.document.querySelectorAll('ytd-reel-video-renderer')]
        .filter(element => visible(this.window, element))
        .map(element => ({ element, box: element.getBoundingClientRect() }))
        .filter(({ box }) => box.bottom > 0 && box.top < this.window.innerHeight)
        .sort((a, b) => Math.abs(a.box.top + a.box.height / 2 - this.window.innerHeight / 2) - Math.abs(b.box.top + b.box.height / 2 - this.window.innerHeight / 2));
      if (!candidates.length) return null;
      return { id: match[1], element: candidates[0].element };
    }

    assertCurrent(target) {
      const current = this.current();
      if (!target || current?.id !== target.id || current?.element !== target.element) {
        throw problem('changed-short', 'The current Short changed. Remaining actions were stopped.');
      }
    }

    rail(target) {
      this.assertCurrent(target);
      return [...target.element.querySelectorAll('reel-action-bar-view-model, #actions, #actions-container')]
        .find(element => visible(this.window, element)) || null;
    }

    menus() {
      const menus = [...this.document.querySelectorAll('[role="menu"], ytd-menu-popup-renderer')]
        .filter(element => visible(this.window, element));
      return menus.filter(element => !menus.some(other => other !== element && other.contains(element)));
    }

    reason() {
      return [...this.document.querySelectorAll('[role="dialog"], tp-yt-paper-dialog, ytd-feedback-dialog-renderer, yt-sheet-view-model, yt-contextual-sheet-layout')]
        .find(element => visible(this.window, element) && /tell us why|why.*not interested|choose.*reason/.test(normalize(element.textContent)));
    }

    assertNoReason() {
      if (this.reason()) throw problem('required-reason', 'Choose a reason in YouTube to continue.');
    }

    assertNoTextInput(dialog) {
      const textInput = [...dialog.querySelectorAll('input, textarea, [contenteditable]')]
        .find(element => visible(this.window, element) && !element.disabled && !element.readOnly
          && !element.closest('[aria-disabled="true"], [disabled]')
          && (element.tagName !== 'INPUT' || !['radio', 'checkbox', 'hidden', 'submit', 'button', 'reset'].includes(element.type))
          && element.getAttribute('contenteditable') !== 'false');
      if (textInput) throw problem('required-reason', 'This reason asks for typed details. Complete the YouTube dialog manually.');
    }

    async resolveReason(target) {
      const dialog = this.reason();
      if (!dialog) return;
      this.assertCurrent(target);
      // Only answer a prompt following this activation's Not interested click.
      if (this.reasonOwner !== target) this.assertNoReason();
      this.reasonOwner = null;
      this.assertNoTextInput(dialog);
      const enabled = element => visible(this.window, element) && !element.disabled
        && !element.closest('[aria-disabled="true"], [disabled]');
      const name = element => normalize(element.getAttribute('aria-label') || element.textContent
        || [...(element.labels || [])].map(label => label.textContent).join(' '));
      let choices = [...dialog.querySelectorAll('[role="radio"], [role="checkbox"], tp-yt-paper-radio-button, tp-yt-paper-checkbox, label, input[type="radio"], input[type="checkbox"]')]
        .filter(element => enabled(element) && name(element)
          && (element.tagName !== 'LABEL' || element.control?.matches('input[type="radio"], input[type="checkbox"]')));
      // Some Shorts variants use action buttons instead of radio controls.
      if (!choices.length) choices = [...dialog.querySelectorAll('button, [role="button"]')]
        .filter(element => enabled(element) && name(element)
          && !/^(cancel|close|dismiss|submit|send|done|ok|confirm|next|back|learn more|send feedback|submit feedback)$/.test(name(element)));
      const choice = choices.find(element => /^other(?: reason)?$/.test(name(element))) || choices[0];
      if (!choice) throw problem('required-reason', 'YouTube needs a reason, but no supported choice is available. Choose it manually.');
      this.assertCurrent(target);
      if (!choice.checked && !choice.control?.checked && choice.getAttribute('aria-checked') !== 'true') choice.click();
      const submit = await this.wait(() => {
        if (!visible(this.window, dialog)) return true;
        this.assertCurrent(target);
        this.assertNoTextInput(dialog);
        return [...dialog.querySelectorAll('button, [role="button"], input[type="submit"]')]
          .find(element => enabled(element) && /^(submit|send|done|ok|confirm|send feedback|submit feedback)$/.test(name(element) || normalize(element.value)));
      }, 'The selected reason needs additional input or YouTube did not enable submission. Check the dialog.');
      if (submit === true) return;
      this.assertCurrent(target);
      this.assertNoTextInput(dialog);
      submit.click();
      await this.wait(() => {
        this.assertCurrent(target);
        return !visible(this.window, dialog);
      }, 'YouTube did not close the reason dialog. The reason may have been sent; check before trying again.');
    }

    async wait(check, message) {
      const start = Date.now();
      do {
        const result = await check();
        if (result) return result;
        await new Promise(resolve => this.window.setTimeout(resolve, 25));
      } while (Date.now() - start < this.timeoutMs);
      throw problem('timeout', message || 'YouTube did not confirm the action.');
    }

    async menu(target) {
      this.assertCurrent(target);
      await this.resolveReason(target);
      this.assertCurrent(target);
      if (this.openedMenu?.target === target && visible(this.window, this.openedMenu.element)) return this.openedMenu.element;
      if (this.menus().length) throw problem('menu-open', 'Close the open YouTube menu, then try again.');
      const button = [...target.element.querySelectorAll('#menu-button button, button[aria-label="More actions"]')]
        .find(element => visible(this.window, element) && !element.disabled && element.getAttribute('aria-label') === 'More actions');
      if (!button) throw problem('missing-menu', 'This Short does not offer the required feedback menu.');
      button.click();
      const menu = await this.wait(async () => {
        this.assertCurrent(target);
        await this.resolveReason(target);
        this.assertCurrent(target);
        const menus = this.menus();
        if (menus.length > 1) throw problem('ambiguous-menu', 'More than one YouTube menu is open. Close them and try again.');
        return menus[0];
      }, 'YouTube did not open the feedback menu.');
      this.openedMenu = { target, element: menu };
      return menu;
    }

    item(menu, kind) {
      return [...menu.querySelectorAll('[role="menuitem"], ytd-menu-service-item-renderer')]
        .find(element => visible(this.window, element) && !element.disabled && element.getAttribute('aria-disabled') !== 'true'
          && labels[kind]?.includes(normalize(element.getAttribute('aria-label') || element.textContent)));
    }

    async preflight(target) {
      const menu = await this.menu(target);
      if (!this.item(menu, 'not-interested') || !this.item(menu, 'channel')) {
        throw problem('missing-options', 'This Short does not offer both required feedback options. Sign in and check the YouTube menu.');
      }
    }

    notices() {
      return [...this.document.querySelectorAll(noticeSelector)].filter(element => visible(this.window, element));
    }

    async feedback(target, kind) {
      this.assertCurrent(target);
      const menu = await this.menu(target);
      const item = this.item(menu, kind);
      if (!item) throw problem('missing-options', 'The remaining feedback option is unavailable for this Short.');
      const before = new Map(this.notices().map(element => [element, normalize(element.textContent)]));
      await this.resolveReason(target);
      this.assertCurrent(target);
      if (kind === 'not-interested') this.reasonOwner = target;
      try {
        item.click();
        this.openedMenu = null;
        await this.wait(async () => {
          await this.resolveReason(target);
          const confirmed = this.notices().some(element => {
            const text = normalize(element.textContent);
            if (before.get(element) === text) return false;
            return kind === 'not-interested'
              ? /video removed|we'll tune your recommendations|got it|won't see this video|you'll see fewer videos like this/.test(text)
              : /won't recommend.*channel|will not recommend.*channel|channel.*won't.*recommend/.test(text);
          });
          if (confirmed) return true;
          this.assertCurrent(target);
          return false;
        }, 'YouTube did not confirm the feedback. It may have been sent; check before trying again.');
      } finally {
        if (kind === 'not-interested') this.reasonOwner = null;
      }
    }

    async like(target) {
      this.assertCurrent(target);
      this.assertNoReason();
      const controls = [...target.element.querySelectorAll('button')].filter(element => {
        const name = normalize(element.getAttribute('aria-label'));
        return visible(this.window, element) && !element.disabled && element.getAttribute('aria-disabled') !== 'true'
          && /^(like(?: this video)?(?: along with .* other people)?|unlike(?: this video)?)$/.test(name);
      });
      if (controls.length !== 1) throw problem('missing-like', 'This Short does not offer a supported Like control.');
      const button = controls[0];
      const isLiked = () => button.getAttribute('aria-pressed') === 'true'
        || /^unlike(?: this video)?$/.test(normalize(button.getAttribute('aria-label')));
      if (isLiked()) return;
      if (button.getAttribute('aria-pressed') !== 'false') {
        throw problem('unknown-like-state', 'YouTube did not expose whether this video is liked.');
      }
      this.assertCurrent(target);
      button.click();
      await this.wait(() => {
        this.assertCurrent(target);
        this.assertNoReason();
        return visible(this.window, button) && isLiked();
      }, 'YouTube did not confirm the like. Check the Like control before trying again.');
    }

    async next(target) {
      this.assertCurrent(target);
      // Feedback confirmation can precede YouTube's queued native navigation.
      // Give that navigation the same bounded observation window as feedback.
      try {
        await this.wait(async () => {
          await this.resolveReason(target);
          const current = this.current();
          if (!current) throw problem('changed-short', 'You left the Shorts player.');
          if (current.id !== target.id) return true;
          this.assertCurrent(target);
          return false;
        });
        return;
      } catch (error) {
        if (error.code !== 'timeout') throw error;
      }
      await this.resolveReason(target);
      this.assertCurrent(target);
      const button = [...this.document.querySelectorAll('button[aria-label="Next video"]')]
        .find(element => visible(this.window, element) && !element.disabled);
      if (!button) throw problem('missing-next', 'Feedback was sent, but the next-video control is unavailable.');
      button.click();
      await this.wait(() => {
        const current = this.current();
        if (!current) throw problem('changed-short', 'You left the Shorts player.');
        return current.id !== target.id;
      }, 'Feedback was sent, but YouTube did not advance. Scroll to the next Short manually.');
    }
  }

  api.YoutubeAdapter = YoutubeAdapter;
})();
