
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  checkRateLimit, 
  getClientIP, 
  getOptionalUser,
  validateInput,
  errorResponse,
  rateLimitResponse 
} from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Whitelist of allowed Neynar API endpoints to prevent arbitrary access
const ALLOWED_ENDPOINTS = [
  '/farcaster/user',
  '/farcaster/user/bulk',
  '/farcaster/cast',
  '/farcaster/casts',
  '/farcaster/feed',
  '/farcaster/channel',
  '/farcaster/notifications',
  '/farcaster/frame',
  '/farcaster/frame/validate',
];

// Validate endpoint is in whitelist
function isAllowedEndpoint(endpoint: string): boolean {
  if (!endpoint || typeof endpoint !== 'string') return false;
  
  // Normalize the endpoint
  const normalizedEndpoint = endpoint.toLowerCase().split('?')[0];
  
  // Check if endpoint starts with any allowed prefix
  return ALLOWED_ENDPOINTS.some(allowed => 
    normalizedEndpoint.startsWith(allowed.toLowerCase())
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const farcasterApiKey = Deno.env.get('FARCASTER_API_KEY');
    
    if (!farcasterApiKey) {
      console.error('Farcaster API key not configured');
      return errorResponse('Service temporarily unavailable', 503, corsHeaders);
    }

    // Get user (optional - allows authenticated and unauthenticated but rate-limits differently)
    const { user } = await getOptionalUser(req);
    const clientIP = getClientIP(req);
    
    // Rate limiting: stricter for anonymous users
    const rateLimitKey = user ? `farcaster:${user.id}` : `farcaster:ip:${clientIP}`;
    const maxRequests = user ? 50 : 10; // 50/min for authenticated, 10/min for anonymous
    
    const rateLimit = checkRateLimit(rateLimitKey, maxRequests, 60000);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for ${rateLimitKey}`);
      return rateLimitResponse(rateLimit.resetAt, corsHeaders);
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON body', 400, corsHeaders);
    }

    const { endpoint, method = 'GET', data } = body;

    // Validate endpoint parameter
    const endpointValidation = validateInput(endpoint, {
      maxLength: 200,
      fieldName: 'Endpoint',
      allowedPattern: /^[a-zA-Z0-9\-_/?=&.]+$/
    });
    
    if (!endpointValidation.valid) {
      return errorResponse(endpointValidation.error || 'Invalid endpoint', 400, corsHeaders);
    }

    // Check endpoint is in whitelist
    if (!isAllowedEndpoint(endpoint)) {
      console.warn(`Blocked access to non-whitelisted endpoint: ${endpoint}`);
      return errorResponse('Endpoint not allowed', 403, corsHeaders);
    }

    // Validate HTTP method
    const allowedMethods = ['GET', 'POST'];
    if (!allowedMethods.includes(method.toUpperCase())) {
      return errorResponse('Method not allowed', 405, corsHeaders);
    }

    // Log the request (without sensitive data)
    console.log(`Farcaster API request: ${method} ${endpoint} by ${user?.id || 'anonymous'}`);
    
    const farcasterResponse = await fetch(`https://api.neynar.com/v2${endpoint}`, {
      method: method.toUpperCase(),
      headers: {
        'api_key': farcasterApiKey,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await farcasterResponse.json();

    // Add rate limit headers to response
    return new Response(JSON.stringify(responseData), {
      status: farcasterResponse.status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt / 1000).toString()
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in farcaster-api function:', err.message);
    
    // Don't expose internal error details
    return errorResponse('An error occurred processing your request', 500, corsHeaders);
  }
});
