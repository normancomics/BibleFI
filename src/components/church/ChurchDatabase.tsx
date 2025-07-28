import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Phone, Globe, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Church {
  id: string;
  name: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  website?: string;
  walletAddress?: string;
  verified: boolean;
  memberCount?: number;
  acceptsCrypto: boolean;
  supportedTokens: string[];
}

const mockChurches: Church[] = [
  {
    id: '1',
    name: 'First Baptist Church of Dallas',
    denomination: 'Baptist',
    address: '1707 San Jacinto St',
    city: 'Dallas',
    state: 'TX',
    country: 'USA',
    phone: '+1-214-969-0111',
    website: 'https://firstdallas.org',
    walletAddress: '0x742d35Cc6635C0532925a3b8D4a3Ca8e20F1e4b',
    verified: true,
    memberCount: 12000,
    acceptsCrypto: true,
    supportedTokens: ['USDC', 'USDT', 'DAI', 'ETH']
  },
  {
    id: '2',
    name: 'Hillsong Church',
    denomination: 'Pentecostal',
    address: 'Multiple Locations',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    website: 'https://hillsong.com',
    verified: true,
    memberCount: 15000,
    acceptsCrypto: false,
    supportedTokens: []
  },
  {
    id: '3',
    name: 'Christ Fellowship Church',
    denomination: 'Non-denominational',
    address: '5343 Northlake Blvd',
    city: 'Palm Beach Gardens',
    state: 'FL',
    country: 'USA',
    phone: '+1-561-799-7600',
    website: 'https://christfellowship.church',
    walletAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    verified: true,
    memberCount: 8000,
    acceptsCrypto: true,
    supportedTokens: ['USDC', 'DAI', 'FRAX']
  }
];

export const ChurchDatabase = () => {
  const [churches, setChurches] = useState<Church[]>(mockChurches);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDenomination, setSelectedDenomination] = useState('');
  const [showAddChurch, setShowAddChurch] = useState(false);
  const { toast } = useToast();

  const filteredChurches = churches.filter(church => {
    const matchesSearch = church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         church.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         church.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDenomination = !selectedDenomination || church.denomination === selectedDenomination;
    return matchesSearch && matchesDenomination;
  });

  const denominations = [...new Set(churches.map(church => church.denomination))];

  const handleAddChurch = () => {
    toast({
      title: "Church Submission",
      description: "Your church has been submitted for verification. We'll review and add it within 24 hours.",
      duration: 5000,
    });
    setShowAddChurch(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Global Church Directory</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find churches worldwide that accept digital tithes and offerings. Help build God's kingdom through modern giving.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search churches by name, city, or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={selectedDenomination}
          onChange={(e) => setSelectedDenomination(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Denominations</option>
          {denominations.map(denom => (
            <option key={denom} value={denom}>{denom}</option>
          ))}
        </select>
        <Dialog open={showAddChurch} onOpenChange={setShowAddChurch}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Add Church
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Your Church</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Church Name" />
              <Input placeholder="Denomination" />
              <Input placeholder="Address" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="City" />
                <Input placeholder="State/Province" />
              </div>
              <Input placeholder="Country" />
              <Input placeholder="Phone (optional)" />
              <Input placeholder="Website (optional)" />
              <Input placeholder="Crypto Wallet Address (optional)" />
              <Button onClick={handleAddChurch} className="w-full">
                Submit for Verification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Church Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChurches.map((church) => (
          <Card key={church.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{church.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {church.denomination}
                  </Badge>
                </div>
                {church.verified && (
                  <Badge variant="default" className="bg-green-600">
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{church.city}, {church.state}, {church.country}</span>
              </div>
              
              {church.memberCount && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{church.memberCount.toLocaleString()} members</span>
                </div>
              )}

              {church.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{church.phone}</span>
                </div>
              )}

              {church.website && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="w-4 h-4 mr-2" />
                  <a href={church.website} target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline">
                    Visit Website
                  </a>
                </div>
              )}

              {church.acceptsCrypto && (
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Accepts Crypto
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    {church.supportedTokens.map(token => (
                      <Badge key={token} variant="secondary" className="text-xs">
                        {token}
                      </Badge>
                    ))}
                  </div>
                  {church.walletAddress && (
                    <div className="text-xs text-muted-foreground font-mono">
                      Wallet: {church.walletAddress.slice(0, 6)}...{church.walletAddress.slice(-4)}
                    </div>
                  )}
                </div>
              )}

              <Button className="w-full mt-4">
                Start Tithing
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChurches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No churches found matching your criteria. 
            <Button variant="link" onClick={() => setShowAddChurch(true)}>
              Add your church
            </Button>
          </p>
        </div>
      )}
    </div>
  );
};