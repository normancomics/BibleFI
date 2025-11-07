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
import { taxRegulatoryKnowledgeCrawler } from '@/services/crawlers/taxRegulatoryKnowledgeCrawler';
import { churchPaymentProcessorCrawler } from '@/services/crawlers/churchPaymentProcessorCrawler';
import { biblicalFinanceNewsCrawler } from '@/services/crawlers/biblicalFinanceNewsCrawler';
import { smartContractAuditCrawler } from '@/services/crawlers/smartContractAuditCrawler';
import { grantFundingCrawler } from '@/services/crawlers/grantFundingCrawler';
import { historicalEconomicEventsCrawler } from '@/services/crawlers/historicalEconomicEventsCrawler';
import { denominationTeachingCrawler } from '@/services/crawlers/denominationTeachingCrawler';
import { yieldAggregatorCrawler } from '@/services/crawlers/yieldAggregatorCrawler';
import { nftDigitalAssetCrawler } from '@/services/crawlers/nftDigitalAssetCrawler';
import { macroEconomicIndicatorCrawler } from '@/services/crawlers/macroEconomicIndicatorCrawler';
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
    { name: 'Scripture & Translation', status: 'idle', progress: 0, icon: BookOpen, description: 'Hebrew, Greek, Aramaic, KJV alignment' },
    { name: 'Commentary & Theology', status: 'idle', progress: 0, icon: MessageSquare, description: 'Classic exegesis + modern Christian finance' },
    { name: 'DeFi Protocol Data', status: 'idle', progress: 0, icon: TrendingUp, description: 'Base, Arbitrum, Optimism, Monad on-chain data' },
    { name: 'Superfluid Events', status: 'idle', progress: 0, icon: Zap, description: 'Stream payments & Daimo USDC transfers' },
    { name: 'Community Signals', status: 'idle', progress: 0, icon: Radio, description: 'Farcaster, Discord sentiment & topics' },
    { name: 'Tax & Regulatory', status: 'idle', progress: 0, icon: Database, description: 'IRS guidance, international crypto regulations' },
    { name: 'Church Processors', status: 'idle', progress: 0, icon: Database, description: 'Church crypto payment infrastructure' },
    { name: 'Finance News', status: 'idle', progress: 0, icon: MessageSquare, description: 'Christian financial media aggregation' },
    { name: 'Smart Contract Audits', status: 'idle', progress: 0, icon: CheckCircle2, description: 'DeFi protocol security reports' },
    { name: 'Grant Funding', status: 'idle', progress: 0, icon: TrendingUp, description: 'Faith-based & Web3 grant opportunities' },
    { name: 'Historical Events', status: 'idle', progress: 0, icon: BookOpen, description: 'Biblical economic patterns' },
    { name: 'Denomination Teachings', status: 'idle', progress: 0, icon: MessageSquare, description: 'Financial stewardship doctrines' },
    { name: 'Yield Aggregators', status: 'idle', progress: 0, icon: TrendingUp, description: 'DeFi yield farming opportunities' },
    { name: 'NFT & Digital Assets', status: 'idle', progress: 0, icon: Database, description: 'Faith-based NFT collections' },
    { name: 'Macro Indicators', status: 'idle', progress: 0, icon: TrendingUp, description: 'Global economic data & biblical context' },
  ]);

  const updateCrawlerStatus = (name: string, updates: Partial<CrawlerStatus>) => {
    setCrawlers(prev => prev.map((crawler) => 
      crawler.name === name ? { ...crawler, ...updates } : crawler
    ));
  };

  const handleScriptureCrawl = async () => {
    updateCrawlerStatus('Scripture & Translation', { status: 'running', progress: 0 });
    toast.info('Starting Scripture & Translation crawl...');

    try {
      await scriptureTranslationCrawler.crawlAllScriptures((progress) => {
        updateCrawlerStatus('Scripture & Translation', { progress: (progress.processed / progress.total) * 100 });
      });

      updateCrawlerStatus('Scripture & Translation', { status: 'completed', progress: 100 });
      toast.success('Scripture crawl completed!');
    } catch (error) {
      updateCrawlerStatus('Scripture & Translation', { status: 'error' });
      toast.error('Scripture crawl failed');
    }
  };

  const handleCommentaryCrawl = async () => {
    updateCrawlerStatus('Commentary & Theology', { status: 'running', progress: 0 });
    toast.info('Starting Commentary & Theology crawl...');

    try {
      await commentaryTheologyCrawler.crawlAllCommentaries((progress) => {
        updateCrawlerStatus('Commentary & Theology', { progress });
      });

      updateCrawlerStatus('Commentary & Theology', { status: 'completed', progress: 100 });
      toast.success('Commentary crawl completed!');
    } catch (error) {
      updateCrawlerStatus('Commentary & Theology', { status: 'error' });
      toast.error('Commentary crawl failed');
    }
  };

  const handleDeFiCrawl = async () => {
    updateCrawlerStatus('DeFi Protocol Data', { status: 'running', progress: 0 });
    toast.info('Starting DeFi Protocol crawl...');

    try {
      await defiProtocolCrawler.crawlAllProtocols((progress) => {
        updateCrawlerStatus('DeFi Protocol Data', { progress });
      });

      updateCrawlerStatus('DeFi Protocol Data', { status: 'completed', progress: 100 });
      toast.success('DeFi crawl completed!');
    } catch (error) {
      updateCrawlerStatus('DeFi Protocol Data', { status: 'error' });
      toast.error('DeFi crawl failed');
    }
  };

  const handleSuperfluidListener = async () => {
    const crawler = crawlers.find(c => c.name === 'Superfluid Events');
    
    if (crawler?.status === 'running') {
      superfluidEventCrawler.stopEventListener();
      updateCrawlerStatus('Superfluid Events', { status: 'idle', progress: 0 });
      toast.info('Stopped Superfluid event listener');
    } else {
      await superfluidEventCrawler.startEventListener();
      updateCrawlerStatus('Superfluid Events', { status: 'running', progress: 100 });
      toast.success('Started Superfluid event listener');
    }
  };

  const handleCommunityMonitoring = async () => {
    const crawler = crawlers.find(c => c.name === 'Community Signals');
    
    if (crawler?.status === 'running') {
      communitySignalCrawler.stopMonitoring();
      updateCrawlerStatus('Community Signals', { status: 'idle', progress: 0 });
      toast.info('Stopped community monitoring');
    } else {
      await communitySignalCrawler.startMonitoring();
      updateCrawlerStatus('Community Signals', { status: 'running', progress: 100 });
      toast.success('Started community monitoring');
    }
  };

  // New crawler handlers
  const handleTaxRegulatoryCrawl = async () => {
    updateCrawlerStatus('Tax & Regulatory', { status: 'running', progress: 0 });
    try {
      await taxRegulatoryKnowledgeCrawler.crawlAllRegulations((progress) => {
        updateCrawlerStatus('Tax & Regulatory', { progress });
      });
      updateCrawlerStatus('Tax & Regulatory', { status: 'completed', progress: 100 });
      toast.success('Tax & regulatory data crawled');
    } catch (error) {
      updateCrawlerStatus('Tax & Regulatory', { status: 'error' });
      toast.error('Tax crawler failed');
    }
  };

  const handleChurchProcessorCrawl = async () => {
    updateCrawlerStatus('Church Processors', { status: 'running', progress: 0 });
    try {
      await churchPaymentProcessorCrawler.crawlAllChurchProcessors((progress) => {
        updateCrawlerStatus('Church Processors', { progress });
      });
      updateCrawlerStatus('Church Processors', { status: 'completed', progress: 100 });
      toast.success('Church processors analyzed');
    } catch (error) {
      updateCrawlerStatus('Church Processors', { status: 'error' });
      toast.error('Church processor crawler failed');
    }
  };

  const handleFinanceNewsCrawl = async () => {
    updateCrawlerStatus('Finance News', { status: 'running', progress: 0 });
    try {
      await biblicalFinanceNewsCrawler.crawlAllNews((progress) => {
        updateCrawlerStatus('Finance News', { progress });
      });
      updateCrawlerStatus('Finance News', { status: 'completed', progress: 100 });
      toast.success('Finance news crawled');
    } catch (error) {
      updateCrawlerStatus('Finance News', { status: 'error' });
      toast.error('Finance news crawler failed');
    }
  };

  const handleAuditCrawl = async () => {
    updateCrawlerStatus('Smart Contract Audits', { status: 'running', progress: 0 });
    try {
      await smartContractAuditCrawler.crawlAllAudits((progress) => {
        updateCrawlerStatus('Smart Contract Audits', { progress });
      });
      updateCrawlerStatus('Smart Contract Audits', { status: 'completed', progress: 100 });
      toast.success('Smart contract audits crawled');
    } catch (error) {
      updateCrawlerStatus('Smart Contract Audits', { status: 'error' });
      toast.error('Audit crawler failed');
    }
  };

  const handleGrantFundingCrawl = async () => {
    updateCrawlerStatus('Grant Funding', { status: 'running', progress: 0 });
    try {
      await grantFundingCrawler.crawlAllGrants((progress) => {
        updateCrawlerStatus('Grant Funding', { progress });
      });
      updateCrawlerStatus('Grant Funding', { status: 'completed', progress: 100 });
      toast.success('Grant opportunities found');
    } catch (error) {
      updateCrawlerStatus('Grant Funding', { status: 'error' });
      toast.error('Grant crawler failed');
    }
  };

  const handleHistoricalEventsCrawl = async () => {
    updateCrawlerStatus('Historical Events', { status: 'running', progress: 0 });
    try {
      await historicalEconomicEventsCrawler.crawlAllEvents((progress) => {
        updateCrawlerStatus('Historical Events', { progress });
      });
      updateCrawlerStatus('Historical Events', { status: 'completed', progress: 100 });
      toast.success('Historical events catalogued');
    } catch (error) {
      updateCrawlerStatus('Historical Events', { status: 'error' });
      toast.error('Historical events crawler failed');
    }
  };

  const handleDenominationTeachingCrawl = async () => {
    updateCrawlerStatus('Denomination Teachings', { status: 'running', progress: 0 });
    try {
      await denominationTeachingCrawler.crawlAllTeachings((progress) => {
        updateCrawlerStatus('Denomination Teachings', { progress });
      });
      updateCrawlerStatus('Denomination Teachings', { status: 'completed', progress: 100 });
      toast.success('Denomination teachings crawled');
    } catch (error) {
      updateCrawlerStatus('Denomination Teachings', { status: 'error' });
      toast.error('Denomination crawler failed');
    }
  };

  const handleYieldAggregatorCrawl = async () => {
    updateCrawlerStatus('Yield Aggregators', { status: 'running', progress: 0 });
    try {
      await yieldAggregatorCrawler.crawlAllYields((progress) => {
        updateCrawlerStatus('Yield Aggregators', { progress });
      });
      updateCrawlerStatus('Yield Aggregators', { status: 'completed', progress: 100 });
      toast.success('Yield opportunities crawled');
    } catch (error) {
      updateCrawlerStatus('Yield Aggregators', { status: 'error' });
      toast.error('Yield crawler failed');
    }
  };

  const handleNFTCrawl = async () => {
    updateCrawlerStatus('NFT & Digital Assets', { status: 'running', progress: 0 });
    try {
      await nftDigitalAssetCrawler.crawlAllNFTs((progress) => {
        updateCrawlerStatus('NFT & Digital Assets', { progress });
      });
      updateCrawlerStatus('NFT & Digital Assets', { status: 'completed', progress: 100 });
      toast.success('NFT collections crawled');
    } catch (error) {
      updateCrawlerStatus('NFT & Digital Assets', { status: 'error' });
      toast.error('NFT crawler failed');
    }
  };

  const handleMacroIndicatorCrawl = async () => {
    updateCrawlerStatus('Macro Indicators', { status: 'running', progress: 0 });
    try {
      await macroEconomicIndicatorCrawler.crawlAllIndicators((progress) => {
        updateCrawlerStatus('Macro Indicators', { progress });
      });
      updateCrawlerStatus('Macro Indicators', { status: 'completed', progress: 100 });
      toast.success('Macro indicators crawled');
    } catch (error) {
      updateCrawlerStatus('Macro Indicators', { status: 'error' });
      toast.error('Macro indicator crawler failed');
    }
  };

  const handleStartAll = async () => {
    toast.info('Starting all crawlers...');
    const handlers = [
      handleScriptureCrawl, handleCommentaryCrawl, handleDeFiCrawl,
      handleSuperfluidListener, handleCommunityMonitoring, handleTaxRegulatoryCrawl,
      handleChurchProcessorCrawl, handleFinanceNewsCrawl, handleAuditCrawl,
      handleGrantFundingCrawl, handleHistoricalEventsCrawl, handleDenominationTeachingCrawl,
      handleYieldAggregatorCrawl, handleNFTCrawl, handleMacroIndicatorCrawl
    ];
    handlers.forEach((handler, i) => setTimeout(handler, i * 1000));
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
                    <PixelButton 
                      onClick={() => {
                        const handlers: Record<string, () => void> = {
                          'Scripture & Translation': handleScriptureCrawl,
                          'Commentary & Theology': handleCommentaryCrawl,
                          'DeFi Protocol Data': handleDeFiCrawl,
                          'Superfluid Events': handleSuperfluidListener,
                          'Community Signals': handleCommunityMonitoring,
                          'Tax & Regulatory': handleTaxRegulatoryCrawl,
                          'Church Processors': handleChurchProcessorCrawl,
                          'Finance News': handleFinanceNewsCrawl,
                          'Smart Contract Audits': handleAuditCrawl,
                          'Grant Funding': handleGrantFundingCrawl,
                          'Historical Events': handleHistoricalEventsCrawl,
                          'Denomination Teachings': handleDenominationTeachingCrawl,
                          'Yield Aggregators': handleYieldAggregatorCrawl,
                          'NFT & Digital Assets': handleNFTCrawl,
                          'Macro Indicators': handleMacroIndicatorCrawl
                        };
                        handlers[crawler.name]?.();
                      }}
                      disabled={crawler.status === 'running' && !['Superfluid Events', 'Community Signals'].includes(crawler.name)}
                      size="sm"
                    >
                      {crawler.status === 'running' 
                        ? (['Superfluid Events', 'Community Signals'].includes(crawler.name) ? 'Stop' : 'Running...')
                        : 'Start'}
                    </PixelButton>
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
