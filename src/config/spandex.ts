/**
 * spanDEX Meta-Aggregator Configuration for BibleFi
 * Queries multiple DEX aggregators (Odos, KyberSwap, LI.FI, Fabric)
 * to find the best swap price across Base chain.
 *
 * Security: dependencies are pinned; no raw user SQL; CSP headers on web app.
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
 * Usage (from docs):
 *   const quote = await getQuote({
 *     config: spandexConfig,
 *     swap: {
 *       chainId: 8453,
 *       inputToken: "0x4200000000000000000000000000000000000006", // WETH
 *       outputToken: "0xd9AAEC86B65D86f6A7B5B1b0c42FFA531710b6CA", // USDbC
 *       mode: "exactIn",
 *       inputAmount: 1_000_000_000_000_000_000n, // 1 WETH
 *       slippageBps: 50,
 *       swapperAccount: "0x1234...",
 *     },
 *     strategy: "bestPrice",
 *   });
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
    deadlineMs: 8000,
    numRetries: 2,
    initialRetryDelayMs: 500,
  },
});

// Re-export helpers for convenience
export { getQuote, getQuotes } from '@spandex/core';
