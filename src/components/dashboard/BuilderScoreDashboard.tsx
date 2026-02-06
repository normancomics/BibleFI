import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTalentScore, TalentScoreData, TalentCredential } from '@/hooks/useTalentScore';
import { useWallet } from '@/contexts/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Trophy, Star, Shield, TrendingUp, Search, Loader2,
  Award, Zap, Users, Code, Activity
} from 'lucide-react';

const TIER_CONFIG: Record<string, { color: string; icon: React.ReactNode; gradient: string }> = {
  Novice: { color: 'text-muted-foreground', icon: <Shield className="w-5 h-5" />, gradient: 'from-stone-600 to-stone-800' },
  Apprentice: { color: 'text-blue-400', icon: <Star className="w-5 h-5" />, gradient: 'from-blue-600 to-blue-800' },
  Journeyman: { color: 'text-green-400', icon: <Award className="w-5 h-5" />, gradient: 'from-green-600 to-green-800' },
  Master: { color: 'text-yellow-400', icon: <Trophy className="w-5 h-5" />, gradient: 'from-yellow-600 to-amber-800' },
  Grandmaster: { color: 'text-purple-400', icon: <Zap className="w-5 h-5" />, gradient: 'from-purple-600 to-fuchsia-800' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Activity: <Activity className="w-4 h-4" />,
  Impact: <TrendingUp className="w-4 h-4" />,
  Badge: <Award className="w-4 h-4" />,
  Identity: <Users className="w-4 h-4" />,
  Skills: <Code className="w-4 h-4" />,
};

function ScoreRing({ score, tier }: { score: number; tier: string }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Novice;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="54" fill="none"
          stroke="currentColor"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={config.color}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${config.color}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function CredentialCard({ credential }: { credential: TalentCredential }) {
  const percentage = credential.max_score > 0 ? (credential.points / credential.max_score) * 100 : 0;
  const icon = CATEGORY_ICONS[credential.category] || <Star className="w-4 h-4" />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors cursor-default">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary">{icon}</span>
              <span className="text-xs font-medium truncate flex-1">{credential.name}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {credential.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {credential.readable_value} {credential.uom !== 'boolean' ? credential.uom : ''}
              </span>
              <span className="font-semibold">{credential.points}/{credential.max_score}</span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        <p>{credential.description}</p>
        <p className="text-muted-foreground mt-1">Source: {credential.data_issuer_name}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function TierBadge({ tier, multiplier }: { tier: string; multiplier: number }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Novice;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white`}>
      {config.icon}
      <span className="font-bold">{tier}</span>
      <Badge className="bg-white/20 text-white border-0 text-xs">{multiplier}x APY</Badge>
    </div>
  );
}

export default function BuilderScoreDashboard() {
  const { data, isLoading, error, fetchScore } = useTalentScore();
  const { address, isConnected } = useWallet();
  const [walletInput, setWalletInput] = useState('');

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setWalletInput(address);
      fetchScore(address);
    }
  }, [isConnected, address, fetchScore]);

  const handleLookup = () => {
    if (walletInput.trim()) fetchScore(walletInput.trim());
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="font-mono text-sm"
            />
            <Button onClick={handleLookup} disabled={isLoading || !walletInput.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">Lookup</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 text-center text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Ring */}
            <Card className="bg-card border-border md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Builder Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <ScoreRing score={data.talent_score} tier={data.builder_tier} />
                <TierBadge tier={data.builder_tier} multiplier={data.multiplier} />
                {data.rank_position && (
                  <p className="text-xs text-muted-foreground">
                    Rank #{data.rank_position.toLocaleString()} globally
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-card border-border md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Builder Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{data.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">APY Multiplier</p>
                    <p className="text-2xl font-bold text-secondary">{data.multiplier}x</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Credentials</p>
                    <p className="text-2xl font-bold text-primary">{data.credentials_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Builder Tier</p>
                    <p className="text-lg font-bold">{data.builder_tier}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                    <p className="text-sm font-medium">
                      {data.last_calculated_at
                        ? new Date(data.last_calculated_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Tier Progress */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress to next tier</span>
                    <span>{data.talent_score}/100</span>
                  </div>
                  <div className="relative">
                    <Progress value={data.talent_score} className="h-2" />
                    <div className="flex justify-between mt-1">
                      {[0, 25, 50, 70, 90].map((threshold) => (
                        <div key={threshold} className="text-[10px] text-muted-foreground">{threshold}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scripture */}
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-sm italic text-secondary">
                    "Well done, good and faithful servant! You have been faithful with a few things;
                    I will put you in charge of many things."
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">— Matthew 25:21</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Credentials Grid */}
          {data.credentials.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Verified Credentials ({data.credentials.length} of {data.credentials_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.credentials.map((cred) => (
                    <CredentialCard key={cred.slug} credential={cred} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {!data && !isLoading && !error && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h3 className="text-lg font-semibold mb-2">Builder Score Lookup</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Enter a wallet address to check its Talent Protocol builder score and BibleFi APY multiplier.
            </p>
            <p className="text-xs italic text-secondary">
              "Diligent hands will rule, but laziness ends in forced labor." — Proverbs 12:24
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
