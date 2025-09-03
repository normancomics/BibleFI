import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Rocket, 
  DollarSign, 
  Users, 
  Shield, 
  TrendingUp, 
  Calendar,
  Target,
  BookOpen,
  Heart,
  CheckCircle
} from 'lucide-react';

interface LaunchPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  completed: boolean;
  progress: number;
  tasks: string[];
}

const BibleTokenLaunchStrategy: React.FC = () => {
  const [activePhase, setActivePhase] = useState('pre-launch');

  const launchPhases: LaunchPhase[] = [
    {
      id: 'pre-launch',
      name: 'Pre-Launch (Current)',
      description: 'Foundation building and community establishment',
      duration: '2-4 weeks',
      completed: false,
      progress: 65,
      tasks: [
        'Deploy smart contracts on Base testnet',
        'Complete security audits',
        'Build initial community on Farcaster',
        'Create liquidity provision strategy',
        'Establish partnerships with Base ecosystem'
      ]
    },
    {
      id: 'soft-launch',
      name: 'Soft Launch',
      description: 'Limited release to early adopters',
      duration: '2 weeks',
      completed: false,
      progress: 0,
      tasks: [
        'Deploy $BIBLE token on Base mainnet',
        'Create initial liquidity pool (ETH/BIBLE)',
        'Launch mini-app on Farcaster',
        'Enable basic staking and tithing',
        'Invite 100 beta users'
      ]
    },
    {
      id: 'public-launch',
      name: 'Public Launch',
      description: 'Full platform launch with all features',
      duration: 'Ongoing',
      completed: false,
      progress: 0,
      tasks: [
        'Full platform launch',
        'Multi-DEX integration live',
        'Superfluid streaming active',
        'Complete wisdom rewards system',
        'Marketing campaign launch'
      ]
    }
  ];

  const fundingStrategy = {
    bootstrapping: {
      name: 'Bootstrap Phase (Current)',
      amount: '$0-5,000',
      sources: ['Personal savings', 'Friends & family', 'Community donations'],
      focus: 'MVP development and initial liquidity'
    },
    seedRound: {
      name: 'Seed Round',
      amount: '$25,000-100,000',
      sources: ['Angel investors', 'Crypto VCs', 'Base ecosystem grants'],
      focus: 'Platform development and community growth'
    },
    communityRound: {
      name: 'Community Round',
      amount: '$100,000-500,000',
      sources: ['Public token sale', 'Farcaster community', 'DeFi users'],
      focus: 'Liquidity and ecosystem expansion'
    }
  };

  const tokenomics = {
    totalSupply: '33,000,000 BIBLE',
    distribution: [
      { category: 'Wisdom Rewards', percentage: 30, amount: '9,900,000', color: 'bg-blue-500' },
      { category: 'Community Treasury', percentage: 25, amount: '8,250,000', color: 'bg-green-500' },
      { category: 'Liquidity Pool', percentage: 25, amount: '8,250,000', color: 'bg-purple-500' },
      { category: 'Team (4yr vesting)', percentage: 15, amount: '4,950,000', color: 'bg-orange-500' },
      { category: 'Marketing & Partnerships', percentage: 5, amount: '1,650,000', color: 'bg-red-500' }
    ]
  };

  const apyGeneration = [
    {
      source: 'Staking Rewards',
      baseAPY: '12%',
      description: 'Users stake BIBLE tokens and earn rewards from the wisdom pool'
    },
    {
      source: 'Liquidity Mining',
      baseAPY: '25%',
      description: 'Provide liquidity to BIBLE/ETH pool on Base DEXs'
    },
    {
      source: 'Yield Farming',
      baseAPY: '18%',
      description: 'Farm BIBLE rewards through biblical DeFi strategies'
    },
    {
      source: 'Tithing Streams',
      baseAPY: '8%',
      description: 'Earn rewards for consistent charitable giving'
    },
    {
      source: 'Wisdom Score Multiplier',
      baseAPY: 'Up to +50%',
      description: 'Higher wisdom scores unlock bonus APY across all activities'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          $BIBLE Token Launch Strategy
        </h1>
        <p className="text-lg text-muted-foreground">
          Building the world's first Biblical DeFi ecosystem on Base Chain
        </p>
      </div>

      {/* Launch Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Launch Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {launchPhases.map((phase) => (
              <div
                key={phase.id}
                className={`p-4 rounded-lg border ${
                  activePhase === phase.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{phase.name}</h3>
                  <Badge variant={phase.completed ? 'default' : 'secondary'}>
                    {phase.duration}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                <Progress value={phase.progress} className="mb-3" />
                <div className="space-y-1">
                  {phase.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-muted-foreground" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tokenomics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="apy">APY Generation</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="tokenomics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold">{tokenomics.totalSupply}</h3>
                  <p className="text-muted-foreground">Total Supply</p>
                </div>
                
                {tokenomics.distribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span>{item.percentage}% ({item.amount})</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(fundingStrategy).map((round, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{round.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-primary">{round.amount}</div>
                    <div>
                      <h4 className="font-semibold mb-2">Sources:</h4>
                      <ul className="text-sm space-y-1">
                        {round.sources.map((source, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Focus:</h4>
                      <p className="text-sm text-muted-foreground">{round.focus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>APY Generation Mechanisms</CardTitle>
              <p className="text-muted-foreground">
                Multiple ways for users to earn rewards in the Bible.fi ecosystem
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apyGeneration.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.source}</h3>
                      <Badge variant="secondary">{item.baseAPY}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="next-steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Immediate Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Priority 1:</strong> Complete smart contract deployment and security audit
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Priority 2:</strong> Build initial community of 500 Farcaster users
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Priority 3:</strong> Secure initial $5,000 for liquidity provision
                  </AlertDescription>
                </Alert>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Launch Timeline Recommendation:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Week 1-2:</strong> Complete smart contracts, security audit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Week 3-4:</strong> Build Farcaster community, partnerships</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Week 5-6:</strong> Soft launch with limited users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Week 7+:</strong> Public launch and scaling</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Ready to Launch $BIBLE?</h3>
            <p className="text-muted-foreground mb-4">
              Start with the Superfluid integration and token deployment
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg">
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Contracts
              </Button>
              <Button variant="outline" size="lg">
                <BookOpen className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BibleTokenLaunchStrategy;