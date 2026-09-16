/**
 * Feature map: standalone features.html + in-game full-screen view.
 * Meet Ready pattern — not a buried About dump. Current capabilities only.
 *
 * Run: node tests/feature-map.test.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const page = fs.readFileSync(path.join(root, 'features.html'), 'utf8');
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

function extractBlock(src, begin, end) {
  const a = src.indexOf(begin);
  const b = src.indexOf(end);
  assert.ok(a >= 0 && b > a, `missing ${begin} / ${end}`);
  return src.slice(a + begin.length, b);
}

function loadFeatureMap() {
  const block = extractBlock(html, '/* FEATURE_MAP_BEGIN */', '/* FEATURE_MAP_END */');
  const ctx = {};
  vm.runInNewContext(block + '\nthis.FEATURE_MAP = FEATURE_MAP;', ctx, { filename: 'feature-map.js' });
  return ctx.FEATURE_MAP;
}

check('SHIP_BUILD and CACHE stay on 2026-09-16.featuremap', () => {
  assert.match(html, /const SHIP_BUILD = '2026-09-16\.featuremap'/);
  assert.match(sw, /const CACHE = 'rootweave-2026-09-16\.featuremap'/);
  assert.match(sw, /\.\/features\.html/);
});

check('android versionCode was not bumped', () => {
  assert.match(gradle, /versionCode 5/);
  assert.match(gradle, /androidx\.browser:browser:1\.9\.0/);
});

check('features.html is a full page, not a stub', () => {
  assert.match(page, /<div class="fmap-kicker">Feature map<\/div>/);
  assert.match(page, /<h1>What's in Rootweave<\/h1>/);
  assert.match(page, /Current capabilities\. Not a roadmap\./);
  assert.match(page, /Named limits/);
  assert.match(page, /What this is not/);
  assert.match(page, /href="\.\/#features"/);
  assert.doesNotMatch(page, /coming soon|roadmap item|will add|planned/i);
});

check('in-game map is a full-screen view with hash path', () => {
  assert.match(html, /id="featuresMap"/);
  assert.match(html, /function openFeatureMap\(\)/);
  assert.match(html, /function closeFeatureMap\(\)/);
  assert.match(html, /location\.hash === '#features'/);
  assert.match(html, /location\.hash==='#features'/);
  assert.match(html, /aboutFeatureMap/);
  assert.match(html, /jFeatures/);
  assert.match(html, /data-act="features"/);
  assert.doesNotMatch(html, /function featureMapHtml\(\)/);
  assert.doesNotMatch(html, /id="featureMap"/);
});

check('About and Journey are entries, not the map dump', () => {
  const about = html.slice(html.indexOf('function openAboutCredits'), html.indexOf('function hasAnyCampaignProgress'));
  assert.match(about, /featureMapEntryHtml\(false\)/);
  assert.doesNotMatch(about, /featureMapPageHtml\(\)/);
  assert.match(about, /What's in Rootweave/);
  assert.match(html, /fmapKick\.id = 'jFeatures'/);
});

check('FEATURE_MAP copy matches features.html and stays current-only', () => {
  const M = loadFeatureMap();
  assert.equal(M.label, 'Feature map');
  assert.equal(M.title, "What's in Rootweave");
  assert.equal(M.lede, 'Current capabilities. Not a roadmap.');
  assert.equal(M.limits.kicker, 'Named limits');
  assert.equal(M.limits.title, 'What this is not');
  assert.match(M.limits.body, /Not a pay-to-win shop/);
  assert.match(M.limits.body, /No ads/);
  assert.match(M.limits.body, /No Play Billing/);
  assert.match(M.limits.body, /tip only/);
  for (const g of M.groups) {
    assert.ok(page.includes(g.kicker.replace(/&/g, '&amp;')), 'missing kicker ' + g.kicker);
    for (const it of g.items) {
      assert.ok(page.includes(it.title.replace(/&/g, '&amp;')), 'missing title ' + it.title);
      assert.ok(page.includes(it.body), 'missing body ' + it.title);
    }
  }
  assert.ok(page.includes(M.limits.body));
  const blob = JSON.stringify(M);
  assert.doesNotMatch(blob, /coming soon/i);
  assert.doesNotMatch(blob, /Harborline|Manager Schedule|MSP/i);
});

check('live systems claimed in the map actually exist', () => {
  assert.match(html, /id:'home', name:'Home Patch'/);
  assert.match(html, /tools:\['select','compost','covercrop','sisters'\]/);
  assert.match(html, /function playAdvanceOneDay\(\)/);
  assert.match(html, /\{id:'select',  em:'👆', name:'Inspect'/);
  assert.match(html, /paintValleyRouteMarks/);
  assert.match(html, /function leftoverStampFeelFor/);
  assert.match(html, /id:'field', name:'Back Paddock'/);
  assert.match(html, /\{id:'cattle'/);
  assert.match(html, /\{id:'chicken'/);
  assert.match(html, /\{id:'pond'/);
  assert.match(html, /function neighborStandUnlocked/);
  assert.match(html, /<h2>🛒 The Valley Shop<\/h2>/);
  assert.match(html, /function exportSaveFile/);
  assert.match(html, /function importSaveFile/);
  assert.match(html, /function campaignAllPlotsCleared/);
  assert.match(html, /store=play/);
  assert.doesNotMatch(html, /BillingClient|com\.android\.vending\.BILLING|play-billing/);
});

if (failures.length) {
  console.error('FAIL');
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log('ok  feature-map: features.html + in-game full-screen map; current capabilities only');
