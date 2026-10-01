# 001: Use visible YouTube controls and stop on uncertainty

Accepted on 2026-10-01 within the approved extension design.

## Context

YouTube owns the recommendation system and can change Shorts menus independently of this extension. Account feedback controls require signed-in runtime verification. Google initially rejected sign-in in the automated browser. Manual sign-in in ordinary Chrome followed by reconnecting the same dedicated profile allowed signed-in runtime testing.

## Decision

Use Manifest V3 isolated-world content scripts and interact with visible page controls. Separate the workflow from the DOM adapter. Keep the requested action order and confirm each action through a fresh visible notice. Bind each operation to the starting Short and stop on a changed identity, unavailable option, unsupported reason prompt or timeout.

On 2026-10-01, after testing locally while signed in, the viewer changed the reason policy: select any reason, preferably Other. Answer only one dialog during this activation's Not interested feedback attempt, stay scoped to that dialog and Short, submit once when needed and wait for closure. Authorization ends when that attempt finishes. Do not answer a pre-existing or later reason prompt or submit a dialog asking for additional text. The earlier required-reason stop policy is superseded by this instruction.

Use a shadow root to contain the extension's button styling. Match the YouTube origin broadly enough to observe navigation into Shorts, but mount and operate only on Shorts routes. Use no private APIs, backend, telemetry or production dependencies.

Build the control with DOM methods rather than HTML-string assignments. Place its status region in a separate shadow host under the document body. The rendered source preview showed that a fixed notification inside the player's transformed ancestry overlaps the video, and a top-layer popover interfered with opening YouTube's menu. The separate host avoids both behaviors and preserves a polite live region.

On 2026-10-02, the viewer requested removal of all extension notifications. Version 0.1.3 removes the status host and live region. The button still exposes its busy state, and the workflow still checks YouTube's native notices before continuing. This supersedes the status-region decision above.

## Consequences

The extension stops silently when a YouTube variant does not support the requested sequence. That outcome is safer than submitting feedback for a different Short or claiming completion without evidence. DOM fixture tests exercise the workflow without proving account-specific YouTube behavior. Signed-in installed Chrome testing passed for the observed YouTube variant. Other browser and account variants still require runtime validation.
