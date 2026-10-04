# Privacy

Shorts Avoid for YouTube runs locally on `https://www.youtube.com/`. Its content scripts inspect the visible Shorts controls and feedback notices, and click YouTube's own controls when you activate Avoid or Like.

The extension has no backend, analytics, telemetry or persistent account-data storage. It does not read or export login cookies, passwords or authentication tokens. Workflow state stays in page memory. Your chosen Avoid and Like shortcuts are saved locally in extension storage; each contains only the key or mouse button and modifier settings. The storage permission allows this setting to persist across browser restarts.

The extension uses YouTube's existing signed-in session. Avoid sends Not interested and channel feedback through YouTube's interface. Like requests YouTube's Like control and then Next immediately, without waiting for confirmation. An already-liked video stays liked. YouTube handles those actions and your account session under its own policies.

The manifest grants content-script access to YouTube pages so controls can appear when navigating into Shorts. The extension mounts and sends feedback only on desktop Shorts routes.

The popup contains links to Google's Not Interested and liked-video history. Clicking a link opens the Google page in a new tab. The extension has no Google My Activity host permission or content script and does not read, list, delete, store or export history. Opening the popup does not open a Google tab automatically. Sign-in and history management happen on Google's own page.
