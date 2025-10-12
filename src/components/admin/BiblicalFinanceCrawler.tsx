import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BiblicalFinanceCrawlerService, CrawlerStats } from '@/services/biblicalFinanceCrawler';
import { comprehensiveBiblicalCrawler } from '@/services/comprehensiveBiblicalCrawler';
import { Book, Database, Search, TrendingUp, Zap } from 'lucide-react';

const BiblicalFinanceCrawler: React.FC = () => {
  const { toast } = useToast();
  const [isKJVCrawling, setIsKJVCrawling] = useState(false);
  const [isFinanceCrawling, setIsFinanceCrawling] = useState(false);
  const [isComprehensiveCrawling, setIsComprehensiveCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [stats, setStats] = useState<CrawlerStats | null>(null);

  const handleKJVCrawl = async () => {
    setIsKJVCrawling(true);
    setCrawlProgress(0);
    try {
      toast({
        title: "Crawling KJV Bible",
        description: "Processing King James Version texts...",
      });
      
      const interval = setInterval(() => {
        setCrawlProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      await comprehensiveBiblicalCrawler.crawlCompleteBible();
      
      clearInterval(interval);
      setCrawlProgress(100);
      
      toast({
        title: "Success!",
        description: "KJV Bible crawl completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to crawl KJV Bible. Check console for details.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsKJVCrawling(false);
      setCrawlProgress(0);
    }
  };

  const handleFinancialCrawl = async () => {
    setIsFinanceCrawling(true);
    setCrawlProgress(0);
    try {
      toast({
        title: "Analyzing Financial Content",
        description: "Finding ALL financial mentions in the Bible...",
      });

      const interval = setInterval(() => {
        setCrawlProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const crawlStats = await BiblicalFinanceCrawlerService.crawlAllFinancialVerses();
      
      clearInterval(interval);
      setCrawlProgress(100);
      setStats(crawlStats);
      
      toast({
        title: "Success!",
        description: `Found ${crawlStats.financialVerses} financial verses across ${crawlStats.booksProcessed} books!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze financial content. Check console for details.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsFinanceCrawling(false);
      setCrawlProgress(0);
    }
  };

  const handleComprehensiveCrawl = async () => {
    setIsComprehensiveCrawling(true);
    setCrawlProgress(0);
    try {
      toast({
        title: "Comprehensive Crawl Started",
        description: "Processing Hebrew, Aramaic, Greek texts and Strong's Concordance...",
      });

      const interval = setInterval(() => {
        setCrawlProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      await comprehensiveBiblicalCrawler.crawlCompleteBible();
      
      clearInterval(interval);
      setCrawlProgress(100);
      
      toast({
        title: "Success!",
        description: "Comprehensive biblical crawl completed with all original languages!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed comprehensive crawl. Check console for details.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsComprehensiveCrawling(false);
      setCrawlProgress(0);
    }
  };

  const isCrawling = isKJVCrawling || isFinanceCrawling || isComprehensiveCrawling;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <Book className="w-8 h-8 text-purple-400" />
            <Badge variant="outline" className="text-purple-300">KJV</Badge>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">KJV Bible Crawl</h3>
          <p className="text-sm text-gray-400 mb-4">
            Process the complete King James Version with financial keyword detection
          </p>
          <Button 
            onClick={handleKJVCrawl} 
            disabled={isCrawling}
            className="w-full"
          >
            {isKJVCrawling ? 'Crawling...' : 'Start KJV Crawl'}
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <Badge variant="outline" className="text-green-300">Financial</Badge>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Financial Analysis</h3>
          <p className="text-sm text-gray-400 mb-4">
            Find EVERY financial mention across all 66 books of the Bible
          </p>
          <Button 
            onClick={handleFinancialCrawl} 
            disabled={isCrawling}
            className="w-full"
          >
            {isFinanceCrawling ? 'Analyzing...' : 'Find All Financial Verses'}
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-amber-400" />
            <Badge variant="outline" className="text-amber-300">Comprehensive</Badge>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Complete Crawl</h3>
          <p className="text-sm text-gray-400 mb-4">
            Hebrew, Aramaic, Greek texts + Strong's Concordance
          </p>
          <Button 
            onClick={handleComprehensiveCrawl} 
            disabled={isCrawling}
            className="w-full"
          >
            {isComprehensiveCrawling ? 'Processing...' : 'Full Language Crawl'}
          </Button>
        </Card>
      </div>

      {isCrawling && (
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Crawl Progress</span>
              <span className="text-sm text-gray-400">{crawlProgress}%</span>
            </div>
            <Progress value={crawlProgress} className="h-2" />
            <p className="text-xs text-gray-500">
              This may take several minutes depending on data volume...
            </p>
          </div>
        </Card>
      )}

      {stats && (
        <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Crawl Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <div className="text-3xl font-bold text-white">{stats.totalVerses}</div>
              <div className="text-sm text-gray-400">Total Verses</div>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <div className="text-3xl font-bold text-green-400">{stats.financialVerses}</div>
              <div className="text-sm text-gray-400">Financial Verses</div>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">{stats.booksProcessed}</div>
              <div className="text-sm text-gray-400">Books Processed</div>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <div className="text-3xl font-bold text-purple-400">{stats.keywordsExtracted}</div>
              <div className="text-sm text-gray-400">Keywords Found</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BiblicalFinanceCrawler;