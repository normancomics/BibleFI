
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, BookOpen, Heart, Shield, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRandomVerse } from '@/data/bibleVerses';

const WisdomScore: React.FC = () => {
  const [score, setScore] = useState(75);
  const [factors, setFactors] = useState({
    diversification: 80,
    generosity: 70,
    risk: 65, // Lower is better for risk
    planning: 85,
    contentment: 90,
    stewardship: 75
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const verse = getRandomVerse();

  const calculateWisdomScore = async () => {
    setIsCalculating(true);
    
    // Simulate calculation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate new score based on factors
    const newScore = Math.round(
      (factors.diversification * 0.15) +
      (factors.generosity * 0.25) +
      ((100 - factors.risk) * 0.15) + // Lower risk is better
      (factors.planning * 0.15) +
      (factors.contentment * 0.15) +
      (factors.stewardship * 0.15)
    );
    
    setScore(newScore);
    setIsCalculating(false);
    
    toast({
      title: "Wisdom Score Updated! 📊",
      description: `Your biblical financial wisdom score is ${newScore}/100`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Solomon-like', color: 'bg-purple-500' };
    if (score >= 80) return { level: 'Wise Steward', color: 'bg-green-500' };
    if (score >= 70) return { level: 'Growing in Wisdom', color: 'bg-blue-500' };
    if (score >= 60) return { level: 'Learning', color: 'bg-yellow-500' };
    return { level: 'Seek Wisdom', color: 'bg-red-500' };
  };

  const factorIcons = {
    diversification: Target,
    generosity: Heart,
    risk: Shield,
    planning: BookOpen,
    contentment: Star,
    stewardship: TrendingUp
  };

  const { level, color } = getScoreLevel(score);

  return (
    <Card className="border-scripture/30 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="text-ancient-gold" />
          Biblical Wisdom Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <Badge className={`${color} text-white mt-2`}>
            {level}
          </Badge>
        </div>

        <div className="space-y-4">
          {Object.entries(factors).map(([factor, value]) => {
            const IconComponent = factorIcons[factor as keyof typeof factorIcons];
            const displayValue = factor === 'risk' ? 100 - value : value; // Invert risk for display
            
            return (
              <div key={factor} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-ancient-gold" />
                    <span className="text-sm capitalize">{factor}</span>
                  </div>
                  <span className="text-sm font-medium">{displayValue}%</span>
                </div>
                <Progress value={displayValue} className="h-2" />
              </div>
            );
          })}
        </div>

        <Button 
          onClick={calculateWisdomScore}
          disabled={isCalculating}
          className="w-full bg-scripture hover:bg-scripture/80"
        >
          {isCalculating ? 'Calculating...' : 'Recalculate Score'}
        </Button>

        <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
          <h4 className="font-medium text-ancient-gold mb-2">Scripture Guidance:</h4>
          <p className="italic text-white/80 text-sm">{verse.text}</p>
          <p className="text-right text-xs text-ancient-gold/70 mt-2">{verse.reference}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-white">Improvement Areas:</h4>
          <div className="space-y-1 text-sm text-white/70">
            {score < 80 && <div>• Consider diversifying your DeFi positions</div>}
            {factors.generosity < 75 && <div>• Increase tithing and charitable giving</div>}
            {factors.risk > 70 && <div>• Reduce exposure to high-risk protocols</div>}
            {factors.planning < 80 && <div>• Create a more detailed financial plan</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WisdomScore;
