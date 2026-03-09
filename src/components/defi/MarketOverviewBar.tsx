import React from 'react';
import type { ScanResult } from '@/hooks/useDefiScanner';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketOverviewBarProps {
  data: ScanResult;
}

const MarketOverviewBar: React.FC<MarketOverviewBarProps> = ({ data }) => {
  const highlights = [
    { symbol: 'ETH', ...data.prices['ETH'] },
    { symbol: 'WBTC', ...data.prices['WBTC'] },
    { symbol: 'USDC', ...data.prices['USDC'] },
    { symbol: 'AAVE', ...data.prices['AAVE'] },
    { symbol: 'UNI', ...data.prices['UNI'] },
    { symbol: 'SNX', ...data.prices['SNX'] },
    { symbol: 'LINK', ...data.prices['LINK'] },
    { symbol: 'CRV', ...data.prices['CRV'] },
  ].filter(t => t.usd);

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-4 min-w-max py-2">
        {highlights.map(token => {
          const isUp = token.change_24h >= 0;
          return (
            <div key={token.symbol} className="flex items-center gap-2 text-sm">
              <span className="font-mono font-bold text-foreground">{token.symbol}</span>
              <span className="text-muted-foreground">
                ${token.usd >= 1 ? token.usd.toLocaleString(undefined, { maximumFractionDigits: 2 }) : token.usd.toFixed(6)}
              </span>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(token.change_24h).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketOverviewBar;
