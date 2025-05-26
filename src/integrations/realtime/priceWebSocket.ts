
import React from 'react';
import { baseTokens } from '@/data/baseTokens';

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
}

export class PriceWebSocketClient {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (update: PriceUpdate) => void> = new Map();
  private basePrices: Record<string, number> = {
    'ETH': 1800,
    'USDC': 1.00,
    'DAI': 0.999,
    'USDT': 1.001,
    'WETH': 1800
  };

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Use mock updates since we don't have a real WebSocket endpoint
      this.startMockPriceUpdates();
    } catch (error) {
      console.log('WebSocket connection error, using mock data:', error);
      this.startMockPriceUpdates();
    }
  }

  private startMockPriceUpdates() {
    const tokens = Object.keys(this.basePrices);

    this.updateInterval = setInterval(() => {
      tokens.forEach(symbol => {
        const basePrice = this.basePrices[symbol];
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const newPrice = basePrice * (1 + variation);
        const change24h = (Math.random() - 0.5) * 10; // ±5% daily change

        const update: PriceUpdate = {
          symbol,
          price: newPrice,
          change24h,
          timestamp: Date.now()
        };

        this.notifySubscribers(symbol, update);
      });
    }, 5000); // Update every 5 seconds
  }

  private notifySubscribers(symbol: string, update: PriceUpdate) {
    this.subscribers.forEach((callback, subscribedSymbol) => {
      if (subscribedSymbol === symbol || subscribedSymbol === 'ALL') {
        callback(update);
      }
    });
  }

  subscribe(symbol: string, callback: (update: PriceUpdate) => void): () => void {
    const id = `${symbol}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);

    // Send initial price
    if (symbol !== 'ALL' && this.basePrices[symbol]) {
      const initialUpdate: PriceUpdate = {
        symbol,
        price: this.basePrices[symbol],
        change24h: (Math.random() - 0.5) * 10,
        timestamp: Date.now()
      };
      callback(initialUpdate);
    }

    return () => {
      this.subscribers.delete(id);
    };
  }

  subscribeToAll(callback: (update: PriceUpdate) => void): () => void {
    return this.subscribe('ALL', callback);
  }

  disconnect() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers.clear();
  }
}

export const priceWebSocketClient = new PriceWebSocketClient();

export function usePriceUpdates(symbol?: string) {
  const [prices, setPrices] = React.useState<Map<string, PriceUpdate>>(new Map());

  React.useEffect(() => {
    const targetSymbol = symbol || 'ALL';
    
    const unsubscribe = priceWebSocketClient.subscribe(targetSymbol, (update) => {
      setPrices(prev => new Map(prev.set(update.symbol, update)));
    });

    return unsubscribe;
  }, [symbol]);

  return {
    prices: Object.fromEntries(prices),
    getPrice: (sym: string) => prices.get(sym),
    isConnected: true
  };
}
