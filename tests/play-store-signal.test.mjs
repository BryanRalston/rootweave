/**
 * Probe: paid coin packs are hidden on web and Play. store=play still
 * marks the TWA channel. Coins stay earnable. Optional support never grants.
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
const terms = fs.readFileSync(path.join(root, 'legal/terms.html'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'legal/privacy.html'), 'utf8');

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

function supportModal() {
  return html.slice(html.indexOf('function openPlayStoreSupport'), html.indexOf('function openCoinShop'));
}

// --- store signal: explicit query only; packs hidden everywhere ---
check('web without store=play hides paid packs', () => {
  const ctx = runSignal('', false);
  assert.equal(ctx.isPlayStoreClient(), false);
  assert.equal(ctx.playStoreHidesCoinShop(), true);
  assert.equal(ctx.playStoreAllowsGumroadCoinCheckout(), false);
  assert.equal(ctx.playStoreAllowsGrantCoinPack(), false);
});

check('mobile-looking query without store=play is not the Play channel', () => {
  const ctx = runSignal('?source=pwa&utm_source=android', false);
  assert.equal(ctx.isPlayStoreClient(), false);
  assert.equal(ctx.playStoreHidesCoinShop(), true);
});

check('store=play marks TWA and still blocks coin checkout + grant', () => {
  const ctx = runSignal('?store=play', false);
  assert.equal(ctx.isPlayStoreClient(), true);
  assert.equal(ctx.playStoreHidesCoinShop(), true);
  assert.equal(ctx.playStoreAllowsGumroadCoinCheckout(), false);
  assert.equal(ctx.playStoreAllowsGrantCoinPack(), false);
});

check('store=play persists in session so a later URL without the query still marks Play', () => {
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
check('grantCoinPack refuses whenever packs are disallowed', () => {
  assert.match(html, /function grantCoinPack[\s\S]*?playStoreAllowsGrantCoinPack/);
});

check('maybeGrantCoinPack strips pack and returns', () => {
  assert.match(html, /function maybeGrantCoinPack\(\)\{[\s\S]*?playStoreAllowsGrantCoinPack[\s\S]*?stripPlayQueryParam\('pack'\)/);
});

check('openCoinShop routes to optional support (no pack checkout)', () => {
  assert.match(html, /function openCoinShop\(\)\{\s*if\(typeof playStoreHidesCoinShop/);
  const playModal = supportModal();
  assert.doesNotMatch(playModal, /rootweave-coins-80|rootweave-coins-200|Buy \$1\.99|Buy \$4\.99/);
  assert.doesNotMatch(playModal, /<h2>💛 Coin shop<\/h2>/);
  assert.match(playModal, /does not add coins/);
  assert.match(playModal, /40 coins/);
});

check('no paid pack checkout UI on web or Play', () => {
  assert.doesNotMatch(html, /<h2>💛 Coin shop<\/h2>/);
  assert.doesNotMatch(html, /Buy \$\{p\.price\}|Buy \$1\.99|Buy \$4\.99/);
  assert.doesNotMatch(html, /class="shopbuy"[^>]*rootweave-coins/);
});

check('About keeps a quiet optional-support link, not a coin shop', () => {
  assert.match(html, /id="aboutSupportLink"/);
  assert.match(html, /Optional support is a tip only/);
  assert.doesNotMatch(html, /Optional packs live in the/);
  const about = html.slice(html.indexOf('function openAboutCredits'), html.indexOf('function hasAnyCampaignProgress'));
  assert.doesNotMatch(about, /data-act="coinshop"/);
  assert.match(about, /supportFarmHref\(\)/);
  assert.match(html, /ralstonia5\.gumroad\.com\/l\/oehmly/);
});

// --- first session still free ---
check('Home Patch still starts at 40 coins', () => {
  assert.match(html, /id:'home', name:'Home Patch'[\s\S]*?coins:40/);
});

check('HUD Support is hidden (About/Support only)', () => {
  assert.match(html, /#btnSupport\{display:none !important/);
  assert.match(html, /body\.tut-open #btnSupport/);
});

check('no purchase gate on splash go', () => {
  assert.match(html, /act==='splashgo'[\s\S]{0,80}enterLevel\(0, true\)/);
});

check('land-deed copy does not push a coin shop', () => {
  assert.doesNotMatch(html, /optional coin shop/);
  assert.doesNotMatch(html, /surplus from play or the coin shop/);
  assert.match(html, /surplus from the stand and harvests/);
});

// --- ship versions + TWA identity ---
check('SHIP_BUILD and CACHE bump together', () => {
  assert.match(html, /const SHIP_BUILD = '2026-09-08\.freeplay'/);
  assert.match(sw, /const CACHE = 'rootweave-2026-09-08\.freeplay'/);
});

check('TWA version is 1.0.4 / 5 and browser 1.9.0', () => {
  assert.match(gradle, /versionCode 5/);
  assert.match(gradle, /versionName "1\.0\.4"/);
  assert.match(gradle, /androidx\.browser:browser:1\.9\.0/);
  assert.doesNotMatch(gradle, /androidx\.browser:browser:1\.8\.0/);
  const twa = fs.readFileSync(path.join(root, 'android/twa-manifest.json'), 'utf8');
  assert.match(twa, /"appVersionName": "1\.0\.4"/);
  assert.match(twa, /"appVersionCode": 5/);
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

check('legal copy: packs not sold; PWYW does not grant coins', () => {
  assert.match(terms, /Paid coin packs are not sold/);
  assert.match(terms, /does <strong>not<\/strong> grant coins/);
  assert.match(privacy, /does <strong>not<\/strong> grant coins/);
  assert.doesNotMatch(terms, /Seed pouch, Crate/);
  assert.doesNotMatch(privacy, /pack coins are granted locally/);
});

check('no ads / no Play Billing', () => {
  assert.doesNotMatch(html, /BillingClient|com\.android\.vending\.BILLING|play-billing/);
  assert.doesNotMatch(gradle, /com\.android\.vending\.BILLING|billingclient/);
});

// --- grantCoinPack runtime: never credits ---
check('grantCoinPack runtime: web and Play never credit', () => {
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
  webLoc.__camp = { pendingShopCoins: 0, grantedPacks: {} };
  vm.runInNewContext(harness, webLoc, { filename: 'grant-web.js' });
  assert.equal(webLoc.grantCoinPack(pack), false);
  assert.equal(webLoc.__camp.pendingShopCoins, 0);
});

if (failures.length) {
  console.error('FAIL');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('ok  play-store-signal: packs hidden on web+Play; no grant; Home Patch 40 coins');
