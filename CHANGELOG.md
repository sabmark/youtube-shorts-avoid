# Changelog

## 0.1.11

- Restore feedback inside the extension toolbar popup; clicking the icon no longer opens a separate window.
- Keep thumbnails, content-based height within the browser limit, and the wider Bootstrap layout.

## 0.1.10

- Open the feedback list in a resizable window at 90 percent of available screen height, beyond the toolbar popup height limit.
- Reuse the feedback window when the icon is clicked again; resize the list with the window.
- Bring the Google browser window forward for history and native confirmations. Chrome 116 or later is required.

## 0.1.9

- Resize the popup to its list content, capped at Chrome’s 600-pixel toolbar limit.
- Give rows more vertical space and move the explanatory note into an expandable About this list section.

## 0.1.8

- Show video thumbnails beside feedback titles, with a stable placeholder for unavailable images.

## 0.1.7

- Fix the collapsed native popup width and size it to roughly one-third of the screen, between 480 and 800 pixels.
- Use locally bundled Bootstrap 5.3.8 for buttons, video rows, pagination and light/dark styling. Keep scrolling within the video list.

## 0.1.6

- Add an extension popup to browse existing Not Interested video feedback, load older entries and remove a selected video through Google's controls.
- Keep channel feedback and omit a bulk-reset button. Add My Activity access for the popup integration.

## 0.1.5

- Add a settings page to save an Avoid key or key combination, with a reset to Right Arrow. Changes apply to open Shorts tabs.

## 0.1.4

- Add Right Arrow as a shortcut for Avoid video and channel. Editable fields, modified keypresses and held-key repeats do not trigger feedback.

## 0.1.3

- Remove all extension progress, completion and error notifications, including "Feedback sent."
- Keep the Avoid button disabled while feedback is pending and preserve YouTube feedback confirmation checks.

## 0.1.2

- Recognize YouTube's contextual Tell us why reason sheet and automatically select Other when available.
- Recognize the fresh "You'll see fewer videos like this" confirmation.
- Handle native advancement after reason selection while preventing feedback on the successor's channel.
- Verify the installed extension in signed-in Chrome; the owner also confirmed it works in Chrome and Opera.
- Publish the first public release with installation instructions, MIT license, checksums and automated checks.

## 0.1.1

- Select Other, or the first supported reason, in supported reason dialogs and submit once when required.
- Keep unrelated prompts and requests for typed details under manual control.
- Add the extension logo in 16, 32, 48 and 128 pixel sizes.

## 0.1.0

- Add the Avoid button beside desktop Shorts controls.
- Request Not interested and Don't recommend channel, confirm both actions and advance to the next Short.
- Add safeguards for missing controls, stale notices, changed Shorts and duplicate clicks.
