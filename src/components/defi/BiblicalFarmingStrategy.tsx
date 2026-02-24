
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

interface BiblicalFarmingStrategyProps {
  name: string;
  apy: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  asset1: { symbol: string };
  asset2: { symbol: string };
  platform: string;
  platformUrl: string;
  biblicalPrinciple: {
    verse: string;
    reference: string;
    principle: string;
  };
  requirements: string[];
}

const BiblicalFarmingStrategy: React.FC<BiblicalFarmingStrategyProps> = ({
  name,
  apy,
  riskLevel,
  description,
  asset1,
  asset2,
  platform,
  platformUrl,
  biblicalPrinciple,
  requirements
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleStartFarming = () => {
    playSound('coin');
    toast({
      title: "Strategy Activated! 🌾",
      description: `Preparing ${name} via ${platform} protocol — executing in-app.`,
    });
    // In-app execution — no external redirect
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    playSound('select');
  };

  return (
    <Card className="border-scripture/30 bg-black/40 hover:border-ancient-gold/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-ancient-gold">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRiskColor(riskLevel)}>
                <Shield className="w-3 h-3 mr-1" />
                {riskLevel} risk
              </Badge>
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                {apy}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">on {platform}</div>
            <div className="text-xs text-ancient-gold/70">{asset1.symbol}-{asset2.symbol}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-white/80 text-sm">{description}</p>
        
        {isExpanded && (
          <div className="space-y-4">
            <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
              <h4 className="font-medium text-ancient-gold mb-2">Biblical Foundation:</h4>
              <p className="italic text-white/80 text-sm mb-2">"{biblicalPrinciple.verse}"</p>
              <p className="text-right text-xs text-ancient-gold/70 mb-2">{biblicalPrinciple.reference}</p>
              <p className="text-white/70 text-sm">{biblicalPrinciple.principle}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Requirements:</h4>
              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleStartFarming}
            className="flex-1 bg-scripture hover:bg-scripture/80"
          >
            Start Farming
          </Button>
          
          <Button 
            variant="outline"
            onClick={toggleExpand}
            className="border-ancient-gold/50 text-ancient-gold hover:bg-ancient-gold/20"
          >
            {isExpanded ? 'Less' : 'Details'}
          </Button>
        </div>
        
        {riskLevel === 'high' && (
          <div className="flex items-center gap-2 text-amber-400 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>High risk - invest only what you can afford to lose</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BiblicalFarmingStrategy;
