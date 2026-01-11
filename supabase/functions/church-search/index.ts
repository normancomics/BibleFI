import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

// Rate limiting map (in-memory, resets on cold start)
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

/**
 * Validate and sanitize search input to prevent injection attacks
 */
function validateSearchInput(input: string | undefined): string | null {
  if (!input) return null;
  
  // Max length 100 chars, alphanumeric + common characters only
  const sanitized = input.trim().slice(0, 100);
  if (!/^[a-zA-Z0-9\s\-,.'&]+$/.test(sanitized)) {
    return null; // Invalid characters
  }
  return sanitized;
}

/**
 * Check rate limit (10 requests per minute per IP)
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  const limit = rateLimits.get(identifier);
  
  if (!limit || now > limit.reset) {
    rateLimits.set(identifier, { count: 1, reset: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxRequests) {
    return false;
  }
  
  limit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before trying again.', churches: [] }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Starting global church search...');
    
    const { query: rawQuery, location: rawLocation, radius = 50000, continent: rawContinent } = await req.json();
    
    // Validate and sanitize inputs
    const query = validateSearchInput(rawQuery);
    const location = validateSearchInput(rawLocation);
    const continent = validateSearchInput(rawContinent);
    
    console.log('Search request (sanitized):', { query, location, radius, continent });

    const allChurches: ChurchResult[] = [];

    // STEP 1: Search local database using Supabase client (prevents SQL injection)
    console.log('Searching database via Supabase client...');
    try {
      let searchCity = '';
      let searchState = '';
      if (location) {
        const locationParts = location.split(',').map((p: string) => p.trim());
        if (locationParts.length >= 2) {
          searchCity = locationParts[0];
          searchState = locationParts[1];
        } else if (locationParts.length === 1) {
          searchCity = locationParts[0];
        }
      }
      
      // Build query using Supabase client (safe from SQL injection)
      let dbQuery = supabase
        .from('global_churches')
        .select('id, name, address, city, state_province, country, rating, review_count, phone, website, verified, accepts_crypto, crypto_networks, denomination')
        .limit(50);
      
      // Apply filters using Supabase's built-in sanitization
      if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,denomination.ilike.%${query}%`);
      }
      
      if (searchCity) {
        dbQuery = dbQuery.or(`city.ilike.%${searchCity}%,state_province.ilike.%${searchCity}%,country.ilike.%${searchCity}%`);
      }
      
      if (searchState && searchState !== searchCity) {
        dbQuery = dbQuery.ilike('state_province', `%${searchState}%`);
      }
      
      dbQuery = dbQuery.order('verified', { ascending: false, nullsFirst: false })
                       .order('rating', { ascending: false, nullsFirst: false });
      
      const { data: rows, error } = await dbQuery;
      
      if (error) {
        console.error('Database query error:', error);
      } else {
        console.log('Found', rows?.length || 0, 'churches in database');
        
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
      console.error('Database search error:', dbError);
    }

    // STEP 2: Use OpenStreetMap Overpass API for global coverage (FREE)
    if (allChurches.length < 20 && (location || query || continent)) {
      console.log('Searching OpenStreetMap Overpass API...');
      try {
        let overpassQuery: string;
        
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
          overpassQuery = `
            [out:json][timeout:60];
            (
              node["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(${bbox});
              way["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(${bbox});
            );
            out center 100;
          `;
        } else if (location) {
          const coords = await geocodeLocation(location);
          if (coords) {
            const nameClause = query ? `["name"~"${escapeOverpassString(query)}",i]` : '';
            overpassQuery = `
              [out:json][timeout:30];
              (
                node["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(around:${radius},${coords.lat},${coords.lon});
                way["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(around:${radius},${coords.lat},${coords.lon});
                node["building"="church"]${nameClause}(around:${radius},${coords.lat},${coords.lon});
                way["building"="church"]${nameClause}(around:${radius},${coords.lat},${coords.lon});
              );
              out center 100;
            `;
          } else {
            overpassQuery = `
              [out:json][timeout:30];
              area["name"~"${escapeOverpassString(location)}",i]->.searchArea;
              (
                node["amenity"="place_of_worship"]["religion"="christian"](area.searchArea);
                way["amenity"="place_of_worship"]["religion"="christian"](area.searchArea);
              );
              out center 100;
            `;
          }
        } else if (query) {
          overpassQuery = `
            [out:json][timeout:45];
            (
              node["amenity"="place_of_worship"]["religion"="christian"]["name"~"${escapeOverpassString(query)}",i];
              way["amenity"="place_of_worship"]["religion"="christian"]["name"~"${escapeOverpassString(query)}",i];
            );
            out center 50;
          `;
        } else {
          overpassQuery = '';
        }

        if (overpassQuery) {
          const osmResponse = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(overpassQuery)}`
          });

          if (osmResponse.ok) {
            const osmData = await osmResponse.json();
            console.log('OpenStreetMap returned', osmData.elements?.length || 0, 'results');
            
            for (const el of (osmData.elements || [])) {
              if (!el.tags?.name) continue;
              
              const isDuplicate = allChurches.some(c => 
                c.name.toLowerCase() === (el.tags?.name || '').toLowerCase()
              );
              
              if (!isDuplicate) {
                const lat = el.lat || el.center?.lat;
                const lon = el.lon || el.center?.lon;
                const tags = el.tags || {};
                
                const address = [
                  tags['addr:housenumber'],
                  tags['addr:street'],
                  tags['addr:city'],
                  tags['addr:state'],
                  tags['addr:postcode']
                ].filter(Boolean).join(', ');

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
            console.log('Overpass API error:', osmResponse.status);
          }
        }
      } catch (osmError) {
        console.log('OpenStreetMap search error:', osmError);
      }
    }

    // STEP 3: Google Places API as final fallback (if configured and still need results)
    if (googleApiKey && allChurches.length < 5 && location) {
      console.log('Attempting Google Places API fallback...');
      try {
        const searchQuery = query ? `${query} church` : 'christian church';
        
        let locationBias = {};
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.status === 'OK' && geocodeData.results?.length > 0) {
          const { lat, lng } = geocodeData.results[0].geometry.location;
          locationBias = {
            circle: { center: { latitude: lat, longitude: lng }, radius: radius }
          };
        }

        const url = 'https://places.googleapis.com/v1/places:searchText';
        const requestBody: Record<string, unknown> = {
          textQuery: searchQuery,
          maxResultCount: 20,
        };
        
        if (Object.keys(locationBias).length > 0) {
          requestBody.locationBias = locationBias;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Google API returned', data.places?.length || 0, 'results');
          
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
        console.log('Google API fallback failed:', apiError);
      }
    }

    console.log('Returning', allChurches.length, 'total churches');

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
    console.error('Error in church-search function:', err.message);
    return new Response(
      JSON.stringify({ error: 'An error occurred while searching', churches: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `${NOMINATIM_API_URL}/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Bible.fi/1.0 (Biblical DeFi Tithing App)' }
    });
    
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
