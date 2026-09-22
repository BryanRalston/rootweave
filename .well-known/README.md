# Digital Asset Links for the Rootweave TWA

JSON cannot hold comments, so the Play App Signing steps live here.

This repo file is served on GitHub Pages at:

`https://bryanralston.github.io/rootweave/.well-known/assetlinks.json`

Chrome / Play verify Digital Asset Links at the **host root**, not the project path:

`https://bryanralston.github.io/.well-known/assetlinks.json`

Copy the same `assetlinks.json` into the **user/org GitHub Pages repo** (`BryanRalston.github.io`) at `.well-known/assetlinks.json` so the host-root URL serves it. This rootweave repo cannot publish to `/` on `bryanralston.github.io`.

## Fingerprints

`assetlinks.json` lists two SHA-256 certs for `com.cortexdevelopments.rootweave`:

1. Play App signing key (`7F:1E:A9:64…`)
2. Upload key (`02:E0:A7:12…`)

Copy the same file to the host-root Pages repo when that copy is still the old placeholder.

## Checks

1. Confirm `Content-Type` is `application/json` and the file is reachable without a redirect that drops the path.
2. Optional check: [Google's statement list tester](https://developers.google.com/digital-asset-links/tools/statement-list) against `https://bryanralston.github.io`.

Do **not** put Manager Schedule Pro (`com.managerschedulebuilder.pro`) fingerprints in this file.
