/**
 * Closed-test playfeel: tile states, one-day Play, journey unlock copy.
 * First session stays free. Paid coin packs stay hidden on web and Play.
 *
 * Run: node tests/closed-test-playfeel.test.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const gradle = fs.readFileSync(path.join(root, 'android/app/build.gradle'), 'utf8');

const failures = [];
function check(name, fn) {
  try {
    fn();
  } catch (err) {
    failures.push(`${name}: ${err.message}`);
  }
}

function extractFn(src, name) {
  const start = src.indexOf('function ' + name);
  assert.ok(start >= 0, 'missing function ' + name);
  let i = src.indexOf('{', start);
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error('unclosed function ' + name);
}

function loadTileHelpers() {
  const ctx = {
    LV: () => ({ id: 'home', regen: 2.6 }),
    pondNear: () => false,
    hydrateGraze: (g) => g,
    herdStock: (n) => n || 1,
    grazeStockN: () => 1,
    grazeThinMult: () => 1,
    hasFence: () => false,
    recalc: (t) => {
      const keys = ['om', 'structure', 'nutrients', 'water', 'microbial', 'erosion'];
      t.health = keys.reduce((a, k) => a + (t.soil[k] || 0), 0) / keys.length;
    },
  };
  const code = [
    extractFn(html, 'deadWakeNeed'),
    extractFn(html, 'deadWakeShown'),
    extractFn(html, 'tileIsSleeping'),
    extractFn(html, 'deadWakeFeedPerDay'),
    extractFn(html, 'deadWakeDaysLeft'),
    extractFn(html, 'readyInDaysLine'),
    extractFn(html, 'readyInDaysShort'),
    extractFn(html, 'pondRefuseLine'),
  ].join('\n');
  vm.runInNewContext(code, ctx, { filename: 'tile-helpers.js' });
  return ctx;
}

function deadTile(over = {}) {
  const soil = { om: 8, structure: 8, nutrients: 8, water: 8, microbial: 8, erosion: 8 };
  return Object.assign({ terrain: 'dead', feature: null, compost: 0, crop: null, graze: null, playerFed: 0, soil, health: 8 }, over);
}

check('tile helpers distinguish dead / sleeping / ready', () => {
  const h = loadTileHelpers();
  const dead = deadTile();
  assert.equal(h.tileIsSleeping(dead), false);
  assert.equal(h.readyInDaysLine(dead), 'Compost first');
  const sleeping = deadTile({ compost: 10, playerFed: 1, soil: { om: 10, structure: 10, nutrients: 10, water: 10, microbial: 10, erosion: 10 }, health: 10 });
  h.recalc(sleeping);
  assert.equal(h.tileIsSleeping(sleeping), true);
  const line = h.readyInDaysLine(sleeping);
  assert.match(line, /ready in \d+ day/);
  const ready = deadTile({ compost: 2, playerFed: 1, soil: { om: 24, structure: 24, nutrients: 24, water: 24, microbial: 24, erosion: 24 } });
  h.recalc(ready);
  assert.equal(h.deadWakeDaysLeft(ready), 0);
  assert.match(h.readyInDaysLine(ready), /ready now/);
});

check('pond refuse is precise', () => {
  const h = loadTileHelpers();
  assert.equal(h.pondRefuseLine({ terrain: 'pond' }), "That's pond water, not soil.");
  assert.equal(h.pondRefuseLine({ terrain: 'water' }), "That's river water, not soil.");
});

check('applyTool wires sleeping / pond toasts', () => {
  assert.match(html, /Still sleeping — /);
  assert.match(html, /Compost first/);
  assert.match(html, /pond water, not soil/);
  assert.match(html, /function playAdvanceOneDay/);
  assert.match(html, /flashDawnLabel/);
  assert.match(html, /paintValleyRouteMarks/);
  assert.match(html, /if\(!cv\.isConnected\)\{\s*if\(tries\+\+ < 80\) setTimeout\(paint, 40\);/);
});

check('Play is discrete one-day, not continuous speed', () => {
  assert.match(html, /function playAdvanceOneDay\(\)\{/);
  assert.match(html, /simStep\(DAY_LEN\)/);
  assert.match(html, /Play — advance one morning/);
  assert.doesNotMatch(
    html.slice(html.indexOf("getElementById('btnPause').addEventListener"), html.indexOf("getElementById('btnGoals')")),
    /state\.paused = !state\.paused/
  );
  assert.doesNotMatch(
    html.slice(html.indexOf("getElementById('btnSpeed').addEventListener"), html.indexOf("getElementById('btnGoals')")),
    /state\.speed = state\.speed>=3/
  );
});

check('Journey locked copy uses real unlock hint, not only mist', () => {
  assert.match(html, /Unlock by clearing/);
  assert.match(html, /toast\(`\$\{P\.name\} — \$\{hint/);
  const lockedGo = html.slice(html.indexOf("if(ms==='locked'){"), html.indexOf("journeyPick(P.lvIndex);"));
  assert.doesNotMatch(lockedGo, /still in mist/);
  assert.match(html, /vlab-hint/);
});

check('first session stays free; packs hidden', () => {
  assert.match(html, /id:'home', name:'Home Patch'[\s\S]*?coins:40/);
  assert.match(html, /playStoreHidesCoinShop\(\)\{ return true; \}/);
  assert.doesNotMatch(html, /BillingClient|com\.android\.vending\.BILLING|play-billing/);
  assert.match(gradle, /applicationId "com\.cortexdevelopments\.rootweave"/);
});

check('ship stamps move together', () => {
  assert.match(html, /const SHIP_BUILD = '2026-09-08\.freeplay'/);
  assert.match(sw, /const CACHE = 'rootweave-2026-09-08\.freeplay'/);
  assert.match(html, /What's new \(\$\{ver\}\)/);
  assert.match(html, /Play is one morning/);
  assert.match(html, /Coin packs are gone/);
});

if (failures.length) {
  console.error('FAIL');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('ok  closed-test-playfeel: tiles, one-day Play, journey unlock copy');
