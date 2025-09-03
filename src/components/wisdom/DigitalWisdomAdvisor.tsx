import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, BookOpen, Zap, DollarSign } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { supabase } from '@/integrations/supabase/client';

interface WisdomResponse {
  answer: string;
  scripture_references: Array<{
    reference: string;
    verse_text: string;
    principle: string;
    application: string;
  }>;
  practical_steps: string[];
  defi_applications: string[];
}

const DigitalWisdomAdvisor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<WisdomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { playSound } = useSound();

  const handleGetWisdom = async () => {
    if (!question.trim()) return;

    setLoading(true);
    playSound('select');

    try {
      // Search the comprehensive biblical knowledge base
      const { data: wisdomData, error } = await supabase
        .from('comprehensive_biblical_knowledge')
        .select('*')
        .or(`verse_text.ilike.%${question}%,category.ilike.%${question}%,principle.ilike.%${question}%,application.ilike.%${question}%`)
        .limit(5);

      if (error) throw error;

      // Generate comprehensive response
      const wisdomResponse = await generateWisdomResponse(question, wisdomData || []);
      setResponse(wisdomResponse);
      playSound('success');
      
    } catch (error) {
      console.error('Error getting biblical wisdom:', error);
      playSound('error');
      
      // Provide fallback biblical wisdom
      setResponse({
        answer: `Thank you for seeking biblical wisdom about "${question}". While I'm having technical difficulties accessing the full database right now, remember that Proverbs 3:5-6 tells us to "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." Seek wise counsel from scripture and godly advisors for your financial decisions.`,
        scripture_references: [
          {
            reference: "Proverbs 3:5-6",
            verse_text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
            principle: "God's wisdom surpasses human understanding",
            application: "Seek God's guidance in all financial decisions through prayer and scripture study"
          }
        ],
        practical_steps: [
          "Pray about your financial decision",
          "Seek counsel from wise, godly advisors",
          "Study relevant biblical principles",
          "Make decisions that honor God"
        ],
        defi_applications: [
          "Research protocols thoroughly before investing",
          "Never invest more than you can afford to lose",
          "Consider the ethical implications of DeFi projects"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWisdomResponse = async (query: string, biblicalData: any[]): Promise<WisdomResponse> => {
    // Enhanced response generation based on comprehensive biblical data
    const relevantVerses = biblicalData.slice(0, 3);
    
    let answer = "";
    let practicalSteps: string[] = [];
    let defiApplications: string[] = [];

    if (query.toLowerCase().includes('tithe') || query.toLowerCase().includes('tithing')) {
      answer = `According to biblical teaching, tithing is a fundamental principle of honoring God with our finances. Malachi 3:10 commands us to "bring the whole tithe into the storehouse," which represents giving 10% of our income to support God's work through the local church. This isn't merely a suggestion—it's presented as a test of our faith and trust in God's provision.

The Bible presents tithing as the starting point of biblical giving, not the ceiling. Proverbs 3:9-10 teaches us to "honor the Lord with your wealth, with the firstfruits of all your crops," emphasizing that God should receive the first and best of our income, not what's left over.

In the context of DeFi and cryptocurrency earnings, this principle remains unchanged. Whether your income comes from traditional employment, business ventures, or DeFi yield farming, the biblical mandate is to give the first 10% to God through your local church.`;

      practicalSteps = [
        "Calculate 10% of your gross income (before taxes and expenses)",
        "Give to your local church consistently, not when convenient",
        "Set up automatic transfers if possible to ensure consistency",
        "Start with current income level, even if small",
        "Trust God's promise of blessing for obedient tithing"
      ];

      defiApplications = [
        "Use Superfluid streams to automate tithing from DeFi earnings",
        "Set up smart contracts to automatically tithe from yield farming rewards",
        "Consider converting crypto gains to stablecoins for easier church transfers",
        "Track DeFi earnings carefully for accurate tithe calculations",
        "Explore charitable DAOs if your church accepts crypto donations"
      ];
    } else {
      // Generate general biblical financial wisdom
      answer = `Biblical wisdom teaches us that all financial decisions should be grounded in stewardship, generosity, and trust in God's provision. ${relevantVerses.map(v => v.principle).join(' ')} Remember that true wealth comes from faithful stewardship of what God has entrusted to us, not from get-rich-quick schemes or risky speculation.`;

      practicalSteps = [
        "Seek God's guidance through prayer and scripture study",
        "Practice good stewardship with current resources",
        "Avoid debt that creates financial bondage",
        "Plan carefully before making major financial decisions"
      ];

      defiApplications = [
        "Research DeFi protocols thoroughly before investing",
        "Start with small amounts to test platforms",
        "Maintain emergency funds outside of DeFi",
        "Consider the ethical implications of protocols you support"
      ];
    }

    return {
      answer,
      scripture_references: relevantVerses.map(verse => ({
        reference: verse.reference,
        verse_text: verse.verse_text,
        principle: verse.principle,
        application: verse.application
      })),
      practical_steps: practicalSteps,
      defi_applications: defiApplications
    };
  };

  const exampleQuestions = [
    "How much should I tithe according to the Bible?",
    "What scripture talks about tithing?",
    "Should I tithe from my DeFi earnings?",
    "How do I set up automated biblical tithing?",
    "What does the Bible say about debt?",
    "Is it biblical to invest in cryptocurrency?",
    "How should I approach wealth building as a Christian?",
    "What are biblical principles for financial planning?"
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-black/40 border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-gold">
            <BookOpen size={24} />
            Bible.fi Digital Wisdom
            <Badge className="ml-auto bg-ancient-gold text-black font-semibold">AI-Enhanced</Badge>
          </CardTitle>
          <p className="text-white/80 text-sm">
            Get comprehensive biblical guidance for your financial questions, including detailed scripture references and practical DeFi applications.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ancient-gold">Ask Your Financial Question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: How much should I tithe according to the Bible? What scripture talks about tithing?"
              className="min-h-[100px] bg-black/20 border-ancient-gold/30 text-white placeholder:text-white/50 focus:border-ancient-gold"
            />
          </div>
          
          <Button 
            onClick={handleGetWisdom}
            disabled={loading || !question.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-ancient-gold hover:from-purple-700 hover:to-ancient-gold/90 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Seeking Biblical Wisdom...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Get Biblical Wisdom
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <div className="space-y-4">
          {/* Main Biblical Answer */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-black/40 border-ancient-gold/40">
            <CardHeader>
              <CardTitle className="text-ancient-gold flex items-center gap-2">
                <Zap size={20} />
                Biblical Financial Wisdom
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 leading-relaxed font-scroll whitespace-pre-line text-lg">
                {response.answer}
              </p>
            </CardContent>
          </Card>

          {/* Scripture References */}
          {response.scripture_references.length > 0 && (
            <Card className="bg-black/30 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold">Supporting Scripture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {response.scripture_references.map((scripture, index) => (
                  <div key={index} className="border-l-4 border-ancient-gold pl-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-scroll text-ancient-gold font-bold text-lg">
                        {scripture.reference}
                      </h4>
                    </div>
                    <p className="text-white/90 italic font-scroll text-lg leading-relaxed">
                      "{scripture.verse_text}"
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-ancient-gold font-medium">Principle:</span>
                        <p className="text-white/80 ml-2">{scripture.principle}</p>
                      </div>
                      <div>
                        <span className="text-ancient-gold font-medium">Application:</span>
                        <p className="text-white/80 ml-2">{scripture.application}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Practical Steps */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-black/30 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold text-lg">Practical Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {response.practical_steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-ancient-gold text-black text-sm font-bold flex items-center justify-center mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-white/90">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="text-ancient-gold text-lg flex items-center gap-2">
                  <DollarSign size={20} />
                  DeFi Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {response.defi_applications.map((application, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-white/90">{application}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Example Questions */}
      <Card className="bg-black/20 border-ancient-gold/20">
        <CardHeader>
          <CardTitle className="text-ancient-gold text-lg">Popular Biblical Financial Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQuestions.map((example, index) => (
              <Button
                key={index}
                variant="ghost"
                className="text-left justify-start text-white/80 hover:text-ancient-gold hover:bg-purple-900/20 p-3 h-auto whitespace-normal"
                onClick={() => setQuestion(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-black/20 border-yellow-600/30">
        <CardContent className="p-4">
          <p className="text-xs text-white/70 italic">
            <strong className="text-yellow-400">Important Disclaimer:</strong> Bible.fi provides biblical financial wisdom and DeFi guidance for educational purposes only. 
            We are not licensed financial advisors and this is not financial advice. Always consult with qualified financial professionals for significant financial decisions. 
            Never invest in DeFi with assets you are not willing to lose, as cryptocurrencies and DeFi protocols can be highly volatile and risky.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalWisdomAdvisor;