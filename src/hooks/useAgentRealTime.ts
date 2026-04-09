import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AgentStats {
  total_runs: number;
  completed_runs: number;
  failed_runs: number;
  total_audit_entries: number;
  recent_runs: any[];
  agents: any[];
}

export function useAgentRealTime() {
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const mountedRef = useRef(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await supabase.rpc('get_agent_stats');
      if (data && mountedRef.current) {
        setAgentStats(data as any);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch agent stats:', e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchStats();

    // Real-time subscriptions to agent_ops tables exposed via public API
    const runsChannel = supabase
      .channel('agent-runs-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wisdom_scores' },
        () => fetchStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bible_verses' },
        () => fetchStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'biblical_knowledge_base' },
        () => fetchStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'global_churches' },
        () => fetchStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'defi_knowledge_base' },
        () => fetchStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'superfluid_streams' },
        () => fetchStats()
      )
      .subscribe();

    // Fallback polling at 60s (much slower since WebSocket handles live updates)
    const fallback = setInterval(fetchStats, 60000);

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(runsChannel);
      clearInterval(fallback);
    };
  }, [fetchStats]);

  return { agentStats, loading, lastUpdate, refetch: fetchStats };
}
