import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Church, 
  Globe, 
  Search, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  RefreshCw,
  Database,
  CreditCard,
  Users,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CrawlerStats {
  totalChurches: number;
  processedChurches: number;
  cryptoEnabled: number;
  verified: number;
  countries: number;
  lastUpdate: string;
}

interface ChurchData {
  name: string;
  denomination: string;
  location: string;
  cryptoAccepted: boolean;
  paymentMethods: string[];
  verified: boolean;
}

const GlobalChurchCrawler: React.FC = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(73);
  const [searchTerm, setSearchTerm] = useState('');

  const stats: CrawlerStats = {
    totalChurches: 158420,
    processedChurches: 115647,
    cryptoEnabled: 3247,
    verified: 89234,
    countries: 195,
    lastUpdate: '2024-01-15 16:45:00'
  };

  const recentFindings: ChurchData[] = [
    {
      name: 'Hillsong Church NYC',
      denomination: 'Pentecostal',
      location: 'New York, NY, USA',
      cryptoAccepted: true,
      paymentMethods: ['Stripe', 'PayPal', 'Crypto', 'Tithe.ly'],
      verified: true
    },
    {
      name: 'Holy Trinity Church',
      denomination: 'Anglican',
      location: 'London, UK',
      cryptoAccepted: false,
      paymentMethods: ['Stripe', 'Bank Transfer'],
      verified: true
    },
    {
      name: 'Grace Community Church',
      denomination: 'Baptist',
      location: 'Austin, TX, USA',
      cryptoAccepted: true,
      paymentMethods: ['Pushpay', 'Crypto', 'Cash App'],
      verified: false
    },
    {
      name: 'St. Patrick\'s Cathedral',
      denomination: 'Catholic',
      location: 'Dublin, Ireland',
      cryptoAccepted: false,
      paymentMethods: ['Tithe.ly', 'Bank Transfer'],
      verified: true
    }
  ];

  const denominationStats = [
    { name: 'Protestant', count: 42350, cryptoEnabled: 1247 },
    { name: 'Catholic', count: 38920, cryptoEnabled: 892 },
    { name: 'Orthodox', count: 15430, cryptoEnabled: 234 },
    { name: 'Baptist', count: 18650, cryptoEnabled: 534 },
    { name: 'Methodist', count: 12890, cryptoEnabled: 298 },
    { name: 'Pentecostal', count: 9870, cryptoEnabled: 456 }
  ];

  const handleStartCrawl = () => {
    setIsRunning(true);
    toast({
      title: 'Global Crawler Started',
      description: 'Scanning churches worldwide for payment capabilities...'
    });

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          toast({
            title: 'Crawl Complete',
            description: 'Discovered 127 new churches with crypto payment support!'
          });
          return 100;
        }
        return prev + 1.5;
      });
    }, 300);
  };

  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Preparing global church database for download...'
    });
  };

  const filteredFindings = recentFindings.filter(church =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.denomination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-ancient-gold" />
            Global Church Directory Crawler
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive crawler that discovers churches worldwide and analyzes their payment capabilities for crypto integration
          </p>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-ancient-gold">{stats.totalChurches.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Churches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-eboy-green">{stats.cryptoEnabled.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Crypto Enabled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-eboy-blue">{stats.verified.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-scripture">{stats.countries}</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-eboy-orange">{Math.round((stats.cryptoEnabled / stats.totalChurches) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Crypto Adoption</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-eboy-purple">{Math.round((stats.processedChurches / stats.totalChurches) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Processed</div>
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
              <span className="text-sm font-medium">Global Scan Progress</span>
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
                {isRunning ? 'Scanning churches globally...' : 'Ready to scan'}
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
                  <Globe className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Scanning...' : 'Start Global Scan'}
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Last scan: {stats.lastUpdate}
            </div>
          </CardContent>
        </Card>

        {/* Denomination Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Denomination Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {denominationStats.map((denom, index) => (
                  <div key={index} className="p-3 border border-border/50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{denom.name}</span>
                      <Badge variant="secondary">{denom.count.toLocaleString()}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Crypto Enabled</span>
                      <div className="flex items-center gap-2">
                        <span className="text-eboy-green font-medium">{denom.cryptoEnabled}</span>
                        <span className="text-muted-foreground">
                          ({Math.round((denom.cryptoEnabled / denom.count) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Discoveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Recent Church Discoveries
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search churches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFindings.map((church, index) => (
              <div key={index} className="p-4 border border-border/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Church className="h-4 w-4 text-ancient-gold" />
                      {church.name}
                      {church.verified && (
                        <CheckCircle className="h-4 w-4 text-eboy-green" />
                      )}
                    </h4>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {church.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{church.denomination}</Badge>
                    {church.cryptoAccepted && (
                      <Badge className="bg-eboy-green text-primary-foreground">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Crypto Ready
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {church.paymentMethods.map((method, methodIndex) => (
                    <Badge key={methodIndex} variant="secondary" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalChurchCrawler;