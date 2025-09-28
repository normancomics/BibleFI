import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Search, 
  MapPin, 
  Globe, 
  Phone,
  Mail,
  CreditCard,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedChurchSearch from './EnhancedChurchSearch';
import { useAccount } from 'wagmi';

interface Church {
  id: string;
  name: string;
  denomination?: string;
  address?: string;
  city: string;
  state_province?: string;
  country: string;
  website?: string;
  phone?: string;
  email?: string;
  accepts_crypto: boolean;
  crypto_address?: string;
  crypto_networks?: string[];
}

const ProductionTithingInterface: React.FC = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [titheAmount, setTitheAmount] = useState('');
  const [titheFrequency, setTitheFrequency] = useState('monthly');
  const [activeTab, setActiveTab] = useState('search');

  const handleChurchSelect = (church: Church) => {
    setSelectedChurch(church);
    setActiveTab('tithe');
    toast({
      title: "Church Selected",
      description: `Selected ${church.name}`,
    });
  };

  const handleTitheSubmit = () => {
    if (!selectedChurch || !titheAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a church and enter an amount",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to proceed",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tithe Initiated",
      description: `Setting up ${titheFrequency} tithe of $${titheAmount} to ${selectedChurch.name}`,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Digital Tithing
            </span>
          </CardTitle>
          <p className="text-muted-foreground">
            "Bring the whole tithe into the storehouse" - Malachi 3:10
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 bg-black/30">
          <TabsTrigger value="search" className="data-[state=active]:bg-green-600/30">
            <Search className="w-4 h-4 mr-2" />
            Find Church
          </TabsTrigger>
          <TabsTrigger value="tithe" className="data-[state=active]:bg-blue-600/30" disabled={!selectedChurch}>
            <Heart className="w-4 h-4 mr-2" />
            Set Tithe
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-600/30">
            <Zap className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search for Your Church
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedChurchSearch 
                onChurchSelect={handleChurchSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tithe" className="space-y-6">
          {selectedChurch && (
            <>
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Selected Church
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">{selectedChurch.name}</h3>
                    {selectedChurch.denomination && (
                      <p className="text-sm text-muted-foreground">{selectedChurch.denomination}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedChurch.city}, {selectedChurch.state_province || selectedChurch.country}
                      </span>
                    </div>
                    
                    {selectedChurch.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={selectedChurch.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    {selectedChurch.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedChurch.phone}</span>
                      </div>
                    )}
                    
                    {selectedChurch.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedChurch.email}</span>
                      </div>
                    )}
                  </div>

                  {selectedChurch.accepts_crypto && (
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Crypto Payments Supported</span>
                      </div>
                      {selectedChurch.crypto_networks && selectedChurch.crypto_networks.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Networks: {selectedChurch.crypto_networks.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Set Up Your Tithe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Tithe Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100.00"
                      value={titheAmount}
                      onChange={(e) => setTitheAmount(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <select 
                      value={titheFrequency}
                      onChange={(e) => setTitheFrequency(e.target.value)}
                      className="w-full p-2 rounded-md bg-background/50 border border-border text-sm"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>

                  <Button 
                    onClick={handleTitheSubmit}
                    className="w-full"
                    disabled={!isConnected || !titheAmount}
                  >
                    {!isConnected ? 'Connect Wallet First' : `Set Up ${titheFrequency} Tithe`}
                  </Button>

                  {!isConnected && (
                    <p className="text-xs text-muted-foreground text-center">
                      Connect your wallet to proceed with cryptocurrency tithing
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Tithing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tithing history yet</p>
                <p className="text-sm">Set up your first tithe to get started</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionTithingInterface;