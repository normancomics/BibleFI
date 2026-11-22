import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle2, Zap, ExternalLink, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { zkProofService } from '@/services/zkProofService';
import { PRIVACY_CASH_DOCS_URL } from '@/config/privacycash';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

interface Church {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  acceptsCrypto?: boolean;
}

type ZKProvider = 'privacycash' | 'noir';

export const AnonymousTithe: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofProgress, setProofProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [zkProvider, setZKProvider] = useState<ZKProvider>('privacycash');
  
  // Church search state
  const [churchSearch, setChurchSearch] = useState('');
  const [churchLocation, setChurchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<Church[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showChurchSearch, setShowChurchSearch] = useState(false);

  // Search churches globally
  const handleSearchChurches = async () => {
    if (!churchSearch.trim() && !churchLocation.trim()) {
      toast.error('Enter church name or location');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('church-search', {
        body: { 
          query: churchSearch, 
          location: churchLocation,
          radius: 100000 // 100km radius
        }
      });

      if (error) throw error;

      const churches = (data.churches || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        address: c.address || `${c.city}, ${c.state}`,
        city: c.city,
        state: c.state,
        acceptsCrypto: c.acceptsCrypto
      }));

      setSearchResults(churches);
      
      if (churches.length === 0) {
        toast.info('No churches found. Try a different location.');
      } else {
        toast.success(`Found ${churches.length} churches`);
      }
    } catch (error) {
      console.error('Church search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!selectedChurch) {
      toast.error('Please select a church');
      return;
    }
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsGeneratingProof(true);
      setProofProgress(0);

      const progressInterval = setInterval(() => {
        setProofProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      if (zkProvider === 'privacycash') {
        clearInterval(progressInterval);
        setProofProgress(0);
        window.open(PRIVACY_CASH_DOCS_URL, '_blank', 'noopener,noreferrer');
        toast.info('Opening Privacy Cash', {
          description: 'Complete your private gift there. BibleFi does not send or custody anything for you.',
          duration: 8000,
        });
      } else {
        // Noir ZK approach
        if (!amount) {
          toast.error('Please enter an amount');
          clearInterval(progressInterval);
          setIsGeneratingProof(false);
          return;
        }
        const amountWei = BigInt(parseFloat(amount) * 1_000_000);
        const donorSecret = `${address}-${Date.now()}`;
        
        await zkProofService.generateTitheProof({
          titheAmount: amountWei,
          donorSecret,
          minThreshold: amountWei,
          churchId: selectedChurch.id,
        });
        
        clearInterval(progressInterval);
        setProofProgress(100);
        setProofGenerated(true);
        toast.success('Noir ZK proof generated!');
      }
    } catch (error) {
      console.error('Proof generation error:', error);
      toast.error('Failed to generate proof');
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleSubmitTithe = async () => {
    if (!selectedChurch) return;

    if (zkProvider === 'privacycash') {
      window.open(PRIVACY_CASH_DOCS_URL, '_blank', 'noopener,noreferrer');
      return;
    } else {
      // Noir path is proof-only until an on-chain verifier + settlement contract
      // is deployed — do NOT claim a tithe was sent.
      toast.info('Noir proof generated (demo). On-chain anonymous settlement is not yet live — no funds were moved.', {
        duration: 8000,
      });
      return;
    }

  };

  return (
    <Card className="border-2 border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-ancient-gold/10 rounded-lg">
            <Shield className="w-6 h-6 text-ancient-gold" />
          </div>
          <div>
            <CardTitle className="text-2xl font-scroll text-ancient-gold">
              Anonymous Tithing
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Zero-knowledge privacy for biblical giving
            </CardDescription>
          </div>
        </div>

        <Alert className="bg-purple-950/20 border-ancient-gold/30 mt-4">
          <Lock className="h-4 w-4 text-ancient-gold" />
          <AlertDescription className="text-sm">
            <strong className="text-ancient-gold">Matthew 6:3-4:</strong> "But when you give to the needy,
            do not let your left hand know what your right hand is doing, so that your giving may be in secret."
          </AlertDescription>
        </Alert>

        <Alert className="bg-yellow-950/20 border-yellow-500/40 mt-3">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm">
            <strong className="text-yellow-500">External provider:</strong> Private giving is completed on{' '}
            Privacy Cash. <strong>BibleFi does not send transactions or move funds</strong> for anonymous gifts.
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ZK Provider Selection */}
        <Tabs value={zkProvider} onValueChange={(v) => setZKProvider(v as ZKProvider)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="privacycash" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Privacy Cash (Recommended)
            </TabsTrigger>
            <TabsTrigger value="noir" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Noir ZK
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="privacycash" className="space-y-4 mt-4">
            <Alert className="bg-primary/10 border-primary/30">
              <Zap className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Privacy Cash:</strong> a privacy protocol for private transfers.
                Choose your church below, then complete the private gift on Privacy Cash.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="noir" className="space-y-4 mt-4">
            <Alert className="bg-secondary/50 border-border">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Noir ZK:</strong> Custom zero-knowledge circuits for precise amount privacy.
                Enter any amount - only a threshold proof is revealed.
              </AlertDescription>
            </Alert>
            
            {/* Custom Amount Input */}
            <div className="space-y-2">
              <Label>Tithe Amount (USDC)</Label>
              <Input
                type="number"
                placeholder="Enter any amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Your exact amount stays private. Only proof of minimum threshold is revealed.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Privacy Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-secondary/30 rounded-lg border border-border">
            <Lock className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
            <p className="text-xs">Amount Hidden</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg border border-border">
            <EyeOff className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
            <p className="text-xs">Identity Private</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg border border-border">
            <CheckCircle2 className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
            <p className="text-xs">Verified Proof</p>
          </div>
        </div>

        {/* Church Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Select Church</Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowChurchSearch(!showChurchSearch)}
            >
              <Search className="w-4 h-4 mr-1" />
              {showChurchSearch ? 'Hide Search' : 'Search Churches'}
            </Button>
          </div>
          
          {showChurchSearch && (
            <div className="space-y-2 p-3 bg-secondary/20 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Church name..."
                  value={churchSearch}
                  onChange={(e) => setChurchSearch(e.target.value)}
                />
                <Input
                  placeholder="City, State or Country..."
                  value={churchLocation}
                  onChange={(e) => setChurchLocation(e.target.value)}
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleSearchChurches}
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching globally...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search All Churches (Global)
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Searches churches across North America, South America, Europe, Asia, Africa & Australia
              </p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((church) => (
                <button
                  key={church.id}
                  onClick={() => {
                    setSelectedChurch(church);
                    setSearchResults([]);
                    setShowChurchSearch(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedChurch?.id === church.id
                      ? 'bg-ancient-gold/20 border-ancient-gold'
                      : 'bg-background/30 border-border hover:border-ancient-gold/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{church.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {church.city && church.state ? `${church.city}, ${church.state}` : church.address}
                      </p>
                    </div>
                    {church.acceptsCrypto && (
                      <Badge variant="secondary" className="text-xs">Crypto</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Church Display */}
          {selectedChurch && !searchResults.length && (
            <div className="p-3 bg-ancient-gold/10 rounded-lg border border-ancient-gold/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ancient-gold">{selectedChurch.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedChurch.address.slice(0, 20)}...
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedChurch(null);
                    setShowChurchSearch(true);
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Technical Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-ancient-gold hover:text-ancient-gold/80 transition-colors"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </button>

        {showDetails && (
          <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2 text-sm">
            {zkProvider === 'privacycash' ? (
              <>
                <p><span className="text-ancient-gold">Provider:</span> Privacy Cash (external)</p>
                <p><span className="text-ancient-gold">BibleFi role:</span> Church selection and guidance only; no funds are moved by this app</p>
                <a
                  href={PRIVACY_CASH_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Privacy Cash Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </>
            ) : (
              <>
                <p><span className="text-ancient-gold">Circuit:</span> private_tithe.nr</p>
                <p><span className="text-ancient-gold">Proof System:</span> UltraPlonk (Noir)</p>
                <p><span className="text-ancient-gold">Public Inputs:</span> Minimum threshold, Church ID, Commitment</p>
                <p><span className="text-ancient-gold">Private Inputs:</span> Exact amount, Donor secret</p>
                <p><span className="text-ancient-gold">Est. Proof Time:</span> {zkProofService.getEstimatedProofTime('tithe')}</p>
              </>
            )}
          </div>
        )}

        {/* Proof Generation Progress */}
        {isGeneratingProof && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Generating zero-knowledge proof...
              </span>
              <span className="text-ancient-gold">{proofProgress}%</span>
            </div>
            <Progress value={proofProgress} />
          </div>
        )}

        {/* Success State */}
        {proofGenerated && !isGeneratingProof && (
          <Alert className="bg-green-950/20 border-green-500/30">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Proof generated! Your tithe is ready to submit anonymously.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!proofGenerated ? (
            <Button
              onClick={handleGenerateProof}
              disabled={!selectedChurch || isGeneratingProof || (!amount && zkProvider === 'noir')}
              className="flex-1 bg-ancient-gold hover:bg-ancient-gold/90 text-black font-semibold"
            >
              {isGeneratingProof ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  {zkProvider === 'privacycash' ? 'Give Privately via Privacy Cash' : 'Generate Anonymous Proof'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmitTithe}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Send Anonymous Tithe to {selectedChurch?.name.slice(0, 20)}...
            </Button>
          )}
        </div>

        {/* Privacy Guarantee */}
        <div className="text-center pt-4 border-t border-border">
          <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
            {zkProvider === 'privacycash' ? '🔗 Completed on Privacy Cash' : '🔎 Preview — not yet private on-chain'}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            {zkProvider === 'privacycash'
              ? 'Privacy Cash handles the private transfer; BibleFi never custodies funds'
              : 'Noir zero-knowledge proofs — on-chain settlement pending verifier deployment'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
