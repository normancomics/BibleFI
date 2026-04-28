import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Activity, Shield, Coins, BarChart3, Clock, Cpu, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from '@/components/home/NeuralNetworkBackground';
import { useBWTYASwarm } from '@/hooks/useBWTYASwarm';
import { useAgentRealTime } from '@/hooks/useAgentRealTime';

const BWTYAAgentsPage: React.FC = () => {
  const { agentStats, loading: statsLoading } = useAgentRealTime();
  const { result, dbScores, loading, error, lastRun, run } = useBWTYASwarm(true);

  // Use live result if available, else fall back to DB scores for display
  const bwtyaResult = result?.bwtyaResult ?? null;

  const gradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-emerald-400 bg-emerald-500/20';
      case 'B': return 'text-green-400 bg-green-500/20';
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
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
                {lastRun && (
                  <p className="text-white/30 text-xs mt-1">Last run: {lastRun.toLocaleString()}</p>
                )}
              </div>
              <Button
                onClick={() => run(50, 10000, 'moderate')}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-500 text-white gap-2 shrink-0"
              >
                {loading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" />Running…</>
                  : <><Zap className="w-4 h-4" />Run Swarm</>}
              </Button>
            </div>
          </motion.div>

          {/* BWTYA Pipeline Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Market Scanner', desc: 'Live DeFiLlama TVL/APY for Base protocols', icon: <BarChart3 className="w-5 h-5" />, status: 'active' },
              { label: 'Whale Tracker', desc: 'Detects large capital movements', icon: <TrendingUp className="w-5 h-5" />, status: 'active' },
              { label: 'Arbitrage Scanner', desc: 'Cross-protocol APY spread scanner', icon: <Shield className="w-5 h-5" />, status: 'active' },
              { label: 'DCA Generator', desc: 'Faith-aligned DCA opportunity signals', icon: <Coins className="w-5 h-5" />, status: 'active' },
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

          {/* Sub-agent execution steps */}
          {result && result.subAgentSteps.length > 0 && (
            <Card className="bg-card/30 border-border/50 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Sub-Agent Execution Trace
                  <span className="text-white/30 text-xs font-normal ml-1">({result.processingTimeMs}ms)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {result.subAgentSteps.map((step, i) => (
                    <div key={i} className="p-2 rounded bg-white/5 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${step.status === 'completed' ? 'bg-green-500' : step.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-white/80 truncate">{step.name}</p>
                        {step.durationMs !== undefined && (
                          <p className="text-[10px] text-white/30">{step.durationMs}ms</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* DB cached scores when no live run yet */}
          {!bwtyaResult && dbScores.length > 0 && (
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  Latest Scored Opportunities (from database)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dbScores.slice(0, 10).map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-ancient-gold w-10">{score.bwtya_score.toFixed(0)}</span>
                        <div>
                          <span className="text-sm text-white/90">{score.protocol_name} — {score.pool_name}</span>
                          {score.biblical_rationale && (
                            <div className="text-xs text-white/40">{score.biblical_rationale}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {score.apy != null && <span className="text-xs text-green-400">{score.apy.toFixed(1)}%</span>}
                        <Badge className={gradeColor(score.stewardship_grade)}>{score.stewardship_grade}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {loading && !bwtyaResult && (
            <div className="text-center py-12 text-white/40">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
              Loading BWTYA swarm…
            </div>
          )}

          {error && (
            <div className="text-center py-6 text-red-400 text-sm">{error}</div>
          )}

          {/* Agent run stats from DB */}
          {agentStats && (
            <Card className="bg-card/30 border-border/50 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Recent Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-center py-4 text-white/40">Loading…</div>
                ) : agentStats.recent_runs?.length > 0 ? (
                  <div className="space-y-2">
                    {agentStats.recent_runs.slice(0, 5).map((run: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <span className="font-mono text-xs text-white/80">{run.agent_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{new Date(run.started_at).toLocaleString()}</span>
                          <Badge className={run.status === 'completed' ? 'bg-green-500/20 text-green-400' : run.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}>
                            {run.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-white/40 text-sm">Agent runs will appear here as they execute.</p>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default BWTYAAgentsPage;
