import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Heart, 
  Brain,
  Coins,
  Shield,
  Target,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { enhancedBiblicalFinanceService, BiblicalFinancialAdvice } from '@/services/enhancedBiblicalFinanceService';
import { useToast } from '@/hooks/use-toast';
import PixelButton from '@/components/PixelButton';
import { useSound } from '@/contexts/SoundContext';
import { GlowingText } from '@/components/ui/tailwind-extensions';
import PixelCharacter from '@/components/PixelCharacter';

interface ComprehensiveBiblicalAdvisorProps {
  userContext?: {
    walletBalance?: number;
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    primaryChurch?: string;
    tithingHistory?: number;
  };
}

const ComprehensiveBiblicalAdvisor: React.FC<ComprehensiveBiblicalAdvisorProps> = ({ 
  userContext 
}) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState<BiblicalFinancialAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('advisor');

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Please Enter a Question",
        description: "Ask about Biblical financial principles, DeFi strategies, or stewardship",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    playSound("scroll");

    try {
      const result = await enhancedBiblicalFinanceService.getComprehensiveBiblicalAdvice(
        question,
        userContext
      );
      
      setAdvice(result);
      setActiveTab('results');
      playSound("powerup");
      
      toast({
        title: "Biblical Wisdom Received",
        description: `Wisdom score: ${result.wisdomScore}/100`,
      });
    } catch (error) {
      console.error('Error getting Biblical advice:', error);
      playSound("error");
      toast({
        title: "Error",
        description: "Failed to get Biblical guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWisdomScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getQuickQuestions = () => [
    "How much should I tithe from my crypto gains?",
    "Is it Biblical to stake my tokens for rewards?",
    "Should I take out a DeFi loan for investment?",
    "How do I build emergency savings with stablecoins?",
    "What does the Bible say about diversifying investments?",
    "Is yield farming considered Biblical stewardship?"
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-royal-purple/30 border-ancient-gold/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <GlowingText color="yellow">Biblical Financial Advisor</GlowingText>
          </CardTitle>
          <p className="text-white/80">
            Get wisdom-guided financial advice combining Biblical principles with live market data
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 bg-black/30">
          <TabsTrigger value="advisor" className="data-[state=active]:bg-scripture/30">
            <Brain className="w-4 h-4 mr-2" />
            Ask Advisor
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-scripture/30" disabled={!advice}>
            <BookOpen className="w-4 h-4 mr-2" />
            Guidance
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-scripture/30" disabled={!advice}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Market Context
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advisor" className="space-y-6">
          <Card className="bg-royal-purple/30 border-ancient-gold/30">
            <CardHeader>
              <CardTitle className="text-ancient-gold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Ask Your Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <PixelCharacter 
                  character="solomon" 
                  size="lg"
                  animate={true}
                />
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Ask about Biblical financial principles, DeFi strategies, tithing, investments, or any financial decision..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-black/30 border-scripture/30 text-white min-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                  
                  <PixelButton
                    onClick={handleAskQuestion}
                    disabled={isLoading || !question.trim()}
                    className="w-full"
                    farcasterStyle
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Seeking Biblical Wisdom...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Get Biblical Guidance
                      </div>
                    )}
                  </PixelButton>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/70">Popular Questions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getQuickQuestions().map((quickQuestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="border-ancient-gold/30 text-white/80 hover:bg-ancient-gold/10 text-left h-auto p-3"
                      onClick={() => setQuestion(quickQuestion)}
                      disabled={isLoading}
                    >
                      {quickQuestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {advice && (
            <>
              {/* Biblical Principle */}
              <Card className="bg-royal-purple/30 border-ancient-gold/30">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Biblical Principle
                    <Badge className={`ml-auto ${getWisdomScoreColor(advice.wisdomScore)}`}>
                      Wisdom Score: {advice.wisdomScore}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/90 text-lg leading-relaxed">
                    {advice.biblicalPrinciple}
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="text-ancient-gold font-medium">Supporting Scriptures:</h4>
                    {advice.scriptureReferences.map((scripture, index) => (
                      <div key={index} className="bg-black/20 p-4 rounded-lg border border-scripture/20">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-ancient-gold font-medium">{scripture.reference}</h5>
                          {scripture.strongNumbers && scripture.strongNumbers.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Strong's: {scripture.strongNumbers.slice(0, 2).join(', ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/80 italic mb-3">"{scripture.text}"</p>
                        
                        {/* Original Languages */}
                        {scripture.originalLanguage && (
                          <div className="space-y-2 text-sm">
                            {scripture.originalLanguage.hebrew && (
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">Hebrew</Badge>
                                <span className="text-white/60">{scripture.originalLanguage.hebrew}</span>
                              </div>
                            )}
                            {scripture.originalLanguage.greek && (
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">Greek</Badge>
                                <span className="text-white/60">{scripture.originalLanguage.greek}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Practical Guidance */}
              <Card className="bg-royal-purple/30 border-ancient-gold/30">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Practical Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {advice.practicalGuidance.tithingAdvice && (
                      <div className="bg-black/20 p-4 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-green-400" />
                          <h4 className="text-green-400 font-medium">Tithing</h4>
                        </div>
                        <p className="text-white/80 text-sm">{advice.practicalGuidance.tithingAdvice}</p>
                      </div>
                    )}
                    
                    {advice.practicalGuidance.investmentStrategy && (
                      <div className="bg-black/20 p-4 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <h4 className="text-blue-400 font-medium">Investment Strategy</h4>
                        </div>
                        <p className="text-white/80 text-sm">{advice.practicalGuidance.investmentStrategy}</p>
                      </div>
                    )}
                    
                    {advice.practicalGuidance.riskManagement && (
                      <div className="bg-black/20 p-4 rounded-lg border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-orange-400" />
                          <h4 className="text-orange-400 font-medium">Risk Management</h4>
                        </div>
                        <p className="text-white/80 text-sm">{advice.practicalGuidance.riskManagement}</p>
                      </div>
                    )}
                    
                    {advice.practicalGuidance.stakeRecommendations && (
                      <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className="w-4 h-4 text-purple-400" />
                          <h4 className="text-purple-400 font-medium">Staking Recommendations</h4>
                        </div>
                        <div className="space-y-1">
                          {advice.practicalGuidance.stakeRecommendations.map((rec, index) => (
                            <p key={index} className="text-white/80 text-sm">• {rec}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* DeFi Applications */}
              <Card className="bg-royal-purple/30 border-ancient-gold/30">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Biblical DeFi Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {advice.defiApplications.map((app, index) => (
                      <div 
                        key={index} 
                        className="bg-black/20 p-4 rounded-lg border border-scripture/20 hover:border-ancient-gold/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-ancient-gold font-medium">{app.protocol}</h4>
                          <Badge 
                            variant="outline" 
                            className={
                              app.riskLevel === 'low' ? 'border-green-500 text-green-400' :
                              app.riskLevel === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-red-500 text-red-400'
                            }
                          >
                            {app.riskLevel} risk
                          </Badge>
                        </div>
                        <p className="text-white/80 mb-2">{app.action}</p>
                        <p className="text-white/60 text-sm italic">{app.biblicalRationale}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {advice && (
            <>
              {/* Market Overview */}
              <Card className="bg-royal-purple/30 border-ancient-gold/30">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Market Context & Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/20 p-4 rounded-lg text-center">
                      <h4 className="text-white/70 text-sm mb-2">Market Trend</h4>
                      <Badge 
                        className={
                          advice.marketContext.marketTrend === 'bullish' ? 'bg-green-900/30 text-green-400' :
                          advice.marketContext.marketTrend === 'bearish' ? 'bg-red-900/30 text-red-400' :
                          'bg-gray-900/30 text-gray-400'
                        }
                      >
                        {advice.marketContext.marketTrend}
                      </Badge>
                    </div>
                    
                    <div className="bg-black/20 p-4 rounded-lg text-center">
                      <h4 className="text-white/70 text-sm mb-2">Risk Assessment</h4>
                      <Badge 
                        className={
                          advice.marketContext.riskAssessment === 'low' ? 'bg-green-900/30 text-green-400' :
                          advice.marketContext.riskAssessment === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }
                      >
                        {advice.marketContext.riskAssessment} risk
                      </Badge>
                    </div>
                    
                    <div className="bg-black/20 p-4 rounded-lg text-center">
                      <h4 className="text-white/70 text-sm mb-2">Tokens Analyzed</h4>
                      <span className="text-white text-lg font-medium">
                        {advice.marketContext.relevantTokens.length}
                      </span>
                    </div>
                  </div>

                  {/* Token Data */}
                  <div className="space-y-3">
                    <h4 className="text-ancient-gold font-medium">Relevant Token Data:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advice.marketContext.relevantTokens.slice(0, 6).map((token, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg border border-scripture/20">
                          <div className="flex items-center justify-between">
                            <span className="text-ancient-gold font-medium">{token.symbol}</span>
                            <span className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-white/80">
                            ${token.price.toLocaleString()}
                          </div>
                          <div className="text-white/60 text-xs">
                            Vol: ${(token.volume24h / 1e6).toFixed(1)}M
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveBiblicalAdvisor;