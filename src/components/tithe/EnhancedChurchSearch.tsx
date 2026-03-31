import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Bitcoin,
  Verified,
  Heart,
  Church as ChurchIcon,
  User,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { comprehensiveChurchService, Church } from '@/services/comprehensiveChurchService';
import { useToast } from '@/hooks/use-toast';
import PixelButton from '@/components/PixelButton';
import { useSound } from '@/contexts/SoundContext';

// Haversine distance in miles
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
  } catch { /* geocoding failure is non-fatal; return null */ }
  return null;
};

const getBrowserLocation = (): Promise<{ lat: number; lng: number } | null> =>
  new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });

interface EnhancedChurchSearchProps {
  onChurchSelect?: (church: Church) => void;
  showTithingButton?: boolean;
}

const EnhancedChurchSearch: React.FC<EnhancedChurchSearchProps> = ({ 
  onChurchSelect, 
  showTithingButton = true 
}) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [cryptoFilter, setCryptoFilter] = useState<string>('');
  const [popularChurches, setPopularChurches] = useState<any>(null);

  // Load popular churches on mount
  useEffect(() => {
    loadPopularChurches();
  }, []);

  const loadPopularChurches = async () => {
    try {
      const popular = await comprehensiveChurchService.getPopularChurches();
      setPopularChurches(popular);
    } catch (error) {
      console.error('Error loading popular churches:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedCity.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a church name or city to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    playSound("click");

    try {
      const result = await comprehensiveChurchService.searchChurches({
        query: searchQuery.trim() || undefined,
        city: selectedCity.trim() || undefined,
        state: selectedState.trim() || undefined,
        country: selectedCountry || undefined,
        acceptsCrypto: cryptoFilter === 'crypto' ? true : undefined,
        verified: cryptoFilter === 'verified' ? true : undefined,
        limit: 50
      });

      let results = result.churches;

      // Determine origin for distance sorting
      const locationParts = [selectedCity, selectedState, selectedCountry].filter(Boolean).join(', ');
      let origin = locationParts ? await geocodeLocation(locationParts) : await getBrowserLocation();

      // Add distance to each church
      if (origin) {
        results = results.map(c => ({
          ...c,
          distance: (c.coordinates?.lat && c.coordinates?.lng) 
            ? haversineDistance(origin!.lat, origin!.lng, c.coordinates.lat, c.coordinates.lng) 
            : undefined,
        }));
      }

      // Sort: name matches first, then by distance
      const query = searchQuery.trim().toLowerCase();
      const isMatch = (c: Church) => query && c.name.toLowerCase().includes(query);
      const distSort = (a: any, b: any) => {
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        if (a.distance != null) return -1;
        if (b.distance != null) return 1;
        return a.name.localeCompare(b.name);
      };

      const matches = results.filter(c => isMatch(c)).sort(distSort);
      const rest = results.filter(c => !isMatch(c)).sort(distSort);
      results = [...matches, ...rest];

      setChurches(results);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} churches${origin ? ' sorted by distance' : ''}`,
      });

      if (results.length === 0) {
        toast({
          title: "No Churches Found",
          description: "Try expanding your search criteria or add a new church to our database",
        });
      }
    } catch (error) {
      console.error('Error searching churches:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search churches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = async (name: string, city: string, state?: string) => {
    setSearchQuery(name);
    setSelectedCity(city);
    if (state) setSelectedState(state);
    
    playSound("select");
    
    // Trigger search
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleChurchClick = (church: Church) => {
    playSound("powerup");
    if (onChurchSelect) {
      onChurchSelect(church);
    }
    
    toast({
      title: "Church Selected",
      description: `Selected ${church.name} in ${church.city}`,
    });
  };

  const getPaymentMethodsBadges = (church: Church) => {
    const badges = [];
    
    if (church.accepts_crypto) {
      badges.push(
        <Badge key="crypto" className="bg-green-900/30 text-green-400 border-green-500">
          <Bitcoin size={12} className="mr-1" />
          Crypto
        </Badge>
      );
    }
    
    if (church.accepts_cards) {
      badges.push(
        <Badge key="cards" className="bg-blue-900/30 text-blue-400 border-blue-500">
          <CreditCard size={12} className="mr-1" />
          Cards
        </Badge>
      );
    }
    
    if (church.accepts_fiat) {
      badges.push(
        <Badge key="fiat" className="bg-purple-900/30 text-purple-400 border-purple-500">
          <DollarSign size={12} className="mr-1" />
          Cash
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="space-y-6">
      {/* Quick Access to Popular Churches */}
      <Card className="bg-royal-purple/30 border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="text-ancient-gold flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Popular Churches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="border-ancient-gold/50 text-white hover:bg-ancient-gold/10"
              onClick={() => handleQuickSearch("The Father's House", "Leesburg", "Florida")}
            >
              The Father's House<br />
              <span className="text-xs opacity-70">Leesburg, FL</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-ancient-gold/50 text-white hover:bg-ancient-gold/10"
              onClick={() => handleQuickSearch("City on the Hill", "Boulder", "Colorado")}
            >
              City on the Hill<br />
              <span className="text-xs opacity-70">Boulder, CO</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-ancient-gold/50 text-white hover:bg-ancient-gold/10"
              onClick={() => handleQuickSearch("The Cross", "Mount Dora", "Florida")}
            >
              The Cross<br />
              <span className="text-xs opacity-70">Mount Dora, FL</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card className="bg-royal-purple/30 border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="text-ancient-gold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Any Christian Church on Earth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Church Name</label>
              <Input
                placeholder="e.g., First Baptist Church"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/30 border-scripture/30 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/70">City</label>
              <Input
                placeholder="e.g., Los Angeles"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-black/30 border-scripture/30 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">State/Province</label>
              <Input
                placeholder="e.g., California"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-black/30 border-scripture/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/70">Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-black/30 border-scripture/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Philippines">Philippines</SelectItem>
                  <SelectItem value="South Korea">South Korea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/70">Filter</label>
              <Select value={cryptoFilter} onValueChange={setCryptoFilter}>
                <SelectTrigger className="bg-black/30 border-scripture/30">
                  <SelectValue placeholder="All Churches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Churches</SelectItem>
                  <SelectItem value="crypto">Accepts Crypto</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <PixelButton
            onClick={handleSearch}
            disabled={loading}
            className="w-full"
            farcasterStyle
          >
            {loading ? "Searching..." : "Search Churches"}
          </PixelButton>
        </CardContent>
      </Card>

      {/* Search Results */}
      {churches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-ancient-gold">
            Found {churches.length} Churches
          </h3>
          
          <div className="grid gap-4">
            {churches.map((church) => {
              const isNameMatch = searchQuery.trim() && church.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
              const distanceMiles = (church as any).distance;
              return (
              <Card 
                key={church.id} 
                className={`bg-royal-purple/30 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all cursor-pointer ${
                  isNameMatch ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleChurchClick(church)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-ancient-gold flex items-center gap-2">
                        {church.name}
                        {church.verified && <Verified className="w-5 h-5 text-green-400" />}
                        {isNameMatch && (
                          <Badge className="bg-primary/20 text-primary text-xs">Match</Badge>
                        )}
                      </h3>
                      <p className="text-white/80">{church.denomination}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {distanceMiles != null && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          <MapPin size={10} className="mr-1" />
                          {distanceMiles < 1 ? '<1 mi' : `${Math.round(distanceMiles)} mi`}
                        </Badge>
                      )}
                      {getPaymentMethodsBadges(church)}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin size={16} />
                        <span>
                          {[church.address, church.city, church.state_province, church.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      
                      {church.pastor_name && (
                        <div className="flex items-center gap-2 text-white/70">
                          <User size={16} />
                          <span>Pastor: {church.pastor_name}</span>
                        </div>
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

                  {showTithingButton && (
                    <div className="mt-4 pt-4 border-t border-ancient-gold/20">
                      <PixelButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChurchClick(church);
                        }}
                        className="w-full"
                        farcasterStyle
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Give to {church.name}
                      </PixelButton>
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChurchSearch;