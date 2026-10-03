# YouTube feedback popup

## Goal

Clicking the extension icon opens a popup that lists videos dismissed through Not Interested, including feedback submitted before the extension was installed. Users can browse older entries and remove one video's feedback. Shortcut settings remain accessible from the popup and the browser's extension Options action.

## Observed source

On 2026-10-03, the owner signed into the connected browser and authorized inspection without deletion. The supplied My Activity URL showed 100 YouTube activity cards. They included channel dismissals and video dismissals as separate entries. Each card had `role="listitem"`, the accessible label `Card showing an activity from YouTube`, and a button whose accessible label began `Delete activity item `. Video cards linked to `https://www.youtube.com/watch?v=...`; channel cards linked to `/channel/...`. A native Load more button expanded the list to 200 cards. Date-group delete controls were present; a global video-only Remove all control was not observed.

Google Help documents clearing Not Interested and Don't recommend channel feedback together through My Activity: https://support.google.com/youtube/answer/6342839?hl=en. This does not establish a video-only bulk operation or an API for the popup. The implementation will use the rendered page rather than private Google request formats.

## Architecture

- Add a popup page declared through `action.default_popup`.
- Add a content script for `https://myactivity.google.com/*` and matching host permission. The script responds only on the feedback page (`page=youtube_user_feedback`) and only to internal extension messages. It never reads other activity categories.
- When the popup opens, reuse an existing feedback tab. If none exists, create an inactive tab at the supplied URL. The tab stays available for sign-in and verification; the popup does not close a pre-existing user tab.
- The content script reads video cards from the rendered list and returns only the title, channel, video URL and an opaque identifier for that DOM entry. Channel-only entries are excluded.
- The popup keeps returned entries in memory, showing 10 at a time with Previous and Next controls. At the end of the loaded entries, Load older feedback invokes Google's Load more and refreshes the snapshot.
- No history entries or authentication information are written to extension storage. The existing shortcut setting remains the only persistent preference.

## Removal

Each row offers Remove. A confirmation inside the popup names the chosen video before a removal message is sent. The content script resolves the opaque identifier to the original connected card, checks the current feedback-page URL and account identity, and clicks only that card's native delete button. A disconnected or changed card is rejected as stale.

The operation has a timeout. The popup reports removal only when the targeted card disappears while the feedback page and account remain the same. Following the owner's popup-only requirement, the content script completes the newly created native single-activity confirmation only when its Google jsowner resolves to the original selected activity container. It clicks the visible enabled Delete control once, keeps the popup open, and waits for both dialog closure and verified disappearance. Existing, unrelated, bulk or unsupported confirmations remain failed or pending within the popup; removal never activates the history tab. No other entry is automatically removed.

Remove all is omitted. Date-group controls can include both video and channel feedback and do not meet the requested video-only scope. This limitation is stated in the popup and README.

## States and UI

Use the existing plain system-font style, light/dark support, visible focus outlines and controls at least 44 pixels high. Show loading, signed-out/verification-needed, empty, unsupported-page, stale-entry and request-failure states as readable status messages. Provide Refresh, Open Google history and Shortcut settings actions. Render remote titles as text, and accept only validated YouTube video URLs for row links.

The popup must label the list as the loaded feedback rather than claiming it contains all history. Navigation and removal controls are disabled while an operation is pending. Reopening the popup reads fresh state from Google.

## Verification

Write failing tests before behavior changes. Synthetic fixtures reproduce the observed accessible card structure with invented titles and identifiers. Cover video/channel filtering, navigation, loading more, exact-card deletion, stale identity, wrong routes, confirmation and timeout outcomes, signed-out and empty states, and safe rendering of remote text. Test browser API failures at the integration boundary. Run the full suite and package checks.

The owner approved rendered UI/UX checks for this ticket. Check popup layout at narrow widths and in both color schemes, keyboard focus and pending controls. Load the installed extension and verify that its popup lists actual feedback and loads older entries without deleting any feedback. A live removal check requires the owner to identify a video whose feedback they want removed; otherwise report removal as fixture-tested only and hand off for local testing.

## Scope limits

The first version supports the observed English desktop My Activity page in Chrome and Opera. It does not use a backend, synchronize history, export account data, dismiss channels during removal, or reset all recommendation feedback. Google can change its DOM; unsupported changes must fail with a message and a link to the native page.
