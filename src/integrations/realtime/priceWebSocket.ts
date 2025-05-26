
/**
 * Real-time price WebSocket connection
 * Uses CoinGecko WebSocket for live price updates
 */

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
}

export class PriceWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private subscribers: Map<string, (update: PriceUpdate) => void> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Using a mock WebSocket connection since CoinGecko's WebSocket requires pro subscription
      // In production, this would connect to the actual WebSocket endpoint
      this.startMockPriceUpdates();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Mock real-time price updates for demonstration
   * In production, this would be replaced with actual WebSocket data
   */
  private startMockPriceUpdates() {
    const tokens = ['ETH', 'USDC', 'DAI', 'WETH'];
    const basePrices: Record<string, number> = {
      'ETH': 1800,
      'USDC': 1.00,
      'DAI': 0.999,
      'WETH': 1800
    };

    setInterval(() => {
      tokens.forEach(symbol => {
        const basePrice = basePrices[symbol];
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
    }, 2000); // Update every 2 seconds
  }

  private notifySubscribers(symbol: string, update: PriceUpdate) {
    this.subscribers.forEach((callback, subscribedSymbol) => {
      if (subscribedSymbol === symbol || subscribedSymbol === 'ALL') {
        callback(update);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  /**
   * Subscribe to price updates for a specific token
   */
  subscribe(symbol: string, callback: (update: PriceUpdate) => void): () => void {
    const id = `${symbol}_${Date.now()}`;
    this.subscribers.set(id, callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
    };
  }

  /**
   * Subscribe to all price updates
   */
  subscribeToAll(callback: (update: PriceUpdate) => void): () => void {
    return this.subscribe('ALL', callback);
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

// Singleton instance
export const priceWebSocketClient = new PriceWebSocketClient();

/**
 * React hook for real-time price updates
 */
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
    isConnected: true // Mock connection status
  };
}
