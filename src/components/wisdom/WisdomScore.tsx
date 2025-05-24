
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PixelButton from "@/components/PixelButton";
import { Sparkles, Award, BookOpen, Share2, TrendingUp, FileCheck } from "lucide-react";
import { biblicalWisdomService, WisdomScoreFactors } from '@/services/biblicalWisdomService';
import { getRandomVerseByCategory } from '@/data/bibleVerses';
import { farcasterClient } from '@/integrations/farcaster/client';
import { useToast } from "@/hooks/use-toast";

const WisdomScore: React.FC<{
  userActivities?: {
    tithingPercentage: number;
    hasDiversifiedInvestments: boolean;
    hasEmergencyFund: boolean;
    hasDebt: boolean;
    hasFinancialPlan: boolean;
    sharesWisdomWithOthers: boolean;
    riskProfile: 'conservative' | 'balanced' | 'aggressive';
  }
}> = ({ userActivities }) => {
  const [score, setScore] = useState<number>(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [guidanceVerse, setGuidanceVerse] = useState(getRandomVerseByCategory('stewardship'));
  const { toast } = useToast();
  
  // Calculate wisdom score based on user activities
  useEffect(() => {
    if (!userActivities) {
      // Default values for demo
      const scoreResult = biblicalWisdomService.calculateWisdomScore({
        diversification: 65,
        generosity: 80,
        risk: 40,
        planning: 60,
        contentment: 75,
        stewardship: 70
      });
      
      setScore(scoreResult.score);
      setStrengths(scoreResult.strengths);
      setImprovements(scoreResult.improvements);
      setGuidanceVerse(scoreResult.verseGuidance);
      return;
    }
    
    // Calculate based on actual user activities
    const scoreFactors: WisdomScoreFactors = {
      diversification: userActivities.hasDiversifiedInvestments ? 85 : 40,
      generosity: calculateGenerosityScore(userActivities.tithingPercentage),
      risk: calculateRiskScore(userActivities.riskProfile, userActivities.hasEmergencyFund),
      planning: userActivities.hasFinancialPlan ? 90 : 30,
      contentment: 70, // Default value, could be calculated from other factors
      stewardship: calculateStewardshipScore(userActivities)
    };
    
    const scoreResult = biblicalWisdomService.calculateWisdomScore(scoreFactors);
    setScore(scoreResult.score);
    setStrengths(scoreResult.strengths);
    setImprovements(scoreResult.improvements);
    setGuidanceVerse(scoreResult.verseGuidance);
  }, [userActivities]);
  
  // Helper functions for score calculation
  const calculateGenerosityScore = (tithingPercentage: number): number => {
    if (tithingPercentage >= 10) return 100;
    if (tithingPercentage >= 5) return 80;
    if (tithingPercentage > 0) return 60;
    return 30;
  };
  
  const calculateRiskScore = (profile: 'conservative' | 'balanced' | 'aggressive', hasEmergencyFund: boolean): number => {
    let baseScore = profile === 'conservative' ? 30 : profile === 'balanced' ? 50 : 70;
    return hasEmergencyFund ? Math.max(baseScore - 20, 10) : baseScore;
  };
  
  const calculateStewardshipScore = (activities: any): number => {
    let score = 60; // Base score
    
    if (activities.hasFinancialPlan) score += 15;
    if (activities.hasEmergencyFund) score += 15;
    if (!activities.hasDebt) score += 10;
    if (activities.sharesWisdomWithOthers) score += 10;
    if (activities.tithingPercentage >= 10) score += 10;
    
    return Math.min(score, 100);
  };
  
  // Score color based on score value
  const getScoreColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };
  
  // Progress color based on score value
  const getProgressColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };
  
  const handleShare = () => {
    try {
      const shareUrl = farcasterClient.generateVerseSharingUrl(
        guidanceVerse.text,
        guidanceVerse.reference
      );
      
      window.open(shareUrl, "_blank");
      
      toast({
        title: "Ready to Share",
        description: "Share your biblical wisdom score on Farcaster",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not generate sharing link",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-2 border-ancient-gold/30">
      <CardHeader className="bg-scripture/20">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="text-ancient-gold" />
          <span>Biblical Financial Wisdom Score</span>
        </CardTitle>
        <CardDescription>
          Based on biblical principles and your financial activities
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="text-center">
          <div className="relative inline-block">
            <div className={`text-6xl font-bold ${getScoreColor()}`}>
              {score}
            </div>
            <div className="text-sm text-muted-foreground">out of 100</div>
            {score >= 80 && (
              <Badge className="absolute -top-2 -right-8 bg-ancient-gold text-black">
                Blessed
              </Badge>
            )}
          </div>
          
          <div className="mt-4">
            <Progress value={score} className={`h-2 ${getProgressColor()}`} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 p-4 rounded-lg border border-green-500/30">
            <h3 className="font-medium flex items-center gap-2 text-green-400">
              <Award size={18} />
              <span>Your Strengths</span>
            </h3>
            <ul className="mt-2 space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-xs">✓</span>
                  <span className="capitalize">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/30">
            <h3 className="font-medium flex items-center gap-2 text-yellow-400">
              <TrendingUp size={18} />
              <span>Growth Areas</span>
            </h3>
            <ul className="mt-2 space-y-1">
              {improvements.map((improvement, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-xs">→</span>
                  <span className="capitalize">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-scripture/10 p-4 rounded-lg border border-ancient-gold/20">
          <h3 className="font-medium flex items-center gap-2 text-ancient-gold">
            <BookOpen size={18} />
            <span>Scripture Guidance</span>
          </h3>
          <blockquote className="mt-2 italic text-white/80">
            "{guidanceVerse.text}"
          </blockquote>
          <p className="text-right text-sm text-ancient-gold/70 mt-1">
            {guidanceVerse.reference}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 border-t border-border pt-6">
        <PixelButton 
          className="flex items-center justify-center w-full sm:w-auto"
          onClick={handleShare}
        >
          <Share2 size={16} className="mr-2" />
          Share on Farcaster
        </PixelButton>
        
        <PixelButton 
          variant="outline"
          className="flex items-center justify-center w-full sm:w-auto"
        >
          <FileCheck size={16} className="mr-2" />
          Get Detailed Analysis
        </PixelButton>
      </CardFooter>
    </Card>
  );
};

export default WisdomScore;
