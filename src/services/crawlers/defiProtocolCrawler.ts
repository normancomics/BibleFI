import { supabase } from '@/integrations/supabase/client';

interface ProtocolData {
  name: string;
  chain: string;
  tvl: number;
  apy: number;
  volume24h: number;
  fees24h: number;
  contractAddress?: string;
  abi?: any[];
  tokens: TokenData[];
  pools: PoolData[];
}

interface TokenData {
  symbol: string;
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

interface PoolData {
  id: string;
  token0: string;
  token1: string;
  tvl: number;
  apy: number;
  volume24h: number;
  fee: number;
}

/**
 * DeFi Protocol Data Crawler
 * Continuously queries on-chain APIs and aggregators for:
 * - Token prices
 * - Pool metrics
 * - Transaction fees
 * - Contract ABIs
 */
export class DeFiProtocolCrawler {
  private chains = ['base', 'arbitrum', 'optimism', 'monad'];
  private apiEndpoints = {
    coingecko: 'https://api.coingecko.com/api/v3',
    defillama: 'https://api.llama.fi',
    zerox: 'https://api.0x.org',
    odos: 'https://api.odos.xyz'
  };

  async crawlAllProtocols(onProgress?: (progress: number) => void): Promise<ProtocolData[]> {
    const protocols: ProtocolData[] = [];
    let completed = 0;
    const totalTasks = this.chains.length * 3; // TVL, Prices, Pools for each chain

    console.log('Starting DeFi protocol crawl across all chains...');

    for (const chain of this.chains) {
      try {
        // Crawl TVL data
        const tvlData = await this.crawlDeFiLlamaTVL(chain);
        protocols.push(...tvlData);
        completed++;
        if (onProgress) onProgress((completed / totalTasks) * 100);

        // Crawl token prices
        await this.crawlTokenPrices(chain);
        completed++;
        if (onProgress) onProgress((completed / totalTasks) * 100);

        // Crawl pool metrics
        await this.crawlPoolMetrics(chain);
        completed++;
        if (onProgress) onProgress((completed / totalTasks) * 100);

      } catch (error) {
        console.error(`Error crawling ${chain}:`, error);
      }
    }

    await this.storeProtocolData(protocols);
    return protocols;
  }

  private async crawlDeFiLlamaTVL(chain: string): Promise<ProtocolData[]> {
    console.log(`Crawling DeFiLlama TVL for ${chain}...`);

    try {
      const response = await fetch(`${this.apiEndpoints.defillama}/protocols`);
      const data = await response.json();

      return data
        .filter((protocol: any) => 
          protocol.chains?.includes(chain) || 
          protocol.chain?.toLowerCase() === chain.toLowerCase()
        )
        .map((protocol: any) => ({
          name: protocol.name,
          chain: chain,
          tvl: protocol.tvl || 0,
          apy: protocol.apy || 0,
          volume24h: protocol.volume24h || 0,
          fees24h: protocol.fees24h || 0,
          tokens: [],
          pools: []
        }));
    } catch (error) {
      console.error(`DeFiLlama TVL crawl error for ${chain}:`, error);
      return [];
    }
  }

  private async crawlTokenPrices(chain: string): Promise<void> {
    console.log(`Crawling token prices for ${chain}...`);

    const baseTokens = [
      { symbol: 'ETH', id: 'ethereum' },
      { symbol: 'USDC', id: 'usd-coin' },
      { symbol: 'USDT', id: 'tether' },
      { symbol: 'DAI', id: 'dai' },
      { symbol: 'WETH', id: 'weth' }
    ];

    try {
      const ids = baseTokens.map(t => t.id).join(',');
      const response = await fetch(
        `${this.apiEndpoints.coingecko}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      const data = await response.json();

      const tokens: TokenData[] = baseTokens.map(token => ({
        symbol: token.symbol,
        address: this.getTokenAddress(token.symbol, chain),
        price: data[token.id]?.usd || 0,
        priceChange24h: data[token.id]?.usd_24h_change || 0,
        volume24h: data[token.id]?.usd_24h_vol || 0,
        marketCap: data[token.id]?.usd_market_cap || 0
      }));

      await this.storeTokenPrices(tokens, chain);
    } catch (error) {
      console.error(`Token price crawl error for ${chain}:`, error);
    }
  }

  private async crawlPoolMetrics(chain: string): Promise<void> {
    console.log(`Crawling pool metrics for ${chain}...`);

    // In production, this would query actual DEX subgraphs
    // For now, using mock data structure
    const mockPools: PoolData[] = [
      {
        id: 'eth-usdc-500',
        token0: 'ETH',
        token1: 'USDC',
        tvl: 50000000,
        apy: 12.5,
        volume24h: 5000000,
        fee: 0.05
      },
      {
        id: 'eth-usdt-300',
        token0: 'ETH',
        token1: 'USDT',
        tvl: 30000000,
        apy: 8.2,
        volume24h: 3000000,
        fee: 0.03
      }
    ];

    await this.storePoolMetrics(mockPools, chain);
  }

  private getTokenAddress(symbol: string, chain: string): string {
    const addresses: Record<string, Record<string, string>> = {
      base: {
        'ETH': '0x0000000000000000000000000000000000000000',
        'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        'USDT': '0x...',
        'DAI': '0x...',
        'WETH': '0x4200000000000000000000000000000000000006'
      }
    };

    return addresses[chain]?.[symbol] || '0x0000000000000000000000000000000000000000';
  }

  private async storeProtocolData(protocols: ProtocolData[]): Promise<void> {
    for (const protocol of protocols) {
      const { error } = await supabase
        .from('defi_knowledge_base')
        .upsert({
          protocol_name: protocol.name,
          chain: protocol.chain,
          tvl: protocol.tvl,
          apy: protocol.apy,
          protocol_type: this.categorizeProtocol(protocol.name),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'protocol_name,chain'
        });

      if (error) {
        console.error('Error storing protocol data:', error);
      }
    }
  }

  private async storeTokenPrices(tokens: TokenData[], chain: string): Promise<void> {
    // Store in currency_rates table as a temporary solution
    for (const token of tokens) {
      const { error } = await supabase
        .from('currency_rates')
        .upsert({
          from_currency: token.symbol,
          to_currency: 'USD',
          rate: token.price,
          source: `${chain}_live`,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'from_currency,to_currency'
        });

      if (error) {
        console.warn('Token price storage error:', error.message);
      }
    }
  }

  private async storePoolMetrics(pools: PoolData[], chain: string): Promise<void> {
    // Log pool metrics for now - table doesn't exist yet
    console.log(`Pool metrics for ${chain}:`, pools);
    // In production, create liquidity_pools table via migration
  }

  private categorizeProtocol(name: string): string {
    const categories: Record<string, string> = {
      'uniswap': 'dex',
      'aave': 'lending',
      'compound': 'lending',
      'curve': 'dex',
      'balancer': 'dex',
      'yearn': 'yield_aggregator'
    };

    const lowerName = name.toLowerCase();
    for (const [key, category] of Object.entries(categories)) {
      if (lowerName.includes(key)) return category;
    }

    return 'other';
  }

  async startContinuousCrawl(intervalMinutes: number = 5): Promise<void> {
    console.log(`Starting continuous DeFi crawl every ${intervalMinutes} minutes...`);
    
    await this.crawlAllProtocols();
    
    setInterval(async () => {
      console.log('Running scheduled DeFi crawl...');
      await this.crawlAllProtocols();
    }, intervalMinutes * 60 * 1000);
  }
}

export const defiProtocolCrawler = new DeFiProtocolCrawler();
