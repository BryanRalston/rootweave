# Digital Asset Links for the Rootweave TWA

JSON cannot hold comments, so the Play App Signing steps live here.

This repo file is served on GitHub Pages at:

`https://bryanralston.github.io/rootweave/.well-known/assetlinks.json`

Chrome / Play verify Digital Asset Links at the **host root**, not the project path:

`https://bryanralston.github.io/.well-known/assetlinks.json`

Copy the same `assetlinks.json` into the **user/org GitHub Pages repo** (`BryanRalston.github.io`) at `.well-known/assetlinks.json` so the host-root URL serves it. This rootweave repo cannot publish to `/` on `bryanralston.github.io`.

## Placeholder fingerprint

`00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00` is a dummy. Chrome will show a URL bar until the real Play App Signing SHA-256 is pasted.

## After the Play Console app exists (Cortex Developments)

1. Play Console → **Rootweave** (`com.cortexdevelopments.rootweave`) → **Setup → App integrity → App signing**.
2. Copy **App signing key certificate** SHA-256 (colon-separated hex).
   - Use the **app signing** cert, not the upload key, once Play App Signing is on (default for new apps).
3. Replace the placeholder string in `assetlinks.json` (this repo **and** the host-root copy).
4. Confirm `Content-Type` is `application/json` and the file is reachable without a redirect that drops the path.
5. Optional check: [Google's statement list tester](https://developers.google.com/digital-asset-links/tools/statement-list) against `https://bryanralston.github.io`.

Do **not** put Manager Schedule Pro (`com.managerschedulebuilder.pro`) fingerprints in this file.
