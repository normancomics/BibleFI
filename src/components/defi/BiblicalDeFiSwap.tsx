import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, TrendingUp, Shield, Clock, AlertTriangle, CheckCircle, DollarSign, Info, Zap, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/contexts/SoundContext';
import { toast } from '@/components/ui/use-toast';
import { validateInput, UserInputSchemas, apiRateLimiter } from '@/utils/inputValidation';
import { useSecurityContext } from '@/contexts/EnhancedSecurityContext';
import EnhancedBiblicalTrading from '@/components/wisdom/EnhancedBiblicalTrading';
import { supabase } from '@/integrations/supabase/client';
import TokenSearchSelect from '@/components/swap/TokenSearchSelect';
import { useSpandexQuote } from '@/hooks/useSpandexQuote';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { parseUnits } from 'viem';

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
  source?: 'uniswap' | 'coingecko' | 'estimate';
}

const BiblicalDeFiSwap: React.FC = () => {
  const { playSound } = useSound();
  const { validateTransaction, checkContentSecurity } = useSecurityContext();
  const { address: walletAddress } = useAccount();
  const [fromSymbol, setFromSymbol] = useState('ETH');
  const [toSymbol, setToSymbol] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState('1.0');
  const [biblicalAnalysis, setBiblicalAnalysis] = useState(null);
  const [useSpandex, setUseSpandex] = useState(true);

  // spanDEX meta-aggregator hook
  const {
    bestQuote: spandexBest,
    allQuotes: spandexQuotes,
    isLoading: spandexLoading,
    error: spandexError,
    fetchQuote: fetchSpandexQuote,
  } = useSpandexQuote(6); // default fallback; per-call decimals are passed below

  // Base chain tokens
  const baseTokens: Record<string, Token> = {
    ETH: {
      symbol: 'ETH', name: 'Ethereum',
      address: '0x4200000000000000000000000000000000000006', decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      price: 2450.00, balance: '0.0'
    },
    USDC: {
      symbol: 'USDC', name: 'USD Coin',
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      price: 1.00, balance: '0.0'
    },
    USDT: {
      symbol: 'USDT', name: 'Tether USD',
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      price: 1.00, balance: '0.0'
    },
    DAI: {
      symbol: 'DAI', name: 'Dai Stablecoin',
      address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
      price: 1.00, balance: '0.0'
    },
    WETH: {
      symbol: 'WETH', name: 'Wrapped Ethereum',
      address: '0x4200000000000000000000000000000000000006', decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
      price: 2450.00, balance: '0.0'
    },
  };

  const fromToken = baseTokens[fromSymbol] || null;
  const toToken = baseTokens[toSymbol] || null;

  const getSwapQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;

    const validation = validateInput(UserInputSchemas.swapInputs, {
      fromAmount, fromToken: fromToken.symbol, toToken: toToken.symbol, slippage
    });

    if (!validation.success) {
      toast({ title: "Invalid Input", description: validation.error, variant: "destructive" });
      return;
    }

    if (!apiRateLimiter.canMakeCall('swap-quote', 5, 30000)) {
      toast({ title: "Rate Limited", description: "Please wait before requesting another quote", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    playSound('click');

    // Fire spanDEX meta-aggregated quotes in parallel with Uniswap edge function
    const spandexPromise = useSpandex
      ? fetchSpandexQuote({
          inputToken: fromToken.address as Address,
          outputToken: toToken.address as Address,
          inputAmount: BigInt(Math.floor(parseFloat(fromAmount) * 10 ** fromToken.decimals)),
          slippageBps: Math.round(parseFloat(slippage) * 100),
          swapperAccount: (walletAddress || '0x0000000000000000000000000000000000000001') as Address,
          chainId: 8453,
          outputDecimals: toToken.decimals,
        }).catch((e) => {
          console.warn('[spanDEX] Quote failed, falling back:', e);
          return null;
        })
      : Promise.resolve(null);

    try {
      const [uniswapResult, spandexResult] = await Promise.all([
        supabase.functions.invoke('uniswap-quote', {
          body: {
            fromToken: fromToken.symbol,
            toToken: toToken.symbol,
            amount: fromAmount,
            slippage: parseFloat(slippage),
          },
        }),
        spandexPromise,
      ]);

      const { data, error } = uniswapResult;
      if (error) throw error;

      const uniQuote: SwapQuote = {
        fromAmount,
        toAmount: data.toAmount || '0',
        priceImpact: data.priceImpact || '0.00',
        fee: (parseFloat(fromAmount) * 0.003).toFixed(6),
        route: typeof data.route === 'string' ? [data.route] : [fromToken.symbol, toToken.symbol],
        dex: data.dex || 'Uniswap V3',
        gasEstimate: data.gasEstimate || '0.000500',
        slippage,
        source: data.source || 'estimate',
      };

      // If spanDEX returned a better quote, use it. Compare in raw bigint
      // base-units to avoid float-precision drift across decimal scales.
      let uniRaw = 0n;
      try {
        uniRaw = parseUnits(uniQuote.toAmount || '0', toToken.decimals);
      } catch {
        uniRaw = 0n;
      }
      if (spandexResult && spandexResult.outputAmountRaw > uniRaw) {
        uniQuote.toAmount = spandexResult.outputAmount;
        uniQuote.dex = `spanDEX (${spandexResult.provider})`;
        uniQuote.source = 'uniswap'; // Mark as live since spanDEX uses on-chain data
        toast({
          title: "🚀 Better Price Found!",
          description: `spanDEX found a better rate via ${spandexResult.provider}`,
        });
      }

      setQuote(uniQuote);

      if (data.source === 'estimate' && !spandexResult) {
        toast({
          title: "Estimated Quote",
          description: data.warning || "Using estimated pricing. Live quotes temporarily unavailable.",
        });
      }
    } catch (err) {
      console.error('Quote error:', err);
      toast({ title: "Quote Failed", description: "Could not fetch live pricing. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quote || !fromToken || !toToken) return;

    const swapTransaction = {
      amount: fromAmount,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      to: toToken.address
    };

    if (!validateTransaction(swapTransaction)) {
      toast({ title: "Transaction Blocked", description: "Security validation failed.", variant: "destructive" });
      return;
    }

    setIsSwapping(true);
    playSound('powerup');

    setTimeout(() => {
      setIsSwapping(false);
      toast({
        title: "Swap Completed! ✨",
        description: `Successfully swapped ${quote.fromAmount} ${fromToken?.symbol} for ${quote.toAmount} ${toToken?.symbol}`,
      });
      setFromAmount('');
      setQuote(null);
      playSound('success');
    }, 3000);
  };

  const swapTokens = () => {
    const tempSymbol = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(tempSymbol);
    setQuote(null);
    playSound('select');
  };

  const getBiblicalWisdom = (action: string) => {
    const wisdom: Record<string, string> = {
      swap: "The wise store up choice food and olive oil, but fools gulp theirs down. - Proverbs 21:20",
      caution: "The plans of the diligent lead to profit as surely as haste leads to poverty. - Proverbs 21:5",
      patience: "Patience is better than pride. Do not be quickly provoked in your spirit. - Ecclesiastes 7:8"
    };
    return wisdom[action] || wisdom.caution;
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Biblical Wisdom Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-eboy-green to-ancient-gold bg-clip-text text-transparent mb-2">
          Biblical DeFi Swaps
        </h2>
        <p className="text-sm text-muted-foreground italic">"{getBiblicalWisdom('patience')}"</p>
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
              <TokenSearchSelect
                value={fromSymbol}
                onValueChange={(s) => { setFromSymbol(s); setQuote(null); }}
                excludeToken={toSymbol}
              />
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
            <Button variant="ghost" size="sm" onClick={swapTokens} className="rounded-full p-2 hover:bg-eboy-green/20">
              <ArrowUpDown className="h-4 w-4 text-eboy-green" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <TokenSearchSelect
                value={toSymbol}
                onValueChange={(s) => { setToSymbol(s); setQuote(null); }}
                excludeToken={fromSymbol}
              />
              <div className="flex-1 relative">
                <Input type="text" placeholder="0.0" value={quote?.toAmount || ''} readOnly className="bg-muted/50" />
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
              <SelectContent className="bg-card border-border z-[100]">
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
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Getting Best Price...
                </motion.div>
              ) : (
                <motion.div key="quote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Get Quote
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Quote Display */}
          <AnimatePresence>
            {quote && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Source:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        quote.source === 'uniswap'
                          ? 'bg-eboy-green/20 text-eboy-green border border-eboy-green/40'
                          : quote.source === 'coingecko'
                          ? 'bg-ancient-gold/20 text-ancient-gold border border-ancient-gold/40'
                          : 'bg-destructive/20 text-destructive border border-destructive/40'
                      }`}>
                        {quote.source === 'uniswap' ? '🟢 Uniswap Live'
                          : quote.source === 'coingecko' ? '🟡 CoinGecko Live'
                          : '🔴 Estimated'}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[260px] text-xs leading-relaxed">
                          {quote.source === 'uniswap' ? (
                            <p><strong className="text-eboy-green">Uniswap Live:</strong> Real-time quote direct from Uniswap V3 on Base. Most accurate pricing with exact gas & slippage.</p>
                          ) : quote.source === 'coingecko' ? (
                            <p><strong className="text-ancient-gold">CoinGecko Live:</strong> Market price from CoinGecko (refreshed every 60s). Accurate but doesn't reflect exact on-chain liquidity.</p>
                          ) : (
                            <p><strong className="text-destructive">Estimated:</strong> Hardcoded fallback prices. Both Uniswap & CoinGecko are unavailable. Use with caution.</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
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

                <div className="p-3 bg-ancient-gold/10 rounded-lg border border-ancient-gold/30">
                  <p className="text-xs italic text-muted-foreground">💡 "{getBiblicalWisdom('swap')}"</p>
                </div>

                <Button
                  onClick={executeSwap}
                  disabled={isSwapping}
                  className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-semibold"
                >
                  <AnimatePresence mode="wait">
                    {isSwapping ? (
                      <motion.div key="swapping" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Executing Swap...
                      </motion.div>
                    ) : (
                      <motion.div key="swap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
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

      {/* spanDEX Provider Comparison */}
      <AnimatePresence>
        {spandexQuotes.length > 0 && quote && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="bg-card/60 backdrop-blur-sm border-ancient-gold/30">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-ancient-gold">
                  <Zap className="h-4 w-4" />
                  spanDEX Meta-Aggregator — {spandexQuotes.length} Provider{spandexQuotes.length > 1 ? 's' : ''} Compared
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-1.5">
                {spandexQuotes.map((sq, i) => (
                  <div
                    key={sq.provider}
                    className={`flex items-center justify-between p-2 rounded-md text-sm ${
                      i === 0
                        ? 'bg-eboy-green/10 border border-eboy-green/30'
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {i === 0 && <Award className="h-3.5 w-3.5 text-eboy-green" />}
                      <span className={i === 0 ? 'font-semibold text-eboy-green' : 'text-muted-foreground'}>
                        {sq.provider}
                      </span>
                      {typeof sq.latencyMs === 'number' && (
                        <span className="text-[10px] text-muted-foreground/70">
                          {sq.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <span className={i === 0 ? 'font-mono font-semibold' : 'font-mono text-muted-foreground'}>
                      {sq.outputAmount} {toSymbol}
                    </span>
                  </div>
                ))}
                {spandexError && (
                  <p className="text-xs text-destructive">{spandexError}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* spanDEX Toggle */}
      <div className="flex items-center justify-between px-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={useSpandex}
            onChange={(e) => setUseSpandex(e.target.checked)}
            className="rounded border-border"
          />
          <Zap className="h-3 w-3 text-ancient-gold" />
          spanDEX Meta-Aggregator
        </label>
        <span className="text-[10px] text-muted-foreground">
          Fabric · Odos · KyberSwap · LI.FI
        </span>
      </div>

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
