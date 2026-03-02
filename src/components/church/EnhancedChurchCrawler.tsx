import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, Globe, MapPin, Verified, Bitcoin, CreditCard, 
  Download, Filter, RefreshCw, Church, Users, Heart,
  Phone, Mail, ExternalLink, AlertTriangle, CheckCircle2, Info,
  Bot, BookOpen, Zap, Shield, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GlobalChurchCrawlerService, type GlobalChurchData } from '@/services/globalChurchCrawler';
import AutomationPanel from './AutomationPanel';

/** Haversine distance in miles */
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const geocodeLocation = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
};

/** Calculate data quality score for a church (0-100) */
const getDataQuality = (church: GlobalChurchData) => {
  let score = 0;
  const missing: string[] = [];
  if (church.name) score += 20; else missing.push('Name');
  if (church.website) score += 25; else missing.push('Website');
  if (church.phone) score += 20; else missing.push('Phone');
  if (church.email) score += 10; else missing.push('Email');
  if (church.denomination) score += 10; else missing.push('Denomination');
  if (church.city && church.country) score += 15; else missing.push('Location');
  return { score, missing };
};

const DataQualityBadge: React.FC<{ church: GlobalChurchData }> = ({ church }) => {
  const { score, missing } = getDataQuality(church);
  const color = score >= 80 ? 'text-green-400 border-green-500/40 bg-green-500/10'
    : score >= 50 ? 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10'
    : 'text-red-400 border-red-500/40 bg-red-500/10';
  const Icon = score >= 80 ? CheckCircle2 : score >= 50 ? Info : AlertTriangle;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-xs cursor-help ${color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {score}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">Data Quality: {score}%</p>
          {missing.length > 0 ? (
            <p className="text-xs">Missing: {missing.join(', ')}</p>
          ) : (
            <p className="text-xs">All key fields complete ✓</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const EnhancedChurchCrawler: React.FC = () => {
  const { toast } = useToast();
  const [churches, setChurches] = useState<GlobalChurchData[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<GlobalChurchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [cryptoFilter, setCryptoFilter] = useState<boolean | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    cryptoEnabled: 0,
    verified: 0,
    countries: 0
  });

  useEffect(() => {
    loadChurches();
  }, []);

  useEffect(() => {
    filterChurches();
  }, [churches, searchQuery, selectedCountry, cryptoFilter, origin]);

  const loadChurches = async () => {
    setIsLoading(true);
    try {
      const allChurches = await GlobalChurchCrawlerService.getAllChurches();
      setChurches(allChurches);
      
      // Calculate stats
      const countries = new Set(allChurches.map(c => c.country));
      setStats({
        total: allChurches.length,
        cryptoEnabled: allChurches.filter(c => c.accepts_crypto).length,
        verified: allChurches.filter(c => c.verified).length,
        countries: countries.size
      });
    } catch (error) {
      console.error('Error loading churches:', error);
      toast({
        title: "Error",
        description: "Failed to load church data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCrawl = async () => {
    setIsLoading(true);
    setCrawlProgress(0);
    
    try {
      // Simulate crawl progress
      const progressInterval = setInterval(() => {
        setCrawlProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const crawlStats = await GlobalChurchCrawlerService.crawlGlobalChurches();
      
      clearInterval(progressInterval);
      setCrawlProgress(100);
      
      toast({
        title: "Crawl Completed!",
        description: `Added ${crawlStats.totalChurches} churches from ${crawlStats.countriesCount} countries`,
      });

      // Reload churches after crawl
      await loadChurches();
      
    } catch (error) {
      console.error('Error during crawl:', error);
      toast({
        title: "Crawl Failed",
        description: "Failed to crawl church data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCrawlProgress(0);
    }
  };

  const filterChurches = () => {
    let filtered = churches;

    if (selectedCountry) {
      filtered = filtered.filter(church => church.country === selectedCountry);
    }

    if (cryptoFilter !== null) {
      filtered = filtered.filter(church => church.accepts_crypto === cryptoFilter);
    }

    // Add distance data if origin is available
    type ChurchWithDist = GlobalChurchData & { _distance?: number };
    let withDist: ChurchWithDist[] = filtered.map(c => {
      if (origin && c.coordinates?.lat && c.coordinates?.lng) {
        return { ...c, _distance: haversineDistance(origin.lat, origin.lng, c.coordinates.lat, c.coordinates.lng) };
      }
      return { ...c };
    });

    const distSort = (a: ChurchWithDist, b: ChurchWithDist) => {
      if (a._distance != null && b._distance != null) return a._distance - b._distance;
      if (a._distance != null) return -1;
      if (b._distance != null) return 1;
      return a.name.localeCompare(b.name);
    };

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatches: ChurchWithDist[] = [];
      const locationMatches: ChurchWithDist[] = [];
      const otherMatches: ChurchWithDist[] = [];

      for (const church of withDist) {
        const nameMatch = church.name.toLowerCase().includes(q);
        const cityMatch = church.city.toLowerCase().includes(q);
        const stateMatch = church.state_province?.toLowerCase().includes(q);
        const countryMatch = church.country.toLowerCase().includes(q);
        const denomMatch = church.denomination?.toLowerCase().includes(q);

        if (nameMatch) {
          nameMatches.push(church);
        } else if (cityMatch || stateMatch) {
          locationMatches.push(church);
        } else if (countryMatch || denomMatch) {
          otherMatches.push(church);
        }
      }

      nameMatches.sort(distSort);
      locationMatches.sort(distSort);
      otherMatches.sort(distSort);

      withDist = [...nameMatches, ...locationMatches, ...otherMatches];
    } else {
      withDist = [...withDist].sort(distSort);
    }

    setFilteredChurches(withDist as GlobalChurchData[]);
  };

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) {
      setOrigin(null);
      return;
    }
    setIsGeocodingLocation(true);
    const coords = await geocodeLocation(searchLocation);
    setOrigin(coords);
    setIsGeocodingLocation(false);
    if (coords) {
      toast({ title: "Location set", description: `Sorting by distance from ${searchLocation}` });
    }
  };

  const getUniqueCountries = () => {
    return Array.from(new Set(churches.map(c => c.country))).sort();
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredChurches, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bible-fi-churches.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: `Exported ${filteredChurches.length} churches to JSON file`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Church className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Churches</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.cryptoEnabled.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Crypto Enabled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Verified className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.verified.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.countries}</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Church Database
          </CardTitle>
          <CardDescription>
            Comprehensive database of Christian churches worldwide with crypto payment support
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="search">Search Churches</TabsTrigger>
              <TabsTrigger value="crawl">Data Crawler</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search churches, denominations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Location (e.g., Boulder, CO)"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLocationSearch} disabled={isGeocodingLocation}>
                    {isGeocodingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  className="px-3 py-2 border rounded-md bg-background text-foreground"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {getUniqueCountries().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                
                <select
                  className="px-3 py-2 border rounded-md bg-background text-foreground"
                  value={cryptoFilter === null ? '' : cryptoFilter.toString()}
                  onChange={(e) => setCryptoFilter(
                    e.target.value === '' ? null : e.target.value === 'true'
                  )}
                >
                  <option value="">All Payment Types</option>
                  <option value="true">Crypto Enabled</option>
                  <option value="false">Traditional Only</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredChurches.length} of {churches.length} churches
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadChurches} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Church List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredChurches.map((church, index) => {
                  const isNameMatch = searchQuery && church.name.toLowerCase().includes(searchQuery.toLowerCase());
                  return (
                    <Card key={church.id || index} className={`hover:shadow-md transition-shadow ${isNameMatch ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {isNameMatch && (
                                <Badge variant="default" className="text-xs">
                                  <Search className="h-3 w-3 mr-1" />
                                  Match
                                </Badge>
                              )}
                              <h3 className="font-semibold">{church.name}</h3>
                              <DataQualityBadge church={church} />
                              {church.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Verified className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {church.accepts_crypto && (
                                <Badge variant="default" className="text-xs">
                                  <Bitcoin className="h-3 w-3 mr-1" />
                                  Crypto
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2 flex-wrap">
                                <MapPin className="h-4 w-4" />
                                {church.city}{church.state_province ? `, ${church.state_province}` : ''}, {church.country}
                                {(church as any)._distance != null && (
                                  <Badge variant="outline" className="text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {(church as any)._distance < 1 ? '<1 mi' : `${Math.round((church as any)._distance)} mi`}
                                  </Badge>
                                )}
                              </div>
                              {church.denomination && (
                                <div>{church.denomination}</div>
                              )}
                              {church.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {church.phone}
                                </div>
                              )}
                              {church.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {church.email}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {church.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={church.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            
                            <div className="flex gap-1">
                              {church.accepts_crypto && (
                                <Badge variant="outline" className="text-xs">
                                  <Bitcoin className="h-3 w-3" />
                                </Badge>
                              )}
                              {church.accepts_cards && (
                                <Badge variant="outline" className="text-xs">
                                  <CreditCard className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="crawl" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Church Data Crawler</CardTitle>
                  <CardDescription>
                    Crawl and update the global database of Christian churches
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {crawlProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Crawling churches...</span>
                        <span>{crawlProgress}%</span>
                      </div>
                      <Progress value={crawlProgress} />
                    </div>
                  )}
                  
                  <Button 
                    onClick={startCrawl} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Start Global Church Crawl
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>This will crawl and update church data from:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Church directory APIs</li>
                      <li>Denomination websites</li>
                      <li>Local church databases</li>
                      <li>Community submissions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <AutomationPanel />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Crypto Adoption
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Crypto Enabled</span>
                        <span>{((stats.cryptoEnabled / stats.total) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(stats.cryptoEnabled / stats.total) * 100} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Verification Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Verified</span>
                        <span>{((stats.verified / stats.total) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(stats.verified / stats.total) * 100} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedChurchCrawler;