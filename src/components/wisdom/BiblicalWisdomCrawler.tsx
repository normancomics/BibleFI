import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, BookOpen, Check, AlertCircle } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { supabase } from '@/integrations/supabase/client';

interface CrawlerStats {
  totalVerses: number;
  processedVerses: number;
  categoriesFound: string[];
  keywordsExtracted: number;
}

const BiblicalWisdomCrawler: React.FC = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [crawlerStats, setCrawlerStats] = useState<CrawlerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { playSound } = useSound();

  const initializeBiblicalDatabase = async () => {
    setIsPopulating(true);
    setError(null);
    playSound('select');

    try {
      // Step 1: Comprehensive Biblical Financial Data
      const comprehensiveData = [
        // Tithing - The user's main concern
        {
          verse_text: "Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the Lord Almighty, and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.",
          reference: "Malachi 3:10",
          category: "tithing",
          principle: "Tithing demonstrates trust in God's provision and unlocks His blessings",
          application: "Set up automated 10% giving from your DeFi earnings to your local church",
          defi_relevance: "Use Superfluid streams or smart contracts to automate biblical tithing from yield farming profits",
          financial_keywords: ["tithe", "storehouse", "blessing", "provision", "firstfruits"]
        },
        {
          verse_text: "Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine.",
          reference: "Proverbs 3:9-10",
          category: "tithing",
          principle: "God should receive the first and best of our income, not the leftovers",
          application: "Tithe from gross income before any other financial allocations",
          defi_relevance: "Automatically tithe from DeFi rewards as soon as they're received, before reinvesting",
          financial_keywords: ["firstfruits", "honor", "wealth", "overflow", "priority"]
        },
        {
          verse_text: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap. For with the measure you use, it will be measured to you.",
          reference: "Luke 6:38",
          category: "giving",
          principle: "Generous giving activates God's principle of reciprocal blessing",
          application: "Go beyond the tithe with additional charitable giving as God prospers you",
          defi_relevance: "Reinvest a portion of DeFi gains into charitable DAOs and impact investing",
          financial_keywords: ["give", "measure", "generosity", "reciprocal", "blessing"]
        },
        // Debt Management
        {
          verse_text: "The rich rule over the poor, and the borrower is slave to the lender.",
          reference: "Proverbs 22:7",
          category: "debt",
          principle: "Debt creates financial bondage that limits freedom and choices",
          application: "Prioritize debt elimination before aggressive investing or speculation",
          defi_relevance: "Avoid excessive leverage in DeFi protocols that could lead to liquidation",
          financial_keywords: ["debt", "borrower", "lender", "slavery", "freedom"]
        },
        // Wealth Building
        {
          verse_text: "Dishonest money dwindles away, but whoever gathers money little by little makes it grow.",
          reference: "Proverbs 13:11",
          category: "wealth_building",
          principle: "Sustainable wealth comes from consistent, honest accumulation over time",
          application: "Use dollar-cost averaging and consistent investing rather than get-rich-quick schemes",
          defi_relevance: "Build DeFi positions gradually through regular contributions to stable yield protocols",
          financial_keywords: ["dishonest", "dwindles", "little by little", "grow", "patience"]
        },
        // Stewardship
        {
          verse_text: "Moreover, it is required in stewards that a man be found faithful.",
          reference: "1 Corinthians 4:2",
          category: "stewardship",
          principle: "God expects faithful management of the resources He entrusts to us",
          application: "Actively monitor and wisely manage all investments and financial decisions",
          defi_relevance: "Research protocols thoroughly, diversify across platforms, and practice good security",
          financial_keywords: ["steward", "faithful", "required", "management", "trust"]
        },
        // Wisdom and Planning
        {
          verse_text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
          reference: "Proverbs 21:5",
          category: "planning",
          principle: "Careful planning and diligence create prosperity, while hasty decisions cause loss",
          application: "Create detailed financial plans with clear goals and timelines",
          defi_relevance: "Research DeFi protocols thoroughly before investing; avoid FOMO-driven decisions",
          financial_keywords: ["plans", "diligent", "profit", "haste", "poverty"]
        },
        // Contentment
        {
          verse_text: "But godliness with contentment is great gain. For we brought nothing into the world, and we can take nothing out of it.",
          reference: "1 Timothy 6:6-7",
          category: "contentment",
          principle: "True wealth comes from contentment with God's provision, not endless accumulation",
          application: "Set reasonable financial goals and find satisfaction in progress, not perfection",
          defi_relevance: "Avoid the temptation to constantly chase higher yields; be content with sustainable returns",
          financial_keywords: ["contentment", "gain", "brought nothing", "take nothing"]
        },
        // Work Ethic
        {
          verse_text: "All hard work brings a profit, but mere talk leads only to poverty.",
          reference: "Proverbs 14:23",
          category: "work",
          principle: "Diligent work and action produce results; mere planning without execution fails",
          application: "Take consistent action on your financial plans rather than just talking about them",
          defi_relevance: "Actively manage DeFi positions and stay informed rather than set-and-forget approaches",
          financial_keywords: ["hard work", "profit", "talk", "poverty", "action"]
        },
        // Generosity
        {
          verse_text: "One person gives freely, yet gains even more; another withholds unduly, but comes to poverty.",
          reference: "Proverbs 11:24",
          category: "generosity",
          principle: "Generous giving often leads to greater blessing than hoarding",
          application: "Look for opportunities to give and help others even as you build wealth",
          defi_relevance: "Use DeFi gains to increase your capacity for charitable impact and community support",
          financial_keywords: ["gives freely", "gains more", "withholds", "poverty", "blessing"]
        },
        // Risk Management
        {
          verse_text: "In the house of the wise are stores of choice food and oil, but a foolish man devours all he has.",
          reference: "Proverbs 21:20",
          category: "risk_management",
          principle: "Wise people save and preserve resources while fools consume everything immediately",
          application: "Maintain emergency funds and diversify investments rather than risking everything",
          defi_relevance: "Don't put all funds into high-risk DeFi protocols; maintain stable reserves",
          financial_keywords: ["wise", "stores", "choice food", "foolish", "devours"]
        }
      ];

      setCrawlerStats({
        totalVerses: comprehensiveData.length,
        processedVerses: 0,
        categoriesFound: [],
        keywordsExtracted: 0
      });

      // Insert comprehensive biblical knowledge
      const { data, error } = await supabase
        .from('comprehensive_biblical_knowledge')
        .insert(comprehensiveData)
        .select();

      if (error) {
        console.error('Error inserting biblical knowledge:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Update stats
      const categories = [...new Set(comprehensiveData.map(d => d.category))];
      const totalKeywords = comprehensiveData.reduce((sum, d) => sum + d.financial_keywords.length, 0);

      setCrawlerStats({
        totalVerses: comprehensiveData.length,
        processedVerses: comprehensiveData.length,
        categoriesFound: categories,
        keywordsExtracted: totalKeywords
      });

      playSound('success');
      
    } catch (error) {
      console.error('Error initializing biblical database:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize biblical database');
      playSound('error');
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Card className="bg-black/40 border-ancient-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ancient-gold">
          <Database size={24} />
          Biblical Financial Wisdom Database
        </CardTitle>
        <p className="text-white/70 text-sm">
          Comprehensive scripture database optimized for financial guidance, tithing questions, and DeFi wisdom.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!crawlerStats && !isPopulating && (
          <div className="text-center py-8">
            <BookOpen size={48} className="mx-auto text-ancient-gold mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Initialize Biblical Knowledge Base</h3>
            <p className="text-white/70 mb-4">
              Load comprehensive biblical financial wisdom including detailed tithing guidance, stewardship principles, and DeFi applications.
            </p>
            <Button 
              onClick={initializeBiblicalDatabase}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Database className="w-4 h-4 mr-2" />
              Initialize Database
            </Button>
          </div>
        )}

        {isPopulating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-white">Populating biblical financial wisdom database...</span>
            </div>
            {crawlerStats && (
              <Progress 
                value={(crawlerStats.processedVerses / crawlerStats.totalVerses) * 100} 
                className="h-2"
              />
            )}
          </div>
        )}

        {crawlerStats && !isPopulating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400">
              <Check size={20} />
              <span className="font-medium">Biblical Database Initialized Successfully</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-ancient-gold">{crawlerStats.totalVerses}</div>
                <div className="text-sm text-white/70">Scripture Verses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ancient-gold">{crawlerStats.categoriesFound.length}</div>
                <div className="text-sm text-white/70">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ancient-gold">{crawlerStats.keywordsExtracted}</div>
                <div className="text-sm text-white/70">Keywords</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ancient-gold">100%</div>
                <div className="text-sm text-white/70">Coverage</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-ancient-gold">Available Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {crawlerStats.categoriesFound.map((category, index) => (
                  <Badge key={index} className="bg-purple-900/50 text-ancient-gold border-ancient-gold/30">
                    {category.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        <div className="text-xs text-white/50 italic mt-4 p-3 bg-black/20 rounded">
          <strong>Disclaimer:</strong> Bible.fi provides biblical financial wisdom and DeFi guidance for educational purposes. 
          We are not licensed financial advisors. Never invest assets you cannot afford to lose. 
          Cryptocurrencies and DeFi protocols are highly volatile and risky.
        </div>
      </CardContent>
    </Card>
  );
};

export default BiblicalWisdomCrawler;