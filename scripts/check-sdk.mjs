#!/usr/bin/env node
/**
 * SDK drift gate for the FanBasis docs (fbnewapi/index.html).
 *
 * The SDK reference in index.html is hand-curated (it carries editorial comments
 * the raw .d.ts doesn't — "// Required", "// SYNCHRONOUS", the ⚠ warnings, etc.).
 * Rather than overwrite that curation with a blind code-dump, this gate parses the
 * pinned @fanbasis/checkout-core types and FAILS if the docs are missing any event,
 * error code, public method, or config field — so the docs can't silently drift,
 * but a human still applies each change with context.
 *
 * It also *generates* the one block that has no curation to lose — the CheckoutEvents
 * "Event map" — between <!--SDK-GEN:event-map start/end--> markers (run with --write).
 *
 * Usage:
 *   node scripts/check-sdk.mjs              # offline drift check (CI on push/PR)
 *   node scripts/check-sdk.mjs --write      # regenerate the event-map block, then check
 *   node scripts/check-sdk.mjs --check-npm  # also fail if npm shipped a newer version (weekly CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML_PATH = join(ROOT, 'index.html');
const DTS = readFileSync(join(ROOT, 'sdk/checkout-core.d.ts'), 'utf8');
const VERSIONS = JSON.parse(readFileSync(join(ROOT, 'sdk/version.json'), 'utf8'));
let HTML = readFileSync(HTML_PATH, 'utf8');

const WRITE = process.argv.includes('--write');
const CHECK_NPM = process.argv.includes('--check-npm');

const problems = [];
const warnings = [];
const fail = (m) => problems.push(m);
const warn = (m) => warnings.push(m);

// ── tiny .d.ts parser (zero deps) ───────────────────────────────────────────
/** Return the `{ ... }` body of the first declaration matching `re`. */
function bodyOf(re) {
  const m = re.exec(DTS);
  if (!m) return null;
  let i = DTS.indexOf('{', m.index);
  if (i < 0) return null;
  let depth = 0;
  const start = i;
  for (; i < DTS.length; i++) {
    if (DTS[i] === '{') depth++;
    else if (DTS[i] === '}' && --depth === 0) return DTS.slice(start + 1, i);
  }
  return null;
}

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

/** Top-level field names of an interface body (ignores nested object fields). */
function topFields(body) {
  let s = stripComments(body);
  let prev;
  do { prev = s; s = s.replace(/\{[^{}]*\}/g, ''); } while (s !== prev); // collapse nesting
  return [...s.matchAll(/(?:^|\n)\s*([a-zA-Z_]\w*)\s*\??\s*:/g)].map((m) => m[1]);
}

// ── extract the contract from the pinned types ──────────────────────────────
const eventsBody = bodyOf(/interface\s+CheckoutEvents\s*\{/);
const enumBody = bodyOf(/enum\s+PaymentErrorCode\s*\{/);
const classBody = bodyOf(/class\s+PaymentCheckout\s+extends[^{]*\{/);

if (!eventsBody || !enumBody || !classBody) {
  fail('Could not parse CheckoutEvents / PaymentErrorCode / PaymentCheckout from sdk/checkout-core.d.ts — did the .d.ts shape change?');
}

const eventSigs = [...(eventsBody || '').matchAll(/'([^']+)'\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]);
const events = eventSigs.map((e) => e[0]);
const errorCodes = [...(enumBody || '').matchAll(/\w+\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
const methods = [...(classBody || '').matchAll(/^\s*(?:static\s+)?([a-z]\w*)\s*(?:<[^>]*>)?\s*\(/gm)]
  .map((m) => m[1])
  .filter((n) => n !== 'constructor');

const CONFIG_INTERFACES = [
  'CheckoutConfig', 'CustomizationParams', 'PrefillConfig', 'PrefillAddress',
  'FieldsConfig', 'FieldControl', 'RedirectSettings', 'CheckoutState',
];

// ── optional generation: the curation-free "Event map" block ────────────────
function buildEventMapBlock() {
  const pairs = eventSigs.map(([k, sig]) => [`'${k}':`, sig]);
  const pad = Math.max(...pairs.map(([k]) => k.length)) + 1;
  const lines = pairs.map(([k, sig]) => `  ${k.padEnd(pad)}${sig};`).join('\n');
  const raw =
    `interface CheckoutEvents {\n${lines}\n}\n\n` +
    `type CheckoutEventName = keyof CheckoutEvents;\n` +
    `type CheckoutEventListener<T extends CheckoutEventName> = CheckoutEvents[T];`;
  return raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

if (WRITE) {
  const re = /(<!--SDK-GEN:event-map start-->)[\s\S]*?(<!--SDK-GEN:event-map end-->)/;
  if (!re.test(HTML)) {
    fail('--write: <!--SDK-GEN:event-map start/end--> markers not found in index.html');
  } else {
    HTML = HTML.replace(re, `$1\n${buildEventMapBlock()}\n$2`);
    writeFileSync(HTML_PATH, HTML);
    console.log('✓ regenerated the Event map block from the pinned types');
  }
}

// ── drift checks: every contract item must appear in the docs ───────────────
const present = (token) => HTML.includes(token);

function checkAll(label, items) {
  const missing = items.filter((t) => !present(t));
  if (missing.length) fail(`${label}: missing from docs → ${missing.join(', ')}`);
  else console.log(`✓ ${label}: all ${items.length} present`);
}

checkAll('SDK events', events);
checkAll('PaymentErrorCode values', errorCodes);
checkAll('PaymentCheckout methods', [...new Set(methods)]);

for (const name of CONFIG_INTERFACES) {
  const body = bodyOf(new RegExp(`interface\\s+${name}\\s*\\{`));
  if (!body) { fail(`config interface ${name} not found in .d.ts`); continue; }
  const fields = [...new Set(topFields(body))];
  const missing = fields.filter((f) => !present(f));
  if (missing.length) fail(`${name} fields: missing from docs → ${missing.join(', ')}`);
  else console.log(`✓ ${name}: all ${fields.length} fields present`);
}

// ── version checks ──────────────────────────────────────────────────────────
for (const [pkg, info] of Object.entries(VERSIONS.packages)) {
  const tag = `${pkg}@${info.version}`;
  if (!present(tag)) fail(`version: docs never reference the pinned ${tag}`);
  else console.log(`✓ version: docs reference ${tag}`);
  // flag any reference to a HIGHER version than the pin (inconsistent docs)
  const seen = [...HTML.matchAll(new RegExp(`${pkg.replace('/', '\\/')}@(\\d+)\\.(\\d+)\\.(\\d+)`, 'g'))];
  const pin = info.version.split('.').map(Number);
  for (const m of seen) {
    const v = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (cmpSemver(v, pin) > 0) warn(`docs reference ${pkg}@${m[1]}.${m[2]}.${m[3]} which is newer than the pinned ${info.version}`);
  }
}

function cmpSemver(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

// ── optional: is the pin behind npm? (weekly CI) ────────────────────────────
async function checkNpm() {
  for (const [pkg, info] of Object.entries(VERSIONS.packages)) {
    try {
      const res = await fetch(`https://registry.npmjs.org/${pkg}`, { signal: AbortSignal.timeout(15000) });
      const data = await res.json();
      const latest = data['dist-tags']?.latest;
      if (!latest) { warn(`npm: no latest dist-tag for ${pkg}`); continue; }
      if (cmpSemver(latest.split('.').map(Number), info.version.split('.').map(Number)) > 0) {
        fail(`npm: ${pkg} latest is ${latest} but docs are pinned to ${info.version} — update the docs + bump sdk/version.json`);
      } else {
        console.log(`✓ npm: ${pkg} pin ${info.version} is current (latest ${latest})`);
      }
    } catch (e) {
      warn(`npm: could not check ${pkg} (${e.message})`);
    }
  }
}

// ── report ──────────────────────────────────────────────────────────────────
const finish = () => {
  if (warnings.length) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }
  if (problems.length) {
    console.error(`\n✗ SDK drift gate FAILED (${problems.length}):`);
    for (const p of problems) console.error(`  • ${p}`);
    process.exit(1);
  }
  console.log('\n✓ SDK drift gate passed — docs are in sync with the pinned SDK.');
};

if (CHECK_NPM) checkNpm().then(finish);
else finish();
