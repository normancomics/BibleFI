#!/usr/bin/env node
/**
 * Integration test for /functions/v1/church-directory-health.
 *
 * Asserts the exact status codes and masked-field behavior for all three
 * caller modes:
 *   - public (no token / anon key)      → 200, mode "public", unmasked sample
 *   - signed-in non-admin               → 403 "Forbidden: admin role required"
 *   - signed-in admin                   → 200, mode "authenticated", masked sample
 * plus the error paths (invalid token → 401, forced auth without token → 401).
 *
 * Usage:
 *   node scripts/test-church-directory-health.mjs
 *
 * Env (all optional — sensible defaults for the BibleFI project):
 *   SUPABASE_URL                 project URL
 *   SUPABASE_ANON_KEY            anon/publishable key
 *   SUPABASE_SERVICE_ROLE_KEY    REQUIRED for the non-admin/admin mode tests;
 *                                without it those tests are skipped. Used to
 *                                create two ephemeral, email-confirmed test
 *                                users (deleted again afterwards) and to grant
 *                                one of them the admin role.
 *
 * Exit code 0 = all executed assertions passed; 1 = any failure.
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://ojiipppypzigjnjblbzn.supabase.co';
const ANON_KEY = process.env.SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

const HEALTH_URL = `${SUPABASE_URL}/functions/v1/church-directory-health`;

let passed = 0;
let failed = 0;
const cleanupFns = [];

function check(label, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function callHealth({ bearer, query = '' } = {}) {
  const headers = { apikey: ANON_KEY };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  const res = await fetch(`${HEALTH_URL}${query}`, { headers });
  return { status: res.status, body: await res.json() };
}

// ── Auth helpers (service key required) ─────────────────────────────────────

async function createTestUser(email) {
  const password = `T3st!${crypto.randomUUID()}`;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!res.ok) throw new Error(`createUser(${email}) failed: ${res.status} ${await res.text()}`);
  const user = await res.json();
  cleanupFns.push(async () => {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
  });
  return { id: user.id, email, password };
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`signIn(${email}) failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function grantAdmin(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify({ user_id: userId, role: 'admin' }),
  });
  if (!res.ok) throw new Error(`grantAdmin failed: ${res.status} ${await res.text()}`);
  cleanupFns.push(async () => {
    await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&role=eq.admin`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

async function testPublicModes() {
  console.log('\nPublic / anonymous modes:');

  const noToken = await callHealth({ query: '?pageSize=2' });
  check('no bearer → 200', noToken.status === 200, `got ${noToken.status}`);
  check('no bearer → mode "public"', noToken.body.mode === 'public', `got ${noToken.body.mode}`);
  check('count present and numeric', typeof noToken.body.count === 'number');
  check('pagination metadata present',
    noToken.body.pagination && typeof noToken.body.pagination.totalPages === 'number' &&
    typeof noToken.body.pagination.hasMore === 'boolean');
  const row = noToken.body.sample?.[0];
  check('public sample rows are UNMASKED (have raw name, no name_masked)',
    row != null && typeof row.name === 'string' && !('name_masked' in row),
    JSON.stringify(row));

  const anonBearer = await callHealth({ bearer: ANON_KEY });
  check('anon key as bearer → 200 public (auto-detect: no user sub)',
    anonBearer.status === 200 && anonBearer.body.mode === 'public',
    `got ${anonBearer.status} / ${anonBearer.body.mode ?? anonBearer.body.error}`);

  const garbage = await callHealth({ bearer: 'not-a-real-jwt' });
  check('garbage bearer → 401', garbage.status === 401, `got ${garbage.status}`);

  const forced = await callHealth({ query: '?auth=1' });
  check('?auth=1 with no user token → 401 "Missing bearer token"',
    forced.status === 401 && forced.body.error === 'Missing bearer token',
    `got ${forced.status} ${forced.body.error}`);
}

async function testAuthModes() {
  console.log('\nSigned-in modes:');
  if (!SERVICE_KEY) {
    console.log('  ⤷ SKIPPED: set SUPABASE_SERVICE_ROLE_KEY to run the non-admin/admin tests.');
    return;
  }

  const stamp = Date.now();
  const nonAdmin = await createTestUser(`healthtest-nonadmin-${stamp}@example.com`);
  const admin = await createTestUser(`healthtest-admin-${stamp}@example.com`);
  await grantAdmin(admin.id);

  const nonAdminToken = await signIn(nonAdmin.email, nonAdmin.password);
  const adminToken = await signIn(admin.email, admin.password);

  const forbidden = await callHealth({ bearer: nonAdminToken });
  check('non-admin session → 403', forbidden.status === 403, `got ${forbidden.status}`);
  check('non-admin error is "Forbidden: admin role required"',
    forbidden.body.error === 'Forbidden: admin role required', forbidden.body.error);

  const ok = await callHealth({ bearer: adminToken, query: '?pageSize=2' });
  check('admin session → 200', ok.status === 200, `got ${ok.status} ${JSON.stringify(ok.body).slice(0, 200)}`);
  check('admin mode is "authenticated"', ok.body.mode === 'authenticated', `got ${ok.body.mode}`);
  const masked = ok.body.sample?.[0];
  check('admin sample rows are MASKED (name_masked with asterisks, no raw name)',
    masked != null && !('name' in masked) &&
    typeof masked.name_masked === 'string' && masked.name_masked.includes('***'),
    JSON.stringify(masked));
  check('city is masked too (city_masked, keeps 2 chars)',
    masked != null && !('city' in masked) &&
    (masked.city_masked === null || /^.{1,2}\*{3,}$/.test(masked.city_masked)),
    JSON.stringify(masked?.city_masked));
  check('admin count matches public count', ok.body.count === (await callHealth()).body.count);
}

// ── Run ─────────────────────────────────────────────────────────────────────

try {
  console.log(`church-directory-health integration test → ${HEALTH_URL}`);
  await testPublicModes();
  await testAuthModes();
} catch (err) {
  failed++;
  console.error(`\nUnexpected error: ${err.message}`);
} finally {
  for (const fn of cleanupFns.reverse()) {
    try { await fn(); } catch (e) { console.warn(`cleanup failed: ${e.message}`); }
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
