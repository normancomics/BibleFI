import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

/**
 * DeFi Opportunity Scanner Agent
 * 
 * Live monitoring of Base chain DeFi protocols for:
 * - Entry/exit points with Biblical wisdom guardrails
 * - Arbitrage opportunities across DEXes
 * - Staking & farming opportunities
 * - Yield optimization signals
 * - Whale movement tracking
 * - Risk alerts and liquidation warnings
 * 
 * Every signal is paired with 100% scripturally-sound Biblical wisdom.
 * 
 * "The heart of the prudent getteth knowledge; and the ear of the wise seeketh knowledge."
 * - Proverbs 18:15
 */

// === PROTOCOL MONITORING ===

const BASE_PROTOCOLS = {
  dexes: [
    { name: 'Aerodrome', slug: 'aerodrome-v2', router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43' },
    { name: 'Uniswap V3', slug: 'uniswap-v3-base', router: '0x2626664c2603336E57B271c5C0b26F421741e481' },
    { name: 'BaseSwap', slug: 'baseswap', router: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86' },
    { name: 'SwapBased', slug: 'swapbased', router: '' },
    { name: 'SushiSwap', slug: 'sushi-base', router: '' },
  ],
  lending: [
    { name: 'Aave V3', slug: 'aave-v3-base', pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' },
    { name: 'Compound V3', slug: 'compound-v3-base', pool: '' },
    { name: 'Moonwell', slug: 'moonwell', pool: '' },
    { name: 'Morpho Blue', slug: 'morpho-blue-base', pool: '' },
    { name: 'Seamless', slug: 'seamless-protocol', pool: '' },
  ],
  yield: [
    { name: 'Beefy Finance', slug: 'beefy', vault: '' },
    { name: 'Extra Finance', slug: 'extra-finance', vault: '' },
    { name: 'Yearn (Base)', slug: 'yearn-finance-base', vault: '' },
  ],
};

// === BIBLICAL WISDOM FOR DeFi ACTIONS ===

const OPPORTUNITY_WISDOM: Record<string, {
  scripture: string;
  reference: string;
  action_guidance: string;
  risk_warning: string;
}> = {
  entry_signal: {
    scripture: 'Cast thy bread upon the waters: for thou shalt find it after many days. Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.',
    reference: 'Ecclesiastes 11:1-2',
    action_guidance: 'Diversify entry across multiple positions. Never concentrate in a single asset.',
    risk_warning: 'Only invest what you can afford to lose. The Lord provides, but the steward must be prudent.',
  },
  exit_signal: {
    scripture: 'To every thing there is a season, and a time to every purpose under the heaven.',
    reference: 'Ecclesiastes 3:1',
    action_guidance: 'Take profits gradually. Set trailing stops. Tithe from gains.',
    risk_warning: 'Greed is the enemy of the faithful steward. Take profits before they vanish.',
  },
  arbitrage: {
    scripture: 'A good man sheweth favour, and lendeth: he will guide his affairs with discretion.',
    reference: 'Psalm 112:5',
    action_guidance: 'Arbitrage requires speed and precision. Only attempt with verified contracts and sufficient gas.',
    risk_warning: 'Flash loan arbitrage carries smart contract risk. Verify all contracts are audited.',
  },
  staking: {
    scripture: 'His lord said unto him, Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things.',
    reference: 'Matthew 25:21',
    action_guidance: 'Stake in verified protocols with strong track records. Prefer longer lockups for better yields.',
    risk_warning: 'Staking locks your capital. Ensure you have sufficient liquid reserves before committing.',
  },
  farming: {
    scripture: 'He that tilleth his land shall have plenty of bread: but he that followeth after vain persons shall have poverty enough.',
    reference: 'Proverbs 28:19',
    action_guidance: 'Farm established pairs with deep liquidity. Auto-compound when gas permits.',
    risk_warning: 'Impermanent loss is real. Understand the risks before providing liquidity.',
  },
  whale_alert: {
    scripture: 'Where no counsel is, the people fall: but in the multitude of counsellors there is safety.',
    reference: 'Proverbs 11:14',
    action_guidance: 'Large movements signal smart money. Research their thesis but never blindly follow.',
    risk_warning: 'Whales can manipulate markets. Do not chase whale moves without independent analysis.',
  },
  high_apy_warning: {
    scripture: 'Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.',
    reference: 'Proverbs 13:11',
    action_guidance: 'APYs above 100% are unsustainable. Enter small, take profits regularly.',
    risk_warning: 'Extremely high APY often indicates inflationary token emissions or ponzi mechanics.',
  },
  liquidation_risk: {
    scripture: 'The rich ruleth over the poor, and the borrower is servant to the lender.',
    reference: 'Proverbs 22:7',
    action_guidance: 'Reduce leverage immediately. Add collateral or repay debt to improve health factor.',
    risk_warning: 'Liquidation means total loss of collateral. Biblical wisdom warns against excessive debt.',
  },
  market_dip: {
    scripture: 'Buy the truth, and sell it not; also wisdom, and instruction, and understanding.',
    reference: 'Proverbs 23:23',
    action_guidance: 'Market dips create buying opportunities for the patient. DCA into quality assets.',
    risk_warning: 'Do not try to catch falling knives. Wait for confirmed support levels.',
  },
  market_peak: {
    scripture: 'Pride goeth before destruction, and an haughty spirit before a fall.',
    reference: 'Proverbs 16:18',
    action_guidance: 'Take profits. Reduce exposure. Increase stablecoin allocation and tithe.',
    risk_warning: 'Markets at all-time highs are dangerous. The humble steward secures gains.',
  },
};

// === TOKEN PRICE & DATA FETCHING ===

const KEY_TOKENS = {
  ETH: { coingecko: 'ethereum', address: '0x0000000000000000000000000000000000000000' },
  WETH: { coingecko: 'ethereum', address: '0x4200000000000000000000000000000000000006' },
  USDC: { coingecko: 'usd-coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  DAI: { coingecko: 'dai', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' },
  AERO: { coingecko: 'aerodrome-finance', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631' },
  cbETH: { coingecko: 'coinbase-wrapped-staked-eth', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22' },
  wstETH: { coingecko: 'wrapped-steth', address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452' },
};

interface OpportunitySignal {
  type: 'entry' | 'exit' | 'arbitrage' | 'staking' | 'farming' | 'whale' | 'warning' | 'liquidation';
  protocol: string;
  asset: string;
  signal_strength: 'weak' | 'moderate' | 'strong';
  details: string;
  biblical_wisdom: typeof OPPORTUNITY_WISDOM[string];
  metrics: Record<string, any>;
  timestamp: string;
  actionable: boolean;
}

async function fetchPricesWithChanges(): Promise<Record<string, { usd: number; change_24h: number; change_7d: number }>> {
  try {
    const ids = Object.values(KEY_TOKENS).map(t => t.coingecko).filter((v, i, a) => a.indexOf(v) === i).join(',');
    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`
    );
    if (!resp.ok) return {};
    const data = await resp.json();
    const result: Record<string, { usd: number; change_24h: number; change_7d: number }> = {};
    for (const [symbol, info] of Object.entries(KEY_TOKENS)) {
      const d = data[(info as any).coingecko];
      if (d) {
        result[symbol] = {
          usd: d.usd || 0,
          change_24h: d.usd_24h_change || 0,
          change_7d: d.usd_7d_change || 0,
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function fetchProtocolYields(): Promise<{ protocol: string; type: string; tvl: number; apy?: number; change_1d: number }[]> {
  const results: { protocol: string; type: string; tvl: number; apy?: number; change_1d: number }[] = [];
  const allProtocols = [...BASE_PROTOCOLS.dexes, ...BASE_PROTOCOLS.lending, ...BASE_PROTOCOLS.yield];

  for (const p of allProtocols) {
    try {
      const resp = await fetch(`https://api.llama.fi/protocol/${p.slug}`);
      if (!resp.ok) continue;
      const data = await resp.json();
      const tvl = data.currentChainTvls?.Base || data.tvl?.[data.tvl.length - 1]?.totalLiquidityUSD || 0;
      const prevTvl = data.tvl?.[data.tvl.length - 2]?.totalLiquidityUSD || tvl;
      const change = prevTvl > 0 ? ((tvl - prevTvl) / prevTvl) * 100 : 0;
      const type = BASE_PROTOCOLS.dexes.some(d => d.slug === p.slug) ? 'dex'
        : BASE_PROTOCOLS.lending.some(l => l.slug === p.slug) ? 'lending' : 'yield';
      results.push({ protocol: p.name, type, tvl, change_1d: change });
      await new Promise(r => setTimeout(r, 300));
    } catch { /* skip */ }
  }

  return results;
}

async function fetchYieldPools(): Promise<{ pool: string; apy: number; tvl: number; chain: string; project: string }[]> {
  try {
    const resp = await fetch('https://yields.llama.fi/pools');
    if (!resp.ok) return [];
    const data = await resp.json();
    // Filter for Base chain pools with meaningful APY
    return (data.data || [])
      .filter((p: any) => p.chain === 'Base' && p.apy > 0 && p.tvlUsd > 100000)
      .sort((a: any, b: any) => b.apy - a.apy)
      .slice(0, 30)
      .map((p: any) => ({
        pool: p.symbol || p.pool,
        apy: p.apy,
        tvl: p.tvlUsd,
        chain: p.chain,
        project: p.project,
      }));
  } catch {
    return [];
  }
}

function generateSignals(
  prices: Record<string, { usd: number; change_24h: number; change_7d: number }>,
  protocols: { protocol: string; type: string; tvl: number; change_1d: number }[],
  yieldPools: { pool: string; apy: number; tvl: number; project: string }[]
): OpportunitySignal[] {
  const signals: OpportunitySignal[] = [];

  // === ENTRY/EXIT SIGNALS based on price action ===
  const ethData = prices['ETH'];
  if (ethData) {
    // Strong dip = entry opportunity
    if (ethData.change_24h < -5) {
      signals.push({
        type: 'entry', protocol: 'Base Chain', asset: 'ETH',
        signal_strength: ethData.change_24h < -10 ? 'strong' : 'moderate',
        details: `ETH dropped ${Math.abs(ethData.change_24h).toFixed(1)}% in 24h — potential entry point`,
        biblical_wisdom: OPPORTUNITY_WISDOM.market_dip,
        metrics: { price: ethData.usd, change_24h: ethData.change_24h, change_7d: ethData.change_7d },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
    // Strong pump = exit/take-profit signal
    if (ethData.change_24h > 8) {
      signals.push({
        type: 'exit', protocol: 'Base Chain', asset: 'ETH',
        signal_strength: ethData.change_24h > 15 ? 'strong' : 'moderate',
        details: `ETH surged ${ethData.change_24h.toFixed(1)}% in 24h — consider taking partial profits`,
        biblical_wisdom: OPPORTUNITY_WISDOM.market_peak,
        metrics: { price: ethData.usd, change_24h: ethData.change_24h },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === ARBITRAGE DETECTION across DEXes ===
  const dexProtocols = protocols.filter(p => p.type === 'dex');
  if (dexProtocols.length >= 2) {
    const tvlDiffs: { pair: string; diff: number }[] = [];
    for (let i = 0; i < dexProtocols.length; i++) {
      for (let j = i + 1; j < dexProtocols.length; j++) {
        const diff = Math.abs(dexProtocols[i].change_1d - dexProtocols[j].change_1d);
        if (diff > 10) {
          tvlDiffs.push({ pair: `${dexProtocols[i].protocol} vs ${dexProtocols[j].protocol}`, diff });
        }
      }
    }
    for (const arb of tvlDiffs.slice(0, 3)) {
      signals.push({
        type: 'arbitrage', protocol: arb.pair, asset: 'Multiple',
        signal_strength: arb.diff > 20 ? 'strong' : 'moderate',
        details: `TVL divergence of ${arb.diff.toFixed(1)}% between DEXes — potential arbitrage window`,
        biblical_wisdom: OPPORTUNITY_WISDOM.arbitrage,
        metrics: { tvl_divergence: arb.diff },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === STAKING OPPORTUNITIES from lending protocols ===
  const lendingProtocols = protocols.filter(p => p.type === 'lending');
  for (const lp of lendingProtocols) {
    if (lp.tvl > 10_000_000 && lp.change_1d > 3) {
      signals.push({
        type: 'staking', protocol: lp.protocol, asset: 'USDC/ETH',
        signal_strength: lp.change_1d > 8 ? 'strong' : lp.change_1d > 5 ? 'moderate' : 'weak',
        details: `${lp.protocol} TVL growing ${lp.change_1d.toFixed(1)}% — stable lending opportunity ($${(lp.tvl / 1e6).toFixed(1)}M TVL)`,
        biblical_wisdom: OPPORTUNITY_WISDOM.staking,
        metrics: { tvl: lp.tvl, tvl_change_1d: lp.change_1d },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === FARMING OPPORTUNITIES from yield pools ===
  for (const pool of yieldPools.slice(0, 10)) {
    let wisdomKey = 'farming';
    let signalType: OpportunitySignal['type'] = 'farming';

    if (pool.apy > 100) {
      wisdomKey = 'high_apy_warning';
      signalType = 'warning';
    }

    signals.push({
      type: signalType, protocol: pool.project, asset: pool.pool,
      signal_strength: pool.apy > 50 ? 'strong' : pool.apy > 20 ? 'moderate' : 'weak',
      details: `${pool.pool} on ${pool.project}: ${pool.apy.toFixed(1)}% APY ($${(pool.tvl / 1e6).toFixed(1)}M TVL)`,
      biblical_wisdom: OPPORTUNITY_WISDOM[wisdomKey],
      metrics: { apy: pool.apy, tvl: pool.tvl },
      timestamp: new Date().toISOString(), actionable: pool.apy < 200, // Don't recommend unsustainable yields
    });
  }

  // === LIQUIDITY CRISIS WARNING ===
  const crashingProtocols = protocols.filter(p => p.change_1d < -20);
  for (const cp of crashingProtocols) {
    signals.push({
      type: 'warning', protocol: cp.protocol, asset: 'ALL',
      signal_strength: 'strong',
      details: `⚠️ ${cp.protocol} TVL crashed ${Math.abs(cp.change_1d).toFixed(1)}% — POSSIBLE LIQUIDITY CRISIS`,
      biblical_wisdom: OPPORTUNITY_WISDOM.liquidation_risk,
      metrics: { tvl: cp.tvl, tvl_change_1d: cp.change_1d },
      timestamp: new Date().toISOString(), actionable: true,
    });
  }

  return signals;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || 'Unauthorized', corsHeaders);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'scan';

    if (mode === 'status') {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { count: defiCount } = await supabase.from('defi_knowledge_base').select('*', { count: 'exact', head: true });
      return new Response(JSON.stringify({
        success: true, agent: 'defi-opportunity-scanner',
        status: {
          monitored_dexes: BASE_PROTOCOLS.dexes.length,
          monitored_lending: BASE_PROTOCOLS.lending.length,
          monitored_yield: BASE_PROTOCOLS.yield.length,
          tracked_tokens: Object.keys(KEY_TOKENS).length,
          opportunity_types: Object.keys(OPPORTUNITY_WISDOM).length,
          defi_knowledge_entries: defiCount || 0,
          last_run: new Date().toISOString(),
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await withAgentSandbox(
      { agentName: 'defi-opportunity-scanner', runMode: body.manual ? 'manual' : 'scheduled', metadata: { mode } },
      async (ctx: AgentContext) => {
        // Fetch all data in parallel
        const [prices, protocols, yieldPools] = await Promise.all([
          fetchPricesWithChanges(),
          fetchProtocolYields(),
          fetchYieldPools(),
        ]);

        // Generate signals
        const signals = generateSignals(prices, protocols, yieldPools);

        // Persist protocol data to knowledge base
        for (const p of protocols) {
          await sandboxedInsert(ctx, 'defi_knowledge_base', {
            protocol_name: p.protocol,
            protocol_type: p.type,
            chain: 'base',
            tvl: p.tvl,
            description: `${p.protocol} (${p.type}) on Base. TVL: $${(p.tvl / 1e6).toFixed(1)}M. 24h: ${p.change_1d.toFixed(1)}%`,
            risk_level: Math.abs(p.change_1d) > 20 ? 'high' : Math.abs(p.change_1d) > 10 ? 'medium' : 'low',
          }, { onConflict: 'protocol_name' });
        }

        // Persist top yield opportunities to crossref
        const actionableSignals = signals.filter(s => s.actionable);
        for (const sig of actionableSignals.slice(0, 5)) {
          await sandboxedInsert(ctx, 'biblical_financial_crossref', {
            biblical_term: sig.biblical_wisdom.reference,
            financial_term: `${sig.type}_${sig.protocol}`,
            defi_concept: sig.details,
            relationship_type: 'market_signal',
            explanation: `${sig.biblical_wisdom.scripture} — ${sig.biblical_wisdom.action_guidance}`,
            practical_application: sig.details,
            risk_consideration: sig.biblical_wisdom.risk_warning,
          }, { onConflict: 'id' });
        }

        await logOperation(ctx, 'SCAN', 'defi_knowledge_base', {
          outputSummary: {
            total_signals: signals.length,
            actionable: actionableSignals.length,
            entry_signals: signals.filter(s => s.type === 'entry').length,
            exit_signals: signals.filter(s => s.type === 'exit').length,
            arbitrage: signals.filter(s => s.type === 'arbitrage').length,
            farming: signals.filter(s => s.type === 'farming').length,
            warnings: signals.filter(s => s.type === 'warning').length,
          },
        });

        // Categorize signals
        const byType: Record<string, OpportunitySignal[]> = {};
        for (const s of signals) {
          if (!byType[s.type]) byType[s.type] = [];
          byType[s.type].push(s);
        }

        return {
          scan_timestamp: new Date().toISOString(),
          total_signals: signals.length,
          actionable_signals: actionableSignals.length,
          prices,
          protocols_scanned: protocols.length,
          yield_pools_found: yieldPools.length,
          signals_by_type: Object.fromEntries(
            Object.entries(byType).map(([type, sigs]) => [type, { count: sigs.length, top: sigs.slice(0, 3) }])
          ),
          top_opportunities: actionableSignals
            .sort((a, b) => {
              const strength = { strong: 3, moderate: 2, weak: 1 };
              return strength[b.signal_strength] - strength[a.signal_strength];
            })
            .slice(0, 10),
        };
      }
    );

    return new Response(JSON.stringify({ agent: 'defi-opportunity-scanner', ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('DeFi Opportunity Scanner error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
