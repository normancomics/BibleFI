
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Loader2, Zap, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { baseTokens } from '@/data/baseTokens';
import { useSpandexQuote } from '@/hooks/useSpandexQuote';
import { useSpandexExecute } from '@/hooks/useSpandexExecute';
import { useAccount } from 'wagmi';
import { parseUnits, type Address } from 'viem';

const SimpleSwapForm: React.FC = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const { toast } = useToast();
  const { playSound } = useSound();
  const { address: walletAddress, isConnected } = useAccount();

  const toTokenInfo = baseTokens[toToken];
  const fromTokenInfo = baseTokens[fromToken];

  const {
    bestQuote: spandexBest,
    allQuotes: spandexQuotes,
    isLoading: spandexLoading,
    error: quoteError,
    fetchQuote: fetchSpandexQuote,
  } = useSpandexQuote(toTokenInfo?.decimals ?? 6);
  const { isExecuting, txHash, error: execError, execute, reset } = useSpandexExecute();

  const parsedInput = useMemo(() => {
    if (!fromAmount || !fromTokenInfo) return null;
    try {
      const raw = parseUnits(fromAmount, fromTokenInfo.decimals);
      return raw > 0n ? raw : null;
    } catch {
      return null;
    }
  }, [fromAmount, fromTokenInfo]);

  const sameToken = fromToken === toToken;
  const toAmount = !sameToken && parsedInput && spandexBest ? spandexBest.outputAmount : '';

  // Debounced to avoid a quote request per keystroke.
  useEffect(() => {
    if (!parsedInput || sameToken || !fromTokenInfo || !toTokenInfo) return;
    const t = setTimeout(() => {
      fetchSpandexQuote({
        inputToken: fromTokenInfo.address as Address,
        outputToken: toTokenInfo.address as Address,
        inputAmount: parsedInput,
        slippageBps: 100,
        swapperAccount: (walletAddress || '0x0000000000000000000000000000000000000001') as Address,
        chainId: 8453,
        outputDecimals: toTokenInfo.decimals,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [parsedInput, sameToken, fromTokenInfo, toTokenInfo, walletAddress, fetchSpandexQuote]);

  const handleSwapTokens = () => {
    playSound('select');
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    reset();
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    reset();
  };

  const handleSwap = async () => {
    if (!parsedInput || !fromTokenInfo || !toTokenInfo || sameToken) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount and two different tokens",
        variant: "destructive"
      });
      return;
    }
    if (!isConnected || !walletAddress) {
      toast({ title: "Connect your wallet", description: "A wallet is needed to sign the swap.", variant: "destructive" });
      return;
    }

    playSound('coin');
    const hash = await execute({
      fromToken,
      toToken,
      fromTokenAddress: fromTokenInfo.address,
      toTokenAddress: toTokenInfo.address,
      inputAmountHuman: fromAmount,
      inputAmountRaw: parsedInput,
      chainId: 8453,
      slippageBps: 100,
      swapperAccount: walletAddress,
    });
    if (hash) {
      toast({ title: "Swap confirmed", description: `Swapped ${fromAmount} ${fromToken} for ${toToken}.` });
      setFromAmount('');
    } else {
      toast({ title: "Swap not completed", description: "No funds were moved unless your wallet shows a confirmed transaction.", variant: "destructive" });
    }
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
          disabled={isExecuting || !parsedInput || sameToken || !spandexBest}
          className="w-full bg-scripture hover:bg-scripture/80"
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirm in wallet...
            </>
          ) : (
            'Swap Tokens'
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          {spandexBest && parsedInput
            ? `Estimated output via ${spandexBest.provider} · 1% max slippage`
            : 'Enter an amount to see live quotes'}
        </div>
        {sameToken && <div className="text-xs text-destructive text-center">Choose two different tokens.</div>}
        {(quoteError && parsedInput && !spandexLoading && !spandexBest) && (
          <div className="text-xs text-destructive text-center">No live route found: {quoteError}</div>
        )}
        {execError && <div className="text-xs text-destructive text-center">{execError}</div>}
        {txHash && (
          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="block text-xs text-eboy-green text-center underline">
            View confirmed transaction
          </a>
        )}

        {/* spanDEX Provider Quotes */}
        {spandexQuotes.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-xs text-ancient-gold font-medium">
              <Zap className="h-3 w-3" />
              spanDEX — {spandexQuotes.length} providers
            </div>
            {spandexQuotes.slice(0, 3).map((sq, i) => (
              <div key={sq.provider} className={`flex justify-between text-xs px-2 py-1 rounded ${
                i === 0 ? 'bg-eboy-green/10 text-eboy-green font-medium' : 'text-muted-foreground'
              }`}>
                <span className="flex items-center gap-1">
                  {i === 0 && <Award className="h-3 w-3" />}
                  {sq.provider}
                </span>
                <span className="font-mono">{sq.outputAmount}</span>
              </div>
            ))}
          </div>
        )}
        {spandexLoading && (
          <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            spanDEX searching best price...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleSwapForm;
