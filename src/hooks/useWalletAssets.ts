/**
 * useWalletAssets — single source of truth for the connected wallet's
 * balances + live USD prices on Base (8453) or Base Sepolia (84532).
 * "Moreover it is required in stewards, that a man be found faithful." — 1 Corinthians 4:2
 * Every DeFi screen reads from here so numbers always agree and are never invented.
 */
import { useMemo } from 'react';
import { useAccount, useBalance, useChainId, useReadContracts } from 'wagmi';
import { erc20Abi, formatUnits, type Address } from 'viem';
import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';

export const BASE_MAINNET_ID = 8453;
export const BASE_SEPOLIA_ID = 84532;

export interface ChainToken {
  symbol: string;
  name: string;
  address: Address | 'native';
  decimals: number;
}

export const TOKENS_BY_CHAIN: Record<number, ChainToken[]> = {
  [BASE_MAINNET_ID]: [
    { symbol: 'ETH', name: 'Ethereum', address: 'native', decimals: 18 },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', decimals: 18 },
  ],
  [BASE_SEPOLIA_ID]: [
    { symbol: 'ETH', name: 'Test Ether', address: 'native', decimals: 18 },
    { symbol: 'WETH', name: 'Wrapped Test Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    { symbol: 'USDC', name: 'Test USD Coin', address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', decimals: 6 },
  ],
};

export interface WalletAsset extends ChainToken {
  balance: string | null; // null = unknown (not connected / loading)
  balanceRaw: bigint | null;
  priceUsd: number | null;
  valueUsd: number | null;
}

export function useWalletAssets() {
  const { address, isConnected } = useAccount();
  const connectedChain = useChainId();
  const chainId = connectedChain === BASE_SEPOLIA_ID ? BASE_SEPOLIA_ID : BASE_MAINNET_ID;
  const isTestnet = chainId === BASE_SEPOLIA_ID;
  const tokens = TOKENS_BY_CHAIN[chainId];
  const { prices } = useRealTokenPrices();

  const native = useBalance({ address, chainId, query: { enabled: !!address, refetchInterval: 15000 } });
  const erc20s = tokens.filter((t) => t.address !== 'native');
  const reads = useReadContracts({
    contracts: erc20s.map((t) => ({
      address: t.address as Address, abi: erc20Abi, functionName: 'balanceOf' as const,
      args: [address as Address], chainId,
    })),
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  const assets = useMemo<WalletAsset[]>(() => tokens.map((t) => {
    let raw: bigint | null = null;
    if (address) {
      if (t.address === 'native') raw = native.data?.value ?? null;
      else {
        const i = erc20s.findIndex((e) => e.symbol === t.symbol);
        const r = reads.data?.[i];
        raw = r && r.status === 'success' ? (r.result as bigint) : null;
      }
    }
    const balance = raw === null ? null : formatUnits(raw, t.decimals);
    const priceKey = t.symbol === 'WETH' ? 'ETH' : t.symbol;
    const priceUsd = prices?.[priceKey]?.price ?? (['USDC', 'USDT', 'DAI'].includes(t.symbol) ? 1 : null);
    const valueUsd = balance !== null && priceUsd !== null ? parseFloat(balance) * priceUsd : null;
    return { ...t, balance, balanceRaw: raw, priceUsd, valueUsd };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tokens, address, native.data?.value, reads.data, prices]);

  const get = (symbol: string) => assets.find((a) => a.symbol === symbol.toUpperCase()) ?? null;

  return {
    address, isConnected, chainId, isTestnet, assets, get,
    isLoading: native.isLoading || reads.isLoading,
    refetch: () => { native.refetch(); reads.refetch(); },
  };
}

/** Pure price-based estimate used when live routing is unavailable. */
export function estimateSwapOutput(amountIn: number, priceIn: number | null, priceOut: number | null, feeBps = 30) {
  if (!priceIn || !priceOut || !(amountIn > 0)) return null;
  return (amountIn * priceIn * (1 - feeBps / 10000)) / priceOut;
}

/** Short, readable balance string. */
export function fmtBalance(v: string | null, max = 6) {
  if (v === null) return '—';
  const n = parseFloat(v);
  if (n === 0) return '0';
  if (n < 0.000001) return '<0.000001';
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}
