/**
 * spandex-swap-agent – Supabase Edge Function
 *
 * Runs the Spandex × BWTYA advisory pipeline server-side inside
 * withAgentSandbox, persisting the advisory result to defi_knowledge_base.
 *
 * Auth: x-cron-secret header OR admin JWT (via requireAgentAuth)
 *
 * POST body:
 * {
 *   fromToken: string,        // e.g. "ETH"
 *   toToken: string,          // e.g. "USDC"
 *   providerQuotes: Array<{   // raw quotes forwarded from the frontend
 *     provider: string,
 *     outputAmount: string,
 *     outputAmountRaw: string // bigint serialised as decimal string
 *   }>,
 *   wisdomScore?: number,
 *   capitalUsd?: number,
 *   swapperAccount?: string,
 * }
 *
 * "For by wise guidance you can wage your war, and in abundance of
 *  counsellors there is victory." – Proverbs 24:6
 */

import {
  withAgentSandbox,
  sandboxedInsert,
  logOperation,
} from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// ---------------------------------------------------------------------------
// Per-provider biblical profiles (mirrors src/services/spandex/bridge.ts)
// ---------------------------------------------------------------------------

const PROVIDER_PROFILES: Record<string, {
  tvlUsd: number; riskScore: number; audited: boolean;
  isVerified: boolean; transparent: boolean; biblicalAlignment: string;
}> = {
  fabric: {
    tvlUsd: 2_000_000_000, riskScore: 10, audited: true, isVerified: true, transparent: true,
    biblicalAlignment: 'Faithful stewardship through institutional accountability (Luke 16:10).',
  },
  odos: {
    tvlUsd: 800_000_000, riskScore: 18, audited: true, isVerified: true, transparent: true,
    biblicalAlignment: '"A just weight is His delight" (Proverbs 11:1). Transparent routing.',
  },
  kyberswap: {
    tvlUsd: 400_000_000, riskScore: 22, audited: true, isVerified: true, transparent: true,
    biblicalAlignment: '"Invest in seven ventures" (Ecclesiastes 11:2). Broad multi-chain.',
  },
  lifi: {
    tvlUsd: 600_000_000, riskScore: 25, audited: true, isVerified: true, transparent: true,
    biblicalAlignment: '"Gathered money little by little" (Proverbs 13:11). Cross-chain unity.',
  },
};

function getProfile(name: string) {
  return PROVIDER_PROFILES[name.toLowerCase()] ?? {
    tvlUsd: 50_000_000, riskScore: 40, audited: false, isVerified: false, transparent: false,
    biblicalAlignment: 'Unknown provider – exercise caution (Proverbs 14:15).',
  };
}

// ---------------------------------------------------------------------------
// BWTYA scoring (server-side, without npm imports)
// ---------------------------------------------------------------------------

interface RawQuote { provider: string; outputAmount: string; outputAmountRaw: string; }

function scoreProvider(quote: RawQuote, allQuotes: RawQuote[]) {
  const profile = getProfile(quote.provider);

  // Derive APY-equivalent from price improvement
  const amounts = allQuotes.map((q) => parseFloat(q.outputAmountRaw));
  const avg = amounts.reduce((s, v) => s + v, 0) / (amounts.length || 1);
  const improvement = avg > 0
    ? ((parseFloat(quote.outputAmountRaw) - avg) / avg) * 100
    : 0;
  const apyEq = Math.max(2, Math.min(25, 13 + improvement * 2));

  // Dimension 1: Fruit-bearing (max 30)
  let fb = 0;
  if (apyEq >= 5 && apyEq <= 25) fb += 15;
  else if (apyEq > 25) fb += 8;
  else fb += 5;
  if (profile.tvlUsd >= 1_000_000_000) fb += 15;
  else if (profile.tvlUsd >= 100_000_000) fb += 10;
  else if (profile.tvlUsd >= 10_000_000) fb += 6;
  else fb += 3;

  // Dimension 2: Faithful stewardship (max 25)
  const fs = Math.round(15 * (1 - profile.riskScore / 100)) +
    (profile.audited ? 7 : 0) + (profile.isVerified ? 3 : 0);

  // Dimension 3: Biblical alignment (max 25)
  const POSITIVE = ['stewardship', 'faithful', 'transparent', 'honest', 'just', 'community'];
  const ba = Math.min(
    20,
    POSITIVE.filter((k) => profile.biblicalAlignment.toLowerCase().includes(k)).length * 5,
  ) + 5; // stable category bonus

  // Dimension 4: Transparency (max 20)
  const tr = (profile.transparent ? 10 : 0) + (profile.audited ? 5 : 0) + (profile.isVerified ? 5 : 0);

  const total = Math.min(30, fb) + Math.min(25, fs) + Math.min(25, ba) + Math.min(20, tr);
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';

  return {
    provider: quote.provider,
    outputAmount: quote.outputAmount,
    bwtyaScore: total,
    stewardshipGrade: grade,
    apyEquivalent: apyEq,
    profile,
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth guard
  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error ?? 'Unauthorized', corsHeaders);
  }

  const body = await req.json().catch(() => ({}));
  const {
    fromToken = 'ETH',
    toToken = 'USDC',
    providerQuotes = [] as RawQuote[],
    wisdomScore = 50,
    capitalUsd = 0,
  } = body;

  const result = await withAgentSandbox(
    { agentName: 'spandex-swap-agent', runMode: 'triggered' },
    async (ctx) => {
      // Score all providers
      const scored = (providerQuotes as RawQuote[]).map((q) =>
        scoreProvider(q, providerQuotes as RawQuote[])
      );
      scored.sort((a, b) => b.bwtyaScore - a.bwtyaScore);

      const bestPrice = [...(providerQuotes as RawQuote[])].sort(
        (a, b) => parseFloat(b.outputAmountRaw) - parseFloat(a.outputAmountRaw),
      )[0] ?? null;

      const bwtyaWinner = scored[0] ?? null;
      const alignedWithBestPrice = bwtyaWinner?.provider === bestPrice?.provider;

      ctx.stats.processed += scored.length;

      // Persist advisory to defi_knowledge_base
      const advisoryRecord = {
        topic: `spandex_advisory:${fromToken}_${toToken}`,
        content: JSON.stringify({
          fromToken,
          toToken,
          scoredProviders: scored,
          bwtyaRecommended: bwtyaWinner,
          bestPrice,
          alignedWithBestPrice,
          wisdomScore,
          capitalUsd,
          runId: ctx.runId,
          timestamp: new Date().toISOString(),
        }),
        source: 'spandex-swap-agent',
        relevance_score: bwtyaWinner?.bwtyaScore ? bwtyaWinner.bwtyaScore / 100 : 0,
      };

      await sandboxedInsert(ctx, 'defi_knowledge_base', advisoryRecord, {
        onConflict: 'topic',
      });

      await logOperation(ctx, 'ADVISORY', 'defi_knowledge_base', {
        recordsAffected: scored.length,
        inputSummary: { fromToken, toToken, providers: scored.map((s) => s.provider) },
        outputSummary: {
          bwtyaWinner: bwtyaWinner?.provider,
          topScore: bwtyaWinner?.bwtyaScore,
          alignedWithBestPrice,
        },
      });

      ctx.stats.created += 1;

      return {
        scoredProviders: scored,
        bwtyaRecommended: bwtyaWinner,
        bestPrice: bestPrice ? {
          provider: bestPrice.provider,
          outputAmount: bestPrice.outputAmount,
        } : null,
        alignedWithBestPrice,
        fromToken,
        toToken,
        wisdomScore,
      };
    },
  );

  return new Response(
    JSON.stringify({
      ...result,
      // Sanitize internal error details before exposing to caller
      error: result.success === false ? 'Advisory pipeline encountered an error. Please retry.' : undefined,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});
