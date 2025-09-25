
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'default';
    const verse = url.searchParams.get('verse') || '';
    const reference = url.searchParams.get('reference') || '';
    const fid = url.searchParams.get('fid') || '';

    // Generate SVG image based on type
    const svg = generateSVGImage(type, { verse, reference, fid });
    
    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Return a fallback image
    const fallbackSvg = generateFallbackImage();
    
    return new Response(fallbackSvg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml; charset=utf-8',
      },
    });
  }
});

function generateSVGImage(type: string, data: { verse?: string; reference?: string; fid?: string }): string {
  const width = 1200;
  const height = 628; // 1.91:1 aspect ratio
  
  let content = '';
  let backgroundColor = '#1a1a2e';
  let title = 'Bible.fi';
  let subtitle = 'Biblical Financial Wisdom on Base Chain';
  
  switch (type) {
    case 'wisdom':
      backgroundColor = '#2d1b69';
      title = 'Biblical Wisdom';
      subtitle = 'Learn timeless financial principles from Scripture';
      content = `
        <rect x="100" y="250" width="1000" height="3" fill="#FFD700" rx="1"/>
        <text x="600" y="350" text-anchor="middle" font-size="32" fill="#FFD700" font-family="serif">
          "Honor the LORD with your wealth, with the
        </text>
        <text x="600" y="390" text-anchor="middle" font-size="32" fill="#FFD700" font-family="serif">
          firstfruits of all your crops." - Proverbs 3:9
        </text>
      `;
      break;
      
    case 'defi':
      backgroundColor = '#0f3460';
      title = 'Biblical DeFi';
      subtitle = 'Decentralized Finance with Divine Wisdom';
      content = `
        <circle cx="300" cy="350" r="50" fill="#8B5CF6" opacity="0.6"/>
        <circle cx="600" cy="300" r="40" fill="#FFD700" opacity="0.8"/>
        <circle cx="900" cy="350" r="45" fill="#10B981" opacity="0.6"/>
        <text x="600" y="450" text-anchor="middle" font-size="28" fill="#E5E7EB">
          Stake • Farm • Lend with Biblical Principles
        </text>
      `;
      break;
      
    case 'tithe':
      backgroundColor = '#16213e';
      title = 'Digital Tithing';
      subtitle = 'Give faithfully on Base Chain';
      content = `
        <rect x="400" y="250" width="400" height="200" rx="20" fill="none" stroke="#FFD700" stroke-width="3"/>
        <text x="600" y="350" text-anchor="middle" font-size="48" fill="#FFD700">💝</text>
        <text x="600" y="420" text-anchor="middle" font-size="24" fill="#E5E7EB">
          Support your church with crypto donations
        </text>
      `;
      break;
      
    case 'share':
      backgroundColor = '#8B5CF6';
      title = 'Share Wisdom';
      subtitle = 'Spread biblical financial knowledge';
      content = `
        <text x="600" y="350" text-anchor="middle" font-size="64" fill="#FFD700">📖</text>
        <text x="600" y="420" text-anchor="middle" font-size="24" fill="#E5E7EB">
          Share Bible.fi with your network
        </text>
      `;
      break;
      
    case 'verse':
      if (data.verse && data.reference) {
        backgroundColor = '#2d1b69';
        title = data.reference;
        subtitle = data.verse.substring(0, 100) + (data.verse.length > 100 ? '...' : '');
        content = `
          <rect x="50" y="250" width="1100" height="200" rx="15" fill="rgba(255,215,0,0.1)" stroke="#FFD700" stroke-width="2"/>
          <text x="600" y="300" text-anchor="middle" font-size="24" fill="#FFD700" font-style="italic">
            "${data.verse.substring(0, 80)}${data.verse.length > 80 ? '...' : ''}"
          </text>
          <text x="600" y="420" text-anchor="middle" font-size="28" fill="#E5E7EB" font-weight="bold">
            ${data.reference}
          </text>
        `;
      }
      break;
      
    default:
      content = `
        <text x="600" y="350" text-anchor="middle" font-size="48" fill="#FFD700">⛪</text>
        <text x="600" y="420" text-anchor="middle" font-size="24" fill="#E5E7EB">
          Built on Base Chain for Farcaster
        </text>
      `;
  }

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustColor(backgroundColor, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Header -->
      <text x="600" y="100" text-anchor="middle" font-size="72" fill="#FFD700" font-weight="bold" font-family="serif">
        ${title}
      </text>
      
      <text x="600" y="140" text-anchor="middle" font-size="24" fill="#E5E7EB" font-family="sans-serif">
        ${subtitle}
      </text>
      
      <!-- Content -->
      ${content}
      
      <!-- Footer -->
      <text x="600" y="580" text-anchor="middle" font-size="18" fill="#9CA3AF">
        Bible.fi • Made on Base Chain
      </text>
    </svg>
  `;
}

function generateFallbackImage(): string {
  return `
    <svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <text x="600" y="314" text-anchor="middle" font-size="72" fill="#FFD700" font-weight="bold">
        Bible.fi
      </text>
      <text x="600" y="360" text-anchor="middle" font-size="24" fill="#E5E7EB">
        Biblical Financial Wisdom on Base Chain
      </text>
    </svg>
  `;
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Simple SVG to PNG conversion using base64 encoding
async function svgToPng(svg: string): Promise<Uint8Array> {
  // For now, return the SVG as bytes since PNG conversion requires additional libraries
  // In production, you might want to use a service like Puppeteer or sharp
  const encoder = new TextEncoder();
  return encoder.encode(svg);
}
