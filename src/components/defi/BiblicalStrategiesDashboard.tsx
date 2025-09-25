import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Shield, 
  Heart, 
  Brain, 
  Target, 
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { biblicalDefiStrategies, DefiStrategy, BiblicalRiskAssessment } from '@/services/biblicalDefiStrategies';
import { useSound } from '@/contexts/SoundContext';
import { toast } from '@/components/ui/use-toast';

const BiblicalStrategiesDashboard: React.FC = () => {
  const { playSound } = useSound();
  const [strategies, setStrategies] = useState<DefiStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<DefiStrategy | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<BiblicalRiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState('1000');

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const availableStrategies = biblicalDefiStrategies.getStrategies();
        setStrategies(availableStrategies);
        setSelectedStrategy(availableStrategies[0]);
      } catch (error) {
        console.error('Failed to load strategies:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load biblical strategies",
          variant: "destructive"
        });
      }
    };

    loadStrategies();
  }, []);

  const handleRiskAssessment = async () => {
    setIsLoading(true);
    playSound('click');

    try {
      // Mock user answers for demo
      const userAnswers = {
        diversificationComfort: 7,
        stewardshipCommitment: 8,
        patienceLevel: 6,
        wisdomSeeking: 9
      };

      const assessment = await biblicalDefiStrategies.assessBiblicalRiskProfile(
        userAnswers,
        parseFloat(portfolioValue)
      );

      setRiskAssessment(assessment);
      playSound('success');

      toast({
        title: "Assessment Complete! ✨",
        description: `Your biblical risk profile: ${assessment.overall}`,
      });
    } catch (error) {
      console.error('Risk assessment failed:', error);
      toast({
        title: "Assessment Failed",
        description: "Unable to complete risk assessment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeStrategy = async (strategy: DefiStrategy) => {
    playSound('powerup');
    setIsLoading(true);

    try {
      // Simulate strategy execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Strategy Activated! 🎯",
        description: `${strategy.name} is now active with biblical wisdom guidance`,
      });

      playSound('success');
    } catch (error) {
      console.error('Strategy execution failed:', error);
      toast({
        title: "Execution Failed",
        description: "Strategy could not be activated",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'aggressive': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'conservative': return <Shield className="h-4 w-4" />;
      case 'moderate': return <Target className="h-4 w-4" />;
      case 'aggressive': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-eboy-green to-ancient-gold bg-clip-text text-transparent mb-2">
          Biblical DeFi Strategies
        </h2>
        <p className="text-muted-foreground">
          "The plans of the diligent lead to profit as surely as haste leads to poverty" - Proverbs 21:5
        </p>
      </motion.div>

      <Tabs defaultValue="strategies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {strategies.map((strategy) => (
              <motion.div
                key={strategy.id}
                layout
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className={`cursor-pointer transition-all duration-300 ${
                  selectedStrategy?.id === strategy.id 
                    ? 'ring-2 ring-eboy-green border-eboy-green/30' 
                    : 'hover:border-eboy-green/20'
                }`}
                onClick={() => {
                  setSelectedStrategy(strategy);
                  playSound('select');
                }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getRiskIcon(strategy.riskLevel)}
                        {strategy.name}
                      </CardTitle>
                      <Badge variant="outline" className={getRiskColor(strategy.riskLevel)}>
                        {strategy.riskLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>

                    {/* APY Display */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expected APY:</span>
                      <span className="text-lg font-bold text-eboy-green">
                        {strategy.expectedApy}%
                      </span>
                    </div>

                    {/* Protocols */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Protocols:</span>
                      <div className="flex flex-wrap gap-1">
                        {strategy.protocols.slice(0, 3).map((protocol) => (
                          <Badge key={protocol} variant="secondary" className="text-xs">
                            {protocol}
                          </Badge>
                        ))}
                        {strategy.protocols.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{strategy.protocols.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Biblical Basis */}
                    <div className="p-3 bg-ancient-gold/10 rounded-lg border border-ancient-gold/30">
                      <p className="text-xs italic text-muted-foreground">
                        📖 {strategy.biblicalBasis.principle}
                      </p>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        executeStrategy(strategy);
                      }}
                      disabled={isLoading}
                      className="w-full bg-eboy-green hover:bg-eboy-green/90 text-black"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Activate Strategy
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Strategy Details */}
          <AnimatePresence>
            {selectedStrategy && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-gradient-to-r from-ancient-purple/10 to-indigo-600/10 border-ancient-purple/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-ancient-gold">
                      {selectedStrategy.name} - Detailed View
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Biblical Verses */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Biblical Foundation:</h4>
                      {selectedStrategy.biblicalBasis.verses.map((verse, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="font-medium text-sm text-ancient-gold mb-1">
                            {verse.reference}
                          </p>
                          <p className="text-sm italic">"{verse.text}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Strategy Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-eboy-green">
                          {selectedStrategy.expectedApy}%
                        </div>
                        <div className="text-xs text-muted-foreground">Expected APY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-ancient-gold">
                          ${selectedStrategy.minimumInvestment}
                        </div>
                        <div className="text-xs text-muted-foreground">Min Investment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {selectedStrategy.maxAllocation}%
                        </div>
                        <div className="text-xs text-muted-foreground">Max Allocation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {selectedStrategy.rebalanceFrequency}
                        </div>
                        <div className="text-xs text-muted-foreground">Rebalance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-ancient-gold" />
                Biblical Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Discover your God-given approach to stewardship and investment through biblical wisdom.
              </p>

              <Button
                onClick={handleRiskAssessment}
                disabled={isLoading}
                className="w-full bg-ancient-gold hover:bg-ancient-gold/90 text-black"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Assessing...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Begin Assessment
                  </>
                )}
              </Button>

              {/* Assessment Results */}
              <AnimatePresence>
                {riskAssessment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-gradient-to-r from-eboy-green/10 to-ancient-gold/10 rounded-lg border border-eboy-green/30">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-eboy-green" />
                        Your Biblical Profile: {riskAssessment.overall.toUpperCase()}
                      </h4>
                      <p className="text-sm italic text-muted-foreground mb-3">
                        "{riskAssessment.scriptureGuidance}"
                      </p>
                    </div>

                    {/* Factors */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(riskAssessment.factors).map(([factor, score]) => (
                        <div key={factor} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{factor}</span>
                            <span className="text-sm text-muted-foreground">{score}/10</span>
                          </div>
                          <Progress value={score * 10} className="h-2" />
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Recommendations:</h4>
                      {riskAssessment.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-ancient-gold mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-eboy-green" />
                Biblical Portfolio Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete your risk assessment to see personalized portfolio recommendations
                </p>
                {!riskAssessment && (
                  <Button
                    onClick={() => handleRiskAssessment()}
                    variant="outline"
                    className="mt-4"
                  >
                    Start Assessment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BiblicalStrategiesDashboard;