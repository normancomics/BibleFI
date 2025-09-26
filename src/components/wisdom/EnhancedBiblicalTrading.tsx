import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Shield, Heart, TrendingUp, Brain, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

interface BiblicalAnalysis {
  prudenceScore: number;
  stewardshipScore: number;
  timingWisdom: string;
  principleViolations: string[];
  recommendations: string[];
  relevantScripture: {
    text: string;
    reference: string;
    application: string;
  };
}

interface EnhancedBiblicalTradingProps {
  fromToken: string;
  toToken: string;
  amount: string;
  priceImpact: number;
  onAnalysisChange: (analysis: BiblicalAnalysis) => void;
}

const EnhancedBiblicalTrading: React.FC<EnhancedBiblicalTradingProps> = ({
  fromToken,
  toToken,
  amount,
  priceImpact,
  onAnalysisChange
}) => {
  const [analysis, setAnalysis] = useState<BiblicalAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (fromToken && toToken && amount) {
      analyzeTrade();
    }
  }, [fromToken, toToken, amount, priceImpact]);

  const analyzeTrade = async () => {
    setIsAnalyzing(true);
    
    // Simulate biblical analysis
    setTimeout(() => {
      const amountValue = parseFloat(amount);
      
      // Biblical wisdom scoring
      let prudenceScore = 85;
      let stewardshipScore = 90;
      const principleViolations: string[] = [];
      const recommendations: string[] = [];
      
      // Analyze based on biblical principles
      
      // 1. Prudence (Proverbs 27:14 - "A prudent person foresees danger")
      if (priceImpact > 2) {
        prudenceScore -= 20;
        principleViolations.push("High price impact suggests hasty trading");
        recommendations.push("Consider smaller amounts to reduce market impact");
      }
      
      if (amountValue > 1000) {
        prudenceScore -= 15;
        principleViolations.push("Large trade amounts require extra caution");
        recommendations.push("Divide large trades into smaller portions");
      }
      
      // 2. Stewardship (1 Corinthians 4:2 - "It is required of stewards that they be found faithful")
      if (fromToken === 'ETH' && toToken === 'USDC' && amountValue > 5) {
        stewardshipScore -= 10;
        recommendations.push("Consider keeping some ETH for long-term growth");
      }
      
      // 3. Greed detection (1 Timothy 6:10 - "Love of money is root of evil")
      if (priceImpact < 0.1 && amountValue > 100) {
        recommendations.push("Ensure this trade serves your family's needs, not just profit");
      }
      
      // Select appropriate scripture
      let scripture;
      if (prudenceScore < 70) {
        scripture = {
          text: "The simple believe anything, but the prudent give thought to their steps.",
          reference: "Proverbs 14:15",
          application: "This trade requires more careful consideration before proceeding."
        };
      } else if (stewardshipScore < 80) {
        scripture = {
          text: "Whoever is faithful in very little is also faithful in much.",
          reference: "Luke 16:10",
          application: "Good stewardship in small trades builds trust for larger ones."
        };
      } else {
        scripture = {
          text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
          reference: "Proverbs 21:5",
          application: "Your thoughtful approach to this trade reflects biblical wisdom."
        };
      }
      
      // Timing wisdom
      const hour = new Date().getHours();
      let timingWisdom = "Good time for deliberate trading decisions";
      if (hour < 6 || hour > 22) {
        timingWisdom = "Late night trading may lead to hasty decisions - consider waiting";
        prudenceScore -= 5;
      }
      
      const biblicalAnalysis: BiblicalAnalysis = {
        prudenceScore: Math.max(0, Math.min(100, prudenceScore)),
        stewardshipScore: Math.max(0, Math.min(100, stewardshipScore)),
        timingWisdom,
        principleViolations,
        recommendations,
        relevantScripture: scripture
      };
      
      setAnalysis(biblicalAnalysis);
      onAnalysisChange(biblicalAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getOverallWisdomScore = () => {
    if (!analysis) return 0;
    return Math.round((analysis.prudenceScore + analysis.stewardshipScore) / 2);
  };

  const getWisdomColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWisdomBadge = (score: number) => {
    if (score >= 90) return { text: "Wise", color: "bg-green-900/30 text-green-400" };
    if (score >= 75) return { text: "Prudent", color: "bg-blue-900/30 text-blue-400" };
    if (score >= 60) return { text: "Cautious", color: "bg-yellow-900/30 text-yellow-400" };
    return { text: "Risky", color: "bg-red-900/30 text-red-400" };
  };

  if (isAnalyzing) {
    return (
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardContent className="p-6 text-center">
          <Brain className="h-8 w-8 mx-auto mb-4 text-ancient-gold animate-pulse" />
          <p className="text-sm text-purple-200">Analyzing trade through biblical wisdom...</p>
          <div className="mt-4 w-full bg-purple-900/30 rounded-full h-2">
            <div className="bg-ancient-gold h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const overallScore = getOverallWisdomScore();
  const wisdomBadge = getWisdomBadge(overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Wisdom Score */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border-purple-500/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-ancient-gold flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Biblical Wisdom Analysis
            </span>
            <Badge className={wisdomBadge.color}>
              {wisdomBadge.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wisdom Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-purple-200">Prudence</span>
                <span className={`text-sm font-bold ${getWisdomColor(analysis.prudenceScore)}`}>
                  {analysis.prudenceScore}%
                </span>
              </div>
              <Progress value={analysis.prudenceScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-purple-200">Stewardship</span>
                <span className={`text-sm font-bold ${getWisdomColor(analysis.stewardshipScore)}`}>
                  {analysis.stewardshipScore}%
                </span>
              </div>
              <Progress value={analysis.stewardshipScore} className="h-2" />
            </div>
          </div>

          {/* Overall Score */}
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <div className="text-2xl font-bold text-ancient-gold mb-1">
              {overallScore}%
            </div>
            <div className="text-sm text-purple-200">
              Overall Wisdom Score
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing Wisdom */}
      <Card className="bg-indigo-900/20 border-indigo-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-200">Timing Wisdom</span>
          </div>
          <p className="text-sm text-white/80">{analysis.timingWisdom}</p>
        </CardContent>
      </Card>

      {/* Principle Violations */}
      {analysis.principleViolations.length > 0 && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-200">Wisdom Concerns</span>
            </div>
            <ul className="space-y-2">
              {analysis.principleViolations.map((violation, index) => (
                <li key={index} className="text-sm text-red-100 flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  {violation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-200">Biblical Guidance</span>
            </div>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-green-100 flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Scripture Application */}
      <Card className="bg-ancient-gold/10 border-ancient-gold/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-ancient-gold" />
            <span className="text-sm font-medium text-ancient-gold">Scripture Guidance</span>
          </div>
          <blockquote className="italic text-white/90 mb-2 pl-4 border-l-2 border-ancient-gold/50">
            "{analysis.relevantScripture.text}"
          </blockquote>
          <p className="text-sm text-ancient-gold mb-2">
            — {analysis.relevantScripture.reference}
          </p>
          <p className="text-sm text-purple-200">
            <strong>Application:</strong> {analysis.relevantScripture.application}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedBiblicalTrading;