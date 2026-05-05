import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AgentHealthStatus = 'healthy' | 'degraded' | 'unreachable' | 'unknown';
export type OverallStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';

export interface AgentHealthResult {
  name: string;
  functionName: string;
  type: 'sovereign' | 'sub-agent' | 'swarm';
  parent?: string;
  description: string;
  schedule: string;
  status: AgentHealthStatus;
  responseTimeMs: number;
  httpStatus: number | null;
  error: string | null;
  checkedAt: string;
  lastRunInfo?: Record<string, unknown>;
}

export interface VerificationReport {
  success: boolean;
  checkedAt: string;
  overallStatus: OverallStatus;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unreachable: number;
  };
  agents: AgentHealthResult[];
  runStats: Record<string, unknown>;
}

export function useAgentVerification() {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = useCallback(async (targetAgents?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {};
      if (targetAgents && targetAgents.length > 0) {
        body.agents = targetAgents;
      }

      const { data, error: fnError } = await supabase.functions.invoke('agent-health-check', {
        body,
      });

      if (fnError) {
        throw new Error(fnError.message ?? 'Health check invocation failed');
      }

      if (data && typeof data === 'object') {
        setReport(data as VerificationReport);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, runVerification };
}
