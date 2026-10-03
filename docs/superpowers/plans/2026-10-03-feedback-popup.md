# Feedback Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Show existing Not Interested video feedback in the extension popup and remove one selected entry through Google's controls.

**Architecture:** A My Activity content script provides snapshots and scoped native actions. The popup reuses or opens a feedback tab, keeps the returned list in memory and displays 10 entries per page. It uses extension messaging and no private Google API.

**Tech Stack:** Manifest V3, plain JavaScript/HTML/CSS, Node test runner, jsdom, Python packaging and Chromium.

**Spec:** `docs/superpowers/specs/2026-10-03-feedback-popup-design.md`

## Global Constraints

- English desktop My Activity in Chrome and Opera.
- 10 video entries per popup page; exclude channel-only entries.
- No persistent history or authentication storage; no backend.
- No bulk deletion, date-group deletion or private Google requests.
- Run full `npm test` and `npm run package`; preserve shortcut behavior.
- Use `rf workspace commit` with explicit owned paths and the ticket commit subject.

## Review Focus

- Stale DOM identity or account changes must not delete another entry (Task 1).
- Unrelated activity routes must not expose history or accept removal (Task 1).
- Native confirmation and timeout must not be shown as successful removal (Task 1).
- Tab closure or missing content-script receivers must offer recovery (Task 2).
- Remote titles and links must not inject markup or arbitrary navigation (Task 2).

## Files and message contract

Create `extension/src/feedback.js` for `ShortsAvoid.FeedbackAdapter(window)` and internal-message registration. Public methods return promises: `snapshot()`, `loadMore()`, `remove(id)`. Snapshot shape: `{status, entries: [{id,title,channel,url}], hasMore}`. Status values: `ready`, `sign-in`, `verification`, `unsupported`, `loading`, `error`. Removal shape: `{status, message?}`, with `removed`, `confirmation`, `stale`, `error`.

The content script accepts `{type:'shorts-avoid-feedback', action:'snapshot'|'loadMore'|'remove', id?}` only from this extension. Removal identifiers are opaque and tied to the original card, URL and account identity. A page/account change invalidates them. Native deletion confirmation is never clicked automatically.

Create `extension/popup.html`, `extension/popup.css`, `extension/src/popup.js`. The popup owns tab discovery and messaging, rendering and pagination; it never persists entries. Add `tests/feedback.test.cjs` and `tests/popup.test.cjs` plus invented DOM fixtures as needed. Update manifest, packaging allowlist and package test.

### Task 1: Google feedback adapter

**Files:** Create `extension/src/feedback.js`, `tests/feedback.test.cjs` and `tests/feedback-fixture.cjs`.
**Consumes:** Observed accessible list/card and Load more controls in the spec.
**Produces:** The adapter and internal-message contract above.

- [ ] Write snapshot regression with invented video/channel cards: expect one video result with literal title/channel/URL, an opaque id and hasMore=true. Wrong route and sign-in fixtures must return no entries.
- [ ] Run `node --test tests/feedback.test.cjs`; expect failure because the snapshot behavior is absent.
- [ ] Implement strict feedback-route gate, validated video links, accessible delete-button selection and opaque in-memory card identities.
- [ ] Test native Load more adds another invented video and updates the snapshot; wait only within a bounded timeout.
- [ ] Write and run failing removal regressions: only the selected card's button is clicked; success requires its removal; disconnected card/account change is stale; native confirmation and unchanged-card timeout return no success.
- [ ] Implement scoped removal, page/account checks, timeout and error/confirmation classification. Reject messages from other senders or actions.
- [ ] Run `node --test tests/feedback.test.cjs`; expect all tests passing.
- [ ] Commit owned adapter/test paths through `rf workspace commit`.

### Task 2: Popup and runtime packaging

**Files:** Create popup HTML/CSS/JS and `tests/popup.test.cjs`; modify `extension/manifest.json`, `scripts/package.py`, `tests/package.test.cjs`.
**Consumes:** Task 1's message contract.
**Produces:** Installed action popup with 10-item navigation and individual removal.

- [ ] Write failing tests around the real popup script using synthetic extension API boundaries: render 11 entries as 10 plus 1 on Next; Previous restores page 1; channel text and title render as text.
- [ ] Run `node --test tests/popup.test.cjs`; expect the missing popup behavior to fail.
- [ ] Implement tab reuse/create and bounded receiver retries, Refresh/Open Google history/Shortcut settings actions and readable loading/sign-in/verification/empty/error states.
- [ ] Implement pagination and Load older feedback through the adapter. Clamp page after removal and prevent duplicate pending operations.
- [ ] Write failing tests for removal confirmation/cancel, successful removal refresh, stale/error results, native confirmation activating the Google tab, tab closure, receiver failure, unsafe URLs and markup-like titles.
- [ ] Implement only the missing behaviors. Include an explicit bulk-removal limitation message.
- [ ] Declare popup and My Activity content script/host permission. Extend the package allowlist and ZIP assertions to include every runtime file while excluding development/secret-like files.
- [ ] Run `node --test tests/popup.test.cjs tests/feedback.test.cjs tests/package.test.cjs`; expect all tests passing. Run `npm test` and `npm run package`; expect a valid ZIP and zero failures.
- [ ] Commit owned runtime/package/test paths through `rf workspace commit`.

### Task 3: Installed verification and handoff

**Files:** Modify `README.md`, `PRIVACY.md`, `CHANGELOG.md`, `docs/testing.md`, package version files and manifest version.
**Consumes:** Installed popup and adapter from Task 2.
**Produces:** Version 0.1.6 with documented behavior and evidence.

- [ ] Bump extension/package versions to 0.1.6; document My Activity host access, in-memory history, native-tab use and no video-only bulk reset.
- [ ] Run full `npm test`, `npm run package` and `git diff --check`; expect zero failures and valid packaging.
- [ ] Verify installed popup with signed-in Google feedback: actual video entries, navigation and older-entry loading, without deleting feedback. Check light/dark rendered layout and keyboard focus.
- [ ] Record removal as fixture-tested unless the owner explicitly identifies an entry for a live removal check. Do not submit account deletion merely to finish verification.
- [ ] Get independent whole-ticket review; verify and fix material findings test-first.
- [ ] Commit owned docs/version paths through `rf workspace commit`, record knowledge outcomes and test evidence via rf, push with `rf push`, and follow `rf next` to the next gate. Hand off for owner testing if account-specific deletion remains unverified.
