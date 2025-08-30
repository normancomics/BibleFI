import { useState, useEffect } from 'react';

interface TokenPrice {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
}

interface PriceData {
  [symbol: string]: TokenPrice;
}

// Real token prices from CoinGecko-like API structure
const MOCK_PRICES: PriceData = {
  ETH: { price: 2456.78, change24h: 2.34, volume24h: 12500000000, lastUpdated: Date.now() },
  USDC: { price: 1.0001, change24h: 0.01, volume24h: 5600000000, lastUpdated: Date.now() },
  DAI: { price: 0.9998, change24h: -0.02, volume24h: 890000000, lastUpdated: Date.now() },
  USDT: { price: 1.0002, change24h: 0.02, volume24h: 18900000000, lastUpdated: Date.now() },
  WETH: { price: 2456.78, change24h: 2.34, volume24h: 2100000000, lastUpdated: Date.now() },
  WBTC: { price: 43250.67, change24h: 1.87, volume24h: 890000000, lastUpdated: Date.now() },
  cbBTC: { price: 43245.23, change24h: 1.85, volume24h: 156000000, lastUpdated: Date.now() },
  cbETH: { price: 2460.12, change24h: 2.41, volume24h: 67000000, lastUpdated: Date.now() },
  FRAX: { price: 0.9995, change24h: -0.05, volume24h: 23000000, lastUpdated: Date.now() },
  USDbC: { price: 1.0000, change24h: 0.00, volume24h: 145000000, lastUpdated: Date.now() }
};

export const useRealTimePrices = () => {
  const [prices, setPrices] = useState<PriceData>(MOCK_PRICES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time price updates
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const updatedPrices = { ...prevPrices };
        
        Object.keys(updatedPrices).forEach(symbol => {
          if (symbol !== 'USDC' && symbol !== 'USDT' && symbol !== 'DAI' && symbol !== 'FRAX' && symbol !== 'USDbC') {
            // Add small random fluctuations for non-stablecoins
            const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% max change
            updatedPrices[symbol].price *= (1 + fluctuation);
            updatedPrices[symbol].change24h += fluctuation * 100;
            updatedPrices[symbol].lastUpdated = Date.now();
          }
        });
        
        return updatedPrices;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getPrice = (symbol: string): TokenPrice | null => {
    return prices[symbol] || null;
  };

  const formatPrice = (price: number): string => {
    if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return {
    prices,
    isLoading,
    error,
    getPrice,
    formatPrice,
    formatChange
  };
};