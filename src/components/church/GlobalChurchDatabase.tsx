import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Plus, 
  Download,
  RefreshCw,
  Church,
  Verified,
  Bitcoin
} from 'lucide-react';
import { GlobalChurchCrawlerService, GlobalChurchData, ChurchCrawlerStats } from '@/services/globalChurchCrawler';
import { useToast } from '@/hooks/use-toast';
import AddChurchForm from '@/components/tithe/AddChurchForm';

const GlobalChurchDatabase: React.FC = () => {
  const { toast } = useToast();
  const [churches, setChurches] = useState<GlobalChurchData[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<GlobalChurchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [cryptoFilter, setCryptoFilter] = useState<string>('');
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [stats, setStats] = useState<ChurchCrawlerStats>({
    totalChurches: 0,
    cryptoEnabled: 0,
    verified: 0,
    countriesCount: 0,
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    loadChurches();
  }, []);

  useEffect(() => {
    filterChurches();
  }, [churches, searchQuery, selectedCountry, cryptoFilter]);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const churchData = await GlobalChurchCrawlerService.getCryptoEnabledChurches();
      setChurches(churchData);
      
      // Calculate stats
      const uniqueCountries = new Set(churchData.map(c => c.country));
      setStats({
        totalChurches: churchData.length,
        cryptoEnabled: churchData.filter(c => c.accepts_crypto).length,
        verified: churchData.filter(c => c.verified).length,
        countriesCount: uniqueCountries.size,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading churches:', error);
      toast({
        title: "Error",
        description: "Failed to load church database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startCrawl = async () => {
    try {
      setCrawlProgress(0);
      toast({
        title: "Starting Global Church Crawl",
        description: "Scanning worldwide Christian church databases...",
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setCrawlProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const crawlStats = await GlobalChurchCrawlerService.crawlGlobalChurches();
      
      clearInterval(progressInterval);
      setCrawlProgress(100);
      
      setStats(crawlStats);
      await loadChurches();
      
      toast({
        title: "Church Database Updated",
        description: `Found ${crawlStats.totalChurches} churches across ${crawlStats.countriesCount} countries`,
      });
    } catch (error) {
      console.error('Error during crawl:', error);
      toast({
        title: "Crawl Failed",
        description: "Failed to update church database",
        variant: "destructive",
      });
    }
  };

  const filterChurches = () => {
    let filtered = churches;

    if (searchQuery) {
      filtered = filtered.filter(church =>
        church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.denomination?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(church => church.country === selectedCountry);
    }

    if (cryptoFilter === 'crypto') {
      filtered = filtered.filter(church => church.accepts_crypto);
    } else if (cryptoFilter === 'verified') {
      filtered = filtered.filter(church => church.verified);
    }

    setFilteredChurches(filtered);
  };

  const getUniqueCountries = () => {
    const countries = [...new Set(churches.map(church => church.country))];
    return countries.sort();
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredChurches, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bible-fi-churches-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Data Exported",
      description: `Exported ${filteredChurches.length} church records`,
    });
  };

  const handleChurchAdded = () => {
    loadChurches();
    setIsAddDialogOpen(false);
    toast({
      title: "Church Added",
      description: "Thank you for contributing to our global church database!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-ancient-gold mx-auto mb-4" />
          <p className="text-white/80">Loading global church database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-royal-purple/30 border-ancient-gold/30">
          <CardContent className="p-4 text-center">
            <Church className="w-8 h-8 text-ancient-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalChurches.toLocaleString()}</p>
            <p className="text-xs text-white/60">Total Churches</p>
          </CardContent>
        </Card>
        
        <Card className="bg-royal-purple/30 border-ancient-gold/30">
          <CardContent className="p-4 text-center">
            <Bitcoin className="w-8 h-8 text-ancient-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.cryptoEnabled.toLocaleString()}</p>
            <p className="text-xs text-white/60">Crypto Enabled</p>
          </CardContent>
        </Card>
        
        <Card className="bg-royal-purple/30 border-ancient-gold/30">
          <CardContent className="p-4 text-center">
            <Verified className="w-8 h-8 text-ancient-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.verified.toLocaleString()}</p>
            <p className="text-xs text-white/60">Verified</p>
          </CardContent>
        </Card>
        
        <Card className="bg-royal-purple/30 border-ancient-gold/30">
          <CardContent className="p-4 text-center">
            <Globe className="w-8 h-8 text-ancient-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.countriesCount}</p>
            <p className="text-xs text-white/60">Countries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="bg-scripture/40 border border-ancient-gold/50">
          <TabsTrigger value="search" className="data-[state=active]:bg-purple-900/70">
            Search Churches
          </TabsTrigger>
          <TabsTrigger value="crawler" className="data-[state=active]:bg-purple-900/70">
            Data Crawler
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-900/70">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
              <Input
                placeholder="Search churches by name, city, or denomination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-royal-purple/30 border-ancient-gold/50 text-white"
              />
            </div>
            
            <Select value={selectedCountry || "all"} onValueChange={(v) => setSelectedCountry(v === "all" ? "" : v)}>
              <SelectTrigger className="w-48 bg-royal-purple/30 border-ancient-gold/50">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {getUniqueCountries().map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={cryptoFilter || "all"} onValueChange={(v) => setCryptoFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-48 bg-royal-purple/30 border-ancient-gold/50">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Churches</SelectItem>
                <SelectItem value="crypto">Crypto Accepting</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-ancient-gold text-royal-purple hover:bg-ancient-gold/80">
                  <Plus size={16} className="mr-2" />
                  Add Your Church
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-royal-purple border-ancient-gold">
                <DialogHeader>
                  <DialogTitle className="text-ancient-gold">Add Church to Global Database</DialogTitle>
                </DialogHeader>
                <AddChurchForm onComplete={handleChurchAdded} />
              </DialogContent>
            </Dialog>

            <Button onClick={handleExportData} variant="outline" className="border-ancient-gold text-ancient-gold">
              <Download size={16} className="mr-2" />
              Export Data
            </Button>

            <Button onClick={loadChurches} variant="outline" className="border-ancient-gold text-ancient-gold">
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>

          {/* Church List */}
          <div className="grid gap-4">
            {filteredChurches.length === 0 ? (
              <Card className="bg-royal-purple/30 border-ancient-gold/30">
                <CardContent className="p-8 text-center">
                  <Church className="w-16 h-16 text-ancient-gold/50 mx-auto mb-4" />
                  <p className="text-white/80 mb-4">No churches found matching your criteria.</p>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-ancient-gold text-royal-purple hover:bg-ancient-gold/80">
                        <Plus size={16} className="mr-2" />
                        Add the First Church
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              filteredChurches.map((church) => (
                <Card key={church.id} className="bg-royal-purple/30 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-ancient-gold flex items-center gap-2">
                          {church.name}
                          {church.verified && <Verified className="w-5 h-5 text-green-400" />}
                        </h3>
                        <p className="text-white/80">{church.denomination}</p>
                      </div>
                      <div className="flex gap-2">
                        {church.accepts_crypto && (
                          <Badge className="bg-green-900/30 text-green-400 border-green-500">
                            <Bitcoin size={12} className="mr-1" />
                            Crypto
                          </Badge>
                        )}
                        {church.verified && (
                          <Badge className="bg-blue-900/30 text-blue-400 border-blue-500">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/70">
                          <MapPin size={16} />
                          <span>{church.city}, {church.country}</span>
                        </div>
                        {church.phone && (
                          <div className="flex items-center gap-2 text-white/70">
                            <Phone size={16} />
                            <span>{church.phone}</span>
                          </div>
                        )}
                        {church.email && (
                          <div className="flex items-center gap-2 text-white/70">
                            <Mail size={16} />
                            <span>{church.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {church.website && (
                          <div className="flex items-center gap-2 text-white/70">
                            <Globe size={16} />
                            <a 
                              href={church.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-ancient-gold hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                        {church.pastor_name && (
                          <p className="text-white/70">Pastor: {church.pastor_name}</p>
                        )}
                        {church.crypto_networks && church.crypto_networks.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {church.crypto_networks.map(network => (
                              <Badge key={network} variant="outline" className="text-xs">
                                {network}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="crawler" className="space-y-6">
          <Card className="bg-royal-purple/30 border-ancient-gold/30">
            <CardHeader>
              <CardTitle className="text-ancient-gold">Global Church Data Crawler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80">
                Our advanced crawling system continuously scans global Christian church databases,
                denominational directories, and official religious organization websites to maintain
                the most comprehensive database of Christian churches worldwide.
              </p>
              
              {crawlProgress > 0 && crawlProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Crawling Progress</span>
                    <span className="text-ancient-gold">{Math.round(crawlProgress)}%</span>
                  </div>
                  <div className="w-full bg-royal-purple/50 rounded-full h-2">
                    <div 
                      className="bg-ancient-gold h-2 rounded-full transition-all duration-500"
                      style={{ width: `${crawlProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <Button 
                onClick={startCrawl} 
                disabled={crawlProgress > 0 && crawlProgress < 100}
                className="bg-ancient-gold text-royal-purple hover:bg-ancient-gold/80"
              >
                <RefreshCw size={16} className="mr-2" />
                Start Global Crawl
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-royal-purple/30 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold">Crypto Adoption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Crypto Accepting</span>
                    <span className="text-ancient-gold">{Math.round((stats.cryptoEnabled / stats.totalChurches) * 100)}%</span>
                  </div>
                  <div className="w-full bg-royal-purple/50 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.cryptoEnabled / stats.totalChurches) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-royal-purple/30 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold">Verification Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Verified Churches</span>
                    <span className="text-ancient-gold">{Math.round((stats.verified / stats.totalChurches) * 100)}%</span>
                  </div>
                  <div className="w-full bg-royal-purple/50 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(stats.verified / stats.totalChurches) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalChurchDatabase;