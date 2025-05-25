
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, BookOpen, TrendingUp } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';

interface RelevantVerse {
  id: string;
  verse_text: string;
  reference: string;
  category: string;
  principle: string;
  application: string;
  similarity: number;
}

interface AdvisorResponse {
  advice: string;
  relevant_verses: RelevantVerse[];
  biblical_principles: string[];
}

const EnhancedBiblicalAdvisor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { playSound } = useSound();

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    playSound('select');

    try {
      const response = await fetch('/api/biblical-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: {
            platform: 'farcaster_miniapp',
            chain: 'base',
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();
      setResponse(data);
      playSound('success');
    } catch (error) {
      console.error('Error getting biblical advice:', error);
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <BookOpen size={24} />
            RAG-Powered Biblical Financial Advisor
          </CardTitle>
          <p className="text-white/70 text-sm">
            Ask any financial question and receive guidance rooted in biblical wisdom, 
            enhanced with AI-powered verse retrieval and DeFi expertise.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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
                Seeking Biblical Wisdom...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Get Biblical Guidance
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
                Biblical Financial Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 leading-relaxed font-scroll">
                {response.advice}
              </p>
            </CardContent>
          </Card>

          {/* Relevant Biblical Verses */}
          {response.relevant_verses.length > 0 && (
            <Card className="bg-black/30 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold">Supporting Scripture</CardTitle>
                <p className="text-white/70 text-sm">
                  These verses were selected using AI semantic search based on your question.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {response.relevant_verses.map((verse, index) => (
                  <div key={verse.id} className="border-l-4 border-ancient-gold pl-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-scroll text-ancient-gold font-semibold">
                        {verse.reference}
                      </h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(verse.similarity * 100)}% match
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {verse.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-white/90 italic font-scroll">
                      "{verse.verse_text}"
                    </p>
                    {verse.principle && (
                      <p className="text-ancient-gold text-sm">
                        <strong>Principle:</strong> {verse.principle}
                      </p>
                    )}
                    {verse.application && (
                      <p className="text-white/80 text-sm">
                        <strong>Application:</strong> {verse.application}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Biblical Principles Summary */}
          {response.biblical_principles.length > 0 && (
            <Card className="bg-black/40 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold">Key Biblical Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {response.biblical_principles.map((principle, index) => (
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
          <CardTitle className="text-ancient-gold text-lg">Example Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "How should I approach DeFi investing as a Christian?",
              "What does the Bible say about debt and leverage?",
              "How can I tithe from my crypto earnings?",
              "Is yield farming considered usury?",
              "How do I balance generosity with wealth building?",
              "What biblical principles apply to risk management?"
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
