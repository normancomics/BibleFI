import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  source: string;
  verified: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'api' }
    });
    
    const { query, location, radius = 50000 } = await req.json();
    
    console.log('Search request:', { query, location, radius });

    const allChurches: ChurchResult[] = [];

    // STEP 1: Search database first
    console.log('Searching database...');
    try {
      let dbQuery = supabase.from('global_churches').select('*');
      
      // Parse location for city/state filtering
      let city = '';
      let state = '';
      if (location) {
        const locationParts = location.split(',').map((p: string) => p.trim());
        if (locationParts.length >= 2) {
          city = locationParts[0];
          state = locationParts[1];
        } else if (locationParts.length === 1) {
          city = locationParts[0];
        }
      }
      
      // Build query conditions
      const conditions: string[] = [];
      
      if (query) {
        conditions.push(`name.ilike.%${query}%`);
        conditions.push(`denomination.ilike.%${query}%`);
      }
      
      if (city) {
        conditions.push(`city.ilike.%${city}%`);
      }
      
      if (state) {
        conditions.push(`state_province.ilike.%${state}%`);
      }
      
      // Apply OR conditions if we have any filters
      if (conditions.length > 0) {
        dbQuery = dbQuery.or(conditions.join(','));
      }
      
      const { data, error } = await dbQuery
        .order('verified', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(50);
      
      if (error) {
        console.error('Database query error:', error);
      } else if (data && data.length > 0) {
        console.log('Found', data.length, 'churches in database');
        
        for (const church of data) {
          allChurches.push({
            id: church.id,
            name: church.name,
            address: church.address || `${church.city}, ${church.state_province || ''}, ${church.country}`.trim(),
            city: church.city,
            state: church.state_province || '',
            country: church.country,
            latitude: null,
            longitude: null,
            rating: church.rating,
            reviewCount: church.review_count,
            phone: church.phone,
            website: church.website,
            source: 'database',
            verified: church.verified || false,
          });
        }
      } else {
        console.log('No churches found in database matching criteria');
      }
    } catch (dbError) {
      console.error('Database search error:', dbError);
    }

    // STEP 2: Try Google Places API if key is available
    if (googleApiKey) {
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
            // Check for duplicates
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
              });
            }
          }
        } else {
          const errorData = await response.json();
          console.log('Google API error (falling back to database):', errorData.error?.message || 'Unknown error');
        }
      } catch (apiError) {
        console.log('Google API request failed:', apiError);
      }
    } else {
      console.log('No Google API key configured, using database only');
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