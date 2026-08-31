# Google Play TWA — Rootweave

**Live TWA project:** `android/` (Bubblewrap-shaped Gradle shell; not `android-twa/`)  
**Package id (locked by first Play upload):** `com.cortexdevelopments.rootweave`  
**Do not** create a second app as `com.bryanralston.rootweave`. Testers are already on the Cortex Developments listing. Package names cannot be changed.  
**Not** Manager Schedule Pro (`com.managerschedulebuilder.pro`). Never reuse that keystore.

**Version name:** `1.0.2` · **versionCode:** `3`  
**compileSdk / targetSdk:** **36** (Android 16) · **minSdk:** 21  
**App name / launcher:** Rootweave  
**Theme:** `#3A5A40` · **Start URL:** `https://bryanralston.github.io/rootweave/?store=play`

Trusted Web Activity around the live HTTPS PWA. Farm save stays on-device (`localStorage`). `?store=play` hides Gumroad coin packs.

Play policy (2026-08-14, in force **2026-08-31**): new apps and **updates** must target API **36+**. Existing apps targeting **34 or lower** are only offered to devices at or below that API — testers on newer phones see **"App not available"**. This tree targets **36**.

---

## Locked URLs

| Piece | Value |
|-------|--------|
| Host | `bryanralston.github.io` |
| Scope | `/rootweave/` |
| Start | `/rootweave/?store=play` |
| Full scope URL | `https://bryanralston.github.io/rootweave/` |
| Manifest | https://bryanralston.github.io/rootweave/manifest.webmanifest |
| Privacy | https://bryanralston.github.io/rootweave/legal/privacy.html |
| Terms | https://bryanralston.github.io/rootweave/legal/terms.html |
| Asset links (project path) | https://bryanralston.github.io/rootweave/.well-known/assetlinks.json |
| Asset links (Chrome lookup) | https://bryanralston.github.io/.well-known/assetlinks.json **(host root — currently 404)** |

Live Pages About: **`2026-08-29.playtwa`**. Project-path `assetlinks.json` is live but still has a dummy `00:00:…` fingerprint and package `com.cortexdevelopments.rootweave`.

### Digital Asset Links host-root caveat

Chrome looks up Digital Asset Links at **host root**, not `/rootweave/.well-known/`. Until host-root JSON matches Play **App signing** SHA-256, the TWA may show a Chrome custom-tab bar. That is **not** the same as Play Store **"App not available"** (country / testers / unpublished release / old `targetSdk`).

---

## Status (2026-08-30)

| Step | Status |
|------|--------|
| PWA on Pages (`manifest.webmanifest`, icons, legal, About `2026-08-29.playtwa`) | **Live** |
| TWA Gradle project `android/` | **On origin/main** (PR #141 + API 36 bump PR #142). Materialized on this machine. |
| `compileSdk` / `targetSdk` | **36 / 36** (was **35 / 35** on versionCode 1) |
| versionName / versionCode | **1.0.2 / 3** |
| `.well-known/assetlinks.json` (project path) | **Live** — dummy SHA-256; package `com.cortexdevelopments.rootweave` |
| Host-root assetlinks | **404** — must copy into `BryanRalston.github.io` after real SHA-256 |
| JDK 17 (`C:\Java\jdk17`) + Android SDK 36 | Present on this machine |
| Upload keystore | **Missing** — `C:\Users\bryma\rootweave-secrets\` has README only. Bryan creates it. Do not invent passwords. Do not copy Schedule Pro. |
| Signed `.aab` | **Not on this machine** (no keystore) |
| Unsigned `.aab` | Built locally if Gradle succeeds; also GitHub Actions artifact `rootweave-twa-unsigned-aab` on `main` |
| Play Console closed testing | **Live but crashing** — testers install **1.0.1 (2)** then die on `setLaunchHandlerClientMode`. Roll out signed **1.0.2 (3)**. See `PLAY_CONSOLE_CHECKLIST.md` |

### Local artifacts (do not commit)

| Item | Path |
|------|------|
| Unsigned AAB (this machine) | `android/app/build/outputs/bundle/release/app-release.aab` |
| Copy for Bryan | `android/app-release-unsigned.aab` (after build script) |
| Signed AAB (after Bryan's keystore) | `android/app-release-bundle.aab` |
| Keystore + passwords | `C:\Users\bryma\rootweave-secrets\` (**OUTSIDE** git) |
| Bubblewrap config | `%USERPROFILE%\.bubblewrap\config.json` |
| JDK | `C:\Java\jdk17` |

**Back up** `C:\Users\bryma\rootweave-secrets\` offline. Losing the upload keystore blocks updates with that upload key (Play App Signing can still mint the install cert).

---

## Why testers see "App not available"

Repo vs Play Console — **both**, but the Store message is almost always Console:

1. **Play Console (Bryan clicks)** — most likely:
   - `ontest-app@googlegroups.com` not on the Closed Testing tester list, or the list was not **SAVE**d
   - Closed Testing release not **published** / rollout not started
   - **Publishing overview** has pending changes (Publish / Send for review)
   - Country availability missing **Germany, United States, United Kingdom, Türkiye**
   - Testers opened Play search instead of the **opt-in link**, or used a Gmail not in the group
2. **Target API** — Play mailed 2026-08-30: old target API; requirement **2026-08-31**. Apps targeting **API 34 or lower** are hidden from newer devices. This source is **targetSdk 36 / versionCode 3**. If the listing still has an older AAB (PWABuilder 31–34, or versionCode 1–2), sign and roll out **this** bundle. VersionCode **2** (`1.0.1`) crashed on open: helper `2.6.1` + `androidx.browser:1.8.0` (`NoSuchMethodError: setLaunchHandlerClientMode`). **1.0.2 (3)** pins `androidx.browser:1.9.0`.
3. **Not** Digital Asset Links — missing SHA-256 / host-root 404 causes a Chrome URL bar, not "App not available".
4. **Not** a `com.bryanralston.rootweave` rebuild — that would be a **new** app; existing testers stay blocked.

---

## Do not re-init Bubblewrap

`android/` is the project. `scripts/noninteractive-twa-init.js` would wrap a second tree (`android-twa/`) under the wrong package. Do not run it.

`twa-manifest.json` already points `signingKey.path` at `C:\Users\bryma\rootweave-secrets\android.keystore` (file not created here).

---

## Build unsigned AAB (this machine)

```powershell
$env:JAVA_HOME = "C:\Java\jdk17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME = "C:\Users\bryma\AppData\Local\Android\Sdk"
cd C:\Users\bryma\rootweave
.\scripts\build-play-aab.ps1
```

Or:

```powershell
$env:JAVA_HOME = "C:\Java\jdk17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME = "C:\Users\bryma\AppData\Local\Android\Sdk"
cd C:\Users\bryma\rootweave\android
.\gradlew.bat bundleRelease --no-daemon
# unsigned: android\app\build\outputs\bundle\release\app-release.aab
```

GitHub Actions (`Android TWA` on `main`) also uploads `rootweave-twa-unsigned-aab`.

Play **rejects unsigned**. Stop here until Bryan creates the keystore.

---

## After Bryan creates the keystore

See `C:\Users\bryma\rootweave-secrets\README.md`. Then:

```powershell
$env:JAVA_HOME = "C:\Java\jdk17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd C:\Users\bryma\rootweave-secrets
keytool -genkeypair -v -keystore android.keystore -alias rootweave -keyalg RSA -keysize 2048 -validity 10000
# fill keystore.properties (storePassword / keyPassword) yourself
keytool -list -v -keystore android.keystore -alias rootweave
```

Copy upload-key **SHA-256** into `.well-known/assetlinks.json` (keep Play App signing SHA-256 as the second entry once Console shows it).

Sign the unsigned AAB:

```powershell
$props = @{}
Get-Content "C:\Users\bryma\rootweave-secrets\keystore.properties" | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') { $props[$Matches[1].Trim()] = $Matches[2].Trim() }
}
$env:JAVA_HOME = "C:\Java\jdk17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$aab = "C:\Users\bryma\rootweave\android\app\build\outputs\bundle\release\app-release.aab"
$signed = "C:\Users\bryma\rootweave\android\app-release-bundle.aab"
Copy-Item $aab $signed -Force
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 `
  -keystore $props['storeFile'] `
  -storepass $props['storePassword'] `
  -keypass $props['keyPassword'] `
  $signed $props['keyAlias']
```

Upload **`android/app-release-bundle.aab`** as Closed Testing release **1.0.2 (3)**.

---

## Play Console remaining steps (Bryan)

Exact click order: **`PLAY_CONSOLE_CHECKLIST.md`**.

After the signed AAB is on the track:

1. **Setup → App integrity / App signing** — copy **App signing key** SHA-256.
2. Replace the dummy fingerprint in `.well-known/assetlinks.json` (keep upload-key fingerprint).
3. Publish the **same** JSON at host root (`BryanRalston.github.io` repo).
4. Push Pages.

Verify: https://developers.google.com/digital-asset-links/tools/generator  
Package: `com.cortexdevelopments.rootweave`  
Domain: `bryanralston.github.io`

---

## Secrets policy

- Keystore and passwords live only under `C:\Users\bryma\rootweave-secrets\`
- Do **not** copy `C:\Users\bryma\schedule-builder-secrets\`
- Repo `.gitignore` blocks `*.keystore`, `keystore.properties`, `*.aab`, `*.apk`, `android/` build dirs
- `android/twa-manifest.json` `signingKey.path` is an absolute path on this machine; never commit a dummy keystore
