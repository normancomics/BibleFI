/**
 * GiverTitheDashboard
 *
 * Shows the signed-in giver's ongoing gifts (Superfluid tithe streams),
 * a per-church balance of what has been received, and full tithe history.
 *
 * "Every man according as he purposeth in his heart, so let him give" — 2 Corinthians 9:7
 */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Church, Coins, ExternalLink, RefreshCw, Vault, Waves } from 'lucide-react';
import {
  buildChurchBalances,
  fetchGiverPayments,
  fetchGiverStreams,
  type ChurchBalance,
  type GiverPayment,
  type GiverStream,
} from '@/services/titheDashboardService';
import { fetchWisdomDashboard } from '@/services/wisdomDashboardService';
import { useTitheVault } from '@/hooks/useTitheVault';
import { useWallet } from '@/contexts/WalletContext';

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const GiverTitheDashboard: React.FC = () => {
  const [streams, setStreams] = useState<GiverStream[]>([]);
  const [payments, setPayments] = useState<GiverPayment[]>([]);
  const [balances, setBalances] = useState<ChurchBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vaultTitheSettled, setVaultTitheSettled] = useState(0);
  const [vaultSettlements, setVaultSettlements] = useState(0);
  const { address } = useWallet();
  const vault = useTitheVault(address ?? null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p, wisdom] = await Promise.all([
        fetchGiverStreams(),
        fetchGiverPayments(),
        fetchWisdomDashboard(),
      ]);
      setStreams(s);
      setPayments(p);
      setBalances(buildChurchBalances(s, p));
      setVaultTitheSettled(wisdom.totals.tithePaid);
      setVaultSettlements(wisdom.events.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your giving');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Settled tithes come from the vault itself, so keep them current on a timer.
  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
      vault.refresh();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [vault.refresh]);


  const monthlyTotal = streams
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyAmount, 0);
  const givenTotal = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-scroll text-ancient-gold">My Giving</h2>
          <p className="text-white/70">Ongoing gifts, church balances and full tithe history</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not load your giving</AlertTitle>
          <AlertDescription>
            {error} — “Trust in the LORD with all thine heart” (Proverbs 3:5). Try Refresh.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-scripture/30 bg-black/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/60 flex items-center gap-2">
              <Waves className="w-4 h-4 text-ancient-gold" /> Ongoing per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-ancient-gold">{fmt(monthlyTotal)}</p>
            <p className="text-xs text-white/50">
              {streams.filter((s) => s.status === 'active').length} active gift
              {streams.filter((s) => s.status === 'active').length === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-scripture/30 bg-black/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/60 flex items-center gap-2">
              <Coins className="w-4 h-4 text-ancient-gold" /> Total given
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-ancient-gold">{fmt(givenTotal)}</p>
            <p className="text-xs text-white/50">{payments.length} recorded gifts</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-scripture/30 bg-black/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/60 flex items-center gap-2">
              <Church className="w-4 h-4 text-ancient-gold" /> Churches supported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-ancient-gold">{balances.length}</p>
            <p className="text-xs text-white/50">Across streams and one-time gifts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-scripture/30 bg-black/20">
        <CardHeader className="border-b border-ancient-gold/20">
          <CardTitle className="font-scroll text-ancient-gold">Ongoing gifts</CardTitle>
          <CardDescription className="text-white/70">
            Continuous streams flowing to your church wallets
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {loading ? (
            <div className="h-20 rounded-md bg-black/40 animate-pulse" />
          ) : streams.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No ongoing gifts yet. Start one on the Continuous Giving tab.
            </p>
          ) : (
            streams.map((s) => (
              <div
                key={s.id}
                className="bg-black/50 border border-ancient-gold/20 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-scripture">{s.churchName}</p>
                  <p className="text-xs text-white/50 break-all">{s.receiverAddress}</p>
                  <p className="text-xs text-white/50">
                    Started {new Date(s.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-medium text-ancient-gold">
                    {fmt(s.monthlyAmount)} {s.tokenSymbol}/month
                  </p>
                  <div className="flex gap-2 sm:justify-end mt-1 items-center">
                    <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                      {s.status}
                    </Badge>
                    {s.txHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 gap-1"
                        onClick={() => window.open(`https://basescan.org/tx/${s.txHash}`, '_blank')}
                      >
                        <ExternalLink size={12} /> TX
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-scripture/30 bg-black/20">
        <CardHeader className="border-b border-ancient-gold/20">
          <CardTitle className="font-scroll text-ancient-gold">Church balances</CardTitle>
          <CardDescription className="text-white/70">
            What each church has received from you, plus the monthly flow still coming
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {loading ? (
            <div className="h-16 rounded-md bg-black/40 animate-pulse" />
          ) : balances.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No church balances yet.</p>
          ) : (
            balances.map((b) => (
              <div
                key={b.churchName}
                className="bg-black/40 border border-ancient-gold/20 rounded-md p-4 flex items-center justify-between gap-3"
              >
                <p className="font-medium text-scripture">{b.churchName}</p>
                <div className="text-right">
                  <p className="font-medium text-ancient-gold">
                    {fmt(b.received)} {b.currency}
                  </p>
                  {b.streamedPerMonth > 0 && (
                    <p className="text-xs text-white/50">
                      +{fmt(b.streamedPerMonth)} {b.currency}/month incoming
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-scripture/30 bg-black/20">
        <CardHeader className="border-b border-ancient-gold/20">
          <CardTitle className="font-scroll text-ancient-gold">Tithe history</CardTitle>
          <CardDescription className="text-white/70">Every recorded gift</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {loading ? (
            <div className="h-16 rounded-md bg-black/40 animate-pulse" />
          ) : payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No gifts recorded yet.</p>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="bg-black/50 border border-ancient-gold/20 rounded-md p-4 flex flex-col sm:flex-row justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-scripture">{p.church}</p>
                  <p className="text-sm text-white/60">{p.date.toLocaleDateString()}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-medium text-ancient-gold">
                    {fmt(p.amount)} {p.currency}
                  </p>
                  <div className="flex gap-2 sm:justify-end mt-1">
                    <Badge variant="outline">{p.method}</Badge>
                    <Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-center text-white/60 italic">
        “Honour the LORD with thy substance, and with the firstfruits of all thine increase” —
        Proverbs 3:9
      </p>
    </div>
  );
};

export default GiverTitheDashboard;
