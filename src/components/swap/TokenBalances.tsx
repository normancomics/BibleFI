import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useNativeBalance } from '@/hooks/useNativeBalance';
import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';
import { baseTokens } from '@/data/baseTokens';

interface TokenBalancesProps {
  onSelectToken?: (symbol: string) => void;
}

const TokenBalances: React.FC<TokenBalancesProps> = ({ onSelectToken }) => {
  const { isConnected } = useAccount();
  const { balance: ethBalance } = useNativeBalance();
  const { prices, formatPrice, formatChange, refreshPrices, isLoading } = useRealTokenPrices();

  const usdcBalance = useTokenBalance({ tokenAddress: baseTokens.USDC.address as `0x${string}`, enabled: isConnected });
  const usdtBalance = useTokenBalance({ tokenAddress: baseTokens.USDT.address as `0x${string}`, enabled: isConnected });
  const daiBalance = useTokenBalance({ tokenAddress: baseTokens.DAI.address as `0x${string}`, enabled: isConnected });
  const wethBalance = useTokenBalance({ tokenAddress: baseTokens.WETH.address as `0x${string}`, enabled: isConnected });

  const tokenRows = [
    { symbol: 'ETH', balance: ethBalance, logo: baseTokens.ETH.logoURI },
    { symbol: 'USDC', balance: usdcBalance.formattedBalance, logo: baseTokens.USDC.logoURI },
    { symbol: 'USDT', balance: usdtBalance.formattedBalance, logo: baseTokens.USDT.logoURI },
    { symbol: 'DAI', balance: daiBalance.formattedBalance, logo: baseTokens.DAI.logoURI },
    { symbol: 'WETH', balance: wethBalance.formattedBalance, logo: baseTokens.WETH.logoURI },
  ];

  if (!isConnected) {
    return (
      <Card className="border-ancient-gold/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Connect wallet to view balances</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-ancient-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5 text-ancient-gold" />
          Token Balances
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={refreshPrices} disabled={isLoading} className="text-muted-foreground hover:text-ancient-gold">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {tokenRows.map((token) => {
          const price = prices[token.symbol]?.price || 0;
          const change = prices[token.symbol]?.change24h || 0;
          const bal = parseFloat(token.balance || '0');
          const value = bal * price;

          return (
            <button
              key={token.symbol}
              onClick={() => onSelectToken?.(token.symbol)}
              className="flex items-center justify-between w-full p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-eboy-green/40 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <img
                  src={token.logo}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <p className="font-medium text-sm">{token.symbol}</p>
                  <p className="text-xs text-muted-foreground">${formatPrice(price)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{bal > 0 ? bal.toFixed(4) : '0.00'}</p>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-xs text-muted-foreground">${value.toFixed(2)}</span>
                  {change !== 0 && (
                    <Badge variant={change >= 0 ? 'default' : 'destructive'} className="text-[10px] h-4 px-1">
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TokenBalances;
