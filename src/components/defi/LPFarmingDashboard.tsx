import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Droplets, TrendingUp, Lock, Coins, ArrowRight,
  BookOpen, Shield, Zap, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LPPool {
  id: string;
  name: string;
  pair: string;
  token0: string;
  token1: string;
  tvl: number;
  apr: number;
  dailyReward: number;
  rewardToken: string;
  riskLevel: 'low' | 'medium' | 'high';
  scripture: string;
  scriptureRef: string;
  minStake: number;
  wisdomRequired: number;
}

interface StakingPool {
  id: string;
  name: string;
  token: string;
  apy: number;
  tvl: number;
  lockPeriod: string;
  minStake: number;
  scripture: string;
  scriptureRef: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const LP_POOLS: LPPool[] = [
  {
    id: 'biblefi-sup',
    name: 'Kingdom Treasury',
    pair: '$BIBLEFI / $SUP',
    token0: 'BIBLEFI', token1: 'SUP',
    tvl: 2500000, apr: 42.5, dailyReward: 1250,
    rewardToken: '$WISDOM',
    riskLevel: 'medium',
    scripture: '"For where your treasure is, there your heart will be also."',
    scriptureRef: 'Matthew 6:21',
    minStake: 100, wisdomRequired: 250,
  },
  {
    id: 'wisdom-sup',
    name: 'Solomon\'s Exchange',
    pair: '$WISDOM / $SUP',
    token0: 'WISDOM', token1: 'SUP',
    tvl: 1800000, apr: 35.0, dailyReward: 900,
    rewardToken: '$BIBLEFI',
    riskLevel: 'medium',
    scripture: '"Wisdom is the principal thing; therefore get wisdom."',
    scriptureRef: 'Proverbs 4:7',
    minStake: 50, wisdomRequired: 500,
  },
  {
    id: 'usdc-eth',
    name: 'Stable Foundation',
    pair: 'USDC / ETH',
    token0: 'USDC', token1: 'ETH',
    tvl: 15000000, apr: 12.5, dailyReward: 5000,
    rewardToken: '$WISDOM',
    riskLevel: 'low',
    scripture: '"A wise man built his house upon a rock."',
    scriptureRef: 'Matthew 7:24',
    minStake: 10, wisdomRequired: 0,
  },
  {
    id: 'biblefi-usdc',
    name: 'Faithful Steward',
    pair: '$BIBLEFI / USDC',
    token0: 'BIBLEFI', token1: 'USDC',
    tvl: 4200000, apr: 55.0, dailyReward: 2100,
    rewardToken: '$WISDOM',
    riskLevel: 'high',
    scripture: '"Well done, good and faithful servant! You have been faithful with a few things."',
    scriptureRef: 'Matthew 25:21',
    minStake: 200, wisdomRequired: 600,
  },
  {
    id: 'veil-sup',
    name: 'Anonymous Giving',
    pair: '$VEIL / $SUP',
    token0: 'VEIL', token1: 'SUP',
    tvl: 800000, apr: 28.0, dailyReward: 400,
    rewardToken: '$BIBLEFI',
    riskLevel: 'medium',
    scripture: '"But when thou doest alms, let not thy left hand know what thy right hand doeth."',
    scriptureRef: 'Matthew 6:3',
    minStake: 25, wisdomRequired: 250,
  },
];

const STAKING_POOLS: StakingPool[] = [
  {
    id: 'stake-biblefi-7',
    name: 'Sabbath Rest',
    token: '$BIBLEFI',
    apy: 18.0, tvl: 5000000,
    lockPeriod: '7 days',
    minStake: 100,
    scripture: '"Remember the sabbath day, to keep it holy."',
    scriptureRef: 'Exodus 20:8',
    riskLevel: 'low',
  },
  {
    id: 'stake-biblefi-30',
    name: 'Monthly Offering',
    token: '$BIBLEFI',
    apy: 32.0, tvl: 3200000,
    lockPeriod: '30 days',
    minStake: 500,
    scripture: '"Give, and it shall be given unto you; good measure, pressed down."',
    scriptureRef: 'Luke 6:38',
    riskLevel: 'low',
  },
  {
    id: 'stake-wisdom',
    name: 'Solomon\'s Vault',
    token: '$WISDOM',
    apy: 25.0, tvl: 1500000,
    lockPeriod: '14 days',
    minStake: 50,
    scripture: '"The wise store up choice food and olive oil."',
    scriptureRef: 'Proverbs 21:20',
    riskLevel: 'low',
  },
  {
    id: 'stake-usdc-jubilee',
    name: 'Jubilee Vault',
    token: 'USDC',
    apy: 8.5, tvl: 12000000,
    lockPeriod: '50 days (Jubilee)',
    minStake: 100,
    scripture: '"Ye shall hallow the fiftieth year, and proclaim liberty."',
    scriptureRef: 'Leviticus 25:10',
    riskLevel: 'low',
  },
];

const LPFarmingDashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState<LPPool | null>(null);
  const [selectedStake, setSelectedStake] = useState<StakingPool | null>(null);
  const [amount, setAmount] = useState('');

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return '';
    }
  };

  const handleProvide = () => {
    if (!amount || !selectedPool) return;
    toast({
      title: `LP Position Created`,
      description: `Added ${amount} to ${selectedPool.pair} pool. Earning ${selectedPool.apr}% APR in ${selectedPool.rewardToken}.`,
    });
    setSelectedPool(null);
    setAmount('');
  };

  const handleStake = () => {
    if (!amount || !selectedStake) return;
    toast({
      title: `Staked Successfully`,
      description: `Staked ${amount} ${selectedStake.token} in ${selectedStake.name}. Lock: ${selectedStake.lockPeriod}.`,
    });
    setSelectedStake(null);
    setAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">
          <Coins className="inline w-8 h-8 mr-2" />
          LP Farming & Staking
        </h1>
        <p className="text-muted-foreground italic">
          "Cast thy bread upon the waters: for thou shalt find it after many days." — Ecclesiastes 11:1
        </p>
      </div>

      <Tabs defaultValue="farming" className="space-y-4">
        <TabsList className="grid grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="farming"><Droplets className="w-4 h-4 mr-1" />Liquidity Farming</TabsTrigger>
          <TabsTrigger value="staking"><Lock className="w-4 h-4 mr-1" />Staking</TabsTrigger>
        </TabsList>

        {/* LP Farming */}
        <TabsContent value="farming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LP_POOLS.map((pool) => (
              <Card key={pool.id} className="bg-card/50 hover:border-primary/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pool.name}</CardTitle>
                    <Badge className={riskColor(pool.riskLevel)}>{pool.riskLevel}</Badge>
                  </div>
                  <p className="text-sm font-mono font-bold text-primary">{pool.pair}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">APR</p>
                      <p className="font-bold text-green-400 text-lg">{pool.apr}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">TVL</p>
                      <p className="font-bold">${(pool.tvl / 1e6).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Daily Reward</p>
                      <p className="font-medium">{pool.dailyReward.toLocaleString()} {pool.rewardToken}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Stake</p>
                      <p className="font-medium">${pool.minStake}</p>
                    </div>
                  </div>

                  {pool.wisdomRequired > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      Wisdom Score ≥ {pool.wisdomRequired} required
                    </div>
                  )}

                  <div className="bg-primary/5 rounded p-2">
                    <p className="text-xs italic text-muted-foreground">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {pool.scripture}
                    </p>
                    <p className="text-xs text-primary mt-1">— {pool.scriptureRef}</p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedPool(pool)}>
                        <Droplets className="w-4 h-4 mr-2" />
                        Provide Liquidity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Liquidity: {pool.pair}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>{pool.token0} Amount</Label>
                          <Input type="number" placeholder="0.00" value={amount}
                            onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                        </div>
                        <div>
                          <Label>{pool.token1} Amount (auto-calculated)</Label>
                          <Input disabled placeholder="Auto-matched" />
                        </div>
                        <div className="bg-muted/50 rounded p-3 text-sm space-y-1">
                          <div className="flex justify-between"><span>APR:</span><span className="text-green-400">{pool.apr}%</span></div>
                          <div className="flex justify-between"><span>Reward:</span><span>{pool.rewardToken}</span></div>
                          <div className="flex justify-between"><span>Risk:</span><Badge className={riskColor(pool.riskLevel)}>{pool.riskLevel}</Badge></div>
                        </div>
                        {pool.riskLevel === 'high' && (
                          <div className="flex items-center gap-2 text-amber-400 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            Proverbs 22:3 — "A prudent man foreseeth the evil, and hideth himself."
                          </div>
                        )}
                        <Button className="w-full" onClick={handleProvide} disabled={!amount}>
                          <Zap className="w-4 h-4 mr-2" />
                          Confirm & Provide Liquidity
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Staking */}
        <TabsContent value="staking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STAKING_POOLS.map((pool) => (
              <Card key={pool.id} className="bg-card/50 hover:border-primary/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pool.name}</CardTitle>
                    <Badge className={riskColor(pool.riskLevel)}>{pool.riskLevel}</Badge>
                  </div>
                  <p className="text-sm font-mono font-bold text-primary">{pool.token}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">APY</p>
                      <p className="font-bold text-green-400 text-xl">{pool.apy}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">TVL</p>
                      <p className="font-bold">${(pool.tvl / 1e6).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lock</p>
                      <p className="font-medium">{pool.lockPeriod}</p>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded p-2">
                    <p className="text-xs italic text-muted-foreground">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {pool.scripture}
                    </p>
                    <p className="text-xs text-primary mt-1">— {pool.scriptureRef}</p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="secondary" onClick={() => setSelectedStake(pool)}>
                        <Lock className="w-4 h-4 mr-2" />
                        Stake {pool.token}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Stake: {pool.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Amount ({pool.token})</Label>
                          <Input type="number" placeholder={`Min ${pool.minStake}`}
                            value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div className="bg-muted/50 rounded p-3 text-sm space-y-1">
                          <div className="flex justify-between"><span>APY:</span><span className="text-green-400">{pool.apy}%</span></div>
                          <div className="flex justify-between"><span>Lock Period:</span><span>{pool.lockPeriod}</span></div>
                          <div className="flex justify-between"><span>Min Stake:</span><span>{pool.minStake} {pool.token}</span></div>
                        </div>
                        <p className="text-xs italic text-muted-foreground">
                          "{pool.scripture}" — {pool.scriptureRef}
                        </p>
                        <Button className="w-full" onClick={handleStake} disabled={!amount}>
                          <Lock className="w-4 h-4 mr-2" />
                          Confirm Stake
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LPFarmingDashboard;
