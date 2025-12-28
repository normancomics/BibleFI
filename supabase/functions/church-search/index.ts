import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
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
    
    // Get location coordinates if provided
    let locationBias = {};
    if (location) {
      // First geocode the location to get coordinates using Geocoding API
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`;
      console.log('Geocoding location:', location);
      
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const { lat, lng } = geocodeData.results[0].geometry.location;
        console.log('Location coordinates:', { lat, lng });
        locationBias = {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius
          }
        };
      }
    }

    // Use the new Places API (New) - Text Search
    const url = 'https://places.googleapis.com/v1/places:searchText';
    
    const requestBody = {
      textQuery: searchQuery,
      includedType: 'church',
      maxResultCount: 20,
      ...(Object.keys(locationBias).length > 0 && { locationBias })
    };

    console.log('Fetching from Google Places API (New)...');
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.types'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    console.log('Google Places API response status:', response.status);
    console.log('Number of results:', data.places?.length || 0);

    if (!response.ok) {
      console.error('Google Places API error:', data.error?.message || 'Unknown error');
      throw new Error(`Google Places API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Transform results to our format
    const churches = (data.places || []).map((place: PlaceResult) => ({
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
      source: 'google_places_new',
      verified: true,
    }));

    console.log('Returning', churches.length, 'churches');

    return new Response(JSON.stringify({ churches }), {
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
