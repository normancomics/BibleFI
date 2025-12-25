import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Phone, Globe, Star, Loader2, Church } from 'lucide-react';
import { googlePlacesChurchService, GooglePlacesChurch } from '@/services/googlePlacesChurchService';
import { toast } from 'sonner';

interface GooglePlacesChurchSearchProps {
  onChurchSelect?: (church: GooglePlacesChurch) => void;
}

export const GooglePlacesChurchSearch: React.FC<GooglePlacesChurchSearchProps> = ({ onChurchSelect }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<GooglePlacesChurch[]>([]);
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
      
      setResults(response.churches);
      
      if (response.churches.length === 0) {
        toast.info('No churches found. Try a different search.');
      } else {
        toast.success(`Found ${response.churches.length} churches`);
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
              
              {results.map((church) => (
                <Card 
                  key={church.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => onChurchSelect?.(church)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{church.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{church.address}</span>
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
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
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
