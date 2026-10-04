# Chrome Web Store submission

## Package

- Source: public v0.1.22 at a97a677a, immediate Like fix e522f64, and approved store branding in this publishing branch.
- Manifest version: 0.1.24; Manifest V3.
- Build: `npm ci --ignore-scripts`, `npm test`, `npm run package`.
- Upload: `dist/youtube-shorts-avoid-0.1.24.zip`.
- The ZIP contains runtime files and the MIT license. It excludes development files and account information.

## Listing fields

Name: Shorts Avoid for YouTube (the approved manifest name).

Language: English.

Category: Entertainment, selected from the dashboard's available categories.

### Detailed description

Choose how to respond to desktop YouTube Shorts with Avoid and Like controls and customizable shortcuts.

Avoid requests Not interested, then Don't recommend channel, and moves to the next Short after both actions are confirmed. Like requests YouTube's Like control and then Next immediately, without waiting for confirmation or automatic navigation.

Use Left Arrow for Avoid and Right Arrow for Like by default. Shortcut settings lets you choose a different key, mouse button or modifier combination for either action. Each activation processes one Short.

The extension menu links to your Not Interested and liked-video history on Google's own pages. It does not read or manage your history.

Use a signed-in YouTube account with an English interface on desktop Shorts. YouTube's available controls and confirmations determine whether an action can finish. Recommendation feedback does not guarantee that similar videos will never appear.

The extension runs locally. It has no backend, analytics or telemetry. Shortcut preferences stay in local extension storage.

This is an independent project and is not affiliated with YouTube or Google. YouTube is a trademark of Google LLC.

### Links

- Homepage: https://github.com/sabmark/youtube-shorts-avoid
- Support: https://github.com/sabmark/youtube-shorts-avoid/issues
- Privacy: https://github.com/sabmark/youtube-shorts-avoid/blob/main/PRIVACY.md

## Privacy fields

### Single purpose

Let viewers send recommendation feedback or Like the current desktop YouTube Short using on-page controls and configurable keyboard or mouse shortcuts.

### Storage permission justification

Save the viewer's chosen Avoid and Like shortcuts locally so their key or mouse button and modifier settings persist across browser restarts. The extension does not save account information, video history or page content.

### YouTube site access justification

The content script runs on https://www.youtube.com/* so it can detect navigation into and out of desktop Shorts without a page reload. It mounts controls only on Shorts and reads the current Short's visible controls and feedback notices to operate YouTube's existing interface and confirm the result. It does not send page contents to the developer or another service.

### Remote code

No remote code. JavaScript, styles and icons are bundled in the extension. There is no remote script loader.

### Data use

The developer receives no user data. There is no backend, telemetry, analytics, account-data storage or export. The extension processes the current page's visible controls in memory and stores only shortcut preferences locally. YouTube receives the viewer's feedback and Like actions through its own interface.

Review the dashboard's current data-category wording against this behavior and the linked privacy policy before certifying the declarations. No account declarations or certifications have been submitted by preparing this document.

## Reviewer instructions

1. Install the package in desktop Chrome and use an English YouTube interface.
2. Open extension Shortcut settings. Confirm the default Avoid and Like fields show Left and Right, respectively. Save a different shortcut, reload the page, verify persistence, then reset it.
3. Open a desktop YouTube Short using a signed-in YouTube account. The extension requires no separate account or credentials.
4. On a Short you want to like, click the heart control or press Right Arrow. Confirm one immediate advance and check that YouTube records the intended Like. An already-liked Short should remain liked.
5. On a Short and channel you want to dismiss, use Avoid or Left Arrow. Confirm Not interested and Don't recommend channel feedback, followed by one advance. If YouTube asks for a reason during the supported step, the extension selects Other when available, otherwise the first supported option.
6. Outside Shorts, confirm the extension adds no controls and does not intercept its shortcuts. Editable fields remain available for typing.
7. Open the toolbar menu. Shortcut settings opens the settings page; history links open Google pages in new tabs. History sign-in and management happen on Google's pages.

Testing Avoid and Like changes feedback on the reviewer's YouTube account. Use videos on which those actions are intended.

## Assets

- Store icon: `extension/icons/icon128.png`, 128x128 PNG, approved original minus-and-heart logo with 16px transparent padding.
- Small promotional tile: `store/promo.png`, 440x280 PNG; editable vector source is `store/promo.svg`.
- Screenshots: `store/screenshots/settings-light.png` and `settings-dark.png`, each 1280x800.
- Screenshots show the real installed v0.1.24 settings page in Chromium, rendered at 75% scale to fit both action cards and instructions. They contain no account information.
- A live Shorts screenshot can be added after account access; it has not been captured yet.

## Verification and remaining steps

- Full v0.1.24 suite: 89 passed, zero failed; package created successfully.
- Installed Chromium settings: Shift+j was captured, saved to extension storage and retained after reload; Reset restored Left.
- Light and dark settings screenshots captured. At a 360px viewport, document width remained within the viewport.
- The owner signed in and completed the account steps. The developer dashboard is accessible.
- Chrome draft created: `capdpopadgbflaoklceadlimohpcmopm`. Its initial v0.1.22 ZIP was replaced with v0.1.24; the item remains Draft.
- Native toolbar-popup verification remains pending in this publishing session. Settings screenshots are not native popup verification.
- Signed-in YouTube action checks are pending in this publishing session. Installed-extension fixture timing checks for the included Like fix passed: Next was requested 0.7ms after Right Arrow Like and 0.2ms after heart Like. These are not live server acceptance checks.
- Confirm developer registration, contact verification, 2-Step Verification and required account declarations in the dashboard. Complete any payment or identity steps as the owner.
- Prepare the dashboard draft and review package, listing, assets, privacy and distribution fields.
- Obtain the project's required deployment approval before submitting for review.
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
