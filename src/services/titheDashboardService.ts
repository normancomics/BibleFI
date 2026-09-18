/**
 * Tithe dashboard data service.
 *
 * Reads the signed-in giver's ongoing tithe streams (public.superfluid_streams)
 * and their recorded tithe payments (public.church_tithe_payments). RLS scopes
 * every query to the current user, so no client-side filtering is required.
 *
 * "Bring ye all the tithes into the storehouse" — Malachi 3:10 (KJV)
 */
import { supabase } from '@/integrations/supabase/client';
import { supabaseApi } from '@/integrations/supabase/apiClient';

export interface GiverStream {
  id: string;
  streamId: string;
  churchId: string | null;
  churchName: string;
  receiverAddress: string;
  tokenSymbol: string;
  flowRate: string;
  monthlyAmount: number;
  status: string;
  startDate: string;
  txHash: string | null;
}

export interface GiverPayment {
  id: string;
  date: Date;
  church: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  txHash: string | null;
  anonymous: boolean;
}

export interface ChurchBalance {
  churchName: string;
  received: number;
  currency: string;
  streamedPerMonth: number;
}

const SECONDS_PER_MONTH = 60 * 60 * 24 * 30;

export function monthlyFromFlowRate(flowRate: string, decimals = 18): number {
  try {
    const perSecond = Number(BigInt(flowRate)) / 10 ** decimals;
    return perSecond * SECONDS_PER_MONTH;
  } catch {
    return 0;
  }
}

async function resolveChurchNames(ids: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {};
  try {
    const { data, error } = await supabaseApi
      .from('global_churches')
      .select('id, name')
      .in('id', unique);
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r: { id: string; name: string }) => [r.id, r.name]));
  } catch {
    return {};
  }
}

export async function fetchGiverStreams(): Promise<GiverStream[]> {
  const { data, error } = await supabase
    .from('superfluid_streams')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const names = await resolveChurchNames(rows.map((r) => r.church_id as string));

  return rows.map((r) => ({
    id: r.id,
    streamId: r.stream_id,
    churchId: r.church_id ?? null,
    churchName: (r.church_id && names[r.church_id]) || 'Church wallet',
    receiverAddress: r.receiver_address,
    tokenSymbol: r.token_symbol,
    flowRate: r.flow_rate,
    monthlyAmount: monthlyFromFlowRate(r.flow_rate),
    status: r.status,
    startDate: r.start_date,
    txHash: r.tx_hash ?? null,
  }));
}

interface MyTithePaymentRow {
  id: string;
  paid_at: string;
  amount: number | string;
  currency: string;
  payment_method: string;
  status: string;
  tx_hash: string | null;
  anonymous: boolean;
  church_name: string | null;
}

/**
 * Reads the signed-in giver's own tithe payments (scoped by giver_user_id inside
 * public.get_my_tithe_payments), resolving the receiving church by name.
 */
export async function fetchGiverPayments(): Promise<GiverPayment[]> {
  const { data, error } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: MyTithePaymentRow[] | null; error: { message: string } | null }>
  )('get_my_tithe_payments', { p_limit: 200 });
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    id: r.id,
    date: new Date(r.paid_at),
    church: r.church_name || (r.anonymous ? 'Church (anonymous gift)' : 'Church tithe'),
    amount: Number(r.amount) || 0,
    currency: r.currency,
    method: r.payment_method,
    status: r.status,
    txHash: r.tx_hash ?? null,
    anonymous: Boolean(r.anonymous),
  }));
}

export function buildChurchBalances(
  streams: GiverStream[],
  payments: GiverPayment[],
): ChurchBalance[] {
  const map = new Map<string, ChurchBalance>();

  for (const s of streams) {
    const key = s.churchName;
    const entry = map.get(key) ?? {
      churchName: key,
      received: 0,
      currency: s.tokenSymbol,
      streamedPerMonth: 0,
    };
    if (s.status === 'active') entry.streamedPerMonth += s.monthlyAmount;
    map.set(key, entry);
  }

  for (const p of payments) {
    if (p.status !== 'completed') continue;
    const key = p.church;
    const entry = map.get(key) ?? {
      churchName: key,
      received: 0,
      currency: p.currency,
      streamedPerMonth: 0,
    };
    entry.received += p.amount;
    map.set(key, entry);
  }

  return Array.from(map.values()).sort((a, b) => b.received - a.received);
}
