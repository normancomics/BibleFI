
/**
 * Centralized hook for all real-time data management
 */

import { useState, useEffect, useCallback } from 'react';
import { coinGeckoClient } from '@/integrations/coingecko/client';
import { defiLlamaClient } from '@/integrations/defillama/client';
import { baseRPCClient } from '@/integrations/base/rpc';
import { priceWebSocketClient } from '@/integrations/realtime/priceWebSocket';
import type { CoinPrice } from '@/integrations/coingecko/client';
import type { YieldPool } from '@/integrations/defillama/client';

export interface RealTimeStats {
  totalValueLocked: string;
  activeUsers: number;
  averageAPY: string;
  securityScore: string;
  totalDonated: string;
  baseTVL: string;
  gasPrice: string;
  blockNumber: number;
}

export function useRealTimeData() {
  const [stats, setStats] = useState<RealTimeStats>({
    totalValueLocked: "$2.4M",
    activeUsers: 1247,
    averageAPY: "8.4%",
    securityScore: "99.8%",
    totalDonated: "$487K",
    baseTVL: "$2.4B",
    gasPrice: "0.001",
    blockNumber: 0
  });

  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [yieldPools, setYieldPools] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch price data
      const priceData = await coinGeckoClient.getCurrentPrices([
        'ethereum', 'usd-coin', 'dai', 'tether'
      ]);
      setPrices(priceData);

      // Fetch DeFi data
      const poolData = await defiLlamaClient.getBaseChainPools();
      setYieldPools(poolData);

      // Fetch Base chain data
      const [baseTVL, gasPrice, blockNumber] = await Promise.all([
        defiLlamaClient.getBaseTVL(),
        baseRPCClient.getGasPrice(),
        baseRPCClient.getLatestBlock()
      ]);

      // Calculate dynamic stats
      const avgAPY = poolData.length > 0 
        ? (poolData.reduce((sum, pool) => sum + pool.apy, 0) / poolData.length).toFixed(1)
        : "8.4";

      const platformTVL = poolData.reduce((sum, pool) => sum + pool.tvlUsd, 0);

      setStats({
        totalValueLocked: `$${(platformTVL / 1000000).toFixed(1)}M`,
        activeUsers: Math.floor(1200 + Math.random() * 100), // Simulated user count
        averageAPY: `${avgAPY}%`,
        securityScore: "99.8%",
        totalDonated: "$487K", // This would come from tithing data
        baseTVL: `$${(baseTVL / 1000000000).toFixed(1)}B`,
        gasPrice,
        blockNumber
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Set up periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Real-time price updates via WebSocket
  useEffect(() => {
    const unsubscribe = priceWebSocketClient.subscribeToAll((update) => {
      setPrices(prev => 
        prev.map(coin => 
          coin.symbol === update.symbol.toLowerCase() 
            ? { ...coin, current_price: update.price, price_change_percentage_24h: update.change24h }
            : coin
        )
      );
    });

    return unsubscribe;
  }, []);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getPriceBySymbol = useCallback((symbol: string) => {
    return prices.find(price => 
      price.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }, [prices]);

  const getYieldPoolByProject = useCallback((project: string) => {
    return yieldPools.find(pool => 
      pool.project.toLowerCase().includes(project.toLowerCase())
    );
  }, [yieldPools]);

  return {
    stats,
    prices,
    yieldPools,
    loading,
    lastUpdate,
    refreshData,
    getPriceBySymbol,
    getYieldPoolByProject,
    isConnected: true
  };
}

export default useRealTimeData;
