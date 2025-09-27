import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MapPin, 
  Globe, 
  Heart, 
  Plus,
  Check,
  X,
  Filter,
  Star,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Church {
  id: string;
  name: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  country: string;
  continent: string;
  website?: string;
  phone?: string;
  email?: string;
  acceptsCrypto: boolean;
  acceptsFiat: boolean;
  acceptsCards: boolean;
  cryptoAddress?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  jesuscentered: boolean;
  missionStatement?: string;
}

const ComprehensiveChurchDatabase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [filterCrypto, setFilterCrypto] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [isAddingChurch, setIsAddingChurch] = useState(false);
  const { toast } = useToast();

  // Sample comprehensive church data
  useEffect(() => {
    const sampleChurches: Church[] = [
      {
        id: '1',
        name: 'First Baptist Church',
        denomination: 'Baptist',
        address: '123 Main St',
        city: 'Dallas',
        state: 'Texas',
        country: 'United States',
        continent: 'North America',
        website: 'https://firstbaptistdallas.org',
        phone: '+1-214-555-0123',
        email: 'info@firstbaptistdallas.org',
        acceptsCrypto: true,
        acceptsFiat: true,
        acceptsCards: true,
        cryptoAddress: '0x1234...5678',
        verified: true,
        rating: 4.8,
        reviewCount: 245,
        jesuscentered: true,
        missionStatement: 'To glorify God by making disciples of Jesus Christ in Dallas and around the world.'
      },
      {
        id: '2',
        name: 'Christ Church London',
        denomination: 'Anglican',
        address: '456 Westminster Rd',
        city: 'London',
        state: 'England',
        country: 'United Kingdom',
        continent: 'Europe',
        website: 'https://christchurchlondon.org',
        acceptsCrypto: false,
        acceptsFiat: true,
        acceptsCards: true,
        verified: true,
        rating: 4.6,
        reviewCount: 189,
        jesuscentered: true,
        missionStatement: 'Following Jesus Christ and making Him known in London and beyond.'
      },
      {
        id: '3',
        name: 'Grace Community Church',
        denomination: 'Non-denominational',
        address: '789 Elm Street',
        city: 'Sydney',
        state: 'New South Wales',
        country: 'Australia',
        continent: 'Australia',
        acceptsCrypto: true,
        acceptsFiat: true,
        acceptsCards: false,
        cryptoAddress: '0xabcd...efgh',
        verified: false,
        rating: 4.9,
        reviewCount: 312,
        jesuscentered: true,
        missionStatement: 'Loving God, loving people, and making disciples in Sydney.'
      }
    ];
    
    setChurches(sampleChurches);
    setFilteredChurches(sampleChurches);
  }, []);

  // Filter churches based on search and filters
  useEffect(() => {
    let filtered = churches;
    
    if (searchQuery) {
      filtered = filtered.filter(church => 
        church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.denomination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedContinent !== 'all') {
      filtered = filtered.filter(church => church.continent === selectedContinent);
    }
    
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(church => church.country === selectedCountry);
    }
    
    if (filterCrypto) {
      filtered = filtered.filter(church => church.acceptsCrypto);
    }
    
    setFilteredChurches(filtered);
  }, [searchQuery, selectedContinent, selectedCountry, filterCrypto, churches]);

  const continents = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Australia'];
  
  const handleAddChurch = (newChurch: Partial<Church>) => {
    const church: Church = {
      id: Date.now().toString(),
      name: newChurch.name || '',
      denomination: newChurch.denomination || '',
      address: newChurch.address || '',
      city: newChurch.city || '',
      state: newChurch.state || '',
      country: newChurch.country || '',
      continent: newChurch.continent || '',
      website: newChurch.website,
      phone: newChurch.phone,
      email: newChurch.email,
      acceptsCrypto: newChurch.acceptsCrypto || false,
      acceptsFiat: true,
      acceptsCards: newChurch.acceptsCards || false,
      cryptoAddress: newChurch.cryptoAddress,
      verified: false,
      rating: 0,
      reviewCount: 0,
      jesuscentered: true,
      missionStatement: newChurch.missionStatement
    };
    
    setChurches(prev => [...prev, church]);
    setIsAddingChurch(false);
    
    toast({
      title: "Church Added Successfully! ⛪",
      description: "Your church has been submitted for verification.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border-ancient-gold/30 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="text-ancient-gold" />
            Global Christian Church Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search churches, cities, denominations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/50 border-white/20"
              />
            </div>
            
            <Select value={selectedContinent} onValueChange={setSelectedContinent}>
              <SelectTrigger className="w-full md:w-48 bg-black/50 border-white/20">
                <SelectValue placeholder="Continent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Continents</SelectItem>
                {continents.map(continent => (
                  <SelectItem key={continent} value={continent}>{continent}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant={filterCrypto ? "default" : "outline"}
              onClick={() => setFilterCrypto(!filterCrypto)}
              className={filterCrypto ? "bg-scripture" : "border-white/20"}
            >
              <Filter className="w-4 h-4 mr-2" />
              Crypto Ready
            </Button>
            
            <Dialog open={isAddingChurch} onOpenChange={setIsAddingChurch}>
              <DialogTrigger asChild>
                <Button className="bg-ancient-gold text-black hover:bg-ancient-gold/80">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Church
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-black border-ancient-gold/30">
                <DialogHeader>
                  <DialogTitle className="text-ancient-gold">Add Your Church</DialogTitle>
                </DialogHeader>
                <AddChurchForm onSubmit={handleAddChurch} onCancel={() => setIsAddingChurch(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span>Found {filteredChurches.length} churches</span>
            <span>•</span>
            <span>{filteredChurches.filter(c => c.verified).length} verified</span>
            <span>•</span>
            <span>{filteredChurches.filter(c => c.acceptsCrypto).length} crypto-ready</span>
          </div>
        </CardContent>
      </Card>

      {/* Church Grid */}
      <div className="grid gap-4">
        {filteredChurches.map((church) => (
          <Card key={church.id} className="border-white/10 bg-black/40 hover:border-ancient-gold/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{church.name}</h3>
                    {church.verified && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {church.jesuscentered && (
                      <Badge className="bg-scripture/20 text-scripture border-scripture/30">
                        <Heart className="w-3 h-3 mr-1" />
                        Jesus-Centered
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                    <MapPin className="w-4 h-4" />
                    {church.city}, {church.state}, {church.country}
                  </div>
                  
                  <div className="text-sm text-white/60 mb-2">{church.denomination}</div>
                  
                  {church.missionStatement && (
                    <p className="text-sm text-white/80 italic mb-3">"{church.missionStatement}"</p>
                  )}
                </div>
                
                <div className="text-right">
                  {church.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-ancient-gold fill-current" />
                      <span className="text-ancient-gold">{church.rating}</span>
                      <span className="text-white/50 text-xs">({church.reviewCount})</span>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {church.acceptsCrypto && (
                      <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30 text-xs">
                        Crypto Ready
                      </Badge>
                    )}
                    {church.acceptsFiat && (
                      <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                        Fiat
                      </Badge>
                    )}
                    {church.acceptsCards && (
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                        Cards
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-white/60">
                  {church.website && (
                    <a href={church.website} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-1 hover:text-ancient-gold transition-colors">
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {church.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {church.phone}
                    </div>
                  )}
                  {church.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {church.email}
                    </div>
                  )}
                </div>
                
                <Button size="sm" className="bg-scripture hover:bg-scripture/80">
                  Support This Church
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredChurches.length === 0 && (
        <Card className="border-white/10 bg-black/40">
          <CardContent className="p-8 text-center">
            <Building className="w-16 h-16 mx-auto text-white/40 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Churches Found</h3>
            <p className="text-white/60 mb-4">
              We couldn't find any churches matching your criteria. Try adjusting your search or filters.
            </p>
            <Button onClick={() => setIsAddingChurch(true)} className="bg-ancient-gold text-black hover:bg-ancient-gold/80">
              Add the First Church
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AddChurchForm: React.FC<{
  onSubmit: (church: Partial<Church>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Church>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.city && formData.country) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Church Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-black/50 border-white/20"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="denomination">Denomination</Label>
          <Input
            id="denomination"
            value={formData.denomination || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, denomination: e.target.value }))}
            className="bg-black/50 border-white/20"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="bg-black/50 border-white/20"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="bg-black/50 border-white/20"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            value={formData.state || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            className="bg-black/50 border-white/20"
          />
        </div>
        
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            value={formData.country || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="bg-black/50 border-white/20"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="missionStatement">Mission Statement</Label>
        <Textarea
          id="missionStatement"
          value={formData.missionStatement || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, missionStatement: e.target.value }))}
          className="bg-black/50 border-white/20"
          placeholder="Describe how your church follows Jesus Christ and serves the community..."
        />
      </div>
      
      <div className="bg-scripture/10 p-4 rounded border border-scripture/30">
        <h4 className="font-medium text-scripture mb-2">Verification Requirements</h4>
        <ul className="text-sm text-white/80 space-y-1">
          <li>• Church must be centered on Jesus Christ's teachings</li>
          <li>• Must have active congregation and regular services</li>
          <li>• Mission statement must reflect Christian values</li>
          <li>• Must be transparent about financial practices</li>
        </ul>
      </div>
      
      <div className="flex gap-4">
        <Button type="submit" className="flex-1 bg-ancient-gold text-black hover:bg-ancient-gold/80">
          Submit Church
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="border-white/20">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ComprehensiveChurchDatabase;