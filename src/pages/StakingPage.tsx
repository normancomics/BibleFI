
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StakingPool from "@/components/StakingPool";
import StakingTransparency from "@/components/StakingTransparency";
import MultiWalletConnector from "@/components/wallet/MultiWalletConnector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Coins, Lock, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StakingForm from "@/components/staking/StakingForm";
import RiskBadge from "@/components/staking/RiskBadge";

const StakingPage: React.FC = () => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleWalletConnect = (provider: string, address: string) => {
    setConnectedWallet(provider);
    setConnectedAddress(address);
  };
  
  const handleShowTransparency = () => {
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-scroll text-ancient-gold mb-4 md:mb-0">Biblical Staking Pools</h1>
          
          {!connectedWallet ? (
            <MultiWalletConnector 
              onConnect={handleWalletConnect}
              buttonText="Connect Wallet to Stake"
              buttonVariant="outline"
              buttonClassName="border-ancient-gold text-ancient-gold hover:bg-ancient-gold/20"
            />
          ) : (
            <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-ancient-gold/30">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Connected: {connectedAddress?.substring(0, 6)}...{connectedAddress?.substring(38)}</span>
            </div>
          )}
        </div>
        
        <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
          <Shield className="h-4 w-4 text-amber-500" />
          <AlertTitle>Biblical Staking Principles</AlertTitle>
          <AlertDescription>
            Our staking pools are designed in accordance with biblical principles of stewardship and honest gain.
            We avoid excessive interest rates that could be considered usury (Exodus 22:25).
          </AlertDescription>
        </Alert>
        
        <div className="text-center mb-6">
          <h2 className="font-scroll text-2xl text-scripture-light">Simple, Honest, Biblical Returns</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-10">
          <Card className="border-scripture/30 bg-black/40 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="text-ancient-gold" />
                <span>Stake Your Assets</span>
              </CardTitle>
              <CardDescription>
                Earn yield while honoring biblical principles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pools">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pools">Staking Pools</TabsTrigger>
                  <TabsTrigger value="details">Biblical Details</TabsTrigger>
                  <TabsTrigger value="transparency">Transparency</TabsTrigger>
                </TabsList>
                <TabsContent value="pools" className="pt-6">
                  <div className="space-y-6">
                    <StakingPool 
                      title="Proverbs Pool" 
                      apy={3.5} 
                      lockPeriod="30 days"
                      riskLevel="low"
                      description="This pool follows Solomon's wisdom of steady, patient growth"
                      supportedTokens={["USDC"]}
                      biblicalPrinciple="The patient accumulation of wealth as taught by Solomon"
                      returnsMechanism="Reliable lending to verified biblical businesses"
                    />
                    
                    <StakingPool 
                      title="Talents Pool" 
                      apy={5.2} 
                      lockPeriod="90 days"
                      riskLevel="medium"
                      description="Based on the Parable of the Talents (Matthew 25:14-30)"
                      supportedTokens={["USDC", "USDT", "DAI"]}
                      biblicalPrinciple="Multiplying what has been entrusted to you"
                      returnsMechanism="Diversified lending portfolio with biblical governance"
                    />
                    
                    <StakingPool 
                      title="Joseph's Reserve" 
                      apy={7.0} 
                      lockPeriod="180 days"
                      riskLevel="medium"
                      description="Inspired by Joseph's 7 years of plenty stored for future use"
                      supportedTokens={["ETH", "WETH"]}
                      biblicalPrinciple="Strategic preparation for future needs"
                      returnsMechanism="Diversified defi strategy with automated reinvestment"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="details" className="pt-6">
                  {showDetails ? (
                    <StakingTransparency />
                  ) : (
                    <div className="p-6 bg-black/20 rounded-lg border border-scripture/20 text-center">
                      <p className="mb-4">Learn more about how our biblical staking pools operate and the principles they follow.</p>
                      <button 
                        className="text-scripture underline"
                        onClick={handleShowTransparency}
                      >
                        View Transparency Report
                      </button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="transparency" className="pt-6">
                  <StakingTransparency />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card className="border-scripture/30 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="text-ancient-gold" />
                  <span>Start Staking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectedWallet ? (
                  <StakingForm 
                    supportedTokens={["USDC", "DAI", "ETH", "WETH", "USDT"]}
                    onStakeSubmit={(amount, token) => {
                      console.log(`Staking ${amount} ${token}`);
                    }}
                    isFormVisible={true}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="mb-4 text-white/70">Connect your wallet to start staking</p>
                    <MultiWalletConnector 
                      onConnect={handleWalletConnect}
                      buttonText="Connect Wallet"
                      buttonVariant="default"
                      buttonClassName="bg-scripture hover:bg-scripture/80"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-scripture/30 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-ancient-gold" />
                  <span>Scripture Basis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
                  <p className="italic text-white/80">
                    "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things. Come and share your master's happiness!"
                  </p>
                  <p className="text-right text-sm text-ancient-gold/70 mt-2">Matthew 25:23</p>
                </div>
                
                <div>
                  <p className="text-sm text-white/70">
                    Our staking pools are designed to encourage biblical stewardship, helping you grow your resources responsibly while avoiding usury and exploitative practices.
                  </p>
                </div>
                
                <RiskBadge riskLevel="low" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StakingPage;
