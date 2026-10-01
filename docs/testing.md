# Verification record

## Automated tests

The full suite contains 35 passing tests as of 2026-10-01. The behavior tests execute the real content scripts against synthetic DOM fixtures, including feedback confirmations, stale notices, unavailable options, required and optional reasons, duplicate clicks, changed routes and renderers, automatic advancement and next-video timeouts.

The control also has a regression test for a page that rejects plain HTML assignments under Trusted Types. Test fixtures capture unexpected runtime errors and disconnect their observers before closing jsdom windows.

The packaging test creates an isolated fixture containing secret-like and development files. The resulting archive contains exactly the five runtime files, all manifest references resolve, and the ZIP integrity check passes. `npm run package` produces the local distributable without including dependencies or account data.

An independent whole-change review found two asynchronous boundary defects. A required reason appearing while the second menu opened could allow a channel click, and queued native advancement could follow an immediate Next click. Each regression failed before its fix. Reason checks now cover menu polling and the click boundary. Before clicking Next, the adapter observes native advancement for its four-second timeout window. Tests cover delayed native advancement; navigation arriving after that window remains a live timing limitation.

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

## Runtime checks still required

Google rejected sign-in in the connected browser. The actual signed-in feedback sequence and fresh confirmation wording remain unverified. Chrome load-unpacked installation, Opera installation and Opera runtime behavior also require local verification in the viewer's normal browser.

Choose a Short and channel the viewer actually wants to dismiss. Verify that both feedback options exist, each action produces confirmation, reasons follow the chosen policy, and advancement happens once. If YouTube advances after the first action, the extension must stop without dismissing the newly displayed Short.

Automated fixtures and source-preview layout checks do not replace those runtime checks.
