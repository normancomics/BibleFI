
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, Heart, TrendingUp, BookOpen } from 'lucide-react';
import PixelCharacter from '@/components/PixelCharacter';

const TaxSavingTips: React.FC = () => {
  const taxTips = [
    {
      category: "Charitable Giving",
      icon: <Heart size={20} className="text-red-400" />,
      scripture: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. - 2 Corinthians 9:7",
      tips: [
        {
          tip: "Maximize charitable deductions through systematic tithing",
          description: "Document all tithes and offerings. Use Bible.fi's tithing streams for automatic records.",
          savings: "Up to 50% of AGI"
        },
        {
          tip: "Donate appreciated crypto directly",
          description: "Avoid capital gains tax while getting full deduction for market value.",
          savings: "15-20% capital gains tax savings"
        },
        {
          tip: "Bunch charitable contributions",
          description: "Group multiple years of giving into one tax year to exceed standard deduction.",
          savings: "Varies by income bracket"
        }
      ]
    },
    {
      category: "Crypto Tax Strategies",
      icon: <TrendingUp size={20} className="text-blue-400" />,
      scripture: "The plans of the diligent lead to profit as surely as haste leads to poverty. - Proverbs 21:5",
      tips: [
        {
          tip: "Strategic tax-loss harvesting",
          description: "Realize crypto losses to offset gains while maintaining exposure through different assets.",
          savings: "Up to $3,000 loss deduction annually"
        },
        {
          tip: "Long-term capital gains strategy",
          description: "Hold crypto investments for over one year to qualify for lower tax rates.",
          savings: "Up to 20% vs ordinary income rates"
        },
        {
          tip: "DeFi staking considerations",
          description: "Understand when staking rewards are taxable and plan accordingly.",
          savings: "Proper timing can defer taxes"
        }
      ]
    },
    {
      category: "Business & Ministry",
      icon: <FileText size={20} className="text-green-400" />,
      scripture: "The worker deserves his wages. - Luke 10:7",
      tips: [
        {
          tip: "Home office deduction for ministry",
          description: "Deduct portion of home used exclusively for ministry or religious business.",
          savings: "Percentage of home expenses"
        },
        {
          tip: "Religious education expenses",
          description: "Deduct seminary, theological courses, and ministry training costs.",
          savings: "Up to $4,000 in education credits"
        },
        {
          tip: "Ministry travel and equipment",
          description: "Deduct legitimate ministry-related travel, equipment, and supplies.",
          savings: "100% of qualifying expenses"
        }
      ]
    },
    {
      category: "Biblical Stewardship",
      icon: <BookOpen size={20} className="text-purple-400" />,
      scripture: "Whoever can be trusted with very little can also be trusted with much. - Luke 16:10",
      tips: [
        {
          tip: "Retirement account contributions",
          description: "Maximize tax-deferred retirement savings while practicing biblical planning.",
          savings: "Current year tax deduction"
        },
        {
          tip: "Health Savings Account (HSA)",
          description: "Triple tax advantage: deductible, grows tax-free, tax-free withdrawals for medical.",
          savings: "Immediate deduction + future tax-free growth"
        },
        {
          tip: "Qualified Small Business Stock",
          description: "Invest in qualifying small businesses for potential tax-free gains.",
          savings: "Up to $10M or 10x basis tax-free"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="text-ancient-gold flex items-center gap-2">
            <DollarSign size={24} />
            Biblical Tax-Saving Wisdom
          </CardTitle>
          <p className="text-white/70">
            Practical strategies rooted in biblical principles to minimize your tax burden while honoring God and Caesar.
          </p>
        </CardHeader>
      </Card>

      {taxTips.map((category, categoryIndex) => (
        <Card key={categoryIndex} className="bg-black/40 border-ancient-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-ancient-gold">
              {category.icon}
              {category.category}
            </CardTitle>
            <div className="bg-black/20 p-3 rounded-md border border-ancient-gold/20">
              <p className="text-white/90 italic text-sm font-scroll">
                "{category.scripture}"
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.tips.map((tip, tipIndex) => (
              <div key={tipIndex} className="bg-black/20 p-4 rounded-lg border border-ancient-gold/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{tip.tip}</h4>
                  <Badge className="bg-green-600 text-white">
                    {tip.savings}
                  </Badge>
                </div>
                <p className="text-white/80 text-sm">{tip.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="bg-black/40 border-ancient-gold/30">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <PixelCharacter 
              character="solomon" 
              message="Remember: True wealth comes from wisdom and righteousness, not from avoiding taxes through questionable means." 
              size="md"
              soundEffect={true}
            />
          </div>
          <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">Important Disclaimer</h4>
            <p className="text-white/80 text-sm">
              This information is for educational purposes and should not replace professional tax advice. 
              Always consult with a qualified tax professional for your specific situation. 
              Bible.fi promotes biblical stewardship and legal tax optimization strategies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxSavingTips;
