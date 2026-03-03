import React from 'react';
import NavBar from '@/components/NavBar';
import WisdomTokenSystem from '@/components/wisdom/WisdomTokenSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen, Heart, TrendingUp, Users, Gift } from 'lucide-react';
import LogoIcon from '@/components/ui/LogoIcon';

const WisdomTokenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogoIcon name="biblefi" size="xl" />
            <h1 className="text-4xl font-bold font-scroll text-ancient-gold">
              $WISDOM Token System
            </h1>
          </div>
          <p className="text-white/80 max-w-3xl mx-auto text-lg mb-6">
            Earn $WISDOM tokens by following biblical financial principles. Stake your wisdom for $xWISDOM, 
            provide liquidity with $BIBLEFI, and stream continuously via Superfluid.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Biblical Wisdom Rewards
            </Badge>
            <Badge className="bg-scripture/20 text-scripture border-scripture/30 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Staking & Farming
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Superfluid Streaming
            </Badge>
          </div>
        </div>

        {/* Biblical Foundation */}
        <Card className="border-ancient-gold/30 bg-black/40 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="text-ancient-gold" />
              Biblical Foundation for $WISDOM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-lg border border-scripture/20">
                  <h3 className="font-medium text-scripture mb-2">Wisdom as Treasure</h3>
                  <p className="italic text-white/80 text-sm mb-2">
                    "How much better to get wisdom than gold, to get insight rather than silver!"
                  </p>
                  <p className="text-xs text-ancient-gold/70">- Proverbs 16:16</p>
                </div>
                
                <div className="bg-black/50 p-4 rounded-lg border border-scripture/20">
                  <h3 className="font-medium text-scripture mb-2">Faithful Stewardship</h3>
                  <p className="italic text-white/80 text-sm mb-2">
                    "Moreover, it is required of stewards that they be found faithful."
                  </p>
                  <p className="text-xs text-ancient-gold/70">- 1 Corinthians 4:2</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-lg border border-scripture/20">
                  <h3 className="font-medium text-scripture mb-2">Generous Giving</h3>
                  <p className="italic text-white/80 text-sm mb-2">
                    "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                  </p>
                  <p className="text-xs text-ancient-gold/70">- 2 Corinthians 9:7</p>
                </div>
                
                <div className="bg-black/50 p-4 rounded-lg border border-scripture/20">
                  <h3 className="font-medium text-scripture mb-2">Wise Planning</h3>
                  <p className="italic text-white/80 text-sm mb-2">
                    "The plans of the diligent lead to profit as surely as haste leads to poverty."
                  </p>
                  <p className="text-xs text-ancient-gold/70">- Proverbs 21:5</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Integration Info */}
        <Card className="border-blue-500/30 bg-black/40 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="text-blue-400" />
              Integration with BibleFi Ecosystem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <LogoIcon name="biblefi" size="lg" />
                  <span className="text-xl font-bold text-ancient-gold">$BIBLEFI</span>
                </div>
                <p className="text-sm text-white/70">
                  The main utility token with ZK privacy features and automatic wisdom fee distribution
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-8 h-8 text-scripture" />
                  <span className="text-xl font-bold text-scripture">$WISDOM</span>
                </div>
                <p className="text-sm text-white/70">
                  Reward token earned through biblical financial actions and principles
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <span className="text-xl font-bold text-green-400">$xWISDOM</span>
                </div>
                <p className="text-sm text-white/70">
                  Staked wisdom tokens earning enhanced yields and governance rights
                </p>
              </div>
            </div>
            
            <div className="mt-6 bg-scripture/10 p-4 rounded-lg border border-scripture/30">
              <h4 className="font-medium text-scripture mb-2">Cross-Token Benefits</h4>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Higher $BIBLEFI balances = increased $WISDOM earning rate</li>
                <li>• $xWISDOM holders get governance voting power</li>
                <li>• LP providers earn both $WISDOM and $BIBLEFI rewards</li>
                <li>• Superfluid streams can convert between tokens automatically</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Token System */}
        <WisdomTokenSystem />
        
        {/* Grandma Test Section */}
        <Card className="border-heart/30 bg-black/40 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="text-pink-400" />
              The "Grandma Test" - Simple for Everyone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-white/80">
                BibleFi is designed to pass the "Grandma Test" - simple enough for elderly users with no blockchain knowledge, 
                yet sophisticated enough for DeFi experts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-pink-400 mb-2">For Beginners:</h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Simple one-click tithing with credit cards</li>
                    <li>• Clear explanations of every biblical principle</li>
                    <li>• Guided tutorials with pixelated characters</li>
                    <li>• No complex wallet management required</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">For DeFi Experts:</h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Advanced yield farming strategies</li>
                    <li>• ZK privacy protection options</li>
                    <li>• Superfluid streaming automation</li>
                    <li>• Multi-DEX aggregation and arbitrage</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WisdomTokenPage;