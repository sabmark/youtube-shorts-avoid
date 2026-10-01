# YouTube Shorts Avoid implementation plan

**Goal:** Provide a locally installable Chrome and Opera extension whose button submits both requested feedback actions for the current Short and advances once when YouTube supports that sequence.

**Architecture:** Three ordered, isolated-world content scripts separate the workflow, the YouTube DOM adapter and the control lifecycle. No background service, backend, private API or production dependency is needed. Feedback completion requires fresh visible confirmation; unavailable controls or a changed Short stop the sequence with an honest partial result.

**Stack:** Manifest V3, plain JavaScript and CSS, Node's built-in test runner, jsdom 26.1.0 for development-only DOM fixtures. Production files need no build step. A Python packaging script creates a ZIP from an explicit extension-file allowlist.

**Spec:** The approved Relayframe intake-summary.md, design/DESIGN.md and design/decision.md for youtube-shorts-avoid.

## Global constraints

- Signed-in desktop YouTube Shorts, English interface, Chrome and Opera, local installation.
- One deliberate activation processes one Short. No continuous dismissal or content classification.
- Submit Not interested first, then Don't recommend channel on the same Short. Skip optional reasons; stop if a reason is required.
- Advance exactly once after both feedback actions are visibly confirmed. Never apply remaining actions to a newly displayed Short.
- Restrict content scripts to https://www.youtube.com/* so navigation into Shorts works without a page reload; mount the control only on a Shorts route.
- No telemetry, stored account data, backend, private API requests or store publishing.
- Accessible name: Avoid video and channel. Minimum control target: 44 by 44 CSS pixels.
- Use rf workspace commit with explicit owned paths and rf push. Do not alter lifecycle files by hand.

## Review focus

1. YouTube can advance automatically or reuse renderer nodes. Check the route identity and original renderer before every action.
2. An old toast or unrelated open menu cannot confirm new feedback. Only changes after the current action count.
3. Missing feedback options, sign-in prompts and required reasons must stop before affecting another Short.
4. Repeated clicks and route transitions cannot start concurrent workflows or duplicate injected controls.
5. A packaged extension must contain all declared scripts and no development dependencies, tests or account data.

### Task 1: Foundation and feasibility evidence

Files: CONTEXT.md, docs/adr/001-visible-controls.md, docs/feasibility.md, package.json, package-lock.json, .gitignore, extension/manifest.json, extension/src/youtube.js, tests/helpers.cjs, tests/youtube.test.cjs.

Interface: ShortsAvoid.YoutubeAdapter(window, {timeoutMs}) exposes current() -> {id, element}|null, rail(target) -> Element|null, assertCurrent(target), preflight(target), feedback(target, kind) -> Promise<void>, and next(target) -> Promise<void>. Kind is not-interested or channel. Failures carry a machine-readable code and a human-readable explanation.

- [ ] Document the current inspection: signed-out desktop Shorts has More actions and an action rail, but neither feedback action. A signed-in sequential-flow result requires additional live evidence and must not be inferred from fixtures.
- [ ] Write fixture tests for current-Short selection, scoped menu selection, missing options, stale confirmation, required reasons, navigation changes and next-video confirmation. Run each new behavior test before writing its implementation.
- [ ] Implement the smallest DOM adapter that passes. Use English accessible labels, scoped visible menus and fresh visible feedback notifications. Do not depend on page-internal JavaScript properties.
- [ ] Run npm test. Expected: all foundation behavior tests pass. Record browser evidence separately; unavailable live checks remain unverified.
- [ ] Commit through the first ticket's reserved workspace with its rf ctx commit subject.

### Task 2: Workflow and visible button

Files: extension/src/workflow.js, extension/src/content.js, extension/control.css, tests/workflow.test.cjs, tests/content.test.cjs.

Interface: ShortsAvoid.Workflow(adapter) exposes run(onState) -> Promise<{status, completed, code}> and busy. It consumes the adapter from ticket 1. content.js creates one shadow-root button and a polite status region beside adapter.rail(current()), observes DOM/YouTube navigation changes and invokes Workflow.run on deliberate activation.

- [ ] Write tests proving no feedback before preflight, the two actions occur in order, optional reasons are not answered, partial results retain completed actions, required reasons stop, duplicate clicks are ignored, navigation changes stop and next is requested once only after both confirmations.
- [ ] Run the tests and observe the expected failures, then implement workflow.js minimally.
- [ ] Write DOM integration tests proving one accessible button mounts beside the rail, busy disables it, status reflects the real result, changing Shorts cannot start a second operation while one is pending, and leaving Shorts removes the control. Observe failures before implementing content.js.
- [ ] Add an original inline SVG short-video/minus icon, high-contrast light/dark styling, focus-visible styling, a 44-pixel target and a polite live region. Keep status off the video with no modal.
- [ ] Run npm test. Expected: the whole suite passes. Ask for ticket-specific UI/UX verification before rendered checks.
- [ ] Commit explicitly owned files through the second ticket workspace.

### Task 3: Package and handoff

Files: scripts/package.py, tests/package.test.cjs, README.md, docs/testing.md.

Interface: python3 scripts/package.py [--output PATH] produces a ZIP with manifest.json, control.css and the three content scripts at their declared relative paths. Default output is dist/youtube-shorts-avoid-0.1.0.zip.

- [ ] Write and run a failing packaging test: validate archive members, manifest references and exclusion of a planted secret-like development file. Then implement the explicit-allowlist packager.
- [ ] Write local Chrome/Opera load-unpacked instructions, ZIP extraction steps, workflow limits and uninstall instructions.
- [ ] Run npm test and npm run package. Expected: the entire suite passes and the distributable ZIP contains the extension only.
- [ ] Ask for ticket-specific UI/UX verification. Inspect authorized rendered states in the connected browser; record each browser's actual availability and avoid claiming signed-in feedback submission without evidence.
- [ ] Obtain an independent whole-change review, address confirmed defects test-first and rerun the full suite.
- [ ] Commit, push, record evidence with rf, release finished workspaces and run rf ready before claiming completion.

## Execution and evidence

Recommended execution: implement inline in this session, with one independent review at the end. The three tickets share the same adapter/workflow interface, so a single implementer avoids repeated context setup.

The viewer approved this plan and inline execution on 2026-10-01. Relayframe has reserved a clean feature branch in the new source repository. Its workspace ownership takes precedence over creating an additional unmanaged worktree.

No rendered verification approval transfers automatically between tickets. Do not label fixture tests as Chrome/Opera runtime results. If signed-in inspection is unavailable, implement the specified guarded sequence and retain the live-check requirement for handoff; do not silently replace both feedback actions with only one.
