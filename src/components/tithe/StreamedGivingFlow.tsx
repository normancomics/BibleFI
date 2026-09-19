/**
 * BWSP_StreamedGiving — real recurring tithe streams over Superfluid on Base.
 *
 * "Bring ye all the tithes into the storehouse" — Malachi 3:10 (KJV)
 *
 * This flow is deliberately honest: it only ever streams to a wallet address a
 * church has itself published, it never invents a destination, and it never
 * claims a stream started unless the Base transaction confirmed.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Heart,
  Search,
  CheckCircle,
  Loader2,
  Wallet,
  AlertTriangle,
  Waves,
  Church as ChurchIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSound } from '@/contexts/SoundContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseApi } from '@/integrations/supabase/apiClient';
import { GlobalChurchCrawlerService } from '@/services/globalChurchCrawler';
import { churchSearchMemory } from '@/services/churchSearchMemory';
import { realSuperfluidClient } from '@/integrations/superfluid/realClient';
import { SuperfluidService, type SuperfluidStreamData } from '@/services/superfluidService';
import { createBrowserProvider } from '@/lib/ethers-compat';
import { fetchChurchNftBadges, type ChurchNftBadge as BadgeData } from '@/services/churchNftBadges';
import ChurchNftBadgeView from '@/components/tithe/ChurchNftBadge';

interface DirectoryChurch {
  id: string;
  name: string;
  city?: string | null;
  state_province?: string | null;
  country?: string | null;
  denomination?: string | null;
  verified?: boolean | null;
  accepts_crypto?: boolean | null;
}

interface GivingAddress {
  church_id: string;
  name: string;
  crypto_address: string;
  crypto_networks: string[] | null;
  verified: boolean | null;
  city?: string | null;
  state_province?: string | null;
  country?: string | null;
  denomination?: string | null;
}

const CADENCES = [
  { value: 'month', label: 'Every month', perMonth: 1 },
  { value: 'week', label: 'Every week', perMonth: 4.33 },
  { value: 'day', label: 'Every day', perMonth: 30 },
] as const;

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value.trim());

const StreamedGivingFlow: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { playSound } = useSound();

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<DirectoryChurch[]>([]);
  const [searching, setSearching] = useState(false);

  const [church, setChurch] = useState<DirectoryChurch | null>(null);
  const [giving, setGiving] = useState<GivingAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const [tokenSymbol, setTokenSymbol] = useState('USDCx');
  const [amount, setAmount] = useState('');
  const [cadence, setCadence] = useState<'month' | 'week' | 'day'>('month');
  const [bufferMonths, setBufferMonths] = useState('3');

  const [submitting, setSubmitting] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  const [ready, setReady] = useState<GivingAddress[]>([]);
  const [loadingReady, setLoadingReady] = useState(true);
  const [badges, setBadges] = useState<Record<string, BadgeData | null>>({});

  const badgeFor = useCallback(
    (address?: string | null) =>
      address ? (badges[address.trim().toLowerCase()] ?? null) : null,
    [badges],
  );

  const loadBadges = useCallback(async (addresses: string[]) => {
    const found = await fetchChurchNftBadges(addresses);
    if (Object.keys(found).length > 0) {
      setBadges((prev) => ({ ...prev, ...found }));
    }
  }, []);

  const [myStreams, setMyStreams] = useState<SuperfluidStreamData[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tokens = useMemo(() => realSuperfluidClient.getDeployedTokens(), []);

  const monthlyAmount = useMemo(() => {
    const raw = parseFloat(amount);
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    const cadenceInfo = CADENCES.find((c) => c.value === cadence);
    return raw * (cadenceInfo?.perMonth ?? 1);
  }, [amount, cadence]);

  const destination = giving?.crypto_address ?? (isAddress(manualAddress) ? manualAddress.trim() : '');

  /* ---------------------------- load my streams ---------------------------- */

  const loadStreams = useCallback(async () => {
    setLoadingStreams(true);
    try {
      const streams = await SuperfluidService.getStreamsByType('tithe');
      setMyStreams(streams);
    } catch {
      // Not signed in, or nothing saved yet — the on-chain stream is still real.
      setMyStreams([]);
    } finally {
      setLoadingStreams(false);
    }
  }, []);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  /* ------------------- churches that can receive right now ------------------ */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabaseApi.rpc('list_churches_with_giving_address', {
          p_limit: 24,
        });
        if (error) throw error;
        const rows = ((data as GivingAddress[]) ?? []).filter((r) => !!r.crypto_address);
        if (!cancelled) {
          setReady(rows);
          void loadBadges(rows.map((r) => r.crypto_address));
        }
      } catch (error) {
        console.error('[BWSP] ready-to-receive list failed', error);
        if (!cancelled) setReady([]);
      } finally {
        if (!cancelled) setLoadingReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------ church search ---------------------------- */

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const found = await GlobalChurchCrawlerService.searchChurchesRanked(query, 40);
        const ranked = churchSearchMemory.pinRemembered(
          (found as unknown as DirectoryChurch[]) ?? [],
        );
        setResults(ranked);
        churchSearchMemory.rememberQuery(query);
        void churchSearchMemory.reportSearch(query, ranked.length > 0);
      } catch (error) {
        console.error('[BWSP] church search failed', error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [term]);

  const selectChurch = useCallback(
    async (picked: DirectoryChurch) => {
      playSound('click');
      churchSearchMemory.rememberChurch(picked.id);
      setChurch(picked);
      setGiving(null);
      setManualAddress('');
      setLoadingAddress(true);
      try {
        const { data, error } = await supabaseApi.rpc('get_church_giving_address', {
          p_church_id: picked.id,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        setGiving((row as GivingAddress) ?? null);
        const addr = (row as GivingAddress)?.crypto_address;
        if (addr) void loadBadges([addr]);
      } catch (error) {
        console.error('[BWSP] giving address lookup failed', error);
        setGiving(null);
      } finally {
        setLoadingAddress(false);
      }
    },
    [playSound, loadBadges],
  );

  /* ------------------------------ start stream ----------------------------- */

  const startStream = async () => {
    if (!church) {
      toast.error('Choose the church you want to give to first.');
      return;
    }
    if (!isAddress(destination)) {
      toast.error('This church has no giving wallet on file yet. Ask them for it, then paste it below.');
      return;
    }
    if (monthlyAmount <= 0) {
      toast.error('Enter an amount greater than zero — "Honour the LORD with thy substance" (Proverbs 3:9).');
      return;
    }
    if (!isConnected) {
      toast.error('Connect your wallet to begin giving.');
      return;
    }
    if (typeof window === 'undefined' || !(window as unknown as { ethereum?: unknown }).ethereum) {
      toast.error('No wallet was found in this browser.');
      return;
    }

    setSubmitting(true);
    setSteps([]);
    try {
      const provider = createBrowserProvider((window as unknown as { ethereum: unknown }).ethereum);
      const signer = await provider.getSigner();

      const buffer = Math.max(1, Math.min(12, parseInt(bufferMonths, 10) || 3));
      const result = await realSuperfluidClient.createTithingStreamFull(
        signer,
        destination,
        tokenSymbol,
        monthlyAmount,
        buffer,
      );

      setSteps(result.steps ?? []);

      if (!result.success) {
        toast.error(result.error ?? 'The stream could not be started.');
        return;
      }

      playSound('success');
      toast.success(
        `Giving started: ${monthlyAmount.toFixed(2)} ${tokenSymbol} per month to ${church.name}.`,
      );

      // Record it so the giver can see and manage it later. A failure here never
      // invalidates the on-chain stream, so we tell the truth about both.
      const token = realSuperfluidClient.getToken(tokenSymbol);
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (userId && token) {
        const { error } = await supabase.from('superfluid_streams').insert({
          user_id: userId,
          stream_id: result.streamId ?? `tithe_${Date.now().toString(16)}`,
          receiver_address: destination,
          token_address: token.address,
          token_symbol: tokenSymbol,
          flow_rate: realSuperfluidClient.calculateFlowRate(monthlyAmount, 18),
          stream_type: 'tithe',
          status: 'active',
          start_date: new Date().toISOString(),
          tx_hash: result.txHash ?? null,
        });
        if (error) {
          console.error('[BWSP] stream saved on-chain but not recorded', error);
          toast.warning('Your giving is live on Base, but we could not save it to your history.');
        } else {
          await loadStreams();
        }
      }

      setAmount('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Could not start giving: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------ stop a stream ---------------------------- */

  const stopStream = async (stream: SuperfluidStreamData) => {
    if (!isConnected) {
      toast.error('Connect the wallet that started this giving.');
      return;
    }
    try {
      const provider = createBrowserProvider((window as unknown as { ethereum: unknown }).ethereum);
      const signer = await provider.getSigner();
      const result = await realSuperfluidClient.deleteFlow(
        signer,
        stream.receiver_address,
        stream.token_address,
      );
      if (!result.success) {
        toast.error(result.error ?? 'The giving could not be stopped.');
        return;
      }
      await SuperfluidService.updateStreamStatus(stream.id, 'cancelled');
      toast.success('Giving stopped.');
      await loadStreams();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  /* --------------------------------- render -------------------------------- */

  const activeStreams = myStreams.filter((s) => s.status === 'active');

  return (
    <div className="space-y-6">
      <Card className="border-ancient-gold/30 bg-gradient-to-r from-ancient-gold/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <Waves className="h-5 w-5" />
            Give continuously, second by second
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Your gift flows to your church every second instead of once a month, and you can stop it at
          any time. Ten percent is the measure Scripture sets — the amount is always yours to choose.
        </CardContent>
      </Card>

      {activeStreams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-ancient-gold" />
              Your giving in progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeStreams.map((stream) => (
              <div
                key={stream.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    {SuperfluidService.calculateMonthlyAmount(stream.flow_rate).toFixed(2)}{' '}
                    {stream.token_symbol} per month
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    to {stream.receiver_address.slice(0, 6)}…{stream.receiver_address.slice(-4)} ·
                    started {new Date(stream.start_date).toLocaleDateString()}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => stopStream(stream)}>
                  Stop
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChurchIcon className="h-5 w-5 text-ancient-gold" />
            1. Find your church
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Church name, city or country…"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              aria-label="Search churches"
            />
          </div>

          {term.trim().length < 2 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {loadingReady
                  ? 'Loading churches that can receive giving today…'
                  : ready.length > 0
                    ? 'Churches that can receive your giving today:'
                    : 'No church has published a giving wallet yet. Search for yours and ask them for it.'}
              </p>
              {ready.length > 0 && (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {ready.map((item) => (
                    <button
                      key={item.church_id}
                      type="button"
                      onClick={() =>
                        selectChurch({
                          id: item.church_id,
                          name: item.name,
                          city: item.city,
                          state_province: item.state_province,
                          country: item.country,
                          denomination: item.denomination,
                          verified: item.verified,
                          accepts_crypto: true,
                        })
                      }
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        church?.id === item.church_id
                          ? 'border-ancient-gold bg-ancient-gold/10'
                          : 'border-border hover:border-ancient-gold/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <span className="truncate">{item.name}</span>
                        {item.verified && (
                          <CheckCircle className="h-4 w-4 shrink-0 text-eboy-green" />
                        )}
                        <Badge
                          variant="outline"
                          className="ml-auto border-eboy-green/50 text-eboy-green"
                        >
                          Ready to receive
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {[item.denomination, item.city, item.state_province, item.country]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {searching && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Searching the global church directory…
            </p>
          )}

          {!searching && term.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No church matched that. Try the city, or a shorter part of the name.
            </p>
          )}

          {results.length > 0 && (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectChurch(item)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    church?.id === item.id
                      ? 'border-ancient-gold bg-ancient-gold/10'
                      : 'border-border hover:border-ancient-gold/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className="truncate">{item.name}</span>
                    {item.verified && <CheckCircle className="h-4 w-4 shrink-0 text-eboy-green" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {[item.denomination, item.city, item.state_province, item.country]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </button>
              ))}
            </div>
          )}

          {church && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              {loadingAddress ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking how {church.name} receives
                  gifts…
                </span>
              ) : giving ? (
                <span className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-eboy-green/50 text-eboy-green">
                    Ready to receive
                  </Badge>
                  <span className="font-mono text-xs">
                    {giving.crypto_address.slice(0, 10)}…{giving.crypto_address.slice(-6)}
                  </span>
                </span>
              ) : (
                <div className="space-y-2">
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    {church.name} has not published a giving wallet yet. Ask the church office for it
                    and paste it here — never use an address from anyone else.
                  </p>
                  <Input
                    placeholder="0x…"
                    value={manualAddress}
                    onChange={(event) => setManualAddress(event.target.value)}
                    aria-label="Church giving wallet address"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-ancient-gold" />
            2. Choose your gift
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="give-amount">Amount</Label>
              <Input
                id="give-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="100"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>How often</Label>
              <Select value={cadence} onValueChange={(value) => setCadence(value as typeof cadence)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CADENCES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={tokenSymbol} onValueChange={setTokenSymbol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.underlyingToken?.symbol ?? token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buffer-months">Months to set aside up front</Label>
            <Input
              id="buffer-months"
              type="number"
              min="1"
              max="12"
              value={bufferMonths}
              onChange={(event) => setBufferMonths(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Continuous giving needs a balance to draw from. This much is prepared now; anything
              unused stays yours.
            </p>
          </div>

          {monthlyAmount > 0 && (
            <div className="rounded-lg border border-ancient-gold/30 bg-ancient-gold/5 p-3 text-sm">
              That is <strong>{monthlyAmount.toFixed(2)}</strong> per month, about{' '}
              <strong>{(monthlyAmount / 30).toFixed(4)}</strong> a day, flowing every second.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          {!isConnected && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" /> Connect your wallet to begin.
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            disabled={submitting || !church || monthlyAmount <= 0 || !isAddress(destination)}
            onClick={startStream}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting your giving…
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" /> Begin giving
              </>
            )}
          </Button>

          {steps.length > 0 && (
            <ul className="space-y-1 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              {steps.map((step, index) => (
                <li key={`${index}-${step}`}>{step}</li>
              ))}
            </ul>
          )}

          <p className="text-center text-xs text-muted-foreground">
            "Trust in the LORD with all thine heart" — Proverbs 3:5
          </p>
        </CardContent>
      </Card>

      {loadingStreams && (
        <p className="text-center text-xs text-muted-foreground">Loading your giving history…</p>
      )}
      {address && (
        <p className="text-center text-xs text-muted-foreground">
          Giving from {address.slice(0, 6)}…{address.slice(-4)} on Base
        </p>
      )}
    </div>
  );
};

export default StreamedGivingFlow;
