# Desktop Shorts feedback feasibility

## Evidence collected on 2026-10-01

The user approved browser inspection and UI/UX checks for the foundation ticket. The connected browser loaded the English desktop Shorts player while signed out.

Observed public interface structure:

- The current renderer is ytd-reel-video-renderer. The inspected variant has no is-active attribute.
- The More actions button is inside the renderer's menu-button container.
- The action rail is reel-action-bar-view-model.
- The separate Next video button has the accessible name Next video.
- The opened menu exposes role=menu and role=menuitem. Its options are Description, Save to playlist, Captions, Full screen, Report and Send feedback.
- Neither Not interested nor Don't recommend channel is offered in that signed-out menu.

The user attempted sign-in and reported Google's message: "This browser or app may not be secure." Signed-in inspection could not proceed in the connected browser. No recommendation feedback was submitted.

## What remains unverified

The signed-in desktop Shorts menu may vary by account or rollout. It has not been established whether both feedback actions remain available sequentially on the same Short, whether the first action advances automatically, or which visible confirmation each action produces. Opera runtime behavior is also unverified.

Automated fixtures will exercise these possible behaviors, but fixture success is not live evidence that YouTube supports them.

## Implementation boundary

Keep the requested order: Not interested, then Don't recommend channel, then advance once. Check that both options are available before starting, require fresh visible confirmation after each submitted action, and stop if the current Short changes. Do not replace the sequence with one action, submit to private APIs, or act on the next Short to compensate.

Stop for a required reason rather than choosing an arbitrary answer. Skip optional reasons. If the UI cannot support both actions, show a partial or unavailable result and ask the viewer to decide the next product behavior.

## Local verification

In the viewer's normal signed-in Chrome and Opera browsers, choose a Short and channel the viewer actually wants to dismiss. Verify menu availability, feedback confirmations, reason behavior and next-video behavior. Report missing menu options or automatic advancement; do not label those results as successful completion of both actions.

## Sources

- Authorized inspection of the connected browser on 2026-10-01, signed-out English desktop Shorts.
- User-reported sign-in rejection on 2026-10-01.
- [YouTube Help: Manage your recommendations and search results](https://support.google.com/youtube/answer/6342839?hl=en).
- [Chrome: Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).
