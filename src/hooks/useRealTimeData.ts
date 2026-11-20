import { useState, useEffect, useCallback } from 'react';
import { baseRPCClient } from '@/integrations/base/rpc';
import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';

export interface RealTimeStats {
  /** Base network TVL from DeFiLlama, or null if unavailable. */
  baseTVL: string | null;
  /** Base gas price in gwei, or null if the RPC call failed. */
  gasPrice: string | null;
  blockNumber: number | null;
}

export interface PriceEntry {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const formatUsdCompact = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(1)}M`;

async function fetchBaseTvl(): Promise<string | null> {
  const res = await fetch('https://api.llama.fi/v2/chains');
  if (!res.ok) return null;
  const chains: Array<{ name: string; tvl: number }> = await res.json();
  const base = chains.find((c) => c.name === 'Base');
  return base ? formatUsdCompact(base.tvl) : null;
}

/** Live Base network stats and token prices. No fabricated or randomized values. */
export function useRealTimeData() {
  const { prices: livePrices } = useRealTokenPrices();
  const [stats, setStats] = useState<RealTimeStats>({ baseTVL: null, gasPrice: null, blockNumber: null });
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [gas, block, tvl] = await Promise.allSettled([
      baseRPCClient.getGasPrice(),
      baseRPCClient.getLatestBlock(),
      fetchBaseTvl(),
    ]);
    const blockNumber = block.status === 'fulfilled' && block.value > 0 ? block.value : null;
    setStats({
      // The RPC client swallows errors and returns defaults, so only trust gas when the block call also worked.
      gasPrice: gas.status === 'fulfilled' && blockNumber !== null ? gas.value : null,
      blockNumber,
      baseTVL: tvl.status === 'fulfilled' ? tvl.value : null,
    });
    setIsConnected(blockNumber !== null);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const prices: PriceEntry[] = Object.entries(livePrices).map(([symbol, p]) => ({
    id: symbol,
    symbol: symbol.toLowerCase(),
    current_price: p.price,
    price_change_percentage_24h: p.change24h,
  }));

  const getPriceBySymbol = useCallback(
    (symbol: string) => prices.find((p) => p.symbol === symbol.toLowerCase()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [livePrices],
  );

  return {
    stats,
    prices,
    yieldPools: [] as Array<{ project: string; apy: number; tvlUsd: number }>,
    loading,
    lastUpdate,
    refreshData: fetchAllData,
    getPriceBySymbol,
    getYieldPoolByProject: (_project: string): { project: string; apy: number; tvlUsd: number } | undefined => undefined,
    isConnected,
  };
}

export default useRealTimeData;
