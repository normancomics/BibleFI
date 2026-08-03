#!/usr/bin/env node
/**
 * Knowledge Phrase Checker
 *
 * Scans the repo (docs, source, memory) for outdated Burner.pro / Visa-card
 * phrasing that must be replaced with the approved NFC-chip Tap-To-Pay
 * Visa-Cards wording.
 *
 * Usage:
 *   node scripts/check-knowledge-phrases.mjs           # exits 1 if flags found
 *   node scripts/check-knowledge-phrases.mjs --json    # machine-readable
 *
 * Note: Lovable project/workspace knowledge lives in the Lovable UI, not the
 * repo. This checker sweeps repo-side surfaces (docs/, src/, .lovable/,
 * README, memory files). Update UI knowledge manually in Settings > Knowledge.
 */
import { readFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";

// Banned regexes -> required replacement guidance.
const RULES = [
  {
    id: "cold-storage-visa",
    pattern: /cold[-\s]?storage[^\n]{0,40}?visa[-\s]?card/gi,
    message:
      'Replace "cold storage Visa card(s)" with "NFC-chip Tap-To-Pay Visa-Cards (hardware wallets with a Visa payment interface, not Visa debit cards)".',
    severity: "error",
  },
  {
    id: "visa-debit-burner",
    pattern: /burner\.pro[^\n]{0,60}?visa[-\s]?debit/gi,
    message:
      'Burner.pro cards are NOT Visa debit cards. Reword as "NFC-chip Tap-To-Pay Visa-Cards — hardware wallets with a Visa payment interface".',
    severity: "error",
  },
  {
    id: "cold-storage-card-generic",
    pattern: /cold[-\s]?storage\s+(wallet\s+)?(visa[-\s]?)?card/gi,
    message:
      'Ambiguous "cold storage ... card" phrasing. Confirm it refers to the NFC-chip Tap-To-Pay Visa-Cards and reword accordingly.',
    severity: "warn",
  },
];

// Scripture/theology allowlist — "cold storage" in a stewardship context is fine.
const ALLOWLIST = [
  /Matthew\s*6[:\s]*19/i, // treasures-on-earth verse tags "cold storage" as wallet-protection metaphor
];

const INCLUDE_GLOBS = [
  "docs",
  "src",
  ".lovable",
  "public",
  "README.md",
  "PROJECT_OVERVIEW.md",
  "BIBLE_FI_COMPREHENSIVE_OUTLINE.md",
  "TECH_STACK.md",
  "Bible.fi_Mini_App_Development_Roadmap.md",
];

const EXCLUDE_RE = /(^|\/)(node_modules|dist|build|\.git|coverage)(\/|$)/;

function listFiles() {
  const args = INCLUDE_GLOBS.filter((p) => {
    try {
      statSync(p);
      return true;
    } catch {
      return false;
    }
  });
  if (!args.length) return [];
  const out = execSync(
    `git ls-files -- ${args.map((a) => JSON.stringify(a)).join(" ")}`,
    { encoding: "utf8" },
  );
  return out
    .split("\n")
    .filter(Boolean)
    .filter((p) => !EXCLUDE_RE.test(p))
    .filter((p) => /\.(md|mdx|txt|json|ya?ml|tsx?|jsx?|html|css)$/i.test(p));
}

function scanFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return [];
  }
  const hits = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(text))) {
      const before = text.slice(0, m.index);
      const line = before.split("\n").length;
      const lineText = text.split("\n")[line - 1] ?? "";
      if (ALLOWLIST.some((re) => re.test(lineText))) continue;
      hits.push({
        file: path,
        line,
        rule: rule.id,
        severity: rule.severity,
        match: m[0],
        snippet: lineText.trim().slice(0, 200),
        message: rule.message,
      });
    }
  }
  return hits;
}

const files = listFiles();
const findings = files.flatMap(scanFile);

const asJson = process.argv.includes("--json");
if (asJson) {
  console.log(JSON.stringify({ scanned: files.length, findings }, null, 2));
} else {
  console.log(`Scanned ${files.length} files.`);
  if (!findings.length) {
    console.log("✅ No outdated Burner.pro / Visa-card phrasing found.");
    console.log(
      "Reminder: Lovable UI project/workspace knowledge is NOT scanned here — verify it in Settings > Knowledge.",
    );
  } else {
    console.log(`⚠️  ${findings.length} flag(s):\n`);
    for (const f of findings) {
      console.log(
        `[${f.severity.toUpperCase()}] ${f.file}:${f.line}  (${f.rule})`,
      );
      console.log(`  match:  "${f.match}"`);
      console.log(`  line:   ${f.snippet}`);
      console.log(`  fix:    ${f.message}\n`);
    }
  }
}

const hasError = findings.some((f) => f.severity === "error");
process.exit(hasError ? 1 : 0);