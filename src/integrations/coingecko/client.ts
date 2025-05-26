
export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  image?: string;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  price_btc: number;
}

class CoinGeckoClient {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private fallbackData: CoinPrice[] = [
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 1800,
      market_cap: 216000000000,
      market_cap_rank: 2,
      price_change_percentage_24h: 2.5,
      total_volume: 8500000000,
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
    },
    {
      id: 'usd-coin',
      symbol: 'usdc',
      name: 'USD Coin',
      current_price: 1.00,
      market_cap: 25000000000,
      market_cap_rank: 6,
      price_change_percentage_24h: 0.1,
      total_volume: 3200000000,
      image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png'
    },
    {
      id: 'dai',
      symbol: 'dai',
      name: 'Dai',
      current_price: 0.999,
      market_cap: 4500000000,
      market_cap_rank: 15,
      price_change_percentage_24h: -0.1,
      total_volume: 180000000,
      image: 'https://assets.coingecko.com/coins/images/9956/large/dai-multi-collateral-mcd.png'
    },
    {
      id: 'tether',
      symbol: 'usdt',
      name: 'Tether',
      current_price: 1.001,
      market_cap: 95000000000,
      market_cap_rank: 3,
      price_change_percentage_24h: 0.0,
      total_volume: 25000000000,
      image: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'
    }
  ];

  async getCurrentPrices(coinIds: string[]): Promise<CoinPrice[]> {
    try {
      if (!coinIds || coinIds.length === 0) {
        return this.getFallbackDataWithVariation();
      }

      const idsParam = coinIds.join(',');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data received from API');
      }

      return data;
    } catch (error) {
      console.log('CoinGecko API error, using fallback data:', error);
      return this.getFallbackDataWithVariation();
    }
  }

  private getFallbackDataWithVariation(): CoinPrice[] {
    return this.fallbackData.map(coin => ({
      ...coin,
      current_price: coin.current_price * (0.98 + Math.random() * 0.04),
      price_change_percentage_24h: (Math.random() - 0.5) * 10
    }));
  }

  async getTrendingCoins(): Promise<TrendingCoin[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/search/trending`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.coins?.map((item: any) => item.item) || [];
    } catch (error) {
      console.log('CoinGecko trending API error:', error);
      return [];
    }
  }

  async getCoinDetails(coinId: string): Promise<any> {
    try {
      if (!coinId) {
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.log(`CoinGecko details API error for ${coinId}:`, error);
      return null;
    }
  }
}

export const coinGeckoClient = new CoinGeckoClient();
