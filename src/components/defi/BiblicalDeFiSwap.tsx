import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, TrendingUp, Shield, Clock, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/contexts/SoundContext';
import { toast } from '@/components/ui/use-toast';
import { validateInput, UserInputSchemas, apiRateLimiter } from '@/utils/inputValidation';
import { useSecurityContext } from '@/contexts/EnhancedSecurityContext';
import EnhancedBiblicalTrading from '@/components/wisdom/EnhancedBiblicalTrading';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  price?: number;
  balance?: string;
}

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  priceImpact: string;
  fee: string;
  route: string[];
  dex: string;
  gasEstimate: string;
  slippage: string;
}

const BiblicalDeFiSwap: React.FC = () => {
  const { playSound } = useSound();
  const { validateTransaction, checkContentSecurity } = useSecurityContext();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState('1.0');
  const [biblicalAnalysis, setBiblicalAnalysis] = useState(null);

  // Base chain tokens
  const baseTokens: Token[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      price: 2450.00,
      balance: '0.0'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      price: 1.00,
      balance: '0.0'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xfde4c96c8593536e31f229ea441f725e18cc5773',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      price: 1.00,
      balance: '0.0'
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
      price: 1.00,
      balance: '0.0'
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
      price: 2450.00,
      balance: '0.0'
    }
  ];

  useEffect(() => {
    // Set default tokens
    setFromToken(baseTokens[0]); // ETH
    setToToken(baseTokens[1]); // USDC
  }, []);

  const getSwapQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      return;
    }

    // Validate swap inputs
    const validation = validateInput(UserInputSchemas.swapInputs, {
      fromAmount,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      slippage
    });

    if (!validation.success) {
      toast({
        title: "Invalid Input",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    if (!apiRateLimiter.canMakeCall('swap-quote', 5, 30000)) {
      toast({
        title: "Rate Limited",
        description: "Please wait before requesting another quote",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    playSound('click');

    // Simulate API call to DEX aggregator
    setTimeout(() => {
      const fromValue = parseFloat(fromAmount);
      const estimatedOutput = fromValue * (fromToken.price || 1) / (toToken.price || 1);
      const priceImpact = Math.random() * 0.5; // Random 0-0.5%
      const fee = fromValue * 0.003; // 0.3% fee

      const mockQuote: SwapQuote = {
        fromAmount,
        toAmount: (estimatedOutput * (1 - priceImpact / 100 - 0.003)).toFixed(6),
        priceImpact: priceImpact.toFixed(2),
        fee: fee.toFixed(6),
        route: [fromToken.symbol, toToken.symbol],
        dex: 'Uniswap V3',
        gasEstimate: (Math.random() * 0.01 + 0.005).toFixed(6),
        slippage
      };

      setQuote(mockQuote);
      setIsLoading(false);
    }, 1500);
  };

  const executeSwap = async () => {
    if (!quote || !fromToken || !toToken) return;

    // Validate transaction before execution
    const swapTransaction = {
      amount: fromAmount,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      to: toToken.address
    };

    if (!validateTransaction(swapTransaction)) {
      toast({
        title: "Transaction Blocked",
        description: "Security validation failed. Transaction blocked for your protection.",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    playSound('powerup');

    // Simulate swap execution
    setTimeout(() => {
      setIsSwapping(false);
      toast({
        title: "Swap Completed! ✨",
        description: `Successfully swapped ${quote.fromAmount} ${fromToken?.symbol} for ${quote.toAmount} ${toToken?.symbol}`,
      });
      
      // Reset form
      setFromAmount('');
      setQuote(null);
      playSound('success');
    }, 3000);
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setQuote(null);
    playSound('select');
  };

  const getBiblicalWisdom = (action: string) => {
    const wisdom = {
      swap: "The wise store up choice food and olive oil, but fools gulp theirs down. - Proverbs 21:20",
      caution: "The plans of the diligent lead to profit as surely as haste leads to poverty. - Proverbs 21:5",
      patience: "Patience is better than pride. Do not be quickly provoked in your spirit. - Ecclesiastes 7:8"
    };
    return wisdom[action as keyof typeof wisdom] || wisdom.caution;
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Biblical Wisdom Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-eboy-green to-ancient-gold bg-clip-text text-transparent mb-2">
          Biblical DeFi Swaps
        </h2>
        <p className="text-sm text-muted-foreground italic">
          "{getBiblicalWisdom('patience')}"
        </p>
      </motion.div>

      {/* Swap Interface */}
      <Card className="bg-card/80 backdrop-blur-sm border-eboy-green/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-eboy-green">
            <ArrowUpDown className="h-5 w-5" />
            Wisdom-Guided Swaps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <Select value={fromToken?.symbol} onValueChange={(symbol) => setFromToken(baseTokens.find(t => t.symbol === symbol) || null)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {baseTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <img src={token.logoURI} alt={token.symbol} className="w-4 h-4" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1"
              />
            </div>
            {fromToken && (
              <div className="text-xs text-muted-foreground">
                Balance: {fromToken.balance} {fromToken.symbol} • ${((fromToken.price || 0) * parseFloat(fromAmount || '0')).toFixed(2)}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={swapTokens}
              className="rounded-full p-2 hover:bg-eboy-green/20"
            >
              <ArrowUpDown className="h-4 w-4 text-eboy-green" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <Select value={toToken?.symbol} onValueChange={(symbol) => setToToken(baseTokens.find(t => t.symbol === symbol) || null)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {baseTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <img src={token.logoURI} alt={token.symbol} className="w-4 h-4" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="0.0"
                  value={quote?.toAmount || ''}
                  readOnly
                  className="bg-muted/50"
                />
                {quote && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-eboy-green">
                    ≈ ${((toToken?.price || 0) * parseFloat(quote.toAmount)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="flex items-center gap-4">
            <Label className="text-sm">Slippage:</Label>
            <Select value={slippage} onValueChange={setSlippage}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5%</SelectItem>
                <SelectItem value="1.0">1.0%</SelectItem>
                <SelectItem value="2.0">2.0%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Get Quote Button */}
          <Button
            onClick={getSwapQuote}
            disabled={!fromToken || !toToken || !fromAmount || isLoading}
            className="w-full bg-eboy-green hover:bg-eboy-green/90 text-black"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Getting Best Price...
                </motion.div>
              ) : (
                <motion.div
                  key="quote"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Get Quote
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Quote Display */}
          <AnimatePresence>
            {quote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Route:</span>
                    <span className="text-sm font-medium">{quote.dex}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price Impact:</span>
                    <span className={`text-sm font-medium ${parseFloat(quote.priceImpact) > 1 ? 'text-yellow-500' : 'text-eboy-green'}`}>
                      {quote.priceImpact}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Network Fee:</span>
                    <span className="text-sm font-medium">~{quote.gasEstimate} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Slippage:</span>
                    <span className="text-sm font-medium">{quote.slippage}%</span>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-ancient-purple/10 to-indigo-600/10 rounded-lg border border-ancient-purple/30">
                  {parseFloat(quote.priceImpact) > 1 ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-eboy-green" />
                  )}
                  <span className="text-sm">
                    {parseFloat(quote.priceImpact) > 1 
                      ? "⚠️ High price impact - consider smaller amount" 
                      : "✅ Good trade conditions"}
                  </span>
                </div>

                {/* Biblical Wisdom */}
                <div className="p-3 bg-ancient-gold/10 rounded-lg border border-ancient-gold/30">
                  <p className="text-xs italic text-muted-foreground">
                    💡 "{getBiblicalWisdom('swap')}"
                  </p>
                </div>

                {/* Execute Swap */}
                <Button
                  onClick={executeSwap}
                  disabled={isSwapping}
                  className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-semibold"
                >
                  <AnimatePresence mode="wait">
                    {isSwapping ? (
                      <motion.div
                        key="swapping"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Executing Swap...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="swap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Execute Swap
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Enhanced Biblical Analysis */}
      {fromToken && toToken && fromAmount && (
        <EnhancedBiblicalTrading
          fromToken={fromToken.symbol}
          toToken={toToken.symbol}
          amount={fromAmount}
          priceImpact={parseFloat(quote?.priceImpact || '0')}
          onAnalysisChange={setBiblicalAnalysis}
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="text-sm">
          <Clock className="h-4 w-4 mr-2" />
          Recent Swaps
        </Button>
        <Button variant="outline" className="text-sm">
          <DollarSign className="h-4 w-4 mr-2" />
          Price Alerts
        </Button>
      </div>
    </div>
  );
};

export default BiblicalDeFiSwap;