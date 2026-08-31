import React, { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, CheckCircle2, CreditCard, Church as ChurchIcon, Receipt, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchCardOrders,
  fetchMyChurch,
  fetchTithePayments,
  requestNfcCards,
  submitChurchOnboarding,
  type ChurchOnboardingRecord,
  type NfcCardOrder,
  type TithePayment,
} from "@/services/churchOnboardingService";

const statusVariant = (status: string) => {
  switch (status) {
    case "approved":
    case "shipped":
    case "completed":
    case "activated":
      return "default" as const;
    case "rejected":
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

const ChurchOnboardingFlow: React.FC = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [church, setChurch] = useState<ChurchOnboardingRecord | null>(null);
  const [cards, setCards] = useState<NfcCardOrder[]>([]);
  const [payments, setPayments] = useState<TithePayment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderingCards, setOrderingCards] = useState(false);

  const [form, setForm] = useState({
    church_name: "",
    denomination: "",
    address: "",
    city: "",
    state_province: "",
    country: "",
    postal_code: "",
    website: "",
    pastor_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    wallet_address: "",
  });

  const [cardForm, setCardForm] = useState({
    quantity: "100",
    logo_url: "",
    design_notes: "",
    shipping_address: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setAuthChecked(true);
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
        const [orders, tithes] = await Promise.all([
          fetchCardOrders(mine.id),
          fetchTithePayments(mine.id),
        ]);
        setCards(orders);
        setPayments(tithes);
      }
    } catch (err) {
      toast({
        title: "Could not load your church",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (authChecked) void load();
  }, [authChecked, load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!form.church_name || !form.city || !form.country || !form.contact_name || !form.contact_email) {
      toast({
        title: "A few details are missing",
        description: "Church name, city, country, contact name and email are required.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const created = await submitChurchOnboarding(userId, {
        church_name: form.church_name,
        denomination: form.denomination || null,
        address: form.address || null,
        city: form.city,
        state_province: form.state_province || null,
        country: form.country,
        postal_code: form.postal_code || null,
        website: form.website || null,
        pastor_name: form.pastor_name || null,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone || null,
        wallet_address: form.wallet_address || null,
        preferred_currencies: ["USDC"],
      });
      setChurch(created);
      toast({
        title: "Church registered",
        description: "Honor the Lord with your firstfruits — Proverbs 3:9",
      });
    } catch (err) {
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;
    const quantity = Number(cardForm.quantity);
    if (!Number.isFinite(quantity) || quantity < 25) {
      toast({
        title: "Minimum order is 25 cards",
        description: "Cards are produced in small batches — about $4 per 1,000.",
        variant: "destructive",
      });
      return;
    }
    setOrderingCards(true);
    try {
      const order = await requestNfcCards({
        onboarding_id: church.id,
        quantity,
        logo_url: cardForm.logo_url,
        design_notes: cardForm.design_notes,
        shipping_address: cardForm.shipping_address || church.address,
      });
      setCards((prev) => [order, ...prev]);
      setCardForm({ quantity: "100", logo_url: "", design_notes: "", shipping_address: "" });
      toast({ title: "Card order requested", description: `${quantity} Tap-To-Pay cards queued for production.` });
    } catch (err) {
      toast({
        title: "Card request failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setOrderingCards(false);
    }
  };

  const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  if (!authChecked || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!userId) {
    return (
      <Card className="p-8 text-center max-w-xl mx-auto">
        <ChurchIcon className="w-10 h-10 mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Sign in to register your church</h2>
        <p className="text-muted-foreground mb-6">
          Church onboarding keeps your contact details and giving records private to your account.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/auth/signup">Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth/login">Sign in</Link>
          </Button>
        </div>
      </Card>
    );
  }

  if (!church) {
    return (
      <Card className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-1">Register your church</h2>
        <p className="text-muted-foreground mb-6">
          Step 1 of 3 — after registering you can order Burner.pro Tap-To-Pay cards and follow every tithe received.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="church_name">Church name *</Label>
            <Input id="church_name" value={form.church_name} onChange={(e) => setForm({ ...form, church_name: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="denomination">Denomination</Label>
              <Input id="denomination" value={form.denomination} onChange={(e) => setForm({ ...form, denomination: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pastor_name">Lead pastor</Label>
              <Input id="pastor_name" value={form.pastor_name} onChange={(e) => setForm({ ...form, pastor_name: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Street address</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state_province">State / province</Label>
              <Input id="state_province" value={form.state_province} onChange={(e) => setForm({ ...form, state_province: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal code</Label>
              <Input id="postal_code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact name *</Label>
              <Input id="contact_name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact email *</Label>
              <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact phone</Label>
              <Input id="contact_phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wallet_address">Receiving wallet (Base)</Label>
            <Input id="wallet_address" placeholder="0x…" value={form.wallet_address} onChange={(e) => setForm({ ...form, wallet_address: e.target.value })} />
            <p className="text-xs text-muted-foreground">
              Tithes settle in stablecoins straight to this wallet — no processor fees in between.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Register church
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{church.church_name}</h2>
            <p className="text-muted-foreground text-sm">
              {[church.city, church.state_province, church.country].filter(Boolean).join(", ")}
              {church.denomination ? ` • ${church.denomination}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(church.status)} className="capitalize">{church.status}</Badge>
            <Button variant="ghost" size="icon" onClick={() => void load()} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {church.review_notes && (
          <p className="mt-4 text-sm text-muted-foreground">Reviewer note: {church.review_notes}</p>
        )}
      </Card>

      <Tabs defaultValue="cards">
        <TabsList className="w-full">
          <TabsTrigger value="cards" className="flex-1">
            <CreditCard className="w-4 h-4 mr-2" /> NFC cards
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            <Receipt className="w-4 h-4 mr-2" /> Tithe payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-1">Request Burner.pro Tap-To-Pay cards</h3>
            <p className="text-sm text-muted-foreground mb-4">
              NFC-chip Tap-To-Pay Visa-Cards branded with your church logo. Each card is a hardware wallet with a Visa
              payment interface — not a Visa debit card. Cards work standalone or with the BurnerPro wallet app, and
              gas-sponsored stablecoin payments arrive directly in your wallet.
            </p>
            <form onSubmit={handleCardOrder} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min={25} value={cardForm.quantity} onChange={(e) => setCardForm({ ...cardForm, quantity: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input id="logo_url" type="url" placeholder="https://" value={cardForm.logo_url} onChange={(e) => setCardForm({ ...cardForm, logo_url: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_address">Shipping address</Label>
                <Input id="shipping_address" placeholder={church.address ?? "Where should we ship the cards?"} value={cardForm.shipping_address} onChange={(e) => setCardForm({ ...cardForm, shipping_address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="design_notes">Design notes</Label>
                <Textarea id="design_notes" rows={3} value={cardForm.design_notes} onChange={(e) => setCardForm({ ...cardForm, design_notes: e.target.value })} />
              </div>
              <Button type="submit" disabled={orderingCards}>
                {orderingCards ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                Request cards
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your card orders</h3>
            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No card orders yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {cards.map((order) => (
                  <li key={order.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{order.quantity} cards</p>
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(order.created_at).toLocaleDateString()}
                        {order.tracking_number ? ` • Tracking ${order.tracking_number}` : ""}
                      </p>
                    </div>
                    <Badge variant={statusVariant(order.status)} className="capitalize">{order.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-semibold">Tithes received</h3>
              <p className="text-sm text-muted-foreground">
                {payments.length} payments • {totalReceived.toLocaleString(undefined, { maximumFractionDigits: 2 })} total
              </p>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tithes recorded yet. Payments appear here as soon as your first card taps or stream settles.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {payments.map((p) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {Number(p.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} {p.currency}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(p.paid_at).toLocaleString()} • {p.payment_method}
                        {p.anonymous ? " • anonymous giver" : p.donor_display_name ? ` • ${p.donor_display_name}` : ""}
                      </p>
                    </div>
                    <Badge variant={statusVariant(p.status)} className="capitalize">{p.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurchOnboardingFlow;
