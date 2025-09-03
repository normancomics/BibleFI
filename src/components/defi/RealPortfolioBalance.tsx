import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useNativeBalance } from '@/hooks/useNativeBalance';
import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';
import { baseTokens } from '@/data/baseTokens';
import { Button } from '@/components/ui/button';

interface TokenPosition {
  symbol: string;
  balance: string;
  value: number;
  change24h: number;
  logoURI?: string;
}

const RealPortfolioBalance: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { balance: ethBalance, isLoading: ethLoading } = useNativeBalance();
  const { prices, isLoading: pricesLoading, formatPrice, formatChange, refreshPrices } = useRealTokenPrices();
  
  // Get balances for major tokens
  const usdcBalance = useTokenBalance({ 
    tokenAddress: baseTokens.USDC.address as `0x${string}`, 
    enabled: isConnected 
  });
  
  const daiBalance = useTokenBalance({ 
    tokenAddress: baseTokens.DAI.address as `0x${string}`, 
    enabled: isConnected 
  });
  
  const wethBalance = useTokenBalance({ 
    tokenAddress: baseTokens.WETH.address as `0x${string}`, 
    enabled: isConnected 
  });

  if (!isConnected) {
    return (
      <Card className="border-scripture/30 bg-black/40">
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-scripture/50 mx-auto mb-4" />
          <p className="text-white/60">Connect your wallet to view portfolio</p>
        </CardContent>
      </Card>
    );
  }

  const positions: TokenPosition[] = [
    {
      symbol: 'ETH',
      balance: ethBalance,
      value: parseFloat(ethBalance) * (prices.ETH?.price || 0),
      change24h: prices.ETH?.change24h || 0,
      logoURI: prices.ETH?.logoURI || baseTokens.ETH.logoURI
    },
    {
      symbol: 'USDC',
      balance: usdcBalance.formattedBalance,
      value: parseFloat(usdcBalance.balance) * (prices.USDC?.price || 1),
      change24h: prices.USDC?.change24h || 0,
      logoURI: prices.USDC?.logoURI || baseTokens.USDC.logoURI
    },
    {
      symbol: 'DAI',
      balance: daiBalance.formattedBalance,
      value: parseFloat(daiBalance.balance) * (prices.DAI?.price || 1),
      change24h: prices.DAI?.change24h || 0,
      logoURI: prices.DAI?.logoURI || baseTokens.DAI.logoURI
    },
    {
      symbol: 'WETH',
      balance: wethBalance.formattedBalance,
      value: parseFloat(wethBalance.balance) * (prices.WETH?.price || 0),
      change24h: prices.WETH?.change24h || 0,
      logoURI: prices.WETH?.logoURI || baseTokens.WETH.logoURI
    }
  ].filter(position => parseFloat(position.balance) > 0);

  const totalValue = positions.reduce((sum, position) => sum + position.value, 0);
  const totalChange24h = positions.length > 0 
    ? positions.reduce((sum, position) => sum + (position.change24h * position.value), 0) / totalValue
    : 0;

  return (
    <Card className="border-scripture/30 bg-black/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-ancient-gold" />
          <span>Portfolio Balance</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshPrices}
          disabled={pricesLoading}
          className="text-scripture hover:text-ancient-gold"
        >
          <RefreshCw className={`h-4 w-4 ${pricesLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Portfolio Value */}
        <div className="p-4 rounded-lg border border-ancient-gold/20 bg-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {totalChange24h >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatChange(totalChange24h)}
                </span>
              </div>
              <p className="text-xs text-white/40">24h change</p>
            </div>
          </div>
        </div>

        {/* Individual Token Positions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-ancient-gold">Holdings</h4>
          
          {positions.length === 0 ? (
            <p className="text-white/60 text-center py-4">No token balances found</p>
          ) : (
            positions.map((position) => (
              <div
                key={position.symbol}
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20"
              >
                <div className="flex items-center gap-3">
                  {position.logoURI ? (
                    <img 
                      src={position.logoURI} 
                      alt={position.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-ancient-gold/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-ancient-gold">
                        {position.symbol[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{position.symbol}</p>
                    <p className="text-sm text-white/60">
                      {parseFloat(position.balance).toFixed(4)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-white">
                    ${position.value.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant={position.change24h >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {formatChange(position.change24h)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {pricesLoading && (
          <div className="text-center py-2">
            <p className="text-sm text-white/60">Updating prices...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealPortfolioBalance;