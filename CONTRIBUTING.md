# Contributing

Open an issue to report a problem or propose a change. For a bug, include your browser and extension versions, YouTube interface language, YouTube's native feedback notices, and steps to reproduce. Say whether YouTube was signed in, but leave account names, cookies and credentials out of reports.

## Local checks

Use Node 22 or later and Python 3:

```sh
npm ci
npm test
npm run package
```

Load the `extension` directory unpacked in Chrome or Opera. After changing content scripts, reload the extension on the browser's extensions page and reload YouTube.

For behavior changes, add a failing regression using the real scripts and a small DOM fixture, then implement the fix. Keep feedback tied to the original Short, require fresh confirmation, and avoid repeated submissions or a second advance after YouTube navigates.

Check the full suite before opening a pull request. Describe the resulting behavior and how you verified it. Separate synthetic tests from live browser checks. Submit live recommendation feedback only for videos and channels you intend to dismiss.

YouTube can change its DOM without notice. Include the relevant public element structure when reporting an unsupported interface, with personal information removed.
