# Privacy

YouTube Shorts Avoid runs locally on `https://www.youtube.com/` and the YouTube feedback page on `https://myactivity.google.com/`. Its content scripts inspect the visible Shorts controls and feedback notices, and click YouTube's own controls when you press Avoid.

The extension has no backend, analytics, telemetry or persistent account-data storage. It does not read or export login cookies, passwords or authentication tokens. Workflow state stays in page memory. Your chosen keyboard shortcut is saved locally in extension storage; it contains only the key and modifier settings. The storage permission allows this setting to persist across browser restarts.

The extension needs YouTube's existing signed-in session for recommendation feedback. Clicking Avoid sends Not interested and channel feedback to YouTube through its interface. YouTube handles that feedback and account session under its own policies.

The manifest grants content-script access to YouTube pages so the control can appear when navigating into Shorts. The extension mounts and submits feedback only on desktop Shorts routes.

The My Activity host permission lets the popup find a feedback tab and communicate with the content script there. The script reads YouTube video feedback titles, channel names and video links only when the page is the YouTube user feedback view. Returned entries stay in popup/page memory and are not saved, synchronized or exported. Opening the popup may open a background Google feedback tab using your existing Google session. Sign-in and account verification stay on Google's page.

Removing one video clicks its native Google deletion control after your popup confirmation. Channel-only entries and other Google activity are excluded. The extension does not offer a bulk reset. Google may require further confirmation in its own tab.
