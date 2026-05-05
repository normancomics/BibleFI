import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, Activity, Database, Church, BookOpen, Shield, Brain, TrendingUp, Clock, Cpu, CheckCircle, XCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { useAgentRealTime } from '@/hooks/useAgentRealTime';
import { useAgentVerification, type AgentHealthStatus } from '@/hooks/useAgentVerification';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from '@/components/home/NeuralNetworkBackground';

interface AgentInfo {
  name: string;
  functionName?: string;
  type: 'sovereign' | 'sub-agent' | 'swarm';
  parent?: string;
  description: string;
  schedule: string;
  icon: React.ReactNode;
  color: string;
}

const AGENT_NETWORK: AgentInfo[] = [
  // Sovereign Agents
  { name: 'BWSP Sovereign Agent', functionName: 'bwsp-sovereign-agent', type: 'sovereign', description: 'Master orchestrator for Biblical Wisdom Synthesis Protocol', schedule: 'Always on', icon: <Brain className="w-5 h-5" />, color: 'text-purple-400' },
  { name: 'Church Seeder Sovereign', functionName: 'church-seeder-agent', type: 'sovereign', description: 'Global church database discovery and seeding', schedule: 'Hourly (6 staggered jobs)', icon: <Church className="w-5 h-5" />, color: 'text-green-400' },

  // Sub-agents
  { name: 'Scripture Integrity Validator', functionName: 'scripture-integrity-validator', type: 'sub-agent', parent: 'BWSP Sovereign Agent', description: 'Validates KJV text accuracy with Hebrew/Greek/Aramaic originals', schedule: 'Daily', icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-400' },
  { name: 'Knowledge Base Sync', functionName: 'sync-knowledge-base', type: 'sub-agent', parent: 'BWSP Sovereign Agent', description: 'Syncs biblical knowledge base and DeFi cross-references', schedule: 'Daily', icon: <Database className="w-5 h-5" />, color: 'text-cyan-400' },
  { name: 'Biblical Advisor (LLM)', functionName: 'biblical-advisor', type: 'sub-agent', parent: 'BWSP Sovereign Agent', description: 'RAG-AGI powered guidance via LLM', schedule: 'On demand', icon: <Brain className="w-5 h-5" />, color: 'text-purple-300' },
  { name: 'Church Data Validator', functionName: 'church-data-validator', type: 'sub-agent', parent: 'Church Seeder Sovereign', description: 'Verifies seeded church data accuracy', schedule: 'Hourly', icon: <Church className="w-5 h-5" />, color: 'text-green-300' },
  { name: 'DeFi Opportunity Scanner', functionName: 'defi-opportunity-scanner', type: 'sub-agent', parent: 'BWTYA Sovereign Agent', description: 'Scans Base Chain DeFi protocols for yield opportunities', schedule: 'Every 30 min', icon: <TrendingUp className="w-5 h-5" />, color: 'text-yellow-300' },
  { name: 'Spandex Swap Agent', functionName: 'spandex-swap-agent', type: 'sub-agent', parent: 'BWTYA Sovereign Agent', description: 'BWTYA-scored DEX aggregator advisory pipeline', schedule: 'On demand', icon: <Zap className="w-5 h-5" />, color: 'text-orange-400' },
  { name: 'Market Wisdom Correlator', functionName: 'market-wisdom-correlator', type: 'sub-agent', parent: 'BWTYA Sovereign Agent', description: 'Cross-references market signals with Biblical wisdom', schedule: 'Every 15 min', icon: <Activity className="w-5 h-5" />, color: 'text-amber-400' },
  { name: 'DeFi Market Watchdog', functionName: 'defi-market-watchdog', type: 'sub-agent', parent: 'BWTYA Sovereign Agent', description: 'Continuous DeFi risk and opportunity monitoring', schedule: 'Every 5 min', icon: <Shield className="w-5 h-5" />, color: 'text-red-400' },
  { name: 'Biblical Wisdom Aggregator', functionName: 'biblical-wisdom-aggregator', type: 'sub-agent', parent: 'BWSP Sovereign Agent', description: 'Aggregates and enriches biblical financial wisdom', schedule: 'Daily', icon: <BookOpen className="w-5 h-5" />, color: 'text-indigo-400' },
  { name: 'Scripture Financial Scanner', functionName: 'scripture-financial-scanner', type: 'sub-agent', parent: 'BWSP Sovereign Agent', description: 'Scans scriptures for financial principles', schedule: 'Daily', icon: <Cpu className="w-5 h-5" />, color: 'text-violet-400' },

  // Swarms
  { name: 'Church Discovery Swarm', type: 'swarm', parent: 'Church Seeder Sovereign', description: 'Multi-source church discovery (Google, OSM, Wikidata, denominational directories)', schedule: 'Hourly', icon: <Network className="w-5 h-5" />, color: 'text-emerald-400' },
  { name: 'Scripture Mining Swarm', type: 'swarm', parent: 'BWSP Sovereign Agent', description: '15 specialized crawlers mining financial wisdom across full KJV + originals', schedule: 'Daily', icon: <Cpu className="w-5 h-5" />, color: 'text-indigo-400' },
  { name: 'Market Signal Swarm', type: 'swarm', parent: 'BWTYA Sovereign Agent', description: 'Cross-references market signals with Biblical wisdom for aligned opportunities', schedule: 'Every 15 min', icon: <Activity className="w-5 h-5" />, color: 'text-amber-400' },
];

function healthStatusBadge(status: AgentHealthStatus | 'unknown') {
  if (status === 'healthy')
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> healthy
      </Badge>
    );
  if (status === 'degraded')
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> degraded
      </Badge>
    );
  if (status === 'unreachable')
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
        <XCircle className="w-3 h-3" /> unreachable
      </Badge>
    );
  return (
    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
      not verified
    </Badge>
  );
}

const MCPNetworkPage: React.FC = () => {
  const { agentStats, loading, lastUpdate } = useAgentRealTime();
  const { report, loading: verifying, error: verifyError, runVerification } = useAgentVerification();

  const totalRuns = agentStats?.total_runs || 0;
  const completedRuns = agentStats?.completed_runs || 0;
  const failedRuns = agentStats?.failed_runs || 0;

  const typeColors = {
    sovereign: 'border-purple-500/40 bg-purple-500/5',
    'sub-agent': 'border-blue-500/30 bg-blue-500/5',
    swarm: 'border-green-500/30 bg-green-500/5',
  };

  // Build a quick lookup from the verification report
  const healthMap: Record<string, AgentHealthStatus> = {};
  if (report?.agents) {
    for (const a of report.agents) {
      healthMap[a.functionName] = a.status;
    }
  }

  const overallStatusColor =
    report?.overallStatus === 'healthy'
      ? 'text-green-400'
      : report?.overallStatus === 'degraded'
      ? 'text-yellow-400'
      : report?.overallStatus === 'critical'
      ? 'text-red-400'
      : 'text-white/40';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/10 to-black relative">
      <div className="absolute inset-0 overflow-hidden">
        <NeuralNetworkBackground opacity={0.12} paletteIndex={2} />
      </div>
      <div className="relative z-10">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Network className="w-8 h-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                MCP Agent Network
              </h1>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />LIVE
              </Badge>
            </div>
            <p className="text-white/60">Complete BibleFi Sovereign Agent & Sub-Agent Network Overview</p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Agents', value: AGENT_NETWORK.length, color: 'text-white' },
              { label: 'Total Runs', value: totalRuns, color: 'text-blue-400' },
              { label: 'Completed', value: completedRuns, color: 'text-green-400' },
              { label: 'Failed', value: failedRuns, color: 'text-red-400' },
            ].map(stat => (
              <Card key={stat.label} className="bg-white/5 border-white/10">
                <CardContent className="pt-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Verification Panel */}
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/90">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Agent Verification
                  {report && (
                    <span className={`text-sm font-normal ml-2 ${overallStatusColor}`}>
                      — {report.overallStatus.toUpperCase()}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => runVerification()}
                  disabled={verifying}
                >
                  {verifying ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />Run Verification</>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verifyError && (
                <p className="text-red-400 text-sm mb-2">Verification error: {verifyError}</p>
              )}
              {report ? (
                <div className="space-y-1">
                  <div className="flex gap-4 text-xs text-white/50 mb-3">
                    <span>Checked: {new Date(report.checkedAt).toLocaleString()}</span>
                    <span className="text-green-400">✓ {report.summary.healthy} healthy</span>
                    {report.summary.degraded > 0 && <span className="text-yellow-400">⚠ {report.summary.degraded} degraded</span>}
                    {report.summary.unreachable > 0 && <span className="text-red-400">✗ {report.summary.unreachable} unreachable</span>}
                  </div>
                  {report.agents.map((a) => (
                    <div key={a.functionName} className="flex items-center justify-between py-1.5 px-3 rounded bg-white/5">
                      <div>
                        <span className="text-xs text-white/80 font-medium">{a.name}</span>
                        <span className="text-[10px] text-white/30 ml-2">({a.functionName})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.responseTimeMs > 0 && (
                          <span className="text-[10px] text-white/30">{a.responseTimeMs}ms</span>
                        )}
                        {healthStatusBadge(a.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-white/40 text-sm">
                  {verifying
                    ? 'Pinging all agents…'
                    : 'Click "Run Verification" to check the live health of every agent in the network.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sovereign Agents */}
          <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Sovereign Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {AGENT_NETWORK.filter(a => a.type === 'sovereign').map((agent, i) => (
              <motion.div key={agent.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`${typeColors[agent.type]} border`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={agent.color}>{agent.icon}</span>
                        <span className="font-bold text-sm text-white/90">{agent.name}</span>
                      </div>
                      {agent.functionName
                        ? healthStatusBadge(healthMap[agent.functionName] ?? 'unknown')
                        : <Badge className="bg-gray-500/20 text-gray-400">no function</Badge>}
                    </div>
                    <p className="text-xs text-white/50 mb-1">{agent.description}</p>
                    <p className="text-xs text-white/30">Schedule: {agent.schedule}</p>
                    {agent.functionName && (
                      <p className="text-[10px] text-white/20 mt-1 font-mono">{agent.functionName}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sub-Agents */}
          <h2 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5" /> Sub-Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {AGENT_NETWORK.filter(a => a.type === 'sub-agent').map((agent, i) => (
              <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={`${typeColors[agent.type]} border`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={agent.color}>{agent.icon}</span>
                        <span className="font-bold text-xs text-white/90">{agent.name}</span>
                      </div>
                      {agent.functionName
                        ? healthStatusBadge(healthMap[agent.functionName] ?? 'unknown')
                        : <Badge className="bg-gray-500/20 text-gray-400 text-[10px]">no function</Badge>}
                    </div>
                    <p className="text-xs text-white/50 mb-1">{agent.description}</p>
                    <p className="text-[10px] text-white/30">Parent: {agent.parent} | {agent.schedule}</p>
                    {agent.functionName && (
                      <p className="text-[10px] text-white/20 mt-1 font-mono">{agent.functionName}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Swarms */}
          <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <Network className="w-5 h-5" /> Agent Swarms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {AGENT_NETWORK.filter(a => a.type === 'swarm').map((agent, i) => (
              <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={`${typeColors[agent.type]} border`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={agent.color}>{agent.icon}</span>
                        <span className="font-bold text-xs text-white/90">{agent.name}</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">scheduled</Badge>
                    </div>
                    <p className="text-xs text-white/50 mb-1">{agent.description}</p>
                    <p className="text-[10px] text-white/30">Parent: {agent.parent} | {agent.schedule}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Network Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentStats?.recent_runs?.length > 0 ? (
                <div className="space-y-2">
                  {agentStats.recent_runs.map((run: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="font-mono text-xs text-white/80">{run.agent_name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40">{run.records_processed || 0} processed</span>
                        <span className="text-xs text-white/40">{new Date(run.started_at).toLocaleString()}</span>
                        <Badge className={run.status === 'completed' ? 'bg-green-500/20 text-green-400' : run.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}>
                          {run.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-white/40 text-sm">
                  {loading ? 'Loading network activity...' : 'Agent activity logs will appear here as agents execute their scheduled tasks.'}
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default MCPNetworkPage;
