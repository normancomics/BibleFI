
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { useToast } from '@/hooks/use-toast';
import { useFarcasterAuth } from '@/farcaster/auth';
import PixelButton from '@/components/PixelButton';

const TitheAndShare: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const { user } = useFarcasterAuth();
  
  const handleShareToFarcaster = () => {
    playSound('select');
    
    if (!user) {
      toast({
        title: "Not Connected",
        description: "Please connect your Farcaster account first",
        variant: "destructive",
      });
      return;
    }
    
    const tithingVerse = "Honor the LORD with your wealth, with the firstfruits of all your crops. - Proverbs 3:9";
    const text = `"${tithingVerse}"\n\nI just tithed through BibleFi - Biblical wisdom for financial stewardship on Base Chain`;
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    
    window.open(shareUrl, '_blank');
  };
  
  const handleCreateFrame = () => {
    playSound('coin');
    
    toast({
      title: "Creating Frame",
      description: "Opening BibleFi Frame editor",
    });
    
    // Navigate to frame editor or preview
    window.open('/frame.html', '_blank');
  };

  return (
    <Card className="border-scripture/30 bg-black/30 overflow-hidden">
      <CardHeader className="bg-purple-900/30 pb-2">
        <CardTitle className="text-ancient-gold font-scroll">Share Your Tithing Journey</CardTitle>
        <CardDescription>Inspire others with your faithful stewardship</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-4">
          <p className="text-sm mb-4">
            "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven." - Matthew 5:16
          </p>
          
          <div className="bg-black/40 p-4 rounded-lg mb-4">
            <p className="text-ancient-gold/90 font-scroll text-sm italic">
              Sharing your tithing journey can inspire others to trust God with their finances and experience the blessings of faithful stewardship.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <PixelButton 
            onClick={handleShareToFarcaster}
            className="w-full flex items-center justify-center"
            farcasterStyle
          >
            <Share2 size={16} className="mr-2" />
            Share Tithing Testimony
          </PixelButton>
          
          <PixelButton
            variant="outline" 
            onClick={handleCreateFrame}
            className="w-full flex items-center justify-center"
          >
            <MessageCircle size={16} className="mr-2" />
            Create Tithing Frame
          </PixelButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default TitheAndShare;
