# Play Console — Bryan only (Closed Testing unblock)

You cannot finish Play from the CLI. Everything below is clicks. Testers (onTest, Turgay U.) currently **crash on open** on **1.0.1 (2)**. Roll out signed **1.0.2 (3)**.

**Play Console account:** Cortex Developments  
**Package name (exact, cannot change):** `com.cortexdevelopments.rootweave`  
**Do not** create `com.bryanralston.rootweave` — that would be a second app; existing testers stay blocked.  
**Do not** upload under Manager Schedule Pro.

**App name:** Rootweave  
**Type:** Game · **Category:** Simulation (or Casual) · **Free** (no IAP in this TWA)

**AAB to sign then upload** (unsigned on disk — Play rejects unsigned):

```
C:\Users\bryma\rootweave\android\app-release-unsigned.aab
C:\Users\bryma\rootweave\android\app\build\outputs\bundle\release\app-release.aab
```

| Field | Value |
|--------|--------|
| versionName | `1.0.2` |
| versionCode | `3` |
| compileSdk / targetSdk | **36** (Android 16) |
| minSdk | 21 |
| applicationId | `com.cortexdevelopments.rootweave` |

Listing pack: `android/PLAY_LISTING.md`  
Privacy: `https://bryanralston.github.io/rootweave/legal/privacy.html`  
Live PWA: `https://bryanralston.github.io/rootweave/` (About **`2026-08-29.playtwa`**)

Keystore (Bryan creates; do not invent passwords): `C:\Users\bryma\rootweave-secrets\` — see that README. Then sign to:

```
C:\Users\bryma\rootweave\android\app-release-bundle.aab
```

---

## Why "App not available" (read this first)

The Store message is **almost never** Digital Asset Links. DAL failure = Chrome URL bar inside the TWA.

Typical causes, in the order testers actually hit them:

1. Tester Google account not on the Closed Testing list, **or the list was edited and not SAVE'd**
2. Closed Testing release not published / rollout not started
3. **Publishing overview** still has pending changes
4. Country / region does not include the tester's Play country (**DE / US / UK / TR**)
5. App on the track still targets **API 34 or lower** (Play policy 2026-08-31 hides it from newer phones)
6. Tester used Play search instead of the **opt-in URL**, or a different Gmail than the one in `ontest-app@googlegroups.com`

Sign and roll out **1.0.2 (3)** (targetSdk 36, browser 1.9.0 crash fix), then do the clicks below **in order**.

---

## Click order (do these now)

Play Console → app **Rootweave** (`com.cortexdevelopments.rootweave`). If the app does not exist yet, create it first (name Rootweave, Game, Free) — first AAB sets the package.

### 1. Add onTest and SAVE the tester list

1. Left rail **Testing → Closed testing**
2. Open the closed track (create **Closed testing** if missing)
3. **Testers** tab
4. Email lists / Google Groups → add **`ontest-app@googlegroups.com`**
5. Also add your own Gmail if it is not already there
6. Click **Save** (or **Save changes**) — leaving the page without Save drops testers
7. Copy the **opt-in URL** (Copy link). Testers must open this while signed into a group account **before** Install

### 2. Countries — DE, US, UK, Türkiye

1. **Test track countries** on the same Closed testing page (and **Setup → Country availability** if the form is there)
2. Include at least:
   - Germany
   - United States
   - United Kingdom
   - Türkiye (listed as Turkey / Turkiye in some UIs)
3. Save

onTest devices are not all US. Missing TR/DE/UK is enough for **"App not available."**

### 3. Upload the signed targetSdk 36 AAB and publish the Closed Testing release

1. Create the upload keystore if it does not exist (`C:\Users\bryma\rootweave-secrets\README.md`), then sign the unsigned AAB (commands in `PLAY_TWA.md`)
2. **Testing → Closed testing → Create new release** (or **Edit release**)
3. Upload **`android/app-release-bundle.aab`** (signed). Play will refuse the unsigned file
4. Release name: `1.0.2 (3)` — must be **versionCode 3** or higher than whatever is already on the track (2 is the crashing closed-test build)
5. Release notes (short): `Fix instant open crash (TWA browser 1.9.0). Target Android 16 (API 36).`
6. **Next → Save → Review release → Start rollout to Closed testing**
7. Confirm the track shows **Available** / published, not Draft

If versionCode 3 is already used on the track, bump `android/app/build.gradle` `versionCode` and rebuild before uploading.

### 4. Publishing overview — no pending changes

1. Left rail **Publishing overview** (sometimes under **Release**)
2. If the banner says changes are waiting:
   - **Send for review** and/or **Publish**
3. Stay until the page shows **no pending changes**
4. Closed-test apps still need listing, privacy policy, Data safety, and IARC **complete** or Play hides the install

Quick content checks (if any card is still grey):

| Card | Answer |
|------|--------|
| Store listing | Copy from `android/PLAY_LISTING.md`; icon + feature graphic + 2 Home Patch screenshots in `android/listing/` |
| Privacy policy | `https://bryanralston.github.io/rootweave/legal/privacy.html` |
| Ads | **No** |
| Data safety | No account server. Farm is on-device. If forced: on-device app info only, **not shared** |
| IARC / content rating | Game / simulation; no violence, ads, gambling, UGC; **not** designed for under-13 |
| Target audience | Not primarily children |

### 5. Send testers the opt-in link (not a Play search URL)

Email onTest:

- Opt-in URL from Closed testing
- They must use a Google account that is a member of `ontest-app@googlegroups.com`
- After opt-in, install from the Play listing that the link opens
- If they still see "App not available": confirm Play country is DE/US/UK/TR and they finished opt-in on that same account

---

## 6. After the AAB is on the track — App Signing SHA-256

1. **Setup → App integrity** (or **App signing**)
2. Copy **App signing key certificate** SHA-256 (colon-separated)
3. Put it in `.well-known/assetlinks.json` (replace `00:00:…`; keep the upload-key fingerprint as a second entry)
4. Publish the **same** JSON at **host root** `https://bryanralston.github.io/.well-known/assetlinks.json` (user Pages repo `BryanRalston.github.io` — this repo cannot serve `/`)
5. Push Pages. Until host-root matches, Chrome may show a URL bar; the farm still loads

Verify: https://developers.google.com/digital-asset-links/tools/generator  
Package: `com.cortexdevelopments.rootweave`  
Domain: `bryanralston.github.io`

---

## What this machine cannot do

- Google login / Play Console
- Creating or saving the tester list
- Publishing overview / country checkboxes
- A real keystore password
- Host-root Pages (`BryanRalston.github.io`)

Unsigned AAB is ready. Signed upload is blocked on the keystore.
