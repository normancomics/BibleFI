import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Phone, Globe, Star, Loader2, Church } from 'lucide-react';
import { googlePlacesChurchService, GooglePlacesChurch } from '@/services/googlePlacesChurchService';
import { toast } from 'sonner';

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
  } catch {}
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

interface GooglePlacesChurchSearchProps {
  onChurchSelect?: (church: GooglePlacesChurch) => void;
}

type ChurchWithDistance = GooglePlacesChurch & { distance?: number };

export const GooglePlacesChurchSearch: React.FC<GooglePlacesChurchSearchProps> = ({ onChurchSelect }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<ChurchWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query && !location) {
      toast.error('Please enter a church name or location');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await googlePlacesChurchService.searchChurches({
        query: query || undefined,
        location: location || undefined,
      });
      
      let churches: ChurchWithDistance[] = response.churches;

      // Determine origin for distance sorting
      const origin = location ? await geocodeLocation(location) : await getBrowserLocation();

      if (origin) {
        churches = churches.map(c => ({
          ...c,
          distance: (c.latitude && c.longitude)
            ? haversineDistance(origin.lat, origin.lng, c.latitude, c.longitude)
            : undefined,
        }));
      }

      // Sort: name matches first, then by distance
      const q = query.trim().toLowerCase();
      const isMatch = (c: GooglePlacesChurch) => q && c.name.toLowerCase().includes(q);
      const distSort = (a: ChurchWithDistance, b: ChurchWithDistance) => {
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        if (a.distance != null) return -1;
        if (b.distance != null) return 1;
        return a.name.localeCompare(b.name);
      };

      const matches = churches.filter(c => isMatch(c)).sort(distSort);
      const rest = churches.filter(c => !isMatch(c)).sort(distSort);
      churches = [...matches, ...rest];

      setResults(churches);
      
      if (churches.length === 0) {
        toast.info('No churches found. Try a different search.');
      } else {
        toast.success(`Found ${churches.length} churches${origin ? ' sorted by distance' : ''}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search churches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const searchQueryLower = query.trim().toLowerCase();

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Church className="h-5 w-5 text-primary" />
          Live Church Search
          <Badge variant="secondary" className="ml-2 text-xs">Powered by Google</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Church name (e.g., Baptist, Catholic...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="City, State (e.g., Dallas, TX)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Churches
            </>
          )}
        </Button>

        {/* Results */}
        {hasSearched && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {results.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Church className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No churches found</p>
                  <p className="text-sm">Try searching for a different location or denomination</p>
                </div>
              )}
              
              {results.map((church) => {
                const isNameMatch = searchQueryLower && church.name.toLowerCase().includes(searchQueryLower);
                return (
                  <Card 
                    key={church.id}
                    className={`cursor-pointer hover:border-primary/50 transition-colors ${
                      isNameMatch ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => onChurchSelect?.(church)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate flex items-center gap-2">
                            {church.name}
                            {isNameMatch && (
                              <Badge className="bg-primary/20 text-primary text-xs">Match</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{church.address}</span>
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {church.distance != null && (
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {church.distance < 1 ? '<1 mi' : `${Math.round(church.distance)} mi`}
                              </Badge>
                            )}
                            {church.rating && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                {church.rating.toFixed(1)} ({church.reviewCount || 0})
                              </Badge>
                            )}
                            {church.phone && (
                              <Badge variant="outline" className="text-xs">
                                <Phone className="h-3 w-3 mr-1" />
                                {church.phone}
                              </Badge>
                            )}
                            {church.website && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Website
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
                          Verified
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
