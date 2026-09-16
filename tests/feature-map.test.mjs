/**
 * Feature Map: current capabilities only, reachable in-product and on-site.
 *
 * Run: node tests/feature-map.test.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const featuresPage = fs.readFileSync(path.join(root, 'features.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

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

const mapBlock = extractBlock(html, '/* FEATURE_MAP_BEGIN */', '/* FEATURE_MAP_END */');

const requiredPhrases = [
  'No ads.',
  'No real-money coin packs.',
  'Coins are earned by farming — harvest and the neighbor stand.',
  'Optional Support is a tip only. It does not add coins. On the web it opens an external page.',
  'First session is Home Patch: compost → wait → plant.',
  'Crops include Three Sisters (corn, beans, squash).',
  'Soil health is visible on the land and in overlays.',
  'Play advances one morning; waking beds show dawn.',
  'Plot goals track what this land needs.',
  'One continuous regenerative farm map.',
  'Tap a patch on Journey to walk that land.',
  'Leftover patches stay workable — tap them on Journey and keep farming.',
  'Dead, sleeping, awake, and pond beds read differently.',
  'Sleeping ground shows ready in X days.',
  'Wrong-tool taps explain (pond water is not soil; planting on sleeping ground says wait).',
  'After Home Patch, the neighbor stand by the house buys surplus harvest.',
  'Surplus meat sales shrink the herd (last of a kind stays).',
  'Play in the browser.',
  'Android closed-test wraps this same web app (Trusted Web Activity).',
];

const groups = [
  'Play free',
  'Your farm',
  'The valley',
  'Guidance',
  'Neighbors / market',
  'Platforms',
];

check('FEATURE_MAP lists current groups only', () => {
  for (const g of groups) assert.match(mapBlock, new RegExp(g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(mapBlock, /function openFeatureMap/);
  assert.match(mapBlock, /What you can do today\. Not a roadmap/);
});

check('in-game and features.html share the same capability lines', () => {
  for (const phrase of requiredPhrases) {
    assert.ok(mapBlock.includes(phrase), `index.html missing: ${phrase}`);
    assert.ok(featuresPage.includes(phrase), `features.html missing: ${phrase}`);
  }
});

check('no coming-soon padding in the capability list', () => {
  const itemsOnly = FEATURE_MAP_ITEMS();
  assert.doesNotMatch(itemsOnly, /coming soon|will add|planned|future plan/i);
  const pageItems = featuresPage.replace(/Not a roadmap\./g, '');
  assert.doesNotMatch(pageItems, /coming soon|will add|planned|future plan/i);
});

function FEATURE_MAP_ITEMS() {
  const items = [];
  const re = /items:\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(mapBlock))) items.push(m[1]);
  return items.join('\n');
}

check('in-product entry points exist', () => {
  assert.match(html, /id="jFeatures"/);
  assert.match(html, /id="ovFeatures"/);
  assert.match(html, /data-act="features" data-back="about"/);
  assert.match(html, /data-act="features" data-back="notes"/);
  assert.match(html, /data-act="features" data-back="splash"/);
  assert.match(html, /data-act="featuresback"/);
  assert.match(html, /location\.hash==='#features'/);
});

check('plot overlay filter keeps the Feature Map button visible', () => {
  const skips = html.match(/if\(b\.id==='ovFeatures'\)\{ b\.style\.display = ''; return; \}/g) || [];
  assert.equal(skips.length, 2, 'applyLevelUI and applyHomesteadUI must keep ovFeatures visible');
});

check('on-site page deep-links into the in-game panel', () => {
  assert.match(featuresPage, /href="\.\/#features"/);
  assert.match(featuresPage, /What's in Rootweave/);
  assert.doesNotMatch(featuresPage, /coming soon/i);
});

check('live systems the bullets depend on still exist', () => {
  assert.match(html, /id:'home', name:'Home Patch'/);
  assert.match(html, /name:'Three Sisters'/);
  assert.match(html, /function playAdvanceOneDay/);
  assert.match(html, /function readyInDaysLine/);
  assert.match(html, /pond water, not soil/);
  assert.match(html, /selling shrinks the herd/);
  assert.match(html, /function leftoverStampLevel/);
  assert.match(html, /playStoreHidesCoinShop\(\)\{ return true; \}/);
  assert.match(html, /does not add coins/);
});

check('ship stamps mention the Feature Map', () => {
  assert.match(html, /const SHIP_BUILD = '2026-09-16\.features'/);
  assert.match(sw, /const CACHE = 'rootweave-2026-09-16\.features'/);
  assert.match(html, /Feature Map/);
});

if (failures.length) {
  console.error('FAIL');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('ok  feature-map: current capabilities, in-product + features.html');
