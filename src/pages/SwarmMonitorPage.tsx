/**
 * SwarmMonitorPage
 *
 * Live dashboard for the full BWTYA agent swarm. Shows:
 *  - One-click "Run Swarm" trigger
 *  - Sub-agent execution trace (step-by-step with timings)
 *  - Whale signals
 *  - Arbitrage signals
 *  - DCA signals
 *  - Top scored opportunities (from the running swarm + DB cache)
 *  - Fear & Greed index
 *
 * "The heart of the discerning acquires knowledge; the ears of the wise
 *  seek it out." — Proverbs 18:15
 */

import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Cpu,
  DollarSign,
  RefreshCw,
  Shield,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from '@/components/home/NeuralNetworkBackground';
import { useBWTYASwarm } from '@/hooks/useBWTYASwarm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GRADE_STYLES: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  B: 'bg-green-500/20 text-green-400 border-green-500/30',
  C: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  F: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STEP_STATUS_ICON = {
  completed: <CheckCircle className="w-4 h-4 text-green-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  running: <Activity className="w-4 h-4 text-blue-400 animate-pulse" />,
};

const fgiColor = (v: number) =>
  v >= 75 ? 'text-red-400' : v >= 55 ? 'text-orange-400' : v >= 45 ? 'text-yellow-400' : v >= 25 ? 'text-blue-400' : 'text-emerald-400';

// ---------------------------------------------------------------------------
// SwarmMonitorPage
// ---------------------------------------------------------------------------

const SwarmMonitorPage: React.FC = () => {
  const { result, dbScores, loading, error, lastRun, run, reset } = useBWTYASwarm();
  const [wisdomScore] = useState(50);
  const [capitalUsd] = useState(10_000);

  const handleRunSwarm = () => {
    run(wisdomScore, capitalUsd, 'moderate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-amber-950/10 to-black relative">
      <div className="absolute inset-0 overflow-hidden">
        <NeuralNetworkBackground opacity={0.1} paletteIndex={1} />
      </div>

      <div className="relative z-10">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Cpu className="w-8 h-8 text-amber-400" />
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    BWTYA Swarm Monitor
                  </h1>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Activity className="w-3 h-3 mr-1 animate-pulse" />LIVE
                  </Badge>
                </div>
                <p className="text-white/50 text-sm">
                  Biblical-Wisdom-To-Yield-Algorithm · Multi-Agent Swarm · Real-time Execution Trace
                </p>
                {lastRun && (
                  <p className="text-white/30 text-xs mt-1">
                    Last run: {lastRun.toLocaleString()} ·{' '}
                    {result && `${result.processingTimeMs}ms`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {result && (
                  <Button variant="outline" size="sm" onClick={reset} className="text-white/50 border-white/20">
                    Clear
                  </Button>
                )}
                <Button
                  onClick={handleRunSwarm}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-500 text-white gap-2"
                >
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />Running Swarm…</>
                  ) : (
                    <><Zap className="w-4 h-4" />Run BWTYA Swarm</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-800/40 bg-red-950/30 flex items-center gap-3 text-red-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Fear & Greed + Strategy — top summary row */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-4 text-center">
                    <p className={`text-3xl font-bold ${fgiColor(result.fearGreedIndex)}`}>
                      {result.fearGreedIndex}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Fear &amp; Greed ({result.fearGreedLabel})
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {result.bwtyaResult.projectedApy.toFixed(1)}%
                    </p>
                    <p className="text-xs text-white/40 mt-1">Projected APY</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">
                      ${result.bwtyaResult.titheAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/40 mt-1">Tithe Reserved</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-4 text-center">
                    <p className="text-lg font-bold text-purple-400 leading-tight mt-1">
                      {result.bwtyaResult.recommendedStrategy.name}
                    </p>
                    <p className="text-xs text-white/40">Strategy</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sub-agent Execution Trace */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Agent Execution Trace
                  {loading && <Badge className="bg-blue-500/20 text-blue-400 text-xs ml-auto">Running…</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-2">
                    {result.subAgentSteps.map((step, i) => (
                      <motion.div
                        key={step.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {STEP_STATUS_ICON[step.status] ?? null}
                          <div className="min-w-0">
                            <p className="text-xs font-mono text-white/80 truncate">{step.name}</p>
                            {step.output && (
                              <p className="text-[10px] text-white/40 truncate">{step.output}</p>
                            )}
                            {step.error && (
                              <p className="text-[10px] text-red-400 truncate">{step.error}</p>
                            )}
                          </div>
                        </div>
                        {step.durationMs !== undefined && (
                          <span className="text-[10px] text-white/30 shrink-0 ml-2">{step.durationMs}ms</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-white/30">
                    <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Click "Run BWTYA Swarm" to start the agent pipeline.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signals Column */}
            <div className="space-y-4">
              {/* Whale Signals */}
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-red-400" />
                    Whale Signals
                    {result && (
                      <Badge className="bg-red-500/20 text-red-400 text-xs ml-auto">
                        {result.whaleSignals.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result?.whaleSignals.length ? (
                    <div className="space-y-2">
                      {result.whaleSignals.map((sig, i) => (
                        <div key={i} className="p-2 rounded bg-white/5 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white/80">{sig.protocol}</span>
                            <Badge className="text-[9px] bg-red-500/20 text-red-400">{sig.type.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-white/50 italic">"{sig.biblicalWisdom}"</p>
                          <p className="text-amber-500/70 mt-0.5">— {sig.scripture}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-white/30 text-xs py-4">No whale signals detected.</p>
                  )}
                </CardContent>
              </Card>

              {/* Arbitrage Signals */}
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Arbitrage Signals
                    {result && (
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs ml-auto">
                        {result.arbitrageSignals.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result?.arbitrageSignals.length ? (
                    <div className="space-y-2">
                      {result.arbitrageSignals.map((sig, i) => (
                        <div key={i} className="p-2 rounded bg-white/5 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white/80">{sig.tokenPair}</span>
                            <span className="text-emerald-400 font-bold">+{sig.spreadPercent.toFixed(1)}%</span>
                          </div>
                          <p className="text-white/50">
                            {sig.sourceProtocol} → {sig.targetProtocol}
                          </p>
                          <p className="text-white/30 text-[10px] italic mt-0.5">{sig.biblicalNote.split('(')[0]}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-white/30 text-xs py-4">No arbitrage spreads detected.</p>
                  )}
                </CardContent>
              </Card>

              {/* DCA Signals */}
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-green-400" />
                    DCA Signals
                    {result && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs ml-auto">
                        {result.dcaSignals.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result?.dcaSignals.length ? (
                    <div className="space-y-2">
                      {result.dcaSignals.map((sig, i) => (
                        <div key={i} className="p-2 rounded bg-white/5 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white/80">{sig.protocol} · {sig.tokenSymbol}</span>
                            <span className="text-emerald-400">{sig.currentApy.toFixed(1)}% APY</span>
                          </div>
                          <p className="text-white/50">{sig.dcaRecommendation.split('–')[0].trim()}</p>
                          <p className="text-amber-500/70 text-[10px] mt-0.5">
                            Every {sig.intervalDays}d · {sig.scripture}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-white/30 text-xs py-4">No DCA signals active.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Biblical Sentiment Banner */}
          {result?.biblicalSentiment && (
            <Card className="mb-6 bg-amber-950/20 border-amber-800/30">
              <CardContent className="py-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-200 italic">{result.biblicalSentiment}</p>
              </CardContent>
            </Card>
          )}

          {/* Scored Opportunities — live + DB */}
          <Card className="bg-card/30 border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                Scored Opportunities
                <span className="text-white/40 text-sm font-normal ml-1">
                  {result
                    ? `(${result.bwtyaResult.scoredOpportunities.length} from current run)`
                    : dbScores.length > 0
                    ? `(${dbScores.length} from database)`
                    : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(result?.bwtyaResult.scoredOpportunities.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {result!.bwtyaResult.scoredOpportunities.slice(0, 10).map((scored, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-amber-400 w-8 shrink-0">
                          {scored.bwtyaScore}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-white/90 font-medium truncate">
                            {scored.opportunity.protocol} — {scored.opportunity.poolName}
                          </p>
                          <p className="text-xs text-white/40 truncate">{scored.biblicalRationale}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-emerald-400">{scored.opportunity.apy.toFixed(1)}%</span>
                        <Badge className={`text-xs border ${GRADE_STYLES[scored.stewardshipGrade] ?? ''}`}>
                          {scored.stewardshipGrade}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : dbScores.length > 0 ? (
                <div className="space-y-2">
                  {dbScores.map((score, i) => (
                    <div key={score.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-amber-400 w-10 shrink-0">
                          {score.bwtya_score.toFixed(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-white/90 font-medium truncate">
                            {score.protocol_name} — {score.pool_name}
                          </p>
                          <p className="text-xs text-white/40 truncate">{score.biblical_rationale}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-emerald-400">{score.apy?.toFixed(1)}%</span>
                        <Badge className={`text-xs border ${GRADE_STYLES[score.stewardship_grade] ?? ''}`}>
                          {score.stewardship_grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-white/30">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    Run the swarm to score live Base chain opportunities.
                  </p>
                  <p className="text-xs mt-1">Or wait for server-side agent to populate scores.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
};

export default SwarmMonitorPage;
