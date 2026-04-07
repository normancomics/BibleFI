import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Global regions to rotate through for church seeding
const SEED_REGIONS = [
  // US Major Cities
  { name: 'New York City', lat: 40.7128, lon: -74.0060, country: 'United States', radius: 15000 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'United States', radius: 15000 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'United States', radius: 15000 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'United States', radius: 15000 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740, country: 'United States', radius: 12000 },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, country: 'United States', radius: 12000 },
  { name: 'San Antonio', lat: 29.4241, lon: -98.4936, country: 'United States', radius: 12000 },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970, country: 'United States', radius: 12000 },
  { name: 'Atlanta', lat: 33.7490, lon: -84.3880, country: 'United States', radius: 12000 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918, country: 'United States', radius: 12000 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321, country: 'United States', radius: 10000 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903, country: 'United States', radius: 10000 },
  { name: 'Nashville', lat: 36.1627, lon: -86.7816, country: 'United States', radius: 10000 },
  { name: 'Charlotte', lat: 35.2271, lon: -80.8431, country: 'United States', radius: 10000 },
  { name: 'Detroit', lat: 42.3314, lon: -83.0458, country: 'United States', radius: 10000 },
  // International
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom', radius: 15000 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792, country: 'Nigeria', radius: 15000 },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219, country: 'Kenya', radius: 12000 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil', radius: 15000 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'Mexico', radius: 15000 },
  { name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines', radius: 12000 },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea', radius: 12000 },
  { name: 'Accra', lat: 5.6037, lon: -0.1870, country: 'Ghana', radius: 10000 },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'South Africa', radius: 12000 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada', radius: 12000 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia', radius: 12000 },
  { name: 'Kampala', lat: 0.3476, lon: 32.5825, country: 'Uganda', radius: 10000 },
  { name: 'Kinshasa', lat: -4.4419, lon: 15.2663, country: 'DR Congo', radius: 12000 },
  { name: 'Lima', lat: -12.0464, lon: -77.0428, country: 'Peru', radius: 12000 },
  { name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'Colombia', radius: 12000 },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany', radius: 10000 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy', radius: 10000 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France', radius: 10000 },
  { name: 'Addis Ababa', lat: 9.0192, lon: 38.7525, country: 'Ethiopia', radius: 10000 },
  { name: 'Dar es Salaam', lat: -6.7924, lon: 39.2083, country: 'Tanzania', radius: 10000 },
  // Florida cities
  { name: 'St. Augustine', lat: 29.9012, lon: -81.3124, country: 'United States', radius: 10000 },
  { name: 'Jacksonville', lat: 30.3322, lon: -81.6557, country: 'United States', radius: 15000 },
  { name: 'Tampa', lat: 27.9506, lon: -82.4572, country: 'United States', radius: 12000 },
  { name: 'Orlando', lat: 28.5383, lon: -81.3792, country: 'United States', radius: 12000 },
];

// Christian denomination identifiers for OSM filtering
const CHRISTIAN_DENOMINATIONS = [
  'christian', 'catholic', 'protestant', 'baptist', 'methodist', 'lutheran',
  'presbyterian', 'pentecostal', 'evangelical', 'anglican', 'episcopal',
  'orthodox', 'assemblies_of_god', 'church_of_god', 'seventh_day_adventist',
  'church_of_christ', 'nazarene', 'salvation_army', 'quaker', 'mennonite',
  'mormon', 'jehovah_witness', 'charismatic', 'nondenominational',
  'african_methodist', 'african_independent', 'coptic', 'maronite',
];

interface ChurchResult {
  name: string;
  denomination: string | null;
  address: string | null;
  city: string;
  state_province: string | null;
  country: string;
  lat: number;
  lon: number;
  website: string | null;
  phone: string | null;
}

async function fetchChurchesFromOSM(
  lat: number, lon: number, radius: number
): Promise<ChurchResult[]> {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="place_of_worship"]["religion"="christian"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="christian"](around:${radius},${lat},${lon});
    );
    out body 50;
  `;

  try {
    const resp = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!resp.ok) return [];
    const data = await resp.json();

    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        name: el.tags.name,
        denomination: el.tags.denomination || el.tags.religion || 'christian',
        address: [el.tags['addr:housenumber'], el.tags['addr:street']].filter(Boolean).join(' ') || null,
        city: el.tags['addr:city'] || '',
        state_province: el.tags['addr:state'] || el.tags['addr:province'] || null,
        country: el.tags['addr:country'] || '',
        lat: el.lat || el.center?.lat || 0,
        lon: el.lon || el.center?.lon || 0,
        website: el.tags.website || el.tags['contact:website'] || null,
        phone: el.tags.phone || el.tags['contact:phone'] || null,
      }));
  } catch (err) {
    console.error('OSM fetch error:', err);
    return [];
  }
}

function sanitizeInput(input: string | null): string | null {
  if (!input) return null;
  // Strip potential injection patterns
  return input
    .replace(/[<>"'`;\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .trim()
    .slice(0, 500);
}

function isValidChurchName(name: string): boolean {
  if (!name || name.length < 3 || name.length > 200) return false;
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(name)) return false;
  // Block obvious test/spam
  const blocked = ['test', 'asdf', 'xxx', 'spam', 'fake'];
  if (blocked.some(b => name.toLowerCase() === b)) return false;
  return true;
}

function unauthorized(msg = 'Authentication required') {
  return new Response(JSON.stringify({ error: msg }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Auth gate: require valid JWT with admin role, or cron secret ---
  const cronSecret = req.headers.get('x-cron-secret');
  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (cronSecret) {
    if (cronSecret !== Deno.env.get('CRON_SECRET')) {
      return unauthorized('Invalid cron secret');
    }
  } else if (authHeader?.startsWith('Bearer ')) {
    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return unauthorized('Invalid or expired token');
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
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } else {
    return unauthorized();
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'seed';

    if (mode === 'status') {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { count: totalChurches } = await supabase.from('global_churches').select('*', { count: 'exact', head: true });
      const { data: countryCounts } = await supabase.from('global_churches').select('country').limit(1000);
      const countryMap: Record<string, number> = {};
      for (const row of (countryCounts || [])) { countryMap[row.country] = (countryMap[row.country] || 0) + 1; }
      return new Response(JSON.stringify({
        success: true, agent: 'church-seeder-agent',
        status: { total_churches: totalChurches || 0, countries_covered: Object.keys(countryMap).length, regions_available: SEED_REGIONS.length, top_countries: Object.entries(countryMap).sort(([, a], [, b]) => b - a).slice(0, 10), last_run: new Date().toISOString() }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await withAgentSandbox(
      { agentName: 'church-seeder-agent', runMode: body.manual ? 'manual' : 'scheduled', metadata: { mode } },
      async (ctx: AgentContext) => {
        if (mode === 'verify') {
          const { data: churches } = await sandboxedRead(ctx, 'global_churches_agent', (from) =>
            from.select('id, name, website, email, phone, city, country').limit(100)
          );
          let flagged = 0;
          const issues: string[] = [];
          for (const church of (churches || [])) {
            if (church.email && /[<>"';]/.test(church.email)) { issues.push(`${church.name}: suspicious email chars`); flagged++; }
            if (church.website && !/^https?:\/\//.test(church.website) && church.website !== '') { issues.push(`${church.name}: invalid website URL`); flagged++; }
            if (church.name && church.name.length < 3) { issues.push(`${church.name}: name too short`); flagged++; }
          }
          return { mode: 'verify', churches_checked: (churches || []).length, issues_found: flagged, issue_details: issues.slice(0, 20) };
        }

        // Seed mode
        const regionsToSeed = body.regions || [];
        let targetRegions = regionsToSeed.length > 0
          ? SEED_REGIONS.filter(r => regionsToSeed.includes(r.name))
          : [...SEED_REGIONS].sort(() => Math.random() - 0.5).slice(0, 3);

        let totalSeeded = 0, totalSkipped = 0;
        const seededRegions: string[] = [];

        for (const region of targetRegions) {
          try {
            const churches = await fetchChurchesFromOSM(region.lat, region.lon, region.radius);
            for (const church of churches) {
              const cleanName = sanitizeInput(church.name);
              if (!cleanName || !isValidChurchName(cleanName)) { totalSkipped++; continue; }
              const city = sanitizeInput(church.city) || region.name;
              const country = sanitizeInput(church.country) || region.country;

              const { data: existing } = await sandboxedRead(ctx, 'global_churches_agent', (from) =>
                from.select('id').eq('name', cleanName).eq('city', city).eq('country', country).limit(1)
              );
              if (existing && existing.length > 0) { totalSkipped++; continue; }

              const denom = sanitizeInput(church.denomination);
              const normalizedDenom = denom && CHRISTIAN_DENOMINATIONS.includes(denom.toLowerCase())
                ? denom.charAt(0).toUpperCase() + denom.slice(1) : denom || 'Christian';

              await sandboxedInsert(ctx, 'global_churches_agent', {
                name: cleanName, denomination: normalizedDenom, address: sanitizeInput(church.address),
                city, state_province: sanitizeInput(church.state_province), country,
                website: sanitizeInput(church.website), phone: sanitizeInput(church.phone),
                coordinates: church.lat && church.lon ? `(${church.lon},${church.lat})` : null,
                verified: false, accepts_fiat: true,
              });
              totalSeeded++;
            }
            seededRegions.push(`${region.name} (${churches.length} found)`);
            await new Promise(r => setTimeout(r, 2000));
          } catch (err) {
            console.error(`Error seeding ${region.name}:`, err);
            seededRegions.push(`${region.name} (error)`);
          }
        }

        return { mode: 'seed', churches_seeded: totalSeeded, churches_skipped: totalSkipped, regions_processed: seededRegions };
      }
    );

    return new Response(JSON.stringify({ agent: 'church-seeder-agent', ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Church Seeder Agent error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
