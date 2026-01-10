import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const databaseUrl = Deno.env.get('SUPABASE_DB_URL');
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    console.log('Starting global church search...');
    
    const { query, location, radius = 50000, continent } = await req.json();
    console.log('Search request:', { query, location, radius, continent });

    const allChurches: ChurchResult[] = [];

    // STEP 1: Search local database first
    if (databaseUrl) {
      console.log('Searching database via PostgreSQL...');
      try {
        const pool = new Pool(databaseUrl, 1);
        const connection = await pool.connect();
        
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
          
          const conditions: string[] = [];
          const params: string[] = [];
          let paramIndex = 1;
          
          if (query) {
            conditions.push(`(name ILIKE $${paramIndex} OR denomination ILIKE $${paramIndex})`);
            params.push(`%${query}%`);
            paramIndex++;
          }
          
          if (searchCity) {
            conditions.push(`(city ILIKE $${paramIndex} OR state_province ILIKE $${paramIndex} OR country ILIKE $${paramIndex})`);
            params.push(`%${searchCity}%`);
            paramIndex++;
          }
          
          if (searchState && searchState !== searchCity) {
            conditions.push(`state_province ILIKE $${paramIndex}`);
            params.push(`%${searchState}%`);
            paramIndex++;
          }
          
          let sql = `
            SELECT 
              id, name, address, city, state_province, country,
              rating, review_count, phone, website, 
              verified, accepts_crypto, crypto_networks, denomination
            FROM global_churches
          `;
          
          if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' OR ')}`;
          }
          
          sql += ` ORDER BY verified DESC NULLS LAST, rating DESC NULLS LAST LIMIT 50`;
          
          const result = await connection.queryObject(sql, params);
          console.log('Found', result.rows.length, 'churches in database');
          
          for (const row of result.rows as Record<string, unknown>[]) {
            allChurches.push({
              id: row.id as string,
              name: row.name as string,
              address: (row.address as string) || `${row.city}, ${row.state_province || ''}, ${row.country}`.trim(),
              city: row.city as string,
              state: (row.state_province as string) || '',
              country: row.country as string,
              latitude: null,
              longitude: null,
              rating: row.rating as number | null,
              reviewCount: row.review_count as number | null,
              phone: row.phone as string | null,
              website: row.website as string | null,
              source: 'database',
              verified: (row.verified as boolean) || false,
              acceptsCrypto: (row.accepts_crypto as boolean) || false,
              cryptoNetworks: (row.crypto_networks as string[]) || [],
              denomination: row.denomination as string | null,
            });
          }
        } finally {
          connection.release();
        }
        
        await pool.end();
      } catch (dbError) {
        console.error('Database search error:', dbError);
      }
    }

    // STEP 2: Use OpenStreetMap Overpass API for global coverage (FREE)
    if (allChurches.length < 20 && (location || query || continent)) {
      console.log('Searching OpenStreetMap Overpass API...');
      try {
        let overpassQuery: string;
        
        if (continent) {
          // Search by continent
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
          // Geocode location first
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
            // Fallback to area search
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
          // Global name search
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
              
              // Check for duplicates
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
        
        // Geocode for location bias
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
      JSON.stringify({ error: err.message, churches: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Geocode location using Nominatim (free)
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

// Escape special characters for Overpass regex
function escapeOverpassString(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper functions for Google Places address parsing
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
