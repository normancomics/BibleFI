
/**
 * CoinGecko API Integration for real-time crypto prices
 * Free tier allows 10-30 calls/minute
 */

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export interface HistoricalPrice {
  timestamp: number;
  price: number;
}

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Base chain token mapping
const BASE_TOKENS = {
  'ethereum': 'ETH',
  'usd-coin': 'USDC', 
  'dai': 'DAI',
  'tether': 'USDT',
  'wrapped-bitcoin': 'WBTC'
};

export class CoinGeckoClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = COINGECKO_BASE_URL;
  }

  /**
   * Get current prices for multiple cryptocurrencies
   */
  async getCurrentPrices(coinIds: string[]): Promise<CoinPrice[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices from CoinGecko');
      }
      
      return await response.json();
    } catch (error) {
      console.error('CoinGecko API error:', error);
      // Return mock data as fallback
      return this.getMockPrices(coinIds);
    }
  }

  /**
   * Get historical price data for a coin
   */
  async getHistoricalData(coinId: string, days: number = 7): Promise<HistoricalPrice[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      
      const data = await response.json();
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price
      }));
    } catch (error) {
      console.error('Historical data error:', error);
      return [];
    }
  }

  /**
   * Get trending coins
   */
  async getTrendingCoins(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/trending`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending coins');
      }
      
      const data = await response.json();
      return data.coins;
    } catch (error) {
      console.error('Trending coins error:', error);
      return [];
    }
  }

  /**
   * Mock data fallback
   */
  private getMockPrices(coinIds: string[]): CoinPrice[] {
    const mockData: Record<string, Partial<CoinPrice>> = {
      'ethereum': {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 1800,
        price_change_percentage_24h: 2.3
      },
      'usd-coin': {
        id: 'usd-coin',
        symbol: 'usdc',
        name: 'USD Coin',
        current_price: 1.00,
        price_change_percentage_24h: 0.1
      },
      'dai': {
        id: 'dai',
        symbol: 'dai',
        name: 'Dai',
        current_price: 0.999,
        price_change_percentage_24h: -0.05
      }
    };

    return coinIds.map(id => ({
      id,
      symbol: mockData[id]?.symbol || id,
      name: mockData[id]?.name || id,
      current_price: mockData[id]?.current_price || 1,
      market_cap: 1000000000,
      market_cap_rank: 1,
      price_change_percentage_24h: mockData[id]?.price_change_percentage_24h || 0,
      total_volume: 1000000,
      high_24h: (mockData[id]?.current_price || 1) * 1.05,
      low_24h: (mockData[id]?.current_price || 1) * 0.95,
      last_updated: new Date().toISOString()
    }));
  }
}

export const coinGeckoClient = new CoinGeckoClient();

// Hook for using CoinGecko data
export function useCoinGecko() {
  return {
    getCurrentPrices: coinGeckoClient.getCurrentPrices.bind(coinGeckoClient),
    getHistoricalData: coinGeckoClient.getHistoricalData.bind(coinGeckoClient),
    getTrendingCoins: coinGeckoClient.getTrendingCoins.bind(coinGeckoClient)
  };
}
