/**
 * useSpandexExecute — real on-chain execution layer for the Spandex × BWTYA
 * advisory.
 *
 * After the advisory recommends the best-price route across Fabric / Odos /
 * KyberSwap / LI.FI, this hook lets the connected user actually execute that
 * swap. It re-quotes with best-price selection (which returns an already-
 * simulated, executable quote) and runs @spandex/core's executeQuote, which
 * sends the approval + swap from the user's wallet (EIP-5792 batch when the
 * wallet supports it) and waits for confirmation.
 *
 * SAFETY: this sends REAL transactions from the user's wallet. A real
 * transaction hash is returned ONLY after executeQuote confirms; any failure
 * (no route, user rejection, revert) returns an error and no hash — the UI
 * never implies a swap happened unless it did.
 *
 * "The plans of the diligent lead surely to abundance." — Proverbs 21:5
 */
import { useState, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { getQuote, executeQuote } from '@spandex/core';
import { spandexConfig } from '@/config/spandex';
import type { SpandexSwapAdvisoryInput } from '@/services/spandex/types';
import type { Address } from 'viem';

export interface UseSpandexExecuteReturn {
  isExecuting: boolean;
  txHash: string | null;
  error: string | null;
  /** Executes the best-price swap for the given advisory input; returns the tx hash or null. */
  execute: (input: SpandexSwapAdvisoryInput) => Promise<string | null>;
  reset: () => void;
}

export function useSpandexExecute(): UseSpandexExecuteReturn {
  const { data: walletClient } = useWalletClient();
  const [isExecuting, setIsExecuting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsExecuting(false);
    setTxHash(null);
    setError(null);
  }, []);

  const execute = useCallback(
    async (input: SpandexSwapAdvisoryInput): Promise<string | null> => {
      if (!walletClient) {
        setError('Connect your wallet to execute the swap.');
        return null;
      }
      setIsExecuting(true);
      setTxHash(null);
      setError(null);

      try {
        const account = walletClient.account?.address ?? (input.swapperAccount as Address);
        const swap = {
          chainId: input.chainId ?? 8453,
          inputToken: input.fromTokenAddress as Address,
          outputToken: input.toTokenAddress as Address,
          mode: 'exactIn' as const,
          inputAmount: input.inputAmountRaw,
          slippageBps: input.slippageBps ?? 50,
          swapperAccount: account as Address,
        };

        // Best-price selection returns an already-simulated, executable quote.
        const quote = await getQuote({ config: spandexConfig, swap, strategy: 'bestPrice' });
        if (!quote) {
          throw new Error('No executable route found across providers for this swap.');
        }

        // Sends approval + swap from the wallet; resolves after confirmation.
        const { transactionHash } = await executeQuote({
          swap,
          quote,
          walletClient,
          config: spandexConfig,
        });

        setTxHash(transactionHash);
        return transactionHash;
      } catch (e) {
        const msg =
          e instanceof Error
            ? // Normalise the common wallet-rejection message
              /user rejected|denied|rejected the request/i.test(e.message)
              ? 'Transaction rejected in wallet.'
              : e.message
            : 'Swap execution failed.';
        setError(msg);
        return null;
      } finally {
        setIsExecuting(false);
      }
    },
    [walletClient],
  );

  return { isExecuting, txHash, error, execute, reset };
}
