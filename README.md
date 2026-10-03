# YouTube Shorts Avoid

<img src="assets/logo.svg" alt="Shorts Avoid logo: a play symbol with a minus badge" width="72" height="72">

[![Checks](https://github.com/sabmark/youtube-shorts-avoid/actions/workflows/ci.yml/badge.svg)](https://github.com/sabmark/youtube-shorts-avoid/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/sabmark/youtube-shorts-avoid)](https://github.com/sabmark/youtube-shorts-avoid/releases/latest)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

One button beside the desktop Shorts controls requests **Not interested**, then **Don't recommend channel**, then advances to the next Short when both actions are confirmed.

Use a signed-in YouTube account with the interface set to English. The extension needs no separate login. It stores no account data and has no backend or telemetry.

Works in **Chrome and Opera**, confirmed by the project owner. Desktop YouTube Shorts with an English interface is the supported starting point.

## Download and install

Download [youtube-shorts-avoid-0.1.3.zip](https://github.com/sabmark/youtube-shorts-avoid/releases/download/v0.1.3/youtube-shorts-avoid-0.1.3.zip) from the [latest release](https://github.com/sabmark/youtube-shorts-avoid/releases/latest). The release includes a SHA-256 checksum file. Installation uses the browser's Load unpacked feature; a store installation is not available.

1. Keep the `extension` folder somewhere permanent. If using the ZIP, extract it first; choose the extracted folder that contains `manifest.json`.
2. In Chrome, open `chrome://extensions`. In Opera, open `opera://extensions`.
3. Turn on **Developer mode**, select **Load unpacked**, and choose that folder.
4. Reload YouTube, sign in, and open a desktop Short. Look for **Avoid** beside the action buttons.

If the source is inside WSL, open the extension folder in Windows File Explorer or copy it to a permanent Windows folder before choosing it in the browser. The browser's file picker needs a Windows-accessible path.

## Use

Click **Avoid** or press **Right Arrow** only on a video and channel you want to dismiss. Each activation processes one Short. The shortcut ignores editable fields and modified keypresses; holding the key does not repeat the action. The button is disabled while feedback is pending. The extension shows no progress, completion or error notifications. YouTube's own feedback notices remain visible. Use YouTube's normal menu if a step cannot be completed automatically.

If YouTube opens Tell us why, the extension chooses **Other** when available, otherwise the first supported option. It submits once if the dialog has a confirmation button.

## Limits and verification

- During this activation's Not interested step, an opened reason dialog selects **Other** if available, otherwise the first supported choice, then submits if needed. Optional Tell us why links are left alone. A pre-existing or later dialog, unsupported choice or request for extra typed input stops automation.
- Missing options, unconfirmed feedback or a changed Short stop the sequence. If YouTube advances after the first action, the extension stops before applying channel feedback to the next video.
- If the button becomes enabled without advancing, YouTube may have received feedback without showing a recognized confirmation. Check YouTube's native feedback notices and the current Short before trying again.
- After both confirmations, the extension waits up to four seconds for YouTube to advance before using Next. Unusually late native navigation could still cause an extra skip; check this timing in your normal browser.
- Feedback influences recommendations; it cannot guarantee that similar videos will never appear.
- The installed extension passed a signed-in Chrome test: Other was selected, both feedback actions were confirmed and YouTube advanced once. The owner then tested Chrome and Opera and reported both working. See [the verification record](docs/testing.md).

For the first local check, pick a Short you actually want to dismiss. Confirm both feedback options exist, click Avoid, check YouTube's feedback notices and verify that the next Short appears once. If the extension stops, report what happened and which browser you used.

## Remove or update

To remove it, open the browser's extensions page and choose **Remove** on YouTube Shorts Avoid. For an update, replace the files in the same permanent folder, click the extension's **Reload** button and reload YouTube.

## Development and packaging

Requires Node 22 or later and Python 3:

```sh
git clone https://github.com/sabmark/youtube-shorts-avoid.git
cd youtube-shorts-avoid
npm ci
npm test
npm run package
```

The package command creates `dist/youtube-shorts-avoid-0.1.4.zip` containing the nine runtime files and MIT license notice. No build step is needed to load the `extension` folder.

The DOM adapter lives in `extension/src/youtube.js`, the guarded sequence in `workflow.js`, and the button in `content.js`. Tests run the real scripts against synthetic DOM fixtures. GitHub Actions runs the full suite and verifies packaging on pushes and pull requests.

## Project information

- [Changelog](CHANGELOG.md)
- [Privacy](PRIVACY.md): no backend, telemetry or account-data storage.
- [Contributing](CONTRIBUTING.md)
- [Report an issue](https://github.com/sabmark/youtube-shorts-avoid/issues)
- [MIT license](LICENSE)

This is an independent project and is not affiliated with YouTube or Google.
