import React from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MultiDexAggregator from "@/components/defi/MultiDexAggregator";
import RealPortfolioBalance from "@/components/defi/RealPortfolioBalance";
import EnhancedDefiLending from "@/components/defi/EnhancedDefiLending";
import BiblicalLiquidityPools from "@/components/defi/BiblicalLiquidityPools";
import BiblicalYieldFarming from "@/components/defi/BiblicalYieldFarming";
import SwapErrorBoundary from "@/components/defi/SwapErrorBoundary";
import { BookOpen, Coins, ExternalLink, Info, ShieldAlert, Wallet, Banknote } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DefiPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-scroll text-ancient-gold mb-4">Biblical DeFi</h1>
          <p className="text-xl text-white/80">
            Decentralized Finance guided by biblical principles of stewardship, fair exchange, and ethical investing.
          </p>
        </div>
        
        <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <AlertTitle>Biblical Investment Warning</AlertTitle>
          <AlertDescription>
            "Do not store up for yourselves treasures on earth, where moths and vermin destroy, and where thieves break in and steal. But store up for yourselves treasures in heaven." (Matthew 6:19-20)
            Remember that DeFi carries risks and should be approached with wisdom and prayer.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="border-2 border-scripture/50 bg-black/60 backdrop-blur-sm">
              <CardHeader className="bg-black/30 border-b border-scripture/30">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="text-ancient-gold" />
                  <span>DeFi Tools</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Swap, provide liquidity, earn yield, and lend while honoring biblical principles
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-black/50">
                <Tabs defaultValue="swap">
                  <TabsList className="grid w-full grid-cols-5 bg-black/60 border border-scripture/30">
                    <TabsTrigger value="swap" className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold">Swap</TabsTrigger>
                    <TabsTrigger value="portfolio" className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold">Portfolio</TabsTrigger>
                    <TabsTrigger value="lending" className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold">Lending</TabsTrigger>
                    <TabsTrigger value="liquidity" className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold">Liquidity</TabsTrigger>
                    <TabsTrigger value="earn" className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold">Earn</TabsTrigger>
                  </TabsList>
                  <TabsContent value="swap" className="pt-6">
                    <SwapErrorBoundary>
                      <MultiDexAggregator />
                    </SwapErrorBoundary>
                  </TabsContent>
                  <TabsContent value="portfolio" className="pt-6">
                    <SwapErrorBoundary>
                      <RealPortfolioBalance />
                    </SwapErrorBoundary>
                  </TabsContent>
                  <TabsContent value="lending" className="pt-6">
                    <SwapErrorBoundary>
                      <EnhancedDefiLending />
                    </SwapErrorBoundary>
                  </TabsContent>
                  <TabsContent value="liquidity" className="pt-6">
                    <SwapErrorBoundary>
                      <BiblicalLiquidityPools />
                    </SwapErrorBoundary>
                  </TabsContent>
                  <TabsContent value="earn" className="pt-6">
                    <SwapErrorBoundary>
                      <BiblicalYieldFarming />
                    </SwapErrorBoundary>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border-2 border-scripture/30 bg-black/40 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-ancient-gold" />
                  <span>Biblical DeFi Principles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ancient-gold">Just Exchange</h3>
                  <p className="text-sm text-white/80">
                    "You shall do no wrong in judgment, in measures of length or weight or quantity. 
                    You shall have just balances, just weights." 
                    <span className="block text-right text-xs text-ancient-gold/70 mt-1">— Leviticus 19:35-36</span>
                  </p>
                  <p className="text-sm">
                    All exchanges in our platform use fair market rates and transparent fees.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ancient-gold">Avoiding Usury</h3>
                  <p className="text-sm text-white/80">
                    "If you lend money to any of my people with you who is poor, you shall not be like a moneylender to him, and you shall not exact interest from him."
                    <span className="block text-right text-xs text-ancient-gold/70 mt-1">— Exodus 22:25</span>
                  </p>
                  <p className="text-sm">
                    Our lending and borrowing protocols are designed to avoid exploitative interest rates.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ancient-gold">Wise Stewardship</h3>
                  <p className="text-sm text-white/80">
                    "Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much."
                    <span className="block text-right text-xs text-ancient-gold/70 mt-1">— Luke 16:10</span>
                  </p>
                  <p className="text-sm">
                    We encourage responsible investment and transparent management of resources.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button variant="link" className="text-scripture px-0 flex items-center">
                    <span>Learn More About Biblical Finance</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default DefiPage;
