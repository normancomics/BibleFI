import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Biblical wisdom mapped to market conditions
const BIBLICAL_MARKET_WISDOM: Record<string, { scripture: string; reference: string; action: string }> = {
  extreme_greed: {
    scripture: 'Pride goeth before destruction, and an haughty spirit before a fall.',
    reference: 'Proverbs 16:18',
    action: 'Exercise caution. Markets driven by greed often precede corrections. Consider taking profits and diversifying.',
  },
  greed: {
    scripture: 'He that maketh haste to be rich shall not be innocent.',
    reference: 'Proverbs 28:20',
    action: 'Remain disciplined. Avoid FOMO-driven investments. Stick to your stewardship plan.',
  },
  neutral: {
    scripture: 'The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.',
    reference: 'Proverbs 21:5',
    action: 'Good time for research and measured entry. Practice diligent analysis before committing capital.',
  },
  fear: {
    scripture: 'Cast your bread upon the waters, for you will find it after many days.',
    reference: 'Ecclesiastes 11:1',
    action: 'Fear creates opportunity for the patient steward. Consider dollar-cost averaging into strong positions.',
  },
  extreme_fear: {
    scripture: 'Buy the truth, and sell it not; also wisdom, and instruction, and understanding.',
    reference: 'Proverbs 23:23',
    action: 'Maximum fear often signals generational buying opportunities. The wise steward accumulates when others panic.',
  },
  high_yield: {
    scripture: 'And he that had received five talents came and brought other five talents, saying, Lord, thou deliveredst unto me five talents: behold, I have gained beside them five talents more.',
    reference: 'Matthew 25:20',
    action: 'High yield opportunity detected. Ensure it aligns with sound stewardship (not overleveraged). Diversify per Ecclesiastes 11:2.',
  },
  high_risk: {
    scripture: 'The prudent sees danger and hides himself, but the simple go on and suffer for it.',
    reference: 'Proverbs 22:3',
    action: 'High risk detected. Reduce exposure. The wise steward protects capital before seeking returns.',
  },
  whale_movement: {
    scripture: 'Where no counsel is, the people fall: but in the multitude of counsellors there is safety.',
    reference: 'Proverbs 11:14',
    action: 'Large wallet movements detected. Monitor for potential market impact. Do not follow blindly.',
  },
};

// Base chain token addresses
const BASE_TOKENS: Record<string, string> = {
  ETH: '0x0000000000000000000000000000000000000000',
  WETH: '0x4200000000000000000000000000000000000006',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
};

// DeFi protocols on Base to monitor (expanded)
const BASE_PROTOCOLS = [
  { name: 'Aerodrome', slug: 'aerodrome-v2', type: 'dex' },
  { name: 'Uniswap V3 (Base)', slug: 'uniswap-v3-base', type: 'dex' },
  { name: 'Aave V3 (Base)', slug: 'aave-v3-base', type: 'lending' },
  { name: 'Compound V3 (Base)', slug: 'compound-v3-base', type: 'lending' },
  { name: 'Moonwell', slug: 'moonwell', type: 'lending' },
  { name: 'Extra Finance', slug: 'extra-finance', type: 'yield' },
  { name: 'Morpho Blue (Base)', slug: 'morpho-blue-base', type: 'lending' },
  { name: 'Seamless Protocol', slug: 'seamless-protocol', type: 'lending' },
  { name: 'BaseSwap', slug: 'baseswap', type: 'dex' },
  { name: 'Beefy Finance', slug: 'beefy', type: 'yield' },
];

interface MarketSignal {
  type: 'opportunity' | 'warning' | 'info';
  protocol: string;
  signal: string;
  biblical_wisdom: { scripture: string; reference: string; action: string };
  data: Record<string, any>;
  timestamp: string;
}

async function fetchTokenPrices(): Promise<Record<string, number>> {
  try {
    const resp = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,dai&vs_currencies=usd'
    );
    if (!resp.ok) return { ethereum: 0, 'usd-coin': 1, dai: 1 };
    return await resp.json();
  } catch {
    return { ethereum: 0, 'usd-coin': 1, dai: 1 };
  }
}

async function fetchProtocolTVL(slug: string): Promise<{ tvl: number; change_1d: number } | null> {
  try {
    const resp = await fetch(`https://api.llama.fi/protocol/${slug}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const tvl = data.currentChainTvls?.Base || data.tvl?.[data.tvl.length - 1]?.totalLiquidityUSD || 0;
    const prevTvl = data.tvl?.[data.tvl.length - 2]?.totalLiquidityUSD || tvl;
    const change = prevTvl > 0 ? ((tvl - prevTvl) / prevTvl) * 100 : 0;
    return { tvl, change_1d: change };
  } catch {
    return null;
  }
}

async function fetchBaseFees(): Promise<{ gasPrice: string } | null> {
  try {
    const apiKey = Deno.env.get('BASESCAN_API_KEY');
    if (!apiKey) return null;
    const resp = await fetch(`https://api.basescan.org/api?module=gastracker&action=gasoracle&apikey=${apiKey}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return { gasPrice: data.result?.ProposeGasPrice || '0' };
  } catch {
    return null;
  }
}

function assessMarketCondition(prices: Record<string, any>, tvlChanges: number[]): string {
  // Simple sentiment based on TVL trends
  const avgTvlChange = tvlChanges.reduce((a, b) => a + b, 0) / (tvlChanges.length || 1);
  if (avgTvlChange > 10) return 'extreme_greed';
  if (avgTvlChange > 5) return 'greed';
  if (avgTvlChange < -10) return 'extreme_fear';
  if (avgTvlChange < -5) return 'fear';
  return 'neutral';
}

function unauthorized(msg = 'Authentication required') {
  return new Response(JSON.stringify({ error: msg }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Auth gate: require valid JWT with admin role, or cron secret ---
  const cronSecret = req.headers.get('x-cron-secret');
  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (cronSecret) {
    if (cronSecret !== Deno.env.get('CRON_SECRET')) {
      return unauthorized('Invalid cron secret');
    }
  } else if (authHeader?.startsWith('Bearer ')) {
    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return unauthorized('Invalid or expired token');
    }

    // Verify admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } else {
    return unauthorized();
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'scan';

    if (mode === 'status') {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { count: protocolCount } = await supabase.from('defi_knowledge_base').select('*', { count: 'exact', head: true });
      return new Response(JSON.stringify({
        success: true, agent: 'defi-market-watchdog',
        status: { monitored_protocols: BASE_PROTOCOLS.length, knowledge_base_entries: protocolCount || 0, monitored_tokens: Object.keys(BASE_TOKENS).length, last_run: new Date().toISOString() }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await withAgentSandbox(
      { agentName: 'defi-market-watchdog', runMode: body.manual ? 'manual' : 'scheduled', metadata: { mode } },
      async (ctx: AgentContext) => {
        const signals: MarketSignal[] = [];
        const tvlChanges: number[] = [];
        const prices = await fetchTokenPrices();
        const ethPrice = prices.ethereum?.usd || 0;

        for (const protocol of BASE_PROTOCOLS) {
          try {
            const tvlData = await fetchProtocolTVL(protocol.slug);
            if (!tvlData) continue;
            tvlChanges.push(tvlData.change_1d);

            if (tvlData.change_1d > 15) {
              signals.push({ type: 'warning', protocol: protocol.name, signal: `TVL surged ${tvlData.change_1d.toFixed(1)}% in 24h`, biblical_wisdom: BIBLICAL_MARKET_WISDOM.greed, data: { tvl: tvlData.tvl, change_1d: tvlData.change_1d }, timestamp: new Date().toISOString() });
            } else if (tvlData.change_1d < -15) {
              signals.push({ type: 'opportunity', protocol: protocol.name, signal: `TVL dropped ${Math.abs(tvlData.change_1d).toFixed(1)}%`, biblical_wisdom: BIBLICAL_MARKET_WISDOM.fear, data: { tvl: tvlData.tvl, change_1d: tvlData.change_1d }, timestamp: new Date().toISOString() });
            }

            await sandboxedInsert(ctx, 'defi_knowledge_base', {
              protocol_name: protocol.name, protocol_type: protocol.type, chain: 'base', tvl: tvlData.tvl,
              description: `${protocol.name} on Base Chain. TVL: $${(tvlData.tvl / 1e6).toFixed(1)}M. 24h change: ${tvlData.change_1d.toFixed(1)}%`,
              risk_level: tvlData.change_1d > 20 ? 'high' : tvlData.change_1d < -20 ? 'high' : 'medium',
            }, { onConflict: 'protocol_name' });

            await new Promise(r => setTimeout(r, 300));
          } catch (err) { console.error(`Error fetching ${protocol.name}:`, err); }
        }

        const marketCondition = assessMarketCondition(prices, tvlChanges);
        const wisdom = BIBLICAL_MARKET_WISDOM[marketCondition];
        const gasFees = await fetchBaseFees();

        signals.unshift({
          type: 'info', protocol: 'Base Chain Overall',
          signal: `Market condition: ${marketCondition.replace('_', ' ')}. ETH: $${ethPrice.toFixed(2)}. Gas: ${gasFees?.gasPrice || 'N/A'} gwei.`,
          biblical_wisdom: wisdom,
          data: { eth_price: ethPrice, gas_price: gasFees?.gasPrice, market_condition: marketCondition, avg_tvl_change: tvlChanges.length > 0 ? (tvlChanges.reduce((a, b) => a + b, 0) / tvlChanges.length).toFixed(2) : 'N/A' },
          timestamp: new Date().toISOString(),
        });

        await logOperation(ctx, 'CORRELATE', 'defi_knowledge_base', {
          outputSummary: { market_condition: marketCondition, signals_count: signals.length, eth_price: ethPrice },
        });

        return {
          market_condition: marketCondition, biblical_wisdom: wisdom, signals_count: signals.length, signals,
          prices: { ETH: ethPrice, USDC: prices['usd-coin']?.usd || 1, DAI: prices.dai?.usd || 1 }, gas: gasFees,
        };
      }
    );

    return new Response(JSON.stringify({ agent: 'defi-market-watchdog', ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('DeFi Market Watchdog error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
