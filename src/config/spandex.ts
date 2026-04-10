/**
 * spanDEX Meta-Aggregator Configuration for BibleFi
 * Queries multiple DEX aggregators (0x, Odos, KyberSwap, LI.FI, Fabric)
 * to find the best swap price across Base chain.
 */
import { createConfig, odos, kyberswap, lifi, fabric } from '@spandex/core';
import { createPublicClient, http, type PublicClient } from 'viem';
import { base } from 'viem/chains';

// Public client for on-chain quote simulation
const baseClient = createPublicClient({
  chain: base,
  transport: http('https://base.rpc.subquery.network/public', {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
});

/**
 * Shared spanDEX config — reuse across the entire app.
 * Providers run in parallel and the best quote wins.
 *
 * NOTE: 0x requires an API key (already proxied via our zerox-proxy edge
 * function), so we skip it here and keep only keyless / free providers.
 * Add `zeroX({ apiKey })` when a client-safe key is available.
 */
export const spandexConfig = createConfig({
  providers: [
    fabric({ appId: 'biblefi' }),
    odos({}),
    kyberswap({ clientId: 'biblefi' }),
    lifi({}),
  ],
  clients: [baseClient] as PublicClient[],
  options: {
    deadlineMs: 8000,   // max 8 s to collect all provider responses
    numRetries: 2,
    initialRetryDelayMs: 500,
  },
});

// Re-export helpers for convenience
export { getQuote, getQuotes } from '@spandex/core';
