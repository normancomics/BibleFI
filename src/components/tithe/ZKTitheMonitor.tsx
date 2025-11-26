import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  TrendingUp, 
  Users, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAccount } from 'wagmi';

interface ZKTitheStats {
  totalAnonymousTithes: number;
  totalChurches: number;
  averageProofTime: number;
  successRate: number;
  totalVolume: string;
  last24Hours: number;
}

interface RecentProof {
  id: string;
  timestamp: Date;
  churchName: string;
  proofType: string;
  status: 'verified' | 'pending' | 'failed';
}

export const ZKTitheMonitor: React.FC = () => {
  const { address } = useAccount();
  const [stats, setStats] = useState<ZKTitheStats>({
    totalAnonymousTithes: 1247,
    totalChurches: 156,
    averageProofTime: 6.2,
    successRate: 98.5,
    totalVolume: '2,450,000',
    last24Hours: 89,
  });

  const [recentProofs, setRecentProofs] = useState<RecentProof[]>([
    {
      id: '0x1a2b3c',
      timestamp: new Date(Date.now() - 300000),
      churchName: 'Anonymous Church',
      proofType: 'Tithe Threshold',
      status: 'verified',
    },
    {
      id: '0x4d5e6f',
      timestamp: new Date(Date.now() - 600000),
      churchName: 'Anonymous Church',
      proofType: 'Tithe Threshold',
      status: 'verified',
    },
    {
      id: '0x7g8h9i',
      timestamp: new Date(Date.now() - 900000),
      churchName: 'Anonymous Church',
      proofType: 'Tithe Threshold',
      status: 'verified',
    },
  ]);

  const [showIdentities, setShowIdentities] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-scroll text-ancient-gold mb-2">
            ZK Tithe Monitor
          </h2>
          <p className="text-white/60">
            Real-time zero-knowledge proof monitoring for anonymous tithing
          </p>
        </div>
        <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
          <Shield className="w-4 h-4 mr-2" />
          Privacy Protected
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Shield className="w-4 h-4 text-ancient-gold" />
              Total Anonymous Tithes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ancient-gold">
              {stats.totalAnonymousTithes.toLocaleString()}
            </div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{stats.last24Hours} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Users className="w-4 h-4 text-ancient-gold" />
              Participating Churches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ancient-gold">
              {stats.totalChurches}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Accepting anonymous tithes
            </p>
          </CardContent>
        </Card>

        <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Activity className="w-4 h-4 text-ancient-gold" />
              Proof Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ancient-gold">
              {stats.successRate}%
            </div>
            <Progress value={stats.successRate} className="mt-2 bg-purple-950/30" />
          </CardContent>
        </Card>

        <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Lock className="w-4 h-4 text-ancient-gold" />
              Total Volume (USDC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ancient-gold">
              ${stats.totalVolume}
            </div>
            <p className="text-xs text-white/50 mt-1">
              All-time anonymous donations
            </p>
          </CardContent>
        </Card>

        <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70">
              Avg Proof Generation Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ancient-gold">
              {stats.averageProofTime}s
            </div>
            <p className="text-xs text-white/50 mt-1">
              Client-side ZK computation
            </p>
          </CardContent>
        </Card>

        <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              On-Chain Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ancient-gold">
              {(stats.totalAnonymousTithes * stats.successRate / 100).toFixed(0)}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Successfully verified proofs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Guarantee */}
      <Alert className="bg-purple-950/20 border-ancient-gold/30">
        <Lock className="h-4 w-4 text-ancient-gold" />
        <AlertDescription className="text-white/80">
          <strong className="text-ancient-gold">Zero-Knowledge Privacy:</strong> All tithe amounts 
          and donor identities are cryptographically hidden. Only proof of minimum threshold is 
          revealed on-chain. Matthew 6:3-4 implemented through mathematics.
        </AlertDescription>
      </Alert>

      {/* Recent Proofs */}
      <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-scroll text-ancient-gold">
                Recent Anonymous Proofs
              </CardTitle>
              <CardDescription className="text-white/60">
                Latest zero-knowledge tithe verifications
              </CardDescription>
            </div>
            <button
              onClick={() => setShowIdentities(!showIdentities)}
              className="flex items-center gap-2 text-sm text-ancient-gold hover:text-ancient-gold/80 transition-colors"
            >
              {showIdentities ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show Details
                </>
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProofs.map((proof) => (
              <div
                key={proof.id}
                className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-ancient-gold/20"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(proof.status)}
                  <div>
                    <p className="text-white font-medium">
                      {showIdentities ? proof.churchName : '████████████'}
                    </p>
                    <p className="text-xs text-white/50">
                      Proof ID: {proof.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
                    {proof.proofType}
                  </Badge>
                  <p className="text-xs text-white/50 mt-1">
                    {proof.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="border-ancient-gold/20 bg-gradient-to-br from-background via-purple-950/5 to-background">
        <CardHeader>
          <CardTitle className="text-xl font-scroll text-ancient-gold">
            ZK Implementation Details
          </CardTitle>
          <CardDescription className="text-white/60">
            Technical architecture for anonymous tithing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-lg border border-ancient-gold/20">
              <h4 className="text-ancient-gold font-semibold mb-2">Proof System</h4>
              <ul className="space-y-1 text-sm text-white/70">
                <li>• <span className="text-ancient-gold">Circuit:</span> Noir (UltraPlonk)</li>
                <li>• <span className="text-ancient-gold">Backend:</span> Barretenberg</li>
                <li>• <span className="text-ancient-gold">Verification:</span> On-chain (Base)</li>
              </ul>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-ancient-gold/20">
              <h4 className="text-ancient-gold font-semibold mb-2">Privacy Guarantees</h4>
              <ul className="space-y-1 text-sm text-white/70">
                <li>• <span className="text-ancient-gold">Amount:</span> Cryptographically hidden</li>
                <li>• <span className="text-ancient-gold">Identity:</span> Never revealed</li>
                <li>• <span className="text-ancient-gold">Church:</span> Only recipient known</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-black/40 rounded-lg border border-ancient-gold/20">
            <h4 className="text-ancient-gold font-semibold mb-2">What Gets Proven</h4>
            <p className="text-sm text-white/70 mb-2">
              Each anonymous tithe proves the following statements WITHOUT revealing the actual amount:
            </p>
            <ul className="space-y-1 text-sm text-white/70 ml-4">
              <li>✓ Tithe amount meets minimum threshold</li>
              <li>✓ Commitment matches the secret inputs</li>
              <li>✓ Church is verified and registered</li>
              <li>✓ Proof cannot be reused (nullifier prevents double-spend)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
