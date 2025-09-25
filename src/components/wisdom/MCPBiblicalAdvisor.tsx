import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Book, MessageSquare, Languages, Lightbulb } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mcpBiblicalServer, type BiblicalResponse } from '@/services/mcpBiblicalServer';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  response?: BiblicalResponse;
  timestamp: Date;
}

export const MCPBiblicalAdvisor: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [includeOriginalLanguages, setIncludeOriginalLanguages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "How much should I tithe according to the Bible?",
    "What does the Bible say about paying taxes?",
    "Should I lend money to family members?",
    "Is it wise to go into business with non-Christians?",
    "What does the Bible teach about borrowing money?",
    "How should I handle debt according to scripture?",
    "What is biblical stewardship?",
    "Should I give to the poor even if I'm struggling financially?"
  ];

  const topicCategories = [
    { value: 'tithing', label: 'Tithing & Giving', icon: '💰' },
    { value: 'taxes', label: 'Taxes & Government', icon: '🏛️' },
    { value: 'lending', label: 'Lending & Interest', icon: '🤝' },
    { value: 'borrowing', label: 'Borrowing & Debt', icon: '📋' },
    { value: 'business', label: 'Business & Partnerships', icon: '🏢' },
    { value: 'stewardship', label: 'Stewardship & Wisdom', icon: '🎯' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Determine the best MCP tool to use
      const toolName = determineToolName(input, selectedTopic);
      const params = buildToolParams(input, selectedTopic, includeOriginalLanguages);

      const response = await mcpBiblicalServer.callTool(toolName, params);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        response: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Biblical Guidance Received",
        description: `Found ${response.scriptures.length} relevant scriptures`,
      });

    } catch (error) {
      console.error('Error getting biblical guidance:', error);
      toast({
        title: "Error",
        description: "Failed to get biblical guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const determineToolName = (query: string, topic: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (topic === 'tithing' || lowerQuery.includes('tithe') || lowerQuery.includes('giving')) {
      return 'get_tithing_guidance';
    } else if (topic === 'taxes' || lowerQuery.includes('tax') || lowerQuery.includes('caesar')) {
      return 'get_tax_guidance';
    } else if (lowerQuery.includes('business') || lowerQuery.includes('partner')) {
      return 'get_business_partnership_guidance';
    } else {
      return 'search_biblical_financial_wisdom';
    }
  };

  const buildToolParams = (query: string, topic: string, includeOriginal: boolean): any => {
    const baseParams = {
      query,
      context: {
        topic: topic || undefined,
        includeOriginalLanguages: includeOriginal,
        versions: includeOriginal ? ['kjv', 'hebrew', 'greek', 'aramaic'] : ['kjv']
      }
    };

    // Add specific parameters based on question type
    if (query.toLowerCase().includes('business')) {
      return {
        ...baseParams,
        partnership_type: detectPartnershipType(query),
        business_nature: query
      };
    } else if (query.toLowerCase().includes('tithe')) {
      return {
        ...baseParams,
        situation: query,
        income_type: detectIncomeType(query)
      };
    } else if (query.toLowerCase().includes('tax')) {
      return {
        ...baseParams,
        tax_situation: query,
        jurisdiction: 'general'
      };
    }

    return baseParams;
  };

  const detectPartnershipType = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('family') || lowerQuery.includes('relative')) return 'family';
    if (lowerQuery.includes('christian') && lowerQuery.includes('non')) return 'non_christian';
    if (lowerQuery.includes('christian')) return 'christian';
    return 'mixed_faith';
  };

  const detectIncomeType = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('salary') || lowerQuery.includes('wage')) return 'salary';
    if (lowerQuery.includes('business') || lowerQuery.includes('profit')) return 'business';
    if (lowerQuery.includes('investment') || lowerQuery.includes('dividend')) return 'investment';
    if (lowerQuery.includes('gift') || lowerQuery.includes('bonus')) return 'gifts';
    if (lowerQuery.includes('inheritance')) return 'inheritance';
    return 'salary';
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const formatScripture = (scripture: any) => {
    return (
      <div className="space-y-3 p-4 bg-card/30 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-ancient-gold">{scripture.reference}</h4>
          <Badge variant="outline" className="text-xs">
            {scripture.financial_principle}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">King James Version:</p>
            <p className="text-white/90 italic text-sm leading-relaxed">
              "{scripture.kjv_text}"
            </p>
          </div>
          
          {includeOriginalLanguages && scripture.hebrew_text && (
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Hebrew:</p>
              <p className="text-yellow-400 text-sm font-hebrew">
                {scripture.hebrew_text}
              </p>
            </div>
          )}
          
          {includeOriginalLanguages && scripture.greek_text && (
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Greek:</p>
              <p className="text-blue-400 text-sm font-greek">
                {scripture.greek_text}
              </p>
            </div>
          )}
          
          {scripture.original_words && scripture.original_words.length > 0 && (
            <div>
              <p className="text-sm font-medium text-white/80 mb-2">Key Original Words:</p>
              <div className="flex flex-wrap gap-2">
                {scripture.original_words.slice(0, 3).map((word: any, idx: number) => (
                  <div key={idx} className="bg-primary/20 p-2 rounded text-xs">
                    <p className="font-bold text-ancient-gold">{word.word}</p>
                    <p className="text-white/70">{word.meaning}</p>
                    {word.strong_number && (
                      <p className="text-blue-400">{word.strong_number}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">Modern Application:</p>
            <p className="text-green-400 text-sm">
              {scripture.modern_application}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-ancient-gold/10 to-transparent border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <Book className="w-6 h-6" />
            MCP Biblical Financial Advisor
          </CardTitle>
          <p className="text-white/70">
            Get biblical guidance on financial matters with original Hebrew, Greek, and Aramaic insights
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Topic Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topicCategories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedTopic === category.value ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedTopic(category.value)}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Options</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeOriginalLanguages}
                  onChange={(e) => setIncludeOriginalLanguages(e.target.checked)}
                  className="rounded"
                />
                <span>Include Original Languages</span>
                <Languages className="w-4 h-4" />
              </label>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.slice(0, 4).map((question, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start text-xs h-auto p-2"
                  onClick={() => handleQuickQuestion(question)}
                >
                  <Lightbulb className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="break-words">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="bg-card/50 border-primary/20 h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Biblical Guidance Chat
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-white/60 py-8">
                      <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Ask me any biblical financial question</p>
                      <p className="text-xs mt-2">I'll provide scripture-based guidance with original language insights</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card border border-primary/20'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        
                        {message.response && (
                          <div className="mt-4 space-y-4">
                            <Separator />
                            
                            {/* Scriptures */}
                            <div className="space-y-3">
                              <h4 className="font-bold text-ancient-gold text-sm">
                                Related Scriptures ({message.response.scriptures.length})
                              </h4>
                              {message.response.scriptures.map((scripture, idx) => (
                                <div key={idx}>
                                  {formatScripture(scripture)}
                                </div>
                              ))}
                            </div>
                            
                            {/* Guidance */}
                            {message.response.guidance && (
                              <div className="space-y-2">
                                <h4 className="font-bold text-ancient-gold text-sm">Biblical Guidance</h4>
                                <div className="bg-green-500/10 p-3 rounded border border-green-500/30">
                                  <p className="text-sm font-medium text-green-400">
                                    {message.response.guidance.primary_principle}
                                  </p>
                                  {message.response.guidance.practical_steps.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-white/70 mb-1">Practical Steps:</p>
                                      <ul className="text-xs text-white/90 space-y-1">
                                        {message.response.guidance.practical_steps.map((step, idx) => (
                                          <li key={idx}>• {step}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Related Topics */}
                            {message.response.related_topics.length > 0 && (
                              <div>
                                <h4 className="font-bold text-ancient-gold text-sm mb-2">Related Topics</h4>
                                <div className="flex flex-wrap gap-1">
                                  {message.response.related_topics.map((topic, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-primary/20 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm">Searching biblical wisdom...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-primary/20">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about tithing, taxes, lending, business partnerships..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !input.trim()}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MCPBiblicalAdvisor;