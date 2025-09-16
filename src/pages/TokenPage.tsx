import React from 'react';
import BibleTokenDashboard from '@/components/token/BibleTokenDashboard';
import LaunchStrategy from '@/components/token/LaunchStrategy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TokenPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="launch">Launch Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <BibleTokenDashboard />
        </TabsContent>
        
        <TabsContent value="launch">
          <LaunchStrategy />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenPage;