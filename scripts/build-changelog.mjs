#!/usr/bin/env node
// Regenerates the <section id="changelog"> block in index.html from changelog.json.
// Zero dependencies (Node built-ins only). Single source of truth: changelog.json.
//
//   node scripts/build-changelog.mjs           # write index.html from changelog.json
//   node scripts/build-changelog.mjs --check    # exit 1 if index.html is out of sync (CI)
//
// Fail-open: in write mode, any error logs a warning and exits 0 WITHOUT touching
// index.html, so a malformed changelog can never break a deploy. In --check mode a
// mismatch or error exits 1 so drift is caught before shipping.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "index.html");
const SOURCE = join(ROOT, "changelog.json");
const CHECK = process.argv.includes("--check");

const TAG_LABELS = { new: "New", improved: "Improved", breaking: "Breaking", fixed: "Fixed", security: "Security" };
const TEMPLATE_RE = /(<script type="__bundler\/template">\n?)([\s\S]*?)(<\/script>)/;
const SECTION_RE = /<section id="changelog">[\s\S]*?<\/section>/;

function renderEntry(e, i) {
  const label = TAG_LABELS[e.tag];
  if (!label) throw new Error(`entry ${i} ("${e.title}"): unknown tag "${e.tag}"`);
  for (const k of ["date", "title", "desc"]) {
    if (!e[k] || typeof e[k] !== "string") throw new Error(`entry ${i}: missing/invalid "${k}"`);
  }
  return [
    '    <div class="changelog-entry">',
    `      <div class="changelog-date">${e.date}</div>`,
    `      <div class="changelog-title">${e.title}</div>`,
    `      <span class="changelog-tag ${e.tag}">${label}</span>`,
    `      <div class="changelog-desc">${e.desc}</div>`,
    "    </div>",
  ].join("\n");
}

function renderSection(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error("changelog.json must be a non-empty array");
  const body = entries.map(renderEntry).join("\n\n");
  return (
    '<section id="changelog">\n' +
    '  <div class="section-head">\n' +
    "    <h1>Changelog</h1>\n" +
    "  </div>\n" +
    '  <p>A running log of API updates, new features, and breaking changes. Subscribe to webhook event <code class="inline">api.changelog</code> (coming soon) to get notified automatically.</p>\n' +
    "\n" +
    '  <div style="margin-top:28px;">\n' +
    "\n" +
    body +
    "\n\n" +
    "  </div>\n" +
    "</section>"
  );
}

function buildIndex() {
  const entries = JSON.parse(readFileSync(SOURCE, "utf8"));
  const html = readFileSync(INDEX, "utf8");
  const tpl = html.match(TEMPLATE_RE);
  if (!tpl) throw new Error("template <script> block not found in index.html");

  const decoded = JSON.parse(tpl[2].trim());
  if (!SECTION_RE.test(decoded)) throw new Error('<section id="changelog"> not found in template');

  const updated = decoded.replace(SECTION_RE, renderSection(entries));
  const encoded = JSON.stringify(updated).replace(/<\//g, "<\\u002F");
  if (JSON.parse(encoded) !== updated) throw new Error("round-trip verification failed");

  // Preserve the exact surrounding whitespace of the original template payload.
  const raw = tpl[2];
  const pre = raw.slice(0, raw.length - raw.trimStart().length);
  const post = raw.slice(raw.trimEnd().length);
  const newRaw = pre + encoded + post;
  return html.slice(0, tpl.index) + tpl[1] + newRaw + tpl[3] + html.slice(tpl.index + tpl[0].length);
}

try {
  const next = buildIndex();
  const current = readFileSync(INDEX, "utf8");
  if (CHECK) {
    if (next !== current) {
      console.error("✗ index.html changelog is out of sync with changelog.json. Run: npm run changelog");
      process.exit(1);
    }
    console.log("✓ changelog in sync");
  } else if (next !== current) {
    writeFileSync(INDEX, next);
    console.log("✓ changelog regenerated into index.html");
  } else {
    console.log("✓ changelog already up to date");
  }
} catch (err) {
  if (CHECK) {
    console.error("✗ changelog check failed:", err.message);
    process.exit(1);
  }
  console.warn("⚠ changelog generation skipped (index.html left unchanged):", err.message);
  process.exit(0); // fail-open: never break a deploy over the changelog
}
