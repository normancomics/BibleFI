
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, BookOpen, TrendingUp, Wallet } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { enhancedBiblicalAdvisorService } from '@/services/enhancedBiblicalAdvisor';

interface RelevantVerse {
  reference: string;
  text: string;
  similarity: number;
}

interface AdvisorResponse {
  answer: string;
  relevantScriptures: RelevantVerse[];
  biblicalPrinciples: string[];
}

const EnhancedBiblicalAdvisor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletContext, setWalletContext] = useState<any>(null);
  const { playSound } = useSound();

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    playSound('select');

    try {
      // Get enhanced biblical advice with potential wallet context
      const advisorResponse = await enhancedBiblicalAdvisorService.getEnhancedBiblicalAdvice(
        query,
        walletContext
      );
      
      setResponse(advisorResponse);
      playSound('success');
    } catch (error) {
      console.error('Error getting enhanced biblical advice:', error);
      playSound('error');
      
      // Show error state
      setResponse({
        answer: "I apologize, but I'm having trouble accessing the enhanced biblical knowledge system right now. Please try again later or contact support.",
        relevantScriptures: [],
        biblicalPrinciples: []
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWalletContext = () => {
    // Mock wallet context for demonstration
    setWalletContext({
      walletAddress: "0xb638831Adf73A08490f71a45E613Bb9045AccEFE",
      chainId: 8453,
      tokenBalances: {
        USDC: "1250.50",
        ETH: "0.75",
        DAI: "500.00"
      },
      defiPositions: [
        {
          protocol: "Superfluid",
          position: "USDC Stream",
          value: "100.00"
        }
      ]
    });
    playSound('coin');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <BookOpen size={24} />
            Enhanced Biblical Financial Advisor
            <Badge className="ml-auto bg-purple-600 text-white">RAG + MCP Enabled</Badge>
          </CardTitle>
          <p className="text-white/70 text-sm">
            Advanced biblical guidance powered by Retrieval Augmented Generation (RAG) and Model Context Protocol (MCP).
            Connect your wallet for personalized DeFi advice rooted in scripture.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!walletContext && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Enhanced Context Available</h4>
                    <p className="text-sm text-blue-700">
                      Connect wallet context for personalized biblical DeFi guidance
                    </p>
                  </div>
                  <Button 
                    onClick={connectWalletContext}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Wallet size={16} className="mr-2" />
                    Connect Context
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {walletContext && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-green-600" />
                  <span className="text-green-800 font-medium">Enhanced Context Active</span>
                  <Badge className="bg-green-100 text-green-800">
                    Base Chain • {walletContext.walletAddress.substring(0, 8)}...
                  </Badge>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  USDC: ${walletContext.tokenBalances.USDC} • ETH: {walletContext.tokenBalances.ETH}
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-ancient-gold">Your Financial Question</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about investing, tithing, debt management, DeFi strategies, or any financial matter..."
              className="min-h-[100px] bg-black/20 border-ancient-gold/30 text-white placeholder:text-white/50"
            />
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Seeking Enhanced Biblical Wisdom...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Get Enhanced Biblical Guidance
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <div className="space-y-4">
          {/* AI Advice */}
          <Card className="bg-purple-900/20 border-ancient-gold/30">
            <CardHeader>
              <CardTitle className="text-ancient-gold flex items-center gap-2">
                <TrendingUp size={20} />
                Enhanced Biblical Financial Guidance
                {walletContext && (
                  <Badge className="bg-purple-600 text-white">Context-Aware</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 leading-relaxed font-scroll whitespace-pre-line">
                {response.answer}
              </p>
            </CardContent>
          </Card>

          {/* Relevant Biblical Verses */}
          {response.relevantScriptures.length > 0 && (
            <Card className="bg-black/30 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold">Supporting Scripture (RAG Results)</CardTitle>
                <p className="text-white/70 text-sm">
                  These verses were selected using AI semantic search and similarity matching.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {response.relevantScriptures.map((verse, index) => (
                  <div key={index} className="border-l-4 border-ancient-gold pl-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-scroll text-ancient-gold font-semibold">
                        {verse.reference}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(verse.similarity * 100)}% relevance
                      </Badge>
                    </div>
                    <p className="text-white/90 italic font-scroll">
                      "{verse.text}"
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Biblical Principles Summary */}
          {response.biblicalPrinciples.length > 0 && (
            <Card className="bg-black/40 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold">Key Biblical Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {response.biblicalPrinciples.map((principle, index) => (
                    <Badge key={index} className="bg-purple-900/50 text-ancient-gold border-ancient-gold/30">
                      {principle}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Example Questions */}
      <Card className="bg-black/20 border-ancient-gold/20">
        <CardHeader>
          <CardTitle className="text-ancient-gold text-lg">Example Questions for Enhanced RAG System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "How should I approach DeFi investing with my current USDC balance?",
              "What does the Bible say about leveraged yield farming?",
              "How can I set up biblical tithing streams with Superfluid?",
              "Is my current DeFi portfolio allocation biblically wise?",
              "How do I balance generosity with wealth building on Base chain?",
              "What biblical principles apply to my current staking rewards?"
            ].map((example, index) => (
              <Button
                key={index}
                variant="ghost"
                className="text-left justify-start text-white/80 hover:text-ancient-gold hover:bg-purple-900/20"
                onClick={() => setQuery(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedBiblicalAdvisor;
