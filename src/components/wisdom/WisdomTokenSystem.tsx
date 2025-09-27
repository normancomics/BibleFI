import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Star, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Heart,
  Users,
  Zap,
  Gift,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

interface WisdomAction {
  id: string;
  name: string;
  description: string;
  reward: number;
  verse: string;
  reference: string;
  category: 'tithe' | 'learn' | 'share' | 'defi' | 'help';
  icon: React.ComponentType<any>;
}

const WisdomTokenSystem: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [wisdomBalance, setWisdomBalance] = useState(250);
  const [xWisdomBalance, setXWisdomBalance] = useState(75);
  const [dailyStreak, setDailyStreak] = useState(7);
  const [totalEarned, setTotalEarned] = useState(1520);
  
  const wisdomActions: WisdomAction[] = [
    {
      id: 'tithe',
      name: 'Digital Tithing',
      description: 'Give faithfully to your church through crypto streams',
      reward: 25,
      verse: 'Bring the whole tithe into the storehouse, that there may be food in my house.',
      reference: 'Malachi 3:10',
      category: 'tithe',
      icon: Heart
    },
    {
      id: 'learn',
      name: 'Complete Bible Finance Course',
      description: 'Study biblical principles of money management',
      reward: 15,
      verse: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
      reference: 'Proverbs 21:5',
      category: 'learn',
      icon: BookOpen
    },
    {
      id: 'share',
      name: 'Share Wisdom on Farcaster',
      description: 'Cast biblical financial wisdom to help others',
      reward: 10,
      verse: 'Let no corrupting talk come out of your mouths, but only such as is good for building up.',
      reference: 'Ephesians 4:29',
      category: 'share',
      icon: Users
    },
    {
      id: 'defi-stake',
      name: 'Stake with Biblical Principles',
      description: 'Participate in low-risk, ethical staking pools',
      reward: 20,
      verse: 'Steady plodding brings prosperity; hasty speculation brings poverty.',
      reference: 'Proverbs 21:5 (TLB)',
      category: 'defi',
      icon: TrendingUp
    },
    {
      id: 'help-others',
      name: 'Provide Financial Guidance',
      description: 'Help others with biblical financial advice',
      reward: 12,
      verse: 'In all things I have shown you that by working hard in this way we must help the weak.',
      reference: 'Acts 20:35',
      category: 'help',
      icon: Target
    }
  ];

  const stakingPools = [
    {
      name: '$WISDOM Staking',
      apy: '12% APY',
      description: 'Stake your wisdom tokens for steady returns',
      requirement: 'Minimum 50 $WISDOM',
      multiplier: '1.5x daily rewards'
    },
    {
      name: '$WISDOM-$BIBLEFI LP',
      apy: '24% APY', 
      description: 'Provide liquidity and earn farming rewards',
      requirement: 'Equal amounts of both tokens',
      multiplier: '2x daily rewards'
    },
    {
      name: 'Superfluid Streaming',
      apy: '18% APY',
      description: 'Stream $WISDOM continuously via Superfluid',
      requirement: 'Any amount',
      multiplier: '1.8x daily rewards + stream rewards'
    }
  ];

  const completeAction = (action: WisdomAction) => {
    playSound('coin');
    setWisdomBalance(prev => prev + action.reward);
    setTotalEarned(prev => prev + action.reward);
    
    toast({
      title: `+${action.reward} $WISDOM Earned! 🌟`,
      description: action.name,
    });
  };

  const stakeWisdom = (amount: number) => {
    if (amount <= wisdomBalance) {
      setWisdomBalance(prev => prev - amount);
      setXWisdomBalance(prev => prev + amount);
      playSound('success');
      
      toast({
        title: `${amount} $WISDOM Staked! 📈`,
        description: `Now earning ${amount} $xWISDOM`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-ancient-gold/30 bg-black/40">
          <CardContent className="p-4 text-center">
            <Coins className="w-8 h-8 mx-auto text-ancient-gold mb-2" />
            <div className="text-2xl font-bold text-ancient-gold">{wisdomBalance.toLocaleString()}</div>
            <div className="text-sm text-white/60">$WISDOM</div>
          </CardContent>
        </Card>
        
        <Card className="border-scripture/30 bg-black/40">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto text-scripture mb-2" />
            <div className="text-2xl font-bold text-scripture">{xWisdomBalance}</div>
            <div className="text-sm text-white/60">$xWISDOM Staked</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/30 bg-black/40">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto text-green-400 mb-2" />
            <div className="text-2xl font-bold text-green-400">{dailyStreak}</div>
            <div className="text-sm text-white/60">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-500/30 bg-black/40">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-blue-400">{totalEarned.toLocaleString()}</div>
            <div className="text-sm text-white/60">Total Earned</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earn" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earn">Earn $WISDOM</TabsTrigger>
          <TabsTrigger value="stake">Stake & Farm</TabsTrigger>
          <TabsTrigger value="stream">Superfluid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="earn" className="space-y-4">
          <Card className="border-ancient-gold/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="text-ancient-gold" />
                Biblical Wisdom Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {wisdomActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <div key={action.id} className="border border-white/10 rounded-lg p-4 hover:border-ancient-gold/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <IconComponent className="w-6 h-6 text-ancient-gold mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{action.name}</h3>
                            <p className="text-sm text-white/70 mb-2">{action.description}</p>
                            <div className="bg-black/50 p-3 rounded border border-scripture/20">
                              <p className="italic text-sm text-white/80">"{action.verse}"</p>
                              <p className="text-xs text-ancient-gold/70 mt-1">{action.reference}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30 mb-2">
                            +{action.reward} $WISDOM
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => completeAction(action)}
                            className="block w-full bg-scripture hover:bg-scripture/80"
                          >
                            Earn Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stake" className="space-y-4">
          <div className="grid gap-4">
            {stakingPools.map((pool, index) => (
              <Card key={index} className="border-scripture/30 bg-black/40">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{pool.name}</h3>
                      <p className="text-sm text-white/70">{pool.description}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {pool.apy}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-white/60">Requirement</div>
                      <div className="text-white">{pool.requirement}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Bonus</div>
                      <div className="text-ancient-gold">{pool.multiplier}</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => stakeWisdom(100)}
                    className="w-full bg-scripture hover:bg-scripture/80"
                    disabled={wisdomBalance < 100}
                  >
                    Stake 100 $WISDOM
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="stream" className="space-y-4">
          <Card className="border-blue-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-blue-400" />
                Superfluid Streaming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                  <h3 className="font-medium mb-2">Continuous Wisdom Streaming</h3>
                  <p className="text-sm text-white/70 mb-4">
                    Stream your $WISDOM tokens continuously to earn $xWISDOM and $xBIBLEFI simultaneously.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/60">Stream Rate</div>
                      <div className="text-white">10 $WISDOM/month</div>
                    </div>
                    <div>
                      <div className="text-white/60">Returns</div>
                      <div className="text-green-400">12 $xWISDOM/month</div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Streaming $WISDOM
                </Button>
                
                <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
                  <p className="italic text-white/80 text-sm">
                    "For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?"
                  </p>
                  <p className="text-right text-xs text-ancient-gold/70 mt-2">- Luke 14:28</p>
                  <p className="text-sm text-white/70 mt-2">
                    Superfluid streaming represents the biblical principle of steady, consistent giving and investing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WisdomTokenSystem;