# YouTube Shorts Avoid

A desktop browser extension that lets a viewer request video and channel recommendation feedback for the current YouTube Short with one deliberate click.

## Terms

- **Current Short:** The visible Shorts renderer bound to the video ID in the current /shorts/ route. A workflow retains its starting identity.
- **Video feedback:** YouTube's Not interested action.
- **Channel feedback:** YouTube's Don't recommend channel action for the current Short's channel.
- **Confirmation:** A fresh visible YouTube feedback notice produced after the current action. Closing a menu alone is not confirmation.
- **Partial completion:** At least one feedback action was confirmed, but the rest of the sequence could not finish.
- **Required reason:** A YouTube prompt that prevents continuing without the viewer choosing an answer. The extension stops for the viewer.
- **Advance:** Move to the next Short exactly once after both feedback actions are confirmed. Automatic YouTube advancement counts as movement and must not cause a second skip.

The viewer chooses which Short to dismiss. This project does not classify content or run unattended. Sending feedback influences YouTube's recommendations; it cannot guarantee that similar content never returns.

Architecture decisions live under docs/adr. Live behavior evidence lives in docs/feasibility.md and docs/testing.md. The approved planning and design artifacts are managed by Relayframe.
