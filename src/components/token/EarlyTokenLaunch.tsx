import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Rocket, 
  ExternalLink, 
  Coins,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PixelButton from '@/components/PixelButton';

interface TokenLaunchData {
  name: string;
  symbol: string;
  description: string;
  initialSupply: string;
  deployPlatform: 'clanker' | 'streme' | 'manual';
}

type ActiveToken = 'BIBLEFI' | 'WISDOM';

const EarlyTokenLaunch: React.FC = () => {
  const [activeToken, setActiveToken] = useState<ActiveToken>('BIBLEFI');
  
  const [biblefiData, setBiblefiData] = useState<TokenLaunchData>({
    name: 'BibleFi',
    symbol: 'BIBLEFI',
    description: 'Biblical wisdom meets DeFi on Base chain. Governance, staking & faithful finance.',
    initialSupply: '1000000000',
    deployPlatform: 'clanker'
  });

  const [wisdomData, setWisdomData] = useState<TokenLaunchData>({
    name: 'Wisdom Token',
    symbol: 'WISDOM',
    description: 'Earned through Biblical financial education and faithful stewardship. Rewards wisdom.',
    initialSupply: '100000000',
    deployPlatform: 'clanker'
  });

  const tokenData = activeToken === 'BIBLEFI' ? biblefiData : wisdomData;
  const setTokenData = activeToken === 'BIBLEFI' ? setBiblefiData : setWisdomData;

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);

  const launchPlatforms = [
    {
      id: 'clanker',
      name: 'Clanker.fun',
      description: 'Deploy directly from Farcaster with instant liquidity',
      icon: '🤖',
      pros: ['Instant launch', 'Built-in community', 'Farcaster native', 'Automatic liquidity'],
      cons: ['Less control', 'Platform dependent'],
      cost: 'Free + Gas',
      timeToLaunch: '~5 minutes'
    },
    {
      id: 'streme',
      name: 'Streme.wtf', 
      description: 'Advanced token streaming and distribution platform',
      icon: '🌊',
      pros: ['Token streaming', 'Advanced features', 'Custom tokenomics'],
      cons: ['More complex', 'Higher cost'],
      cost: '~$100-500',
      timeToLaunch: '~30 minutes'
    },
    {
      id: 'manual',
      name: 'Manual Deploy',
      description: 'Deploy your own contract with full control',
      icon: '🛠️',
      pros: ['Full control', 'Custom features', 'Own contract'],
      cons: ['Technical knowledge needed', 'Longer timeline'],
      cost: '~$50-200 gas',
      timeToLaunch: '1-2 hours'
    }
  ];

  const tokenStrategy = {
    immediate: [
      '🎯 Launch $BIBLEFI token for community building',
      '📈 Generate early adoption and social proof',
      '💰 Create funding mechanism for development',
      '🤝 Build devoted holder community',
      '📱 Leverage Farcaster ecosystem'
    ],
    phase2: [
      '🏛️ Add staking rewards for token holders',
      '💝 Token-gated premium features',
      '⛪ Church tithing integration',
      '📊 Governance voting rights',
      '🎮 Biblical DeFi game rewards'
    ],
    longterm: [
      '🌍 Cross-chain expansion',
      '🏦 Institutional partnerships', 
      '📚 Biblical education platform',
      '💎 NFT collections for holders',
      '🚀 Major exchange listings'
    ]
  };

  const clankerLaunchSteps = [
    'Connect wallet to Warpcast',
    'Create cast with token details',
    'Add @clanker mention',
    'Submit token creation request',
    'Wait for deployment (~2-5 min)',
    'Share launch announcement'
  ];

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchStep(0);

    if (tokenData.deployPlatform === 'clanker') {
      // Simulate clanker launch steps
      for (let i = 0; i < clankerLaunchSteps.length; i++) {
        setLaunchStep(i + 1);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "🚀 Ready for Clanker Launch!",
        description: "Copy the generated cast and post to @clanker on Farcaster",
      });
    }

    setIsLaunching(false);
  };

  const generateClankerCast = () => {
    if (activeToken === 'BIBLEFI') {
      return `@clanker deploy token

Name: ${tokenData.name}
Symbol: ${tokenData.symbol}
Description: ${tokenData.description}

🙏 Biblical wisdom meets DeFi
⛪ Governance & staking on Base
🏗️ Built for faithful stewards
📖 "The plans of the diligent lead to profit" - Proverbs 21:5

#BibleFi #DeFi #Base #Faith`;
    } else {
      return `@clanker deploy token

Name: ${tokenData.name}
Symbol: ${tokenData.symbol}
Description: ${tokenData.description}

📖 Earned through Biblical wisdom
🎓 Rewards faithful stewardship
⛪ Learn & earn on Base chain
📜 "Wisdom is more precious than rubies" - Proverbs 8:11

#WISDOM #BibleFi #Base #Faith`;
    }
  };

  const copyClankerCast = async () => {
    try {
      await navigator.clipboard.writeText(generateClankerCast());
      toast({
        title: "Cast Copied!",
        description: "Paste this in Warpcast to deploy with @clanker",
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-ancient-gold">
          🚀 Token Launch Center
        </h2>
        <p className="text-white/80 max-w-3xl mx-auto">
          Launch $BIBLEFI (governance) and $WISDOM (rewards) tokens on Base chain via Farcaster.
        </p>
      </div>

      {/* Token Selector */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setActiveToken('BIBLEFI')}
          className={`px-6 py-3 ${activeToken === 'BIBLEFI' 
            ? 'bg-ancient-gold text-black font-bold' 
            : 'bg-ancient-gold/20 text-ancient-gold border border-ancient-gold/50'}`}
        >
          💰 $BIBLEFI (Governance)
        </Button>
        <Button
          onClick={() => setActiveToken('WISDOM')}
          className={`px-6 py-3 ${activeToken === 'WISDOM' 
            ? 'bg-purple-600 text-white font-bold' 
            : 'bg-purple-900/20 text-purple-300 border border-purple-500/50'}`}
        >
          📖 $WISDOM (Rewards)
        </Button>
      </div>

      {/* Token Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`border ${activeToken === 'BIBLEFI' ? 'border-ancient-gold bg-ancient-gold/10' : 'border-ancient-gold/30 bg-scripture/20'}`}>
          <CardHeader>
            <CardTitle className="text-ancient-gold flex items-center gap-2">
              💰 $BIBLEFI Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p><strong>Purpose:</strong> Governance, staking, premium access</p>
            <p><strong>Supply:</strong> 1 Billion tokens</p>
            <p><strong>Distribution:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>40% Community rewards</li>
              <li>25% Development fund</li>
              <li>20% Church partnership fund</li>
              <li>10% Team (4-year vesting)</li>
              <li>5% Advisors</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={`border ${activeToken === 'WISDOM' ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500/30 bg-scripture/20'}`}>
          <CardHeader>
            <CardTitle className="text-purple-300 flex items-center gap-2">
              📖 $WISDOM Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p><strong>Purpose:</strong> Education rewards, stewardship incentives</p>
            <p><strong>Supply:</strong> 100 Million tokens</p>
            <p><strong>Earned By:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Weekly tithing consistency</li>
              <li>Biblical finance lessons completed</li>
              <li>Community wisdom sharing</li>
              <li>Referral rewards</li>
              <li>Staking $BIBLEFI</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Why Launch Early */}
      <Alert className="border-green-500/50 bg-green-900/20">
        <TrendingUp className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          <strong>Launching ${activeToken}:</strong> {activeToken === 'BIBLEFI' 
            ? 'Governance token for community investment, voting rights, and staking rewards.' 
            : 'Reward token for Biblical education and faithful stewardship - earned, not bought.'}
        </AlertDescription>
      </Alert>

      {/* Platform Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {launchPlatforms.map((platform) => (
          <Card 
            key={platform.id}
            className={`cursor-pointer transition-all border ${
              tokenData.deployPlatform === platform.id 
                ? 'bg-ancient-gold/20 border-ancient-gold' 
                : 'bg-scripture/20 border-ancient-gold/30 hover:border-ancient-gold/50'
            }`}
            onClick={() => setTokenData(prev => ({ ...prev, deployPlatform: platform.id as any }))}
          >
            <CardHeader>
              <CardTitle className="text-ancient-gold flex items-center gap-2">
                <span className="text-2xl">{platform.icon}</span>
                {platform.name}
                {platform.id === 'clanker' && (
                  <Badge className="bg-purple-900 text-purple-200">Recommended</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white/80 text-sm">{platform.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Cost:</span>
                  <span className="text-ancient-gold">{platform.cost}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Time:</span>
                  <span className="text-ancient-gold">{platform.timeToLaunch}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-green-400">Pros:</p>
                {platform.pros.map((pro, index) => (
                  <p key={index} className="text-xs text-green-300">• {pro}</p>
                ))}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-yellow-400">Cons:</p>
                {platform.cons.map((con, index) => (
                  <p key={index} className="text-xs text-yellow-300">• {con}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Token Configuration */}
      <Card className="bg-scripture/20 border border-ancient-gold">
        <CardHeader>
          <CardTitle className="text-ancient-gold">Token Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Token Name</label>
              <Input
                value={tokenData.name}
                onChange={(e) => setTokenData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border-ancient-gold/30 text-white"
                placeholder="BibleFi"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Symbol</label>
              <Input
                value={tokenData.symbol}
                onChange={(e) => setTokenData(prev => ({ ...prev, symbol: e.target.value }))}
                className="bg-black/20 border-ancient-gold/30 text-white"
                placeholder="BIBLEFI"
              />
            </div>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={tokenData.description}
              onChange={(e) => setTokenData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-black/20 border-ancient-gold/30 text-white"
              placeholder="Biblical wisdom meets DeFi on Base chain..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">Initial Supply</label>
            <Input
              value={tokenData.initialSupply}
              onChange={(e) => setTokenData(prev => ({ ...prev, initialSupply: e.target.value }))}
              className="bg-black/20 border-ancient-gold/30 text-white"
              placeholder="1000000000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clanker Launch Interface */}
      {tokenData.deployPlatform === 'clanker' && (
        <Card className="bg-purple-900/20 border border-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-300 flex items-center gap-2">
              🤖 Clanker.fun Launch Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Generated Cast</label>
              <Textarea
                value={generateClankerCast()}
                readOnly
                className="bg-black/40 border-purple-500/30 text-purple-200 font-mono text-sm"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PixelButton
                onClick={copyClankerCast}
                className="bg-purple-900 text-purple-200 border border-purple-500"
              >
                📋 Copy Cast
              </PixelButton>

              <PixelButton
                onClick={() => window.open('https://warpcast.com/~/compose', '_blank')}
                className="bg-blue-900 text-blue-200 border border-blue-500"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Warpcast
              </PixelButton>
            </div>

            {isLaunching && (
              <div className="space-y-2">
                <p className="text-purple-300 text-sm">Launch Progress:</p>
                {clankerLaunchSteps.map((step, index) => (
                  <div key={index} className={`flex items-center gap-2 text-sm ${
                    index < launchStep ? 'text-green-400' : 
                    index === launchStep ? 'text-yellow-400' : 'text-white/40'
                  }`}>
                    {index < launchStep ? '✅' : index === launchStep ? '⏳' : '⏸️'}
                    {step}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Launch Strategy Timeline */}
      <Card className="bg-scripture/20 border border-ancient-gold">
        <CardHeader>
          <CardTitle className="text-ancient-gold">3-Phase Launch Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-ancient-gold font-medium mb-3 flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Phase 1: Immediate (Now)
              </h4>
              <div className="space-y-2">
                {tokenStrategy.immediate.map((item, index) => (
                  <p key={index} className="text-white/80 text-sm">{item}</p>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-ancient-gold font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Phase 2: Utility (1-3 months)
              </h4>
              <div className="space-y-2">
                {tokenStrategy.phase2.map((item, index) => (
                  <p key={index} className="text-white/80 text-sm">{item}</p>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-ancient-gold font-medium mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Phase 3: Expansion (6+ months)
              </h4>
              <div className="space-y-2">
                {tokenStrategy.longterm.map((item, index) => (
                  <p key={index} className="text-white/80 text-sm">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PixelButton
          onClick={handleLaunch}
          disabled={isLaunching}
          className={activeToken === 'BIBLEFI' 
            ? "bg-ancient-gold/20 border border-ancient-gold text-ancient-gold hover:bg-ancient-gold/30"
            : "bg-purple-900/20 border border-purple-500 text-purple-300 hover:bg-purple-900/40"}
        >
          {isLaunching ? '🚀 Launching...' : `🚀 Launch $${activeToken}`}
        </PixelButton>

        <PixelButton
          onClick={() => window.open('https://clanker.fun', '_blank')}
          className="bg-purple-900 text-purple-200 border border-purple-500"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Visit Clanker.fun
        </PixelButton>

        <PixelButton
          onClick={() => window.open('https://streme.wtf', '_blank')}
          className="bg-blue-900 text-blue-200 border border-blue-500"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Visit Streme.wtf
        </PixelButton>
      </div>

      {/* Biblical Quote */}
      <div className="text-center p-4 bg-ancient-gold/10 rounded border border-ancient-gold/30">
        <p className="text-white/80 italic">
          "The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5
        </p>
        <p className="text-ancient-gold/60 text-sm mt-2">
          Launch with wisdom, build with patience, succeed with faith
        </p>
      </div>
    </div>
  );
};

export default EarlyTokenLaunch;