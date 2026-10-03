# Verification record

## Automated tests

The version 0.1.2 suite contained 48 tests, including a check that the installable package retains the repository MIT license notice. The behavior tests execute the real content scripts against synthetic DOM fixtures, including feedback confirmations, stale notices, unavailable options, supported and unsupported reason prompts, optional reason links, duplicate clicks, changed routes and renderers, automatic advancement and next-video timeouts.

The control also has a regression test for a page that rejects plain HTML assignments under Trusted Types. Test fixtures capture unexpected runtime errors and disconnect their observers before closing jsdom windows.

The packaging test creates an isolated fixture containing secret-like and development files. The resulting archive contains exactly the nine runtime files, including the four declared logo sizes, plus the MIT license notice. All manifest references resolve, PNG dimensions match their declared sizes, and the ZIP integrity check passes. `npm run package` produces the local distributable without including dependencies or account data.

The initial version 0.1.0 independent review found two asynchronous boundary defects. A required reason appearing while the second menu opened could allow a channel click, and queued native advancement could follow an immediate Next click. Each regression failed before its fix. Reason handling covers menu polling and the click boundary. Before clicking Next, the adapter observes native advancement for its four-second timeout window. Tests cover delayed native advancement; navigation arriving after that window remains a live timing limitation.

## Version 0.1.1 reason policy and browser checks

The viewer's signed-in local check reached a Tell us why dialog. They then changed the policy to automatic selection, preferably Other, otherwise another available reason. New regressions failed against the earlier stop policy and pass with scoped selection and submission. Coverage includes radio controls, hidden native inputs with visible labels, button choices, first-choice fallback, unrelated existing or later prompts, changed Shorts and dialogs that never close. Selection and submission occur once per dialog attempt; confirmation remains required before continuing.

Independent review of the update identified two boundaries to tighten. Reason authorization is now consumed by the first handled dialog and expires when the Not interested feedback attempt finishes. A later prompt stays untouched and prevents channel submission. Editable text controls are checked before selection and before submission, including a field revealed by selecting Other. Each regression failed before the guard was added and passes in the final 45-test suite.

At the version 0.1.1 checkpoint, the connected browser was signed out. A fresh source preview using the updated scripts mounted one accessible button and stopped at the missing-feedback-options message before submitting feedback. The logo was inspected at 128 pixels and package tests verify all four PNG sizes. Signed-out source-preview behavior is verified. Signed-in behavior is covered by fixtures and the viewer's reported observation, but the updated live signed-in sequence remains unverified because Google rejected sign-in in this connected browser. These are distinct results, not a claim that both live account states passed.

## Authorized rendered source preview

The viewer approved UI/UX verification separately for the foundation, button and packaging tickets. The connected browser preview ran the extension's source scripts and CSS on signed-out desktop YouTube Shorts. This was source injection for layout inspection, not an installed-extension test or proof of isolated-world runtime behavior.

Verified observations:

- One 48 by 48 pixel Avoid control appears beside the existing action rail.
- Keyboard traversal reaches the button and displays a solid 3-pixel focus outline. Enter activates the workflow.
- The signed-out menu stops before feedback submission and shows the missing-options message.
- At 1441 by 861 in the light theme and 1024 by 768 in the dark theme, the button fits the viewport and the notification clears the Shorts player and captions.
- The dark status uses white text on a dark background. The light status uses dark text on a light background.
- The separate notification host avoids the player-transform positioning bug and does not interfere with opening the native menu.

No recommendation feedback was submitted during these checks. Screenshots were inspected in the tool session and were not copied into this repository.

## Version 0.1.2 installed signed-in Chrome check

The viewer reported that version 0.1.1 still left the reason prompt untouched. After manual Google sign-in in ordinary Chrome, we reopened the same dedicated profile with remote debugging and without the enable-automation flag. YouTube stayed signed in. No credentials or cookies were exported.

The installed version 0.1.1 reproduced the failure: its button opened the reason sheet but timed out without choosing an option. The live prompt uses `yt-sheet-view-model` and `yt-contextual-sheet-layout`, not a dialog container. It offers eight menuitem buttons: Irrelevant, Boring, Too sexual, Disgusting, Violent, Offensive, Misleading and Other. Choosing Other closes the sheet without a separate Submit button. The fresh notice reads "You'll see fewer videos like this".

Two regressions based on that markup failed before the fix. Version 0.1.2 recognizes the sheet and notice. Once the selected sheet closes, native navigation can finish without incorrectly treating the choice as unfinished. A changed Short still prevents channel feedback to the successor.

We reloaded the actual unpacked extension through Chrome's extension debugging interface and reloaded YouTube. This check used the installed isolated-world content scripts, with no source injection. On Short `tFU2d3qCKYc`, the actual Avoid button produced these observed clicks and results:

- Not interested, then Other, then Don't recommend this channel.
- Fresh notices: "You'll see fewer videos like this" and "We won't recommend you videos from this channel again".
- The workflow finished with "Feedback sent." and the reason sheet closed.
- The route changed once, to `L-FSNh2tgIo`; the extension made no Next video click. Both actions completed while bound to the original Short.

The native advance was queued long enough for channel feedback in this run. If another YouTube variant advances earlier, the extension reports partial completion and leaves the successor's channel untouched. The regression covers this boundary.

After packaging, Chrome reported installed version 0.1.2. The reloaded page had one 48 by 48 pixel Avoid button. Keyboard traversal focused it with a 3-pixel outline, and YouTube remained signed in. Independent review found no actionable defects; the full 47-test suite passed.

## Owner confirmation in Chrome and Opera

On 2026-10-02 (Asia/Singapore), the owner reported: "I tested chrome and opera and it works well." This confirms owner-tested runtime success in both browsers. No additional browser versions or detailed step-by-step observations were supplied. This report supersedes the earlier Opera-unverified outcome.

The successful checks do not establish compatibility with every YouTube account or interface variant.

Choose a Short and channel the viewer actually wants to dismiss. Verify that both feedback options exist, each action produces confirmation, reasons follow the chosen policy, and advancement happens once. If YouTube advances after the first action, the extension must stop without dismissing the newly displayed Short.

Automated fixtures and source-preview layout checks do not replace those runtime checks.

## Version 0.1.3 notification removal

On 2026-10-02 (Asia/Singapore), the owner requested removal of extension notifications and approved browser UI/UX verification. All 48 automated tests pass. Updated content-script tests cover no extension notifications during pending feedback, completion, missing options, partial completion and renderer replacement. Feedback ordering, duplicate-click prevention and successor protection remain covered.

A live YouTube source preview showed one 48 by 48 pixel Avoid button and no extension notification host. At 1441 by 861 in the light theme and 1024 by 768 in the dark theme, the button stayed inside the viewport. Keyboard traversal returned focus to the button with its 3-pixel outline in both themes.

A Chromium fixture ran the real content scripts against synthetic visible YouTube controls. The button was disabled during feedback, Not interested and Don't recommend channel ran in order, navigation reached the next Short once, and the button became enabled again. No extension notification host appeared during the operation. The native feedback notice remained visible.

These checks used source previews, not an installed version 0.1.3 extension. No feedback was submitted to a live YouTube account. The earlier installed Chrome and owner Chrome/Opera results apply to version 0.1.2; installed version 0.1.3 account behavior still needs an owner check after reloading the extension.

## Version 0.1.3 owner confirmation in Chrome and Opera

On 2026-10-02 (Asia/Singapore), the owner confirmed the notification-removal update: "Confirmed and works well on chrome and opera." This records owner-tested success in both browsers and supersedes the pending owner check above. Browser versions and detailed test steps were not supplied.

## Version 0.1.4 Right Arrow shortcut

The full 52-test suite passes. New content-script fixtures verify that Right Arrow runs the existing button workflow, submits both feedback actions and advances once. They cover repeated keys, activation while busy, editable fields including shadow DOM inputs, modified keypresses, composition, previously handled events and inactive routes or controls. Existing click and workflow tests continue to pass.

The shortcut activation regression failed before its handler was added. Independent review identified that an earlier page bubble handler could navigate first. A regression reproduced that ordering failure; capture-phase handling now prevents that bubble handler from changing the Short. Packaging produces `dist/youtube-shorts-avoid-0.1.4.zip`.

The owner chose to skip UI/UX verification for this ticket. No live browser or installed-extension shortcut check was run. Reload the extension and YouTube, then press Right Arrow on a Short you want to dismiss. Confirm that feedback runs and navigation advances once. Typing in a comment field and holding Right Arrow must not trigger repeated feedback.

## Version 0.1.5 configurable shortcut

The full 59-test suite passes. The new shortcut replacement regression failed against the fixed Right Arrow handler before implementation. Settings tests cover key-combination capture, save, persistence after reopening, reset, Tab traversal, Escape cancellation, save failures and retry after a failed initial read. Content tests cover changed bindings in an open tab, configured typing/composition/repeat guards and an initial read that completes after a newer storage change.

The owner approved UI/UX verification. Local Chromium loaded the unpacked extension and opened its actual options page. Capturing Ctrl + k, saving it, reloading the page and resetting to Right Arrow succeeded with real extension storage. At 1024 by 768 in light mode and 360 by 640 in dark mode, the page had no horizontal overflow, both visible buttons were at least 44 pixels high and keyboard focus displayed a 3-pixel outline. No live account feedback was submitted. Installed Chrome/Opera shortcut activation on YouTube remains covered by automated fixtures, not a new live account check.

Independent review identified missing recovery after an initial settings read failed. The Retry loading settings control now permits another read before editing becomes available; its regression failed before the fix. If a content script cannot read the saved key, it leaves shortcut activation inactive until a saved setting change arrives, while the Avoid button remains available. This prevents feedback from an unintended fallback key. Re-review found no remaining material findings. Packaging produces `dist/youtube-shorts-avoid-0.1.5.zip`.

## Version 0.1.6 feedback popup

The full 76-test suite passes, including new tests for video/channel filtering, feedback-page boundaries, native Load more, scoped card deletion, stale DOM/account/route guards, native confirmation and timeout outcomes, internal-message sender checks, 10-entry popup pagination, confirmation/cancel, failure states, tab closure, missing-receiver reload, safe title rendering and video URLs. Packaging creates the version 0.1.6 ZIP and verifies that declared content scripts may omit optional CSS. The earlier package test failed because it indexed that optional field directly; using an empty default corrected its assumption.

The owner chose the popup integration and approved rendered UI/UX checks. The signed-in Google page was inspected without deleting feedback. It showed separate video and channel cards with per-item deletion controls; Load more expanded the native list from 100 to 200 cards. Only date-group bulk controls were observed. A video-only Remove all control was not verified and is omitted.

Local Chromium loaded the unpacked extension in the signed-in profile. Opening its actual extension popup page showed 49 video entries, with 10 on the first page. Next displayed page 2, Previous returned to page 1, and Load older feedback increased the loaded count to 99. At 420 by 700 in light mode and 360 by 640 in dark mode, there was no horizontal overflow, visible buttons were at least 44 pixels high, and focus had a 3-pixel outline. No runtime errors were reported and no live feedback was deleted.

The automated attempt to open the native toolbar popup was blocked by Chromium reporting an inactive browser window despite a focus request in this environment. The installed popup page and its real Google messaging were verified in an extension tab; clicking the physical toolbar icon remains an owner check. Live Google removal and installed Opera behavior also remain unverified for this update. Synthetic deletion tests do not establish the account's actual deletion response or confirmation flow.

For the owner check, reload or install version 0.1.6, reload the Google feedback page and YouTube, then click the extension icon. Confirm that videos appear, pagination and Load older feedback work, and Shortcut settings saves the chosen key. Choose one video whose Not Interested feedback you want removed. Use Remove, confirm in the popup, complete any native Google confirmation, and Refresh. Confirm that the video entry disappears while the corresponding channel feedback remains in Google history.

Independent review found two removal-boundary defects. A renderer rebuild could disconnect the selected card while preserving its activity, and a connected card could be recycled for a different activity with the same video/title. Both regressions failed before their fixes. Changed cards now invalidate their snapshot identifiers, including pending mutation records; identifiers are single-use for a removal attempt. Success requires the matching-card count to decrease and the loaded feed to remain settled, with native confirmation, errors and account changes taking priority. The final full suite passes 76 of 76 tests.


## Version 0.1.7 native popup rework

The owner's toolbar screenshot exposed a collapsed popup about 130 pixels wide. The old body width of 420 pixels was limited by `max-width: 100vw`, which followed Chromium's initially narrow popup viewport. Earlier extension-tab checks supplied their own viewport and missed this failure. A new screen-width regression failed before the fix. The root now receives an explicit width based on one-third of the available screen, bounded between 480 and 800 pixels; a 1920-pixel screen produces 640 pixels.

Bootstrap 5.3.8 CSS and its MIT license are bundled locally. No remote framework resources or Bootstrap JavaScript are used. The popup has consistent buttons, readable video rows, light/dark themes and a scrolling video list inside a 590-pixel shell.

A separate Chromium desktop with a window manager allowed the actual native toolbar popup to open. With synthetic feedback entries and the installed content-script bridge, the popup measured 640 by 590 pixels on a 1920-pixel screen. Light and dark checks showed no horizontal or page overflow, 44-pixel buttons, a 3-pixel focus outline, working pagination and confirmation/cancel. Screenshots were visually inspected. No signed-in feedback was deleted. The signed-in extension-tab integration also loaded and paginated the account's real entries; live deletion and Opera remain owner checks.

The full suite passes 77 tests and packaging creates `dist/youtube-shorts-avoid-0.1.7.zip`, including Bootstrap's CSS and license. For the current owner check, install or reload **version 0.1.7**, reload Google history, then click the extension icon. Confirm the wider layout, readable titles, pagination and light/dark styling. The earlier 0.1.6 observations above are historical and do not verify native toolbar sizing.

## Version 0.1.8 video thumbnails

The popup now derives a thumbnail URL from each validated YouTube video ID, loads it lazily without a referrer, and retains a fixed-size CSS placeholder when the image fails. No remote image URL from the feedback response is trusted. Thumbnail and fallback tests failed before implementation. The earlier safe-title test also failed because it prohibited all row images; it now permits the one intended thumbnail while still rejecting image markup in the title link and inline error handlers. The final full suite passes 79 of 79 tests, and packaging creates `dist/youtube-shorts-avoid-0.1.8.zip`.

The owner approved rendered UI/UX checks for this addition. The installed extension's native Chromium toolbar popup was checked with synthetic feedback entries, a real YouTube sample thumbnail served as an image fixture, and a deliberately failed image. Light and dark layouts at 640 pixels and an explicitly resized 480-pixel root showed readable long titles, loaded images and the placeholder without horizontal or page overflow. Buttons remained at least 44 pixels high and focus retained a 3-pixel outline. Pagination and confirmation/cancel worked. Screenshots were visually inspected. No live account feedback was deleted, and this fixture check does not establish availability of every account video's thumbnail. Independent review found no material issues.

Install or reload version **0.1.8**, reload Google history and open the extension icon to check your own video's thumbnail. Deleted or unavailable images may display the placeholder. Live removal and Opera remain owner checks.

## Version 0.1.9 dynamic popup height

The owner approved the thumbnail layout and requested a taller, dynamic list. The popup shell now follows its contents, up to Chrome's 600-pixel toolbar limit. Reduced padding and gaps, plus an expandable About this list explanation, give the video list about 30 percent more visible height than version 0.1.8. Short and empty pages shrink instead of keeping a fixed 590-pixel shell. Confirmation and footer controls remain visible while the rows scroll.

The native-popup regression first failed against version 0.1.8's fixed 590-pixel height. Rendered checks also caught Chromium truncating a fractional empty-state content height: 357.90625 pixels became a 357-pixel viewport with a one-pixel outer scroll. A ResizeObserver rounds the measured shell height upward; the shell's CSS cap keeps it within 600 pixels.

The owner's existing Run UI/UX checks choice applies to this same ticket. Installed native Chromium checks used synthetic entries and thumbnail responses at 640 and 480 pixels wide in light and dark themes. Full pages measured 600 pixels high; the one-row last page measured 387 pixels at 640 wide and 378 at 480 wide; empty lists measured 358 pixels. No horizontal or page overflow remained. Pagination, confirmation/cancel and an expanded explanatory note passed, buttons remained 44 pixels high and focus had a 3-pixel outline. Screenshots were visually inspected. No live feedback was deleted. The final full suite passes 79 tests and packaging creates `dist/youtube-shorts-avoid-0.1.9.zip`.

Install or reload **version 0.1.9**, reload Google history and click the extension icon. Confirm that the longer list uses the available toolbar height, and a last page containing only a few entries shrinks. A toolbar popup cannot exceed Chrome's 600-pixel height cap; longer pages scroll inside the list.

## Version 0.1.10 taller feedback window

The owner clarified that the list should use more screen height than the toolbar popup permits. Version 0.1.9's resizing within the 600-pixel toolbar limit did not satisfy that intent. The icon now launches a separate resizable extension window, centered at roughly one-third of available screen width and 90 percent of available screen height. The list fills the window's viewport. The toolbar popup is only a launcher; subsequent icon clicks focus the existing feedback window.

Tests for window creation, reuse and launch errors failed before implementation. Native reuse initially failed because Chrome redacts tab URLs in window enumeration without broader tab permission. A regression reproduced that boundary; exact document filtering through `runtime.getContexts` now finds only the extension viewer without adding permissions. The extension declares Chrome 116 as its minimum for that API. Google history and native confirmations focus the Google tab's containing browser window; that regression also failed before the focus change.

The existing owner-approved UI/UX checks were run against the installed extension's actual toolbar launcher and synthetic feedback entries. On a 1920 by 1080 screen the viewer opened at 640 by 972 pixels, with a 916-pixel content viewport and 622-pixel list area. Reopening the icon focused the same window without duplication. Resizing to 480 by 760 gave a 704-pixel content viewport and a 411-pixel list. Light/dark layouts had no page or horizontal overflow, thumbnails and placeholder remained visible, pagination and confirmation/cancel worked, the explanatory note expanded, focus retained a 3-pixel outline and no runtime errors were reported. Open Google history brought the Google browser window forward. Screenshots were visually inspected. No account feedback was deleted; Opera and live removal remain owner checks.

The full suite passes 82 tests and packaging creates `dist/youtube-shorts-avoid-0.1.10.zip`. Install or reload **version 0.1.10**, reload Google history, and click the icon. It should open a tall resizable feedback window rather than a toolbar list. Clicking the icon again should focus that window; dragging its lower edge should change how many rows are visible. Earlier toolbar measurements above are historical, not evidence that the previous builds provided this taller viewer.

## Version 0.1.11 embedded popup restored

The owner rejected the separate feedback window. The icon again renders the list directly in the toolbar popup, with thumbnails, the approved wide Bootstrap layout, content-based height capped at 600 pixels and the expandable note. Window launching and context enumeration are removed, along with the Chrome 116 requirement introduced for context enumeration. Open Google history still focuses the existing Google browser window when deliberately requested.

Two regressions failed against version 0.1.10: the default icon popup showed no rows because it launched a window, and it no longer set the embedded screen-based width. Both pass after restoring the embedded presentation. The full suite passes 81 tests; packaging creates `dist/youtube-shorts-avoid-0.1.11.zip`.

The existing authorized native UI checks passed at 640 and 480 pixels wide in light and dark themes. Window count stayed at one before and after opening the extension icon: no separate window was created. Full pages measured 600 pixels high, single-row pages 387/378 pixels, and empty lists 358 pixels. No page or horizontal overflow remained; thumbnails, placeholder, pagination, confirmation/cancel and expanded note passed. Controls retained 44-pixel height and 3-pixel focus. These checks used synthetic entries without deleting live feedback.

Install or reload **version 0.1.11**, close any old separate feedback window, reload Google history and click the icon. The list should stay anchored to the extension icon. Longer lists scroll within the browser's popup height limit; no additional feedback window should open.
