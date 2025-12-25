import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  website?: string;
  types?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!googleApiKey) {
      console.error('Google Places API key not configured');
      throw new Error('Google Places API key not configured');
    }

    const { query, location, radius = 50000 } = await req.json();
    
    console.log('Search request:', { query, location, radius });

    // Build search query - always include "church" to filter results
    const searchQuery = query ? `${query} church` : 'christian church';
    
    // Use Text Search API for more flexible searching
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=church&key=${googleApiKey}`;
    
    // Add location bias if provided
    if (location) {
      // First geocode the location to get coordinates
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`;
      console.log('Geocoding location:', location);
      
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const { lat, lng } = geocodeData.results[0].geometry.location;
        url += `&location=${lat},${lng}&radius=${radius}`;
        console.log('Location coordinates:', { lat, lng });
      }
    }

    console.log('Fetching from Google Places API...');
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Google Places API response status:', data.status);
    console.log('Number of results:', data.results?.length || 0);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    // Transform results to our format
    const churches = (data.results || []).map((place: PlaceResult) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      city: extractCity(place.formatted_address),
      state: extractState(place.formatted_address),
      country: extractCountry(place.formatted_address),
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      phone: place.formatted_phone_number,
      website: place.website,
      source: 'google_places',
      verified: true,
    }));

    console.log('Returning', churches.length, 'churches');

    return new Response(JSON.stringify({ 
      churches,
      nextPageToken: data.next_page_token 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in church-search function:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
    // Extract state code (e.g., "TX 75001" -> "TX")
    const match = stateZip.match(/^([A-Z]{2})/);
    return match ? match[1] : stateZip.split(' ')[0] || '';
  }
  return '';
}

function extractCountry(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  return parts[parts.length - 1] || 'USA';
}
