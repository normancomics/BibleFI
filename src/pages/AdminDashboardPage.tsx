import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BiblicalFinanceCrawler from '@/components/admin/BiblicalFinanceCrawler';
import GlobalChurchCrawler from '@/components/admin/GlobalChurchCrawler';
import PaymentProcessorSetup from '@/components/admin/PaymentProcessorSetup';
import ChurchPaymentProcessorDashboard from '@/components/admin/ChurchPaymentProcessorDashboard';
import LiveDataDashboard from '@/components/dashboard/LiveDataDashboard';
import SecurityMonitorPanel from '@/components/admin/SecurityMonitorPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboardPage: React.FC = () => {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from('security_monitor_findings' as never)
        .select('*', { count: 'exact', head: true })
        .eq('acknowledged', false);
      if (!cancelled && count && count > 0) {
        toast.error(`${count} unacknowledged HIGH security finding${count === 1 ? '' : 's'}`, {
          description: 'Open the Security tab to review.',
          duration: 8000,
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Tabs defaultValue="live-data" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="live-data">Live Data</TabsTrigger>
          <TabsTrigger value="crawlers">Data Crawlers</TabsTrigger>
          <TabsTrigger value="processors">Payment Setup</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="live-data">
          <LiveDataDashboard />
        </TabsContent>

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

        <TabsContent value="security">
          <SecurityMonitorPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;