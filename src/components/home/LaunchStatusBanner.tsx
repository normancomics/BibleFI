import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  CheckCircle, 
  Clock, 
  Coins,
  ExternalLink,
  Star,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { Link } from 'react-router-dom';

const LaunchStatusBanner: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isExpanded, setIsExpanded] = useState(false);

  const launchProgress = 75; // 75% complete
  const milestones = [
    { name: 'Smart Contracts', status: 'completed', description: 'Token & staking contracts ready' },
    { name: 'Liquidity Pools', status: 'in-progress', description: 'Setting up BIBLE/ETH pools' },
    { name: 'Church Partnerships', status: 'completed', description: '50+ churches integrated' },
    { name: 'Farcaster Mini-App', status: 'completed', description: 'Frame deployment ready' },
    { name: 'Security Audit', status: 'pending', description: 'Professional audit scheduled' }
  ];

  const handleLaunchClick = () => {
    playSound('powerup');
    toast({
      title: "Ready for Launch! 🚀",
      description: "$BIBLEFI token deployment is 75% complete",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border-ancient-gold/30 bg-gradient-to-r from-black/80 to-ancient-gold/10 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ancient-gold/20 rounded-lg">
              <Rocket className="h-6 w-6 text-ancient-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ancient-gold">$BIBLEFI Token Launch</h3>
              <p className="text-sm text-muted-foreground">Biblical DeFi ready for Base mainnet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
              {launchProgress}% Ready
            </Badge>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-ancient-gold/30"
            >
              {isExpanded ? 'Less' : 'Details'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Launch Progress</span>
              <span className="text-ancient-gold font-medium">{launchProgress}%</span>
            </div>
            <Progress value={launchProgress} className="h-2" />
          </div>

          {isExpanded && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  {getStatusIcon(milestone.status)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{milestone.name}</div>
                    <div className="text-xs text-muted-foreground">{milestone.description}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      milestone.status === 'completed' ? 'border-green-400/30 text-green-400' :
                      milestone.status === 'in-progress' ? 'border-yellow-400/30 text-yellow-400' :
                      'border-muted-foreground/30'
                    }`}
                  >
                    {milestone.status.replace('-', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              asChild
              className="flex-1 bg-ancient-gold hover:bg-ancient-gold/90 text-black font-medium"
              onClick={handleLaunchClick}
            >
              <Link to="/token">
                <Coins className="mr-2 h-4 w-4" />
                Deploy $BIBLEFI
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-ancient-gold/30 text-ancient-gold hover:bg-ancient-gold/10"
              asChild
            >
              <a href="https://github.com/normancomics/biblefi" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-ancient-gold/20">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">50+</div>
              <div className="text-xs text-muted-foreground">Churches Ready</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">1B</div>
              <div className="text-xs text-muted-foreground">Total Supply</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-ancient-gold">$0.10</div>
              <div className="text-xs text-muted-foreground">Launch Price</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchStatusBanner;