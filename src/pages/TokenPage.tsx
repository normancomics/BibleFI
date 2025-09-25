import React from 'react';
import NavBar from '@/components/NavBar';
import BibleTokenDashboard from '@/components/token/BibleTokenDashboard';
import LaunchStrategy from '@/components/token/LaunchStrategy';
import TokenDeploymentWizard from '@/components/token/TokenDeploymentWizard';
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
            💰 $BIBLE Token Center
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Deploy, manage, and trade the $BIBLE token. Biblical wisdom meets tokenomics on Base chain.
          </p>
        </div>

        <Tabs defaultValue="defi" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="defi">DeFi Hub</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

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