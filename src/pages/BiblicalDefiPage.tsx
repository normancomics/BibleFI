
import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BiblicalFinancialAdvisor from "@/components/wisdom/BiblicalFinancialAdvisor";
import { getBiblicalFinancialPrinciples } from "@/services/biblicalAdvisorService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Coins, Sparkles } from "lucide-react";

const BiblicalDefiPage: React.FC = () => {
  const [principles, setPrinciples] = useState<any[]>([]);
  
  useEffect(() => {
    const loadPrinciples = async () => {
      try {
        const data = await getBiblicalFinancialPrinciples();
        setPrinciples(data);
      } catch (error) {
        console.error("Error loading principles:", error);
        setPrinciples([]);
      }
    };
    
    loadPrinciples();
  }, []);
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-scroll text-ancient-gold mb-4">Biblical DeFi Wisdom</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            "But seek first his kingdom and his righteousness, and all these things will be given to you as well."
          </p>
          <p className="text-ancient-gold/70 mt-2 font-scroll">- Matthew 6:33</p>
        </div>
        
        <Tabs defaultValue="advisor" className="mb-12">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="advisor" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>AI Advisor</span>
            </TabsTrigger>
            <TabsTrigger value="principles" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span>Biblical Principles</span>
            </TabsTrigger>
            <TabsTrigger value="defi" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>DeFi Applications</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="advisor" className="pt-6">
            <BiblicalFinancialAdvisor />
          </TabsContent>
          
          <TabsContent value="principles" className="pt-6">
            <Card className="border-2 border-scripture/30 bg-black/20">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
                <CardTitle className="font-scroll text-ancient-gold">Biblical Financial Principles</CardTitle>
                <CardDescription className="text-white/70">
                  Timeless wisdom from scripture about financial stewardship
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {principles.map((principle) => (
                    <Card key={principle.id} className="bg-black/40 border border-ancient-gold/20">
                      <CardContent className="p-4">
                        <h3 className="text-scripture font-medium mb-2">{principle.title}</h3>
                        <p className="text-sm text-white/70 mb-3">{principle.description}</p>
                        <div className="space-y-1">
                          {principle.scripture_references?.map((ref: string, index: number) => (
                            <p key={index} className="text-xs text-ancient-gold">{ref}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="defi" className="pt-6">
            <Card className="border-2 border-scripture/30 bg-black/20">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
                <CardTitle className="font-scroll text-ancient-gold">Biblical DeFi Applications</CardTitle>
                <CardDescription className="text-white/70">
                  Modern financial technology through the lens of scripture
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-purple-900/20 border border-ancient-gold/30">
                    <CardHeader>
                      <CardTitle className="text-ancient-gold">Talents Pool</CardTitle>
                      <CardDescription>Matthew 25:14-30</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-white/80">A staking pool based on the principle that faithful stewardship multiplies resources.</p>
                      <div className="flex justify-between text-sm">
                        <span>Protocol Type:</span>
                        <span className="text-scripture">Staking</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tokens:</span>
                        <span className="text-scripture">ETH, USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>APY:</span>
                        <span className="text-scripture">5.2%</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-900/20 border border-ancient-gold/30">
                    <CardHeader>
                      <CardTitle className="text-ancient-gold">Widow's Mite Lending</CardTitle>
                      <CardDescription>Mark 12:41-44</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-white/80">A lending protocol inspired by the principle that small gifts given faithfully are honored.</p>
                      <div className="flex justify-between text-sm">
                        <span>Protocol Type:</span>
                        <span className="text-scripture">Lending</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tokens:</span>
                        <span className="text-scripture">USDC, DAI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>APY:</span>
                        <span className="text-scripture">3.8%</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-900/20 border border-ancient-gold/30">
                    <CardHeader>
                      <CardTitle className="text-ancient-gold">Hundredfold Harvest</CardTitle>
                      <CardDescription>Matthew 13:23</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-white/80">A yield farming protocol based on the principle that good ground yields abundant fruit.</p>
                      <div className="flex justify-between text-sm">
                        <span>Protocol Type:</span>
                        <span className="text-scripture">Farming</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tokens:</span>
                        <span className="text-scripture">ETH, WBTC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>APY:</span>
                        <span className="text-scripture">8.5%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BiblicalDefiPage;
