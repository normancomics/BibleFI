import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  Globe, 
  TrendingUp, 
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink
} from 'lucide-react';
import PixelButton from '@/components/PixelButton';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { ChurchPaymentProcessorService, ChurchPaymentProcessor } from '@/services/churchPaymentProcessors';
import { BiblicalFinanceCrawlerService, CrawlerStats } from '@/services/biblicalFinanceCrawler';
import { GlobalChurchCrawlerService, ChurchCrawlerStats } from '@/services/globalChurchCrawler';

const ChurchPaymentProcessorDashboard: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  
  const [processors] = useState<ChurchPaymentProcessor[]>(ChurchPaymentProcessorService.getProcessors());
  const [selectedProcessor, setSelectedProcessor] = useState<string>('');
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [isCrawlingBible, setIsCrawlingBible] = useState(false);
  const [isCrawlingChurches, setIsCrawlingChurches] = useState(false);
  const [crawlerStats, setCrawlerStats] = useState<CrawlerStats | null>(null);
  const [churchStats, setChurchStats] = useState<ChurchCrawlerStats | null>(null);

  const getProcessorIcon = (type: string) => {
    switch (type) {
      case 'tithe_ly':
      case 'pushpay':
      case 'givelify':
      case 'planning_center':
        return <Building2 className="h-5 w-5" />;
      case 'stripe':
      case 'square':
        return <CreditCard className="h-5 w-5" />;
      case 'daimo':
      case 'superfluid':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const handleTestPayment = async () => {
    if (!selectedProcessor) {
      toast({
        title: "No Processor Selected",
        description: "Please select a payment processor to test",
        variant: "destructive"
      });
      return;
    }

    setIsTestingPayment(true);
    playSound('coin');

    try {
      const result = await ChurchPaymentProcessorService.processPayment(
        selectedProcessor,
        10.00, // Test amount
        'USD',
        'test_church_id',
        { name: 'Test User', email: 'test@example.com' },
        'card'
      );

      if (result.success) {
        playSound('success');
        toast({
          title: "Test Payment Successful",
          description: `Transaction ID: ${result.transactionId}`,
        });
      } else {
        playSound('error');
        toast({
          title: "Test Payment Failed",
          description: result.error || "Payment processor test failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      playSound('error');
      toast({
        title: "Test Error",
        description: "Failed to test payment processor",
        variant: "destructive"
      });
    } finally {
      setIsTestingPayment(false);
    }
  };

  const handleBiblicalCrawl = async () => {
    setIsCrawlingBible(true);
    playSound('scroll');

    try {
      const stats = await BiblicalFinanceCrawlerService.crawlAllFinancialVerses();
      setCrawlerStats(stats);
      
      playSound('success');
      toast({
        title: "Biblical Finance Crawl Complete",
        description: `Found ${stats.financialVerses} financial verses from ${stats.totalVerses} total verses`,
      });
    } catch (error) {
      playSound('error');
      toast({
        title: "Crawl Failed",
        description: "Failed to crawl biblical financial verses",
        variant: "destructive"
      });
    } finally {
      setIsCrawlingBible(false);
    }
  };

  const handleChurchCrawl = async () => {
    setIsCrawlingChurches(true);
    playSound('scroll');

    try {
      const stats = await GlobalChurchCrawlerService.crawlGlobalChurches();
      setChurchStats(stats);
      
      playSound('success');
      toast({
        title: "Global Church Crawl Complete",
        description: `Added ${stats.totalChurches} churches from ${stats.countriesCount} countries`,
      });
    } catch (error) {
      playSound('error');
      toast({
        title: "Crawl Failed",
        description: "Failed to crawl global church data",
        variant: "destructive"
      });
    } finally {
      setIsCrawlingChurches(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-ancient-gold to-scripture bg-clip-text text-transparent">
          Bible.Fi Payment Processor Dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage church payment processors, crawl biblical financial wisdom, and build the global church directory
        </p>
      </div>

      <Tabs defaultValue="processors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="processors">Payment Processors</TabsTrigger>
          <TabsTrigger value="bible-crawl">Bible Crawler</TabsTrigger>
          <TabsTrigger value="church-crawl">Church Crawler</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="processors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processors.map((processor) => (
              <Card 
                key={processor.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedProcessor === processor.id ? 'ring-2 ring-ancient-gold' : ''
                }`}
                onClick={() => setSelectedProcessor(processor.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getProcessorIcon(processor.type)}
                    {processor.name}
                    {processor.churchSpecific && (
                      <Badge variant="secondary">Church</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {processor.supportedCurrencies.slice(0, 4).map(currency => (
                      <Badge key={currency} variant="outline" className="text-xs">
                        {currency}
                      </Badge>
                    ))}
                    {processor.supportedCurrencies.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{processor.supportedCurrencies.length - 4}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Fee: {processor.fees.percentage ? `${processor.fees.percentage}%` : ''} 
                      {processor.fees.fixed ? ` + $${processor.fees.fixed}` : ''}
                      {processor.fees.crypto ? `${processor.fees.crypto}% crypto` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {processor.features.slice(0, 2).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ready to integrate</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedProcessor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Setup Instructions: {processors.find(p => p.id === selectedProcessor)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {ChurchPaymentProcessorService.getSetupInstructions(selectedProcessor).map((instruction, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                      <span className="text-sm">{instruction}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <PixelButton 
                    onClick={handleTestPayment}
                    disabled={isTestingPayment}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {isTestingPayment ? 'Testing...' : 'Test Payment'}
                  </PixelButton>
                  
                  <PixelButton 
                    variant="outline"
                    onClick={() => window.open(processors.find(p => p.id === selectedProcessor)?.apiEndpoint, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    API Docs
                  </PixelButton>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bible-crawl" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Biblical Financial Verse Crawler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Crawl the entire Bible for verses related to money, tithing, lending, borrowing, taxes, 
                stewardship, and all financial concepts with DeFi applications.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ancient-gold">31,102</div>
                  <div className="text-sm text-muted-foreground">Total Bible Verses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-scripture">2,300+</div>
                  <div className="text-sm text-muted-foreground">Financial Verses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ancient-gold">16</div>
                  <div className="text-sm text-muted-foreground">Wisdom Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-scripture">100+</div>
                  <div className="text-sm text-muted-foreground">Financial Keywords</div>
                </div>
              </div>

              {crawlerStats && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Last Crawl Results:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>Verses Processed: {crawlerStats.totalVerses}</div>
                    <div>Financial Verses: {crawlerStats.financialVerses}</div>
                    <div>Books Processed: {crawlerStats.booksProcessed}</div>
                    <div>Categories: {crawlerStats.categoriesFound}</div>
                  </div>
                </div>
              )}

              <PixelButton 
                onClick={handleBiblicalCrawl}
                disabled={isCrawlingBible}
                className="w-full flex items-center justify-center gap-2"
              >
                {isCrawlingBible ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Crawling Biblical Verses...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Start Biblical Finance Crawl
                  </>
                )}
              </PixelButton>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="church-crawl" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Global Church Directory Crawler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Build a comprehensive global directory of churches with payment method support, 
                crypto capabilities, and tech assistance information.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ancient-gold">350,000+</div>
                  <div className="text-sm text-muted-foreground">Global Churches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-scripture">195</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ancient-gold">25+</div>
                  <div className="text-sm text-muted-foreground">Denominations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-scripture">30%</div>
                  <div className="text-sm text-muted-foreground">Crypto Ready</div>
                </div>
              </div>

              {churchStats && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Last Crawl Results:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>Churches Added: {churchStats.totalChurches}</div>
                    <div>Countries: {churchStats.countriesCount}</div>
                    <div>Verified: {churchStats.verified}</div>
                    <div>Crypto Enabled: {churchStats.cryptoEnabled}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium">Data Sources:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Badge variant="outline" className="justify-center">Google Places API</Badge>
                  <Badge variant="outline" className="justify-center">Church Finder APIs</Badge>
                  <Badge variant="outline" className="justify-center">Denominational Databases</Badge>
                </div>
              </div>

              <PixelButton 
                onClick={handleChurchCrawl}
                disabled={isCrawlingChurches}
                className="w-full flex items-center justify-center gap-2"
              >
                {isCrawlingChurches ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Crawling Global Churches...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Start Global Church Crawl
                  </>
                )}
              </PixelButton>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bible.fi DApp Launch Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Phase 1: Foundation (Completed)</h4>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Bible.fi DApp architecture</li>
                      <li>• Base chain integration</li>
                      <li>• Wallet connections (Coinbase, Rainbow, WalletConnect)</li>
                      <li>• Farcaster miniapp integration</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-ancient-gold mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="font-semibold">Phase 2: Payment Infrastructure (In Progress)</h4>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Church payment processor integrations</li>
                      <li>• Fiat to crypto conversion</li>
                      <li>• Superfluid streaming integration</li>
                      <li>• Daimo Pay implementation</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Phase 3: Token Launch Strategy</h4>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Deploy $BIBLE token on Base (avoid existing BIBLE tokens)</li>
                      <li>• Consider $BIBLEFI or $BIFI as alternative ticker</li>
                      <li>• Implement tokenomics with tithing rewards</li>
                      <li>• Cross-chain bridge to Arbitrum and Solana</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Phase 4: Multi-Chain Expansion</h4>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Solana integration for global reach</li>
                      <li>• Arbitrum for lower gas fees</li>
                      <li>• Cross-chain liquidity pools</li>
                      <li>• Universal church directory</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Immediate Next Steps:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">1</Badge>
                    <span>Complete biblical finance verse database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">2</Badge>
                    <span>Integrate Tithe.ly and Pushpay APIs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">3</Badge>
                    <span>Deploy Superfluid streaming for automated tithing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">4</Badge>
                    <span>Create $BIBLEFI token with proper tokenomics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">5</Badge>
                    <span>Launch on Farcaster with viral features</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurchPaymentProcessorDashboard;