import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BiblicalFinanceCrawler from '@/components/admin/BiblicalFinanceCrawler';
import GlobalChurchCrawler from '@/components/admin/GlobalChurchCrawler';
import PaymentProcessorSetup from '@/components/admin/PaymentProcessorSetup';
import ChurchPaymentProcessorDashboard from '@/components/admin/ChurchPaymentProcessorDashboard';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Tabs defaultValue="crawlers" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="crawlers">Data Crawlers</TabsTrigger>
          <TabsTrigger value="processors">Payment Setup</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="crawlers" className="space-y-6">
          <BiblicalFinanceCrawler />
          <GlobalChurchCrawler />
        </TabsContent>
        
        <TabsContent value="processors">
          <PaymentProcessorSetup />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <ChurchPaymentProcessorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;