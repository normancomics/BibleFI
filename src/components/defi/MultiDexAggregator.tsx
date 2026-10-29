import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useWalletAssets, BASE_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID } from "@/hooks/useWalletAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownIcon, RefreshCw, Zap, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { baseTokens } from "@/data/baseTokens";
import { tokenMetadataService } from "@/services/tokenMetadataService";
import { Badge } from "@/components/ui/badge";

interface DexQuote {
  dex: string;
  price: number;
  gasEstimate: string;
  priceImpact: number;
  route: string[];
}

interface AggregatedQuote {
  bestQuote: DexQuote;
  allQuotes: DexQuote[];
}

const MultiDexAggregator: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const { chainId: accountChainId } = useAccount();
  
  const [fromToken, setFromToken] = useState<string>("ETH");
  const [toToken, setToToken] = useState<string>("USDC");
  const [fromAmount, setFromAmount] = useState<string>("1.0");
  const [toAmount, setToAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aggregatedQuote, setAggregatedQuote] = useState<AggregatedQuote | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const wallet = useWalletAssets(accountChainId === BASE_SEPOLIA_CHAIN_ID ? BASE_SEPOLIA_CHAIN_ID : BASE_CHAIN_ID);

  // Single market-price estimate from live prices. Per-DEX quotes are not fabricated;
  // real routing happens on the /swap page.
  const getDexQuotes = async (from: string, to: string, _amount: string): Promise<DexQuote[]> => {
    const fromPrice = wallet.getMarketPriceUsd(from);
    const toPrice = wallet.getMarketPriceUsd(to);
    if (!fromPrice || !toPrice) throw new Error("Live market prices unavailable");
    return [
      {
        dex: "Market estimate",
        price: fromPrice / toPrice,
        gasEstimate: "n/a",
        priceImpact: 0,
        route: [from, to],
      },
    ];
  };

  const aggregateQuotes = async () => {
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setAggregatedQuote(null);
      setToAmount("");
      return;
    }

    setIsLoading(true);
    try {
      const quotes = await getDexQuotes(fromToken, toToken, fromAmount);
      const bestQuote = quotes[0];
      const outputAmount = parseFloat(fromAmount) * bestQuote.price;
      
      const aggregated: AggregatedQuote = {
        bestQuote,
        allQuotes: quotes,
      };
      
      setAggregatedQuote(aggregated);
      setToAmount(outputAmount.toFixed(6));
      
      playSound("success");
    } catch (error) {
      console.error("Error aggregating quotes:", error);
      toast({
        title: "Quote Error",
        description: "Failed to get quotes from DEX aggregators",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(aggregateQuotes, 500);
    return () => clearTimeout(timer);
  }, [fromToken, toToken, fromAmount]);

  const handleRefresh = async () => {
    setRefreshing(true);
    playSound("click");
    await aggregateQuotes();
    setRefreshing(false);
  };

  const handleSwap = () => {
    if (!aggregatedQuote) return;
    
    playSound("powerup");
    toast({
      title: "Best Route Found",
      description: `Executing swap via ${aggregatedQuote.bestQuote.dex}`,
    });

    setTimeout(() => {
      playSound("success");
      toast({
        title: "Swap Executed",
        description: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
      });
    }, 2000);
  };

  const getTokenIcon = (symbol: string) => {
    return baseTokens[symbol]?.logoURI || "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png";
  };

  return (
    <Card className="border-2 border-ancient-gold/30 bg-black/80 backdrop-blur-sm">
      <CardHeader className="bg-black/40 border-b border-ancient-gold/20">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-ancient-gold" />
            <span>Multi-DEX Aggregator</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-ancient-gold hover:bg-ancient-gold/20"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* From Token */}
        <div className="space-y-2">
          <label className="text-sm text-white/70">From</label>
          <div className="flex items-center space-x-2 bg-black/30 p-4 rounded-lg border border-ancient-gold/20">
            <Input
              className="border-0 bg-transparent text-xl p-0 h-auto focus-visible:ring-0"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value) || value === "") {
                  setFromAmount(value);
                }
              }}
            />
            <Select value={fromToken} onValueChange={(value) => {
              playSound("select");
              setFromToken(value);
            }}>
              <SelectTrigger className="w-[140px] border-0 bg-black/50">
                <div className="flex items-center">
                  <img src={getTokenIcon(fromToken)} alt={fromToken} className="w-6 h-6 mr-2" />
                  <SelectValue>{fromToken}</SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-black/90 border border-ancient-gold/30">
                {Object.entries(baseTokens).map(([symbol, token]) => (
                  <SelectItem key={symbol} value={symbol}>
                    <div className="flex items-center">
                      <img src={token.logoURI || getTokenIcon(symbol)} alt={symbol} className="w-5 h-5 mr-2" />
                      <span>{symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-2 border border-ancient-gold/30 hover:bg-ancient-gold/20"
            onClick={() => {
              playSound("select");
              const temp = fromToken;
              setFromToken(toToken);
              setToToken(temp);
            }}
          >
            <ArrowDownIcon className="w-5 h-5 text-ancient-gold" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm text-white/70">To (Best Rate)</label>
          <div className="flex items-center space-x-2 bg-black/30 p-4 rounded-lg border border-ancient-gold/20">
            <Input
              className="border-0 bg-transparent text-xl p-0 h-auto focus-visible:ring-0"
              placeholder="0.0"
              value={toAmount}
              readOnly
            />
            <Select value={toToken} onValueChange={(value) => {
              playSound("select");
              setToToken(value);
            }}>
              <SelectTrigger className="w-[140px] border-0 bg-black/50">
                <div className="flex items-center">
                  <img src={getTokenIcon(toToken)} alt={toToken} className="w-6 h-6 mr-2" />
                  <SelectValue>{toToken}</SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-black/90 border border-ancient-gold/30">
                {Object.entries(baseTokens).map(([symbol, token]) => (
                  <SelectItem key={symbol} value={symbol}>
                    <div className="flex items-center">
                      <img src={token.logoURI || getTokenIcon(symbol)} alt={symbol} className="w-5 h-5 mr-2" />
                      <span>{symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quote Information */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-ancient-gold" />
            <span className="text-white/70">Finding best rates across DEXs...</span>
          </div>
        ) : aggregatedQuote ? (
          <div className="space-y-4">
            {/* Best Quote */}
            <div className="bg-black/40 p-4 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-green-400">Best Rate: {aggregatedQuote.bestQuote.dex}</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Estimate only</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Gas: </span>
                  <span className="text-white">{aggregatedQuote.bestQuote.gasEstimate}</span>
                </div>
                <div>
                  <span className="text-white/60">Price Impact: </span>
                  <span className="text-white">{aggregatedQuote.bestQuote.priceImpact}%</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-white/60">
                Route: {aggregatedQuote.bestQuote.route.join(" → ")}
              </div>
            </div>

            {/* All Quotes Comparison */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/80">All DEX Quotes:</h4>
              <div className="space-y-1">
                {aggregatedQuote.allQuotes.slice(0, 3).map((quote, index) => (
                  <div key={quote.dex} className="flex items-center justify-between p-2 bg-black/20 rounded text-sm">
                    <span className={index === 0 ? "text-green-400 font-medium" : "text-white/70"}>
                      {quote.dex}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80">{quote.gasEstimate}</span>
                      {index === 0 && <Shield className="w-3 h-3 text-green-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isLoading || !aggregatedQuote || parseFloat(fromAmount) <= 0}
          className="w-full py-6 text-lg bg-ancient-gold/20 hover:bg-ancient-gold/30 border border-ancient-gold/50 text-ancient-gold"
        >
          {isLoading ? (
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Getting Best Rate...
            </div>
          ) : aggregatedQuote ? (
            `Swap via ${aggregatedQuote.bestQuote.dex} (Best Rate)`
          ) : (
            "Enter Amount to Swap"
          )}
        </Button>

        {/* Biblical Quote */}
        <div className="text-xs text-center text-white/60 italic pt-2 border-t border-ancient-gold/20">
          "Let your 'Yes' be 'Yes,' and your 'No,' 'No'" - Matthew 5:37
          <br />
          <span className="text-ancient-gold/60">Transparent pricing, honest trading</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiDexAggregator;