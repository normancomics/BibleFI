import React from 'react';
import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const TICKER_TOKENS = ['ETH', 'USDC', 'USDT', 'DAI', 'WETH', 'WBTC', 'cbBTC', 'cbETH'];

const PriceTicker: React.FC = () => {
  const { prices, formatPrice, isLoading } = useRealTokenPrices();

  const items = TICKER_TOKENS.map((symbol) => {
    const data = prices[symbol];
    return {
      symbol,
      price: data?.price || 0,
      change: data?.change24h || 0,
    };
  }).filter((t) => t.price > 0);

  if (isLoading || items.length === 0) return null;

  // Duplicate for seamless scroll
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-b border-border/40 bg-card/60 backdrop-blur-sm">
      <motion.div
        className="flex items-center gap-8 py-2 px-4 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((token, i) => {
          const isPositive = token.change >= 0;
          return (
            <div key={`${token.symbol}-${i}`} className="flex items-center gap-2 text-sm shrink-0">
              <span className="font-semibold text-foreground">{token.symbol}</span>
              <span className="text-muted-foreground">${formatPrice(token.price)}</span>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-eboy-green' : 'text-destructive'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{token.change.toFixed(2)}%
              </span>
              <span className="text-border/60 mx-2">•</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default PriceTicker;
