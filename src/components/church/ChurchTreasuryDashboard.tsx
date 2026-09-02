import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Coins,
  CreditCard,
  Loader2,
  Mail,
  RefreshCw,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchCardOrders,
  fetchMyChurch,
  fetchTithePayments,
  sendTitheReceipt,
  type ChurchOnboardingRecord,
  type NfcCardOrder,
  type TithePayment,
} from "@/services/churchOnboardingService";
import {
  CHURCH_PARABLE_POOLS,
  estimatePendingYields,
  formatMoney,
  isNfcPayment,
  summariseCardUsage,
  summariseTithes,
  type ParablePool,
} from "@/services/church/titheYieldEstimator";

const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}> = ({ label, value, hint, icon }) => (
  <Card className="p-4 bg-card/60 border-border/60">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground mt-1 truncate">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <div className="text-ancient-gold shrink-0">{icon}</div>
    </div>
  </Card>
);

const ChurchTreasuryDashboard: React.FC = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [church, setChurch] = useState<ChurchOnboardingRecord | null>(null);
  const [cards, setCards] = useState<NfcCardOrder[]>([]);
  const [payments, setPayments] = useState<TithePayment[]>([]);
  const [pool, setPool] = useState<ParablePool>(CHURCH_PARABLE_POOLS[2]);
  const [receiptFor, setReceiptFor] = useState<string | null>(null);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const mine = await fetchMyChurch(userId);
      setChurch(mine);
      if (mine) {
        const [cardList, paymentList] = await Promise.all([
          fetchCardOrders(mine.id),
          fetchTithePayments(mine.id),
        ]);
        setCards(cardList);
        setPayments(paymentList);
        setReceiptEmail((prev) => prev || mine.contact_email);
      }
    } catch (err) {
      toast({
        title: "Could not load treasury",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (authChecked) void load();
  }, [authChecked, load]);

  const totals = useMemo(() => summariseTithes(payments), [payments]);
  const cardUsage = useMemo(() => summariseCardUsage(cards, payments), [cards, payments]);
  const yields = useMemo(() => estimatePendingYields(payments, pool), [payments, pool]);

  const handleSendReceipt = async (paymentId: string) => {
    if (!receiptEmail.trim()) {
      toast({ title: "Add an email address first", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const result = await sendTitheReceipt(paymentId, receiptEmail.trim());
      if (result.sent) {
        toast({ title: "Receipt sent", description: `Emailed to ${receiptEmail.trim()}` });
        setReceiptFor(null);
      } else {
        toast({
          title: "Email not configured yet",
          description: result.message ?? "Add the RESEND_API_KEY secret to enable receipt emails.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Receipt failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!userId) {
    return (
      <Card className="p-6 text-center space-y-3">
        <p className="text-foreground">Sign in to view your church treasury.</p>
        <Button asChild>
          <Link to="/auth/login">Sign in</Link>
        </Button>
      </Card>
    );
  }

  if (!church) {
    return (
      <Card className="p-6 text-center space-y-3">
        <p className="text-foreground">No church registered to this account yet.</p>
        <p className="text-sm text-muted-foreground">
          Register your congregation to start receiving tithes and Tap-To-Pay cards.
        </p>
        <Button asChild>
          <Link to="/church-onboarding">Register your church</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{church.church_name}</h2>
          <p className="text-sm text-muted-foreground">
            {church.city}
            {church.state_province ? `, ${church.state_province}` : ""} · {church.country} ·{" "}
            <Badge variant="secondary">{church.status}</Badge>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Tithe totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Tithes received"
          value={formatMoney(totals.allTime, totals.currency)}
          hint={`${totals.paymentCount} gift(s) · ${totals.donorCount} donor(s)`}
          icon={<Coins className="w-5 h-5" />}
        />
        <StatCard
          label="Last 30 days"
          value={formatMoney(totals.last30Days, totals.currency)}
          hint={`7-day: ${formatMoney(totals.last7Days, totals.currency)}`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Tap-To-Pay volume"
          value={formatMoney(cardUsage.tapVolume, totals.currency)}
          hint={`${(cardUsage.tapShareOfGiving * 100).toFixed(0)}% of giving · ${cardUsage.tapPayments} tap(s)`}
          icon={<CreditCard className="w-5 h-5" />}
        />
        <StatCard
          label="Pending BWTYA yield"
          value={formatMoney(yields.accrued, totals.currency)}
          hint={`${pool.name} · ${(pool.apy * 100).toFixed(1)}% APY`}
          icon={<Sprout className="w-5 h-5" />}
        />
      </div>

      {/* Card usage */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-ancient-gold" />
          <h3 className="font-semibold text-foreground">NFC Tap-To-Pay card usage</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Cards ordered</p>
            <p className="font-semibold text-foreground">{cardUsage.cardsOrdered}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Activated</p>
            <p className="font-semibold text-foreground">{cardUsage.cardsActivated}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Awaiting shipment</p>
            <p className="font-semibold text-foreground">{cardUsage.awaitingShipment}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Last tap</p>
            <p className="font-semibold text-foreground">
              {cardUsage.lastTapAt ? new Date(cardUsage.lastTapAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Cards activated</span>
            <span>
              {cardUsage.cardsActivated}/{cardUsage.cardsOrdered || 0}
            </span>
          </div>
          <Progress
            value={cardUsage.cardsOrdered ? (cardUsage.cardsActivated / cardUsage.cardsOrdered) * 100 : 0}
          />
        </div>
        {cardUsage.ordersPlaced === 0 && (
          <p className="text-sm text-muted-foreground">
            No card orders yet.{" "}
            <Link to="/church-onboarding" className="text-ancient-gold underline">
              Order branded Tap-To-Pay cards
            </Link>
            .
          </p>
        )}
      </Card>

      {/* Pending BWTYA yields */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-ancient-gold" />
            <h3 className="font-semibold text-foreground">Pending BWTYA yields</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {CHURCH_PARABLE_POOLS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={p.id === pool.id ? "default" : "outline"}
                onClick={() => setPool(p)}
              >
                {p.name} · {(p.apy * 100).toFixed(1)}%
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Idle principal</p>
            <p className="font-semibold text-foreground">{formatMoney(yields.principal, totals.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Accrued (unswept)</p>
            <p className="font-semibold text-ancient-gold">{formatMoney(yields.accrued, totals.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Next 30 days</p>
            <p className="font-semibold text-foreground">{formatMoney(yields.projected30Day, totals.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Tithe on yield (10%)</p>
            <p className="font-semibold text-foreground">{formatMoney(yields.titheOnYield, totals.currency)}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Estimate only, compounded from each gift's settlement date at the selected parable-pool APY. Net to
          treasury after the mandatory tithe on yield: {formatMoney(yields.netToTreasury, totals.currency)} —
          "the tithe is the LORD's" (Leviticus 27:30).
        </p>
      </Card>

      {/* Payments + receipts */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-ancient-gold" />
          <h3 className="font-semibold text-foreground">Tithe payments &amp; receipts</h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="receipt-email">
            Send receipts to
          </label>
          <Input
            id="receipt-email"
            type="email"
            value={receiptEmail}
            onChange={(e) => setReceiptEmail(e.target.value)}
            placeholder="treasurer@church.org"
          />
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tithes recorded yet. Once your wallet or Tap-To-Pay cards are live, every gift appears here.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {payments.map((p) => (
              <div key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {formatMoney(Number(p.amount), p.currency)}
                    {isNfcPayment(p) && (
                      <Badge variant="secondary" className="ml-2">
                        Tap-To-Pay
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.paid_at).toLocaleString()} · {p.payment_method} ·{" "}
                    {p.anonymous ? "Anonymous" : p.donor_display_name ?? "—"} · {p.status}
                  </p>
                </div>
                {receiptFor === p.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={sending} onClick={() => void handleSendReceipt(p.id)}>
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm send"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReceiptFor(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setReceiptFor(p.id)}>
                    <Mail className="w-4 h-4 mr-2" /> Email receipt
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChurchTreasuryDashboard;
