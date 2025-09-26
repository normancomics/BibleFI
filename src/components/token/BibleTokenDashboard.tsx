
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Coins, TrendingUp, Award, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

const BibleTokenDashboard: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [wisdomScore, setWisdomScore] = useState(75);
  const [bibleBalance, setBibleBalance] = useState(1250);
  const [availableRewards, setAvailableRewards] = useState(45);

  const handleClaimRewards = () => {
    playSound('coin');
    toast({
      title: "Wisdom Rewards Claimed! 🏆",
      description: `${availableRewards} $BIBLEFI tokens added to your wallet`,
    });
    setBibleBalance(prev => prev + availableRewards);
    setAvailableRewards(0);
  };

  const handlePrivacyToggle = () => {
    setIsPrivacyMode(!isPrivacyMode);
    playSound('select');
    toast({
      title: isPrivacyMode ? "Privacy Mode Disabled" : "Privacy Mode Enabled",
      description: isPrivacyMode ? "Transactions now visible" : "ZK privacy protection activated",
    });
  };

  const getWisdomLevel = (score: number) => {
    if (score >= 90) return { level: "Solomon", color: "text-ancient-gold" };
    if (score >= 80) return { level: "Wise Steward", color: "text-purple-400" };
    if (score >= 70) return { level: "Faithful Servant", color: "text-blue-400" };
    if (score >= 60) return { level: "Growing Disciple", color: "text-green-400" };
    return { level: "New Believer", color: "text-gray-400" };
  };

  const wisdomLevel = getWisdomLevel(wisdomScore);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-ancient-gold/30 bg-black/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="text-ancient-gold" />
              $BIBLEFI Token Dashboard
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrivacyToggle}
              className={`border-scripture/50 ${isPrivacyMode ? 'bg-scripture/20' : ''}`}
            >
              {isPrivacyMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPrivacyMode ? 'ZK Mode' : 'Public'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-ancient-gold">
                {isPrivacyMode ? '***' : bibleBalance.toLocaleString()}
              </div>
              <div className="text-sm text-white/60">$BIBLEFI Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {isPrivacyMode ? '***' : availableRewards}
              </div>
              <div className="text-sm text-white/60">Rewards Available</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${wisdomLevel.color}`}>
                {wisdomScore}
              </div>
              <div className="text-sm text-white/60">Wisdom Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wisdom Score Card */}
        <Card className="border-scripture/30 bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="text-scripture" />
              Biblical Wisdom Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Current Level:</span>
              <Badge className={`${wisdomLevel.color} bg-black/30 border-current`}>
                {wisdomLevel.level}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Wisdom Progress</span>
                <span>{wisdomScore}/100</span>
              </div>
              <Progress value={wisdomScore} className="h-2" />
            </div>

            <div className="bg-black/50 p-4 rounded-lg border border-scripture/20">
              <h4 className="font-medium text-scripture mb-2">How to Increase Wisdom Score:</h4>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Complete biblical finance courses (+5)</li>
                <li>• Consistent tithing (+10)</li>
                <li>• Share wisdom on Farcaster (+3)</li>
                <li>• Participate in DeFi farming (+8)</li>
                <li>• Help others with financial advice (+5)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Rewards System Card */}
        <Card className="border-scripture/30 bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              Wisdom Rewards System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Available Rewards</span>
                <span className="text-green-400 font-bold">{availableRewards} $BIBLEFI</span>
              </div>
              <Button 
                onClick={handleClaimRewards}
                disabled={availableRewards === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Claim Daily Rewards
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                <div>
                  <div className="font-medium">Staking Bonus</div>
                  <div className="text-sm text-white/60">+50% rewards</div>
                </div>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Active
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                <div>
                  <div className="font-medium">Farming Bonus</div>
                  <div className="text-sm text-white/60">+100% rewards</div>
                </div>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  Active
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                <div>
                  <div className="font-medium">Wisdom Bonus</div>
                  <div className="text-sm text-white/60">+200% for score 80+</div>
                </div>
                <Badge variant="outline" className="border-ancient-gold/30 text-ancient-gold">
                  Eligible
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ZK Privacy Features */}
      <Card className="border-scripture/30 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-scripture" />
            Zero-Knowledge Privacy Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-white">Privacy Protection</h3>
              <ul className="text-sm text-white/80 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Private transaction amounts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Hidden balance information
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Encrypted wisdom activities
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Anonymous staking participation
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-white">Automatic Fee Distribution</h3>
              <div className="text-sm text-white/80 space-y-2">
                <div className="flex justify-between">
                  <span>Every transaction fee:</span>
                  <span className="text-ancient-gold">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Goes to wisdom rewards:</span>
                  <span className="text-green-400">Automatic</span>
                </div>
                <div className="flex justify-between">
                  <span>Benefits all stakers:</span>
                  <span className="text-purple-400">Daily</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
            <p className="italic text-white/80 text-sm">
              "The simple believe anything, but the prudent give thought to their steps."
            </p>
            <p className="text-right text-xs text-ancient-gold/70 mt-2">- Proverbs 14:15</p>
            <p className="text-sm text-white/70 mt-2">
              Our ZK privacy features protect your financial information while maintaining transparency where it matters for biblical stewardship.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BibleTokenDashboard;
