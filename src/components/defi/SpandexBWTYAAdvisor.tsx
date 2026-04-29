/**
 * SpandexBWTYAAdvisor
 *
 * Displays the combined Spandex × BWTYA × BWSP advisory panel:
 *   • BWTYA-graded provider comparison table (one row per spanDEX provider)
 *   • Recommended provider badge (biblical score vs best-price)
 *   • BWSP scripture wisdom for the specific swap
 *   • Sandbox metadata footer (run ID, providers evaluated, duration)
 *
 * "Where there is no guidance, a people falls, but in an abundance of
 *  counsellors there is safety." – Proverbs 11:14
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Zap,
  Shield,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpandexSwapAdvisoryResult, SpandexScoredQuote } from '@/services/spandex/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GRADE_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  A: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  B: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  C: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  D: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  F: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

function gradeStyle(grade: string) {
  return GRADE_STYLES[grade] ?? GRADE_STYLES['F'];
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider row
// ---------------------------------------------------------------------------

function ProviderRow({ sq, rank }: { sq: SpandexScoredQuote; rank: number }) {
  const gs = gradeStyle(sq.scored?.stewardshipGrade ?? 'F');
  const isTop = rank === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.06 }}
      className={`rounded-lg border p-3 space-y-2 ${
        isTop
          ? 'bg-ancient-gold/5 border-ancient-gold/40'
          : 'bg-muted/20 border-border/40'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {isTop && <Award className="h-3.5 w-3.5 text-ancient-gold shrink-0" />}
          <span className={`text-sm font-semibold ${isTop ? 'text-ancient-gold' : 'text-foreground'}`}>
            {sq.opportunity?.protocol ?? sq.raw.provider}
          </span>

          {sq.isBWTYARecommended && (
            <Badge className="text-[9px] px-1.5 py-0 bg-ancient-gold/20 text-ancient-gold border-ancient-gold/40">
              BWTYA ✦
            </Badge>
          )}
          {sq.isBestPrice && (
            <Badge className="text-[9px] px-1.5 py-0 bg-eboy-green/20 text-eboy-green border-eboy-green/40">
              Best Price
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">{sq.raw.outputAmount}</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${gs.text} ${gs.bg} ${gs.border}`}
          >
            {sq.scored?.stewardshipGrade ?? '?'}
          </span>
        </div>
      </div>

      {/* Score bars */}
      {sq.scored && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <ScoreBar label="Fruit-bearing" value={sq.scored.fruitBearingScore} max={30} />
          <ScoreBar label="Faithfulness" value={sq.scored.faithfulnessScore} max={25} />
          <ScoreBar label="Biblical Align" value={sq.scored.biblicalAlignmentScore} max={25} />
          <ScoreBar label="Transparency" value={sq.scored.transparencyScore} max={20} />
        </div>
      )}

      {/* BWTYA composite */}
      {sq.scored && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3 text-ancient-gold" />
          <span>BWTYA Score: <strong className="text-foreground">{sq.scored.bwtyaScore}/100</strong></span>
          {sq.scored.warningFlags.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-yellow-500">
              <AlertTriangle className="h-3 w-3" />
              {sq.scored.warningFlags.length} flag{sq.scored.warningFlags.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface SpandexBWTYAAdvisorProps {
  advisory: SpandexSwapAdvisoryResult;
  fromToken: string;
  toToken: string;
}

const SpandexBWTYAAdvisor: React.FC<SpandexBWTYAAdvisorProps> = ({
  advisory,
  fromToken,
  toToken,
}) => {
  const { scoredQuotes, bwtyaRecommended, bestPrice, alignedWithBestPrice, bwspWisdom, sandbox } =
    advisory;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-3"
      >
        {/* ── Header ── */}
        <Card className="bg-gradient-to-br from-ancient-gold/5 to-ancient-purple/5 border-ancient-gold/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2 text-ancient-gold">
              <Zap className="h-4 w-4" />
              spanDEX × BWTYA Advisory
              <Badge className="ml-auto text-[9px] bg-eboy-green/20 text-eboy-green border-eboy-green/30">
                <Activity className="h-2.5 w-2.5 mr-0.5 animate-pulse" />
                LIVE
              </Badge>
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {fromToken} → {toToken} · {scoredQuotes.length} provider{scoredQuotes.length !== 1 ? 's' : ''} biblically scored
            </p>
          </CardHeader>
        </Card>

        {/* ── Alignment notice ── */}
        {scoredQuotes.length > 1 && (
          <div
            className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${
              alignedWithBestPrice
                ? 'bg-eboy-green/10 border-eboy-green/30 text-eboy-green'
                : 'bg-ancient-gold/10 border-ancient-gold/30 text-ancient-gold'
            }`}
          >
            {alignedWithBestPrice ? (
              <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            ) : (
              <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            )}
            <span>
              {alignedWithBestPrice
                ? `✅ Best price & highest biblical score align — ${bwtyaRecommended?.raw.provider} is recommended on both dimensions.`
                : `⚖️ BWTYA recommends ${bwtyaRecommended?.raw.provider ?? '—'} (biblical score) vs ${
                    bestPrice?.raw.provider ?? '—'
                  } (best price). Consider stewardship over marginal savings.`}
            </span>
          </div>
        )}

        {/* ── Provider rows ── */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="px-4 py-3 space-y-2">
            {scoredQuotes.map((sq, i) => (
              <ProviderRow key={sq.raw.provider} sq={sq} rank={i} />
            ))}
          </CardContent>
        </Card>

        {/* ── BWSP Biblical Wisdom ── */}
        {bwspWisdom && (
          <Card className="bg-ancient-purple/5 border-ancient-purple/30">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-ancient-purple-light">
                <BookOpen className="h-4 w-4" />
                Biblical Wisdom (BWSP)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Primary scripture */}
              {bwspWisdom.primaryScripture && (
                <div className="p-3 bg-ancient-gold/10 rounded-lg border border-ancient-gold/20">
                  <p className="text-xs italic text-muted-foreground mb-1">
                    "{bwspWisdom.primaryScripture.text}"
                  </p>
                  <p className="text-[10px] font-semibold text-ancient-gold">
                    — {bwspWisdom.primaryScripture.reference}
                  </p>
                </div>
              )}

              {/* Guidance */}
              {bwspWisdom.wisdomGuidance && (
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {bwspWisdom.wisdomGuidance}
                  </p>
                </div>
              )}

              {/* Actionable insight */}
              {bwspWisdom.actionableInsight && (
                <div className="flex items-start gap-2 p-2 bg-eboy-green/10 rounded border border-eboy-green/20">
                  <TrendingUp className="h-3.5 w-3.5 text-eboy-green mt-0.5 shrink-0" />
                  <p className="text-xs text-eboy-green">{bwspWisdom.actionableInsight}</p>
                </div>
              )}

              {/* Confidence */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Confidence: {Math.round((bwspWisdom.confidenceScore ?? 0) * 100)}%</span>
                <span className="ml-auto">via {bwspWisdom.synthesis?.synthesisMethod ?? 'BWSP'}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Recommended strategy snippet ── */}
        {advisory.recommendedStrategy && (
          <Card className="bg-card/40 border-border/40">
            <CardContent className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-3.5 w-3.5 text-ancient-gold" />
                <span className="text-xs font-semibold text-ancient-gold">
                  {advisory.recommendedStrategy.name}
                </span>
                <Badge className="ml-auto text-[9px] bg-muted/50 text-muted-foreground border-border/40">
                  {advisory.recommendedStrategy.riskProfile}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                "{advisory.recommendedStrategy.scriptureAnchor}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Sandbox metadata footer ── */}
        <Separator className="opacity-30" />
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 px-1 flex-wrap">
          <span className="flex items-center gap-1">
            <Activity className="h-2.5 w-2.5" />
            Agent: {sandbox.agentName}
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-2.5 w-2.5" />
            Run: {sandbox.runId?.slice(-8)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {sandbox.durationMs}ms
          </span>
          <span className="ml-auto">{sandbox.providersEvaluated} providers evaluated</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpandexBWTYAAdvisor;
