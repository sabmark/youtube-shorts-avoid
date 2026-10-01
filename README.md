# YouTube Shorts Avoid

One button beside the desktop Shorts controls requests **Not interested**, then **Don't recommend channel**, then advances to the next Short when both actions are confirmed.

Use a signed-in YouTube account with the interface set to English. The extension needs no separate login. It stores no account data and has no backend or telemetry.

## Install locally

1. Keep the `extension` folder somewhere permanent. If using the ZIP, extract it first; choose the extracted folder that contains `manifest.json`.
2. In Chrome, open `chrome://extensions`. In Opera, open `opera://extensions`.
3. Turn on **Developer mode**, select **Load unpacked**, and choose that folder.
4. Reload YouTube, sign in, and open a desktop Short. Look for **Avoid** beside the action buttons.

If the source is inside WSL, open the extension folder in Windows File Explorer or copy it to a permanent Windows folder before choosing it in the browser. The browser's file picker needs a Windows-accessible path.

Click **Avoid** only on a video and channel you want to dismiss. Each click processes one Short. The status message reports confirmed actions and any reason the sequence stopped. Use YouTube's normal menu if a step cannot be completed automatically.

## Limits and verification

- Optional reasons are left unanswered. A required reason stops automation so you can choose it yourself.
- Missing options, unconfirmed feedback or a changed Short stop the sequence. If YouTube advances after the first action, the extension stops before applying channel feedback to the next video.
- A timeout can mean YouTube received feedback without showing a recognized confirmation. Check the result before trying again.
- Feedback influences recommendations; it cannot guarantee that similar videos will never appear.
- Automated tests and a signed-out rendered preview have been checked. Installed Chrome/Opera execution and the signed-in feedback sequence still need verification in your normal browser. See [the verification record](docs/testing.md).

For the first local check, pick a Short you actually want to dismiss. Confirm both feedback options exist, click Avoid, check the status and verify that the next Short appears once. If the extension stops, report its exact message and which browser you used.

## Remove or update

To remove it, open the browser's extensions page and choose **Remove** on YouTube Shorts Avoid. For an update, replace the files in the same permanent folder, click the extension's **Reload** button and reload YouTube.

## Development and packaging

Requires Node 22 or later and Python 3. Run `npm ci`, then `npm test`. Run `npm run package` to create `dist/youtube-shorts-avoid-0.1.0.zip` containing only the five runtime files. No build step is needed to load the `extension` folder.
