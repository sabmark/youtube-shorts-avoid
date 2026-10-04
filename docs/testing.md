# Verification record

## Store package and owner acceptance, version 0.1.24

The owner approved the name Shorts Avoid for YouTube and an original minus-and-heart logo. Store assets include a 440x280 promotional tile, light/dark 1280x800 installed settings screenshots and a 128px icon with 16px transparent padding. The package includes the immediate Like fix from v0.1.23. The full suite passes 89 tests with zero failures.

The owner loaded the preview ZIP in Chrome and reported: "Passed: navigation starts immediately and the Like is recorded." This confirms the requested live Like-and-next behavior on the owner's account. The accepted ZIP's SHA-256 is `5613f6a0620f5f999aee0ee0681b0a671616ed01d1adabed93a11b4a3085c775`. It does not establish a new Opera or Avoid retest.

## Immediate Like navigation, version 0.1.23

The owner reported several seconds between Right Arrow and the next Short. The Like workflow waited for the native Like state to confirm, then reused the four-second automatic-navigation window intended for Avoid feedback.

Like now requests the native action and Next without either pre-navigation wait. It still leaves an already-liked video liked, stops on a missing or indeterminate Like control, and does not click Next if the original Short has changed. The post-Next navigation check keeps repeated activations from processing the same video twice. Avoid retains its confirmation and automatic-navigation observation path.

The immediate-navigation and changed-successor regressions failed before the fix. The full suite passes 89 tests with zero failures, and packaging produces v0.1.23. Independent review found no functional defect; regressions were added for absent and mixed Like states.

Owner-authorized Chromium checks installed the real extension and intercepted a controlled Shorts page. Right Arrow requested Next 0.7 ms after Like; the heart button requested Next 0.2 ms after Like. Both advanced before any Like confirmation. Already-liked, repeated activation and changed-successor cases passed with no page errors. These are installed-extension fixture checks, not live signed-in YouTube timing or server acceptance.

For a live check, install or reload the package and reload YouTube. On a Short you intend to like, press Right Arrow or click the heart. Confirm navigation starts immediately and the intended Like appears in YouTube's liked-video history. An already-liked Short should advance without being unliked.

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

## Version 0.1.12 Remove feedback navigation-drawer fix

The owner reported that Remove feedback only opened Google history. Read-only inspection of the signed-in page found an always-visible `<div role="dialog" aria-label="navigational drawer" aria-modal="false">` containing a navigation landmark. The adapter's generic dialog check returned a confirmation outcome before clicking the selected card's Delete control. The drawer therefore caused every attempt to hand off to Google without deleting anything.

The adapter now excludes non-modal navigation drawers and hidden dialogs from the confirmation check, before and after clicking the selected Delete control. Visible dialogs and alert dialogs still require native confirmation. Three regressions failed before the change and pass afterward: the observed drawer allows individual removal, hidden dialogs do not block removal while visible ones do, and a visible alert dialog remains a confirmation. Existing account, route, stale-card, single-use identifier and confirmed-disappearance guards remain in place.

After reloading the installed extension and Google history, read-only evaluation in its actual isolated content-script context found 49 video entries, the navigation drawer present, and no blocking confirmation dialog. No live feedback was deleted. The native toolbar popup was then checked against a synthetic Google page with the observed drawer, two video cards and one channel card. Clicking Remove and confirming sent one Delete click to the selected video, removed it from the refreshed popup, retained the other video and channel card, and reported the verified fixture removal. The browser window count remained unchanged. This confirms the installed popup/message/content-script path, but actual account deletion remains an owner retest.

Independent review narrowed the non-modal exemption to the observed `aria-label="navigational drawer"`; a regression failed before that tightening and proves other non-modal dialogs containing navigation still require confirmation. The full suite passes 85 tests; packaging produces `dist/youtube-shorts-avoid-0.1.12.zip`. Install or reload **version 0.1.12**, then reload the existing Google feedback tab as well. Select a video you want to remove, click Remove and confirm. The navigation drawer should no longer open Google history instead of clicking Delete. If Google presents a real visible confirmation, complete it there and refresh the popup.

## Version 0.1.13 delayed confirmation polling

The owner confirmed both v0.1.12 and the Google tab were reloaded, then reported an error while Google's native "Confirm you would like to delete this activity" dialog remained open. Inspection of the actual signed-in Google dialog found a visible `role="dialog"` with `aria-labelledby`, Cancel and Delete controls. With all network requests blocked, the installed adapter recognized it as confirmation; Cancel closed it without deleting feedback. The owner's exact timing was not reproduced in Chromium.

A deterministic regression reproduced a polling boundary defect that can produce the reported outcome: a background-tab callback resumes after the six-second deadline with a confirmation now present, but the old loop exits without examining that DOM. The regression failed with `error` instead of `confirmation`. Polling now inspects state on every resumed callback before enforcing the deadline; absent results still time out. The existing native confirmation handoff remains unchanged, and the extension does not click Google's final Delete button.

All 86 tests pass and independent review found no material findings. The installed native popup/message/content-script path was checked with a synthetic confirmation and a delayed poll beyond the deadline. The selected card received exactly one Delete click, all three fixture cards remained pending confirmation, the popup handed off with "Complete the confirmation in Google history, then Refresh.", Google became visible, and the browser window count stayed at one. No live feedback was deleted. This proves the delayed-poll fix and handoff in the fixture; the owner's live timing and Opera remain retest items.

Install v0.1.13, reload the extension and existing Google history tab, and retry one selected video. If Google's native confirmation appears, click its Delete button to finish, then reopen the extension and Refresh. Confirm that only the selected video disappears and channel feedback remains.

## Version 0.1.14 removal completed in the popup

The owner requires deletion within the popup and rejects the earlier native-confirmation handoff. This supersedes that policy. After confirmation in the popup, the content script completes the matching native Google single-activity confirmation in the background and verifies disappearance before refreshing the list. Removal never activates Google history; unsupported confirmations stay failed or pending in the popup.

Inspection with all network requests blocked found that Google's dialog uses `jsname="WCCDZe"`, a `jsname="bN97Pc"` body with the exact single-activity confirmation paragraph, visible Cancel/Delete controls with `data-id="IbE0S"`/`EBS5u`, and hidden template copies of both controls. Its `aria-labelledby` points to an image-only heading, so it cannot identify the confirmation text. The installed matcher recognized the visible final Delete without clicking it. Most importantly, the dialog's `jsowner` resolves to the original selected card's `c-wiz[jscontroller="Dlfr9"]` activity container.

The adapter requires a newly created dialog whose owner resolves to that same original container object, which must still contain the selected card and exactly one YouTube activity card. Account, route, card connectivity, jsdata, title and video URL are checked before the final click. It clicks only the one visible enabled native Delete control, once, then waits for dialog closure and verified removal. Existing, unrelated, bulk, disabled and changed-target dialogs never receive the final click. A missing disappearance never reports success or retries. Independent review exposed an initial missing owner binding; its different-owner regression failed before that guard and passes afterward.

All 91 tests pass; packaging and whitespace checks pass, and independent review found no remaining material findings. The installed native toolbar popup and real messaging/content-script bridge were tested against the observed Google structure in a fixture with two videos and a channel entry. The selected initial Delete and final confirmation each received exactly one click. Hidden templates received none. The popup refreshed to the remaining video and reported removal while the channel remained, active tab IDs stayed unchanged, and the window count remained one. The popup stayed available throughout. No live account feedback was deleted; live Google deletion and Opera require owner retesting.

Install v0.1.14, reload the extension and any existing Google feedback-history tab once for the update, then return to the popup. Choose a video to remove and confirm there. The popup should refresh with that video gone without switching to Google history; channel feedback must remain.

## Version 0.1.16 signed-in deletion test and final receipt handling

The owner explicitly authorized deleting only "Black Celebrated Too Early! 😱" (`https://www.youtube.com/watch?v=ts-WNj1WIss`) for the live popup test. Preflight found one matching video, 100 loaded YouTube activity cards and 51 channel-only cards. It exposed a real owner-binding timing defect: the selected `c-wiz[jscontroller="Dlfr9"]` has no ID before Google opens its confirmation. The lazy-ID regression failed against v0.1.14. Capture now requires the original activity container object, and its newly assigned ID is resolved from the dialog only afterward; the strict object binding remains.

The live Google flow also displayed an informational `role="dialog"` with `jsname="OSlCJe"`, body controller `oehLEf`, "Deletion complete" and the statement that the selected activity is being permanently deleted. The activity card remains in the DOM until this receipt closes. Its owner is the page controller (`MiaTzf`) containing 100 activity cards, so the receipt cannot authorize any Delete click. Recognition permits only its one visible enabled `button[aria-label="Close this dialog"]`. The code never clicks Got it or changes the receipt's preference checkbox. It handles both a receipt after a new deletion and an already pending receipt, which is closed without clicking Delete again. Success still requires verified disappearance of the chosen video, with stable route and account.

Three receipt regressions failed before this handling; four now cover two-step confirmation plus receipt, one-step deletion plus receipt, resuming an existing receipt without another Delete click, and a receipt for another item that cannot report selected-video success. All 96 tests pass. Packaging produces `dist/youtube-shorts-avoid-0.1.16.zip`, whitespace checks pass, and independent review found no material findings.

The native-browser test initially could not open a popup on WSLg, so the owned signed-in test browser was relaunched under the existing Xvfb/Openbox desktop. Automation's focus emulation also deferred Google's UI processing; disabling that emulation exposed the pending completion receipt. To preserve that existing operation, the final feedback class methods were loaded into the already installed content adapters without adding duplicate message listeners. The live native popup then resumed only the approved video's receipt. It clicked Close once, issued no further Delete click, refreshed the chosen video out and displayed "Video feedback removed. Channel feedback was kept." All 99 other loaded activities remained, including all 51 channel-only entries. Active tab IDs and browser window count stayed unchanged. Reloading Google proved the selected video's deletion persisted and every previously loaded channel entry remained. This was a live Google account mutation authorized for that one named video, not a fixture deletion.

Separately, the clean installed v0.1.16 extension was reloaded and tested through its native toolbar popup and actual message bridge against the observed DOM fixture, including lazy owner-ID assignment and a completion receipt after the final confirmation. Initial Delete, final Delete and receipt Close each received exactly one click. Hidden templates received none, the other video and channel remained, active tabs and window count stayed unchanged, and the popup reported verified removal. This distinguishes the clean installed fixture check from the final-source live receipt continuation. Installed Opera remains untested locally.

## Version 0.1.17 mouse shortcuts

The shortcut setting now accepts Left, Middle, Right, Mouse Back and Mouse Forward, with optional Ctrl, Alt, Shift or Meta. Existing keyboard settings and the Right Arrow default remain compatible. A mouse binding replaces the selected button's normal action on Shorts outside editable fields. Browser Back/Forward behavior may take priority.

Six new behavior tests cover focus before capture, mouse persistence, all five labels, feedback once, modifier/editable/route guards, live setting changes, navigation during a gesture, programmatic clicks and child-to-parent click retargeting. The retargeting regression failed before related-target suppression was added. Existing keyboard regressions also caught and verified the fix for confusing a DOM event's type with the stored binding type. All 102 tests pass, packaging creates `dist/youtube-shorts-avoid-0.1.17.zip`, and independent review found no remaining actionable issues.

The owner approved browser UI/UX verification. An isolated installed Chromium v0.1.17 check verified that the first field click only focuses it, Ctrl+Middle captures and persists through an actual extension-storage save/reload, Right captures, Escape restores the saved mouse binding, keyboard capture still works, and reset restores Right Arrow. Light 1024 by 768 and dark 360 by 640 layouts have no horizontal overflow, all visible controls are at least 44 pixels high and the input focus outline is 3 pixels. Screenshots were inspected. The input gained an explicit 44-pixel minimum after the browser measured its original height at 42.375 pixels.

The installed isolated-world content scripts ran against a synthetic Shorts page with intercepted network responses. Real browser Left, Middle and Right clicks each sent Not interested and Don't recommend channel once, clicked Next once, reached the second Short, and produced zero native click, auxiliary-click or context-menu handlers on the test surface. This was fixture feedback, not a live account mutation. Live signed-in YouTube, Opera and physical Back/Forward buttons remain owner retests.

Reload the extension and YouTube, open Options, focus the shortcut field, click the desired mouse button inside it and save. On a Short you want to dismiss, use that button outside an editable field and confirm the feedback sequence and single advance. Reset to Right Arrow remains available.

## Version 0.1.18 Back/Forward pointer handling

The owner reported that an unmapped Razer Mouse 4 in Opera navigated Back despite the saved binding. An installed Chromium probe reproduced a matching event failure: a page capture handler cancelled pointerdown, which suppressed compatibility mousedown/mouseup. The old mouse-only handler never activated Avoid or consumed the release, and native Back moved from /shorts/current to /shorts/before. Without page cancellation, the same old build handled Back correctly. This reproduces the event conflict, not the owner's exact Opera/hardware session.

The extension now handles mouse pointerdown and pointerup at window capture, while retaining mouse-event fallback and follow-on click suppression. A configured mouse press overrides earlier default prevention on an eligible Short; keyboard handling retains its earlier guards. The accepted release is consumed even if the target changes. Touch and pen presses clear the old gesture and exclude their compatibility mouse events from mouse shortcuts. The next real mouse pointer restores mouse handling.

Three new regressions failed before their fixes and now pass: cancelled-pointer Back release, scoped pointer overrides and touch/pen compatibility exclusion. All 105 tests pass; packaging creates `dist/youtube-shorts-avoid-0.1.18.zip`, whitespace checks pass and independent review has no remaining findings.

With the updated extension installed, Chromium native Back and Forward input through its input protocol each activated Avoid once without traversing browser history on the Shorts fixture, including page pointerdown cancellation. On normal YouTube watch routes, both buttons still traversed history and did not activate Avoid. An unassigned Back button on Shorts also retained normal history navigation. Fixture feedback options were deliberately unavailable, so these checks submitted no recommendation feedback. Opera with the owner's physical Razer Mouse 4 still requires retesting.

Install or reload v0.1.18, then reload the existing YouTube tab. Keep Mouse Back saved and test Mouse 4 on a Short you want to dismiss, outside an editable field. Confirm that it runs Avoid instead of returning to the previous browser page. On another website or a normal YouTube watch page, Mouse 4 should still navigate Back.


## Like and arrow defaults, version 0.1.19

The heart button and Right Arrow like the current Short and advance only after YouTube exposes a liked state. An already-liked video remains liked. Left Arrow now defaults to the existing Avoid sequence (Not interested, then Don't recommend channel). Saved Avoid shortcuts take priority, including saved Right Arrow bindings. Reset Avoid to Left Arrow to use both default arrows.

The new regression tests failed before implementation. The full suite passes 113 tests with no failures, and packaging creates version 0.1.19. An isolated Chromium lease ran the content scripts on an intercepted synthetic Shorts page: heart click and Right Arrow each clicked Like once, sent no negative feedback and advanced once; Left Arrow sent both negative feedback actions and advanced once. Light 1024x768 and dark 360x640 checks showed two 48x48 controls, 3px focus rings and no script errors; screenshots were inspected. These were page-script fixture checks, not installed-extension or live account confirmation. Live signed-in YouTube and Opera remain owner checks.

Install or reload the package, reload YouTube, reset Avoid to Left Arrow if desired, then try the heart or Right Arrow on a Short you want to like. Confirm the native Like state and one advance. Try an already-liked Short and confirm its like remains. Test Left Arrow on a Short you want to dismiss.

## Compact menu, version 0.1.20

The extension icon now opens a compact menu with Shortcut settings, Not Interested history and Liked videos history. Both history links open Google My Activity in a new tab. The extension's history list, pagination, removal controls, Google history adapter and My Activity host permission are removed. The package includes 0.1.19's heart button and arrow defaults.

The popup regressions failed before implementation because opening the old popup queried and messaged a Google tab. The final full suite passes 80 tests with no failures, and packaging creates version 0.1.20. Tests for the retired feedback browser were removed with that feature. Independent review found no defects in the menu change.

Owner-approved Chromium checks verified light and dark menu pages at 320px wide with three 44px controls, 3px focus and no horizontal overflow or script errors. The Liked videos link opened a new Google tab and preserved the requested history destination through Google's signed-out redirect. A real installed extension was loaded in a separate private Chromium profile. Its native toolbar popup first measured 320x285 with a 286px document: Chromium truncated the fractional content height. A regression failed before restoring ResizeObserver height rounding. The final native popup measured 320x286 with scrollWidth320 and scrollHeight286; its screenshot was inspected. Signed-in history contents and Opera remain owner checks.

Install or reload **version 0.1.20** and reload YouTube. Click the extension icon and confirm the three-item menu. Open both history links and sign in to the YouTube account if needed. Reset Avoid to Left Arrow to use both new defaults if your saved shortcut is Right Arrow. On Shorts, heart/Right should like and advance once, while Left runs the existing Avoid action. Already-liked videos should remain liked.

## Configurable Like shortcut, version 0.1.21

Owner feedback identified a missing Like control in Options. The root cause was that options.js persisted only avoidShortcut while content.js matched a fixed Like default. Options now saves and resets each action independently, captures keyboard or mouse shortcuts with modifiers, and rejects newly saved duplicate bindings. Existing overlapping settings remain unchanged and show an Avoid-priority warning. Each content-setting read has its own revision guard so a delayed load does not replace newer changes.

New persistence, collision, mouse and live-update tests failed before implementation. The full suite passes 87 tests with no failures and packaging creates version 0.1.21. Independent review found stale collision validation between two open Options pages; failing-first regressions verify settings are re-read before saving and cross-tab writes are serialized with a Web Lock. The next interface change applies Material 3 styling to these controls and the popup; rendered verification will cover the combined package.


## Material 3 popup and settings, version 0.1.22

The owner approved local Material 3 styling for the popup and settings, including separate Avoid and Like shortcut cards. A shared local material.css defines light/dark color roles, typography, rounded buttons and visible focus. Settings uses outlined capture fields, independent save/reset controls and shared instructions. The popup uses three icon rows. Bootstrap assets and its unused development dependency are removed.

The packaging regression failed before updating the runtime allowlist. The combined full suite passes 87 tests with no failures and packaging creates version 0.1.22. Independent review found no remaining defects after sequential and concurrent cross-tab collision regressions were fixed using fresh reads and a Web Lock.

Owner-authorized checks loaded the real extension in a private Chromium profile. Like captured Ctrl+l, saved through actual extension storage, reloaded without changing Avoid, accepted Right mouse and reset to Right Arrow. A duplicate Avoid binding was rejected. Two Options pages concurrently requesting K stored Avoid=K while Like remained Right Arrow. Settings at960x1000 light and360x640 dark had no horizontal overflow,56px fields,48px buttons and3px focus; screenshots were inspected.

The installed native popup measured360x386 with scrollWidth360 and scrollHeight386 in light and dark themes; its screenshot was inspected. A previous check used the narrow settings window and Chromium clamped the popup to280px, so the native check now uses a normal desktop window separately from narrow settings verification. WSL window focus also intermittently blocked popup opening; a private headless-new Chromium window provided the final native target. These checks verify rendering and extension settings, not live account feedback. Signed-in YouTube actions and Opera remain owner checks.

Install or reload **version0.1.22**, then reload YouTube. Open Shortcut settings from the extension icon. Save a different key or mouse shortcut for Like, confirm Avoid stays unchanged, and try the binding on a Short you want to like. Reset either action independently. Check the Material popup and settings in your preferred theme.

## Version 0.1.22 owner acceptance

On 2026-10-04, after receiving the packaged ZIP in Windows Downloads, the owner reported: "Looking nice, it works, release it." This is owner-reported local acceptance of the current functionality and design. The browser was not specified; it does not establish a separate Opera retest.

## v0.1.25 selectable Avoid feedback - 2026-10-04

- Ticket: EP10-FT01-US01-TSK01. New and existing installs default to both actions. Options saves Not interested only, Don't recommend channel only, or both locally. All Avoid activations use the saved choice.
- Test-first: the new single-action tests failed because preflight required both menu options and the workflow always sent both. Settings persistence and content propagation tests also failed before implementation.
- Full automated suite: 103 passed, zero failed. Package allowlist test confirms the new settings module is included and development files remain excluded.
- Installed Chromium extension on a controlled English Shorts fixture: each mode sent exactly its selected feedback and advanced once; single-action menus contained only the selected option. The choice persisted after reloading Options, and changing it affected the existing Shorts tab's Avoid button.
- Right Arrow requested Next 0.2ms after Like in the fixture despite delayed native Like confirmation. No page errors. At 360px the settings page had no horizontal overflow. Light and dark screenshots show the installed v0.1.25 settings page at 65% scale in a 1280x800 viewport.
- ZIP SHA-256: 5fdf440bdc4e96f5a37693c90280b90450916408776c73d15ee80d092122a347.
- New feedback modes have not yet been accepted on live YouTube. Prior live owner acceptance of immediate Like-and-next applies to v0.1.24. No native toolbar popup layout changes are included in this ticket.

Live retest: extract Downloads\youtube-shorts-avoid-0.1.25.zip, reload the unpacked extension and YouTube, then choose each feedback mode in Options. On videos for which you intend the feedback, press Left Arrow and confirm only the selected feedback and one advance. Reload Options to check persistence. Confirm Right Arrow still advances immediately and records the Like.

Review found an enabled Avoid button when feedback settings were unreadable. A failing-first regression test reproduced it. Avoid now stays disabled until the saved choice is known, including on read failure; a newer successful settings event restores it. Like remains available. Independent review found no remaining defects after this correction. Final suite: 103 passed, zero failed; installed browser checks reran successfully.

## v0.1.25 owner acceptance - 2026-10-04

The owner located the new Avoid feedback setting, tested it, and reported: "Cool, all good. Continue with the publishing, email is already verified." This records live owner acceptance of the new feedback modes. The publishing checkout was fast-forwarded to the reviewed v0.1.25 source and the full suite reran: 103 passed, zero failed. Publisher Settings independently confirms Verified email address.
