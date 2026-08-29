# Rootweave — Google Play closed test (Cortex Developments)

Publisher: **Cortex Developments**  
Package: **`com.cortexdevelopments.rootweave`**  
App name: **Rootweave**  
Do **not** create or upload this under Manager Schedule Pro (`com.managerschedulebuilder.pro`).

This document is the listing pack + the Play Console taps Bryan must do. A closed-test track and opt-in link **do not exist until you create them** in Play Console. This PR does not claim they exist.

---

## Listing copy (paste into Play Console)

**Title** (max 50):  
Rootweave

**Short description** (max 80):  
Heal a dying valley. Regenerative farm. Play free. No ads.

**Full description:**

Rootweave is a regenerative-farming game. The valley is dying — dust where wheat once stood, a dry creek, a muddy river. Your journey home starts small, one little plot at a time, and ends with the whole valley alive again.

Play is free. No ads. The first session is Home Patch by the house: wake dead ground, compost, plant. You start with 40 coins. No purchase is required to open the live farm or finish that first session.

Feed the dead ground, plant many kinds, move the animals, shelter the water — and life returns, field by field.

This closed test is a Trusted Web Activity of the live game at https://bryanralston.github.io/rootweave/

Coin packs are not sold in this Play app (Play Billing is not in this build). Optional support, if you want it, lives on the website and does not add coins here.

**Category:** Games → Simulation (or Casual)  
**Content rating:** Everyone (IARC questionnaire — no violence, no ads, no user-generated chat)  
**Privacy policy:** `https://bryanralston.github.io/rootweave/legal/privacy.html`  
**Store listing contact:** Cortex Developments / Bryan Ralston

---

## Graphics (do not use padlock / journey-map-locks shots)

| Asset | Spec | Source in this pack |
| --- | --- | --- |
| High-res icon | 512 × 512 PNG | `listing/icon-512.png` (same bytes as live Pages `icons/icon-512.png`) |
| Feature graphic | 1024 × 500 | `listing/feature-graphic-1024x500.png` — cropped from `sprites/title_farm.webp` (farm painting only, no HUD). |
| Phone screenshots | 2–4, 16:9 or 9:16 | `listing/03-home-patch-tutorial.png` (9:16) and `listing/04-home-patch-landscape.png` (16:9): Home Patch first session, 🪙40. **Not** a padlock map. |

If you have better phone captures, replace these. Do not upload journey-map lock / fog padlock screenshots.

---

## What the TWA opens

- Start URL: `https://bryanralston.github.io/rootweave/?store=play`
- Host: `bryanralston.github.io`, path `/rootweave/`
- `?store=play` hides the Gumroad coin shop. Ordinary mobile Chrome/Safari on github.io **without** that query still show the web shop.
- First session: splash → Wake Home Patch → 40 coins. Support stays after the tutorial (existing gate) and does not sell packs.

---

## Closed-test steps (you do these — like MSP)

A closed-test track is **not** created by this PR. You create it.

1. **Play Console** (account: Cortex Developments) → **Create app**.
   - App name: Rootweave  
   - Default language: English (US)  
   - App or game: Game  
   - Free  
   - Declarations: you confirm the policies you actually meet (no ads in this build).
2. **Create the app** with package **`com.cortexdevelopments.rootweave`**.
   - If Play asks for package on first AAB upload, the AAB’s `applicationId` sets it. Do not reuse MSP’s package.
3. Fill **Store listing** from the copy above. Upload 512 icon, feature graphic, 2–4 Home Patch screenshots.
4. **App content:** privacy policy URL, ads = **No**, target audience (not designed for children under 13; complete IARC — expect Everyone if you answer honestly), news / COVID / data safety (no collected data beyond Play install).
5. **Assemble + sign an AAB** (see `README.md`). Gradle in this repo is enough; `./gradlew bundleRelease` was verified on a Linux JDK 21 + SDK 35 machine and produces an **unsigned** `app/build/outputs/bundle/release/app-release.aab` (~3.1 MB). Play will reject unsigned. Create **your** upload keystore (keep it; you need it for every update), then either fill `keystore.properties` and rebuild, or `jarsigner` the unsigned AAB. Upload the **signed** AAB to **Testing → Closed testing** (not Production). GitHub Actions on this PR can also emit the unsigned AAB as a workflow artifact.
6. **Create a closed testing track** (e.g. `closed` or `alpha`). Add yourself as a tester (email or Google Group), same pattern you use for Manager Schedule Pro.
7. Start the closed test. Play will give you an **opt-in URL** after review. That link does not exist until you start the track. Share it with testers; they must opt in, then install from Play.
8. **App integrity → App signing:** copy the **App signing key certificate SHA-256**.
9. Paste that SHA-256 into:
   - this repo: `.well-known/assetlinks.json` (replace the `00:00:…` placeholder)
   - **and** host root: `https://bryanralston.github.io/.well-known/assetlinks.json`  
     (copy into the `BryanRalston.github.io` user Pages repo — Chrome does not look at `/rootweave/.well-known/` for verification)
10. Ship those files to GitHub Pages. Until the host-root file matches Play App Signing, Chrome may show a URL bar (Custom Tab fallback). The farm still loads; fullscreen TWA needs the real cert.
11. Install from the closed-test listing, open the app, confirm Home Patch, 40 coins, no coin-pack checkout.

## What this PR does *not* do

- Does not create the Play app, closed track, or opt-in link.
- Does not implement Play Billing.
- Does not open Gumroad coin packs (`rootweave-coins-80` / `rootweave-coins-200`) from the Android app.
- Does not change leftover-hold / What’s new treadmill content.
- Does not touch Manager Schedule Pro or Harborline.
