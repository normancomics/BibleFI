import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, Book, Brain, Star, Share2, Sparkles } from 'lucide-react';
import { getBiblicalFinancialGuidance } from '@/services/biblicalAdvisorService';
import { useToast } from '@/components/ui/use-toast';
import { useSound } from '@/contexts/SoundContext';
import PixelCharacter from '@/components/PixelCharacter';

interface Message {
  id: string;
  type: 'user' | 'advisor';
  content: string;
  timestamp: Date;
  scriptures?: Array<{ reference: string; text: string }>;
  defiSuggestions?: Array<{ protocol: string; action: string; rationale: string }>;
  wisdomScore?: number;
}

const EnhancedBiblicalAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWisdomScore, setCurrentWisdomScore] = useState(75);
  const { toast } = useToast();
  const { playSound } = useSound();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      id: 'welcome',
      type: 'advisor',
      content: 'Welcome! I am your Biblical Financial Advisor. I can help you understand biblical principles about money, investing, tithing, and stewardship. Ask me anything about financial wisdom from Scripture!',
      timestamp: new Date(),
      wisdomScore: 75
    }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new message is added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    playSound('scroll');

    try {
      const guidance = await getBiblicalFinancialGuidance({ query: input });
      
      // Calculate wisdom score based on question type
      const wisdomScore = calculateWisdomScore(input);
      setCurrentWisdomScore(wisdomScore);

      const advisorMessage: Message = {
        id: `advisor-${Date.now()}`,
        type: 'advisor',
        content: guidance.answer,
        timestamp: new Date(),
        scriptures: guidance.relevantScriptures,
        defiSuggestions: guidance.defiSuggestions,
        wisdomScore
      };

      setMessages(prev => [...prev, advisorMessage]);
      playSound('success');
    } catch (error) {
      console.error('Error getting guidance:', error);
      toast({
        title: 'Error',
        description: 'Failed to get biblical guidance. Please try again.',
        variant: 'destructive'
      });
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWisdomScore = (question: string): number => {
    const lowerQuestion = question.toLowerCase();
    let score = 75; // Base score

    // Increase score for wisdom-seeking questions
    if (lowerQuestion.includes('wisdom') || lowerQuestion.includes('guidance')) score += 10;
    if (lowerQuestion.includes('tithe') || lowerQuestion.includes('give')) score += 15;
    if (lowerQuestion.includes('steward') || lowerQuestion.includes('responsibility')) score += 10;
    if (lowerQuestion.includes('invest') && lowerQuestion.includes('wisely')) score += 5;
    
    return Math.min(100, score);
  };

  const shareMessage = (message: Message) => {
    if (message.type === 'advisor' && message.scriptures && message.scriptures.length > 0) {
      const scripture = message.scriptures[0];
      const shareText = `Biblical Financial Wisdom:\n\n"${scripture.text}"\n- ${scripture.reference}\n\n#BibleFi #BiblicalFinance`;
      
      window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`, '_blank');
      playSound('select');
    }
  };

  return (
    <Card className="h-[600px] flex flex-col border-gradient bg-black/20">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-ancient-gold/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <Brain className="w-5 h-5" />
            AI Biblical Financial Advisor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
              <Star className="w-3 h-3 mr-1" />
              Wisdom Score: {currentWisdomScore}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'advisor' && (
                  <Avatar className="w-8 h-8 border border-ancient-gold/30">
                    <AvatarImage src="/pixel-solomon.png" alt="Biblical Advisor" />
                    <AvatarFallback className="bg-purple-900/50 text-ancient-gold text-xs">BA</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100' 
                      : 'bg-purple-900/20 border border-purple-500/30 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.scriptures && message.scriptures.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Separator className="bg-ancient-gold/30" />
                        <div className="flex items-center gap-1 text-ancient-gold text-xs">
                          <Book className="w-3 h-3" />
                          Scripture References
                        </div>
                        {message.scriptures.map((scripture, index) => (
                          <div key={index} className="bg-black/30 p-2 rounded border border-ancient-gold/20">
                            <p className="text-xs italic text-white/80">"{scripture.text}"</p>
                            <p className="text-xs text-ancient-gold text-right mt-1">{scripture.reference}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.defiSuggestions && message.defiSuggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Separator className="bg-ancient-gold/30" />
                        <div className="flex items-center gap-1 text-ancient-gold text-xs">
                          <Sparkles className="w-3 h-3" />
                          DeFi Applications
                        </div>
                        {message.defiSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-green-900/20 p-2 rounded border border-green-500/30">
                            <div className="flex justify-between items-center mb-1">
                              <Badge className="bg-green-900/30 text-green-300 border-green-500/50 text-xs">
                                {suggestion.protocol}
                              </Badge>
                            </div>
                            <p className="text-xs text-white/80">{suggestion.action}</p>
                            <p className="text-xs text-white/60 mt-1">{suggestion.rationale}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/50">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.type === 'advisor' && message.scriptures && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareMessage(message)}
                          className="h-6 px-2 text-xs text-ancient-gold hover:bg-ancient-gold/20"
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {message.type === 'user' && (
                  <Avatar className="w-8 h-8 border border-blue-500/30">
                    <AvatarFallback className="bg-blue-900/50 text-blue-300 text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 border border-ancient-gold/30">
                  <AvatarImage src="/pixel-solomon.png" alt="Biblical Advisor" />
                  <AvatarFallback className="bg-purple-900/50 text-ancient-gold text-xs">BA</AvatarFallback>
                </Avatar>
                <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-ancient-gold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Seeking biblical wisdom...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-ancient-gold/20 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about biblical financial principles..."
              className="flex-1 bg-black/30 border-ancient-gold/30 text-white placeholder:text-white/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-ancient-gold/20 border border-ancient-gold/50 hover:bg-ancient-gold/30 text-ancient-gold"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-white/50 mt-2 text-center">
            Powered by biblical wisdom and AI • Share insights on Farcaster
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedBiblicalAdvisor;