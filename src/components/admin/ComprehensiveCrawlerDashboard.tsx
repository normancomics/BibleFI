import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, Play, Square, RotateCcw, CheckCircle2, Loader2, AlertTriangle,
  BookOpen, MessageSquare, TrendingUp, Zap, Radio, Database
} from 'lucide-react';
import { CrawlerRegistry } from '@/services/crawlers/CrawlerRegistry';
import { toast } from 'sonner';

interface CrawlerStatus {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  recordsFound: number;
  errors: number;
  lastRun: Date;
}

const ComprehensiveCrawlerDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [crawlers, setCrawlers] = useState<CrawlerStatus[]>([
    { id: 'scripture', name: 'Scripture & Translation', description: 'Hebrew, Greek, Aramaic, KJV alignment', category: 'biblical', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'commentary', name: 'Commentary & Theology', description: 'Classic exegesis + modern Christian finance', category: 'biblical', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'defi', name: 'DeFi Protocol Data', description: 'Base, Arbitrum, Optimism on-chain data', category: 'defi', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'superfluid', name: 'Superfluid Events', description: 'Stream payments & Daimo USDC transfers', category: 'defi', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'community', name: 'Community Signals', description: 'Farcaster, Discord sentiment & topics', category: 'social', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'tax', name: 'Tax & Regulatory', description: 'IRS guidance, international crypto regulations', category: 'compliance', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'church-processors', name: 'Church Processors', description: 'Church crypto payment infrastructure', category: 'church', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'finance-news', name: 'Finance News', description: 'Christian financial media aggregation', category: 'news', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'audits', name: 'Smart Contract Audits', description: 'DeFi protocol security reports', category: 'defi', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'grants', name: 'Grant Funding', description: 'Faith-based & Web3 grant opportunities', category: 'funding', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'historical', name: 'Historical Events', description: 'Biblical economic patterns', category: 'biblical', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'denominations', name: 'Denomination Teachings', description: 'Financial stewardship doctrines', category: 'church', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'yield', name: 'Yield Aggregators', description: 'DeFi yield farming opportunities', category: 'defi', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'nft', name: 'NFT & Digital Assets', description: 'Faith-based NFT collections', category: 'defi', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
    { id: 'macro', name: 'Macro Indicators', description: 'Global economic data & biblical context', category: 'economics', status: 'idle', progress: 0, recordsFound: 0, errors: 0, lastRun: new Date() },
  ]);

  const updateCrawler = (id: string, updates: Partial<CrawlerStatus>) => {
    setCrawlers(prev => prev.map(c => c.id === id ? { ...c, ...updates, lastRun: new Date() } : c));
  };

  const handleStartAll = async () => {
    setIsRunning(true);
    toast.info('Starting all crawlers...');
    
    // Simulate crawling
    crawlers.forEach((crawler, index) => {
      setTimeout(() => {
        updateCrawler(crawler.id, { status: 'running', progress: 0 });
        
        const interval = setInterval(() => {
          updateCrawler(crawler.id, { 
            progress: Math.min((crawlers.find(c => c.id === crawler.id)?.progress || 0) + 10, 100),
            recordsFound: Math.floor(Math.random() * 1000)
          });
          
          if ((crawlers.find(c => c.id === crawler.id)?.progress || 0) >= 100) {
            clearInterval(interval);
            updateCrawler(crawler.id, { status: 'completed', progress: 100 });
          }
        }, 500);
      }, index * 200);
    });

    setTimeout(() => setIsRunning(false), 10000);
  };

  const handleStopAll = () => {
    setCrawlers(prev => prev.map(c => ({ ...c, status: 'idle' as const, progress: 0 })));
    setIsRunning(false);
    toast.info('All crawlers stopped');
  };

  const handleReset = () => {
    setCrawlers(prev => prev.map(c => ({ 
      ...c, 
      status: 'idle' as const, 
      progress: 0, 
      recordsFound: 0, 
      errors: 0 
    })));
    toast.info('Crawlers reset');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-950/20 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-ancient-gold/30 bg-gradient-to-br from-background via-purple-950/10 to-background">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl font-scroll text-ancient-gold mb-2">
                  Comprehensive Data Crawler
                </CardTitle>
                <CardDescription className="text-white/70">
                  Multi-source biblical, financial, and church data acquisition
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
                  <Activity className="w-4 h-4 mr-1" />
                  {crawlers.filter(c => c.status === 'running').length} Active
                </Badge>
                <Badge variant="outline" className="border-green-500/50 text-green-500">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {crawlers.filter(c => c.status === 'completed').length} Complete
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Control Panel */}
        <Card className="border-ancient-gold/30 bg-gradient-to-br from-background via-purple-950/5 to-background">
          <CardHeader>
            <CardTitle className="text-xl font-scroll text-ancient-gold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Crawler Control Panel
            </CardTitle>
            <CardDescription>
              Manage all data acquisition processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-ancient-gold">Master Controls</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleStartAll}
                    disabled={isRunning}
                    className="bg-ancient-gold hover:bg-ancient-gold/90 text-black"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Crawling...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start All
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleStopAll}
                    disabled={!isRunning}
                    variant="destructive"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop All
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-ancient-gold/30 text-ancient-gold"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-ancient-gold">Statistics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-black/40 rounded-lg border border-ancient-gold/20">
                    <p className="text-xs text-white/60">Total Progress</p>
                    <p className="text-2xl font-bold text-ancient-gold">
                      {Math.round(crawlers.reduce((acc, c) => acc + c.progress, 0) / crawlers.length)}%
                    </p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-ancient-gold/20">
                    <p className="text-xs text-white/60">Records Found</p>
                    <p className="text-2xl font-bold text-ancient-gold">
                      {crawlers.reduce((acc, c) => acc + c.recordsFound, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crawler Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {crawlers.map((crawler) => (
            <Card
              key={crawler.id}
              className={`border-2 transition-all hover:scale-[1.02] ${
                crawler.status === 'running'
                  ? 'border-ancient-gold/50 bg-gradient-to-br from-ancient-gold/10 via-purple-950/20 to-ancient-gold/5'
                  : crawler.status === 'completed'
                  ? 'border-green-500/30 bg-gradient-to-br from-green-950/20 via-purple-950/10 to-green-950/5'
                  : 'border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-ancient-gold mb-1 flex items-center gap-2">
                      {crawler.status === 'running' && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {crawler.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {crawler.name}
                    </CardTitle>
                    <CardDescription className="text-white/60 text-xs line-clamp-2">
                      {crawler.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${
                      crawler.status === 'running'
                        ? 'border-ancient-gold text-ancient-gold'
                        : crawler.status === 'completed'
                        ? 'border-green-500 text-green-500'
                        : 'border-white/30 text-white/70'
                    }`}
                  >
                    {crawler.status === 'running' && <Activity className="w-3 h-3 mr-1" />}
                    {crawler.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {crawler.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/70">Progress</span>
                    <span className="text-ancient-gold font-bold">
                      {crawler.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={crawler.progress} 
                    className="h-2 bg-purple-950/30" 
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-black/40 rounded border border-ancient-gold/20">
                    <p className="text-white/50 text-xs mb-1">Records</p>
                    <p className="text-ancient-gold font-bold text-lg">
                      {crawler.recordsFound.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-ancient-gold/20">
                    <p className="text-white/50 text-xs mb-1">Last Run</p>
                    <p className="text-white/70 text-xs font-mono">
                      {crawler.lastRun.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Error Alert */}
                {crawler.errors > 0 && (
                  <Alert className="bg-red-950/20 border-red-500/30 py-2">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <AlertDescription className="text-red-300 text-xs">
                      {crawler.errors} error(s) encountered
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveCrawlerDashboard;
