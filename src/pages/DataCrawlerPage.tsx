import React from 'react';
import NavBar from '@/components/NavBar';
import BiblicalFinanceCrawler from '@/components/admin/BiblicalFinanceCrawler';
import GlobalChurchCrawler from '@/components/admin/GlobalChurchCrawler';
import ComprehensiveCrawlerDashboard from '@/components/admin/ComprehensiveCrawlerDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Church, Network } from 'lucide-react';

const DataCrawlerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-scroll text-ancient-gold mb-4">
            Data Crawler Dashboard
          </h1>
          <p className="text-white/80 max-w-3xl mx-auto text-lg">
            Comprehensive biblical text analysis and global church data compilation. 
            Crawl and index every financial mention in the Bible across all original languages, 
            and build the world's most complete Christian church database.
          </p>
        </div>

        <Tabs defaultValue="rag-agi" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto mb-8">
            <TabsTrigger value="rag-agi" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              RAG-AGI Pipeline
            </TabsTrigger>
            <TabsTrigger value="biblical" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Biblical Finance
            </TabsTrigger>
            <TabsTrigger value="churches" className="flex items-center gap-2">
              <Church className="w-4 h-4" />
              Global Churches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rag-agi" className="space-y-6">
            <ComprehensiveCrawlerDashboard />
          </TabsContent>

          <TabsContent value="biblical" className="space-y-6">
            <BiblicalFinanceCrawler />
          </TabsContent>

          <TabsContent value="churches" className="space-y-6">
            <GlobalChurchCrawler />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DataCrawlerPage;
