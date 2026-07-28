/**
 * SuperBoring — /dca
 *
 * BibleFi's integration of SuperBoring, a Superfluid-native streaming DCA
 * (dollar-cost-averaging) protocol on Base. You stream an in-token into a TOREX
 * market and it continuously DCAs into the out-token, streaming it back plus
 * BORING + SUP emissions. Each market is scored by BWTYA.
 *
 * DCA is a core biblical stewardship principle — "He who gathers money little
 * by little makes it grow" (Proverbs 13:11), cited in BWTYACore.sol.
 *
 * Reads/scoring are live on-chain; opening a real DCA stream is gated behind
 * VITE_SUPERBORING_LIVE and clearly labelled (non-custodial, user signs).
 */
import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Repeat, BookOpen, AlertTriangle, TrendingUp } from 'lucide-react';
import { superBoringClient } from '@/integrations/superboring/client';
import { bwtyaScorer } from '@/services/bwtya/scorer';
import type { ScoredOpportunity } from '@/services/bwtya/types';
import type { TorexMarket } from '@/config/superboring';

const GRADE_COLOR: Record<string, string> = {
  A: 'text-green-400 border-green-500/40', B: 'text-blue-400 border-blue-500/40',
  C: 'text-yellow-400 border-yellow-500/40', D: 'text-orange-400 border-orange-500/40',
  F: 'text-red-400 border-red-500/40', '—': 'text-muted-foreground border-border',
};

interface ScoredMarket {
  market: TorexMarket;
  scored: ScoredOpportunity | null;
  live: boolean;
}

const SuperBoringPage: React.FC = () => {
  const [rows, setRows] = useState<ScoredMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const opps = superBoringClient.toDcaOpportunities();
        const markets = superBoringClient.markets;
        // Score each market; confirm it's live on-chain via getPairedTokens.
        const scoredRows = await Promise.all(
          markets.map(async (market, i) => {
            let live = false;
            try {
              live = (await superBoringClient.getPairedTokens(market.torex)) !== null;
            } catch { /* leave false */ }
            return { market, scored: bwtyaScorer.score(opps[i]), live };
          }),
        );
        if (!cancelled) setRows(scoredRows);
      } catch {
        // leave empty; UI shows unavailable
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-ancient-gold/10 rounded-lg">
              <Repeat className="w-6 h-6 text-ancient-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ancient-gold">SuperBoring DCA</h1>
              <p className="text-sm text-muted-foreground">
                Streaming dollar-cost-averaging on Base, scored by BWTYA
              </p>
            </div>
          </div>

          <Alert className="bg-purple-950/20 border-ancient-gold/30 my-4">
            <BookOpen className="h-4 w-4 text-ancient-gold" />
            <AlertDescription className="text-sm">
              <strong className="text-ancient-gold">Proverbs 13:11:</strong> "He who gathers money
              little by little makes it grow." DCA turns disciplined, steady giving and investing into
              a real-time stream — no lump-sum timing risk.
            </AlertDescription>
          </Alert>

          {!superBoringClient.isLive() && (
            <Alert className="bg-yellow-950/20 border-yellow-500/30 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-sm">
                Preview: market data and BWTYA scoring are live on-chain. Opening a real DCA stream is
                not yet enabled on this deployment (no funds move). Non-custodial — your wallet signs.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading DCA markets…</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">DCA markets unavailable right now.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map(({ market, scored, live }) => {
                const grade = scored?.stewardshipGrade ?? '—';
                return (
                  <Card key={market.torex} className="border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{market.label}</CardTitle>
                        <Badge variant="outline" className={GRADE_COLOR[grade]}>
                          Grade {grade}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Stream in</span><span className="font-mono">{market.inSymbol}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Accumulate</span><span className="font-mono">{market.outSymbol}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>BWTYA score</span>
                        <span className="flex items-center gap-1 text-ancient-gold">
                          <TrendingUp className="w-3 h-3" />{scored?.bwtyaScore ?? '—'}/100
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Market</span>
                        <span className={live ? 'text-green-400' : 'text-muted-foreground'}>
                          {live ? 'live on-chain' : 'unverified'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default SuperBoringPage;
