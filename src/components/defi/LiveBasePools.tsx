/**
 * Live Base-chain pools, read from DeFiLlama. No invented yields.
 *
 * "The simple believeth every word: but the prudent man looketh well to his
 * going" — Proverbs 14:15 (KJV). Every figure shown here is fetched, labelled
 * with when it was fetched, and never hard-coded.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { defiLlamaClient, type YieldPool } from '@/integrations/defillama/client';

const formatUsd = (value: number) => {
  if (!Number.isFinite(value)) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

/** Steady, sizeable pools first — Proverbs 21:5 prefers steady gain over haste. */
const prudence = (pool: YieldPool) => (pool.tvlUsd ?? 0) >= 1_000_000 && (pool.apy ?? 0) < 100;

interface LiveBasePoolsProps {
  limit?: number;
}

const LiveBasePools: React.FC<LiveBasePoolsProps> = ({ limit = 8 }) => {
  const [pools, setPools] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await defiLlamaClient.getYieldPools();
      const basePools = all
        .filter((pool) => (pool.chain ?? '').toLowerCase() === 'base')
        .filter(prudence)
        .sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0))
        .slice(0, limit);
      setPools(basePools);
      setFetchedAt(new Date());
      if (basePools.length === 0) {
        setError('No Base pools met the steady-growth filter just now.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not reach the market data source.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Live returns on Base, largest and steadiest first.
          {fetchedAt && ` Checked ${fetchedAt.toLocaleTimeString()}.`}
        </p>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && pools.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading the market…
        </div>
      )}

      {error && pools.length === 0 && !loading && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
          <span>{error} Try refreshing in a moment.</span>
        </div>
      )}

      {pools.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pools.map((pool) => (
            <div key={pool.pool} className="rounded-lg border bg-background/50 p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-medium">{pool.symbol}</h3>
                  <p className="truncate text-xs text-muted-foreground">{pool.project}</p>
                </div>
                <span className="shrink-0 font-semibold text-eboy-green">
                  {(pool.apy ?? 0).toFixed(2)}%
                </span>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {formatUsd(pool.tvlUsd ?? 0)} held
                </Badge>
                {pool.exposure && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {pool.exposure === 'single' ? 'one asset' : 'paired assets'}
                  </Badge>
                )}
                {(pool.apy ?? 0) > 30 && (
                  <Badge variant="outline" className="border-yellow-500/50 text-xs text-yellow-500">
                    higher risk
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(
                    `https://defillama.com/yields/pool/${encodeURIComponent(pool.pool)}`,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                See the details
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <TrendingUp className="mt-0.5 h-3 w-3 shrink-0" />
        Returns change constantly and are never promised. "Be thou diligent to know the state of thy
        flocks" — Proverbs 27:23.
      </p>
    </div>
  );
};

export default LiveBasePools;
