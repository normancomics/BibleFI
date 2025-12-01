import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TITHING_VERSES, TAX_VERSES, LENDING_BORROWING_VERSES, STEWARDSHIP_VERSES, WEALTH_VERSES, JUSTICE_VERSES } from '@/services/comprehensiveBiblicalFinanceDatabase';

/**
 * Daily Scripture System
 * Shows a daily financial wisdom verse from the comprehensive biblical database
 */
const DailyScripture: React.FC = () => {
  const { toast } = useToast();
  const [dailyVerse, setDailyVerse] = useState<any>(null);

  // Get all verses
  const allVerses = [
    ...TITHING_VERSES,
    ...TAX_VERSES,
    ...LENDING_BORROWING_VERSES,
    ...STEWARDSHIP_VERSES,
    ...WEALTH_VERSES,
    ...JUSTICE_VERSES
  ];

  useEffect(() => {
    selectDailyVerse();
  }, []);

  const selectDailyVerse = () => {
    // Use date as seed for consistent daily verse
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = seed % allVerses.length;
    
    setDailyVerse(allVerses[index]);
  };

  const handleRefresh = () => {
    // Random verse
    const randomIndex = Math.floor(Math.random() * allVerses.length);
    setDailyVerse(allVerses[randomIndex]);
    
    toast({
      title: "New Verse Loaded",
      description: "Refreshed biblical wisdom",
    });
  };

  const handleShare = async () => {
    if (!dailyVerse) return;

    const shareText = `📖 ${dailyVerse.reference}\n\n"${dailyVerse.kjv}"\n\n💡 DeFi Application: ${dailyVerse.defiApplication}\n\n— Bible.fi`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Scripture - ${dailyVerse.reference}`,
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Share this wisdom with your community!",
      });
    }
  };

  if (!dailyVerse) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-ancient-gold/50">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-ancient-gold" />
            <h3 className="text-lg font-semibold text-ancient-gold">Daily Biblical Wisdom</h3>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              className="text-white/70 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="text-white/70 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-ancient-gold text-ancient-gold">
              {dailyVerse.reference}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-500 capitalize">
              {dailyVerse.category}
            </Badge>
          </div>

          <blockquote className="text-white text-base italic pl-4 border-l-4 border-ancient-gold">
            {dailyVerse.kjv}
          </blockquote>

          {dailyVerse.hebrew && (
            <p className="text-sm text-white/60 font-hebrew">
              Hebrew: {dailyVerse.hebrew}
            </p>
          )}

          {dailyVerse.greek && (
            <p className="text-sm text-white/60 font-greek">
              Greek: {dailyVerse.greek}
            </p>
          )}

          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              <span className="font-semibold">Biblical Principle:</span> {dailyVerse.principle}
            </p>
          </div>

          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              <span className="font-semibold">DeFi Application:</span> {dailyVerse.defiApplication}
            </p>
          </div>

          {dailyVerse.strongsNumbers && dailyVerse.strongsNumbers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dailyVerse.strongsNumbers.map((num: string) => (
                <Badge key={num} variant="secondary" className="text-xs">
                  Strong's {num}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyScripture;
