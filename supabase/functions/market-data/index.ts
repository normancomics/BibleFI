import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function unauthorized(msg = 'Authentication required') {
  return new Response(JSON.stringify({ error: msg }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // --- Auth gate: require valid JWT ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized();
  }
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return unauthorized('Invalid or expired token');
  }

  try {
    const { source, query } = await req.json();
    console.log(`📊 Market data request: source=${source}`);

    let data: any = {};

    switch (source) {
      case 'dune': {
        data = await fetchDuneData(query);
        break;
      }
      case 'neynar': {
        data = await fetchNeynarData(query);
        break;
      }
      case 'defillama': {
        data = await fetchDeFiLlamaData();
        break;
      }
      case 'coingecko': {
        data = await fetchCoinGeckoData();
        break;
      }
      case 'basescan': {
        data = await fetchBaseScanData(query);
        break;
      }
      case 'superfluid': {
        data = await fetchSuperfluidData(query);
        break;
      }
      case 'all': {
        // Aggregate all sources in parallel
        const [prices, protocols, sentiment, baseActivity, farcasterCasts] = await Promise.allSettled([
          fetchCoinGeckoData(),
          fetchDeFiLlamaData(),
          fetchFearGreedIndex(),
          fetchBaseScanData(query),
          fetchNeynarData({ type: 'search', term: 'bible defi base' }),
        ]);

        data = {
          prices: prices.status === 'fulfilled' ? prices.value : [],
          protocols: protocols.status === 'fulfilled' ? protocols.value : [],
          sentiment: sentiment.status === 'fulfilled' ? sentiment.value : null,
          baseActivity: baseActivity.status === 'fulfilled' ? baseActivity.value : null,
          farcasterCasts: farcasterCasts.status === 'fulfilled' ? farcasterCasts.value : [],
          lastUpdated: new Date().toISOString(),
        };
        break;
      }
      default:
        throw new Error(`Unknown source: ${source}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Market data error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ============ DUNE ANALYTICS ============
async function fetchDuneData(query?: any) {
  const apiKey = Deno.env.get('DUNE_API_KEY');
  if (!apiKey) {
    console.warn('DUNE_API_KEY not set, returning cached data');
    return getDefaultDuneData();
  }

  try {
    // Query Base chain TVL, volume, active addresses
    const queryId = query?.queryId || 3521583; // Base chain overview query
    const res = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results?limit=20`, {
      headers: { 'X-Dune-API-Key': apiKey },
    });

    if (!res.ok) {
      console.warn(`Dune API returned ${res.status}`);
      return getDefaultDuneData();
    }

    const data = await res.json();
    return {
      source: 'dune',
      rows: data.result?.rows || [],
      metadata: data.result?.metadata || {},
      executionId: data.execution_id,
    };
  } catch (error) {
    console.error('Dune fetch error:', error);
    return getDefaultDuneData();
  }
}

function getDefaultDuneData() {
  return {
    source: 'dune',
    rows: [
      { metric: 'Base TVL', value: 12500000000, unit: 'USD', change_24h: 2.3 },
      { metric: 'Daily Active Addresses', value: 1200000, unit: 'addresses', change_24h: 5.1 },
      { metric: '24h Volume', value: 850000000, unit: 'USD', change_24h: -1.2 },
      { metric: 'Total Transactions', value: 45000000, unit: 'txns', change_24h: 3.7 },
    ],
    cached: true,
  };
}

// ============ NEYNAR (FARCASTER) ============
async function fetchNeynarData(query?: any) {
  const apiKey = Deno.env.get('NEYNAR_API_KEY');
  if (!apiKey) {
    console.warn('NEYNAR_API_KEY not set, returning sample data');
    return getDefaultNeynarData();
  }

  try {
    const type = query?.type || 'search';
    let url: string;
    const headers = { 'accept': 'application/json', 'x-api-key': apiKey };

    if (type === 'search') {
      const term = encodeURIComponent(query?.term || 'biblefi defi');
      url = `https://api.neynar.com/v2/farcaster/cast/search?q=${term}&limit=10`;
    } else if (type === 'trending') {
      url = `https://api.neynar.com/v2/farcaster/feed/trending?limit=10&time_window=24h`;
    } else if (type === 'channel') {
      const channelId = query?.channelId || 'base';
      url = `https://api.neynar.com/v2/farcaster/feed/channels?channel_ids=${channelId}&limit=10`;
    } else {
      url = `https://api.neynar.com/v2/farcaster/feed/trending?limit=5`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`Neynar API returned ${res.status}`);
      return getDefaultNeynarData();
    }

    const data = await res.json();
    const casts = (data.casts || data.result?.casts || []).map((cast: any) => ({
      hash: cast.hash,
      text: cast.text?.substring(0, 280),
      author: cast.author?.display_name || cast.author?.username,
      authorFid: cast.author?.fid,
      reactions: cast.reactions?.likes_count || 0,
      replies: cast.replies?.count || 0,
      timestamp: cast.timestamp,
      channelId: cast.channel?.id,
    }));

    return { source: 'neynar', casts, total: casts.length };
  } catch (error) {
    console.error('Neynar fetch error:', error);
    return getDefaultNeynarData();
  }
}

function getDefaultNeynarData() {
  return {
    source: 'neynar',
    casts: [
      { text: 'BibleFi bringing tithing onchain 🙏', author: 'biblefi', reactions: 42, timestamp: new Date().toISOString() },
      { text: 'Base chain DeFi is the future of Kingdom finance', author: 'cryptofaith', reactions: 28, timestamp: new Date().toISOString() },
    ],
    cached: true,
  };
}

// ============ DEFI LLAMA ============
async function fetchDeFiLlamaData() {
  try {
    const res = await fetch('https://api.llama.fi/protocols');
    if (!res.ok) return getDefaultProtocols();

    const protocols = await res.json();
    const baseProtocols = protocols
      .filter((p: any) => p.chains?.includes('Base') && p.tvl > 1000000)
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, 20)
      .map((p: any) => ({
        name: p.name,
        tvl: Math.round(p.tvl),
        tvlChange24h: p.change_1d || 0,
        category: p.category || 'Other',
        chain: 'Base',
        logo: p.logo,
        url: p.url,
      }));

    return { source: 'defillama', protocols: baseProtocols, total: baseProtocols.length };
  } catch (error) {
    console.error('DeFiLlama error:', error);
    return getDefaultProtocols();
  }
}

function getDefaultProtocols() {
  return {
    source: 'defillama',
    protocols: [
      { name: 'Aerodrome', tvl: 800000000, category: 'Dexes', chain: 'Base' },
      { name: 'Aave V3', tvl: 500000000, category: 'Lending', chain: 'Base' },
      { name: 'Compound V3', tvl: 300000000, category: 'Lending', chain: 'Base' },
      { name: 'Moonwell', tvl: 200000000, category: 'Lending', chain: 'Base' },
    ],
    cached: true,
  };
}

// ============ COINGECKO ============
async function fetchCoinGeckoData() {
  try {
    const ids = 'ethereum,usd-coin,dai,bitcoin,tether,superfluid';
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    if (!res.ok) return getDefaultPrices();

    const data = await res.json();
    const map: Record<string, { symbol: string; name: string }> = {
      ethereum: { symbol: 'ETH', name: 'Ethereum' },
      'usd-coin': { symbol: 'USDC', name: 'USD Coin' },
      dai: { symbol: 'DAI', name: 'Dai' },
      bitcoin: { symbol: 'cbBTC', name: 'Coinbase BTC' },
      tether: { symbol: 'USDT', name: 'Tether' },
      superfluid: { symbol: 'SUP', name: 'Superfluid' },
    };

    const prices = Object.entries(map)
      .filter(([id]) => data[id])
      .map(([id, { symbol, name }]) => ({
        symbol, name,
        price: data[id].usd,
        change24h: data[id].usd_24h_change || 0,
        volume24h: data[id].usd_24h_vol || 0,
        marketCap: data[id].usd_market_cap || 0,
      }));

    return { source: 'coingecko', prices };
  } catch {
    return getDefaultPrices();
  }
}

function getDefaultPrices() {
  return {
    source: 'coingecko',
    prices: [
      { symbol: 'ETH', name: 'Ethereum', price: 2800, change24h: 0 },
      { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0 },
      { symbol: 'cbBTC', name: 'Coinbase BTC', price: 98000, change24h: 0 },
    ],
    cached: true,
  };
}

// ============ BASESCAN ============
async function fetchBaseScanData(query?: any) {
  const apiKey = Deno.env.get('BASESCAN_API_KEY');
  if (!apiKey) return { source: 'basescan', gasPrice: '0.01 gwei', cached: true };

  try {
    // Gas price
    const gasRes = await fetch(`https://api.basescan.org/api?module=gastracker&action=gasoracle&apikey=${apiKey}`);
    const gasData = await gasRes.json();

    // Optionally get token balances for a specific address
    let balances = null;
    if (query?.address) {
      const balRes = await fetch(
        `https://api.basescan.org/api?module=account&action=balance&address=${query.address}&tag=latest&apikey=${apiKey}`
      );
      const balData = await balRes.json();
      balances = { eth: balData.result ? Number(balData.result) / 1e18 : 0 };
    }

    return {
      source: 'basescan',
      gasPrice: {
        low: gasData.result?.SafeGasPrice || '0.001',
        standard: gasData.result?.ProposeGasPrice || '0.01',
        fast: gasData.result?.FastGasPrice || '0.05',
      },
      balances,
    };
  } catch (error) {
    console.error('BaseScan error:', error);
    return { source: 'basescan', gasPrice: '0.01 gwei', cached: true };
  }
}

// ============ SUPERFLUID INDEXER ============
async function fetchSuperfluidData(query?: any) {
  try {
    const gql = query?.userAddress
      ? `{ accounts(where: {id: "${query.userAddress.toLowerCase()}"}) { id outflows { currentFlowRate receiver { id } token { symbol } } inflows { currentFlowRate sender { id } token { symbol } } } }`
      : `{ streams(first: 20, orderBy: updatedAtTimestamp, orderDirection: desc) { id sender receiver currentFlowRate streamedUntilUpdatedAt updatedAtTimestamp token { symbol } } }`;

    const res = await fetch('https://base-mainnet.subgraph.x.superfluid.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gql }),
    });
    if (!res.ok) return { source: 'superfluid', streams: [] };

    const data = await res.json();
    return { source: 'superfluid', data: data.data };
  } catch {
    return { source: 'superfluid', streams: [], cached: true };
  }
}

// ============ FEAR & GREED ============
async function fetchFearGreedIndex() {
  try {
    const res = await fetch('https://api.alternative.me/fng/');
    if (!res.ok) return { index: 50, label: 'Neutral' };
    const data = await res.json();
    const val = data.data?.[0];
    return {
      index: Number(val?.value || 50),
      label: val?.value_classification || 'Neutral',
      timestamp: val?.timestamp,
    };
  } catch {
    return { index: 50, label: 'Neutral' };
  }
}
