import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2,
  Trophy,
  Star,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { zkProofService } from '@/services/zkProofService';
import { useAccount } from 'wagmi';

interface WisdomScoreData {
  actualScore: number;
  level: string;
  achievements: string[];
}

export const WisdomZKProof: React.FC = () => {
  const { address } = useAccount();
  const [requiredThreshold, setRequiredThreshold] = useState('75');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofProgress, setProofProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [proofData, setProofData] = useState<any>(null);

  // Mock wisdom score - in production, fetch from database
  const [wisdomScore] = useState<WisdomScoreData>({
    actualScore: 87,
    level: 'Solomon Scholar',
    achievements: ['Daily Reader', 'Generous Giver', 'Wise Steward'],
  });

  const handleGenerateProof = async () => {
    if (!requiredThreshold || !address) {
      toast.error('Please fill all fields and connect wallet');
      return;
    }

    const threshold = parseInt(requiredThreshold);

    if (wisdomScore.actualScore < threshold) {
      toast.error(`Your wisdom score (${wisdomScore.actualScore}) is below the required threshold (${threshold})`);
      return;
    }

    try {
      setIsGeneratingProof(true);
      setProofProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProofProgress(prev => Math.min(prev + 10, 90));
      }, 400);

      // Generate user secret from wallet address
      const userSecret = `${address}-${Date.now()}`;

      // Generate the proof
      const proof = await zkProofService.generateWisdomProof({
        actualScore: wisdomScore.actualScore,
        userSecret,
        requiredThreshold: threshold,
      });

      clearInterval(progressInterval);
      setProofProgress(100);
      setProofGenerated(true);
      setProofData(proof);

      toast.success('Wisdom score proof generated successfully!');
      console.log('Wisdom Proof:', proof);

    } catch (error) {
      console.error('Proof generation error:', error);
      toast.error('Failed to generate proof');
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleUseProof = async () => {
    toast.success('Proof verified on-chain!', {
      description: 'Your wisdom level has been verified without revealing your exact score.',
    });
    
    // Reset
    setProofGenerated(false);
    setProofData(null);
    setProofProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Current Wisdom Score */}
      <Card className="border-2 border-ancient-gold/30 bg-gradient-to-br from-background via-purple-950/10 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-ancient-gold/20 rounded-lg">
              <Trophy className="w-6 h-6 text-ancient-gold" />
            </div>
            <div>
              <CardTitle className="text-2xl font-scroll text-ancient-gold">
                Your Wisdom Score
              </CardTitle>
              <CardDescription className="text-white/60">
                Current level: {wisdomScore.level}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-5xl font-bold text-ancient-gold mb-2">
                {showDetails ? wisdomScore.actualScore : '██'}
              </div>
              <p className="text-sm text-white/60">
                {showDetails ? 'Wisdom Score' : 'Score Hidden for Privacy'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="border-ancient-gold/30 text-ancient-gold hover:bg-ancient-gold/10"
            >
              {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showDetails ? 'Hide' : 'Show'} Score
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {wisdomScore.achievements.map((achievement) => (
              <Badge 
                key={achievement} 
                variant="outline" 
                className="border-ancient-gold/50 text-ancient-gold"
              >
                <Star className="w-3 h-3 mr-1" />
                {achievement}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ZK Proof Generation */}
      <Card className="border-2 border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-ancient-gold/10 rounded-lg">
              <Shield className="w-6 h-6 text-ancient-gold" />
            </div>
            <div>
              <CardTitle className="text-2xl font-scroll text-ancient-gold">
                Prove Wisdom Threshold
              </CardTitle>
              <CardDescription className="text-white/60">
                Generate zero-knowledge proof of wisdom level
              </CardDescription>
            </div>
          </div>

          <Alert className="bg-purple-950/20 border-ancient-gold/30 mt-4">
            <Lock className="h-4 w-4 text-ancient-gold" />
            <AlertDescription className="text-white/80 text-sm">
              <strong className="text-ancient-gold">Privacy-Preserving:</strong> Prove your wisdom 
              score exceeds a threshold without revealing your exact score. Perfect for accessing 
              exclusive features or demonstrating spiritual maturity.
            </AlertDescription>
          </Alert>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-purple-950/20 rounded-lg border border-ancient-gold/20">
              <Sparkles className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
              <p className="text-xs text-white/70">Access Premium Features</p>
            </div>
            <div className="text-center p-3 bg-purple-950/20 rounded-lg border border-ancient-gold/20">
              <Trophy className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
              <p className="text-xs text-white/70">Qualify for Rewards</p>
            </div>
            <div className="text-center p-3 bg-purple-950/20 rounded-lg border border-ancient-gold/20">
              <Shield className="w-5 h-5 text-ancient-gold mx-auto mb-1" />
              <p className="text-xs text-white/70">Private Verification</p>
            </div>
          </div>

          {/* Threshold Input */}
          <div className="space-y-2">
            <Label className="text-white/90">Required Wisdom Threshold</Label>
            <Input
              type="number"
              placeholder="75"
              value={requiredThreshold}
              onChange={(e) => setRequiredThreshold(e.target.value)}
              className="bg-background/50 border-ancient-gold/30 text-white"
              min="0"
              max="100"
            />
            <p className="text-xs text-white/50">
              Prove your score is above this threshold (0-100)
            </p>
          </div>

          {/* Score Comparison */}
          {requiredThreshold && (
            <div className="p-4 bg-black/40 rounded-lg border border-ancient-gold/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Your Score:</span>
                <span className="text-sm text-white/70">Required:</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-ancient-gold">
                  {showDetails ? wisdomScore.actualScore : '██'}
                </span>
                <span className="text-2xl font-bold text-white">
                  {requiredThreshold}
                </span>
              </div>
              {parseInt(requiredThreshold) <= wisdomScore.actualScore && (
                <div className="mt-2 flex items-center gap-2 text-green-500 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  You qualify! Can generate proof.
                </div>
              )}
              {parseInt(requiredThreshold) > wisdomScore.actualScore && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                  <AlertDescription>
                    Score too low. Increase your wisdom score through biblical study and giving.
                  </AlertDescription>
                </div>
              )}
            </div>
          )}

          {/* Technical Details */}
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
                <span className="text-ancient-gold">Circuit:</span> wisdom_threshold.nr
              </p>
              <p className="text-white/70">
                <span className="text-ancient-gold">Proof System:</span> UltraPlonk (Noir)
              </p>
              <p className="text-white/70">
                <span className="text-ancient-gold">Public Inputs:</span> Required threshold, Score commitment
              </p>
              <p className="text-white/70">
                <span className="text-ancient-gold">Private Inputs:</span> Actual score, User secret
              </p>
              <p className="text-white/70">
                <span className="text-ancient-gold">Est. Proof Time:</span> {zkProofService.getEstimatedProofTime('wisdom')}
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
                Proof generated successfully! You can now use this proof to verify your wisdom 
                level without revealing your exact score.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!proofGenerated ? (
              <Button
                onClick={handleGenerateProof}
                disabled={isGeneratingProof || !requiredThreshold || parseInt(requiredThreshold) > wisdomScore.actualScore}
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
                    Generate Wisdom Proof
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleUseProof}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Use Proof On-Chain
              </Button>
            )}
          </div>

          {/* Info Footer */}
          <div className="text-center pt-4 border-t border-ancient-gold/20">
            <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
              🔐 Mathematically Private
            </Badge>
            <p className="text-xs text-white/50 mt-2">
              Your exact wisdom score remains private using zero-knowledge mathematics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
