/**
 * WisdomDashboard — a steward's own yield strategies, balances and earnings.
 *
 * Reads only the signed-in steward's records; the tithe figures shown are the
 * ones settled by the vault contract, never estimates.
 *
 * "Well done, thou good and faithful servant" — Matthew 25:21 (KJV)
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import {
  fetchWisdomDashboard,
  type WisdomDashboardData,
} from '@/services/wisdomDashboardService';
import { useWallet } from '@/contexts/WalletContext';
import { useTitheVault } from '@/hooks/useTitheVault';

const amount = (value: number, digits = 2) =>
  value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const WisdomDashboard: React.FC = () => {
  const [data, setData] = useState<WisdomDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet();
  const vault = useTitheVault(address ?? null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchWisdomDashboard());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Keep balances and earnings current on their own: the vault holds the truth,
  // so re-read it (and the steward's records) on a gentle timer.
  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
      vault.refresh();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load, vault.refresh]);

  const totals = data?.totals;
  const live = vault.position;
  const hasLive = vault.deployed && !!live && (live.principal > 0 || live.grossYield > 0);
  const hasAnything = (data?.balances.length ?? 0) > 0 || hasLive;

  return (
    <Card className="border-primary/20 bg-card/60">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          My wisdom strategies
        </CardTitle>
        <Button size="icon" variant="ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading && !data ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Gathering your records…
          </div>
        ) : !hasAnything ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Nothing put to work yet. Ask a money question above, and once the Scripture check
              confirms it you can place funds — everything you place will be listed here.
            </p>
            <p className="italic">"Occupy till I come" — Luke 19:13</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'At work', value: amount(totals?.principal ?? 0) },
                { label: 'Earned', value: amount(totals?.grossEarned ?? 0, 4) },
                { label: 'Tithe given', value: amount(totals?.tithePaid ?? 0, 4) },
                { label: 'Your share', value: amount(totals?.netKept ?? 0, 4) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Balance per strategy</p>
              {data?.balances.map((balance) => (
                <div
                  key={balance.strategyName}
                  className="rounded-lg border border-border/60 p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{balance.strategyName}</span>
                    <Badge variant="outline">{balance.tokenSymbol}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">At work</p>
                      <p>{amount(balance.principal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Earned</p>
                      <p className="text-eboy-green">{amount(balance.grossEarned, 4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tithe given</p>
                      <p className="text-primary">{amount(balance.tithePaid, 4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Your share</p>
                      <p>{amount(balance.netKept, 4)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {balance.settlements} settlement{balance.settlements === 1 ? '' : 's'} · last
                    activity {when(balance.lastActivity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-eboy-green" /> Earnings history
              </p>
              {(data?.events.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No earnings settled yet — they appear here the moment you settle in the vault.
                </p>
              ) : (
                <div className="space-y-2">
                  {data?.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{event.strategyName}</p>
                        <p className="text-xs text-muted-foreground">{when(event.occurredAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-eboy-green">
                          +{amount(event.netYield, 4)} {event.tokenSymbol}
                        </p>
                        <p className="text-xs text-primary">
                          tithe {amount(event.titheAmount, 4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <p className="text-xs italic text-muted-foreground">
          "Moreover it is required in stewards, that a man be found faithful" — 1 Corinthians 4:2
        </p>
      </CardContent>
    </Card>
  );
};

export default WisdomDashboard;
