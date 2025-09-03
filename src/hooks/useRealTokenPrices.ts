import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TokenPrice {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
  logoURI?: string;
}

interface PriceData {
  [symbol: string]: TokenPrice;
}

// CoinGecko token ID mapping for Base chain tokens
const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  USDC: 'usd-coin',
  DAI: 'dai',
  USDT: 'tether',
  WETH: 'wrapped-ethereum',
  WBTC: 'wrapped-bitcoin',
  cbBTC: 'coinbase-wrapped-btc',
  cbETH: 'coinbase-wrapped-staked-eth',
  FRAX: 'frax',
  USDbC: 'usd-coin'
};

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export const useRealTokenPrices = () => {
  const [prices, setPrices] = useState<PriceData>({});
  
  // Fetch prices from CoinGecko API
  const { data: priceData, isLoading, error, refetch } = useQuery({
    queryKey: ['tokenPrices'],
    queryFn: async () => {
      const ids = Object.values(COINGECKO_IDS).join(',');
      const response = await fetch(
        `${COINGECKO_API_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Fetch token logos separately
  const { data: tokenData } = useQuery({
    queryKey: ['tokenLogos'],
    queryFn: async () => {
      const ids = Object.values(COINGECKO_IDS).join(',');
      const response = await fetch(
        `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch token data');
      }
      
      return response.json();
    },
    staleTime: 300000, // Cache logos for 5 minutes
  });

  useEffect(() => {
    if (priceData && tokenData) {
      const updatedPrices: PriceData = {};
      
      Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
        const coinData = priceData[id];
        const logoData = tokenData.find((token: any) => token.id === id);
        
        if (coinData) {
          updatedPrices[symbol] = {
            price: coinData.usd || 0,
            change24h: coinData.usd_24h_change || 0,
            volume24h: coinData.usd_24h_vol || 0,
            lastUpdated: (coinData.last_updated_at || Date.now() / 1000) * 1000,
            logoURI: logoData?.image || undefined
          };
        }
      });
      
      setPrices(updatedPrices);
    }
  }, [priceData, tokenData]);

  const getPrice = (symbol: string): TokenPrice | null => {
    return prices[symbol] || null;
  };

  const formatPrice = (price: number): string => {
    if (price < 0.01) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toLocaleString(undefined, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    }
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const refreshPrices = () => {
    refetch();
  };

  return {
    prices,
    isLoading,
    error,
    getPrice,
    formatPrice,
    formatChange,
    refreshPrices
  };
};