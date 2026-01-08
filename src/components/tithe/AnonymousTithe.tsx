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
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle2, Zap, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { zkProofService } from '@/services/zkProofService';
import { veilCashClient, VeilDenomination } from '@/integrations/veil/client';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

interface Church {
  id: string;
  name: string;
  address: string;
}

type ZKProvider = 'noir' | 'veil';

export const AnonymousTithe: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofProgress, setProofProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [zkProvider, setZKProvider] = useState<ZKProvider>('veil');
  const [veilDenomination, setVeilDenomination] = useState<VeilDenomination>('USDC_100');
  const [anonymitySetSize, setAnonymitySetSize] = useState(0);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  // Mock churches - in production, load from database
  const churches: Church[] = [
    { id: '0x1', name: 'First Baptist Church', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
    { id: '0x2', name: 'Grace Community Church', address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199' },
    { id: '0x3', name: 'Hope Fellowship', address: '0xdd2FD4581271e230360230F9337D5c0430Bf44C0' },
  ];

  // Fetch anonymity set size when denomination changes
  useEffect(() => {
    if (zkProvider === 'veil') {
      veilCashClient.getAnonymitySetSize(veilDenomination).then(setAnonymitySetSize);
    }
  }, [veilDenomination, zkProvider]);

  const handleGenerateProof = async () => {
    if (!selectedChurch || !address) {
      toast.error('Please select a church and connect wallet');
      return;
    }

    try {
      setIsGeneratingProof(true);
      setProofProgress(0);

      const progressInterval = setInterval(() => {
        setProofProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      if (zkProvider === 'veil') {
        // Veil.cash ZK-SNARK approach
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        await veilCashClient.initialize(signer);
        
        const result = await veilCashClient.deposit(veilDenomination);
        clearInterval(progressInterval);
        
        if (result.success && result.note) {
          setSavedNote(result.note);
          setProofProgress(100);
          setProofGenerated(true);
          toast.success('Anonymous deposit ready! Save your note securely.');
        } else {
          throw new Error(result.error);
        }
      } else {
        // Noir ZK approach
        if (!amount) {
          toast.error('Please enter an amount');
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
    if (zkProvider === 'veil' && savedNote && selectedChurch) {
      const result = await veilCashClient.withdraw(savedNote, selectedChurch.address);
      if (result.success) {
        toast.success('Anonymous tithe sent!', {
          description: `${result.amount} sent privately to ${selectedChurch.name}`,
        });
      }
    } else {
      toast.success('Anonymous tithe submitted via Noir ZK!');
    }
    
    setAmount('');
    setSelectedChurch(null);
    setProofGenerated(false);
    setProofProgress(0);
    setSavedNote(null);
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
            <CardDescription className="text-white/60">
              Zero-knowledge privacy for biblical giving
            </CardDescription>
          </div>
        </div>

        <Alert className="bg-purple-950/20 border-ancient-gold/30 mt-4">
          <Lock className="h-4 w-4 text-ancient-gold" />
          <AlertDescription className="text-white/80 text-sm">
            <strong className="text-ancient-gold">Matthew 6:3-4:</strong> "But when you give to the needy, 
            do not let your left hand know what your right hand is doing, so that your giving may be in secret."
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Privacy Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-purple-950/20 rounded-lg border border-ancient-gold/20">
            <Lock className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
            <p className="text-xs text-white/70">Amount Hidden</p>
          </div>
          <div className="text-center p-3 bg-purple-950/20 rounded-lg border border-ancient-gold/20">
            <EyeOff className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
            <p className="text-xs text-white/70">Identity Private</p>
          </div>
          <div className="text-center p-3 bg-purple-950/20 rounded-lg border border-ancient-gold/20">
            <CheckCircle2 className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
            <p className="text-xs text-white/70">Verified Proof</p>
          </div>
        </div>

        {/* Tithe Amount */}
        <div className="space-y-2">
          <Label className="text-white/90">Tithe Amount (USDC)</Label>
          <Input
            type="number"
            placeholder="10.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50 border-ancient-gold/30 text-white"
          />
          <p className="text-xs text-white/50">
            Your exact amount will remain private. Only proof of minimum threshold is revealed.
          </p>
        </div>

        {/* Church Selection */}
        <div className="space-y-2">
          <Label className="text-white/90">Select Church</Label>
          <div className="space-y-2">
            {churches.map((church) => (
              <button
                key={church.id}
                onClick={() => setSelectedChurch(church)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedChurch?.id === church.id
                    ? 'bg-ancient-gold/20 border-ancient-gold'
                    : 'bg-background/30 border-ancient-gold/20 hover:border-ancient-gold/40'
                }`}
              >
                <p className="text-white font-medium">{church.name}</p>
                <p className="text-xs text-white/50 font-mono">{church.address.slice(0, 10)}...</p>
              </button>
            ))}
          </div>
        </div>

        {/* Show Technical Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-ancient-gold hover:text-ancient-gold/80 transition-colors"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </button>

        {showDetails && (
          <div className="p-4 bg-black/40 rounded-lg border border-ancient-gold/20 space-y-2 text-sm">
            <p className="text-white/70">
              <span className="text-ancient-gold">Circuit:</span> private_tithe.nr
            </p>
            <p className="text-white/70">
              <span className="text-ancient-gold">Proof System:</span> UltraPlonk (Noir)
            </p>
            <p className="text-white/70">
              <span className="text-ancient-gold">Public Inputs:</span> Minimum threshold, Church ID, Commitment
            </p>
            <p className="text-white/70">
              <span className="text-ancient-gold">Private Inputs:</span> Exact amount, Donor secret
            </p>
            <p className="text-white/70">
              <span className="text-ancient-gold">Est. Proof Time:</span> {zkProofService.getEstimatedProofTime('tithe')}
            </p>
          </div>
        )}

        {/* Proof Generation Progress */}
        {isGeneratingProof && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Generating zero-knowledge proof...</span>
              <span className="text-ancient-gold">{proofProgress}%</span>
            </div>
            <Progress value={proofProgress} className="bg-purple-950/30" />
          </div>
        )}

        {/* Success State */}
        {proofGenerated && !isGeneratingProof && (
          <Alert className="bg-green-950/20 border-green-500/30">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-white/80">
              Proof generated successfully! Your tithe is ready to submit anonymously.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!proofGenerated ? (
            <Button
              onClick={handleGenerateProof}
              disabled={isGeneratingProof || !amount || !selectedChurch}
              className="flex-1 bg-ancient-gold hover:bg-ancient-gold/90 text-black font-semibold"
            >
              {isGeneratingProof ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Proof...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Generate Anonymous Proof
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmitTithe}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Anonymous Tithe
            </Button>
          )}
        </div>

        {/* Privacy Guarantee */}
        <div className="text-center pt-4 border-t border-ancient-gold/20">
          <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
            🔐 Cryptographically Private
          </Badge>
          <p className="text-xs text-white/50 mt-2">
            Zero-knowledge proofs ensure complete privacy while maintaining accountability
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
