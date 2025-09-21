import React from 'react';
import NavBar from '@/components/NavBar';
import BibleTokenDashboard from '@/components/token/BibleTokenDashboard';
import LaunchStrategy from '@/components/token/LaunchStrategy';
import TokenDeploymentWizard from '@/components/token/TokenDeploymentWizard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TokenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="wizard" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="wizard">Deploy</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="wizard">
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