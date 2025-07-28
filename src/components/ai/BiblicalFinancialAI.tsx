import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Brain, TrendingUp, Heart, Lightbulb, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AIResponse {
  principle: string;
  scripture: string;
  reference: string;
  modernApplication: string;
  defiRelevance: string;
  actionSteps: string[];
  wisdomScore: number;
}

const mockResponses: AIResponse[] = [
  {
    principle: "Stewardship and Faithful Management",
    scripture: "Moreover, it is required of stewards that they be found faithful.",
    reference: "1 Corinthians 4:2",
    modernApplication: "Like the faithful steward, DeFi users should carefully manage their digital assets, understanding risks and opportunities while maintaining integrity in all transactions.",
    defiRelevance: "Apply this through diversified portfolios, regular monitoring of yield farming positions, and never investing more than you can afford to lose.",
    actionSteps: [
      "Set clear investment goals and risk tolerance",
      "Regularly review and rebalance your portfolio",
      "Use only reputable DeFi protocols",
      "Keep detailed records for tax purposes"
    ],
    wisdomScore: 85
  }
];

export const BiblicalFinancialAI = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const { toast } = useToast();

  const categories = [
    { id: 'general', name: 'General Wisdom', icon: BookOpen },
    { id: 'investing', name: 'Investing', icon: TrendingUp },
    { id: 'tithing', name: 'Tithing & Giving', icon: Heart },
    { id: 'defi', name: 'DeFi Strategy', icon: Brain },
    { id: 'taxes', name: 'Tax Wisdom', icon: Lightbulb }
  ];

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const response = mockResponses[0];
      setResponses([response, ...responses]);
      setQuestion('');
      setLoading(false);
      
      toast({
        title: "Wisdom Received",
        description: "Biblical financial wisdom has been generated based on your question.",
        duration: 3000,
      });
    }, 2000);
  };

  const quickQuestions = [
    "How should I approach DeFi investing as a Christian?",
    "What does the Bible say about wealth accumulation?",
    "How can I balance tithing with crypto investments?",
    "Biblical principles for risk management in DeFi",
    "Should Christians participate in yield farming?"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Biblical Financial AI Advisor</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get personalized financial guidance rooted in biblical wisdom. Ask questions about DeFi, investing, tithing, and more.
        </p>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Ask Your Financial Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: How should I approach cryptocurrency investing as a faithful steward?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !question.trim()}
            className="w-full"
          >
            {loading ? "Seeking Wisdom..." : "Get Biblical Guidance"}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {quickQuestions.map((q, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                onClick={() => setQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Responses */}
      <div className="space-y-6">
        {responses.map((response, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{response.principle}</CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Wisdom Score: {response.wisdomScore}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scripture */}
              <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-l-accent">
                <p className="italic text-foreground mb-2">"{response.scripture}"</p>
                <p className="text-sm text-muted-foreground">— {response.reference}</p>
              </div>

              {/* Modern Application */}
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Modern Application</h4>
                <p className="text-muted-foreground">{response.modernApplication}</p>
              </div>

              {/* DeFi Relevance */}
              <div>
                <h4 className="font-semibold mb-2 text-foreground">DeFi Application</h4>
                <p className="text-muted-foreground">{response.defiRelevance}</p>
              </div>

              {/* Action Steps */}
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Practical Steps</h4>
                <ul className="space-y-1">
                  {response.actionSteps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Study More
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Apply Strategy
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Share Wisdom
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};