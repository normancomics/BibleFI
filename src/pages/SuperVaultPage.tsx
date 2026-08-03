/**
 * SuperVault — /vault
 *
 * BibleFi's integration of SuperVault, a Superfluid-native stable-yield vault:
 * deposit USDC, and yield streams back to your wallet every second as USDCx.
 * Here it is scored by BWTYA (the Biblical-Wisdom-To-Yield-Algorithm) and its
 * live on-chain state is displayed.
 *
 * ⚠️ Experimental: the deployed vault is a "Technical Demo". Reads/scoring are
 * live; real-funds deposits are gated (Phase 2) and clearly labelled.
 *
 * "The wise store up choice food and olive oil." — Proverbs 21:20
 */
import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Waves, BookOpen, AlertTriangle, TrendingUp, Shield, Droplets } from 'lucide-react';
import { superVaultClient, type SuperVaultState } from '@/integrations/supervault/client';
import { bwtyaScorer } from '@/services/bwtya/scorer';
import type { ScoredOpportunity } from '@/services/bwtya/types';

const GRADE_COLOR: Record<string, string> = {
  A: 'text-green-400 border-green-500/40', B: 'text-blue-400 border-blue-500/40',
  C: 'text-yellow-400 border-yellow-500/40', D: 'text-orange-400 border-orange-500/40',
  F: 'text-red-400 border-red-500/40',
};

const SuperVaultPage: React.FC = () => {
  const [state, setState] = useState<SuperVaultState | null>(null);
  const [scored, setScored] = useState<ScoredOpportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, opp] = await Promise.all([
          superVaultClient.getState(),
          superVaultClient.toYieldOpportunity(),
        ]);
        if (cancelled) return;
        setState(s);
        setScored(bwtyaScorer.score(opp));
      } catch {
        // leave nulls; UI shows unavailable
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const grade = scored?.stewardshipGrade ?? '—';

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <Waves className="h-7 w-7 text-ancient-gold" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ancient-gold to-eboy-green bg-clip-text text-transparent">
              SuperVault
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Superfluid-native stable yield — deposit USDC, yield streams back every second, scored by BWTYA.
          </p>
        </motion.div>

        <Alert className="bg-yellow-950/20 border-yellow-500/40 mb-4">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm">
            <strong className="text-yellow-500">Experimental (Technical Demo).</strong> Scoring and live
            stats are real on-chain reads. Real-funds deposits are not enabled on this deployment.
          </AlertDescription>
        </Alert>

        {/* Live vault stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: TrendingUp, label: 'Stable Yield', value: state ? `${state.yieldRatePct}%` : '—' },
            { icon: Droplets, label: 'TVL', value: state ? `$${state.tvlUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—' },
            { icon: Shield, label: 'Protocol Fee', value: state ? `${state.feePct}%` : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="bg-card/60 border-ancient-gold/20">
              <CardContent className="p-3 text-center">
                <Icon className="h-4 w-4 text-ancient-gold mx-auto mb-1" />
                <div className="text-lg font-bold">{loading ? '…' : value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* BWTYA biblical score */}
        <Card className="bg-card/60 backdrop-blur-sm border-eboy-green/30 mb-4">
          <CardHeader className="py-4 px-5">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-eboy-green" />BWTYA Biblical Score</span>
              <Badge variant="outline" className={`text-lg font-bold ${GRADE_COLOR[grade] ?? ''}`}>{grade}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {scored ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">BWTYA Score</span>
                  <span className="font-semibold text-ancient-gold">{Math.round(scored.bwtyaScore)}/100</span>
                </div>
                {[
                  ['Fruit-bearing (John 15:16)', scored.fruitBearingScore, 30],
                  ['Faithfulness (Matthew 25:14)', scored.faithfulnessScore, 25],
                  ['Biblical alignment (Proverbs 3:9)', scored.biblicalAlignmentScore, 25],
                  ['Transparency (Luke 16:10)', scored.transparencyScore, 20],
                ].map(([label, val, max]) => (
                  <div key={label as string} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{label}</span><span>{Math.round(val as number)}/{max}</span>
                    </div>
                    <Progress value={((val as number) / (max as number)) * 100} className="h-1.5" />
                  </div>
                ))}
                <Alert className="bg-purple-950/20 border-ancient-gold/30 mt-2">
                  <BookOpen className="h-4 w-4 text-ancient-gold" />
                  <AlertDescription className="text-xs italic">{scored.biblicalRationale}</AlertDescription>
                </Alert>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{loading ? 'Scoring live vault…' : 'Vault state unavailable right now.'}</p>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Yield streams as USDCx via Superfluid — the same super token BibleFi uses for tithe streams.
          Phase 2: deposit/redeem and "yield that tithes itself" (auto-stream a portion of vault yield to your church).
        </p>
      </main>
    </div>
  );
};

export default SuperVaultPage;
