# Chrome Web Store submission

## Package

- Source: public v0.1.22 at a97a677a, immediate Like fix e522f64, and approved store branding in this publishing branch.
- Manifest version: 0.1.25; Manifest V3.
- Build: `npm ci --ignore-scripts`, `npm test`, `npm run package`.
- Upload: `dist/youtube-shorts-avoid-0.1.25.zip`.
- The ZIP contains runtime files and the MIT license. It excludes development files and account information.

## Listing fields

Name: Shorts Avoid for YouTube (the approved manifest name).

Language: English.

Category: Entertainment, selected from the dashboard's available categories.

### Detailed description

Choose how to respond to desktop YouTube Shorts with Avoid and Like controls and customizable shortcuts.

Avoid sends Not interested, Don't recommend channel, or both, and moves to the next Short after the selected actions are confirmed. Both is the default; choose your feedback in Options. Like requests YouTube's Like control and then Next immediately, without waiting for confirmation or automatic navigation.

Use Left Arrow for Avoid and Right Arrow for Like by default. Shortcut settings lets you choose a different key, mouse button or modifier combination for either action. Each activation processes one Short.

The extension menu links to your Not Interested and liked-video history on Google's own pages. It does not read or manage your history.

Use a signed-in YouTube account with an English interface on desktop Shorts. YouTube's available controls and confirmations determine whether an action can finish. Recommendation feedback does not guarantee that similar videos will never appear.

The extension runs locally. It has no backend, analytics or telemetry. Shortcut and feedback preferences stay in local extension storage.

This is an independent project and is not affiliated with YouTube or Google. YouTube is a trademark of Google LLC.

### Links

- Homepage: https://github.com/sabmark/youtube-shorts-avoid
- Support: https://github.com/sabmark/youtube-shorts-avoid/issues
- Privacy: https://github.com/sabmark/youtube-shorts-avoid/blob/885e254bc82edfb7f161b553acf2204fb7930eb8/PRIVACY.md

## Privacy fields

### Single purpose

Let viewers send recommendation feedback or Like the current desktop YouTube Short using on-page controls and configurable keyboard or mouse shortcuts.

### Storage permission justification

Save the viewer's chosen Avoid and Like shortcuts locally and selected Avoid feedback locally so these settings persist across browser restarts. The extension does not save account information, video history or page content.

### YouTube site access justification

The content script runs on https://www.youtube.com/* so it can detect navigation into and out of desktop Shorts without a page reload. It mounts controls only on Shorts and reads the current Short's visible controls and feedback notices to operate YouTube's existing interface and confirm the result. It does not send page contents to the developer or another service.

### Remote code

No remote code. JavaScript, styles and icons are bundled in the extension. There is no remote script loader.

### Data use

The developer receives no user data. There is no backend, telemetry, analytics, account-data storage or export. The extension processes the current page's visible controls in memory and stores only shortcut and feedback preferences locally. YouTube receives the viewer's feedback and Like actions through its own interface.

Review the dashboard's current data-category wording against this behavior and the linked privacy policy before certifying the declarations. No account declarations or certifications have been submitted by preparing this document.

## Reviewer instructions

1. Install the package in desktop Chrome and use an English YouTube interface.
2. Open extension Options. Verify Feedback sent by Avoid defaults to Both; save each single-action choice and check persistence. Confirm the default Avoid and Like fields show Left and Right, respectively. Save a different shortcut, reload the page, verify persistence, then reset it.
3. Open a desktop YouTube Short using a signed-in YouTube account. The extension requires no separate account or credentials.
4. On a Short you want to like, click the heart control or press Right Arrow. Confirm one immediate advance and check that YouTube records the intended Like. An already-liked Short should remain liked.
5. On Shorts for which you intend feedback, test each Avoid mode with Left Arrow or the Avoid button. Confirm only the selected feedback, followed by one advance. Both sends Not interested, then Don't recommend channel. If YouTube asks for a reason during the supported step, the extension selects Other when available, otherwise the first supported option.
6. Outside Shorts, confirm the extension adds no controls and does not intercept its shortcuts. Editable fields remain available for typing.
7. Open the toolbar menu. Shortcut settings opens the settings page; history links open Google pages in new tabs. History sign-in and management happen on Google's pages.

Testing Avoid and Like changes feedback on the reviewer's YouTube account. Use videos on which those actions are intended.

## Assets

- Store icon: `extension/icons/icon128.png`, 128x128 PNG, approved original minus-and-heart logo with 16px transparent padding.
- Small promotional tile: `store/promo.png`, 440x280 PNG; editable vector source is `store/promo.svg`.
- Screenshots: `store/screenshots/settings-light.png` and `settings-dark.png`, each 1280x800.
- Screenshots show the real installed v0.1.25 settings page in Chromium, rendered at 65% scale to fit both action cards and instructions. They contain no account information.
- A live Shorts screenshot can be added after account access; it has not been captured yet.

## Verification and remaining steps

- Full v0.1.24 suite: 89 passed, zero failed; package created successfully.
- Installed Chromium settings: Shift+j was captured, saved to extension storage and retained after reload; Reset restored Left.
- Light and dark settings screenshots captured. At a 360px viewport, document width remained within the viewport.
- The owner signed in and completed the trader declaration. The developer dashboard is accessible. Chrome's final submission check still reports that the publisher contact email is unverified; the owner must finish the verification link before submission.
- Chrome draft created: `capdpopadgbflaoklceadlimohpcmopm`. Its initial v0.1.22 ZIP was replaced with v0.1.24; the item remains Draft.
- Native toolbar-popup verification remains pending in this publishing session. Settings screenshots are not native popup verification.
- The owner tested the combined v0.1.24 ZIP in Chrome and reported: "Passed: navigation starts immediately and the Like is recorded." This is live owner acceptance of Like-and-next. Installed-extension fixture checks also requested Next 0.7ms after Right Arrow Like and 0.2ms after heart Like. Avoid has prior owner acceptance; it was not retested live in this publishing session.
- Package SHA-256: `5613f6a0620f5f999aee0ee0681b0a671616ed01d1adabed93a11b4a3085c775`.
- Confirm developer registration, contact verification, 2-Step Verification and required account declarations in the dashboard. Complete any payment or identity steps as the owner.
- Prepare the dashboard draft and review package, listing, assets, privacy and distribution fields.
- Obtain the project's required deployment approval before submitting for review.
- Draft distribution is free of charge, public, in all 155 available regions. Listing, two settings screenshots, promotional tile, privacy disclosures and reviewer instructions are saved.
- Record the item ID and submission result. After approval/publication, add the public install URL to README. Do not replace unpacked-install instructions with an unapproved store URL.
- Opera Add-ons remains in the original ticket scope; this preparation covers Chrome first.

## Publishing references

Checked against official Chrome documentation on 2026-10-04:

- https://developer.chrome.com/docs/webstore/publish
- https://developer.chrome.com/docs/webstore/images
- https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/register
- https://developer.chrome.com/docs/webstore/set-up-account

## v0.1.25 update before submission

The new package adds selectable Avoid feedback. The dashboard still contains v0.1.24; replace its ZIP, description, settings screenshots, storage justification and privacy link after reviewing v0.1.25. No submission has been made. The prior owner acceptance applies to v0.1.24 Like-and-next, not the new feedback modes.

- v0.1.25 validation: full suite 103 passed, zero failed. Installed Chromium controlled-page checks passed all three modes, Options persistence, open-tab updates and one advance per activation. Right Arrow requested Next 0.2ms after Like. Live owner acceptance of the new modes remains pending.
- v0.1.25 ZIP SHA-256: `5fdf440bdc4e96f5a37693c90280b90450916408776c73d15ee80d092122a347`.
