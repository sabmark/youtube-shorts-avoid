# Privacy

YouTube Shorts Avoid runs locally on `https://www.youtube.com/`. Its content scripts inspect the visible Shorts controls and feedback notices, and click YouTube's own controls when you press Avoid.

The extension has no backend, analytics, telemetry, external requests or account-data storage. It does not read or export login cookies, passwords or authentication tokens. Workflow state stays in page memory. Your chosen keyboard shortcut is saved locally in extension storage; it contains only the key and modifier settings. The storage permission allows this setting to persist across browser restarts.

The extension needs YouTube's existing signed-in session for recommendation feedback. Clicking Avoid sends Not interested and channel feedback to YouTube through its interface. YouTube handles that feedback and account session under its own policies.

The manifest grants content-script access to YouTube pages so the control can appear when navigating into Shorts. The extension mounts and submits feedback only on desktop Shorts routes.
