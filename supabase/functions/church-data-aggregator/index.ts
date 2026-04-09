import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

interface AggregatorResult {
  newChurches: number;
  updatedChurches: number;
  verifiedData: number;
  errors: string[];
  regionsProcessed: string[];
}

/** Fetch with timeout */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user (admin function)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'api' } });

    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (e) {
      console.warn('⚠️ Could not parse request body, using defaults:', (e as Error).message);
    }
    const mode = (body.mode as string) || 'discover';
    const region = body.region as string | undefined;

    console.log(`⛪ Church Data Aggregator started — mode: ${mode}, region: ${region || 'all'}`);

    const result: AggregatorResult = {
      newChurches: 0,
      updatedChurches: 0,
      verifiedData: 0,
      errors: [],
      regionsProcessed: [],
    };

    if (mode === 'discover' || mode === 'full') {
      await discoverNewChurches(supabase, result, region);
    }

    if (mode === 'verify' || mode === 'full') {
      await verifyExistingData(supabase, result);
    }

    if (mode === 'enrich' || mode === 'full') {
      await enrichMissingData(supabase, result);
    }

    console.log(`✅ Aggregator complete:`, JSON.stringify(result));

    return new Response(JSON.stringify({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const err = error as Error;
    console.error('❌ Aggregator error:', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Discover new churches from OpenStreetMap for major cities worldwide.
 */
async function discoverNewChurches(
  supabase: any,
  result: AggregatorResult,
  region?: string
) {
  // Target cities by region — rotate through these on each invocation
  const regions: Record<string, { city: string; country: string; state?: string }[]> = {
    'us_southeast': [
      { city: 'Orlando', country: 'United States', state: 'Florida' },
      { city: 'Tampa', country: 'United States', state: 'Florida' },
      { city: 'Jacksonville', country: 'United States', state: 'Florida' },
      { city: 'Miami', country: 'United States', state: 'Florida' },
      { city: 'Atlanta', country: 'United States', state: 'Georgia' },
      { city: 'Charlotte', country: 'United States', state: 'North Carolina' },
      { city: 'Nashville', country: 'United States', state: 'Tennessee' },
    ],
    'us_northeast': [
      { city: 'New York', country: 'United States', state: 'New York' },
      { city: 'Boston', country: 'United States', state: 'Massachusetts' },
      { city: 'Philadelphia', country: 'United States', state: 'Pennsylvania' },
      { city: 'Washington', country: 'United States', state: 'District of Columbia' },
      { city: 'Baltimore', country: 'United States', state: 'Maryland' },
    ],
    'us_west': [
      { city: 'Los Angeles', country: 'United States', state: 'California' },
      { city: 'San Francisco', country: 'United States', state: 'California' },
      { city: 'Seattle', country: 'United States', state: 'Washington' },
      { city: 'Phoenix', country: 'United States', state: 'Arizona' },
      { city: 'Denver', country: 'United States', state: 'Colorado' },
    ],
    'us_midwest': [
      { city: 'Chicago', country: 'United States', state: 'Illinois' },
      { city: 'Detroit', country: 'United States', state: 'Michigan' },
      { city: 'Minneapolis', country: 'United States', state: 'Minnesota' },
      { city: 'St. Louis', country: 'United States', state: 'Missouri' },
      { city: 'Columbus', country: 'United States', state: 'Ohio' },
    ],
    'us_south': [
      { city: 'Houston', country: 'United States', state: 'Texas' },
      { city: 'Dallas', country: 'United States', state: 'Texas' },
      { city: 'San Antonio', country: 'United States', state: 'Texas' },
      { city: 'New Orleans', country: 'United States', state: 'Louisiana' },
      { city: 'Memphis', country: 'United States', state: 'Tennessee' },
    ],
    'africa': [
      { city: 'Lagos', country: 'Nigeria' },
      { city: 'Nairobi', country: 'Kenya' },
      { city: 'Accra', country: 'Ghana' },
      { city: 'Addis Ababa', country: 'Ethiopia' },
      { city: 'Johannesburg', country: 'South Africa' },
      { city: 'Kinshasa', country: 'Democratic Republic of Congo' },
    ],
    'europe': [
      { city: 'London', country: 'United Kingdom' },
      { city: 'Berlin', country: 'Germany' },
      { city: 'Paris', country: 'France' },
      { city: 'Rome', country: 'Italy' },
      { city: 'Madrid', country: 'Spain' },
    ],
    'latin_america': [
      { city: 'São Paulo', country: 'Brazil' },
      { city: 'Mexico City', country: 'Mexico' },
      { city: 'Bogotá', country: 'Colombia' },
      { city: 'Lima', country: 'Peru' },
      { city: 'Buenos Aires', country: 'Argentina' },
    ],
    'asia_pacific': [
      { city: 'Manila', country: 'Philippines' },
      { city: 'Seoul', country: 'South Korea' },
      { city: 'Singapore', country: 'Singapore' },
      { city: 'Sydney', country: 'Australia' },
      { city: 'Jakarta', country: 'Indonesia' },
    ],
  };

  const targetRegions = region ? { [region]: regions[region] || [] } : regions;

  for (const [regionName, cities] of Object.entries(targetRegions)) {
    if (!cities || cities.length === 0) continue;

    // Process max 2 cities per region per run to stay within time limits
    const citiesToProcess = cities.slice(0, 2);

    for (const cityInfo of citiesToProcess) {
      try {
        console.log(`🔍 Discovering churches in ${cityInfo.city}, ${cityInfo.country}...`);

        // Geocode the city
        const coords = await geocodeLocation(`${cityInfo.city}, ${cityInfo.country}`);
        if (!coords) {
          console.log(`⚠️ Could not geocode ${cityInfo.city}`);
          continue;
        }

        // Query Overpass for churches in a 15km radius
        const overpassQuery = `[out:json][timeout:15];(node["amenity"="place_of_worship"]["religion"="christian"](around:15000,${coords.lat},${coords.lon});way["amenity"="place_of_worship"]["religion"="christian"](around:15000,${coords.lat},${coords.lon}););out center 30;`;

        const response = await fetchWithTimeout(OVERPASS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        }, 20000);

        if (!response.ok) {
          result.errors.push(`Overpass failed for ${cityInfo.city}: ${response.status}`);
          continue;
        }

        const osmData = await response.json();
        const elements = osmData.elements || [];
        console.log(`📍 Found ${elements.length} churches in ${cityInfo.city}`);

        for (const el of elements) {
          if (!el.tags?.name) continue;

          // Check for duplicates by name + city
          const { data: existing } = await supabase
            .from('global_churches')
            .select('id')
            .ilike('name', el.tags.name)
            .ilike('city', cityInfo.city)
            .limit(1);

          if (existing && existing.length > 0) continue;

          const tags = el.tags || {};
          const { error: insertError } = await supabase
            .from('global_churches')
            .insert({
              name: tags.name,
              denomination: tags.denomination || null,
              address: [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || null,
              city: cityInfo.city,
              state_province: cityInfo.state || tags['addr:state'] || null,
              country: cityInfo.country,
              website: tags.website || null,
              verified: false,
              accepts_crypto: false,
            });

          if (insertError) {
            result.errors.push(`Insert failed for ${tags.name}: ${insertError.message}`);
          } else {
            result.newChurches++;
          }
        }

        result.regionsProcessed.push(`${cityInfo.city}, ${cityInfo.country}`);
        // Rate limit: wait 1.5s between city queries
        await new Promise(r => setTimeout(r, 1500));

      } catch (err) {
        result.errors.push(`Error processing ${cityInfo.city}: ${(err as Error).message}`);
      }
    }
  }
}

/**
 * Verify existing church data by cross-referencing with OSM.
 */
async function verifyExistingData(
  supabase: any,
  result: AggregatorResult
) {
  console.log('🔎 Verifying existing church data...');

  // Get churches with websites that haven't been verified recently
  const { data: unverified } = await supabase
    .from('global_churches')
    .select('id, name, city, country, website, phone')
    .eq('verified', false)
    .not('website', 'is', null)
    .limit(20);

  if (!unverified || unverified.length === 0) {
    console.log('✅ No unverified churches with websites to check');
    return;
  }

  for (const church of unverified) {
    try {
      // Try to verify website is reachable
      const websiteOk = await checkWebsite(church.website);
      if (websiteOk) {
        await supabase
          .from('global_churches')
          .update({
            verified: true,
          })
          .eq('id', church.id);
        result.verifiedData++;
      }
    } catch {
      // Skip verification errors
    }
  }
}

/**
 * Enrich churches missing website/phone by searching OSM.
 */
async function enrichMissingData(
  supabase: any,
  result: AggregatorResult
) {
  console.log('📝 Enriching churches with missing data...');

  // Get churches missing both website and phone
  const { data: incomplete } = await supabase
    .from('global_churches')
    .select('id, name, city, country, state_province')
    .is('website', null)
    .is('phone', null)
    .limit(15);

  if (!incomplete || incomplete.length === 0) {
    console.log('✅ No churches need enrichment');
    return;
  }

  for (const church of incomplete) {
    try {
      // Search OSM for this specific church
      const searchName = encodeURIComponent(`${church.name} ${church.city}`);
      const url = `${NOMINATIM_API_URL}/search?q=${searchName}&format=json&limit=1&extratags=1&addressdetails=1`;
      
      const response = await fetchWithTimeout(url, {
        headers: { 'User-Agent': 'Bible.fi/1.0 (Biblical DeFi Church Aggregator)' },
      }, 5000);

      if (response.ok) {
        const results = await response.json();
        if (results.length > 0 && results[0].extratags) {
          const tags = results[0].extratags;
          const updates: Record<string, unknown> = {};

          if (tags.website) updates.website = tags.website;
          // Note: phone/email are computed columns in the api view, can't update directly

          if (Object.keys(updates).length > 0) {
            await supabase
              .from('global_churches')
              .update(updates)
              .eq('id', church.id);
            result.updatedChurches++;
          }
        }
      }

      // Respect Nominatim rate limit: 1 req/sec
      await new Promise(r => setTimeout(r, 1100));
    } catch {
      // Skip enrichment errors
    }
  }
}

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `${NOMINATIM_API_URL}/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'Bible.fi/1.0 (Biblical DeFi Church Aggregator)' },
    }, 5000);
    if (!response.ok) return null;
    const data = await response.json();
    return data.length > 0 ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
  } catch {
    return null;
  }
}

async function checkWebsite(url: string | null): Promise<boolean> {
  if (!url) return false;
  try {
    const response = await fetchWithTimeout(url, { method: 'HEAD' }, 5000);
    return response.ok || response.status === 301 || response.status === 302;
  } catch {
    return false;
  }
}
