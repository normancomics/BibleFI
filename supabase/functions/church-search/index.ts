import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const databaseUrl = Deno.env.get('SUPABASE_DB_URL');
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    console.log('Starting church search...');
    
    const { query, location, radius = 50000 } = await req.json();
    console.log('Search request:', { query, location, radius });

    const allChurches: ChurchResult[] = [];

    // STEP 1: Search database using direct PostgreSQL connection
    if (databaseUrl) {
      console.log('Searching database via direct PostgreSQL...');
      try {
        const pool = new Pool(databaseUrl, 1);
        const connection = await pool.connect();
        
        try {
          // Parse location for filtering
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
          
          // Build WHERE conditions
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
          
          console.log('SQL:', sql);
          console.log('Params:', params);
          
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
    } else {
      console.log('No database URL configured');
    }

    // STEP 2: Try Google Places API if key is available and we need more results
    if (googleApiKey && allChurches.length < 5) {
      console.log('Attempting Google Places API search...');
      try {
        const searchQuery = query ? `${query} church` : 'christian church';
        
        // Geocode location if provided
        let locationBias = {};
        if (location) {
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`;
          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status === 'OK' && geocodeData.results?.length > 0) {
            const { lat, lng } = geocodeData.results[0].geometry.location;
            console.log('Location geocoded:', { lat, lng });
            locationBias = {
              circle: {
                center: { latitude: lat, longitude: lng },
                radius: radius
              }
            };
          }
        }

        // Use Places API (New) - Text Search
        const url = 'https://places.googleapis.com/v1/places:searchText';
        
        const requestBody: Record<string, unknown> = {
          textQuery: searchQuery,
          maxResultCount: 20,
        };
        
        if (Object.keys(locationBias).length > 0) {
          requestBody.locationBias = locationBias;
        }

        console.log('Calling Google Places API...');
        
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
            // Check for duplicates by name
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
        } else {
          const errorData = await response.json();
          console.log('Google API error:', errorData.error?.message || 'Unknown error');
        }
      } catch (apiError) {
        console.log('Google API request failed:', apiError);
      }
    }

    console.log('Returning', allChurches.length, 'total churches');

    return new Response(
      JSON.stringify({ 
        churches: allChurches, 
        source: allChurches.length > 0 ? 'combined' : 'none',
        count: allChurches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const err = error as Error;
    console.error('Error in church-search function:', err.message);
    return new Response(
      JSON.stringify({ error: err.message, churches: [] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions to parse address components
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
