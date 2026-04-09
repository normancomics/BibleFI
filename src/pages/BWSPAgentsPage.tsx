import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, CheckCircle, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from '@/components/home/NeuralNetworkBackground';
import { useAgentRealTime } from '@/hooks/useAgentRealTime';

interface AgentRun {
  agent_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  records_processed: number;
  records_created: number;
}

interface AgentPermission {
  agent_name: string;
  allowed_tables: string[];
  allowed_operations: string[];
  rate_limit_per_hour: number;
  is_active: boolean;
}

const BWSP_AGENTS = [
  'scripture-integrity-validator',
  'sync-knowledge-base',
  'biblical-advisor',
];

const BWSPAgentsPage: React.FC = () => {
  const { agentStats, loading, lastUpdate } = useAgentRealTime();

  const bwspRuns = agentStats?.recent_runs?.filter(r => 
    BWSP_AGENTS.some(a => r.agent_name?.includes(a))
  ) || [];

  const bwspAgents = agentStats?.agents?.filter(a => 
    BWSP_AGENTS.some(name => a.agent_name?.includes(name))
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black relative">
      <div className="absolute inset-0 overflow-hidden">
        <NeuralNetworkBackground opacity={0.15} paletteIndex={0} />
      </div>
      <div className="relative z-10">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                BWSP Agents
              </h1>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />LIVE
              </Badge>
            </div>
            <p className="text-white/60">Biblical Wisdom Synthesis Protocol — Sovereign Agent Network</p>
          </motion.div>

          {/* Agent Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { name: 'Scripture Integrity Validator', desc: 'Validates KJV accuracy with Hebrew/Greek/Aramaic cross-references', icon: <CheckCircle className="w-6 h-6" />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
              { name: 'Knowledge Base Sync', desc: 'Syncs biblical knowledge base with DeFi cross-references', icon: <Zap className="w-6 h-6" />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
              { name: 'Biblical Advisor (LLM)', desc: 'RAG-AGI powered financial guidance via Fireworks.ai', icon: <Brain className="w-6 h-6" />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
            ].map((agent, i) => (
              <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`${agent.bg} border`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className={agent.color}>{agent.icon}</span>
                      {agent.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/60 mb-3">{agent.desc}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Active Agents from DB */}
          <Card className="bg-card/30 border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Registered BWSP Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-white/40">Loading agent data...</div>
              ) : bwspAgents.length > 0 ? (
                <div className="space-y-3">
                  {bwspAgents.map(agent => (
                    <div key={agent.agent_name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <span className="font-mono text-sm text-white/90">{agent.agent_name}</span>
                        <div className="text-xs text-white/40 mt-1">
                          Tables: {agent.allowed_tables?.join(', ')} | Rate: {agent.rate_limit_per_hour}/hr
                        </div>
                      </div>
                      <Badge variant={agent.is_active ? 'default' : 'destructive'} className={agent.is_active ? 'bg-green-500/20 text-green-400' : ''}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40">
                  <p>BWSP agents are running in sandboxed environments.</p>
                  <p className="text-xs mt-2">Agent stats will appear here when runs are logged via agent_ops.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Runs */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent BWSP Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bwspRuns.length > 0 ? (
                <div className="space-y-2">
                  {bwspRuns.map((run, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="font-mono text-xs text-white/80">{run.agent_name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40">{new Date(run.started_at).toLocaleString()}</span>
                        <Badge className={run.status === 'completed' ? 'bg-green-500/20 text-green-400' : run.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}>
                          {run.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-white/40 text-sm">No recent BWSP runs logged yet. Agents run on scheduled intervals.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default BWSPAgentsPage;
