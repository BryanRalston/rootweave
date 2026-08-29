# 🌱 Rootweave

**Heal a dying valley, field by field** — an isometric regenerative-farming game. Dust where wheat once stood, muddy water, empty skies. Bring the land, the river, and the wildlife back through real farm ecology turned into play.

**▶ Play (live):** https://bryanralston.github.io/rootweave/

New player: splash → **Wake the Home Patch** → dead gray ground → 🪣 compost → ▶️ play → one 🌽 plant. The 🎯 strip is **0/3**. Returning saves still open the journey map. Hard-refresh (`Ctrl+Shift+R`) if you had an older tab.

---

## Thesis

Rootweave is not a cash-crop clicker. **Diversity builds soil. Compost and pioneers wake dead ground. Cattle then chickens supercharge the pasture. Trees on the banks clean the river.** The fantasy and the mechanics are the same story: regenerate what was lost.

---

## What you get

- **Campaign journey** — Home Garden → paddocks, creek, dust flats, orchard, market, homestead, whole valley  
- **Live sim** — pause / speed, seasons, soil & runoff overlays, region goals, shop unlocks  
- **Homestead** — bank surplus into yard kits, house tiers, and cottage rooms  
- **Touch + desktop** — drag pan, pinch/wheel zoom; keyboard: Space pause · Esc back · 1–9 tools · R turn fence · +/- zoom  
- **Self-contained** — single `index.html` + `sprites/` webp (and tracked interior art). No build step. No accounts.

---

## Local play

```bash
# From repo root — open in a browser (or any static server)
start index.html   # Windows
# open index.html  # macOS
```

GitHub Pages serves **repo root `index.html`**, not `public/` (that folder is local-only).

---

## Controls (one line)

**Paint tools on the palette · ⏸️/⏩ time · 🗺️ Journey map · 🛒 Shop · inspect a tile for the soil story · Space / Esc on desktop.**

---

## Ship notes (for Bryan)

- Freeze / deploy checklist: `scripts/playtest/SHIP_FREEZE.md`, `DEPLOY_PACKAGE.md` (gitignored QA docs)  
- Outdoor heroes load **webp** on Pages (`.png` is gitignored)  
- Agents do not push; Bryan commits + deploys `main` → Pages `/ (root)`
- Play closed-test TWA (Cortex Developments): `android/PLAY_LISTING.md` — package `com.cortexdevelopments.rootweave`, start URL `?store=play`. Do not touch Manager Schedule Pro (`com.managerschedulebuilder.pro`).

Built with Cortex.
