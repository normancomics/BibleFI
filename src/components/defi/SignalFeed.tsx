import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, TrendingUp, TrendingDown, Zap, Wheat, Shield,
  ArrowUpRight, Globe, Star, BookOpen, Siren
} from 'lucide-react';
import type { OpportunitySignal } from '@/hooks/useDefiScanner';

interface SignalFeedProps {
  signalsByType: Record<string, { count: number; top: OpportunitySignal[] }>;
  topOpportunities: OpportunitySignal[];
}

const SIGNAL_ICONS: Record<string, React.ReactNode> = {
  entry: <TrendingUp className="w-4 h-4 text-green-400" />,
  exit: <TrendingDown className="w-4 h-4 text-red-400" />,
  arbitrage: <Zap className="w-4 h-4 text-yellow-400" />,
  staking: <Shield className="w-4 h-4 text-blue-400" />,
  farming: <Wheat className="w-4 h-4 text-green-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  perpetual: <ArrowUpRight className="w-4 h-4 text-purple-400" />,
  bridge: <Globe className="w-4 h-4 text-indigo-400" />,
  new_protocol: <Star className="w-4 h-4 text-cyan-400" />,
};

const SIGNAL_COLORS: Record<string, string> = {
  entry: 'border-green-500/30',
  exit: 'border-red-500/30',
  arbitrage: 'border-yellow-500/30',
  staking: 'border-blue-500/30',
  farming: 'border-green-500/30',
  warning: 'border-orange-500/30',
  perpetual: 'border-purple-500/30',
  bridge: 'border-indigo-500/30',
  new_protocol: 'border-cyan-500/30',
};

const STRENGTH_BADGE: Record<string, string> = {
  strong: 'bg-red-500/20 text-red-300',
  moderate: 'bg-yellow-500/20 text-yellow-300',
  weak: 'bg-blue-500/20 text-blue-300',
};

const SignalFeed: React.FC<SignalFeedProps> = ({ signalsByType, topOpportunities }) => {
  const allSignals = Object.entries(signalsByType).flatMap(([type, { top }]) => top);

  if (allSignals.length === 0 && topOpportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium">No Active Signals</p>
        <p className="text-sm text-muted-foreground mt-1">
          Markets are calm. A good time for patience and prayer.
        </p>
        <p className="text-xs text-muted-foreground italic mt-2">
          "Be still, and know that I am God." — Psalm 46:10
        </p>
      </div>
    );
  }

  // Summary badges
  const typeSummary = Object.entries(signalsByType)
    .filter(([, v]) => v.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-4">
      {/* Signal Type Summary */}
      <div className="flex gap-2 flex-wrap">
        {typeSummary.map(([type, { count }]) => (
          <Badge key={type} variant="outline" className={`gap-1.5 capitalize text-xs ${SIGNAL_COLORS[type]?.replace('border', 'bg').replace('/30', '/10') || ''}`}>
            {SIGNAL_ICONS[type]}
            {type} ({count})
          </Badge>
        ))}
      </div>

      {/* Top Opportunities */}
      {topOpportunities.length > 0 && (
        <Card className="border-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-secondary">
              <Star className="w-4 h-4" />
              Top Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topOpportunities.map((sig, i) => (
              <SignalCard key={`top-${i}`} signal={sig} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Signals by Type */}
      <div className="space-y-3">
        {allSignals.map((sig, i) => (
          <SignalCard key={`sig-${i}`} signal={sig} />
        ))}
      </div>
    </div>
  );
};

function SignalCard({ signal }: { signal: OpportunitySignal }) {
  return (
    <Card className={`border-border/50 ${SIGNAL_COLORS[signal.type] || ''}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {SIGNAL_ICONS[signal.type]}
            <div>
              <p className="text-sm font-medium text-foreground">{signal.details}</p>
              <p className="text-xs text-muted-foreground">
                {signal.protocol} • {signal.asset}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={`text-[10px] capitalize ${STRENGTH_BADGE[signal.signal_strength] || ''}`}>
              {signal.signal_strength}
            </Badge>
            {!signal.actionable && (
              <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-300">
                ⚠ Not Recommended
              </Badge>
            )}
          </div>
        </div>

        {/* Biblical Wisdom */}
        <div className="pt-2 border-t border-border/20">
          <div className="flex items-start gap-2">
            <BookOpen className="w-3 h-3 text-secondary flex-shrink-0 mt-1" />
            <div>
              <p className="text-[11px] italic text-muted-foreground">
                "{signal.biblical_wisdom.scripture}"
              </p>
              <p className="text-[10px] text-secondary font-medium mt-0.5">
                {signal.biblical_wisdom.reference}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                💡 {signal.biblical_wisdom.action_guidance}
              </p>
              <p className="text-[10px] text-orange-400/80 mt-0.5">
                ⚠ {signal.biblical_wisdom.risk_warning}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SignalFeed;
