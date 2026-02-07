import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

const rateLimits = new Map<string, { count: number; reset: number }>();

interface ChurchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  phone?: string | null;
  website?: string | null;
  source: string;
  verified: boolean;
  acceptsCrypto?: boolean;
  cryptoNetworks?: string[];
  denomination?: string | null;
}

function validateSearchInput(input: string | undefined): string | null {
  if (!input) return null;
  const sanitized = input.trim().slice(0, 100);
  if (!/^[a-zA-Z0-9\s\-,.'&]+$/.test(sanitized)) return null;
  return sanitized;
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(identifier);
  if (!limit || now > limit.reset) {
    rateLimits.set(identifier, { count: 1, reset: now + 60000 });
    return true;
  }
  if (limit.count >= 10) return false;
  limit.count++;
  return true;
}

/** Fetch with timeout helper */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', churches: [] }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    // Use api schema — PostgREST is configured to only expose api schema
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'api' }
    });

    console.log('⛪ Starting church search...');

    const { query: rawQuery, location: rawLocation, radius = 50000, continent: rawContinent } = await req.json();
    const query = validateSearchInput(rawQuery);
    const location = validateSearchInput(rawLocation);
    const continent = validateSearchInput(rawContinent);

    console.log('Search params:', { query, location, radius, continent });

    const allChurches: ChurchResult[] = [];

    // === STEP 1: Local Supabase database ===
    console.log('📖 Searching local database...');
    try {
      let dbQuery = supabase
        .from('global_churches')
        .select('id,name,address,city,state_province,country,rating,review_count,phone,website,verified,accepts_crypto,crypto_networks,denomination');

      // When both query and location are provided, search more flexibly
      // Don't AND them together - just use location for filtering, query for ranking
      if (location) {
        const locationParts = location.split(',').map((p: string) => p.trim());
        const expandedParts = locationParts.map(p => expandStateAbbreviation(p));
        const locationFilters = expandedParts
          .filter(p => p.length > 0)
          .flatMap(p => [`city.ilike.%${p}%`, `state_province.ilike.%${p}%`, `country.ilike.%${p}%`])
          .join(',');
        if (locationFilters) {
          dbQuery = dbQuery.or(locationFilters);
        }
      } else if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,denomination.ilike.%${query}%,city.ilike.%${query}%`);
      }

      dbQuery = dbQuery
        .order('verified', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(50);

      const { data: rows, error: dbError } = await dbQuery;

      if (dbError) {
        console.error('❌ DB error:', dbError.message);
      } else {
        console.log(`✅ Found ${rows?.length || 0} churches in database`);
        for (const row of (rows || [])) {
          allChurches.push({
            id: row.id,
            name: row.name,
            address: row.address || `${row.city}, ${row.state_province || ''}, ${row.country}`.trim(),
            city: row.city,
            state: row.state_province || '',
            country: row.country,
            latitude: null,
            longitude: null,
            rating: row.rating,
            reviewCount: row.review_count,
            phone: row.phone,
            website: row.website,
            source: 'database',
            verified: row.verified || false,
            acceptsCrypto: row.accepts_crypto || false,
            cryptoNetworks: row.crypto_networks || [],
            denomination: row.denomination,
          });
        }
      }
    } catch (dbError) {
      console.error('❌ Database search error:', dbError);
    }

    // === STEP 2: OpenStreetMap (only if we need more results) ===
    if (allChurches.length < 20 && (location || query || continent)) {
      console.log('🗺️ Searching OpenStreetMap...');
      try {
        let overpassQuery = '';

        if (continent) {
          const continentBounds: Record<string, string> = {
            'north_america': '14.5,-170,72,-52',
            'south_america': '-56,-82,13,-34',
            'europe': '35,-25,72,65',
            'asia': '-10,25,77,180',
            'africa': '-35,-20,37,52',
            'australia': '-48,110,-10,180',
            'oceania': '-48,110,-10,180'
          };
          const bbox = continentBounds[continent.toLowerCase().replace(' ', '_')] || '35,-25,72,65';
          const nameClause = query ? `["name"~"${escapeOverpassString(query)}",i]` : '';
          overpassQuery = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(${bbox});way["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(${bbox}););out center 50;`;
        } else if (location) {
          const coords = await geocodeLocation(location);
          if (coords) {
            // Don't filter by name in Overpass - OSM name data is inconsistent
            // We'll filter results client-side instead
            overpassQuery = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="christian"](around:${radius},${coords.lat},${coords.lon});way["amenity"="place_of_worship"]["religion"="christian"](around:${radius},${coords.lat},${coords.lon}););out center 50;`;
          } else {
            overpassQuery = `[out:json][timeout:25];area["name"~"${escapeOverpassString(location)}",i]->.searchArea;(node["amenity"="place_of_worship"]["religion"="christian"](area.searchArea);way["amenity"="place_of_worship"]["religion"="christian"](area.searchArea););out center 50;`;
          }
        } else if (query) {
          overpassQuery = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="christian"]["name"~"${escapeOverpassString(query)}",i];way["amenity"="place_of_worship"]["religion"="christian"]["name"~"${escapeOverpassString(query)}",i];);out center 30;`;
        }

        if (overpassQuery) {
          const osmResponse = await fetchWithTimeout(OVERPASS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(overpassQuery)}`
          }, 20000);

          if (osmResponse.ok) {
            const osmData = await osmResponse.json();
            console.log(`🗺️ OSM returned ${osmData.elements?.length || 0} results`);

            for (const el of (osmData.elements || [])) {
              if (!el.tags?.name) continue;
              const isDuplicate = allChurches.some(c =>
                c.name.toLowerCase() === (el.tags?.name || '').toLowerCase()
              );
              if (!isDuplicate) {
                const lat = el.lat || el.center?.lat;
                const lon = el.lon || el.center?.lon;
                const tags = el.tags || {};
                const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state'], tags['addr:postcode']].filter(Boolean).join(', ');

                allChurches.push({
                  id: `osm-${el.type}-${el.id}`,
                  name: tags.name || 'Unknown Church',
                  address: address || `${tags['addr:city'] || ''}, ${tags['addr:state'] || ''}`.trim(),
                  city: tags['addr:city'] || '',
                  state: tags['addr:state'] || '',
                  country: tags['addr:country'] || '',
                  latitude: lat,
                  longitude: lon,
                  rating: null,
                  reviewCount: null,
                  phone: tags.phone || null,
                  website: tags.website || null,
                  source: 'openstreetmap',
                  verified: false,
                  acceptsCrypto: false,
                  denomination: tags.denomination || null,
                });
              }
            }
          } else {
            console.log('⚠️ Overpass API error:', osmResponse.status);
          }
        }
      } catch (osmError) {
        console.log('⚠️ OSM search skipped (timeout or error):', (osmError as Error).message);
      }
    }

    // === STEP 3: Google Places fallback ===
    if (googleApiKey && allChurches.length < 5 && location) {
      console.log('🔍 Google Places fallback...');
      try {
        const searchQuery = query ? `${query} church` : 'christian church';
        const requestBody: Record<string, unknown> = {
          textQuery: `${searchQuery} in ${location}`,
          maxResultCount: 10,
        };

        const response = await fetchWithTimeout('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri'
          },
          body: JSON.stringify(requestBody)
        }, 8000);

        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 Google returned ${data.places?.length || 0} results`);
          for (const place of (data.places || [])) {
            const isDuplicate = allChurches.some(c =>
              c.name.toLowerCase() === (place.displayName?.text || '').toLowerCase()
            );
            if (!isDuplicate) {
              allChurches.push({
                id: place.id,
                name: place.displayName?.text || 'Unknown Church',
                address: place.formattedAddress || '',
                city: extractCity(place.formattedAddress || ''),
                state: extractState(place.formattedAddress || ''),
                country: extractCountry(place.formattedAddress || ''),
                latitude: place.location?.latitude,
                longitude: place.location?.longitude,
                rating: place.rating,
                reviewCount: place.userRatingCount,
                phone: place.nationalPhoneNumber,
                website: place.websiteUri,
                source: 'google_places',
                verified: true,
                acceptsCrypto: false,
              });
            }
          }
        }
      } catch (apiError) {
        console.log('⚠️ Google fallback skipped:', (apiError as Error).message);
      }
    }

    console.log(`✅ Returning ${allChurches.length} total churches`);

    return new Response(
      JSON.stringify({
        churches: allChurches,
        source: allChurches.length > 0 ? 'combined' : 'none',
        count: allChurches.length,
        coverage: 'global'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const err = error as Error;
    console.error('❌ church-search error:', err.message);
    return new Response(
      JSON.stringify({ error: 'An error occurred while searching', churches: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `${NOMINATIM_API_URL}/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'Bible.fi/1.0 (Biblical DeFi Tithing App)' }
    }, 5000);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

function escapeOverpassString(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractCity(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  return parts.length >= 3 ? parts[parts.length - 3] : parts[0] || '';
}

function extractState(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 2];
    const match = stateZip.match(/^([A-Z]{2})/);
    return match ? match[1] : stateZip.split(' ')[0] || '';
  }
  return '';
}

function extractCountry(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  return parts[parts.length - 1] || 'USA';
}

function expandStateAbbreviation(input: string): string {
  const abbrevs: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  };
  const upper = input.trim().toUpperCase();
  return abbrevs[upper] || input;
}
