import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import PixelButton from '@/components/PixelButton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, MessageSquare, TrendingUp, Zap, Radio,
  Database, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import { scriptureTranslationCrawler } from '@/services/crawlers/scriptureTranslationCrawler';
import { commentaryTheologyCrawler } from '@/services/crawlers/commentaryTheologyCrawler';
import { defiProtocolCrawler } from '@/services/crawlers/defiProtocolCrawler';
import { superfluidEventCrawler } from '@/services/crawlers/superfluidEventCrawler';
import { communitySignalCrawler } from '@/services/crawlers/communitySignalCrawler';
import { toast } from 'sonner';

interface CrawlerStatus {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  icon: any;
  description: string;
}

const ComprehensiveCrawlerDashboard: React.FC = () => {
  const [crawlers, setCrawlers] = useState<CrawlerStatus[]>([
    {
      name: 'Scripture & Translation',
      status: 'idle',
      progress: 0,
      icon: BookOpen,
      description: 'Hebrew, Greek, Aramaic, KJV alignment'
    },
    {
      name: 'Commentary & Theology',
      status: 'idle',
      progress: 0,
      icon: MessageSquare,
      description: 'Classic exegesis + modern Christian finance'
    },
    {
      name: 'DeFi Protocol Data',
      status: 'idle',
      progress: 0,
      icon: TrendingUp,
      description: 'Base, Arbitrum, Optimism, Monad on-chain data'
    },
    {
      name: 'Superfluid Events',
      status: 'idle',
      progress: 0,
      icon: Zap,
      description: 'Stream payments & Daimo USDC transfers'
    },
    {
      name: 'Community Signals',
      status: 'idle',
      progress: 0,
      icon: Radio,
      description: 'Farcaster, Discord sentiment & topics'
    }
  ]);

  const updateCrawlerStatus = (index: number, updates: Partial<CrawlerStatus>) => {
    setCrawlers(prev => prev.map((crawler, i) => 
      i === index ? { ...crawler, ...updates } : crawler
    ));
  };

  const handleScriptureCrawl = async () => {
    updateCrawlerStatus(0, { status: 'running', progress: 0 });
    toast.info('Starting Scripture & Translation crawl...');

    try {
      await scriptureTranslationCrawler.crawlAllScriptures((progress) => {
        updateCrawlerStatus(0, { progress: (progress.processed / progress.total) * 100 });
      });

      updateCrawlerStatus(0, { status: 'completed', progress: 100 });
      toast.success('Scripture crawl completed!');
    } catch (error) {
      updateCrawlerStatus(0, { status: 'error' });
      toast.error('Scripture crawl failed');
    }
  };

  const handleCommentaryCrawl = async () => {
    updateCrawlerStatus(1, { status: 'running', progress: 0 });
    toast.info('Starting Commentary & Theology crawl...');

    try {
      await commentaryTheologyCrawler.crawlAllCommentaries((progress) => {
        updateCrawlerStatus(1, { progress });
      });

      updateCrawlerStatus(1, { status: 'completed', progress: 100 });
      toast.success('Commentary crawl completed!');
    } catch (error) {
      updateCrawlerStatus(1, { status: 'error' });
      toast.error('Commentary crawl failed');
    }
  };

  const handleDeFiCrawl = async () => {
    updateCrawlerStatus(2, { status: 'running', progress: 0 });
    toast.info('Starting DeFi Protocol crawl...');

    try {
      await defiProtocolCrawler.crawlAllProtocols((progress) => {
        updateCrawlerStatus(2, { progress });
      });

      updateCrawlerStatus(2, { status: 'completed', progress: 100 });
      toast.success('DeFi crawl completed!');
    } catch (error) {
      updateCrawlerStatus(2, { status: 'error' });
      toast.error('DeFi crawl failed');
    }
  };

  const handleSuperfluidListener = async () => {
    const currentStatus = crawlers[3].status;
    
    if (currentStatus === 'running') {
      superfluidEventCrawler.stopEventListener();
      updateCrawlerStatus(3, { status: 'idle', progress: 0 });
      toast.info('Stopped Superfluid event listener');
    } else {
      await superfluidEventCrawler.startEventListener();
      updateCrawlerStatus(3, { status: 'running', progress: 100 });
      toast.success('Started Superfluid event listener');
    }
  };

  const handleCommunityMonitoring = async () => {
    const currentStatus = crawlers[4].status;
    
    if (currentStatus === 'running') {
      communitySignalCrawler.stopMonitoring();
      updateCrawlerStatus(4, { status: 'idle', progress: 0 });
      toast.info('Stopped community monitoring');
    } else {
      await communitySignalCrawler.startMonitoring();
      updateCrawlerStatus(4, { status: 'running', progress: 100 });
      toast.success('Started community monitoring');
    }
  };

  const handleStartAll = async () => {
    toast.info('Starting all crawlers...');
    
    handleScriptureCrawl();
    setTimeout(() => handleCommentaryCrawl(), 1000);
    setTimeout(() => handleDeFiCrawl(), 2000);
    setTimeout(() => handleSuperfluidListener(), 3000);
    setTimeout(() => handleCommunityMonitoring(), 4000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-black/40 border-ancient-gold/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-scroll text-ancient-gold flex items-center gap-2">
              <Database className="w-6 h-6" />
              RAG-AGI Crawler System
            </h2>
            <p className="text-white/60 mt-1">
              Comprehensive data ingestion for Biblical Wisdom + DeFi Intelligence
            </p>
          </div>
          <PixelButton onClick={handleStartAll}>
            Start All Crawlers
          </PixelButton>
        </div>

        <div className="grid gap-4">
          {crawlers.map((crawler, index) => (
            <Card key={index} className="p-4 bg-black/60 border-ancient-gold/10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-ancient-gold/10">
                  <crawler.icon className="w-6 h-6 text-ancient-gold" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        {crawler.name}
                        {getStatusIcon(crawler.status)}
                      </h3>
                      <p className="text-sm text-white/60">{crawler.description}</p>
                    </div>
                    <Badge variant={
                      crawler.status === 'completed' ? 'default' :
                      crawler.status === 'running' ? 'secondary' :
                      crawler.status === 'error' ? 'destructive' :
                      'outline'
                    }>
                      {crawler.status}
                    </Badge>
                  </div>

                  {crawler.status === 'running' && (
                    <Progress value={crawler.progress} className="h-2" />
                  )}

                  <div className="flex gap-2">
                    {index === 0 && (
                      <PixelButton 
                        onClick={handleScriptureCrawl}
                        disabled={crawler.status === 'running'}
                        size="sm"
                      >
                        {crawler.status === 'running' ? 'Crawling...' : 'Start Crawl'}
                      </PixelButton>
                    )}
                    {index === 1 && (
                      <PixelButton 
                        onClick={handleCommentaryCrawl}
                        disabled={crawler.status === 'running'}
                        size="sm"
                      >
                        {crawler.status === 'running' ? 'Crawling...' : 'Start Crawl'}
                      </PixelButton>
                    )}
                    {index === 2 && (
                      <PixelButton 
                        onClick={handleDeFiCrawl}
                        disabled={crawler.status === 'running'}
                        size="sm"
                      >
                        {crawler.status === 'running' ? 'Crawling...' : 'Start Crawl'}
                      </PixelButton>
                    )}
                    {index === 3 && (
                      <PixelButton 
                        onClick={handleSuperfluidListener}
                        size="sm"
                      >
                        {crawler.status === 'running' ? 'Stop Listener' : 'Start Listener'}
                      </PixelButton>
                    )}
                    {index === 4 && (
                      <PixelButton 
                        onClick={handleCommunityMonitoring}
                        size="sm"
                      >
                        {crawler.status === 'running' ? 'Stop Monitoring' : 'Start Monitoring'}
                      </PixelButton>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-black/40 border-ancient-gold/20">
        <h3 className="text-xl font-bold font-scroll text-ancient-gold mb-4">
          Data Pipeline Flow
        </h3>
        <div className="space-y-3 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ancient-gold" />
            <span><strong>Ingestion:</strong> Multi-source crawlers harvest raw data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ancient-gold" />
            <span><strong>Processing:</strong> Generate embeddings via OpenAI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ancient-gold" />
            <span><strong>Storage:</strong> Store vectors in Supabase pgvector</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ancient-gold" />
            <span><strong>Retrieval:</strong> Semantic search for context assembly</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ancient-gold" />
            <span><strong>Generation:</strong> AI synthesis with biblical fidelity + DeFi insight</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComprehensiveCrawlerDashboard;
