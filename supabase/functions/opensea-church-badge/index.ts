/**
 * BWSP_ChurchNftBadge — reads a church's published Base wallet on OpenSea and
 * returns the single NFT that can act as its badge in Continuous Giving.
 *
 * "Let your light so shine before men" — Matthew 5:16 (KJV)
 *
 * Honest by design: the badge is only ever derived from NFTs actually held by
 * the wallet the church itself published. Nothing is invented, and a wallet
 * holding no NFTs returns { badge: null } rather than a placeholder.
 *
 * Public (no JWT) because the giving directory is public, but rate limited per
 * IP and read-only. The OpenSea key never leaves the server.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { enforceRateLimit } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const CHAIN = 'base';

interface Badge {
  address: string;
  name: string | null;
  collection: string | null;
  image_url: string | null;
  opensea_url: string | null;
  contract: string | null;
  token_id: string | null;
  nft_count: number;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function fetchBadge(address: string, apiKey: string): Promise<Badge | null> {
  const url = `https://api.opensea.io/api/v2/chain/${CHAIN}/account/${address}/nfts?limit=20`;
  const res = await fetch(url, {
    headers: { accept: 'application/json', 'x-api-key': apiKey },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`[opensea-church-badge] ${address} -> ${res.status} ${text.slice(0, 200)}`);
    return null;
  }

  const body = await res.json().catch(() => null);
  const nfts: any[] = Array.isArray(body?.nfts) ? body.nfts : [];
  if (nfts.length === 0) return null;

  // Prefer an NFT that actually has artwork, so the badge renders.
  const pick =
    nfts.find((n) => typeof n?.display_image_url === 'string' && n.display_image_url) ??
    nfts.find((n) => typeof n?.image_url === 'string' && n.image_url) ??
    nfts[0];

  return {
    address,
    name: pick?.name ?? null,
    collection: pick?.collection ?? null,
    image_url: pick?.display_image_url ?? pick?.image_url ?? null,
    opensea_url:
      pick?.opensea_url ??
      (pick?.contract && pick?.identifier
        ? `https://opensea.io/assets/${CHAIN}/${pick.contract}/${pick.identifier}`
        : null),
    contract: pick?.contract ?? null,
    token_id: pick?.identifier ?? null,
    nft_count: nfts.length,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('OPENSEA_API_KEY');
  if (!apiKey) {
    return json({ error: 'OPENSEA_API_KEY is not configured', badges: {} }, 503);
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';

  const limited = await enforceRateLimit({
    functionName: 'opensea-church-badge',
    key: ip,
    maxRequests: 30,
    windowSeconds: 60,
    corsHeaders,
  });
  if (limited) return limited;

  let payload: { addresses?: unknown; address?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Expected a JSON body with { addresses: string[] }' }, 400);
  }

  const raw = Array.isArray(payload.addresses)
    ? payload.addresses
    : typeof payload.address === 'string'
      ? [payload.address]
      : [];

  const addresses = Array.from(
    new Set(
      raw
        .filter((a): a is string => typeof a === 'string')
        .map((a) => a.trim())
        .filter((a) => ADDRESS_RE.test(a))
        .map((a) => a.toLowerCase()),
    ),
  ).slice(0, 12);

  if (addresses.length === 0) {
    return json({ error: 'No valid Base wallet address supplied', badges: {} }, 400);
  }

  const results = await Promise.all(
    addresses.map(async (address) => {
      try {
        return [address, await fetchBadge(address, apiKey)] as const;
      } catch (e) {
        console.warn(`[opensea-church-badge] failed for ${address}:`, e);
        return [address, null] as const;
      }
    }),
  );

  const badges: Record<string, Badge | null> = {};
  for (const [address, badge] of results) badges[address] = badge;

  return json({ chain: CHAIN, badges });
});
