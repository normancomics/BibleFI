import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Search, 
  Database, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CrawlerStats {
  totalVerses: number;
  processedVerses: number;
  financeRelated: number;
  categorized: number;
  lastUpdate: string;
}

interface VerseCategory {
  name: string;
  count: number;
  examples: string[];
  color: string;
}

const BiblicalFinanceCrawler: React.FC = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(85);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  const stats: CrawlerStats = {
    totalVerses: 31102,
    processedVerses: 26437,
    financeRelated: 2348,
    categorized: 2156,
    lastUpdate: '2024-01-15 14:30:00'
  };

  const categories: VerseCategory[] = [
    {
      name: 'Tithing & Giving',
      count: 287,
      examples: ['Malachi 3:10', 'Matthew 23:23', '2 Corinthians 9:7'],
      color: 'bg-scripture'
    },
    {
      name: 'Lending & Borrowing',
      count: 156,
      examples: ['Proverbs 22:7', 'Luke 6:35', 'Deuteronomy 15:6'],
      color: 'bg-ancient-gold'
    },
    {
      name: 'Wealth & Poverty',
      count: 423,
      examples: ['Proverbs 30:8-9', '1 Timothy 6:10', 'Luke 12:15'],
      color: 'bg-eboy-green'
    },
    {
      name: 'Stewardship',
      count: 198,
      examples: ['Luke 16:10-11', 'Matthew 25:14-30', '1 Corinthians 4:2'],
      color: 'bg-eboy-blue'
    },
    {
      name: 'Work & Wages',
      count: 234,
      examples: ['2 Thessalonians 3:10', 'Luke 10:7', 'Colossians 3:23'],
      color: 'bg-eboy-orange'
    },
    {
      name: 'Taxes & Government',
      count: 89,
      examples: ['Matthew 22:21', 'Romans 13:7', 'Mark 12:17'],
      color: 'bg-eboy-purple'
    },
    {
      name: 'Business & Trade',
      count: 145,
      examples: ['Proverbs 31:16', 'Ecclesiastes 11:1', 'Luke 19:13'],
      color: 'bg-eboy-pink'
    },
    {
      name: 'Debt & Credit',
      count: 67,
      examples: ['Romans 13:8', 'Proverbs 6:1-5', 'Matthew 6:12'],
      color: 'bg-eboy-cyan'
    }
  ];

  const recentFindings = [
    {
      verse: 'Proverbs 21:5',
      text: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
      category: 'Wealth & Poverty',
      relevance: 95
    },
    {
      verse: 'Matthew 6:24',
      text: 'No one can serve two masters. Either you will hate the one and love the other...',
      category: 'Stewardship',
      relevance: 92
    },
    {
      verse: 'Ecclesiastes 5:10',
      text: 'Whoever loves money never has enough; whoever loves wealth is never satisfied...',
      category: 'Wealth & Poverty',
      relevance: 89
    },
    {
      verse: 'Luke 14:28',
      text: 'Suppose one of you wants to build a tower. Won\'t you first sit down and estimate the cost...',
      category: 'Business & Trade',
      relevance: 87
    }
  ];

  const handleStartCrawl = () => {
    setIsRunning(true);
    toast({
      title: 'Crawler Started',
      description: 'Biblical finance crawler is now analyzing scripture...'
    });

    // Simulate crawling progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          toast({
            title: 'Crawl Complete',
            description: 'Found 47 new finance-related verses!'
          });
          return 100;
        }
        return prev + 2;
      });
    }, 200);
  };

  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Preparing financial scripture database for download...'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-scripture/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-scripture" />
            Biblical Finance Scripture Crawler
          </CardTitle>
          <p className="text-muted-foreground">
            Advanced AI-powered crawler that identifies and categorizes every Bible verse related to money, finance, and stewardship
          </p>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-scripture">{stats.totalVerses.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Verses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-ancient-gold">{stats.financeRelated.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Finance Related</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-eboy-green">{stats.categorized.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Categorized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-eboy-blue">{Math.round((stats.financeRelated / stats.totalVerses) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Coverage</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crawler Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Crawler Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            <div className="flex items-center gap-2">
              {isRunning ? (
                <Clock className="h-4 w-4 text-eboy-yellow animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 text-eboy-green" />
              )}
              <span className="text-sm">
                {isRunning ? 'Crawling in progress...' : 'Ready to crawl'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleStartCrawl} 
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Crawling...' : 'Start Crawl'}
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Last crawl: {stats.lastUpdate}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Financial Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-border/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${category.color}`}></div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Financial Scripture Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFindings.map((finding, index) => (
              <div key={index} className="p-4 border border-border/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">{finding.verse}</Badge>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs">{finding.category}</Badge>
                    <span className="text-xs text-muted-foreground">{finding.relevance}% relevant</span>
                  </div>
                </div>
                <p className="text-sm italic text-foreground/80">
                  "{finding.text}"
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiblicalFinanceCrawler;