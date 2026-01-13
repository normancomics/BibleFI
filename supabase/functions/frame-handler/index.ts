import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, errorResponse, rateLimitResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting - 30 requests per minute for frames (higher for interactive use)
    const clientIP = getClientIP(req);
    const rateLimitKey = `frame-handler:${clientIP}`;
    const isAllowed = await checkRateLimit(rateLimitKey, 30, 60000);
    
    if (!isAllowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return rateLimitResponse(corsHeaders);
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const body = await req.json();
    console.log('Frame request received:', JSON.stringify(body).slice(0, 200));

    // Parse the frame message from Farcaster
    const { untrustedData } = body;
    const buttonIndex = untrustedData?.buttonIndex || 1;
    const fid = untrustedData?.fid;

    // Validate buttonIndex is a number between 1-4
    if (typeof buttonIndex !== 'number' || buttonIndex < 1 || buttonIndex > 4) {
      return errorResponse('Invalid button index', 400, corsHeaders);
    }

    // Generate response based on button clicked
    let responseHtml = '';
    
    switch (buttonIndex) {
      case 1: // Biblical Wisdom
        responseHtml = generateWisdomFrame();
        break;
      case 2: // DeFi Swaps
        responseHtml = generateDefiFrame();
        break;
      case 3: // Digital Tithing
        responseHtml = generateTitheFrame();
        break;
      case 4: // Share Wisdom
        responseHtml = generateShareFrame(fid);
        break;
      default:
        responseHtml = generateDefaultFrame();
    }

    return new Response(responseHtml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in frame-handler:', error);
    return new Response(generateErrorFrame(), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });
  }
});

function generateDefaultFrame(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=default" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Biblical Wisdom" />
  <meta property="fc:frame:button:1:action" content="post" />
  <meta property="fc:frame:button:2" content="DeFi Swaps" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:button:3" content="Digital Tithing" />
  <meta property="fc:frame:button:3:action" content="post" />
  <meta property="fc:frame:button:4" content="Share Wisdom" />
  <meta property="fc:frame:button:4:action" content="post" />
  <meta property="fc:frame:post_url" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler" />
</head>
<body>
  <h1>Bible.fi - Biblical Financial Wisdom</h1>
</body>
</html>`;
}

function generateWisdomFrame(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=wisdom" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Learn More" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="https://biblefi.base.eth/wisdom" />
  <meta property="fc:frame:button:2" content="Back to Menu" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler" />
</head>
<body>
  <h1>Biblical Wisdom for Financial Stewardship</h1>
</body>
</html>`;
}

function generateDefiFrame(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=defi" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Start DeFi" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="https://biblefi.base.eth/defi" />
  <meta property="fc:frame:button:2" content="Back to Menu" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler" />
</head>
<body>
  <h1>Biblical DeFi on Base Chain</h1>
</body>
</html>`;
}

function generateTitheFrame(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=tithe" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Start Tithing" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="https://biblefi.base.eth/tithe" />
  <meta property="fc:frame:button:2" content="Back to Menu" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler" />
</head>
<body>
  <h1>Digital Tithing</h1>
</body>
</html>`;
}

function generateShareFrame(fid?: number): string {
  // Sanitize fid to prevent injection
  const safeFid = typeof fid === 'number' ? fid : '';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=share&fid=${safeFid}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Share Wisdom" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="https://warpcast.com/~/compose?text=Check%20out%20Bible.fi%20for%20biblical%20financial%20wisdom%20on%20Base%20Chain!" />
  <meta property="fc:frame:button:2" content="Back to Menu" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler" />
</head>
<body>
  <h1>Share Biblical Wisdom</h1>
</body>
</html>`;
}

function generateErrorFrame(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=error" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Try Again" />
  <meta property="fc:frame:button:1:action" content="post" />
  <meta property="fc:frame:post_url" content="https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler" />
</head>
<body>
  <h1>Something went wrong</h1>
</body>
</html>`;
}