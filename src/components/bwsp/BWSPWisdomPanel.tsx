// BWSPWisdomPanel – Main UI panel for the BWSP + BWTYA framework
// Pixel art biblical aesthetic with amber/green color scheme

import { BookOpen, Brain, ChevronRight, Loader2, RefreshCw, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useBWSP } from '@/hooks/useBWSP';
import type { YieldOpportunity } from '@/services/bwtya/types';
import type { StewardshipGrade } from '@/services/bwtya/types';

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function GradeBadge({ grade }: { grade: StewardshipGrade }) {
  const colors: Record<StewardshipGrade, string> = {
    A: 'bg-green-700 text-green-100',
    B: 'bg-amber-600 text-amber-100',
    C: 'bg-yellow-600 text-yellow-100',
    D: 'bg-orange-700 text-orange-100',
    F: 'bg-red-800 text-red-100',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${colors[grade]}`}
    >
      {grade}
    </span>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 text-xs text-amber-300">
      <span>Confidence</span>
      <div className="w-24 h-1.5 bg-stone-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span>{pct}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sample demo opportunities (shown when no external opportunities are passed)
// ---------------------------------------------------------------------------

const DEMO_OPPORTUNITIES: YieldOpportunity[] = [
  {
    protocol: 'Aave',
    poolName: 'USDC Lending',
    tokenSymbol: 'USDC',
    chain: 'Base',
    apy: 4.8,
    tvlUsd: 2_500_000_000,
    riskScore: 15,
    category: 'lending',
    biblicalAlignment: 'faithful stewardship, transparent, audited',
    isVerified: true,
    audited: true,
    transparent: true,
  },
  {
    protocol: 'Uniswap',
    poolName: 'ETH/USDC 0.05%',
    tokenSymbol: 'ETH',
    chain: 'Base',
    apy: 12.4,
    tvlUsd: 800_000_000,
    riskScore: 35,
    category: 'liquidity pool',
    biblicalAlignment: 'community, transparent',
    isVerified: true,
    audited: true,
    transparent: true,
  },
  {
    protocol: 'Compound',
    poolName: 'WBTC Supply',
    tokenSymbol: 'WBTC',
    chain: 'Ethereum',
    apy: 2.1,
    tvlUsd: 1_200_000_000,
    riskScore: 20,
    category: 'lending',
    biblicalAlignment: 'honest, transparent, stewardship',
    isVerified: true,
    audited: true,
    transparent: true,
  },
];

// ---------------------------------------------------------------------------
// BWSPWisdomPanel
// ---------------------------------------------------------------------------

interface BWSPWisdomPanelProps {
  walletAddress?: string;
  wisdomScore?: number;
  availableOpportunities?: YieldOpportunity[];
  capitalUsd?: number;
}

export function BWSPWisdomPanel({
  walletAddress,
  wisdomScore = 0,
  availableOpportunities,
  capitalUsd = 1000,
}: BWSPWisdomPanelProps) {
  const [queryText, setQueryText] = useState('');
  const { bwspResponse, bwtyaResult, isLoading, error, lastQuery, runWisdomQuery, reset } =
    useBWSP();

  const opportunities = availableOpportunities ?? DEMO_OPPORTUNITIES;

  const handleSubmit = async () => {
    if (!queryText.trim()) return;
    await runWisdomQuery(
      {
        text: queryText.trim(),
        walletAddress,
        wisdomScore,
        availableCapital: capitalUsd,
      },
      opportunities,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 font-mono">
      {/* ─────────────────────── Header ─────────────────────── */}
      <Card className="border-2 border-amber-700 bg-stone-950">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-amber-400 text-sm uppercase tracking-widest">
            <Brain className="w-4 h-4" />
            BWSP Wisdom Oracle
            <Badge className="ml-auto text-xs bg-amber-900 text-amber-300 border-amber-700">
              BWSP-v1.0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for biblical yield guidance…"
              className="bg-stone-900 border-amber-800 text-amber-100 placeholder:text-stone-500 focus:border-amber-500 text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !queryText.trim()}
              className="bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
            {bwspResponse && (
              <Button
                variant="outline"
                size="icon"
                onClick={reset}
                className="border-stone-700 text-stone-400 hover:text-amber-300 shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950 border border-red-800 rounded px-2 py-1">
              ⚠️ {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ─────────────────────── Wisdom Result ─────────────────────── */}
      {bwspResponse && (
        <>
          <Card className="border border-amber-800 bg-stone-950">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5" />
                  Biblical Wisdom · {lastQuery}
                </CardTitle>
                <ConfidenceMeter value={bwspResponse.confidenceScore} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary scripture */}
              <div className="bg-amber-950 border border-amber-800 rounded p-3">
                <p className="text-amber-300 text-xs font-semibold mb-1">
                  📖 {bwspResponse.primaryScripture.reference}
                </p>
                <p className="text-amber-100 text-sm italic leading-relaxed">
                  "{bwspResponse.primaryScripture.text}"
                </p>
              </div>

              {/* Guidance */}
              <div>
                <p className="text-amber-500 text-xs font-semibold mb-1 uppercase tracking-wider">
                  Wisdom Guidance
                </p>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {bwspResponse.wisdomGuidance}
                </p>
              </div>

              {/* Financial principle */}
              <div>
                <p className="text-green-500 text-xs font-semibold mb-1 uppercase tracking-wider">
                  Financial Principle
                </p>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {bwspResponse.financialPrinciple}
                </p>
              </div>

              {/* Actionable insight */}
              <div className="bg-green-950 border border-green-800 rounded p-3">
                <p className="text-green-400 text-xs font-semibold mb-1">⚡ Actionable Insight</p>
                <p className="text-stone-200 text-sm leading-relaxed">
                  {bwspResponse.actionableInsight}
                </p>
              </div>

              {/* Supporting scriptures */}
              {bwspResponse.supportingScriptures.length > 0 && (
                <div>
                  <p className="text-amber-500 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Supporting Scriptures
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bwspResponse.supportingScriptures.map((s) => (
                      <Badge
                        key={s.reference}
                        className="bg-stone-800 text-amber-300 border border-amber-800 text-xs"
                        title={s.text}
                      >
                        {s.reference}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Synthesis method */}
              <div className="flex items-center gap-2 pt-1">
                <Badge className="text-xs bg-stone-800 text-stone-400 border-stone-700">
                  {bwspResponse.synthesis.synthesisMethod}
                </Badge>
                <span className="text-stone-600 text-xs">
                  {bwspResponse.processingTimeMs}ms · {bwspResponse.agentSteps.length} steps
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ─────────────────────── BWTYA Strategies ─────────────────────── */}
          {bwtyaResult && (
            <Card className="border border-green-800 bg-stone-950">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-400 text-xs uppercase tracking-widest">
                  <TrendingUp className="w-3.5 h-3.5" />
                  BWTYA Yield Strategies
                  <Badge className="ml-auto text-xs bg-green-900 text-green-300 border-green-800">
                    {bwtyaResult.strategies.length} strateg{bwtyaResult.strategies.length !== 1 ? 'ies' : 'y'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tithe summary */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-amber-950 border border-amber-800 rounded p-2">
                    <p className="text-amber-400 text-xs font-semibold">Proj. APY</p>
                    <p className="text-amber-200 text-sm font-bold">
                      {bwtyaResult.projectedApy.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-stone-800 border border-stone-700 rounded p-2">
                    <p className="text-stone-400 text-xs font-semibold">Tithe Reserve</p>
                    <p className="text-stone-200 text-sm font-bold">
                      ${bwtyaResult.titheAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-950 border border-green-800 rounded p-2">
                    <p className="text-green-400 text-xs font-semibold">Yield After Tithe</p>
                    <p className="text-green-200 text-sm font-bold">
                      ${bwtyaResult.yieldAfterTithe.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Recommended strategy */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-green-400" />
                    <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                      Recommended: {bwtyaResult.recommendedStrategy.name}
                    </p>
                    <Badge className="text-xs bg-stone-800 text-stone-400 border-stone-700">
                      {bwtyaResult.recommendedStrategy.scriptureAnchor}
                    </Badge>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed mb-3">
                    {bwtyaResult.recommendedStrategy.description}
                  </p>

                  {/* Allocations table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-stone-500 border-b border-stone-800">
                          <th className="text-left pb-1">Protocol</th>
                          <th className="text-right pb-1">Alloc.</th>
                          <th className="text-right pb-1">APY</th>
                          <th className="text-right pb-1">After Tithe</th>
                          <th className="text-right pb-1">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bwtyaResult.recommendedStrategy.allocations.map((a) => (
                          <tr
                            key={a.opportunityId}
                            className="border-b border-stone-900 hover:bg-stone-900 transition-colors"
                          >
                            <td className="py-1.5 text-amber-300">
                              {a.protocol}
                              <span className="text-stone-500 ml-1">({a.poolName})</span>
                            </td>
                            <td className="py-1.5 text-right text-stone-300">
                              {a.allocationPercent}%
                            </td>
                            <td className="py-1.5 text-right text-green-400">
                              {a.projectedApy.toFixed(1)}%
                            </td>
                            <td className="py-1.5 text-right text-green-300">
                              {a.projectedYieldAfterTithe.toFixed(1)}%
                            </td>
                            <td className="py-1.5 text-right">
                              <GradeBadge grade={a.stewardshipGrade} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Warning flags */}
                {bwtyaResult.scoredOpportunities
                  .flatMap((s) => s.warningFlags)
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .slice(0, 3)
                  .map((flag) => (
                    <p key={flag} className="text-orange-400 text-xs bg-orange-950 border border-orange-800 rounded px-2 py-1">
                      {flag}
                    </p>
                  ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
