# Opera Add-ons submission

## Status

Opera publication is pending. The owner signed in on October 6, 2026, and Opera accepted the v0.1.25 ZIP as item `307234`, extension ID `lgbbfbjhoalamalmfajkfpolefnmjklc`. The owner approved submission, and Opera confirmed `submitted_for_moderation: true` on October 6. Dashboard: https://addons.opera.com/developer/package/307234/.

The submission contains the English summary, description and changelog, support and public source-code links, build instructions, MIT license URL, privacy policy URL, 64x64 icon and two Opera screenshots. Opera returned no package or dependency warnings. The dashboard now directs the owner to the conversation with moderators for the current review status. Approval and a public installation link remain pending.

Chrome Web Store version 0.1.25 is already public: https://chromewebstore.google.com/detail/shorts-avoid-for-youtube/capdpopadgbflaoklceadlimohpcmopm.

## Package and assets

- Source: `884dda0`; extension version 0.1.25, Manifest V3.
- Build: `npm test`, then `npm run package`.
- Accepted draft package: `dist/youtube-shorts-avoid-0.1.25.zip`, SHA-256 `0f030750526a4dc0133dabff82ba94ce5ba1bc72c57c6bfd607789a33c044c2a`. The upload parser accepted this Manifest V3 package; moderation and live Opera behavior are separate checks. Runtime files match the Chrome submission source at `885e254`.
- Full suite on October 6, 2026: 103 passed, zero failed.
- Opera store icon: `store/opera-icon64.png`, 64x64 PNG rasterized from the approved `assets/logo.svg` with transparent padding.
- Screenshots: `store/screenshots/opera-settings-light.png` and `store/screenshots/opera-settings-dark.png`, each 1280x1400, captured from the installed extension's Options page in Opera 136.0.6008.80 on Linux. The captured browser identified itself as `OPR/136.0.0.0`. Both screenshots show the default feedback and shortcuts.
- Opera's Media page requires a 64x64 icon and screenshots taken in Opera. The Chromium screenshots prepared for Chrome are not used for this listing.

## Listing fields

Name: Shorts Avoid for YouTube.

Language: English.

Summary: Avoid or Like desktop Shorts and move on, using buttons or custom keyboard and mouse shortcuts.

Description: use the Detailed description in [the Chrome listing](chrome-web-store.md#detailed-description). It explains all three Avoid modes, immediate Like-and-next, configurable shortcuts, the toolbar menu, local preferences, and the signed-in English desktop YouTube requirement.

Homepage: https://github.com/sabmark/youtube-shorts-avoid

Opera's Service website URL field is left blank because this independent project does not own YouTube or develop on its behalf. The public source-code field points to https://github.com/sabmark/youtube-shorts-avoid/tree/885e254bc82edfb7f161b553acf2204fb7930eb8.

Support: https://github.com/sabmark/youtube-shorts-avoid/issues

Privacy policy: https://github.com/sabmark/youtube-shorts-avoid/blob/885e254bc82edfb7f161b553acf2204fb7930eb8/PRIVACY.md

The extension stores shortcut and feedback preferences locally. It has no backend, analytics, telemetry or remote JavaScript. YouTube receives the viewer's feedback and Like actions through its own interface. Use the permission explanations and reviewer steps in [the Chrome submission notes](chrome-web-store.md#privacy-fields), adapting only the browser-specific installation instructions.

## Verification and next step

1. Saved listing fields and assets were verified in the owner's Opera developer account. The General category is Fun; automatic moderation is disabled.
2. Both screenshots, the 64x64 icon, support/source links, build instructions, MIT license URL and privacy policy URL were confirmed in the saved submission.
3. Review the exact package and listing fields. Installed Opera Options loaded successfully, saved the channel-only feedback preference and retained it after reload, then restored Both for the screenshots. Left and Right defaults were confirmed. Existing owner acceptance covers Chrome and Opera behavior; this session did not retest signed-in Shorts feedback or native popup behavior.
4. The owner approved the concrete Opera submission through Relayframe, and Submit changes completed successfully on October 6.
5. Check the conversation with moderators for the review outcome. Address feedback if required, and add a public installation link to README only after publication is verified.

## Requirements checked

Opera's [acceptance criteria](https://help.opera.com/en/extensions/acceptance-criteria/) require a single purpose, an accurate name and description, useful functionality, relevant support links, bundled JavaScript, reviewable code and necessary permissions. The [publishing guidelines](https://help.opera.com/en/extensions/publishing-guidelines/) could not be fetched through the web tool during this check; package and asset requirements remain to be confirmed in the dashboard.
