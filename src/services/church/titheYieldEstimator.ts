// Church treasury metrics — tithe totals, NFC card usage, and pending BWTYA yields.
//
// "The plans of the diligent lead to profit" (Proverbs 21:5).
//
// Pending yield is an *estimate*: settled tithes accrue at their parable-pool APY
// from the moment they land until the church sweeps them into a live BWTYA vault.
// Deterministic and offline-safe (no network, Sabbath friendly).

import type { NfcCardOrder, TithePayment } from "@/services/churchOnboardingService";

export interface ParablePool {
  id: string;
  name: string;
  scripture: string;
  apy: number; // annualised, e.g. 0.052 = 5.2%
}

/** Parable pools a church treasury is eligible for, conservative first. */
export const CHURCH_PARABLE_POOLS: ParablePool[] = [
  { id: "sabbath", name: "Sabbath Rest", scripture: "Exodus 20:8-11", apy: 0.041 },
  { id: "talents", name: "Parable of Talents", scripture: "Matthew 25:14-30", apy: 0.068 },
  { id: "joseph", name: "Joseph's Storehouse", scripture: "Genesis 41:35-36", apy: 0.055 },
];

export const DEFAULT_CHURCH_POOL = CHURCH_PARABLE_POOLS[2]; // Joseph's Storehouse

const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

/** Payment methods that route through a Tap-To-Pay NFC card. */
const NFC_METHOD_PATTERN = /nfc|tap|card|burner/i;

export function isNfcPayment(payment: TithePayment): boolean {
  return NFC_METHOD_PATTERN.test(payment.payment_method);
}

export function isSettled(payment: TithePayment): boolean {
  return payment.status === "completed" || payment.status === "confirmed";
}

export interface TitheTotals {
  allTime: number;
  last30Days: number;
  last7Days: number;
  pendingSettlement: number;
  paymentCount: number;
  donorCount: number;
  averageGift: number;
  currency: string;
  lastGiftAt: string | null;
}

export function summariseTithes(payments: TithePayment[]): TitheTotals {
  const now = Date.now();
  const settled = payments.filter(isSettled);
  const sum = (list: TithePayment[]) => list.reduce((t, p) => t + Number(p.amount || 0), 0);
  const since = (days: number) =>
    settled.filter((p) => now - new Date(p.paid_at).getTime() <= days * 24 * 60 * 60 * 1000);

  const donors = new Set(
    settled.map((p) => (p.anonymous ? `anon:${p.id}` : p.donor_display_name ?? `anon:${p.id}`)),
  );

  const allTime = sum(settled);

  return {
    allTime,
    last30Days: sum(since(30)),
    last7Days: sum(since(7)),
    pendingSettlement: sum(payments.filter((p) => !isSettled(p) && p.status !== "failed")),
    paymentCount: settled.length,
    donorCount: donors.size,
    averageGift: settled.length ? allTime / settled.length : 0,
    currency: settled[0]?.currency ?? payments[0]?.currency ?? "USDC",
    lastGiftAt: settled[0]?.paid_at ?? null,
  };
}

export interface CardUsageSummary {
  ordersPlaced: number;
  cardsOrdered: number;
  cardsActivated: number;
  awaitingShipment: number;
  tapPayments: number;
  tapVolume: number;
  tapShareOfGiving: number; // 0–1
  lastTapAt: string | null;
}

export function summariseCardUsage(
  cards: NfcCardOrder[],
  payments: TithePayment[],
): CardUsageSummary {
  const settled = payments.filter(isSettled);
  const taps = settled.filter(isNfcPayment);
  const tapVolume = taps.reduce((t, p) => t + Number(p.amount || 0), 0);
  const totalVolume = settled.reduce((t, p) => t + Number(p.amount || 0), 0);

  return {
    ordersPlaced: cards.length,
    cardsOrdered: cards.reduce((t, c) => t + Number(c.quantity || 0), 0),
    cardsActivated: cards
      .filter((c) => c.activated_at || c.status === "activated")
      .reduce((t, c) => t + Number(c.quantity || 0), 0),
    awaitingShipment: cards
      .filter((c) => c.status === "pending" || c.status === "approved")
      .reduce((t, c) => t + Number(c.quantity || 0), 0),
    tapPayments: taps.length,
    tapVolume,
    tapShareOfGiving: totalVolume > 0 ? tapVolume / totalVolume : 0,
    lastTapAt: taps[0]?.paid_at ?? null,
  };
}

export interface PendingYieldLine {
  paymentId: string;
  principal: number;
  daysHeld: number;
  accrued: number;
}

export interface PendingYieldSummary {
  pool: ParablePool;
  principal: number;
  accrued: number;
  projected30Day: number;
  projectedAnnual: number;
  /** After the mandatory 10% tithe on yield — "the tithe is the Lord's" (Leviticus 27:30) */
  titheOnYield: number;
  netToTreasury: number;
  longestHeldDays: number;
  lines: PendingYieldLine[];
}

/**
 * Continuously-compounded accrual on every settled tithe still sitting idle.
 * `asOf` is injectable so the figure is testable and deterministic.
 */
export function estimatePendingYields(
  payments: TithePayment[],
  pool: ParablePool = DEFAULT_CHURCH_POOL,
  asOf: Date = new Date(),
): PendingYieldSummary {
  const settled = payments.filter(isSettled);
  const lines: PendingYieldLine[] = settled.map((p) => {
    const principal = Number(p.amount || 0);
    const heldMs = Math.max(0, asOf.getTime() - new Date(p.paid_at).getTime());
    const years = heldMs / MS_PER_YEAR;
    const accrued = principal * (Math.exp(pool.apy * years) - 1);
    return {
      paymentId: p.id,
      principal,
      daysHeld: heldMs / (24 * 60 * 60 * 1000),
      accrued,
    };
  });

  const principal = lines.reduce((t, l) => t + l.principal, 0);
  const accrued = lines.reduce((t, l) => t + l.accrued, 0);
  const titheOnYield = accrued * 0.1;

  return {
    pool,
    principal,
    accrued,
    projected30Day: principal * (Math.exp(pool.apy * (30 / 365)) - 1),
    projectedAnnual: principal * pool.apy,
    titheOnYield,
    netToTreasury: accrued - titheOnYield,
    longestHeldDays: lines.reduce((m, l) => Math.max(m, l.daysHeld), 0),
    lines,
  };
}

export function formatMoney(value: number, currency = "USDC"): string {
  const digits = Math.abs(value) < 1 && value !== 0 ? 4 : 2;
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} ${currency}`;
}
