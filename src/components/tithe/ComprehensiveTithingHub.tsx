import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Search, MapPin, Globe, Phone, Mail, CreditCard, Zap, Plus,
  Bitcoin, DollarSign, Banknote, Building, CheckCircle, AlertCircle,
  Wallet, ArrowRight, BookOpen, Star, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { base } from 'wagmi/chains';
import { supabase } from '@/integrations/supabase/client';
import { useSuperfluid } from '@/hooks/useSuperfluid';
import { GooglePlacesChurchSearch } from './GooglePlacesChurchSearch';
import { GooglePlacesChurch } from '@/services/googlePlacesChurchService';

// USDC contract on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable'
  }
] as const;

interface Church {
  id: string;
  name: string;
  denomination?: string;
  address?: string;
  city: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  website?: string;
  phone?: string;
  email?: string;
  accepts_crypto: boolean;
  accepts_fiat: boolean;
  accepts_cards: boolean;
  accepts_checks: boolean;
  crypto_address?: string;
  crypto_networks?: string[];
  verified: boolean;
  rating?: number;
}

const ComprehensiveTithingHub: React.FC = () => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { createTithingStream, isInitialized: superfluidReady } = useSuperfluid();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [activeTab, setActiveTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [zipFilter, setZipFilter] = useState('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [titheAmount, setTitheAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'superfluid' | 'fiat'>('crypto');
  const [streamFrequency, setStreamFrequency] = useState('monthly');
  
  // Add church form
  const [showAddChurch, setShowAddChurch] = useState(false);
  const [newChurch, setNewChurch] = useState({
    name: '', denomination: '', city: '', state_province: '', country: 'United States',
    postal_code: '', website: '', phone: '', email: '', accepts_crypto: false, crypto_address: ''
  });

  // Scripture reference for tithing
  const malachiVerse = {
    kjv: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.",
    reference: "Malachi 3:10",
    hebrew: "הָבִיאוּ אֶת־כָּל־הַמַּעֲשֵׂר אֶל־בֵּית הָאוֹצָר",
    strongs: "H4643 - מַעֲשֵׂר (ma'aser) - tithe, tenth part"
  };

  const searchChurches = async () => {
    if (!searchQuery.trim() && !cityFilter.trim() && !stateFilter.trim() && !zipFilter.trim()) {
      toast({ title: "Enter search criteria", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase.from('global_churches').select('*');

      // Flexible text search
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,denomination.ilike.%${searchQuery}%`);
      }

      // Location filters with flexible matching
      if (cityFilter.trim()) {
        query = query.ilike('city', `%${cityFilter}%`);
      }

      if (stateFilter.trim()) {
        query = query.ilike('state_province', `%${stateFilter}%`);
      }

      if (zipFilter.trim()) {
        query = query.ilike('postal_code', `%${zipFilter}%`);
      }

      const { data, error } = await query.order('verified', { ascending: false }).limit(100);

      if (error) throw error;

      setChurches(data || []);
      
      if (!data?.length) {
        toast({
          title: "No churches found",
          description: "Try different search terms or add your church to our database",
        });
      } else {
        toast({ title: `Found ${data.length} churches` });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDirectCryptoTithe = async () => {
    if (!selectedChurch?.crypto_address || !titheAmount || !address) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    try {
      const amountInUnits = parseUnits(titheAmount, 6); // USDC has 6 decimals
      
      writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [selectedChurch.crypto_address as `0x${string}`, amountInUnits],
        chain: base,
        account: address
      });

      toast({
        title: "Transaction Submitted",
        description: `Sending ${titheAmount} USDC to ${selectedChurch.name}`,
      });
    } catch (error) {
      console.error('Transfer error:', error);
      toast({ title: "Transfer failed", variant: "destructive" });
    }
  };

  const handleSuperfluidTithe = async () => {
    if (!selectedChurch?.crypto_address || !titheAmount) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    try {
      await createTithingStream(
        selectedChurch.crypto_address,
        'USDCx',
        parseFloat(titheAmount),
        streamFrequency
      );
      
      toast({
        title: "Streaming Tithe Created",
        description: `${streamFrequency} tithe of $${titheAmount} to ${selectedChurch.name}`,
      });
    } catch (error) {
      console.error('Superfluid error:', error);
      toast({ title: "Stream creation failed", variant: "destructive" });
    }
  };

  const handleAddChurch = async () => {
    if (!newChurch.name || !newChurch.city || !newChurch.country) {
      toast({ title: "Name, city, and country are required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from('global_churches').insert({
        ...newChurch,
        accepts_fiat: true,
        accepts_cards: true,
        accepts_checks: true,
        verified: false,
        crypto_networks: newChurch.accepts_crypto ? ['Base', 'Ethereum'] : []
      });

      if (error) throw error;

      toast({ title: "Church added successfully!" });
      setShowAddChurch(false);
      setNewChurch({
        name: '', denomination: '', city: '', state_province: '', country: 'United States',
        postal_code: '', website: '', phone: '', email: '', accepts_crypto: false, crypto_address: ''
      });
    } catch (error) {
      console.error('Add church error:', error);
      toast({ title: "Failed to add church", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Tithe Complete!",
        description: "Your offering has been received. God bless you!",
      });
    }
  }, [isSuccess]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Scripture Header */}
      <Card className="bg-gradient-to-br from-ancient-gold/20 to-eboy-purple/20 border-ancient-gold/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-ancient-gold flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <p className="text-lg italic text-foreground/90">"{malachiVerse.kjv}"</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-ancient-gold/20 text-ancient-gold">
                  {malachiVerse.reference}
                </Badge>
                <span className="text-muted-foreground font-hebrew">{malachiVerse.hebrew}</span>
                <span className="text-xs text-muted-foreground">{malachiVerse.strongs}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 bg-background/50">
          <TabsTrigger value="live"><Sparkles className="w-4 h-4 mr-2" />Live Search</TabsTrigger>
          <TabsTrigger value="search"><Search className="w-4 h-4 mr-2" />Database</TabsTrigger>
          <TabsTrigger value="tithe" disabled={!selectedChurch}><Heart className="w-4 h-4 mr-2" />Tithe</TabsTrigger>
          <TabsTrigger value="add"><Plus className="w-4 h-4 mr-2" />Add Church</TabsTrigger>
          <TabsTrigger value="history"><Zap className="w-4 h-4 mr-2" />History</TabsTrigger>
        </TabsList>

        {/* Live Google Places Search Tab */}
        <TabsContent value="live" className="space-y-4">
          <GooglePlacesChurchSearch 
            onChurchSelect={(church: GooglePlacesChurch) => {
              // Convert Google Places result to our Church format
              setSelectedChurch({
                id: church.id,
                name: church.name,
                address: church.address,
                city: church.city,
                state_province: church.state,
                country: church.country,
                website: church.website,
                phone: church.phone,
                accepts_crypto: false,
                accepts_fiat: true,
                accepts_cards: true,
                accepts_checks: true,
                verified: church.verified,
                rating: church.rating,
              });
              setActiveTab('tithe');
              toast({ title: `Selected ${church.name}` });
            }}
          />
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Search Christian Churches Worldwide
                </span>
                <Badge variant="outline" className="text-xs">
                  {churches.length} results
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Church Name / Denomination</Label>
                  <Input
                    placeholder="e.g., Baptist, Methodist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchChurches()}
                  />
                </div>
                <div>
                  <Label className="text-xs">City</Label>
                  <Input
                    placeholder="e.g., Mount Dora"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchChurches()}
                  />
                </div>
                <div>
                  <Label className="text-xs">State / Province</Label>
                  <Input
                    placeholder="e.g., Florida, FL"
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchChurches()}
                  />
                </div>
                <div>
                  <Label className="text-xs">ZIP / Postal Code</Label>
                  <Input
                    placeholder="e.g., 32757"
                    value={zipFilter}
                    onChange={(e) => setZipFilter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchChurches()}
                  />
                </div>
              </div>
              
              <Button onClick={searchChurches} disabled={isSearching} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search Churches'}
              </Button>

              {/* Results */}
              {churches.length > 0 && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {churches.map((church) => (
                    <Card 
                      key={church.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        selectedChurch?.id === church.id ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => {
                        setSelectedChurch(church);
                        setActiveTab('tithe');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{church.name}</h3>
                              {church.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {church.city}, {church.state_province || church.country}
                            </p>
                            {church.denomination && (
                              <Badge variant="outline" className="text-xs">{church.denomination}</Badge>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {church.accepts_crypto && (
                              <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                                <Bitcoin className="w-3 h-3 mr-1" />Crypto
                              </Badge>
                            )}
                            {church.accepts_cards && (
                              <Badge variant="secondary" className="text-xs">
                                <CreditCard className="w-3 h-3 mr-1" />Cards
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tithe Tab */}
        <TabsContent value="tithe" className="space-y-4">
          {selectedChurch && (
            <>
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {selectedChurch.name}
                    {selectedChurch.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    {selectedChurch.address || selectedChurch.city}, {selectedChurch.state_province}, {selectedChurch.country}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedChurch.website && (
                      <a href={selectedChurch.website} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-primary hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Website
                      </a>
                    )}
                    {selectedChurch.phone && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedChurch.phone}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Choose Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Direct Crypto */}
                    <Card 
                      className={`cursor-pointer transition-all ${
                        paymentMethod === 'crypto' ? 'border-primary bg-primary/10' : ''
                      } ${!selectedChurch.accepts_crypto ? 'opacity-50' : ''}`}
                      onClick={() => selectedChurch.accepts_crypto && setPaymentMethod('crypto')}
                    >
                      <CardContent className="p-4 text-center">
                        <Bitcoin className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        <p className="font-medium">Direct USDC</p>
                        <p className="text-xs text-muted-foreground">One-time crypto payment</p>
                      </CardContent>
                    </Card>

                    {/* Superfluid Streaming */}
                    <Card 
                      className={`cursor-pointer transition-all ${
                        paymentMethod === 'superfluid' ? 'border-primary bg-primary/10' : ''
                      } ${!selectedChurch.accepts_crypto ? 'opacity-50' : ''}`}
                      onClick={() => selectedChurch.accepts_crypto && setPaymentMethod('superfluid')}
                    >
                      <CardContent className="p-4 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="font-medium">Superfluid Stream</p>
                        <p className="text-xs text-muted-foreground">Continuous liquid tithing</p>
                      </CardContent>
                    </Card>

                    {/* Fiat/Card/Check */}
                    <Card 
                      className={`cursor-pointer transition-all ${
                        paymentMethod === 'fiat' ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => setPaymentMethod('fiat')}
                    >
                      <CardContent className="p-4 text-center">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <p className="font-medium">Fiat / Card / Check</p>
                        <p className="text-xs text-muted-foreground">Traditional payment</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Tithe Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={titheAmount}
                        onChange={(e) => setTitheAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        10% tithe is {titheAmount ? `$${(parseFloat(titheAmount) * 10).toFixed(2)} income` : 'calculated from your earnings'}
                      </p>
                    </div>

                    {paymentMethod === 'superfluid' && (
                      <div>
                        <Label>Stream Frequency</Label>
                        <select 
                          value={streamFrequency}
                          onChange={(e) => setStreamFrequency(e.target.value)}
                          className="w-full p-2 rounded-md bg-background border"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    )}

                    {paymentMethod === 'fiat' && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="font-medium">Traditional Payment Options:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Contact church directly: {selectedChurch.email || selectedChurch.phone || 'Visit website'}</li>
                          <li>• Many churches accept credit/debit cards through their website</li>
                          <li>• Mail a check to: {selectedChurch.address || 'Contact church for address'}</li>
                          <li>• Visit during service with cash or check</li>
                        </ul>
                      </div>
                    )}

                    {paymentMethod !== 'fiat' && (
                      <Button 
                        onClick={paymentMethod === 'crypto' ? handleDirectCryptoTithe : handleSuperfluidTithe}
                        disabled={!isConnected || isPending || isConfirming || !titheAmount}
                        className="w-full"
                      >
                        {!isConnected ? (
                          <>Connect Wallet First</>
                        ) : isPending || isConfirming ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-2" />
                            {paymentMethod === 'crypto' ? 'Send USDC Tithe' : 'Start Streaming Tithe'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Add Church Tab */}
        <TabsContent value="add" className="space-y-4">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Your Church to Our Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Church Name *</Label>
                  <Input
                    value={newChurch.name}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="First Baptist Church"
                  />
                </div>
                <div>
                  <Label>Denomination</Label>
                  <Input
                    value={newChurch.denomination}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, denomination: e.target.value }))}
                    placeholder="Baptist, Methodist, etc."
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={newChurch.city}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Mount Dora"
                  />
                </div>
                <div>
                  <Label>State / Province</Label>
                  <Input
                    value={newChurch.state_province}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, state_province: e.target.value }))}
                    placeholder="Florida"
                  />
                </div>
                <div>
                  <Label>Country *</Label>
                  <Input
                    value={newChurch.country}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="United States"
                  />
                </div>
                <div>
                  <Label>ZIP / Postal Code</Label>
                  <Input
                    value={newChurch.postal_code}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="32757"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={newChurch.website}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newChurch.phone}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(352) 555-0100"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={newChurch.email}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="info@church.org"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="accepts_crypto"
                    checked={newChurch.accepts_crypto}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, accepts_crypto: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="accepts_crypto">Accepts Cryptocurrency</Label>
                </div>
                {newChurch.accepts_crypto && (
                  <div>
                    <Label>Crypto Wallet Address</Label>
                    <Input
                      value={newChurch.crypto_address}
                      onChange={(e) => setNewChurch(prev => ({ ...prev, crypto_address: e.target.value }))}
                      placeholder="0x..."
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleAddChurch} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Church to Database
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-card/50">
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Your tithing history will appear here</p>
              <p className="text-sm text-muted-foreground">Start by selecting a church and making your first tithe</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveTithingHub;
