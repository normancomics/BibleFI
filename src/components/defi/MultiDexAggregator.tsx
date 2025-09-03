import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownIcon, RefreshCw, Zap, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { baseTokens } from "@/data/baseTokens";
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
  savings: number;
  confidence: number;
}

const MultiDexAggregator: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  
  const [fromToken, setFromToken] = useState<string>("ETH");
  const [toToken, setToToken] = useState<string>("USDC");
  const [fromAmount, setFromAmount] = useState<string>("1.0");
  const [toAmount, setToAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aggregatedQuote, setAggregatedQuote] = useState<AggregatedQuote | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Mock DEX data - in production, these would be real API calls
  const getDexQuotes = async (from: string, to: string, amount: string): Promise<DexQuote[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const basePrice = 1800; // ETH price
    const mockQuotes: DexQuote[] = [
      {
        dex: "Uniswap V3",
        price: basePrice * 0.999, // Slightly better rate
        gasEstimate: "0.0045 ETH",
        priceImpact: 0.1,
        route: [from, "WETH", to]
      },
      {
        dex: "Odos",
        price: basePrice * 1.002, // Best rate
        gasEstimate: "0.0038 ETH",
        priceImpact: 0.05,
        route: [from, to]
      },
      {
        dex: "KyberSwap",
        price: basePrice * 0.997,
        gasEstimate: "0.0052 ETH",
        priceImpact: 0.15,
        route: [from, "USDT", to]
      },
      {
        dex: "Relay.link",
        price: basePrice * 0.995,
        gasEstimate: "0.0041 ETH",
        priceImpact: 0.12,
        route: [from, to]
      },
      {
        dex: "Superfluid",
        price: basePrice * 0.998,
        gasEstimate: "0.0039 ETH",
        priceImpact: 0.08,
        route: [from, "DAI", to]
      }
    ];

    return mockQuotes.sort((a, b) => b.price - a.price);
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
      const worstQuote = quotes[quotes.length - 1];
      
      const outputAmount = parseFloat(fromAmount) * bestQuote.price;
      const savings = ((bestQuote.price - worstQuote.price) / worstQuote.price) * 100;
      
      const aggregated: AggregatedQuote = {
        bestQuote,
        allQuotes: quotes,
        savings,
        confidence: 95 + Math.random() * 4 // 95-99% confidence
      };
      
      setAggregatedQuote(aggregated);
      setToAmount((outputAmount / 1800).toFixed(6)); // Convert back to token amount
      
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
      description: `Executing swap via ${aggregatedQuote.bestQuote.dex} - saving ${aggregatedQuote.savings.toFixed(2)}%`,
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
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  +{aggregatedQuote.savings.toFixed(2)}% savings
                </Badge>
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

            {/* Confidence */}
            <div className="flex items-center justify-center text-xs text-white/60">
              <Shield className="w-3 h-3 mr-1" />
              <span>{aggregatedQuote.confidence.toFixed(1)}% confidence</span>
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