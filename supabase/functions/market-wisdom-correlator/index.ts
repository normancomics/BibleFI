import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// Advanced market-to-scripture correlation engine
const MARKET_SCRIPTURE_CORRELATIONS: Record<string, {
  condition: string;
  scriptures: { text: string; reference: string }[];
  defi_action: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}> = {
  bull_run: {
    condition: 'Strong upward momentum across protocols',
    scriptures: [
      { text: 'A feast is made for laughter, and wine maketh merry: but money answereth all things.', reference: 'Ecclesiastes 10:19' },
      { text: 'He that maketh haste to be rich shall not be innocent.', reference: 'Proverbs 28:20' },
    ],
    defi_action: 'Take partial profits. Rebalance portfolio. Increase tithe percentage from gains.',
    risk_level: 'medium',
  },
  bear_market: {
    condition: 'Sustained downward pressure, TVL declining',
    scriptures: [
      { text: 'Cast thy bread upon the waters: for thou shalt find it after many days.', reference: 'Ecclesiastes 11:1' },
      { text: 'The wise man\'s eyes are in his head; but the fool walketh in darkness.', reference: 'Ecclesiastes 2:14' },
    ],
    defi_action: 'Dollar-cost average into quality assets. Move to stablecoin vaults. Maintain tithe streams.',
    risk_level: 'low',
  },
  high_volatility: {
    condition: 'Rapid price swings, uncertainty',
    scriptures: [
      { text: 'The prudent sees danger and hides himself, but the simple go on and suffer for it.', reference: 'Proverbs 22:3' },
      { text: 'Be not afraid of sudden fear, neither of the desolation of the wicked, when it cometh.', reference: 'Proverbs 3:25' },
    ],
    defi_action: 'Reduce leverage. Increase stablecoin allocation. Avoid new positions until clarity.',
    risk_level: 'high',
  },
  yield_opportunity: {
    condition: 'Above-average yields detected on verified protocols',
    scriptures: [
      { text: 'His lord said unto him, Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things.', reference: 'Matthew 25:21' },
      { text: 'Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.', reference: 'Ecclesiastes 11:2' },
    ],
    defi_action: 'Diversify across pools per Ecclesiastes 11:2. Verify protocol audits. Start small, scale with wisdom.',
    risk_level: 'medium',
  },
  liquidity_crisis: {
    condition: 'TVL dropping rapidly, protocol exits detected',
    scriptures: [
      { text: 'A good man leaveth an inheritance to his children\'s children: and the wealth of the sinner is laid up for the just.', reference: 'Proverbs 13:22' },
      { text: 'Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.', reference: 'Proverbs 13:11' },
    ],
    defi_action: 'EXIT immediately from affected protocols. Move to self-custody. Protect capital above all.',
    risk_level: 'critical',
  },
  stablecoin_opportunity: {
    condition: 'Safe stablecoin yields above 5% APY',
    scriptures: [
      { text: 'The sleep of a labouring man is sweet, whether he eat little or much: but the abundance of the rich will not suffer him to sleep.', reference: 'Ecclesiastes 5:12' },
      { text: 'Better is a little with righteousness than great revenues without right.', reference: 'Proverbs 16:8' },
    ],
    defi_action: 'Allocate to verified stablecoin vaults. Ideal for tithe reserves and conservative stewardship.',
    risk_level: 'low',
  },
  whale_accumulation: {
    condition: 'Large wallets accumulating tokens',
    scriptures: [
      { text: 'Where no counsel is, the people fall: but in the multitude of counsellors there is safety.', reference: 'Proverbs 11:14' },
      { text: 'The heart of the prudent getteth knowledge; and the ear of the wise seeketh knowledge.', reference: 'Proverbs 18:15' },
    ],
    defi_action: 'Monitor but do not follow blindly. Research fundamentals. Whales have different risk profiles.',
    risk_level: 'medium',
  },
  new_protocol_launch: {
    condition: 'New DeFi protocol launching on Base',
    scriptures: [
      { text: 'Prove all things; hold fast that which is good.', reference: '1 Thessalonians 5:21' },
      { text: 'Beloved, believe not every spirit, but try the spirits whether they are of God.', reference: '1 John 4:1' },
    ],
    defi_action: 'Wait for audit results. Small test positions only. Never invest more than you can afford to lose.',
    risk_level: 'high',
  },
};

// Base chain protocol addresses to monitor
const MONITORED_PROTOCOLS = [
  { name: 'Aerodrome', slug: 'aerodrome-v2', type: 'dex' },
  { name: 'Uniswap V3', slug: 'uniswap-v3-base', type: 'dex' },
  { name: 'Aave V3', slug: 'aave-v3-base', type: 'lending' },
  { name: 'Compound V3', slug: 'compound-v3-base', type: 'lending' },
  { name: 'Moonwell', slug: 'moonwell', type: 'lending' },
  { name: 'Morpho Blue', slug: 'morpho-blue-base', type: 'lending' },
  { name: 'Extra Finance', slug: 'extra-finance', type: 'yield' },
  { name: 'Seamless', slug: 'seamless-protocol', type: 'lending' },
  { name: 'BaseSwap', slug: 'baseswap', type: 'dex' },
  { name: 'Beefy', slug: 'beefy', type: 'yield' },
];

interface CorrelationResult {
  market_condition: string;
  correlation: typeof MARKET_SCRIPTURE_CORRELATIONS[string];
  protocols_affected: string[];
  data_points: Record<string, any>;
  timestamp: string;
}

async function fetchProtocolData(slug: string): Promise<{ tvl: number; change_1d: number; apy?: number } | null> {
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

async function fetchTokenPrices(): Promise<Record<string, any>> {
  try {
    const resp = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,dai,bitcoin&vs_currencies=usd&include_24hr_change=true'
    );
    if (!resp.ok) return {};
    return await resp.json();
  } catch {
    return {};
  }
}

function determineMarketConditions(
  prices: Record<string, any>,
  protocolData: { name: string; tvl: number; change_1d: number }[]
): string[] {
  const conditions: string[] = [];
  const avgTvlChange = protocolData.reduce((sum, p) => sum + p.change_1d, 0) / (protocolData.length || 1);
  const ethChange = prices.ethereum?.usd_24h_change || 0;

  if (avgTvlChange > 10 && ethChange > 5) conditions.push('bull_run');
  if (avgTvlChange < -10 || ethChange < -10) conditions.push('bear_market');
  if (Math.abs(ethChange) > 8) conditions.push('high_volatility');
  if (avgTvlChange < -25) conditions.push('liquidity_crisis');

  // Check for yield opportunities (protocols with positive TVL growth)
  const growingProtocols = protocolData.filter(p => p.change_1d > 5);
  if (growingProtocols.length >= 2) conditions.push('yield_opportunity');

  // Stablecoin opportunity (stable market conditions)
  if (Math.abs(avgTvlChange) < 3 && Math.abs(ethChange) < 2) conditions.push('stablecoin_opportunity');

  if (conditions.length === 0) conditions.push('stablecoin_opportunity'); // Default to conservative
  return conditions;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Require admin or cron-secret authentication
  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || 'Unauthorized', corsHeaders);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'correlate';

    if (mode === 'status') {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { count: defiCount } = await supabase.from('defi_knowledge_base').select('*', { count: 'exact', head: true });
      const { count: crossrefCount } = await supabase.from('biblical_financial_crossref').select('*', { count: 'exact', head: true });
      return new Response(JSON.stringify({
        success: true, agent: 'market-wisdom-correlator',
        status: { monitored_protocols: MONITORED_PROTOCOLS.length, defi_knowledge_entries: defiCount || 0, crossref_entries: crossrefCount || 0, correlation_rules: Object.keys(MARKET_SCRIPTURE_CORRELATIONS).length, last_run: new Date().toISOString() }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await withAgentSandbox(
      { agentName: 'market-wisdom-correlator', runMode: body.manual ? 'manual' : 'scheduled', metadata: { mode } },
      async (ctx: AgentContext) => {
        const prices = await fetchTokenPrices();
        const protocolResults: { name: string; tvl: number; change_1d: number }[] = [];

        for (const protocol of MONITORED_PROTOCOLS) {
          const data = await fetchProtocolData(protocol.slug);
          if (data) {
            protocolResults.push({ name: protocol.name, ...data });
            await sandboxedInsert(ctx, 'defi_knowledge_base', {
              protocol_name: protocol.name, protocol_type: protocol.type, chain: 'base', tvl: data.tvl,
              description: `${protocol.name} (${protocol.type}) on Base. TVL: $${(data.tvl / 1e6).toFixed(1)}M. 24h: ${data.change_1d.toFixed(1)}%`,
              risk_level: Math.abs(data.change_1d) > 20 ? 'high' : Math.abs(data.change_1d) > 10 ? 'medium' : 'low',
            }, { onConflict: 'protocol_name' });
          }
          await new Promise(r => setTimeout(r, 400));
        }

        const conditions = determineMarketConditions(prices, protocolResults);
        const correlations: CorrelationResult[] = [];

        for (const condition of conditions) {
          const correlation = MARKET_SCRIPTURE_CORRELATIONS[condition];
          if (!correlation) continue;
          const affectedProtocols = condition === 'liquidity_crisis'
            ? protocolResults.filter(p => p.change_1d < -15).map(p => p.name)
            : condition === 'yield_opportunity'
            ? protocolResults.filter(p => p.change_1d > 5).map(p => p.name)
            : protocolResults.map(p => p.name);

          correlations.push({
            market_condition: condition, correlation, protocols_affected: affectedProtocols,
            data_points: { avg_tvl_change: (protocolResults.reduce((s, p) => s + p.change_1d, 0) / (protocolResults.length || 1)).toFixed(2), eth_price: prices.ethereum?.usd || 0, eth_24h_change: (prices.ethereum?.usd_24h_change || 0).toFixed(2), btc_price: prices.bitcoin?.usd || 0 },
            timestamp: new Date().toISOString(),
          });

          await logOperation(ctx, 'CORRELATE', 'defi_knowledge_base', {
            outputSummary: { condition, risk: correlation.risk_level, protocols: affectedProtocols.length },
          });
        }

        const highestRisk = correlations.reduce((max, c) => {
          const riskMap = { low: 1, medium: 2, high: 3, critical: 4 };
          return riskMap[c.correlation.risk_level] > riskMap[max] ? c.correlation.risk_level : max;
        }, 'low' as 'low' | 'medium' | 'high' | 'critical');

        return {
          market_conditions: conditions, highest_risk: highestRisk, correlations_count: correlations.length, correlations,
          protocols_monitored: protocolResults.length,
          prices: { ETH: prices.ethereum?.usd || 0, BTC: prices.bitcoin?.usd || 0, USDC: prices['usd-coin']?.usd || 1 },
        };
      }
    );

    return new Response(JSON.stringify({ agent: 'market-wisdom-correlator', ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Market Wisdom Correlator error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
