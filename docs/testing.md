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
