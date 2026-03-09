import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Search, Coins } from 'lucide-react';
import type { TokenPrice } from '@/hooks/useDefiScanner';

interface TokenPriceGridProps {
  prices: Record<string, TokenPrice>;
}

const CATEGORY_MAP: Record<string, string> = {
  ETH: 'native', WETH: 'native',
  USDC: 'stablecoin', USDbC: 'stablecoin', DAI: 'stablecoin', USDT: 'stablecoin',
  LUSD: 'stablecoin', crvUSD: 'stablecoin', DOLA: 'stablecoin', EURC: 'stablecoin',
  USDz: 'stablecoin', USR: 'stablecoin', USDCx: 'supertoken',
  cbETH: 'lsd', wstETH: 'lsd', rETH: 'lsd', swETH: 'lsd', weETH: 'lsd', ezETH: 'lsd',
  cbBTC: 'btc', WBTC: 'btc', tBTC: 'btc',
  AAVE: 'governance', COMP: 'governance', UNI: 'governance', SNX: 'governance',
  CRV: 'governance', BAL: 'governance', MKR: 'governance', LDO: 'governance',
  SUSHI: 'governance', RPL: 'governance', PENDLE: 'governance', YFI: 'governance',
  AERO: 'defi', WELL: 'defi', SEAM: 'defi', EXTRA: 'defi',
  LINK: 'infrastructure', OP: 'infrastructure', ARB: 'infrastructure',
  BRETT: 'meme', DEGEN: 'meme', TOSHI: 'meme', HIGHER: 'meme',
  BALD: 'meme', NORMIE: 'meme', MFER: 'meme',
};

const CATEGORY_COLORS: Record<string, string> = {
  native: 'bg-blue-500/20 text-blue-300',
  stablecoin: 'bg-green-500/20 text-green-300',
  lsd: 'bg-purple-500/20 text-purple-300',
  btc: 'bg-orange-500/20 text-orange-300',
  governance: 'bg-yellow-500/20 text-yellow-300',
  defi: 'bg-cyan-500/20 text-cyan-300',
  infrastructure: 'bg-indigo-500/20 text-indigo-300',
  meme: 'bg-pink-500/20 text-pink-300',
  supertoken: 'bg-emerald-500/20 text-emerald-300',
};

const TokenPriceGrid: React.FC<TokenPriceGridProps> = ({ prices }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const sortedTokens = useMemo(() => {
    return Object.entries(prices)
      .map(([symbol, data]) => ({ symbol, ...data, category: CATEGORY_MAP[symbol] || 'other' }))
      .filter(t => {
        if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false;
        if (selectedCategory && t.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => b.usd - a.usd);
  }, [prices, search, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(Object.keys(prices).map(s => CATEGORY_MAP[s] || 'other'));
    return Array.from(cats).sort();
  }, [prices]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer text-[10px]"
            onClick={() => setSelectedCategory(null)}
          >
            All ({Object.keys(prices).length})
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className={`cursor-pointer text-[10px] ${selectedCategory === cat ? '' : CATEGORY_COLORS[cat] || ''}`}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sortedTokens.map(token => {
          const isUp = token.change_24h >= 0;
          return (
            <Card key={token.symbol} className="border-border/50 hover:border-border transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-secondary" />
                    <span className="font-mono font-bold text-foreground">{token.symbol}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${CATEGORY_COLORS[token.category] || ''}`}>
                    {token.category}
                  </Badge>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xl font-bold text-foreground">
                    ${token.usd >= 1
                      ? token.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : token.usd < 0.01
                        ? token.usd.toFixed(8)
                        : token.usd.toFixed(4)
                    }
                  </p>
                  <span className={`flex items-center gap-0.5 text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(token.change_24h).toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedTokens.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No tokens match your search.</p>
      )}
    </div>
  );
};

export default TokenPriceGrid;
