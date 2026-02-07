import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, RefreshCw, Activity, Globe, 
  MessageCircle, Fuel, BarChart3, BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TokenPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h?: number;
  marketCap?: number;
}

interface DeFiProtocol {
  name: string;
  tvl: number;
  category: string;
  tvlChange24h?: number;
}

interface FarcasterCast {
  text: string;
  author: string;
  reactions: number;
  timestamp: string;
}

interface MarketData {
  prices: { prices: TokenPrice[] };
  protocols: { protocols: DeFiProtocol[] };
  sentiment: { index: number; label: string } | null;
  baseActivity: { gasPrice: any } | null;
  farcasterCasts: { casts: FarcasterCast[] };
  lastUpdated: string;
}

const MarketDataFeed: React.FC = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        body: { source: 'all' },
      });
      if (error) throw error;
      if (result?.success) {
        setData(result.data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Market data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const formatNumber = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  };

  const getBiblicalSentiment = (index: number) => {
    if (index <= 20) return { wisdom: 'Psalm 46:10 — "Be still, and know that I am God."', advice: 'Extreme fear = potential buying opportunity' };
    if (index <= 40) return { wisdom: 'Proverbs 28:20 — "A faithful man shall abound with blessings."', advice: 'Stay faithful, don\'t panic sell' };
    if (index <= 60) return { wisdom: 'Ecclesiastes 3:1 — "To every thing there is a season."', advice: 'Neutral — exercise patience' };
    if (index <= 80) return { wisdom: 'Proverbs 13:11 — "Wealth gotten by vanity shall be diminished."', advice: 'Don\'t chase hype, stay grounded' };
    return { wisdom: '1 Timothy 6:10 — "The love of money is the root of all evil."', advice: 'Extreme greed — proceed with caution' };
  };

  const sentimentColor = (index: number) => {
    if (index <= 25) return 'text-red-500';
    if (index <= 50) return 'text-amber-500';
    if (index <= 75) return 'text-green-500';
    return 'text-red-400';
  };

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-card/50">
            <CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const prices = data?.prices?.prices || [];
  const protocols = data?.protocols?.protocols || [];
  const sentiment = data?.sentiment;
  const gas = data?.baseActivity?.gasPrice;
  const casts = data?.farcasterCasts?.casts || [];
  const biblicalSentiment = sentiment ? getBiblicalSentiment(sentiment.index) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Market Data</h2>
          <p className="text-sm text-muted-foreground">
            "A wise man will hear, and will increase learning" — Proverbs 1:5
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <Badge variant="outline" className="text-xs">
              {lastRefresh.toLocaleTimeString()}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchMarketData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Sentiment + Gas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sentiment && (
          <Card className="bg-card/50 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fear & Greed</span>
                <Activity className="w-4 h-4" />
              </div>
              <div className={`text-3xl font-bold ${sentimentColor(sentiment.index)}`}>
                {sentiment.index}
              </div>
              <Badge variant="secondary" className="mt-1">{sentiment.label}</Badge>
              {biblicalSentiment && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {biblicalSentiment.wisdom}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {gas && typeof gas === 'object' && (
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Base Gas Price</span>
                <Fuel className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">🐢 Low</span>
                  <span>{gas.low} gwei</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-400">⚡ Standard</span>
                  <span>{gas.standard} gwei</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">🚀 Fast</span>
                  <span>{gas.fast} gwei</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Biblical Wisdom</span>
              <BookOpen className="w-4 h-4" />
            </div>
            {biblicalSentiment ? (
              <>
                <p className="text-sm font-medium text-primary">{biblicalSentiment.advice}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Market conditions filtered through Scripture
                </p>
              </>
            ) : (
              <p className="text-sm">Proverbs 3:5 — Trust in the LORD with all your heart.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="bg-card/50">
          <TabsTrigger value="prices"><TrendingUp className="w-4 h-4 mr-1" />Prices</TabsTrigger>
          <TabsTrigger value="protocols"><BarChart3 className="w-4 h-4 mr-1" />DeFi TVL</TabsTrigger>
          <TabsTrigger value="social"><MessageCircle className="w-4 h-4 mr-1" />Farcaster</TabsTrigger>
        </TabsList>

        {/* Token Prices */}
        <TabsContent value="prices">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prices.map((token) => (
              <Card key={token.symbol} className="bg-card/50 hover:bg-card/70 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{token.symbol}</p>
                      <p className="text-xs text-muted-foreground">{token.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">
                        ${token.price >= 1 ? token.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : token.price.toFixed(4)}
                      </p>
                      <div className={`flex items-center text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(token.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* DeFi Protocols */}
        <TabsContent value="protocols">
          <div className="space-y-2">
            {protocols.slice(0, 15).map((p, i) => (
              <Card key={p.name} className="bg-card/50">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <Badge variant="outline" className="text-xs">{p.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">{formatNumber(p.tvl)}</p>
                    {p.tvlChange24h !== undefined && (
                      <span className={`text-xs ${p.tvlChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {p.tvlChange24h >= 0 ? '+' : ''}{p.tvlChange24h.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Farcaster Social Feed */}
        <TabsContent value="social">
          <div className="space-y-3">
            {casts.length > 0 ? casts.map((cast, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-3 h-3 text-primary" />
                        <span className="text-sm font-medium text-primary">@{cast.author}</span>
                      </div>
                      <p className="text-sm">{cast.text}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      ❤️ {cast.reactions}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="bg-card/50">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No Farcaster casts found. Cast about BibleFi to see them here!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketDataFeed;
