import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wheat, BookOpen } from 'lucide-react';
import type { YieldPool } from '@/hooks/useDefiScanner';

interface YieldPoolCardsProps {
  pools: YieldPool[];
}

const WISDOM_FOR_APY = [
  { min: 0, max: 20, text: 'Well done, good and faithful servant.', ref: 'Matthew 25:21', color: 'text-green-400' },
  { min: 20, max: 100, text: 'He that tilleth his land shall have plenty of bread.', ref: 'Proverbs 28:19', color: 'text-yellow-400' },
  { min: 100, max: 1000, text: 'Wealth gotten by vanity shall be diminished.', ref: 'Proverbs 13:11', color: 'text-orange-400' },
  { min: 1000, max: Infinity, text: 'The love of money is the root of all evil.', ref: '1 Timothy 6:10', color: 'text-red-400' },
];

function getWisdom(apy: number) {
  return WISDOM_FOR_APY.find(w => apy >= w.min && apy < w.max) || WISDOM_FOR_APY[3];
}

function getRiskLevel(apy: number): { label: string; color: string } {
  if (apy < 20) return { label: 'Low Risk', color: 'bg-green-500/20 text-green-300' };
  if (apy < 100) return { label: 'Medium Risk', color: 'bg-yellow-500/20 text-yellow-300' };
  if (apy < 1000) return { label: 'High Risk', color: 'bg-orange-500/20 text-orange-300' };
  return { label: 'Extreme Risk', color: 'bg-red-500/20 text-red-300' };
}

const YieldPoolCards: React.FC<YieldPoolCardsProps> = ({ pools }) => {
  if (pools.length === 0) {
    return (
      <div className="text-center py-12">
        <Wheat className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No yield pools found on Base chain.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Biblical Wisdom Guardrail</p>
            <p className="text-xs text-muted-foreground">
              "He that hasteth to be rich hath an evil eye, and considereth not that poverty shall come upon him." — Proverbs 28:22.
              Extremely high APYs are often unsustainable. Exercise prudent stewardship.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pools.map((pool, i) => {
          const wisdom = getWisdom(pool.apy);
          const risk = getRiskLevel(pool.apy);
          const isExtreme = pool.apy > 1000;

          return (
            <Card
              key={`${pool.project}-${pool.pool}-${i}`}
              className={`border-border/50 ${isExtreme ? 'border-red-500/30' : ''}`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono font-bold text-foreground">{pool.pool}</p>
                    <p className="text-xs text-muted-foreground">{pool.project}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${risk.color}`}>
                    {risk.label}
                  </Badge>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">APY</p>
                    <p className={`text-2xl font-bold ${pool.apy > 100 ? 'text-orange-400' : 'text-green-400'}`}>
                      {pool.apy > 1000 ? `${(pool.apy / 1000).toFixed(1)}K` : pool.apy.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">TVL</p>
                    <p className="text-lg font-bold text-foreground">
                      ${(pool.tvl / 1e6).toFixed(1)}M
                    </p>
                  </div>
                </div>

                {/* Biblical Wisdom Overlay */}
                <div className="pt-2 border-t border-border/30 flex items-start gap-2">
                  <BookOpen className={`w-3 h-3 flex-shrink-0 mt-0.5 ${wisdom.color}`} />
                  <div>
                    <p className={`text-[11px] italic ${wisdom.color}`}>"{wisdom.text}"</p>
                    <p className="text-[10px] text-muted-foreground">{wisdom.ref}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default YieldPoolCards;
