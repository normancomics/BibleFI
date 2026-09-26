#!/usr/bin/env node
/**
 * Inventories every external data source this repo talks to.
 *
 * Scans src/integrations/, src/services/, and supabase/functions/ for outbound
 * hosts and the environment variables guarding them, then prints a table.
 *
 *   node scripts/audit-data-sources.mjs            # print the inventory
 *   node scripts/audit-data-sources.mjs --check    # fail if code has hosts docs/DATA_SOURCES.md omits
 *
 * The --check mode exists so docs/DATA_SOURCES.md cannot quietly fall out of
 * step with the code: adding an integration without documenting it fails.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const SCAN = ['src/integrations', 'src/services', 'supabase/functions'];
const DOC = 'docs/DATA_SOURCES.md';

/** Hosts that are infrastructure or self-references, not third-party data sources. */
const IGNORED = [
  /^esm\.sh$/, /^deno\.land$/, /^cdn\.jsdelivr\.net$/, /^unpkg\.com$/,
  /^localhost$/, /^127\.0\.0\.1$/,
  /supabase\.co$/, /^biblefi\./, /\.base\.eth$/, /^biblefi\.app$/,
  /lovable\.app$/, /^schemas?\./, /^www\.w3\.org$/, /^json-schema\.org$/,
  /^docs\./, /^github\.com$/,
];

const isIgnored = (h) => IGNORED.some((re) => re.test(h));

async function walk(dir, out = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      await walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

/** Group a file path into a logical module name. */
function moduleOf(rel) {
  const parts = rel.split(path.sep);
  if (parts[0] === 'supabase') return `fn:${parts[2]}`;
  if (parts[1] === 'integrations') return `int:${parts[2]}`;
  return `svc:${parts.slice(1, -1).join('/') || 'root'}`;
}

async function collect() {
  const modules = new Map();
  for (const base of SCAN) {
    for (const file of await walk(path.join(ROOT, base))) {
      const rel = path.relative(ROOT, file);
      const text = await fs.readFile(file, 'utf8');
      const mod = moduleOf(rel);
      if (!modules.has(mod)) modules.set(mod, { hosts: new Set(), envs: new Set(), files: 0 });
      const m = modules.get(mod);
      m.files++;

      for (const [, host] of text.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)) {
        if (!isIgnored(host)) m.hosts.add(host.toLowerCase());
      }
      for (const [, key] of text.matchAll(/Deno\.env\.get\(['"]([A-Z0-9_]+)['"]\)/g)) {
        if (!/^SUPABASE_/.test(key)) m.envs.add(key);
      }
      for (const [, key] of text.matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g)) {
        m.envs.add(key);
      }
    }
  }
  return modules;
}

const modules = await collect();
const withHosts = [...modules.entries()]
  .filter(([, m]) => m.hosts.size > 0)
  .sort(([a], [b]) => a.localeCompare(b));

const allHosts = new Set();
for (const [, m] of withHosts) for (const h of m.hosts) allHosts.add(h);

if (process.argv.includes('--check')) {
  let doc = '';
  try { doc = await fs.readFile(path.join(ROOT, DOC), 'utf8'); }
  catch { console.error(`✗ ${DOC} not found — run without --check to see the inventory.`); process.exit(1); }
  const undocumented = [...allHosts].filter((h) => !doc.includes(h)).sort();
  if (undocumented.length) {
    console.error(`✗ ${undocumented.length} host(s) reached by code but absent from ${DOC}:`);
    for (const h of undocumented) console.error(`    ${h}`);
    console.error(`\nAdd them to ${DOC} (or to IGNORED in this script if not a data source).`);
    process.exit(1);
  }
  console.log(`✓ all ${allHosts.size} external hosts are documented in ${DOC}`);
  process.exit(0);
}

console.log(`External data sources reached by this repo\n`);
console.log(`  modules scanned : ${modules.size}`);
console.log(`  with outbound   : ${withHosts.length}`);
console.log(`  distinct hosts  : ${allHosts.size}\n`);
for (const [mod, m] of withHosts) {
  console.log(`${mod}  (${m.files} file${m.files === 1 ? '' : 's'})`);
  for (const h of [...m.hosts].sort()) console.log(`    · ${h}`);
  if (m.envs.size) console.log(`    key: ${[...m.envs].sort().join(', ')}`);
}
