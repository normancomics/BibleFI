/**
 * wisdomDashboardService — a steward's own record of yield strategies.
 *
 * Every position and every settlement is written under the signed-in steward's
 * own id, and read back only by that steward (row level security). Nothing here
 * simulates the 10% tithe: the figures stored are the ones the vault contract
 * itself settled.
 *
 * "Moreover it is required in stewards, that a man be found faithful"
 *  — 1 Corinthians 4:2 (KJV)
 */
import { supabase } from '@/integrations/supabase/client';

export interface WisdomPosition {
  id: string;
  strategyName: string;
  chainId: number;
  vaultAddress: string;
  principal: number;
  tokenSymbol: string;
  verseHash: string | null;
  depositTx: string | null;
  status: string;
  createdAt: string;
}

export interface WisdomYieldEvent {
  id: string;
  positionId: string | null;
  strategyName: string;
  grossYield: number;
  titheAmount: number;
  netYield: number;
  tokenSymbol: string;
  txHash: string | null;
  occurredAt: string;
}

export interface WisdomStrategyBalance {
  strategyName: string;
  tokenSymbol: string;
  principal: number;
  grossEarned: number;
  tithePaid: number;
  netKept: number;
  settlements: number;
  lastActivity: string;
}

export interface WisdomDashboardData {
  positions: WisdomPosition[];
  events: WisdomYieldEvent[];
  balances: WisdomStrategyBalance[];
  totals: {
    principal: number;
    grossEarned: number;
    tithePaid: number;
    netKept: number;
  };
}

const num = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? '0'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function recordStrategyDeposit(input: {
  strategyName: string;
  chainId: number;
  vaultAddress: string;
  principal: number;
  tokenSymbol: string;
  walletAddress?: string | null;
  verseHash?: string | null;
  depositTx?: string | null;
}): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const { data, error } = await supabase
    .from('wisdom_strategy_positions')
    .insert({
      user_id: auth.user.id,
      strategy_name: input.strategyName,
      chain_id: input.chainId,
      vault_address: input.vaultAddress,
      principal: input.principal,
      token_symbol: input.tokenSymbol,
      wallet_address: input.walletAddress ?? null,
      verse_hash: input.verseHash ?? null,
      deposit_tx: input.depositTx ?? null,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.warn('[wisdom] could not record strategy position', error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function recordYieldSettlement(input: {
  strategyName: string;
  grossYield: number;
  titheAmount: number;
  netYield: number;
  tokenSymbol: string;
  positionId?: string | null;
  txHash?: string | null;
}): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return;

  const { error } = await supabase.from('wisdom_yield_events').insert({
    user_id: auth.user.id,
    position_id: input.positionId ?? null,
    strategy_name: input.strategyName,
    gross_yield: input.grossYield,
    tithe_amount: input.titheAmount,
    net_yield: input.netYield,
    token_symbol: input.tokenSymbol,
    tx_hash: input.txHash ?? null,
  });
  if (error) console.warn('[wisdom] could not record settlement', error.message);
}

export async function fetchWisdomDashboard(): Promise<WisdomDashboardData> {
  const empty: WisdomDashboardData = {
    positions: [],
    events: [],
    balances: [],
    totals: { principal: 0, grossEarned: 0, tithePaid: 0, netKept: 0 },
  };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return empty;

  const [positionsRes, eventsRes] = await Promise.all([
    supabase
      .from('wisdom_strategy_positions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('wisdom_yield_events')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(200),
  ]);

  const positions: WisdomPosition[] = (positionsRes.data ?? []).map((row) => ({
    id: row.id as string,
    strategyName: (row.strategy_name as string) ?? 'Strategy',
    chainId: Number(row.chain_id ?? 0),
    vaultAddress: (row.vault_address as string) ?? '',
    principal: num(row.principal),
    tokenSymbol: (row.token_symbol as string) ?? 'USDC',
    verseHash: (row.verse_hash as string) ?? null,
    depositTx: (row.deposit_tx as string) ?? null,
    status: (row.status as string) ?? 'active',
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  }));

  const events: WisdomYieldEvent[] = (eventsRes.data ?? []).map((row) => ({
    id: row.id as string,
    positionId: (row.position_id as string) ?? null,
    strategyName: (row.strategy_name as string) ?? 'Strategy',
    grossYield: num(row.gross_yield),
    titheAmount: num(row.tithe_amount),
    netYield: num(row.net_yield),
    tokenSymbol: (row.token_symbol as string) ?? 'USDC',
    txHash: (row.tx_hash as string) ?? null,
    occurredAt: (row.occurred_at as string) ?? new Date().toISOString(),
  }));

  const byStrategy = new Map<string, WisdomStrategyBalance>();
  const touch = (name: string, tokenSymbol: string, when: string) => {
    const existing = byStrategy.get(name);
    if (existing) {
      if (when > existing.lastActivity) existing.lastActivity = when;
      return existing;
    }
    const created: WisdomStrategyBalance = {
      strategyName: name,
      tokenSymbol,
      principal: 0,
      grossEarned: 0,
      tithePaid: 0,
      netKept: 0,
      settlements: 0,
      lastActivity: when,
    };
    byStrategy.set(name, created);
    return created;
  };

  positions
    .filter((position) => position.status !== 'closed')
    .forEach((position) => {
      const bucket = touch(position.strategyName, position.tokenSymbol, position.createdAt);
      bucket.principal += position.principal;
    });

  events.forEach((event) => {
    const bucket = touch(event.strategyName, event.tokenSymbol, event.occurredAt);
    bucket.grossEarned += event.grossYield;
    bucket.tithePaid += event.titheAmount;
    bucket.netKept += event.netYield;
    bucket.settlements += 1;
  });

  const balances = Array.from(byStrategy.values()).sort(
    (a, b) => b.principal + b.grossEarned - (a.principal + a.grossEarned),
  );

  return {
    positions,
    events,
    balances,
    totals: {
      principal: balances.reduce((sum, item) => sum + item.principal, 0),
      grossEarned: balances.reduce((sum, item) => sum + item.grossEarned, 0),
      tithePaid: balances.reduce((sum, item) => sum + item.tithePaid, 0),
      netKept: balances.reduce((sum, item) => sum + item.netKept, 0),
    },
  };
}
