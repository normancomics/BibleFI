import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Activity, Database, Church, BookOpen, Shield, Brain, TrendingUp, Clock, Cpu } from 'lucide-react';
import { useAgentRealTime } from '@/hooks/useAgentRealTime';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from '@/components/home/NeuralNetworkBackground';

interface AgentInfo {
  name: string;
  type: 'sovereign' | 'sub-agent' | 'swarm';
  parent?: string;
  description: string;
  schedule: string;
  icon: React.ReactNode;
  color: string;
  status: 'active' | 'scheduled' | 'idle';
}

const AGENT_NETWORK: AgentInfo[] = [
  // Sovereign Agents
  { name: 'BWSP Sovereign Agent', type: 'sovereign', description: 'Master orchestrator for Biblical Wisdom Synthesis Protocol', schedule: 'Always on', icon: <Brain className="w-5 h-5" />, color: 'text-purple-400', status: 'active' },
  { name: 'BWTYA Sovereign Agent', type: 'sovereign', description: 'Master orchestrator for Biblical-Wisdom-To-Yield-Algorithm', schedule: 'Always on', icon: <TrendingUp className="w-5 h-5" />, color: 'text-yellow-400', status: 'active' },
  { name: 'Church Seeder Sovereign', type: 'sovereign', description: 'Global church database discovery and seeding', schedule: 'Hourly (6 staggered jobs)', icon: <Church className="w-5 h-5" />, color: 'text-green-400', status: 'active' },
  { name: 'Security Sovereign', type: 'sovereign', description: 'Continuous security monitoring and threat detection', schedule: 'Always on', icon: <Shield className="w-5 h-5" />, color: 'text-red-400', status: 'active' },

  // Sub-agents
  { name: 'Scripture Integrity Validator', type: 'sub-agent', parent: 'BWSP', description: 'Validates KJV text accuracy with Hebrew/Greek/Aramaic originals', schedule: 'Daily', icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-400', status: 'scheduled' },
  { name: 'Knowledge Base Sync', type: 'sub-agent', parent: 'BWSP', description: 'Syncs biblical knowledge base and DeFi cross-references', schedule: 'Daily', icon: <Database className="w-5 h-5" />, color: 'text-cyan-400', status: 'scheduled' },
  { name: 'Biblical Advisor (LLM)', type: 'sub-agent', parent: 'BWSP', description: 'RAG-AGI powered guidance via Fireworks.ai llama-v3p3-70b', schedule: 'On demand', icon: <Brain className="w-5 h-5" />, color: 'text-purple-300', status: 'active' },
  { name: 'Church Data Validator', type: 'sub-agent', parent: 'Church Seeder', description: 'Verifies seeded church data accuracy', schedule: 'Hourly', icon: <Church className="w-5 h-5" />, color: 'text-green-300', status: 'active' },
  { name: 'DeFi Opportunity Scanner', type: 'sub-agent', parent: 'BWTYA', description: 'Scans Base Chain DeFi protocols for yield opportunities', schedule: 'Every 30 min', icon: <TrendingUp className="w-5 h-5" />, color: 'text-yellow-300', status: 'active' },

  // Swarms
  { name: 'Church Discovery Swarm', type: 'swarm', parent: 'Church Seeder', description: 'Multi-source church discovery (Google, OSM, Wikidata, denominational directories)', schedule: 'Hourly', icon: <Network className="w-5 h-5" />, color: 'text-emerald-400', status: 'active' },
  { name: 'Scripture Mining Swarm', type: 'swarm', parent: 'BWSP', description: '15 specialized crawlers mining financial wisdom across full KJV + originals', schedule: 'Daily', icon: <Cpu className="w-5 h-5" />, color: 'text-indigo-400', status: 'scheduled' },
  { name: 'Market Signal Swarm', type: 'swarm', parent: 'BWTYA', description: 'Cross-references market signals with Biblical wisdom for aligned opportunities', schedule: 'Every 15 min', icon: <Activity className="w-5 h-5" />, color: 'text-amber-400', status: 'active' },
];

const MCPNetworkPage: React.FC = () => {
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase.rpc('get_agent_stats');
        if (data) setAgentStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalRuns = agentStats?.total_runs || 0;
  const completedRuns = agentStats?.completed_runs || 0;
  const failedRuns = agentStats?.failed_runs || 0;

  const typeColors = {
    sovereign: 'border-purple-500/40 bg-purple-500/5',
    'sub-agent': 'border-blue-500/30 bg-blue-500/5',
    swarm: 'border-green-500/30 bg-green-500/5',
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    idle: 'bg-gray-500/20 text-gray-400',
  };

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
                      <Badge className={statusColors[agent.status]}>
                        {agent.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1" />}
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50 mb-1">{agent.description}</p>
                    <p className="text-xs text-white/30">Schedule: {agent.schedule}</p>
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
                      <Badge className={`${statusColors[agent.status]} text-[10px]`}>
                        {agent.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1" />}
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50 mb-1">{agent.description}</p>
                    <p className="text-[10px] text-white/30">Parent: {agent.parent} | {agent.schedule}</p>
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
                      <Badge className={`${statusColors[agent.status]} text-[10px]`}>
                        {agent.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1" />}
                        {agent.status}
                      </Badge>
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
