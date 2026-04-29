// Spandex → BWTYA Bridge
//
// Converts raw spanDEX provider quotes into YieldOpportunity objects that the
// BWTYA scoring pipeline can evaluate.  Also maintains a curated biblical-
// alignment profile for each known spanDEX provider.
//
// "Iron sharpens iron, and one person sharpens another." – Proverbs 27:17

import type { YieldOpportunity } from '@/services/bwsp/types';
import type { SpandexRawQuote, SpandexProviderProfile } from './types';

// ---------------------------------------------------------------------------
// Per-provider knowledge profiles
// ---------------------------------------------------------------------------

const PROVIDER_PROFILES: Record<string, SpandexProviderProfile> = {
  fabric: {
    name: 'fabric',
    displayName: 'Fabric (Coinbase)',
    tvlUsd: 2_000_000_000,
    riskScore: 10,
    audited: true,
    isVerified: true,
    transparent: true,
    biblicalAlignment:
      'Faithful stewardship through institutional accountability and transparent ' +
      'open-source code. Backed by a publicly-traded company with strong regulatory ' +
      'compliance – a diligent keeper of financial integrity (Luke 16:10).',
  },
  odos: {
    name: 'odos',
    displayName: 'Odos',
    tvlUsd: 800_000_000,
    riskScore: 18,
    audited: true,
    isVerified: true,
    transparent: true,
    biblicalAlignment:
      'Community-oriented DEX aggregator with transparent routing and ' +
      'publicly-audited smart contracts. Seeks honest pricing across many sources ' +
      '– "a just weight is His delight" (Proverbs 11:1).',
  },
  kyberswap: {
    name: 'kyberswap',
    displayName: 'KyberSwap',
    tvlUsd: 400_000_000,
    riskScore: 22,
    audited: true,
    isVerified: true,
    transparent: true,
    biblicalAlignment:
      'Open-source, community-governed liquidity protocol with Elastic and Classic ' +
      'AMM pools. Broad multi-chain support enables diversified stewardship – ' +
      '"invest in seven ventures, yes in eight" (Ecclesiastes 11:2).',
  },
  lifi: {
    name: 'lifi',
    displayName: 'LI.FI',
    tvlUsd: 600_000_000,
    riskScore: 25,
    audited: true,
    isVerified: true,
    transparent: true,
    biblicalAlignment:
      'Cross-chain bridge aggregator uniting fragmented liquidity across chains. ' +
      'Brings together scattered resources for collective stewardship – ' +
      '"gathered money little by little makes it grow" (Proverbs 13:11).',
  },
  uniswap: {
    name: 'uniswap',
    displayName: 'Uniswap V3',
    tvlUsd: 5_000_000_000,
    riskScore: 12,
    audited: true,
    isVerified: true,
    transparent: true,
    biblicalAlignment:
      'The largest decentralised exchange by volume; deeply audited and fully ' +
      'transparent. Its concentrated liquidity is a model of diligent resource ' +
      'deployment – "the hand of the diligent makes rich" (Proverbs 10:4).',
  },
};

/** Fallback profile for unknown providers */
function fallbackProfile(providerName: string): SpandexProviderProfile {
  return {
    name: providerName.toLowerCase(),
    displayName: providerName,
    tvlUsd: 50_000_000,
    riskScore: 40,
    audited: false,
    isVerified: false,
    transparent: false,
    biblicalAlignment:
      'Provider details unknown – exercise prudent caution (Proverbs 14:15). ' +
      'Verify this aggregator independently before trusting with capital.',
  };
}

// ---------------------------------------------------------------------------
// Quote → YieldOpportunity conversion
// ---------------------------------------------------------------------------

/**
 * The BWTYA scorer uses APY as the primary sustainability metric.
 * For swap routes we model "APY equivalent" as the percentage price
 * improvement offered by this provider over the arithmetic mean of all
 * provider outputs, mapped into the 5–25 % "sustainable orchard" range.
 *
 * If there is only one provider, we use the provider's risk-adjusted
 * baseline instead (a known-good provider scores ~12 %, an unverified
 * one scores ~2 %).
 */
function deriveApyEquivalent(
  quote: SpandexRawQuote,
  allQuotes: SpandexRawQuote[],
  profile: SpandexProviderProfile,
): number {
  if (allQuotes.length <= 1) {
    // Single provider – use a profile-based baseline
    return profile.riskScore <= 15 ? 12 : profile.riskScore <= 25 ? 8 : 4;
  }

  const amounts = allQuotes.map((q) => Number(q.outputAmountRaw));
  const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  if (avg === 0) return 5;

  const improvement = ((Number(quote.outputAmountRaw) - avg) / avg) * 100;
  // Map improvement ∈ [-100, +100] → APY-equivalent ∈ [2, 25]
  return Math.max(2, Math.min(25, 13 + improvement * 2));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getProviderProfile(providerName: string): SpandexProviderProfile {
  const key = providerName.toLowerCase();
  return PROVIDER_PROFILES[key] ?? fallbackProfile(providerName);
}

/**
 * Convert a single Spandex provider quote into a BWTYA-ready YieldOpportunity.
 *
 * @param quote       The raw quote from spanDEX
 * @param allQuotes   All quotes in this round (used to compute relative APY)
 * @param fromToken   Input token symbol (e.g. "ETH")
 * @param toToken     Output token symbol (e.g. "USDC")
 */
export function spandexQuoteToOpportunity(
  quote: SpandexRawQuote,
  allQuotes: SpandexRawQuote[],
  fromToken: string,
  toToken: string,
): YieldOpportunity {
  const profile = getProviderProfile(quote.provider);
  const apy = deriveApyEquivalent(quote, allQuotes, profile);

  return {
    protocol: profile.displayName,
    poolName: `${fromToken}/${toToken} Swap Route`,
    tokenSymbol: toToken,
    chain: 'Base',
    apy,
    tvlUsd: profile.tvlUsd,
    riskScore: profile.riskScore,
    category: 'DEX Aggregator',
    biblicalAlignment: profile.biblicalAlignment,
    isVerified: profile.isVerified,
    audited: profile.audited,
    transparent: profile.transparent,
  };
}

/**
 * Convert all Spandex quotes into a BWTYA opportunity array in one pass.
 */
export function spandexQuotesToOpportunities(
  quotes: SpandexRawQuote[],
  fromToken: string,
  toToken: string,
): YieldOpportunity[] {
  return quotes.map((q) => spandexQuoteToOpportunity(q, quotes, fromToken, toToken));
}
