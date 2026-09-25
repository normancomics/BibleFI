/**
 * BWSP → triple-check → BWTYA yield strategy, end to end in one panel.
 *
 * 1. The believer asks a question.
 * 2. BWSP retrieves Scripture, synthesises guidance, then the mandatory
 *    three-way check rules on it (genuine · in context · whole counsel).
 * 3. Only then does BWTYA score live Base pools and name a strategy, with the
 *    check's verdict scaling how much capital may be deployed.
 *
 * "Prove all things; hold fast that which is good" — 1 Thessalonians 5:21 (KJV)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  BookOpen,
  Fingerprint,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useBWSP } from '@/hooks/useBWSP';
import BwspVaultExecution from '@/components/bwsp/BwspVaultExecution';
import { fetchLiveBaseOpportunities } from '@/services/bwtya/liveOpportunities';
import type { YieldOpportunity } from '@/services/bwtya/types';
import { wisdomAuditTrail, type WisdomAuditRecord } from '@/services/audit/wisdomAuditTrail';
import type { TripleCheckVerdict } from '@/services/bwsp/tripleCheck';

const EXAMPLES = [
  'Which return can I take without borrowing?',
  'How much of my gain belongs to the storehouse?',
  'Is chasing the highest advertised return wise?',
  'How should I spread what I have across pools?',
];

const VERDICT_STYLE: Record<
  TripleCheckVerdict,
  { label: string; icon: React.ElementType; className: string; meaning: string }
> = {
  approved: {
    label: 'Confirmed',
    icon: ShieldCheck,
    className: 'border-eboy-green/50 text-eboy-green',
    meaning: 'All three checks passed, so a full strategy may be shown and acted on.',
  },
  flagged: {
    label: 'Needs care',
    icon: ShieldAlert,
    className: 'border-yellow-500/50 text-yellow-500',
    meaning: 'Something did not sit right, so only half of your amount is put to work.',
  },
  quarantined: {
    label: 'Held back',
    icon: ShieldX,
    className: 'border-destructive/50 text-destructive',
    meaning: 'The checks failed, so no money strategy is offered from this answer.',
  },
};

const usd = (value: number) =>
  value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const BwspYieldFlow: React.FC = () => {
  const { bwspResponse, bwtyaResult, isLoading, error, runWisdomQuery, reset } = useBWSP();
  const [question, setQuestion] = useState('');
  const [capital, setCapital] = useState('5000');
  const [audit, setAudit] = useState<WisdomAuditRecord | null>(null);

  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [poolsError, setPoolsError] = useState<string | null>(null);

  const loadPools = useCallback(async () => {
    setPoolsLoading(true);
    setPoolsError(null);
    try {
      const live = await fetchLiveBaseOpportunities();
      setOpportunities(live);
      if (live.length === 0) setPoolsError('No Base pools met the steady-growth filter just now.');
    } catch (caught) {
      setPoolsError(
        caught instanceof Error ? caught.message : 'Could not reach the market data source.',
      );
    } finally {
      setPoolsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const run = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setAudit(null);
      await runWisdomQuery(
        {
          text: trimmed,
          availableCapital: Math.max(0, Number(capital) || 0),
        },
        opportunities,
      );
    },
    [runWisdomQuery, capital, opportunities],
  );

  // Fingerprint every completed run exactly once, keyed by its own timestamp.
  const recordedKey = useMemo(() => bwspResponse?.timestamp ?? null, [bwspResponse]);
  useEffect(() => {
    if (!bwspResponse || !recordedKey) return;
    setAudit(
      wisdomAuditTrail.emit({
        event: 'BWSP_SynthesisChecked',
        verseHash: bwspResponse.tripleCheck.verseHash,
        summary: `Triple-check ${bwspResponse.tripleCheck.verdict} for "${bwspResponse.query.text}"`,
        data: {
          query: bwspResponse.query.text,
          intent: bwspResponse.query.intent ?? 'general_wisdom',
          verdict: bwspResponse.tripleCheck.verdict,
          confidence: bwspResponse.confidenceScore ?? 0,
          primaryReference: bwspResponse.primaryScripture?.reference ?? null,
        },
      }),
    );
  }, [bwspResponse, recordedKey]);

  const verdict = bwspResponse?.tripleCheck.verdict;
  const verdictStyle = verdict ? VERDICT_STYLE[verdict] : null;
  const VerdictIcon = verdictStyle?.icon ?? ShieldCheck;
  const strategy = bwtyaResult?.recommendedStrategy ?? null;

  return (
    <div className="space-y-6">
      {/* Step 1 — the question */}
      <Card className="border-ancient-gold/30 bg-gradient-to-r from-ancient-gold/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <Sparkles className="h-5 w-5" />
            Ask before you invest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SeekHimFirstNote />
          <p className="text-sm text-muted-foreground">
            Your question is answered from Scripture first. That answer is then checked three ways —
            that the passages are genuine, read in context, and not picked to suit the answer — and
            only a passing answer produces a plan for your money.
          </p>
          <Textarea
            rows={3}
            placeholder="Ask about giving, saving, lending, debt, risk…"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            aria-label="Your question"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <Button
                key={example}
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => {
                  setQuestion(example);
                  run(example);
                }}
              >
                {example}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40 space-y-1">
              <Label htmlFor="bwsp-capital" className="text-xs">
                Amount to put to work
              </Label>
              <Input
                id="bwsp-capital"
                inputMode="decimal"
                value={capital}
                onChange={(event) => setCapital(event.target.value.replace(/[^0-9.]/g, ''))}
              />
            </div>
            <Button onClick={() => run(question)} disabled={isLoading || !question.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching Scripture…
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" /> Seek wisdom
                </>
              )}
            </Button>
            {bwspResponse && (
              <Button
                variant="ghost"
                onClick={() => {
                  reset();
                  setAudit(null);
                  setQuestion('');
                }}
              >
                Start over
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={loadPools} disabled={poolsLoading}>
              <RefreshCw className={`mr-2 h-3 w-3 ${poolsLoading ? 'animate-spin' : ''}`} />
              {poolsLoading
                ? 'Reading the market…'
                : `${opportunities.length} live Base pools`}
            </Button>
          </div>
          {poolsError && (
            <p className="flex items-start gap-2 text-xs text-yellow-500">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {poolsError}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">
            The search could not finish: {error}
          </CardContent>
        </Card>
      )}

      {bwspResponse && (
        <>
          {/* Step 2 — the three-way check */}
          {verdictStyle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-3 text-base">
                  <VerdictIcon className="h-5 w-5" />
                  Scripture check
                  <Badge variant="outline" className={verdictStyle.className}>
                    {verdictStyle.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{verdictStyle.meaning}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {bwspResponse.tripleCheck.dimensions?.map((dimension) => (
                    <div key={dimension.name} className="space-y-1 rounded-lg border p-3">
                      <div className="text-sm font-medium capitalize">
                        {dimension.name.replace(/[_-]/g, ' ')}
                      </div>
                      <Progress value={Math.round((dimension.score ?? 0) * 100)} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {Math.round((dimension.score ?? 0) * 100)}%
                        {dimension.notes?.length ? ` · ${dimension.notes.join('; ')}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* What Scripture said */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What Scripture says</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bwspResponse.primaryScripture && (
                <blockquote className="border-l-2 border-ancient-gold pl-4">
                  <p className="italic">"{bwspResponse.primaryScripture.text}"</p>
                  <footer className="mt-1 text-sm text-ancient-gold">
                    {bwspResponse.primaryScripture.reference}
                  </footer>
                </blockquote>
              )}
              <div>
                <h3 className="mb-1 text-sm font-semibold">Guidance</h3>
                <p className="text-sm text-muted-foreground">{bwspResponse.wisdomGuidance}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold">What to do</h3>
                <p className="text-sm text-muted-foreground">{bwspResponse.actionableInsight}</p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 — the yield strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-eboy-green" />
                Your strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!bwtyaResult && (
                <p className="text-sm text-muted-foreground">
                  No live pools were available for a plan. Refresh the market above and ask again.
                </p>
              )}

              {bwtyaResult && (
                <>
                  <div
                    className={`rounded-lg border p-3 text-sm ${
                      bwtyaResult.executionGate.permitted
                        ? 'border-eboy-green/40'
                        : 'border-destructive/40 text-destructive'
                    }`}
                  >
                    {bwtyaResult.executionGate.reason}
                  </div>

                  {strategy && bwtyaResult.executionGate.permitted ? (
                    <>
                      <div>
                        <div className="text-lg font-semibold">{strategy.name}</div>
                        <div className="text-sm text-ancient-gold">{strategy.scriptureAnchor}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{strategy.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          {
                            label: 'Expected return',
                            value: `${bwtyaResult.projectedApy.toFixed(2)}%`,
                          },
                          {
                            label: 'Tithe first (10%)',
                            value: usd(bwtyaResult.titheAmount),
                          },
                          {
                            label: 'Yours after the tithe',
                            value: usd(bwtyaResult.yieldAfterTithe),
                          },
                          {
                            label: 'In a bad year',
                            value: `${bwtyaResult.projectedApyP10.toFixed(2)}%`,
                          },
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                            <div className="font-semibold">{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {strategy.allocations.map((allocation) => (
                          <div
                            key={allocation.opportunityId}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {allocation.protocol} · {allocation.poolName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {allocation.projectedApy.toFixed(2)}% expected · grade{' '}
                                {allocation.stewardshipGrade}
                              </div>
                            </div>
                            <Badge variant="outline">
                              {allocation.allocationPercent.toFixed(0)}%
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Returns change constantly and are never promised. The tithe is set aside
                        before anything else — "The tithe is the LORD's" (Leviticus 27:30).
                      </p>

                      <BwspVaultExecution
                        strategyName={strategy.name}
                        suggestedAmount={
                          (Math.max(0, Number(capital) || 0)) *
                          (bwtyaResult.executionGate.capitalScalar ?? 1)
                        }
                      />
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No plan is shown while the Scripture check is unresolved. Ask again, or ask a
                      more specific question about giving, saving, lending or risk.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {audit && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Fingerprint className="h-4 w-4 text-ancient-gold" />
                  Permanent record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Every answer is fingerprinted so it can never be quietly changed later, and so it
                  can be published on Base.
                </p>
                <p className="font-mono break-all">passage fingerprint: {audit.verseHash}</p>
                <p className="font-mono break-all">record fingerprint: {audit.recordHash}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default BwspYieldFlow;
