/**
 * Probe: Play/TWA store=play hides the Gumroad coin shop; web without that
 * query keeps it. First session (Home Patch, 40 coins) stays free.
 *
 * Run: node tests/play-store-signal.test.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const listing = fs.readFileSync(path.join(root, 'android/PLAY_LISTING.md'), 'utf8');
const gradle = fs.readFileSync(path.join(root, 'android/app/build.gradle'), 'utf8');
const manifest = fs.readFileSync(path.join(root, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
const assetlinks = fs.readFileSync(path.join(root, '.well-known/assetlinks.json'), 'utf8');

const failures = [];
function check(name, fn) {
  try {
    fn();
  } catch (err) {
    failures.push(`${name}: ${err.message}`);
  }
}

function extractBlock(src, begin, end) {
  const a = src.indexOf(begin);
  const b = src.indexOf(end);
  assert.ok(a >= 0 && b > a, `missing ${begin} / ${end}`);
  return src.slice(a + begin.length, b);
}

function runSignal(search, sessionPlay) {
  const store = { play: sessionPlay ? 'play' : null };
  const ctx = {
    location: { search: search || '' },
    sessionStorage: {
      getItem: (k) => (k === 'rw_store_channel' ? store.play : null),
      setItem: (k, v) => {
        if (k === 'rw_store_channel') store.play = v;
      },
    },
    URLSearchParams,
  };
  const code = extractBlock(html, '/* PLAY_STORE_SIGNAL_BEGIN */', '/* PLAY_STORE_SIGNAL_END */');
  vm.runInNewContext(code, ctx, { filename: 'play-store-signal.js' });
  return ctx;
}

// --- store signal: explicit query only ---
check('web without store=play does not hide shop', () => {
  const ctx = runSignal('', false);
  assert.equal(ctx.isPlayStoreClient(), false);
  assert.equal(ctx.playStoreHidesCoinShop(), false);
  assert.equal(ctx.playStoreAllowsGumroadCoinCheckout(), true);
  assert.equal(ctx.playStoreAllowsGrantCoinPack(), true);
});

check('mobile-looking query without store=play still shows shop', () => {
  const ctx = runSignal('?source=pwa&utm_source=android', false);
  assert.equal(ctx.isPlayStoreClient(), false);
  assert.equal(ctx.playStoreHidesCoinShop(), false);
});

check('store=play hides shop and blocks Gumroad coin checkout + grant', () => {
  const ctx = runSignal('?store=play', false);
  assert.equal(ctx.isPlayStoreClient(), true);
  assert.equal(ctx.playStoreHidesCoinShop(), true);
  assert.equal(ctx.playStoreAllowsGumroadCoinCheckout(), false);
  assert.equal(ctx.playStoreAllowsGrantCoinPack(), false);
});

check('store=play persists in session so a later URL without the query still hides shop', () => {
  const first = runSignal('?store=play', false);
  assert.equal(first.isPlayStoreClient(), true);
  const persisted = runSignal('', true);
  assert.equal(persisted.isPlayStoreClient(), true);
  assert.equal(persisted.playStoreHidesCoinShop(), true);
});

check('signal helpers never inspect userAgent', () => {
  const block = extractBlock(html, '/* PLAY_STORE_SIGNAL_BEGIN */', '/* PLAY_STORE_SIGNAL_END */');
  assert.equal(/userAgent|navigator\.|iPhone/i.test(block), false);
});

// --- source gates ---
check('grantCoinPack refuses on Play', () => {
  assert.match(html, /function grantCoinPack[\s\S]*?playStoreAllowsGrantCoinPack/);
});

check('maybeGrantCoinPack strips pack and returns on Play', () => {
  assert.match(html, /function maybeGrantCoinPack\(\)\{[\s\S]*?playStoreAllowsGrantCoinPack[\s\S]*?stripPlayQueryParam\('pack'\)/);
});

check('openCoinShop routes to Play-safe Support (no pack URLs in that modal)', () => {
  assert.match(html, /function openCoinShop\(\)\{\s*if\(typeof playStoreHidesCoinShop/);
  const playModal = html.slice(html.indexOf('function openPlayStoreSupport'), html.indexOf('function openCoinShop'));
  assert.doesNotMatch(playModal, /rootweave-coins-80|rootweave-coins-200|Buy \$1\.99|Buy \$4\.99/);
  assert.doesNotMatch(playModal, /gumroad\.com/);
  assert.match(playModal, /does not sell coin packs/);
  assert.match(playModal, /40 coins/);
});

check('web coin shop still lists Gumroad packs', () => {
  assert.match(html, /https:\/\/ralstonia5\.gumroad\.com\/l\/rootweave-coins-80/);
  assert.match(html, /https:\/\/ralstonia5\.gumroad\.com\/l\/rootweave-coins-200/);
  assert.match(html, /<h2>💛 Coin shop<\/h2>/);
});

check('About credits hide coinshop act on Play only', () => {
  assert.match(html, /isPlayStoreClient\(\)\s*\n?\s*\?\s*'Optional support lives on the website/);
  assert.match(html, /data-act="coinshop"/);
});

// --- first session still free ---
check('Home Patch still starts at 40 coins', () => {
  assert.match(html, /id:'home', name:'Home Patch'[\s\S]*?coins:40/);
});

check('Support stays gated by existing tutorial CSS (tut-open)', () => {
  assert.match(html, /body\.tut-open #btnSupport/);
});

check('no purchase gate on splash go', () => {
  assert.match(html, /act==='splashgo'[\s\S]{0,80}enterLevel\(0, true\)/);
});

// --- ship versions + TWA identity ---
check('SHIP_BUILD and CACHE bump together', () => {
  assert.match(html, /const SHIP_BUILD = '2026-08-29\.playtwa'/);
  assert.match(sw, /const CACHE = 'rootweave-2026-08-29\.playtwa'/);
});

check('TWA package is Cortex Developments, not MSP', () => {
  assert.match(gradle, /applicationId "com\.cortexdevelopments\.rootweave"/);
  assert.doesNotMatch(gradle, /managerschedulebuilder|bryanralston\.rootweave/);
  assert.match(manifest, /bryanralston\.github\.io\/rootweave\/\?store=play/);
  assert.match(listing, /com\.cortexdevelopments\.rootweave/);
  assert.match(listing, /Closed testing/);
  const links = JSON.parse(assetlinks);
  assert.equal(links[0].target.package_name, 'com.cortexdevelopments.rootweave');
  assert.match(links[0].target.sha256_cert_fingerprints[0], /^00:00:/);
});

// --- grantCoinPack runtime on Play vs web ---
check('grantCoinPack runtime: Play never credits; web still can', () => {
  const camp = { pendingShopCoins: 0, grantedPacks: {} };
  const pack = { id: 'coins80', coins: 80 };
  const harness = `
    ${extractBlock(html, '/* PLAY_STORE_SIGNAL_BEGIN */', '/* PLAY_STORE_SIGNAL_END */')}
    var camp = globalThis.__camp;
    function creditShopCoins(n){ camp.pendingShopCoins = (camp.pendingShopCoins|0) + (n|0); }
    function save(){}
    function updateHUD(){}
    function toast(){}
    ${html.slice(html.indexOf('function grantCoinPack'), html.indexOf('function openPlayStoreSupport'))}
  `;
  const playLoc = { location: { search: '?store=play' }, sessionStorage: { getItem: () => null, setItem() {} }, URLSearchParams, console };
  playLoc.globalThis = playLoc;
  playLoc.__camp = { pendingShopCoins: 0, grantedPacks: {} };
  vm.runInNewContext(harness, playLoc, { filename: 'grant-play.js' });
  assert.equal(playLoc.grantCoinPack(pack), false);
  assert.equal(playLoc.__camp.pendingShopCoins, 0);

  const webLoc = { location: { search: '' }, sessionStorage: { getItem: () => null, setItem() {} }, URLSearchParams, console };
  webLoc.globalThis = webLoc;
  webLoc.__camp = camp;
  vm.runInNewContext(harness, webLoc, { filename: 'grant-web.js' });
  assert.equal(webLoc.grantCoinPack(pack), true);
  assert.equal(camp.pendingShopCoins, 80);
});

if (failures.length) {
  console.error('FAIL');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('ok  play-store-signal: web shop stays; store=play hides shop; no Gumroad coin grant; Home Patch 40 coins');
