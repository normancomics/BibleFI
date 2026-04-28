/**
 * BWTYA Swarm Orchestrator – Supabase Edge Function
 *
 * Master coordinator for all BWTYA sub-agent swarms running server-side.
 * Fans out to specialised sub-agents, aggregates results, and stores
 * insights back into the knowledge base via the sandboxed gateway.
 *
 * Sub-agents orchestrated:
 *  1. DeFiLlama market scan         (Base chain TVL + APY)
 *  2. Fear & Greed market sentiment
 *  3. DEX arbitrage scanner         (cross-protocol spread detection)
 *  4. Whale movement detector       (large TVL shifts)
 *  5. Biblical wisdom correlator    (maps signals to KJV scripture)
 *  6. BWTYA algorithm core          (scores + ranks opportunities)
 *
 * All sub-agents run inside the shared agent-sandbox permission gateway.
 *
 * "For which of you, intending to build a tower, sitteth not down first,
 *  and counteth the cost, whether he have sufficient to finish it?"
 *  — Luke 14:28
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import {
  withAgentSandbox,
  sandboxedInsert,
  sandboxedRead,
  logOperation,
  type AgentContext,
} from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface YieldOpportunity {
  protocol: string;
  poolName: string;
  chain: string;
  apy: number;
  tvlUsd: number;
  riskScore: number;
  category: string;
  biblicalAlignment: string;
  isVerified: boolean;
  audited: boolean;
}

interface MarketSignal {
  type: 'opportunity' | 'warning' | 'whale' | 'arbitrage' | 'dca';
  protocol: string;
  signal: string;
  scripture: string;
  reference: string;
  estimatedImpactUsd?: number;
  timestamp: string;
}

interface BWTYAScore {
  opportunity: YieldOpportunity;
  bwtyaScore: number;
  fruitBearingScore: number;
  faithfulnessScore: number;
  biblicalAlignmentScore: number;
  transparencyScore: number;
  stewardshipGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  biblicalRationale: string;
}

// ---------------------------------------------------------------------------
// Data sources
// ---------------------------------------------------------------------------

const BASE_PROTOCOLS = [
  { name: 'Aerodrome', slug: 'aerodrome-v2', category: 'dex', audited: true },
  { name: 'Aave V3', slug: 'aave-v3-base', category: 'lending', audited: true },
  { name: 'Uniswap V3', slug: 'uniswap-v3-base', category: 'dex', audited: true },
  { name: 'Compound V3', slug: 'compound-v3-base', category: 'lending', audited: true },
  { name: 'Moonwell', slug: 'moonwell', category: 'lending', audited: true },
  { name: 'Morpho Blue', slug: 'morpho-blue-base', category: 'lending', audited: true },
  { name: 'Seamless', slug: 'seamless-protocol', category: 'lending', audited: true },
  { name: 'Beefy Finance', slug: 'beefy', category: 'yield', audited: true },
  { name: 'Extra Finance', slug: 'extra-finance', category: 'yield', audited: false },
  { name: 'BaseSwap', slug: 'baseswap', category: 'dex', audited: true },
];

const SCRIPTURE_BY_CONDITION: Record<string, { text: string; reference: string }> = {
  high_yield: {
    text: 'His lord said unto him, Well done, thou good and faithful servant.',
    reference: 'Matthew 25:21',
  },
  high_risk: {
    text: 'The prudent sees danger and hides himself, but the simple go on and suffer for it.',
    reference: 'Proverbs 22:3',
  },
  whale_entry: {
    text: 'Where no counsel is, the people fall: but in the multitude of counsellors there is safety.',
    reference: 'Proverbs 11:14',
  },
  whale_exit: {
    text: 'A prudent man foreseeth the evil, and hideth himself.',
    reference: 'Proverbs 27:12',
  },
  arbitrage: {
    text: 'The hand of the diligent makes rich.',
    reference: 'Proverbs 10:4',
  },
  dca_fear: {
    text: 'Cast thy bread upon the waters: for thou shalt find it after many days.',
    reference: 'Ecclesiastes 11:1',
  },
  dca_neutral: {
    text: 'The plans of the diligent lead surely to abundance.',
    reference: 'Proverbs 21:5',
  },
};

// ---------------------------------------------------------------------------
// Sub-agent: DeFiLlama Protocol Scanner
// ---------------------------------------------------------------------------

async function subAgentProtocolScanner(
  ctx: AgentContext,
): Promise<YieldOpportunity[]> {
  const opportunities: YieldOpportunity[] = [];

  for (const protocol of BASE_PROTOCOLS) {
    try {
      const resp = await fetch(`https://api.llama.fi/protocol/${protocol.slug}`);
      if (!resp.ok) continue;

      const data = await resp.json();
      const tvl: number =
        data.currentChainTvls?.Base ||
        data.tvl?.[data.tvl.length - 1]?.totalLiquidityUSD ||
        0;

      // Estimate APY from recent yield data (simplified)
      const apy: number = data.yields?.[0]?.apy ?? (protocol.category === 'lending' ? 4.5 : 8.0);

      opportunities.push({
        protocol: protocol.name,
        poolName: `${protocol.name} – Base`,
        chain: 'Base',
        apy,
        tvlUsd: tvl,
        riskScore: tvl > 1_000_000_000 ? 15 : tvl > 100_000_000 ? 35 : 55,
        category: protocol.category,
        biblicalAlignment: protocol.audited
          // Audited protocols earn "faithful stewardship" — Matthew 25:23 (faithful with much).
          // Unaudited protocols receive a baseline "transparent" label only until an audit confirms trustworthiness.
          ? 'transparent, audited, faithful stewardship'
          : 'transparent',
        isVerified: tvl > 10_000_000,
        audited: protocol.audited,
      });

      await new Promise((r) => setTimeout(r, 250)); // rate-limit courtesy delay
    } catch {
      // Skip failed protocol — never let one failure cascade
    }
  }

  await logOperation(ctx, 'READ', 'defi_knowledge_base', {
    outputSummary: { scanned: BASE_PROTOCOLS.length, found: opportunities.length },
  });

  return opportunities;
}

// ---------------------------------------------------------------------------
// Sub-agent: Fear & Greed Fetcher
// ---------------------------------------------------------------------------

async function subAgentFearGreed(): Promise<{
  index: number;
  label: string;
  condition: string;
}> {
  try {
    const resp = await fetch('https://api.alternative.me/fng/?limit=1');
    if (!resp.ok) throw new Error('FGI API unavailable');
    const json = await resp.json();
    const index = Number(json.data?.[0]?.value ?? 50);
    const label: string = json.data?.[0]?.value_classification ?? 'Neutral';
    const condition =
      index >= 75 ? 'extreme_greed'
      : index >= 55 ? 'greed'
      : index >= 45 ? 'neutral'
      : index >= 25 ? 'fear'
      : 'extreme_fear';
    return { index, label, condition };
  } catch {
    return { index: 50, label: 'Neutral', condition: 'neutral' };
  }
}

// ---------------------------------------------------------------------------
// Sub-agent: BWTYA Scorer (4 biblical dimensions)
// ---------------------------------------------------------------------------

function subAgentBWTYAScore(opp: YieldOpportunity): BWTYAScore {
  // Dimension 1 – Fruit-bearing (John 15:16) · max 30
  let d1 = 0;
  if (opp.apy >= 5 && opp.apy <= 25) d1 += 15;
  else if (opp.apy > 25 && opp.apy <= 60) d1 += 8;
  else if (opp.apy > 0) d1 += 3;
  if (opp.tvlUsd >= 100_000_000) d1 += 15;
  else if (opp.tvlUsd >= 10_000_000) d1 += 10;
  else if (opp.tvlUsd >= 1_000_000) d1 += 6;
  d1 = Math.min(d1, 30);

  // Dimension 2 – Faithful Stewardship (Matthew 25:14) · max 25
  let d2 = Math.round(15 * (1 - opp.riskScore / 100));
  if (opp.audited) d2 += 7;
  if (opp.isVerified) d2 += 3;
  d2 = Math.min(d2, 25);

  // Dimension 3 – Biblical Alignment (Proverbs 3:9) · max 25
  const alignLower = opp.biblicalAlignment.toLowerCase();
  const positiveHits = ['stewardship', 'faithful', 'transparent', 'honest', 'audited', 'sustainable', 'community']
    .filter((k) => alignLower.includes(k)).length;
  const negativeHits = ['gambling', 'opaque', 'anonymous team', 'no audit']
    .filter((k) => alignLower.includes(k)).length;
  const safeCat = ['stable', 'lending', 'savings', 'staking'].some((c) =>
    opp.category.toLowerCase().includes(c),
  );
  let d3 = Math.min(positiveHits * 5, 20) - negativeHits * 5 + (safeCat ? 5 : 0);
  d3 = Math.max(0, Math.min(d3, 25));

  // Dimension 4 – Transparency (Luke 16:10) · max 20
  let d4 = 0;
  if (opp.audited) d4 += 10;
  if (opp.isVerified) d4 += 5;
  d4 = Math.min(d4 + 5, 20); // +5 baseline for on-chain verifiability

  const total = d1 + d2 + d3 + d4;
  const grade: BWTYAScore['stewardshipGrade'] =
    total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';

  return {
    opportunity: opp,
    bwtyaScore: total,
    fruitBearingScore: d1,
    faithfulnessScore: d2,
    biblicalAlignmentScore: d3,
    transparencyScore: d4,
    stewardshipGrade: grade,
    biblicalRationale:
      `${opp.protocol} scored ${total}/100 (${grade}). ` +
      `APY ${opp.apy.toFixed(1)}% on ${opp.chain}.`,
  };
}

// ---------------------------------------------------------------------------
// Sub-agent: Whale Movement Detector
// ---------------------------------------------------------------------------

function subAgentWhaleDetector(
  opportunities: YieldOpportunity[],
  fearGreedIndex: number,
): MarketSignal[] {
  const signals: MarketSignal[] = [];
  const condition = fearGreedIndex > 70 ? 'extreme_greed' : fearGreedIndex < 30 ? 'extreme_fear' : 'neutral';

  for (const opp of opportunities) {
    if (opp.tvlUsd > 500_000_000 && opp.riskScore < 30) {
      const key = condition === 'extreme_greed' ? 'whale_exit' : 'whale_entry';
      const scripture = SCRIPTURE_BY_CONDITION[key];
      signals.push({
        type: 'whale',
        protocol: opp.protocol,
        signal: `Large TVL concentration detected: $${(opp.tvlUsd / 1e9).toFixed(2)}B in ${opp.protocol}`,
        scripture: scripture.text,
        reference: scripture.reference,
        estimatedImpactUsd: opp.tvlUsd * 0.005,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return signals.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Sub-agent: Arbitrage Scanner
// ---------------------------------------------------------------------------

function subAgentArbitrageScanner(opportunities: YieldOpportunity[]): MarketSignal[] {
  const signals: MarketSignal[] = [];
  const sorted = [...opportunities].sort((a, b) => b.apy - a.apy);

  for (let i = 0; i < sorted.length - 1; i++) {
    const high = sorted[i];
    const low = sorted[i + 1];
    const spread = high.apy - low.apy;
    if (spread > 2.5) {
      const scripture = SCRIPTURE_BY_CONDITION.arbitrage;
      signals.push({
        type: 'arbitrage',
        protocol: `${low.protocol} → ${high.protocol}`,
        signal: `APY spread ${spread.toFixed(1)}% detected between ${low.protocol} (${low.apy.toFixed(1)}%) and ${high.protocol} (${high.apy.toFixed(1)}%)`,
        scripture: scripture.text,
        reference: scripture.reference,
        estimatedImpactUsd: (spread / 100) * Math.min(high.tvlUsd, low.tvlUsd) * 0.001,
        timestamp: new Date().toISOString(),
      });
      if (signals.length >= 3) break;
    }
  }

  return signals;
}

// ---------------------------------------------------------------------------
// Sub-agent: DCA Signal Generator
// ---------------------------------------------------------------------------

function subAgentDCASignals(
  opportunities: YieldOpportunity[],
  fearGreedIndex: number,
): MarketSignal[] {
  const isFear = fearGreedIndex < 40;
  const key = isFear ? 'dca_fear' : 'dca_neutral';
  const scripture = SCRIPTURE_BY_CONDITION[key];

  return opportunities
    .filter((o) => o.riskScore < 40 && o.apy > 3)
    .slice(0, 4)
    .map((o) => ({
      type: 'dca' as const,
      protocol: o.protocol,
      signal: isFear
        ? `Fear market DCA signal: accumulate ${o.protocol} at ${o.apy.toFixed(1)}% APY`
        : `Steady DCA signal: ${o.protocol} at ${o.apy.toFixed(1)}% APY`,
      scripture: scripture.text,
      reference: scripture.reference,
      timestamp: new Date().toISOString(),
    }));
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth gate
  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error ?? 'Unauthorized', corsHeaders);
  }

  const body = await req.json().catch(() => ({})) as { mode?: string };
  const mode = body.mode ?? 'full_scan';

  try {
    const swarmResult = await withAgentSandbox(
      {
        agentName: 'bwtya-swarm-orchestrator',
        runMode: auth.method === 'cron' ? 'scheduled' : 'manual',
        metadata: { mode },
      },
      async (ctx: AgentContext) => {
        // ------------------------------------------------------------------
        // Phase 1: Fear & Greed + Protocol scan (parallel)
        // ------------------------------------------------------------------
        const [fearGreed, rawOpportunities] = await Promise.all([
          subAgentFearGreed(),
          subAgentProtocolScanner(ctx),
        ]);

        // ------------------------------------------------------------------
        // Phase 2: BWTYA scoring of all opportunities
        // ------------------------------------------------------------------
        const scoredOpportunities = rawOpportunities
          .map(subAgentBWTYAScore)
          .sort((a, b) => b.bwtyaScore - a.bwtyaScore);

        // ------------------------------------------------------------------
        // Phase 3: Signal sub-agents (parallel)
        // ------------------------------------------------------------------
        const [whaleSignals, arbitrageSignals, dcaSignals] = await Promise.all([
          Promise.resolve(subAgentWhaleDetector(rawOpportunities, fearGreed.index)),
          Promise.resolve(subAgentArbitrageScanner(rawOpportunities)),
          Promise.resolve(subAgentDCASignals(rawOpportunities, fearGreed.index)),
        ]);

        const allSignals: MarketSignal[] = [...whaleSignals, ...arbitrageSignals, ...dcaSignals];

        // ------------------------------------------------------------------
        // Phase 4: Persist results via sandboxed gateway
        // ------------------------------------------------------------------
        if (scoredOpportunities.length > 0) {
          await sandboxedInsert(
            ctx,
            'bwtya_opportunity_scores',
            scoredOpportunities.slice(0, 20).map((s) => ({
              protocol_name: s.opportunity.protocol,
              pool_name: s.opportunity.poolName,
              chain: s.opportunity.chain,
              apy: s.opportunity.apy,
              tvl_usd: s.opportunity.tvlUsd,
              bwtya_score: s.bwtyaScore,
              stewardship_grade: s.stewardshipGrade,
              biblical_rationale: s.biblicalRationale,
              fruit_bearing_score: s.fruitBearingScore,
              faithfulness_score: s.faithfulnessScore,
              biblical_alignment_score: s.biblicalAlignmentScore,
              transparency_score: s.transparencyScore,
              scored_at: new Date().toISOString(),
            })),
            { onConflict: 'protocol_name' },
          );
        }

        await logOperation(ctx, 'CORRELATE', 'bwtya_opportunity_scores', {
          outputSummary: {
            scored: scoredOpportunities.length,
            signals: allSignals.length,
            fearGreedIndex: fearGreed.index,
            topProtocol: scoredOpportunities[0]?.opportunity.protocol ?? 'N/A',
          },
        });

        // ------------------------------------------------------------------
        // Recommended strategy (simplified server-side)
        // ------------------------------------------------------------------
        const topScored = scoredOpportunities.slice(0, 3);
        const avgApy =
          topScored.reduce((s, o) => s + o.opportunity.apy, 0) / (topScored.length || 1);
        const strategy =
          avgApy > 15 ? "Solomon's Portfolio" : avgApy > 8 ? 'Talents Multiplied' : "Joseph's Storehouse";

        return {
          fearGreedIndex: fearGreed.index,
          fearGreedLabel: fearGreed.label,
          fearGreedCondition: fearGreed.condition,
          scoredOpportunities: scoredOpportunities.slice(0, 10),
          recommendedStrategy: strategy,
          signals: allSignals,
          totalSignals: allSignals.length,
          scannedProtocols: rawOpportunities.length,
        };
      },
    );

    return new Response(
      JSON.stringify({ agent: 'bwtya-swarm-orchestrator', ...swarmResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[bwtya-swarm-orchestrator] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agent: 'bwtya-swarm-orchestrator',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
