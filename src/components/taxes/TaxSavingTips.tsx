
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Calendar, Receipt, BookOpen } from 'lucide-react';

const TaxSavingTips: React.FC = () => {
  const tips = [
    {
      title: "Hold for Long-Term Capital Gains",
      description: "Hold crypto assets for more than one year to qualify for lower long-term capital gains rates (0%, 15%, or 20% vs short-term rates up to 37%)",
      savings: "Up to 17% tax savings",
      difficulty: "Easy",
      biblical: "The wise store up choice food and olive oil, but fools gulp theirs down. - Proverbs 21:20",
      icon: Calendar
    },
    {
      title: "Tax-Loss Harvesting",
      description: "Sell losing crypto positions to offset gains from winning positions. Unlike stocks, crypto has no wash sale rule restrictions.",
      savings: "Varies by portfolio",
      difficulty: "Medium",
      biblical: "The simple believe anything, but the prudent give thought to their steps. - Proverbs 14:15",
      icon: TrendingDown
    },
    {
      title: "Keep Detailed Records",
      description: "Track all transactions, dates, costs, and fair market values. Good records can help you claim all legitimate deductions.",
      savings: "Avoid penalties",
      difficulty: "Easy",
      biblical: "Suppose one of you wants to build a tower. Won't you first sit down and estimate the cost? - Luke 14:28",
      icon: Receipt
    },
    {
      title: "Consider Charitable Giving",
      description: "Donate appreciated crypto directly to qualified charities to avoid capital gains tax while claiming a deduction for the full fair market value.",
      savings: "Double tax benefit",
      difficulty: "Medium",
      biblical: "Each of you should give what you have decided in your heart to give. - 2 Corinthians 9:7",
      icon: BookOpen
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-scroll text-ancient-gold mb-2">Biblical Tax Saving Strategies</h2>
        <p className="text-white/70">Wise stewardship principles applied to crypto taxation</p>
      </div>

      <div className="grid gap-6">
        {tips.map((tip, index) => {
          const IconComponent = tip.icon;
          return (
            <Card key={index} className="border-scripture/30 bg-black/40">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-scripture/20 rounded-lg">
                      <IconComponent className="h-5 w-5 text-ancient-gold" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getDifficultyColor(tip.difficulty)}>
                          {tip.difficulty}
                        </Badge>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          {tip.savings}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">{tip.description}</p>
                
                <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
                  <h4 className="font-medium text-ancient-gold mb-2">Biblical Wisdom:</h4>
                  <p className="italic text-white/80 text-sm">{tip.biblical}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-amber-500/30 bg-amber-500/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-medium text-amber-400 mb-2">Important Reminder</h3>
            <p className="text-amber-200/80 text-sm">
              "Plans fail for lack of counsel, but with many advisers they succeed." - Proverbs 15:22
              <br />
              Always consult with a qualified tax professional for your specific situation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxSavingTips;
