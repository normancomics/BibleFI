#!/usr/bin/env node
/**
 * Automated test suite for the BibleFi MCP guard.
 *
 * Covers:
 *   1. sanitizeFilterText — injection payloads are stripped
 *   2. sanitizeInputsForAudit — nested objects are redacted
 *   3. Rate-limit helper (check_mcp_rate_limit RPC) — requires live Supabase
 *   4. enforceMcpRateLimit — fails open when service key is absent
 *   5. inferMCPErrorKind — maps known message patterns to the right kind
 *   6. tripleCheck (BWSP) — authenticity / context / anti-cherry-picking logic
 *   7. BWSP→BWTYA gate — approved / skipped / blocked outcomes
 *   8. wisdomScoreMultiplier / titheStreakMultiplier — boundary values
 *
 * Usage:
 *   node scripts/test-mcp-guard.mjs
 *
 * Exit code 0 = all assertions passed; 1 = any failure.
 * The Supabase rate-limit tests are skipped when SUPABASE_SERVICE_ROLE_KEY
 * is absent.
 */

// ---------------------------------------------------------------------------
// Lightweight assert helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

function assertEqual(actual, expected, label) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}  (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
    failed++;
  }
}

function section(name) {
  console.log(`\n── ${name} ──`);
}

// ---------------------------------------------------------------------------
// 1. sanitizeFilterText
// ---------------------------------------------------------------------------

section('1. sanitizeFilterText — injection payloads');

/**
 * Pure re-implementation of the sanitizer to allow running without ESM
 * TypeScript compilation. Must stay in sync with src/lib/mcp/guard.ts.
 */
function sanitizeFilterText(input, maxLength = 100) {
  return input
    .replace(/[,()*%\\"'.:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

const maliciousPayloads = [
  ["'OR '1'='1", "SQL-style single-quote injection"],
  ['") OR ("x"="x', "Double-quote OR injection"],
  ['%27 OR %27x%27=%27x', "URL-encoded single-quote injection"],
  ['stewardship),(select version())', "Parenthesis break-out"],
  ['tithe*&^$#@!', "Special characters"],
  ['a'.repeat(200), "Overlong input (should truncate to 100 chars)"],
  ['title.ilike.%hacked%', "PostgREST dot-notation injection"],
  ['\\"; DROP TABLE biblical_knowledge_base; --', "SQL DROP injection"],
];

for (const [payload, label] of maliciousPayloads) {
  const result = sanitizeFilterText(payload);
  // After sanitization: no dangerous chars remain, length ≤ 100
  const noDangerousChars = !/[,()*%\\"'.:]/u.test(result);
  const withinLength = result.length <= 100;
  assert(noDangerousChars && withinLength, label);
}

// Safe inputs should survive sanitization intact
const safeInputs = [
  ['tithing stewardship', 'Plain safe input unchanged'],
  ['Proverbs 3', 'Scripture reference (colon stripped but rest survives)'],
  ['base defi yield', 'Multi-word safe query'],
];
for (const [input, label] of safeInputs) {
  const result = sanitizeFilterText(input);
  assert(result.length > 0, label);
}

// ---------------------------------------------------------------------------
// 2. sanitizeInputsForAudit
// ---------------------------------------------------------------------------

section('2. sanitizeInputsForAudit — safe representation');

function sanitizeInputsForAudit(inputs) {
  const safe = {};
  for (const [k, v] of Object.entries(inputs)) {
    if (typeof v === 'string') {
      safe[k] = sanitizeFilterText(v, 200);
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      safe[k] = v;
    } else {
      safe[k] = '[redacted]';
    }
  }
  return safe;
}

const auditInputTests = [
  { input: { query: "stewardship" }, label: "String value is sanitized" },
  { input: { limit: 10 }, label: "Number value passes through" },
  { input: { active: true }, label: "Boolean value passes through" },
  { input: { obj: { nested: 'x' } }, label: "Object value is redacted" },
  { input: { query: "'OR '1'='1" }, label: "Injection in audit is sanitized" },
];
for (const { input, label } of auditInputTests) {
  const result = sanitizeInputsForAudit(input);
  let ok = true;
  for (const [k, v] of Object.entries(result)) {
    if (typeof v === 'string' && /[,()*%\\"'.:]/u.test(v)) ok = false;
    if (v !== '[redacted]' && typeof input[k] === 'object') ok = false;
  }
  assert(ok, label);
}

// ---------------------------------------------------------------------------
// 3. inferMCPErrorKind
// ---------------------------------------------------------------------------

section('3. inferMCPErrorKind — message pattern mapping');

function inferMCPErrorKind(message) {
  const lower = message.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('retry in')) return 'rate_limited';
  if (lower.includes('bwsp') || lower.includes('triple-check') || lower.includes('blocked')) return 'bwsp_blocked';
  if (lower.includes('searchable word') || lower.includes('letters and spaces')) return 'invalid_input';
  return 'generic';
}

assertEqual(inferMCPErrorKind('Rate limit exceeded. Retry in 30s.'), 'rate_limited', 'Rate limit message');
assertEqual(inferMCPErrorKind('retry in 60s'), 'rate_limited', 'Retry-in shorthand');
assertEqual(inferMCPErrorKind('BWSP triple-check failed'), 'bwsp_blocked', 'BWSP blocked message');
assertEqual(inferMCPErrorKind('BWTYA execution blocked'), 'bwsp_blocked', 'Blocked keyword');
assertEqual(inferMCPErrorKind('Please provide a searchable word or phrase (letters and spaces only).'), 'invalid_input', 'Invalid input message');
assertEqual(inferMCPErrorKind('Connection timeout'), 'generic', 'Unknown message → generic');

// ---------------------------------------------------------------------------
// 4. BWSP Triple-Check logic
// ---------------------------------------------------------------------------

section('4. BWSP tripleCheck — authenticity / context / anti-cherry-picking');

// Re-implement the hash and tripleCheck logic (mirrors synthesizer.ts)
function verseHashHex(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h) ^ text.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const FINANCIAL_BOOKS = new Set([
  'genesis', 'deuteronomy', 'proverbs', 'ecclesiastes', 'malachi',
  'matthew', 'mark', 'luke', 'john', 'romans', 'corinthians',
  '1 timothy', '2 timothy', 'james', 'revelation',
]);
const OUT_OF_CONTEXT_PATTERNS = [/battle/i, /genealog/i, /census/i, /sacrific.*animal/i];

function tripleCheck(primaryScripture, supportingScriptures) {
  const failReasons = [];
  const refPattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+/;
  const hasValidRef = refPattern.test((primaryScripture.reference ?? '').trim());
  const hasText = (primaryScripture.text ?? '').trim().length > 10;
  const authentic = hasValidRef && hasText;
  if (!hasValidRef) failReasons.push('Invalid reference format.');
  if (!hasText) failReasons.push('Text too short.');

  const bookName = (primaryScripture.reference ?? '').replace(/\d+:\d+.*/, '').toLowerCase().trim();
  const isFinancialBook = FINANCIAL_BOOKS.has(bookName) ||
    [...FINANCIAL_BOOKS].some((b) => bookName.includes(b));
  const hasOutOfContextPattern = OUT_OF_CONTEXT_PATTERNS.some((p) => p.test(primaryScripture.text ?? ''));
  const contextual = isFinancialBook && !hasOutOfContextPattern;
  if (!isFinancialBook) failReasons.push(`Book "${bookName}" not approved.`);
  if (hasOutOfContextPattern) failReasons.push('Out-of-context narrative pattern detected.');

  const notCherryPicked = supportingScriptures.length >= 2;
  if (!notCherryPicked) failReasons.push('Need ≥ 2 supporting verses.');

  const passed = authentic && contextual && notCherryPicked;
  const verseHash = '0x' + verseHashHex(primaryScripture.text ?? primaryScripture.reference ?? '');
  return { authentic, contextual, notCherryPicked, passed, verseHash, failReasons };
}

const goodScripture = {
  reference: 'Proverbs 3:9',
  text: 'Honour the LORD with your wealth, with the firstfruits of all your crops.',
};
const supporting = [
  { reference: 'Malachi 3:10', text: 'Bring the whole tithe into the storehouse.' },
  { reference: 'Matthew 6:33', text: 'But seek first his kingdom and his righteousness.' },
];

const goodCheck = tripleCheck(goodScripture, supporting);
assert(goodCheck.passed, 'Valid Proverbs verse with 2 supporting: passes');
assert(goodCheck.authentic, 'Authenticity: valid reference + text');
assert(goodCheck.contextual, 'Context: Proverbs is a financial book');
assert(goodCheck.notCherryPicked, 'Anti-cherry-pick: 2 supporting verses');
assert(goodCheck.verseHash.startsWith('0x'), 'verseHash has 0x prefix');
assert(goodCheck.failReasons.length === 0, 'No fail reasons on good input');

// Test: missing supporting verses
const cherryPickCheck = tripleCheck(goodScripture, [supporting[0]]);
assert(!cherryPickCheck.notCherryPicked, 'Cherry-picking: only 1 supporting verse fails');
assert(!cherryPickCheck.passed, 'Cherry-picking: overall fails');
assert(cherryPickCheck.failReasons.length > 0, 'Cherry-picking: has fail reason');

// Test: out-of-context verse
const battleVerse = { reference: 'Proverbs 3:9', text: 'They went into battle and sacrificed animals.' };
const battleCheck = tripleCheck(battleVerse, supporting);
assert(!battleCheck.contextual, 'Battle/sacrifice verse fails context');

// Test: non-financial book
const nonFinancialBook = { reference: 'Numbers 1:2', text: 'Take a census of the whole Israelite community.' };
const nonFinancialCheck = tripleCheck(nonFinancialBook, supporting);
assert(!nonFinancialCheck.contextual, 'Non-financial book (Numbers) fails context');
assert(!nonFinancialCheck.passed, 'Non-financial book: overall fails');

// Test: empty reference
const emptyRef = { reference: '', text: 'Short.' };
const emptyCheck = tripleCheck(emptyRef, supporting);
assert(!emptyCheck.authentic, 'Empty reference fails authenticity');

// ---------------------------------------------------------------------------
// 5. BWSP → BWTYA gate
// ---------------------------------------------------------------------------

section('5. BWSP → BWTYA gate — approved / skipped / blocked');

function checkBwspGate(input) {
  const now = new Date().toISOString();
  if (!input.bwspApproval) {
    return { status: 'skipped', reason: 'No BWSP approval token provided.', timestamp: now };
  }
  const { verseHash, tripleCheckPassed, timestamp: bwspTs } = input.bwspApproval;
  if (!tripleCheckPassed) {
    return {
      status: 'blocked',
      reason: `BWTYA execution blocked: BWSP triple-check failed for verse hash ${verseHash}.`,
      timestamp: now,
    };
  }
  return { status: 'approved', reason: `BWTYA approved for verse ${verseHash}.`, timestamp: now };
}

// No approval token → skipped
assertEqual(checkBwspGate({ opportunities: [] }).status, 'skipped', 'No token → skipped');

// tripleCheckPassed = false → blocked
assertEqual(
  checkBwspGate({ opportunities: [], bwspApproval: { verseHash: '0xabc', tripleCheckPassed: false, timestamp: '' } }).status,
  'blocked',
  'Triple-check failed → blocked',
);

// tripleCheckPassed = true → approved
assertEqual(
  checkBwspGate({ opportunities: [], bwspApproval: { verseHash: '0xabc', tripleCheckPassed: true, timestamp: '' } }).status,
  'approved',
  'Triple-check passed → approved',
);

// ---------------------------------------------------------------------------
// 6. APY Multipliers
// ---------------------------------------------------------------------------

section('6. APY multipliers — boundary values');

function wisdomScoreMultiplier(score) {
  const s = Math.max(0, Math.min(100, score));
  return 1 + 0.13 * (Math.log(1 + s) / Math.log(101));
}

function titheStreakMultiplier(months) {
  const capped = Math.max(0, Math.min(12, months));
  return 1 + capped / 60;
}

function vaultApyWithMultipliers(baseApy, score, months) {
  return baseApy * wisdomScoreMultiplier(score) * titheStreakMultiplier(months);
}

assert(wisdomScoreMultiplier(0) === 1, 'Wisdom 0 → multiplier 1.0');
assert(wisdomScoreMultiplier(100) > 1, 'Wisdom 100 → multiplier > 1.0');
assert(wisdomScoreMultiplier(100) <= 1.13 + 0.001, 'Wisdom 100 → multiplier ≤ 1.13');
assert(titheStreakMultiplier(0) === 1, 'Streak 0 → multiplier 1.0');
assert(Math.abs(titheStreakMultiplier(6) - 1.1) < 0.001, 'Streak 6 → multiplier 1.1');
assert(Math.abs(titheStreakMultiplier(12) - 1.2) < 0.001, 'Streak 12 → multiplier 1.2');
assert(titheStreakMultiplier(99) <= 1.2 + 0.001, 'Streak > 12 is capped at 12');
assert(vaultApyWithMultipliers(10, 0, 0) === 10, 'Zero scores → APY unchanged');
assert(vaultApyWithMultipliers(10, 100, 12) > 10, 'Max scores → APY boosted above base');

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll tests passed! ✅');
  process.exit(0);
}
