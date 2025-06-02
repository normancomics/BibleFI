
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PixelCharacter from '@/components/PixelCharacter';

const BiblicalTaxAdvisor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const taxAdvice = [
    {
      question: "How should I handle crypto gains from a biblical perspective?",
      answer: "The Bible teaches us to be honest in all our dealings (Proverbs 11:1). Report all your crypto gains accurately, as Jesus said 'Render unto Caesar what is Caesar's' (Matthew 22:21). Consider setting aside money for taxes immediately when you realize gains, following the principle of the wise who prepare for the future (Proverbs 21:20)."
    },
    {
      question: "Should I use tax optimization strategies?",
      answer: "Using legal tax strategies aligns with biblical wisdom about stewardship. The parable of the talents (Matthew 25:14-30) shows God expects us to be wise with resources. However, avoid any strategies that involve deception or dishonesty (Proverbs 16:11). Tax-loss harvesting and holding periods are legitimate tools for wise stewardship."
    },
    {
      question: "How much should I set aside for taxes?",
      answer: "Like Joseph saving during the seven years of plenty (Genesis 41:29-30), prepare for tax season by setting aside 25-40% of crypto gains depending on your tax bracket. 'The wise store up choice food and olive oil, but fools gulp theirs down' (Proverbs 21:20). Consider this as faithful stewardship of God's provision."
    }
  ];

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Please enter a question",
        description: "Ask about crypto taxes, biblical financial principles, or tax strategies",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find relevant advice or provide general guidance
    const relevantAdvice = taxAdvice.find(advice => 
      question.toLowerCase().includes('gains') ? advice.question.includes('gains') :
      question.toLowerCase().includes('strategy') ? advice.question.includes('strategies') :
      question.toLowerCase().includes('set aside') || question.toLowerCase().includes('save') ? advice.question.includes('set aside') :
      taxAdvice[0]
    );
    
    setResponse(relevantAdvice.answer);
    setIsLoading(false);
    setQuestion('');
    
    toast({
      title: "Biblical Tax Guidance Provided",
      description: "Review the advice based on scriptural principles",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-scripture/30 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-ancient-gold" />
            Biblical Tax AI Advisor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <PixelCharacter 
              character="solomon" 
              message="Ask me about crypto taxes and biblical financial wisdom!" 
              size="md"
              soundEffect={true}
            />
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Ask about crypto tax strategies, biblical principles for taxes, or specific tax situations..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            
            <Button 
              onClick={handleAskQuestion}
              disabled={isLoading}
              className="w-full bg-scripture hover:bg-scripture/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Consulting Scripture...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get Biblical Tax Guidance
                </>
              )}
            </Button>
          </div>

          {response && (
            <div className="mt-6 p-4 bg-black/50 rounded-lg border border-ancient-gold/30">
              <h3 className="font-medium text-ancient-gold mb-2">Biblical Tax Guidance:</h3>
              <p className="text-white/90 text-sm leading-relaxed">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-scripture/30 bg-black/40">
        <CardHeader>
          <CardTitle>Common Tax Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taxAdvice.map((advice, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left justify-start h-auto p-4 border border-scripture/20 hover:bg-scripture/20"
                onClick={() => {
                  setQuestion(advice.question);
                  setResponse(advice.answer);
                }}
              >
                <div>
                  <div className="font-medium text-ancient-gold text-sm">{advice.question}</div>
                  <div className="text-white/60 text-xs mt-1">Click to see biblical guidance</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiblicalTaxAdvisor;
