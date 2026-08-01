import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import NeuralNetworkBackground from '@/components/home/NeuralNetworkBackground';

interface AuditRow {
  id: string;
  tool_name: string;
  caller_key: string;
  sanitized_input: Record<string, unknown> | null;
  rate_limited: boolean;
  rate_remaining: number | null;
  retry_after: number | null;
  outcome: 'success' | 'rate_limited' | 'error';
  error_message: string | null;
  created_at: string;
}

const OUTCOME_STYLES: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  rate_limited: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const MCPAuditLogPage: React.FC = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOutcome, setFilterOutcome] = useState<string>('all');

  const fetchLog = async () => {
    setLoading(true);
    const q = supabase
      .from('mcp_audit_log' as never)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    const { data } = await q;
    setRows((data as AuditRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void fetchLog(); }, []);

  const filtered = filterOutcome === 'all'
    ? rows
    : rows.filter((r) => r.outcome === filterOutcome);

  const rateLimitedCount = rows.filter((r) => r.rate_limited).length;
  const errorCount = rows.filter((r) => r.outcome === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black relative">
      <div className="absolute inset-0 overflow-hidden">
        <NeuralNetworkBackground opacity={0.12} paletteIndex={2} />
      </div>
      <div className="relative z-10">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    MCP Audit Log
                  </h1>
                  <p className="text-white/60 text-sm">Every tool call — sanitized inputs, rate-limit decisions, timestamps</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchLog()}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Calls', value: rows.length, icon: <FileText className="w-5 h-5" />, color: 'text-blue-400' },
              { label: 'Rate Limited', value: rateLimitedCount, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400' },
              { label: 'Errors', value: errorCount, icon: <ShieldAlert className="w-5 h-5" />, color: 'text-red-400' },
            ].map((card) => (
              <Card key={card.label} className="bg-card/30 border-border/50">
                <CardContent className="pt-6 flex items-center gap-4">
                  <span className={card.color}>{card.icon}</span>
                  <div>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-white/50">{card.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'success', 'rate_limited', 'error'].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filterOutcome === f ? 'default' : 'outline'}
                onClick={() => setFilterOutcome(f)}
                className={filterOutcome === f
                  ? 'bg-purple-600 text-white'
                  : 'border-white/20 text-white/60 hover:bg-white/5'}
              >
                {f === 'all' ? 'All' : f.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {/* Log table */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                {filtered.length} {filterOutcome === 'all' ? 'total' : filterOutcome.replace('_', ' ')} entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10 text-white/40">Loading audit log…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-white/40">No entries yet. Tool calls will appear here.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="text-left py-2 pr-4">Timestamp</th>
                        <th className="text-left py-2 pr-4">Tool</th>
                        <th className="text-left py-2 pr-4">Caller</th>
                        <th className="text-left py-2 pr-4">Outcome</th>
                        <th className="text-left py-2 pr-4">Remaining</th>
                        <th className="text-left py-2">Sanitized Input</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/3">
                          <td className="py-2 pr-4 text-white/50 whitespace-nowrap font-mono text-xs">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4 font-mono text-purple-300">{row.tool_name}</td>
                          <td className="py-2 pr-4 text-white/60 font-mono text-xs">{row.caller_key}</td>
                          <td className="py-2 pr-4">
                            <Badge className={`${OUTCOME_STYLES[row.outcome] ?? ''} text-xs`}>
                              {row.outcome}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-white/50 text-xs">
                            {row.rate_remaining != null ? row.rate_remaining : '—'}
                            {row.retry_after != null && (
                              <span className="ml-1 text-yellow-400">(retry {row.retry_after}s)</span>
                            )}
                          </td>
                          <td className="py-2 text-white/40 text-xs max-w-xs truncate">
                            {row.sanitized_input
                              ? JSON.stringify(row.sanitized_input)
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default MCPAuditLogPage;
