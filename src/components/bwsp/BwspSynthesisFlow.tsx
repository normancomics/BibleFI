/**
 * BWSP_SynthesisFlow — the real Biblical-Wisdom-Synthesis-Protocol run, surfaced.
 *
 * Nothing here is decorative: it runs the sovereign agent (retrieval → context
 * assembly → synthesis → mandatory triple-check), then records the result in the
 * tamper-evident wisdom audit trail with its verse hash.
 *
 * "Prove all things; hold fast that which is good" — 1 Thessalonians 5:21 (KJV)
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Sparkles,
  Fingerprint,
} from 'lucide-react';
import { useBWSP } from '@/hooks/useBWSP';
import { wisdomAuditTrail, type WisdomAuditRecord } from '@/services/audit/wisdomAuditTrail';
import type { TripleCheckVerdict } from '@/services/bwsp/tripleCheck';

const EXAMPLES = [
  'Should I borrow to invest in a high yield pool?',
  'How much of my gain belongs to the storehouse?',
  'Is chasing the highest advertised return wise?',
  'How do I save for my children without hoarding?',
];

const VERDICT_STYLE: Record<
  TripleCheckVerdict,
  { label: string; icon: React.ElementType; className: string; meaning: string }
> = {
  approved: {
    label: 'Confirmed',
    icon: ShieldCheck,
    className: 'border-eboy-green/50 text-eboy-green',
    meaning: 'The passages checked out in full, so this guidance may be acted on.',
  },
  flagged: {
    label: 'Needs care',
    icon: ShieldAlert,
    className: 'border-yellow-500/50 text-yellow-500',
    meaning: 'Something did not sit right in the checks. Read it, but do not act on it alone.',
  },
  quarantined: {
    label: 'Held back',
    icon: ShieldX,
    className: 'border-destructive/50 text-destructive',
    meaning: 'The checks failed, so this guidance is withheld from any money decision.',
  },
};

const BwspSynthesisFlow: React.FC = () => {
  const { bwspResponse, isLoading, error, runWisdomQuery, reset } = useBWSP();
  const [question, setQuestion] = useState('');
  const [audit, setAudit] = useState<WisdomAuditRecord | null>(null);

  const run = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setAudit(null);
      await runWisdomQuery({ text: trimmed });
    },
    [runWisdomQuery],
  );

  // Record every completed synthesis exactly once, keyed by its own timestamp.
  const recordedKey = useMemo(() => bwspResponse?.timestamp ?? null, [bwspResponse]);
  React.useEffect(() => {
    if (!bwspResponse || !recordedKey) return;
    const record = wisdomAuditTrail.emit({
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
    });
    setAudit(record);
  }, [bwspResponse, recordedKey]);

  const verdict = bwspResponse?.tripleCheck.verdict;
  const verdictStyle = verdict ? VERDICT_STYLE[verdict] : null;
  const VerdictIcon = verdictStyle?.icon ?? ShieldCheck;

  return (
    <div className="space-y-6">
      <Card className="border-ancient-gold/30 bg-gradient-to-r from-ancient-gold/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <Sparkles className="h-5 w-5" />
            Ask for wisdom before you decide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your question is answered from Scripture first. Every answer is then checked three ways —
            that the passages are genuine, that they are read in context, and that nothing was picked
            out to suit the answer — before it may guide any money decision.
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
                onClick={() => {
                  setQuestion(example);
                  run(example);
                }}
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
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
          </div>
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
                <h3 className="mb-1 text-sm font-semibold">The principle</h3>
                <p className="text-sm text-muted-foreground">{bwspResponse.financialPrinciple}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold">What to do</h3>
                <p className="text-sm text-muted-foreground">{bwspResponse.actionableInsight}</p>
              </div>
              {bwspResponse.supportingScriptures?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Also consider</h3>
                  <ul className="space-y-2">
                    {bwspResponse.supportingScriptures.slice(0, 4).map((scripture) => (
                      <li key={scripture.reference} className="text-sm text-muted-foreground">
                        <span className="text-ancient-gold">{scripture.reference}</span> —{' '}
                        {scripture.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How this answer was reached</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bwspResponse.agentSteps?.map((step) => (
                <div
                  key={step.stepNumber}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium">
                      {step.stepNumber}. {step.name}
                    </div>
                    {step.output && (
                      <div className="text-xs text-muted-foreground">{step.output}</div>
                    )}
                    {step.error && <div className="text-xs text-destructive">{step.error}</div>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {step.durationMs !== undefined && <span>{step.durationMs} ms</span>}
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-eboy-green" />
                    ) : (
                      <span className="capitalize">{step.status}</span>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2 text-xs text-muted-foreground">
                Answered in {bwspResponse.processingTimeMs} ms · confidence{' '}
                {Math.round((bwspResponse.confidenceScore ?? 0) * 100)}%
              </div>
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

export default BwspSynthesisFlow;
