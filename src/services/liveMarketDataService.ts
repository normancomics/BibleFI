/**
 * Live Market Data Service for BibleFi
 * Aggregates data from BaseScan, DeFiLlama, Superfluid Indexer, and CoinGecko
 * All data filtered through the Biblical Wisdom lens
 * 
 * "A wise man will hear, and will increase learning" - Proverbs 1:5
 */

// Base Chain token addresses
const BASE_TOKENS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WETH: '0x4200000000000000000000000000000000000006',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  cbBTC: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
  USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  SUP: '0x678d81FDad7e7b1CD53d1c23d35e4E06edf9e648', // Superfluid placeholder
} as const;

export interface TokenPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface DeFiProtocol {
  name: string;
  tvl: number;
  apy: number;
  chain: string;
  category: string;
  biblicalAlignment: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SuperfluidStream {
  sender: string;
  receiver: string;
  token: string;
  flowRate: string;
  totalStreamed: string;
  startedAt: string;
}

export interface MarketSentiment {
  fearGreedIndex: number;
  label: string;
  biblicalWisdom: string;
}

// CoinGecko free API for prices
export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  try {
    const ids = 'ethereum,usd-coin,dai,bitcoin,tether,veil-base';
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!res.ok) {
      console.warn('CoinGecko rate limited, using cached data');
      return getCachedPrices();
    }
    
    const data = await res.json();
    
    return [
      mapCoinGeckoPrice(data, 'ethereum', 'ETH', 'Ethereum'),
      mapCoinGeckoPrice(data, 'usd-coin', 'USDC', 'USD Coin'),
      mapCoinGeckoPrice(data, 'dai', 'DAI', 'Dai'),
      mapCoinGeckoPrice(data, 'bitcoin', 'cbBTC', 'Coinbase Wrapped BTC'),
      mapCoinGeckoPrice(data, 'tether', 'USDT', 'Tether'),
      mapCoinGeckoPrice(data, 'veil-base', 'VEIL', 'Veil.cash'),
    ].filter(Boolean) as TokenPrice[];
  } catch (error) {
    console.error('Error fetching prices:', error);
    return getCachedPrices();
  }
};

function mapCoinGeckoPrice(data: any, id: string, symbol: string, name: string): TokenPrice | null {
  const coin = data[id];
  if (!coin) return null;
  return {
    symbol, name,
    price: coin.usd || 0,
    change24h: coin.usd_24h_change || 0,
    volume24h: coin.usd_24h_vol || 0,
    marketCap: coin.usd_market_cap || 0,
    lastUpdated: new Date().toISOString(),
  };
}

function getCachedPrices(): TokenPrice[] {
  return [
    { symbol: 'ETH', name: 'Ethereum', price: 2800, change24h: 0, volume24h: 0, marketCap: 0, lastUpdated: new Date().toISOString() },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0, volume24h: 0, marketCap: 0, lastUpdated: new Date().toISOString() },
    { symbol: 'DAI', name: 'Dai', price: 1.00, change24h: 0, volume24h: 0, marketCap: 0, lastUpdated: new Date().toISOString() },
    { symbol: 'cbBTC', name: 'Coinbase BTC', price: 98000, change24h: 0, volume24h: 0, marketCap: 0, lastUpdated: new Date().toISOString() },
  ];
}

// Superfluid Subgraph for streaming data
export const fetchSuperfluidStreams = async (userAddress?: string): Promise<SuperfluidStream[]> => {
  try {
    const query = userAddress
      ? `{ streams(where: {sender: "${userAddress.toLowerCase()}"}, first: 10) { id sender receiver currentFlowRate streamedUntilUpdatedAt updatedAtTimestamp token { symbol } } }`
      : `{ streams(first: 20, orderBy: updatedAtTimestamp, orderDirection: desc) { id sender receiver currentFlowRate streamedUntilUpdatedAt updatedAtTimestamp token { symbol } } }`;

    const res = await fetch('https://base-mainnet.subgraph.x.superfluid.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    
    return (data.data?.streams || []).map((s: any) => ({
      sender: s.sender,
      receiver: s.receiver,
      token: s.token?.symbol || 'Unknown',
      flowRate: s.currentFlowRate,
      totalStreamed: s.streamedUntilUpdatedAt,
      startedAt: new Date(Number(s.updatedAtTimestamp) * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching Superfluid streams:', error);
    return [];
  }
};

// DeFiLlama for Base chain TVL data
export const fetchBaseDeFiTVL = async (): Promise<DeFiProtocol[]> => {
  try {
    const res = await fetch('https://api.llama.fi/protocols');
    if (!res.ok) return getBaselineProtocols();
    
    const protocols = await res.json();
    
    // Filter for Base chain protocols
    const baseProtocols = protocols
      .filter((p: any) => p.chains?.includes('Base') && p.tvl > 1000000)
      .slice(0, 15)
      .map((p: any) => ({
        name: p.name,
        tvl: p.tvl,
        apy: 0, // DeFiLlama doesn't provide APY in this endpoint
        chain: 'Base',
        category: p.category || 'Other',
        biblicalAlignment: mapProtocolToBiblicalPrinciple(p.category),
        riskLevel: assessRiskLevel(p),
      }));

    return baseProtocols.length > 0 ? baseProtocols : getBaselineProtocols();
  } catch (error) {
    console.error('Error fetching DeFi TVL:', error);
    return getBaselineProtocols();
  }
};

function mapProtocolToBiblicalPrinciple(category: string): string {
  const map: Record<string, string> = {
    'Dexes': 'Ecclesiastes 11:1 - Cast thy bread upon the waters (provide liquidity)',
    'Lending': 'Deuteronomy 28:12 - Thou shalt lend unto many nations',
    'Yield': 'Matthew 25:14-30 - Parable of Talents (multiply what is given)',
    'Staking': 'Galatians 6:9 - In due season we shall reap, if we faint not',
    'Bridge': 'Genesis 28:12 - Jacob\'s ladder connecting heaven and earth',
    'CDP': 'Proverbs 22:7 - The borrower is servant to the lender (caution)',
    'Yield Aggregator': 'Proverbs 21:20 - Treasure in the dwelling of the wise',
  };
  return map[category] || 'Proverbs 3:5 - Trust in the LORD with all your heart';
}

function assessRiskLevel(protocol: any): 'low' | 'medium' | 'high' {
  if (protocol.tvl > 100000000 && protocol.audits?.length > 0) return 'low';
  if (protocol.tvl > 10000000) return 'medium';
  return 'high';
}

function getBaselineProtocols(): DeFiProtocol[] {
  return [
    { name: 'Aave V3', tvl: 500000000, apy: 3.5, chain: 'Base', category: 'Lending', biblicalAlignment: 'Deuteronomy 28:12', riskLevel: 'low' },
    { name: 'Aerodrome', tvl: 800000000, apy: 15, chain: 'Base', category: 'Dexes', biblicalAlignment: 'Ecclesiastes 11:1', riskLevel: 'low' },
    { name: 'Moonwell', tvl: 200000000, apy: 5, chain: 'Base', category: 'Lending', biblicalAlignment: 'Deuteronomy 28:12', riskLevel: 'medium' },
    { name: 'Compound V3', tvl: 300000000, apy: 4, chain: 'Base', category: 'Lending', biblicalAlignment: 'Proverbs 21:20', riskLevel: 'low' },
    { name: 'Superfluid', tvl: 50000000, apy: 0, chain: 'Base', category: 'Streaming', biblicalAlignment: 'Malachi 3:10 - Continuous tithing', riskLevel: 'low' },
  ];
}

// Market sentiment with Biblical context
export const getMarketSentiment = async (): Promise<MarketSentiment> => {
  try {
    const res = await fetch('https://api.alternative.me/fng/');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    const index = Number(data.data?.[0]?.value || 50);
    const label = data.data?.[0]?.value_classification || 'Neutral';
    
    return {
      fearGreedIndex: index,
      label,
      biblicalWisdom: getBiblicalSentimentWisdom(index),
    };
  } catch {
    return {
      fearGreedIndex: 50,
      label: 'Neutral',
      biblicalWisdom: 'Proverbs 3:5 - Trust in the LORD with all your heart.',
    };
  }
};

function getBiblicalSentimentWisdom(index: number): string {
  if (index <= 20) return 'Psalm 46:10 - "Be still, and know that I am God." Fear not — buy opportunities may arise.';
  if (index <= 40) return 'Proverbs 28:20 - "A faithful man shall abound with blessings." Stay faithful in uncertain times.';
  if (index <= 60) return 'Ecclesiastes 3:1 - "To every thing there is a season." Patience and discernment needed.';
  if (index <= 80) return 'Proverbs 13:11 - "Wealth gotten by vanity shall be diminished." Don\'t chase hype.';
  return '1 Timothy 6:10 - "The love of money is the root of all evil." Extreme greed — proceed with caution.';
}

// Aggregate dashboard data
export const fetchDashboardData = async (userAddress?: string) => {
  const [prices, streams, protocols, sentiment] = await Promise.all([
    fetchTokenPrices(),
    fetchSuperfluidStreams(userAddress),
    fetchBaseDeFiTVL(),
    getMarketSentiment(),
  ]);

  return { prices, streams, protocols, sentiment, lastUpdated: new Date().toISOString() };
};
