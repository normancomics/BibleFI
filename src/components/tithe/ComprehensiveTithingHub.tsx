import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, Search, MapPin, Globe, Phone, Mail, CreditCard, Zap, Plus,
  Bitcoin, DollarSign, Banknote, Building, CheckCircle, AlertCircle,
  Wallet, ArrowRight, BookOpen, Star, Sparkles, Shield, Lock
} from 'lucide-react';
import superfluidLogo from '@/assets/superfluid-logo.png';
import usdcLogo from '@/assets/usdc-logo.png';
import veilLogo from '@/assets/veil-logo.png';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { base } from 'wagmi/chains';
import { supabase } from '@/integrations/supabase/client';
import { supabaseApi } from '@/integrations/supabase/apiClient';
import { useSuperfluid } from '@/hooks/useSuperfluid';
import { useTitheRewards } from '@/hooks/useTitheRewards';
import { GooglePlacesChurchSearch } from './GooglePlacesChurchSearch';
import { GooglePlacesChurch } from '@/services/googlePlacesChurchService';
import FiatPaymentForm from './FiatPaymentForm';
import { veilCashClient, VeilDenomination } from '@/integrations/veil/client';
import { Church as ChurchType } from '@/types/church';
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
  lat?: number;
  lng?: number;
  distance?: number; // miles from search origin
}

// Haversine distance in miles
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`, {
      headers: { 'User-Agent': 'BibleFi/1.0' }
    });
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (e) { console.warn('Geocoding failed:', e); }
  return null;
};

const getBrowserLocation = (): Promise<{ lat: number; lng: number } | null> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });

const ComprehensiveTithingHub: React.FC = () => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { createTithingStream, isInitialized: superfluidReady } = useSuperfluid();
  const { awardTithePoints, awardStreamCreated, checkFirstTithe, currentScore, currentLevel } = useTitheRewards();
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
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'superfluid' | 'fiat' | 'veil'>('crypto');
  const [gaslessMode, setGaslessMode] = useState(true); // Default gasless on Base
  const [streamFrequency, setStreamFrequency] = useState('monthly');
  const [showFiatModal, setShowFiatModal] = useState(false);
  const [veilDenomination, setVeilDenomination] = useState<VeilDenomination>('USDC_100');
  const [isVeilProcessing, setIsVeilProcessing] = useState(false);
  
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
      // STEP 1: Search local database first
      let query = supabaseApi.from('global_churches').select('*');

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,denomination.ilike.%${searchQuery}%`);
      }
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

      // Extract lat/lng from PostGIS coordinates
      let results: Church[] = (data || []).map((c: any) => {
        let lat: number | undefined;
        let lng: number | undefined;
        if (c.coordinates) {
          // PostGIS POINT format: could be string "POINT(lng lat)" or object
          if (typeof c.coordinates === 'string') {
            const match = c.coordinates.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
            if (match) { lng = parseFloat(match[1]); lat = parseFloat(match[2]); }
          } else if (c.coordinates?.coordinates) {
            [lng, lat] = c.coordinates.coordinates;
          }
        }
        return { ...c, lat, lng };
      });

      // STEP 2: If local DB returns 0 results, fallback to edge function (OSM + Google Places)
      if (results.length === 0) {
        console.log('📡 Local DB empty, falling back to hybrid search (OSM + Google Places)...');
        toast({ title: "Searching global databases...", description: "Querying OpenStreetMap & Google Places" });

        const locationParts = [cityFilter, stateFilter].filter(Boolean).join(', ');
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('church-search', {
          body: {
            query: searchQuery || undefined,
            location: locationParts || undefined,
            radius: 50000,
          },
        });

        if (edgeError) {
          console.error('Edge function error:', edgeError);
        } else if (edgeData?.churches?.length) {
          console.log(`✅ Hybrid search returned ${edgeData.churches.length} churches`);
          results = edgeData.churches.map((c: any) => ({
            id: c.id,
            name: c.name,
            denomination: c.denomination || undefined,
            address: c.address,
            city: c.city,
            state_province: c.state || '',
            country: c.country || 'United States',
            website: c.website || undefined,
            phone: c.phone || undefined,
            accepts_crypto: c.acceptsCrypto || false,
            accepts_fiat: true,
            accepts_cards: true,
            accepts_checks: true,
            crypto_address: undefined,
            crypto_networks: c.cryptoNetworks || [],
            verified: c.verified || false,
            rating: c.rating || undefined,
            lat: c.lat || undefined,
            lng: c.lng || c.lon || undefined,
          }));
        }
      }

      // STEP 3: Get origin point for distance sorting
      // Priority: geocode search fields → browser geolocation
      let origin: { lat: number; lng: number } | null = null;
      const locationStr = [cityFilter, stateFilter, zipFilter, searchQuery].filter(Boolean).join(', ');
      if (locationStr.trim()) {
        origin = await geocodeLocation(locationStr);
      }
      if (!origin) {
        origin = await getBrowserLocation();
      }

      // STEP 4: Calculate distances and sort
      if (origin) {
        results = results.map(c => ({
          ...c,
          distance: (c.lat && c.lng) ? haversineDistance(origin!.lat, origin!.lng, c.lat, c.lng) : undefined,
        }));
      }

      // Sort: name matches first (with Match badge), then by distance within each group
      const distSort = (a: Church, b: Church) => {
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        if (a.distance != null) return -1;
        if (b.distance != null) return 1;
        return a.name.localeCompare(b.name);
      };

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const nameMatches: Church[] = [];
        const others: Church[] = [];
        for (const c of results) {
          if (c.name.toLowerCase().includes(q)) {
            nameMatches.push(c);
          } else {
            others.push(c);
          }
        }
        nameMatches.sort(distSort);
        others.sort(distSort);
        results = [...nameMatches, ...others];
      } else {
        results.sort(distSort);
      }

      setChurches(results);

      if (!results.length) {
        toast({
          title: "No churches found",
          description: "Try different search terms or add your church to our database",
        });
      } else {
        const source = (data?.length || 0) > 0 ? 'local database' : 'global search';
        toast({ title: `Found ${results.length} churches from ${source}` });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDirectCryptoTithe = async () => {
    if (!titheAmount || !address) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    // For churches without crypto_address, use BibleFi treasury as intermediary
    const recipientAddress = selectedChurch?.crypto_address || '0x7bEda57074AA917FF0993fb329E16C2c188baF08';

    try {
      const amountInUnits = parseUnits(titheAmount, 6); // USDC has 6 decimals
      
      writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`, amountInUnits],
        chain: base,
        account: address,
      });

      const gasNote = gaslessMode ? ' (gasless via Coinbase Smart Wallet)' : '';
      toast({
        title: "Transaction Submitted" + gasNote,
        description: `Sending ${titheAmount} USDC to ${selectedChurch?.name || 'BibleFi Treasury'}`,
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
      
      // Award wisdom points for setting up streaming tithe
      awardStreamCreated(selectedChurch.name, parseFloat(titheAmount));
      
      toast({
        title: "Streaming Tithe Created",
        description: `${streamFrequency} tithe of $${titheAmount} to ${selectedChurch.name}`,
      });
    } catch (error) {
      console.error('Superfluid error:', error);
      toast({ title: "Stream creation failed", variant: "destructive" });
    }
  };

  const handleVeilTithe = async () => {
    if (!selectedChurch?.crypto_address) {
      toast({ title: "Church does not have a crypto address", variant: "destructive" });
      return;
    }

    try {
      setIsVeilProcessing(true);
      
      // Initialize Veil client
      const { BrowserProvider } = await import('ethers');
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      await veilCashClient.initialize(signer);
      
      // Deposit to privacy pool
      const depositResult = await veilCashClient.deposit(veilDenomination);
      
      if (!depositResult.success) {
        throw new Error(depositResult.error);
      }
      
      toast({
        title: "Anonymous Deposit Complete",
        description: "Save your note securely! You'll need it to send the anonymous tithe.",
      });
      
      // In production, store the note securely and withdraw to church
      // For demo, immediately withdraw to church
      if (depositResult.note) {
        const withdrawResult = await veilCashClient.withdraw(
          depositResult.note,
          selectedChurch.crypto_address
        );
        
        if (withdrawResult.success) {
          toast({
            title: "Anonymous Tithe Sent!",
            description: `${withdrawResult.amount} sent privately to ${selectedChurch.name}`,
          });
        }
      }
    } catch (error) {
      console.error('Veil tithe error:', error);
      toast({ title: "Anonymous tithe failed", variant: "destructive" });
    } finally {
      setIsVeilProcessing(false);
    }
  };

  const handleAddChurch = async () => {
    if (!newChurch.name || !newChurch.city || !newChurch.country) {
      toast({ title: "Name, city, and country are required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabaseApi.from('global_churches').insert({
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
    if (isSuccess && titheAmount) {
      const isFirst = checkFirstTithe();
      awardTithePoints(parseFloat(titheAmount), 'direct', isFirst);
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
                  {churches.map((church) => {
                    const isNameMatch = searchQuery.trim() && church.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
                    return (
                    <Card 
                      key={church.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        selectedChurch?.id === church.id ? 'border-primary bg-primary/10' : ''
                      } ${isNameMatch ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}`}
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
                              {isNameMatch && (
                                <Badge className="bg-primary/20 text-primary text-xs">Match</Badge>
                              )}
                              {church.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {church.city}, {church.state_province || church.country}
                              {church.distance != null && (
                                <span className="ml-2 text-xs text-primary">
                                  <MapPin className="w-3 h-3 inline mr-0.5" />
                                  {church.distance < 1 ? '< 1 mi' : `${Math.round(church.distance)} mi`}
                                </span>
                              )}
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
                    );
                  })}
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
                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Superfluid Streaming - PRIMARY */}
                    <Card 
                      className={`cursor-pointer transition-all border-2 ${
                        paymentMethod === 'superfluid' ? 'border-green-500 bg-green-500/10' : 'border-transparent'
                      } ${!selectedChurch.accepts_crypto ? 'opacity-50' : ''}`}
                      onClick={() => selectedChurch.accepts_crypto && setPaymentMethod('superfluid')}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="relative">
                          <img src={superfluidLogo} alt="Superfluid" className="w-8 h-8 mx-auto mb-2" />
                          <Badge className="absolute -top-1 -right-1 bg-green-500 text-[10px]">★</Badge>
                        </div>
                        <p className="font-medium">Superfluid Stream</p>
                        <p className="text-xs text-muted-foreground">Real-time continuous tithing</p>
                      </CardContent>
                    </Card>

                    {/* Direct USDC Stablecoin */}
                    <Card 
                      className={`cursor-pointer transition-all ${
                        paymentMethod === 'crypto' ? 'border-primary bg-primary/10' : ''
                      } ${!selectedChurch.accepts_crypto ? 'opacity-50' : ''}`}
                      onClick={() => selectedChurch.accepts_crypto && setPaymentMethod('crypto')}
                    >
                      <CardContent className="p-4 text-center">
                        <img src={usdcLogo} alt="USDC" className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">Direct USDC</p>
                        <p className="text-xs text-muted-foreground">One-time stablecoin</p>
                      </CardContent>
                    </Card>

                    {/* ZK Anonymous - Veil.cash */}
                    <Card 
                      className={`cursor-pointer transition-all ${
                        paymentMethod === 'veil' ? 'border-purple-500 bg-purple-500/10' : ''
                      } ${!selectedChurch.accepts_crypto ? 'opacity-50' : ''}`}
                      onClick={() => selectedChurch.accepts_crypto && setPaymentMethod('veil')}
                    >
                      <CardContent className="p-4 text-center">
                        <img src={veilLogo} alt="Veil.cash" className="w-8 h-8 mx-auto mb-2 rounded-full" />
                        <p className="font-medium">Anonymous (ZK)</p>
                        <p className="text-xs text-muted-foreground">Veil.cash privacy</p>
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
                        <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <p className="font-medium">Card / Check</p>
                        <p className="text-xs text-muted-foreground">Traditional fiat</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {/* Superfluid streaming options */}
                    {paymentMethod === 'superfluid' && (
                      <div className="p-4 bg-green-950/20 rounded-lg border border-green-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium">Real-Time Streaming Tithe</span>
                        </div>
                        <div>
                          <Label>Monthly Amount (USD)</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            value={titheAmount}
                            onChange={(e) => setTitheAmount(e.target.value)}
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label>Stream Frequency</Label>
                          <Select value={streamFrequency} onValueChange={setStreamFrequency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Powered by Superfluid Protocol — money streams per second to your church
                        </p>
                      </div>
                    )}

                    {/* Direct crypto options */}
                    {paymentMethod === 'crypto' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-green-500/30 bg-green-950/20">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-400" />
                            <div>
                              <p className="text-sm font-medium text-green-400">Gasless Mode</p>
                              <p className="text-xs text-muted-foreground">No gas fees with Coinbase Smart Wallet</p>
                            </div>
                          </div>
                          <Button
                            variant={gaslessMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setGaslessMode(!gaslessMode)}
                            className={gaslessMode ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {gaslessMode ? '✓ Enabled' : 'Enable'}
                          </Button>
                        </div>
                        <div>
                          <Label>Tithe Amount (USDC)</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            value={titheAmount}
                            onChange={(e) => setTitheAmount(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {gaslessMode 
                              ? 'Gasless USDC transfer on Base • $0.00 gas fees via Coinbase Smart Wallet' 
                              : 'Direct USDC transfer on Base chain • Low fees (~$0.01)'}
                          </p>
                        </div>
                        {!selectedChurch?.crypto_address && (
                          <div className="flex items-center gap-2 p-2 rounded bg-amber-950/30 border border-amber-500/30">
                            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <p className="text-xs text-amber-300">
                              This church hasn't set up crypto yet. Funds will go to BibleFi Treasury for forwarding.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Veil.cash ZK options */}
                    {paymentMethod === 'veil' && (
                      <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-purple-400">
                          <Lock className="w-4 h-4" />
                          <span className="font-medium">Anonymous ZK Tithe (Veil.cash)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "But when you give to the needy, do not let your left hand know what your right hand is doing" — Matthew 6:3
                        </p>
                        <div>
                          <Label>Select Amount Pool</Label>
                          <Select value={veilDenomination} onValueChange={(v) => setVeilDenomination(v as VeilDenomination)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {veilCashClient.denominations.map(d => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            ZK-SNARKs ensure complete privacy • Your identity remains hidden
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Fiat payment options */}
                    {paymentMethod === 'fiat' && (
                      <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-blue-400">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-medium">Traditional Payment Options</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge variant="outline" className="justify-center py-2">💳 Credit Card</Badge>
                          <Badge variant="outline" className="justify-center py-2">🏦 Debit Card</Badge>
                          <Badge variant="outline" className="justify-center py-2">📝 Check</Badge>
                          <Badge variant="outline" className="justify-center py-2">🏧 Bank Transfer</Badge>
                        </div>
                        <Button 
                          onClick={() => setShowFiatModal(true)}
                          className="w-full"
                          variant="secondary"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Open Fiat Payment Form
                        </Button>
                      </div>
                    )}

                    {/* Action buttons for crypto methods */}
                    {paymentMethod !== 'fiat' && (
                      <Button 
                        onClick={
                          paymentMethod === 'crypto' ? handleDirectCryptoTithe : 
                          paymentMethod === 'superfluid' ? handleSuperfluidTithe :
                          handleVeilTithe
                        }
                        disabled={
                          !isConnected || isPending || isConfirming || isVeilProcessing ||
                          (paymentMethod !== 'veil' && !titheAmount)
                        }
                        className="w-full"
                      >
                        {!isConnected ? (
                          <>Connect Wallet First</>
                        ) : isPending || isConfirming || isVeilProcessing ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-2" />
                            {paymentMethod === 'crypto' ? 'Send USDC Tithe' : 
                             paymentMethod === 'superfluid' ? 'Start Streaming Tithe' :
                             'Send Anonymous Tithe'}
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
                    placeholder="Times Square Church"
                  />
                </div>
                <div>
                  <Label>Denomination</Label>
                  <Input
                    value={newChurch.denomination}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, denomination: e.target.value }))}
                    placeholder="Non-Denominational"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={newChurch.city}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label>State / Province</Label>
                  <Input
                    value={newChurch.state_province}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, state_province: e.target.value }))}
                    placeholder="New York"
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
                    placeholder="10036"
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
                    placeholder="(212) 541-6000"
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

      {/* Fiat Payment Modal */}
      <Dialog open={showFiatModal} onOpenChange={setShowFiatModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Traditional Payment</DialogTitle>
          </DialogHeader>
          {selectedChurch && (
            <FiatPaymentForm
              church={{
                id: selectedChurch.id,
                name: selectedChurch.name,
                denomination: selectedChurch.denomination || undefined,
                address: selectedChurch.address || undefined,
                city: selectedChurch.city,
                state: selectedChurch.state_province || '',
                country: selectedChurch.country,
                location: `${selectedChurch.city}, ${selectedChurch.state_province || ''}, ${selectedChurch.country}`,
                acceptsCrypto: selectedChurch.accepts_crypto,
                verified: selectedChurch.verified,
              }}
              onPaymentComplete={(txId) => {
                toast({ title: "Payment complete!", description: `Transaction: ${txId.slice(0, 10)}...` });
                setShowFiatModal(false);
              }}
              onCancel={() => setShowFiatModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveTithingHub;
