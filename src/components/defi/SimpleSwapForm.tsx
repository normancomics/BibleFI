
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Loader2, Zap, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { baseTokens } from '@/data/baseTokens';
import { useSpandexQuote } from '@/hooks/useSpandexQuote';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';

const SimpleSwapForm: React.FC = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();
  const { address: walletAddress } = useAccount();

  const toTokenInfo = baseTokens[toToken];
  const fromTokenInfo = baseTokens[fromToken];

  const {
    bestQuote: spandexBest,
    allQuotes: spandexQuotes,
    isLoading: spandexLoading,
    fetchQuote: fetchSpandexQuote,
  } = useSpandexQuote(toTokenInfo?.decimals ?? 6);

  const handleSwapTokens = () => {
    playSound('select');
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount('');
    setToAmount('');
  };

  const calculateSwap = (amount: string) => {
    if (!amount) return '';
    const rates: Record<string, number> = {
      'ETH': 2400,
      'USDC': 1,
      'DAI': 1.01,
      'USDT': 0.999,
      'WETH': 2395
    };
    
    const fromRate = rates[fromToken] || 1;
    const toRate = rates[toToken] || 1;
    const result = (parseFloat(amount) * fromRate / toRate).toFixed(6);
    return result;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateSwap(value));
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    playSound('coin');
    
    // Simulate swap process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Swap Successful! 🎉",
      description: `Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
    });
    
    setIsSwapping(false);
    setFromAmount('');
    setToAmount('');
  };

  return (
    <Card className="w-full max-w-md mx-auto border-scripture/30 bg-black/40">
      <CardHeader>
        <CardTitle className="text-center text-ancient-gold">Token Swap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="flex-1"
            />
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-32 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm border-scripture/30">
                <div className="flex items-center">
                  <img 
                    src={baseTokens[fromToken]?.logoURI} 
                    alt={fromToken} 
                    className="w-5 h-5 mr-2 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/coin-pixel.png';
                    }}
                  />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-slate-700 to-slate-800 border-scripture/30 backdrop-blur-sm z-50">
                {Object.entries(baseTokens).map(([symbol, token]) => (
                  <SelectItem key={symbol} value={symbol} className="hover:bg-scripture/20 focus:bg-scripture/20">
                    <div className="flex items-center">
                      <img 
                        src={token.logoURI} 
                        alt={symbol} 
                        className="w-5 h-5 mr-2 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/coin-pixel.png';
                        }}
                      />
                      <span className="text-white">{symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwapTokens}
            className="border border-scripture/30 hover:bg-scripture/20"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="flex-1 bg-black/20"
            />
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-32 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm border-scripture/30">
                <div className="flex items-center">
                  <img 
                    src={baseTokens[toToken]?.logoURI} 
                    alt={toToken} 
                    className="w-5 h-5 mr-2 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/coin-pixel.png';
                    }}
                  />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-slate-700 to-slate-800 border-scripture/30 backdrop-blur-sm z-50">
                {Object.entries(baseTokens).map(([symbol, token]) => (
                  <SelectItem key={symbol} value={symbol} className="hover:bg-scripture/20 focus:bg-scripture/20">
                    <div className="flex items-center">
                      <img 
                        src={token.logoURI} 
                        alt={symbol} 
                        className="w-5 h-5 mr-2 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/coin-pixel.png';
                        }}
                      />
                      <span className="text-white">{symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSwap} 
          disabled={isSwapping || !fromAmount}
          className="w-full bg-scripture hover:bg-scripture/80"
        >
          {isSwapping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : (
            'Swap Tokens'
          )}
        </Button>

        <div className="text-xs text-white/60 text-center">
          Rate: 1 {fromToken} = {calculateSwap('1')} {toToken}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleSwapForm;
