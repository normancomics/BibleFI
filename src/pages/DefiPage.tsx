
import React from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleSwapForm from "@/components/defi/SimpleSwapForm";
import DefiSwap from "@/components/defi/DefiSwap";
import DefiPortfolio from "@/components/defi/DefiPortfolio";
import SwapErrorBoundary from "@/components/defi/SwapErrorBoundary";
import { BookOpen, Coins, ExternalLink, Info, ShieldAlert, Wallet } from "lucide-react";
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
            <Card className="border-2 border-scripture/30 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="text-ancient-gold" />
                  <span>DeFi Tools</span>
                </CardTitle>
                <CardDescription>
                  Swap, provide liquidity, and earn yield while honoring biblical principles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="swap">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="swap">Swap</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
                    <TabsTrigger value="earn">Earn</TabsTrigger>
                  </TabsList>
                  <TabsContent value="swap" className="pt-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/2">
                        <SwapErrorBoundary>
                          <SimpleSwapForm />
                        </SwapErrorBoundary>
                      </div>
                      <div className="md:w-1/2">
                        <Card className="h-full border border-scripture/20 bg-black/30">
                          <CardHeader>
                            <CardTitle className="text-lg">Biblical Swapping</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p>
                              Our DeFi swap ensures fair exchange rates without excessive fees, 
                              honoring the biblical principle of "just weights and measures" (Proverbs 16:11).
                            </p>
                            
                            <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
                              <p className="italic text-white/80">
                                "The LORD detests dishonest scales, but accurate weights find favor with him."
                              </p>
                              <p className="text-right text-sm text-ancient-gold/70 mt-2">Proverbs 11:1</p>
                            </div>
                            
                            <div className="space-y-2 pt-2">
                              <h4 className="font-medium">Features:</h4>
                              <ul className="space-y-1 text-sm">
                                <li className="flex items-start gap-2">
                                  <Info className="h-4 w-4 text-ancient-gold mt-0.5" />
                                  <span>Transparent fee structure (0.3%)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Info className="h-4 w-4 text-ancient-gold mt-0.5" />
                                  <span>Slippage protection</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Info className="h-4 w-4 text-ancient-gold mt-0.5" />
                                  <span>Fair market rates from multiple sources</span>
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="portfolio" className="pt-6">
                    <SwapErrorBoundary>
                      <DefiPortfolio />
                    </SwapErrorBoundary>
                  </TabsContent>
                  <TabsContent value="liquidity" className="pt-6">
                    <div className="bg-black/50 p-6 rounded-lg border border-scripture/20">
                      <div className="text-center py-8">
                        <h3 className="text-2xl font-scroll text-ancient-gold mb-4">Liquidity Pools Coming Soon</h3>
                        <p className="text-white/70 max-w-md mx-auto mb-6">
                          Biblical liquidity pools that help provide market stability while
                          ensuring fair returns for participants are coming soon.
                        </p>
                        <Button variant="outline" className="border-ancient-gold text-ancient-gold">
                          Get Notified When Available
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="earn" className="pt-6">
                    <div className="bg-black/50 p-6 rounded-lg border border-scripture/20">
                      <div className="text-center py-8">
                        <h3 className="text-2xl font-scroll text-ancient-gold mb-4">Yield Farming Coming Soon</h3>
                        <p className="text-white/70 max-w-md mx-auto mb-6">
                          Biblical yield farming strategies that focus on sustainable returns
                          without excessive risk are in development.
                        </p>
                        <Button variant="outline" className="border-ancient-gold text-ancient-gold">
                          Get Notified When Available
                        </Button>
                      </div>
                    </div>
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
        
        <SwapErrorBoundary>
          <DefiSwap />
        </SwapErrorBoundary>
      </main>
    </div>
  );
};

export default DefiPage;
