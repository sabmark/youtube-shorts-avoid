# 001: Use visible YouTube controls and stop on uncertainty

Accepted on 2026-10-01 within the approved extension design.

## Context

YouTube owns the recommendation system and can change Shorts menus independently of this extension. Account feedback controls require signed-in runtime verification. The connected browser cannot currently complete Google sign-in.

## Decision

Use Manifest V3 isolated-world content scripts and interact with visible page controls. Separate the workflow from the DOM adapter. Keep the requested action order and confirm each action through a fresh visible notice. Bind each operation to the starting Short and stop on a changed identity, unavailable option, required reason or timeout.

Use a shadow root to contain the extension's button styling. Match the YouTube origin broadly enough to observe navigation into Shorts, but mount and operate only on Shorts routes. Use no private APIs, backend, telemetry or production dependencies.

## Consequences

The extension may report that a YouTube variant does not support the requested sequence. That outcome is safer than submitting feedback for a different Short or claiming completion without evidence. DOM fixture tests exercise the workflow without proving account-specific YouTube behavior. The viewer's normal signed-in browser remains necessary for runtime validation.
