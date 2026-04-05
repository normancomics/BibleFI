/**
 * Script: update-city-on-the-hill.ts
 * Purpose: Upsert the City on the Hill (Boulder) church record with the updated address and contact info.
 * Usage: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/update-city-on-the-hill.ts` or `node`/ts-node
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function upsert() {
  const payload = {
    name: 'City on the Hill',
    city: 'Boulder',
    state_province: 'Colorado',
    country: 'United States',
    postal_code: '80303',
    address: '7483 Arapahoe Rd',
    website: 'https://cityonthehillboulder.org',
    phone: '(303) 555-0123',
    accepts_crypto: false,
    accepts_fiat: true,
    accepts_cards: true,
    accepts_checks: true,
    verified: true
  };

  // Upsert by unique constraint (name + city + state_province)
  const { data, error } = await supabase
    .from('global_churches')
    .upsert(payload, { onConflict: ['name', 'city', 'state_province'] })
    .select();

  if (error) {
    console.error('Upsert failed:', error);
    process.exit(1);
  }

  console.log('Upsert successful:', data);
}

upsert().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});
