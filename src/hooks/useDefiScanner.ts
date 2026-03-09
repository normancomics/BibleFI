import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TokenPrice {
  usd: number;
  change_24h: number;
  change_7d: number;
}

export interface ProtocolData {
  protocol: string;
  type: string;
  tvl: number;
  change_1d: number;
}

export interface YieldPool {
  pool: string;
  apy: number;
  tvl: number;
  chain: string;
  project: string;
}

export interface BiblicalWisdom {
  scripture: string;
  reference: string;
  action_guidance: string;
  risk_warning: string;
}

export interface OpportunitySignal {
  type: string;
  protocol: string;
  asset: string;
  signal_strength: 'strong' | 'moderate' | 'weak';
  details: string;
  biblical_wisdom: BiblicalWisdom;
  metrics: Record<string, number | string>;
  timestamp: string;
  actionable: boolean;
}

export interface ScanResult {
  success: boolean;
  scan_timestamp: string;
  total_signals: number;
  actionable_signals: number;
  tokens_tracked: number;
  prices_fetched: number;
  protocols_scanned: number;
  yield_pools_found: number;
  prices: Record<string, TokenPrice>;
  protocols: ProtocolData[];
  yield_pools: YieldPool[];
  signals_by_type: Record<string, { count: number; top: OpportunitySignal[] }>;
  top_opportunities: OpportunitySignal[];
}

export function useDefiScanner(autoRefreshMs = 60000) {
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(Math.floor(autoRefreshMs / 1000));
  const [newSignals, setNewSignals] = useState<OpportunitySignal[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevSignalCountRef = useRef<number>(0);

  const fetchScan = useCallback(async () => {
    try {
      setError(null);
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/defi-opportunity-scanner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
          },
          body: JSON.stringify({ mode: 'dry_run' }),
        }
      );

      if (!res.ok) throw new Error(`Scanner returned ${res.status}`);
      const result: ScanResult = await res.json();

      // Detect new signals
      const prevCount = prevSignalCountRef.current;
      if (prevCount > 0 && result.total_signals > prevCount) {
        const allNew = result.top_opportunities.slice(0, result.total_signals - prevCount);
        setNewSignals(allNew);
      } else {
        setNewSignals([]);
      }
      prevSignalCountRef.current = result.total_signals;

      setData(result);
      setLastRefresh(new Date());
      setSecondsUntilRefresh(Math.floor(autoRefreshMs / 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scan data');
    } finally {
      setLoading(false);
    }
  }, [autoRefreshMs]);

  useEffect(() => {
    fetchScan();
    if (autoRefreshMs > 0) {
      intervalRef.current = setInterval(fetchScan, autoRefreshMs);
      countdownRef.current = setInterval(() => {
        setSecondsUntilRefresh(prev => (prev <= 1 ? Math.floor(autoRefreshMs / 1000) : prev - 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchScan, autoRefreshMs]);

  const refresh = useCallback(async () => {
    setSecondsUntilRefresh(Math.floor(autoRefreshMs / 1000));
    await fetchScan();
  }, [fetchScan, autoRefreshMs]);

  return { data, loading, error, lastRefresh, secondsUntilRefresh, newSignals, refresh };
}
