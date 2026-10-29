import { useMemo } from 'react';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { formatUnits, isAddress, type Address } from 'viem';
import { baseTokens } from '@/data/baseTokens';
import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export interface WalletToken {
  symbol: string;
  address: Address;
  decimals: number;
}

const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ZERO = '0x0000000000000000000000000000000000000000';

// Mainnet tokens come from the shared token list (valid, non-native addresses only).
const BASE_TOKEN_MAP: Record<string, WalletToken> = Object.fromEntries(
  Object.values(baseTokens)
    .filter((t) => t.symbol !== 'ETH' && isAddress(t.address) && t.address.toLowerCase() !== ZERO)
    .map((t) => [t.symbol, { symbol: t.symbol, address: t.address as Address, decimals: t.decimals }]),
);

// Base Sepolia: only contracts verified to exist on the testnet.
const BASE_SEPOLIA_TOKEN_MAP: Record<string, WalletToken> = {
  WETH: { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
  USDC: { symbol: 'USDC', address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', decimals: 6 },
};

export const TOKEN_MAPS: Record<number, Record<string, WalletToken>> = {
  [BASE_CHAIN_ID]: BASE_TOKEN_MAP,
  [BASE_SEPOLIA_CHAIN_ID]: BASE_SEPOLIA_TOKEN_MAP,
};

export const isSupportedAssetChain = (chainId?: number): chainId is number =>
  chainId === BASE_CHAIN_ID || chainId === BASE_SEPOLIA_CHAIN_ID;

/**
 * Shared wallet reader: native ETH + ERC-20 balances (multicall) for Base or
 * Base Sepolia, plus live USD prices. Returns null for values that are not
 * available — callers must never substitute made-up numbers.
 */
export const useWalletAssets = (chainId: number = BASE_CHAIN_ID) => {
  const { address, isConnected } = useAccount();
  const supported = isSupportedAssetChain(chainId);
  const isTestnet = chainId === BASE_SEPOLIA_CHAIN_ID;
  const tokens = useMemo(() => Object.values(TOKEN_MAPS[chainId] ?? {}), [chainId]);

  const native = useBalance({
    address,
    chainId,
    query: { enabled: !!address && supported, refetchInterval: 10000 },
  });

  const erc20 = useReadContracts({
    allowFailure: true,
    contracts: tokens.map((t) => ({
      address: t.address,
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf' as const,
      args: [address as Address] as const,
      chainId,
    })),
    query: { enabled: !!address && supported && tokens.length > 0, refetchInterval: 10000 },
  });

  const { prices: marketPrices, isLoading: pricesLoading } = useRealTokenPrices();

  const balances = useMemo(() => {
    const out: Record<string, { raw: bigint; formatted: string; decimals: number } | null> = {};
    if (native.data) {
      out.ETH = { raw: native.data.value, formatted: native.data.formatted, decimals: 18 };
    }
    tokens.forEach((t, i) => {
      const r = erc20.data?.[i];
      out[t.symbol] =
        r && r.status === 'success'
          ? { raw: r.result as bigint, formatted: formatUnits(r.result as bigint, t.decimals), decimals: t.decimals }
          : null;
    });
    return out;
  }, [native.data, erc20.data, tokens]);

  /** Live USD price; null on testnets (test tokens have no market value) or when unavailable. */
  const getPriceUsd = (symbol: string): number | null => {
    if (isTestnet) return null;
    const p = marketPrices[symbol]?.price;
    return typeof p === 'number' && p > 0 ? p : null;
  };

  /** Live market price regardless of network (used only for clearly-labelled estimates). */
  const getMarketPriceUsd = (symbol: string): number | null => {
    const p = marketPrices[symbol]?.price;
    return typeof p === 'number' && p > 0 ? p : null;
  };

  const getBalance = (symbol: string) => balances[symbol] ?? null;

  return {
    address,
    isConnected,
    chainId,
    isTestnet,
    supported,
    tokens,
    balances,
    getBalance,
    getPriceUsd,
    getMarketPriceUsd,
    isLoading: native.isLoading || erc20.isLoading || pricesLoading,
    refetch: () => {
      native.refetch();
      erc20.refetch();
    },
  };
};

export default useWalletAssets;
