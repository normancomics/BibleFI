import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  Target, 
  TrendingUp, 
  Users, 
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Coins,
  Network,
  Globe
} from 'lucide-react';

interface LaunchPhase {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  tasks: {
    name: string;
    completed: boolean;
    description?: string;
  }[];
}

const LaunchStrategy: React.FC = () => {
  const [activePhase, setActivePhase] = useState('phase1');

  const launchPhases: LaunchPhase[] = [
    {
      id: 'phase1',
      name: 'Foundation (Base Chain)',
      description: 'Launch $BIBLE token on Base with core DeFi functionality',
      status: 'in-progress',
      tasks: [
        { name: 'Deploy $BIBLE token contract', completed: false, description: 'ERC-20 token with biblical principles' },
        { name: 'Setup liquidity pools', completed: false, description: 'BIBLE/ETH and BIBLE/USDC pools' },
        { name: 'Launch staking mechanism', completed: false, description: 'Wisdom-based staking rewards' },
        { name: 'Integrate church tithing', completed: true, description: 'Superfluid streaming & payment processors' },
        { name: 'Security audit', completed: false, description: 'Professional smart contract audit' }
      ]
    },
    {
      id: 'phase2',
      name: 'Expansion (Multi-Chain)',
      description: 'Expand to Arbitrum and Solana ecosystems',
      status: 'pending',
      tasks: [
        { name: 'Bridge to Arbitrum', completed: false, description: 'Cross-chain $BIBLE tokens' },
        { name: 'Solana SPL token', completed: false, description: 'Native Solana $BIBLE token' },
        { name: 'Cross-chain liquidity', completed: false, description: 'Unified liquidity across chains' },
        { name: 'Multi-chain staking', completed: false, description: 'Stake on any supported chain' },
        { name: 'Governance launch', completed: false, description: 'Community-driven decisions' }
      ]
    },
    {
      id: 'phase3',
      name: 'Global Adoption',
      description: 'Worldwide church integration and institutional partnerships',
      status: 'pending',
      tasks: [
        { name: 'Church partnership program', completed: false, description: '1000+ churches onboarded' },
        { name: 'Institutional DeFi', completed: false, description: 'Treasury management for organizations' },
        { name: 'Mobile app launch', completed: false, description: 'Native iOS/Android apps' },
        { name: 'Educational platform', completed: false, description: 'Biblical finance curriculum' },
        { name: 'Global fiat onramps', completed: false, description: 'Local currency support worldwide' }
      ]
    }
  ];

  const tokenomics = {
    totalSupply: '1,000,000,000',
    distribution: [
      { category: 'Community Rewards', percentage: 40, amount: '400M', color: 'bg-scripture' },
      { category: 'Liquidity Provision', percentage: 25, amount: '250M', color: 'bg-ancient-gold' },
      { category: 'Development Fund', percentage: 15, amount: '150M', color: 'bg-eboy-green' },
      { category: 'Church Partnerships', percentage: 10, amount: '100M', color: 'bg-eboy-blue' },
      { category: 'Team & Advisors', percentage: 5, amount: '50M', color: 'bg-eboy-orange' },
      { category: 'Marketing & Growth', percentage: 5, amount: '50M', color: 'bg-eboy-pink' }
    ]
  };

  const getStatusIcon = (status: LaunchPhase['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-eboy-green" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-eboy-yellow" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPhaseProgress = (phase: LaunchPhase) => {
    const completedTasks = phase.tasks.filter(task => task.completed).length;
    return (completedTasks / phase.tasks.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-ancient-gold/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rocket className="h-8 w-8 text-ancient-gold" />
            <div>
              <CardTitle className="text-2xl text-ancient-gold">$BIBLE Token Launch Strategy</CardTitle>
              <p className="text-muted-foreground">Multi-phase rollout across Base, Arbitrum, and Solana</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-3 gap-2 h-auto">
          {launchPhases.map((phase) => (
            <TabsTrigger 
              key={phase.id} 
              value={phase.id}
              className="flex flex-col items-center gap-2 p-4 h-auto"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(phase.status)}
                <span className="font-medium">{phase.name}</span>
              </div>
              <Progress value={getPhaseProgress(phase)} className="w-full h-2" />
              <span className="text-xs text-muted-foreground">
                {Math.round(getPhaseProgress(phase))}% Complete
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {launchPhases.map((phase) => (
          <TabsContent key={phase.id} value={phase.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(phase.status)}
                      {phase.name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">{phase.description}</p>
                  </div>
                  <Badge variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}>
                    {phase.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phase.tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                      <div className={`mt-1 ${task.completed ? 'text-eboy-green' : 'text-muted-foreground'}`}>
                        {task.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'text-eboy-green' : 'text-foreground'}`}>
                          {task.name}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tokenomics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-ancient-gold" />
            $BIBLE Tokenomics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center p-6 border border-ancient-gold/30 rounded-lg">
                <h3 className="text-2xl font-bold text-ancient-gold">{tokenomics.totalSupply}</h3>
                <p className="text-muted-foreground">Total Supply</p>
              </div>
              
              <div className="space-y-3">
                {tokenomics.distribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.percentage}%</div>
                      <div className="text-sm text-muted-foreground">{item.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-scripture/30 rounded-lg bg-scripture/10">
                <h4 className="font-bold text-scripture mb-2">Why Multi-Chain?</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-eboy-blue" />
                    <span><strong>Base:</strong> Low fees, Coinbase integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-eboy-green" />
                    <span><strong>Arbitrum:</strong> Ethereum compatibility, DeFi ecosystem</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-eboy-purple" />
                    <span><strong>Solana:</strong> High throughput, growing adoption</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 border border-ancient-gold/30 rounded-lg bg-ancient-gold/10">
                <h4 className="font-bold text-ancient-gold mb-2">Competitive Advantage</h4>
                <ul className="space-y-1 text-sm">
                  <li>• First biblical-focused DeFi token on Base</li>
                  <li>• Direct church partnership integrations</li>
                  <li>• Educational content and wisdom scoring</li>
                  <li>• Real-world utility through tithing</li>
                  <li>• Strong community and moral foundation</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-eboy-green/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-eboy-green" />
            Immediate Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-auto p-4 bg-scripture hover:bg-scripture/90">
              <div className="text-left">
                <div className="font-bold">Deploy Token Contract</div>
                <div className="text-xs text-scripture-light">ERC-20 on Base with biblical principles</div>
              </div>
            </Button>
            <Button className="h-auto p-4 bg-ancient-gold hover:bg-ancient-gold/90 text-background">
              <div className="text-left">
                <div className="font-bold">Setup Liquidity Pools</div>
                <div className="text-xs opacity-80">BIBLE/ETH & BIBLE/USDC on Uniswap</div>
              </div>
            </Button>
            <Button className="h-auto p-4 bg-eboy-green hover:bg-eboy-green/90 text-background">
              <div className="text-left">
                <div className="font-bold">Launch Staking</div>
                <div className="text-xs opacity-80">Wisdom-based rewards system</div>
              </div>
            </Button>
            <Button className="h-auto p-4 bg-eboy-blue hover:bg-eboy-blue/90 text-background">
              <div className="text-left">
                <div className="font-bold">Security Audit</div>
                <div className="text-xs opacity-80">Professional smart contract review</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaunchStrategy;