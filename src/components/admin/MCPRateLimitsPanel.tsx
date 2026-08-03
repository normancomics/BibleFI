import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MCP_RATE_LIMIT, MCP_RATE_WINDOW_SECONDS } from '@/lib/mcp/guard';

interface RateLimitBucket {
  bucket_key: string;
  window_start: string;
  request_count: number;
}

const MCPRateLimitsPanel: React.FC = () => {
  const [buckets, setBuckets] = useState<RateLimitBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchBuckets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('mcp_rate_limits' as never)
      .select('bucket_key, window_start, request_count')
      .order('request_count', { ascending: false })
      .limit(100);

    setBuckets((data as RateLimitBucket[]) ?? []);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { void fetchBuckets(); }, []);

  const nearLimit = buckets.filter((b) => b.request_count >= MCP_RATE_LIMIT * 0.8);
  const atLimit = buckets.filter((b) => b.request_count >= MCP_RATE_LIMIT);

  function usagePercent(count: number) {
    return Math.min(100, Math.round((count / MCP_RATE_LIMIT) * 100));
  }

  function bucketBadgeClass(count: number) {
    if (count >= MCP_RATE_LIMIT) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (count >= MCP_RATE_LIMIT * 0.8) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Buckets', value: buckets.length, icon: <Database className="w-5 h-5" />, color: 'text-blue-400' },
          { label: 'Near Limit (≥80%)', value: nearLimit.length, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-yellow-400' },
          { label: 'At Limit', value: atLimit.length, icon: <ShieldCheck className="w-5 h-5" />, color: 'text-red-400' },
        ].map((card) => (
          <Card key={card.label} className="bg-card/30 border-border/50">
            <CardContent className="pt-5 flex items-center gap-4">
              <span className={card.color}>{card.icon}</span>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-white/50">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Config note */}
      <Card className="bg-card/30 border-border/50">
        <CardContent className="pt-5 text-white/60 text-sm flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          Budget: <span className="text-white font-mono">{MCP_RATE_LIMIT} requests</span> per{' '}
          <span className="text-white font-mono">{MCP_RATE_WINDOW_SECONDS}s</span> window, per caller.
          Buckets expire automatically when the window closes.
          <span className="ml-auto text-xs text-white/30">
            {lastRefresh ? `Last refresh: ${lastRefresh.toLocaleTimeString()}` : ''}
          </span>
        </CardContent>
      </Card>

      {/* Bucket table */}
      <Card className="bg-card/30 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white/80 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              mcp_rate_limits buckets
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void fetchBuckets()}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-white/40">Loading…</div>
          ) : buckets.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              No active rate-limit buckets. Buckets appear when MCP tools are called.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                    <th className="text-left py-2 pr-4">Bucket Key</th>
                    <th className="text-left py-2 pr-4">Window Start</th>
                    <th className="text-left py-2 pr-4">Count</th>
                    <th className="text-left py-2 pr-4">Usage</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((b) => {
                    const pct = usagePercent(b.request_count);
                    return (
                      <tr key={`${b.bucket_key}::${b.window_start}`} className="border-b border-white/5 hover:bg-white/3">
                        <td className="py-2 pr-4 font-mono text-purple-300 text-xs max-w-xs truncate">
                          {b.bucket_key}
                        </td>
                        <td className="py-2 pr-4 text-white/50 text-xs whitespace-nowrap">
                          {new Date(b.window_start).toLocaleTimeString()}
                        </td>
                        <td className="py-2 pr-4 text-white font-mono">
                          {b.request_count}/{MCP_RATE_LIMIT}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/50">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge className={`${bucketBadgeClass(b.request_count)} text-xs`}>
                            {b.request_count >= MCP_RATE_LIMIT ? 'At limit' : b.request_count >= MCP_RATE_LIMIT * 0.8 ? 'Near limit' : 'OK'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPRateLimitsPanel;
