import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Shield, Coins, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from '@/components/home/NeuralNetworkBackground';
import { bwtyaAlgorithm } from '@/services/bwtya/algorithm';
import type { BWTYAResult } from '@/services/bwtya/types';
import { useAgentRealTime } from '@/hooks/useAgentRealTime';

const BWTYAAgentsPage: React.FC = () => {
  const { agentStats, loading: statsLoading, lastUpdate } = useAgentRealTime();
  const [bwtyaResult, setBwtyaResult] = useState<BWTYAResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const sampleOpportunities = [
        { protocol: 'Aave', poolName: 'USDC Lending', tokenSymbol: 'USDC', chain: 'Base', apy: 4.2, tvlUsd: 500000000, riskScore: 15, category: 'Lending', biblicalAlignment: 'Faithful stewardship', isVerified: true, audited: true, transparent: true },
        { protocol: 'Aerodrome', poolName: 'ETH/USDC', tokenSymbol: 'ETH', chain: 'Base', apy: 12.5, tvlUsd: 120000000, riskScore: 35, category: 'DEX LP', biblicalAlignment: 'Diversified sowing', isVerified: true, audited: true, transparent: true },
        { protocol: 'Compound', poolName: 'ETH Supply', tokenSymbol: 'ETH', chain: 'Base', apy: 3.1, tvlUsd: 800000000, riskScore: 10, category: 'Lending', biblicalAlignment: 'Prudent saving', isVerified: true, audited: true, transparent: true },
        { protocol: 'Moonwell', poolName: 'cbETH', tokenSymbol: 'cbETH', chain: 'Base', apy: 5.8, tvlUsd: 90000000, riskScore: 25, category: 'Lending', biblicalAlignment: 'Growth through patience', isVerified: true, audited: true, transparent: true },
        { protocol: 'Morpho', poolName: 'USDC Vault', tokenSymbol: 'USDC', chain: 'Base', apy: 6.2, tvlUsd: 200000000, riskScore: 20, category: 'Vault', biblicalAlignment: 'Storing wisely', isVerified: true, audited: true, transparent: true },
      ];
      const result = bwtyaAlgorithm.run({ opportunities: sampleOpportunities, wisdomScore: 50, capitalUsd: 10000, riskTolerance: 'moderate' });
      setBwtyaResult(result);
    } catch (e) {
      console.error('BWTYA error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const gradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-500/20';
      case 'B': return 'text-blue-400 bg-blue-500/20';
      case 'C': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-red-400 bg-red-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black relative">
      <div className="absolute inset-0 overflow-hidden">
        <NeuralNetworkBackground opacity={0.12} paletteIndex={1} />
      </div>
      <div className="relative z-10">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-ancient-gold" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                BWTYA Agents
              </h1>
              <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />LIVE
              </Badge>
            </div>
            <p className="text-white/60">Biblical-Wisdom-To-Yield-Algorithm — Real-Time Yield Optimization</p>
          </motion.div>

          {/* BWTYA Pipeline Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Scorer', desc: 'Scores opportunities on 4 biblical dimensions', icon: <BarChart3 className="w-5 h-5" />, status: 'active' },
              { label: 'Ranker', desc: 'Ranks by BWTYA score, risk, and TVL', icon: <TrendingUp className="w-5 h-5" />, status: 'active' },
              { label: 'Strategy Mapper', desc: 'Maps to biblical strategies (Joseph/Talents/Solomon)', icon: <Shield className="w-5 h-5" />, status: 'active' },
              { label: 'Tithe Calculator', desc: 'Reserves 10% tithe from projected yield', icon: <Coins className="w-5 h-5" />, status: 'active' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-ancient-gold/5 border-ancient-gold/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-ancient-gold">{item.icon}</span>
                      <span className="font-bold text-sm text-white/90">{item.label}</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto" />
                    </div>
                    <p className="text-xs text-white/50">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Live BWTYA Results */}
          {bwtyaResult && (
            <>
              <Card className="bg-card/30 border-border/50 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-ancient-gold" />
                    Recommended Strategy: {bwtyaResult.recommendedStrategy.name}
                    <Badge className="bg-ancient-gold/20 text-ancient-gold ml-2">{bwtyaResult.recommendedStrategy.scriptureAnchor}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 mb-4">{bwtyaResult.recommendedStrategy.description}</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-ancient-gold">{bwtyaResult.projectedApy.toFixed(2)}%</div>
                      <div className="text-xs text-white/40">Projected APY</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-green-400">${bwtyaResult.yieldAfterTithe.toFixed(2)}</div>
                      <div className="text-xs text-white/40">Yield After Tithe</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-purple-400">${bwtyaResult.titheAmount.toFixed(2)}</div>
                      <div className="text-xs text-white/40">Tithe Reserved (10%)</div>
                    </div>
                  </div>

                  {/* Allocations */}
                  <h4 className="text-sm font-bold text-white/80 mb-2">Allocations</h4>
                  <div className="space-y-2">
                    {bwtyaResult.recommendedStrategy.allocations.map(alloc => (
                      <div key={alloc.opportunityId} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <div>
                          <span className="text-sm font-mono text-white/90">{alloc.protocol}</span>
                          <span className="text-xs text-white/40 ml-2">{alloc.poolName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/60">{alloc.allocationPercent}%</span>
                          <span className="text-xs text-green-400">{alloc.projectedApy.toFixed(1)}% APY</span>
                          <Badge className={gradeColor(alloc.stewardshipGrade)}>{alloc.stewardshipGrade}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scored Opportunities */}
              <Card className="bg-card/30 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Scored Opportunities ({bwtyaResult.scoredOpportunities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bwtyaResult.scoredOpportunities.slice(0, 10).map((scored, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-ancient-gold w-8">{scored.bwtyaScore}</span>
                          <div>
                            <span className="text-sm text-white/90">{scored.opportunity.protocol} — {scored.opportunity.poolName}</span>
                            <div className="text-xs text-white/40">{scored.biblicalRationale}</div>
                          </div>
                        </div>
                        <Badge className={gradeColor(scored.stewardshipGrade)}>{scored.stewardshipGrade}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {loading && <div className="text-center py-12 text-white/40">Loading BWTYA engine...</div>}
        </main>
      </div>
    </div>
  );
};

export default BWTYAAgentsPage;
