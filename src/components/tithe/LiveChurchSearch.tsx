import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Globe, Mail, Phone, Bitcoin, Star } from 'lucide-react';
import { LiveChurchSearchService, type LiveChurchResult } from '@/services/liveChurchSearchService';
import { useToast } from '@/hooks/use-toast';

interface LiveChurchSearchProps {
  onChurchSelect: (church: any) => void;
}

const LiveChurchSearch: React.FC<LiveChurchSearchProps> = ({ onChurchSelect }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [searchResults, setSearchResults] = useState<LiveChurchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !city.trim() && !state.trim()) {
      toast({
        title: "Enter Search Criteria",
        description: "Please enter church name, city, or state",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await LiveChurchSearchService.searchChurches({
        query: searchQuery,
        city: city,
        state: state,
        limit: 50
      });
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results Found",
          description: "Try different search terms or add your church to our database",
        });
      } else {
        toast({
          title: "Churches Found",
          description: `Found ${results.length} matching churches`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Church name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Input
          type="text"
          placeholder="City (e.g., Mount Dora)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Input
          type="text"
          placeholder="State (e.g., Florida)"
          value={state}
          onChange={(e) => setState(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSearch} disabled={isSearching} className="flex-1">
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? 'Searching...' : 'Search Churches'}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {searchResults.map((church) => (
            <Card 
              key={church.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onChurchSelect(church)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div>
                      <h3 className="font-medium">{church.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {church.city}, {church.state_province || church.country}
                      </p>
                      {church.denomination && (
                        <p className="text-xs text-muted-foreground">{church.denomination}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {church.accepts_crypto && (
                        <Badge variant="secondary" className="text-xs">
                          <Bitcoin size={12} className="mr-1" />
                          Crypto
                        </Badge>
                      )}
                      {church.verified && (
                        <Badge variant="default" className="text-xs">Verified</Badge>
                      )}
                      {church.rating && church.rating > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {church.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-xs">
                      {church.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe size={14} />
                          <a 
                            href={church.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {church.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone size={14} />
                          <span>{church.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveChurchSearch;
