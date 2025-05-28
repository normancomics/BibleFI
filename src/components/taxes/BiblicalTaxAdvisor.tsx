
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calculator, FileText, Heart, TrendingDown } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { enhancedBiblicalAdvisorService } from '@/services/enhancedBiblicalAdvisor';

interface TaxAdviceResponse {
  answer: string;
  relevantScriptures: Array<{
    reference: string;
    text: string;
    similarity: number;
  }>;
  biblicalPrinciples: string[];
  taxSavingStrategies: Array<{
    strategy: string;
    biblicalBasis: string;
    potentialSavings: string;
    implementation: string;
  }>;
}

const BiblicalTaxAdvisor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<TaxAdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { playSound } = useSound();

  const handleTaxAdviceRequest = async () => {
    if (!query.trim()) return;

    setLoading(true);
    playSound('select');

    try {
      // Get enhanced biblical advice for tax matters
      const advisorResponse = await enhancedBiblicalAdvisorService.getEnhancedBiblicalAdvice(
        `Tax advice: ${query}`,
        {
          walletAddress: "0xb638831Adf73A08490f71a45E613Bb9045AccEFE",
          chainId: 8453,
          tokenBalances: { USDC: "1000", ETH: "0.5" }
        }
      );
      
      // Generate tax-specific strategies based on biblical principles
      const taxStrategies = generateBiblicalTaxStrategies(query, advisorResponse);
      
      setResponse({
        ...advisorResponse,
        taxSavingStrategies: taxStrategies
      });
      
      playSound('success');
    } catch (error) {
      console.error('Error getting biblical tax advice:', error);
      playSound('error');
      
      setResponse({
        answer: "I'm having trouble accessing the tax guidance system. Please try again later.",
        relevantScriptures: [],
        biblicalPrinciples: [],
        taxSavingStrategies: []
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBiblicalTaxStrategies = (query: string, advisorResponse: any) => {
    const strategies = [];
    
    // Tithing and charitable deductions
    strategies.push({
      strategy: "Maximize Charitable Deductions Through Tithing",
      biblicalBasis: "Honor the LORD with your wealth, with the firstfruits of all your crops. - Proverbs 3:9",
      potentialSavings: "Up to 50% of AGI in charitable deductions",
      implementation: "Document all tithes, offerings, and charitable crypto donations. Use Bible.fi's tithing tracking for accurate records."
    });

    // Business expenses for ministry
    if (query.toLowerCase().includes('business') || query.toLowerCase().includes('ministry')) {
      strategies.push({
        strategy: "Ministry and Business Expense Deductions",
        biblicalBasis: "The worker deserves his wages. - Luke 10:7",
        potentialSavings: "Varies based on legitimate business expenses",
        implementation: "Deduct expenses for ministry work, religious education, and faith-based business activities."
      });
    }

    // Crypto tax strategies
    strategies.push({
      strategy: "Tax-Loss Harvesting on Crypto Holdings",
      biblicalBasis: "The plans of the diligent lead to profit as surely as haste leads to poverty. - Proverbs 21:5",
      potentialSavings: "Offset gains with up to $3,000 in losses annually",
      implementation: "Strategically realize crypto losses to offset gains, while maintaining your DeFi positions through tax-efficient methods."
    });

    // Education deductions
    strategies.push({
      strategy: "Educational Deductions for Biblical Studies",
      biblicalBasis: "The wise store up knowledge, but the mouth of a fool invites ruin. - Proverbs 10:14",
      potentialSavings: "Up to $4,000 in education deductions or credits",
      implementation: "Deduct seminary, theological education, and religious study expenses that enhance your ministry or spiritual growth."
    });

    return strategies;
  };

  const presetQuestions = [
    "How can I properly report my crypto tithing for tax deductions?",
    "What biblical principles apply to tax-loss harvesting?",
    "How should I handle taxes on DeFi staking rewards biblically?",
    "What charitable deduction strategies align with biblical giving?",
    "How can I minimize crypto taxes while honoring Caesar?",
    "What expenses can I deduct for ministry and religious activities?"
  ];

  return (
    <Card className="bg-black/40 border-ancient-gold/30 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ancient-gold">
          <Calculator size={24} />
          Biblical Tax Wisdom & Strategies
          <Badge className="ml-auto bg-green-600 text-white">RAG + MCP Enhanced</Badge>
        </CardTitle>
        <p className="text-white/70 text-sm">
          Get AI-powered biblical guidance for tax optimization while honoring both God and Caesar.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-ancient-gold">Your Tax Question</label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about charitable deductions, crypto taxes, business expenses, or any tax matter..."
            className="min-h-[80px] bg-black/20 border-ancient-gold/30 text-white placeholder:text-white/50"
          />
        </div>
        
        <Button 
          onClick={handleTaxAdviceRequest}
          disabled={loading || !query.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Biblical Tax Wisdom...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Get Tax-Saving Guidance
            </>
          )}
        </Button>

        {/* Preset Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
          {presetQuestions.map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              className="text-left justify-start text-white/80 hover:text-ancient-gold hover:bg-green-900/20 text-xs p-2 h-auto"
              onClick={() => setQuery(question)}
            >
              {question}
            </Button>
          ))}
        </div>

        {response && (
          <div className="space-y-4 mt-6">
            {/* AI Tax Advice */}
            <Card className="bg-green-900/20 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold flex items-center gap-2">
                  <FileText size={20} />
                  Biblical Tax Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 leading-relaxed font-scroll whitespace-pre-line">
                  {response.answer}
                </p>
              </CardContent>
            </Card>

            {/* Tax Saving Strategies */}
            {response.taxSavingStrategies.length > 0 && (
              <Card className="bg-black/30 border-green-600/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <TrendingDown size={20} />
                    Biblical Tax-Saving Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {response.taxSavingStrategies.map((strategy, index) => (
                    <div key={index} className="border-l-4 border-green-400 pl-4 space-y-2">
                      <h4 className="font-semibold text-green-300">{strategy.strategy}</h4>
                      <p className="text-white/90 text-sm italic">
                        Biblical Basis: "{strategy.biblicalBasis}"
                      </p>
                      <div className="bg-green-900/20 p-3 rounded-md">
                        <p className="text-white/80 text-sm">
                          <strong>Potential Savings:</strong> {strategy.potentialSavings}
                        </p>
                        <p className="text-white/80 text-sm mt-1">
                          <strong>Implementation:</strong> {strategy.implementation}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Supporting Scripture */}
            {response.relevantScriptures.length > 0 && (
              <Card className="bg-black/30 border-ancient-gold/30">
                <CardHeader>
                  <CardTitle className="text-ancient-gold">Supporting Scripture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {response.relevantScriptures.map((verse, index) => (
                    <div key={index} className="border-l-4 border-ancient-gold pl-4">
                      <h4 className="font-scroll text-ancient-gold font-semibold">
                        {verse.reference}
                      </h4>
                      <p className="text-white/90 italic font-scroll">
                        "{verse.text}"
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Biblical Principles */}
            {response.biblicalPrinciples.length > 0 && (
              <Card className="bg-black/40 border-ancient-gold/30">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <Heart size={20} />
                    Key Biblical Principles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {response.biblicalPrinciples.map((principle, index) => (
                      <Badge key={index} className="bg-green-900/50 text-ancient-gold border-ancient-gold/30">
                        {principle}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BiblicalTaxAdvisor;
