
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownIcon, RefreshCw, Wallet, AlertTriangle } from "lucide-react";
import { useZeroX, BASE_TOKENS, Token, formatTokenAmount, parseTokenAmount } from "@/integrations/zerox/client";
import { useToast } from "@/hooks/use-toast";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { GlowingText, SpinningCoin } from "@/components/ui/tailwind-extensions";

const DefiSwap: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const { getQuote, baseTokens } = useZeroX();
  
  // State management
  const [fromToken, setFromToken] = useState<string>("ETH");
  const [toToken, setToToken] = useState<string>("USDC");
  const [fromAmount, setFromAmount] = useState<string>("0.1");
  const [toAmount, setToAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("swap");
  const [animateSwap, setAnimateSwap] = useState(false);
  
  // Calculate quote whenever inputs change
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setToAmount("");
      setExchangeRate("");
      return;
    }
    
    const getSwapQuote = async () => {
      try {
        setIsLoading(true);
        
        const sellToken = baseTokens[fromToken].address;
        const buyToken = baseTokens[toToken].address;
        const sellAmount = parseTokenAmount(
          fromAmount, 
          baseTokens[fromToken].decimals
        );
        
        const quote = await getQuote(sellToken, buyToken, sellAmount);
        
        if (quote) {
          // Set the buy amount
          const formattedBuyAmount = formatTokenAmount(
            quote.buyAmount,
            baseTokens[toToken].decimals
          );
          setToAmount(formattedBuyAmount);
          
          // Calculate and set exchange rate
          const rate = parseFloat(quote.price);
          setExchangeRate(`1 ${fromToken} ≈ ${rate.toFixed(6)} ${toToken}`);
        } else {
          setToAmount("");
          setExchangeRate("");
          toast({
            title: "Quote Error",
            description: "Unable to get swap quote. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
        toast({
          title: "Quote Error",
          description: "Unable to get swap quote. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (fromToken !== toToken) {
      getSwapQuote();
    } else {
      setToAmount(fromAmount);
      setExchangeRate(`1 ${fromToken} = 1 ${toToken}`);
    }
  }, [fromToken, toToken, fromAmount]);
  
  // Handle token swap
  const handleSwapTokens = () => {
    playSound("select");
    setAnimateSwap(true);
    setTimeout(() => {
      const tempFromToken = fromToken;
      const tempToToken = toToken;
      setFromToken(tempToToken);
      setToToken(tempFromToken);
      setAnimateSwap(false);
    }, 300);
  };
  
  // Handle input changes
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setFromAmount(value);
    }
  };
  
  // Handle submit
  const handleSwapSubmit = () => {
    playSound("powerup");
    toast({
      title: "Swap Initiated",
      description: `Swapping ${fromAmount} ${fromToken} for approximately ${toAmount} ${toToken}`,
    });
    
    // In a real implementation, this would connect to the wallet
    // and execute the swap transaction
    setTimeout(() => {
      playSound("success");
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
      });
    }, 2000);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    playSound("click");
    setActiveTab(value);
  };
  
  // Get token icon URL
  const getTokenIcon = (symbol: string) => {
    return baseTokens[symbol]?.logoURI || `/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png`;
  };
  
  return (
    <Card className="pixel-card animate-entrance w-full sm:max-w-md mx-auto">
      <CardHeader className="bg-black/40 border-b border-ancient-gold/20">
        <CardTitle className="text-center">
          <GlowingText color="gold" className="text-xl">Biblical DeFi</GlowingText>
        </CardTitle>
        <Tabs defaultValue="swap" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 bg-black/30">
            <TabsTrigger 
              value="swap" 
              className={activeTab === "swap" ? "data-[state=active]:bg-scripture/30" : ""}
            >
              Swap
            </TabsTrigger>
            <TabsTrigger 
              value="pool" 
              className={activeTab === "pool" ? "data-[state=active]:bg-scripture/30" : ""}
            >
              Liquidity
            </TabsTrigger>
            <TabsTrigger 
              value="stake" 
              className={activeTab === "stake" ? "data-[state=active]:bg-scripture/30" : ""}
            >
              Staking
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4 mt-2">
        <TabsContent value="swap" className="space-y-4 mt-0">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">From</label>
              <span className="text-xs text-white/60">Balance: 1.0 {fromToken}</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-md border border-scripture/20">
              <div className="flex-1">
                <Input
                  className="border-0 bg-transparent text-lg p-0 h-auto focus-visible:ring-0"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                />
              </div>
              <Select value={fromToken} onValueChange={(value) => {
                playSound("select");
                setFromToken(value);
              }}>
                <SelectTrigger className="w-[120px] border-0 bg-black/50 focus:ring-1 focus:ring-scripture">
                  <div className="flex items-center">
                    <img src={getTokenIcon(fromToken)} alt={fromToken} className="w-6 h-6 mr-2" />
                    <SelectValue>{fromToken}</SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/90 border border-scripture/30">
                  {Object.entries(baseTokens).map(([symbol, token]) => (
                    <SelectItem key={symbol} value={symbol} className="hover:bg-scripture/20">
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
          
          {/* Swap Button */}
          <div className="flex justify-center">
            <div 
              className={`p-2 rounded-full bg-black/40 border border-ancient-gold/30 cursor-pointer hover:bg-black/60 transition-all ${animateSwap ? 'rotate-180' : ''}`}
              onClick={handleSwapTokens}
            >
              <ArrowDownIcon className="w-5 h-5 text-ancient-gold" />
            </div>
          </div>
          
          {/* To Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">To (Estimated)</label>
              <span className="text-xs text-white/60">Balance: 100.0 {toToken}</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-md border border-scripture/20">
              <div className="flex-1">
                <Input
                  className="border-0 bg-transparent text-lg p-0 h-auto focus-visible:ring-0"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                />
              </div>
              <Select value={toToken} onValueChange={(value) => {
                playSound("select");
                setToToken(value);
              }}>
                <SelectTrigger className="w-[120px] border-0 bg-black/50 focus:ring-1 focus:ring-scripture">
                  <div className="flex items-center">
                    <img src={getTokenIcon(toToken)} alt={toToken} className="w-6 h-6 mr-2" />
                    <SelectValue>{toToken}</SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/90 border border-scripture/30">
                  {Object.entries(baseTokens).map(([symbol, token]) => (
                    <SelectItem key={symbol} value={symbol} className="hover:bg-scripture/20">
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
          
          {/* Exchange Rate */}
          {exchangeRate && (
            <div className="text-xs text-center text-white/60 italic animate-pulse-glow">
              {exchangeRate}
            </div>
          )}
          
          {/* Swap Button */}
          <PixelButton
            onClick={handleSwapSubmit}
            className="w-full py-4 text-lg relative overflow-hidden bg-scripture hover:bg-scripture/80"
            disabled={isLoading || !toAmount || parseFloat(fromAmount) <= 0}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                <span>Getting Best Rate...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Swap Tokens</span>
                {/* Animated coins when hovering the button */}
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                  <SpinningCoin size={24} className="opacity-70" />
                </div>
              </div>
            )}
          </PixelButton>
          
          <div className="text-xs text-center text-white/60 mt-2">
            <div className="flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 mr-1 text-ancient-gold" />
              <span>"The borrower is servant to the lender." - Proverbs 22:7</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="pool" className="mt-0 h-[300px] flex items-center justify-center">
          <div className="text-center space-y-3">
            <SpinningCoin size={48} className="mx-auto" />
            <h3 className="text-lg font-pixel">Liquidity Pools</h3>
            <p className="text-sm text-white/70">Coming soon - Provide liquidity and earn rewards</p>
          </div>
        </TabsContent>
        
        <TabsContent value="stake" className="mt-0 h-[300px] flex items-center justify-center">
          <div className="text-center space-y-3">
            <SpinningCoin size={48} className="mx-auto" />
            <h3 className="text-lg font-pixel">Biblical Staking</h3>
            <p className="text-sm text-white/70">Coming soon - Stake tokens and multiply your talents</p>
          </div>
        </TabsContent>
      </CardContent>
      
      <CardFooter className="bg-black/30 border-t border-ancient-gold/20 p-3 text-xs text-center justify-center">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" alt="Bible.fi" className="h-5" />
          <span className="text-white/70">Powered by</span>
          <span className="text-scripture font-medium">0x Protocol</span>
          <span className="text-white/70">on</span>
          <span className="text-base-blue font-medium">Base Chain</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DefiSwap;
