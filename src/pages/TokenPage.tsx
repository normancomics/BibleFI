import React from 'react';
import NavBar from '@/components/NavBar';
import BibleTokenDashboard from '@/components/token/BibleTokenDashboard';
import LaunchStrategy from '@/components/token/LaunchStrategy';
import TokenDeploymentWizard from '@/components/token/TokenDeploymentWizard';
import EarlyTokenLaunch from '@/components/token/EarlyTokenLaunch';
import SuperfluidTokenLaunch from '@/components/token/SuperfluidTokenLaunch';
import ProductionDefiHub from '@/components/defi/ProductionDefiHub';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TokenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-temple">
      <NavBar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-ancient-gold">
            💰 $BIBLEFI Token Center
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Deploy, manage, and trade the $BIBLEFI token. Biblical wisdom meets tokenomics on Base chain.
          </p>
        </div>

        <Tabs defaultValue="launch" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl mx-auto bg-scripture/40 border border-ancient-gold/30 p-1">
            <TabsTrigger 
              value="launch" 
              className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold text-white hover:text-ancient-gold"
            >
              🚀 Launch Now
            </TabsTrigger>
            <TabsTrigger
              value="superfluid"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white hover:text-blue-300"
            >
              ⚡ Superfluid
            </TabsTrigger>
            <TabsTrigger 
              value="defi"
              className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold text-white hover:text-ancient-gold"
            >
              💰 DeFi Hub
            </TabsTrigger>
            <TabsTrigger 
              value="deploy"
              className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold text-white hover:text-ancient-gold"
            >
              🛠️ Deploy
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold text-white hover:text-ancient-gold"
            >
              📊 Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="strategy"
              className="data-[state=active]:bg-ancient-gold/20 data-[state=active]:text-ancient-gold text-white hover:text-ancient-gold"
            >
              📈 Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="launch">
            <EarlyTokenLaunch />
          </TabsContent>

          <TabsContent value="superfluid">
            <SuperfluidTokenLaunch />
          </TabsContent>

          <TabsContent value="defi">
            <ProductionDefiHub />
          </TabsContent>

          <TabsContent value="deploy">
            <TokenDeploymentWizard />
          </TabsContent>

          <TabsContent value="dashboard">
            <BibleTokenDashboard />
          </TabsContent>
          
          <TabsContent value="strategy">
            <LaunchStrategy />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TokenPage;