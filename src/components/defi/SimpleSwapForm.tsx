
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', logo: '💎' },
  { symbol: 'USDC', name: 'USD Coin', logo: '💵' },
  { symbol: 'DAI', name: 'Dai Stablecoin', logo: '🟡' },
  { symbol: 'USDT', name: 'Tether USD', logo: '💚' },
  { symbol: 'WETH', name: 'Wrapped ETH', logo: '🔷' }
];

const SimpleSwapForm: React.FC = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();

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
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.logo} {token.symbol}
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
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.logo} {token.symbol}
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
