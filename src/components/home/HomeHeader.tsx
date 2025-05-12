
import React from "react";
import PixelButton from "@/components/PixelButton";
import { ExternalLink, Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { GlowingText } from "@/components/ui/tailwind-extensions";

const HomeHeader: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();
  const { toast } = useToast();
  
  const handleOpenFarcaster = () => {
    setUserInteracted(true);
    playSound("select");
    toast({
      title: "Farcaster Integration",
      description: "Opening Bible.fi mini-app in Farcaster...",
    });
    
    // For now, we'll just open the Frame HTML page
    window.open("/frame.html", "_blank");
  };
  
  const handleSoundToggle = () => {
    toggleSound();
    setUserInteracted(true);
    
    if (!isSoundEnabled) {
      // Try to play a sound when enabling
      setTimeout(() => playSound("click"), 100);
    }
  };
  
  return (
    <section className="text-center mb-12 animate-fade-in">
      <div className="mb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl md:text-6xl font-scroll font-bold mb-2">
            <GlowingText color="gold">Bible.fi</GlowingText>
          </div>
          <div className="text-lg md:text-xl font-scroll text-ancient-gold opacity-80">
            Biblical Wisdom for Financial Stewardship
          </div>
        </div>
      </div>
      
      <p className="text-xl max-w-2xl mx-auto mb-6 font-scroll">
        Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 mb-6">
        <PixelButton 
          onClick={handleOpenFarcaster}
          className="inline-flex items-center px-6 py-3 text-lg font-scroll"
        >
          <ExternalLink size={20} className="mr-2" />
          Open in Farcaster
        </PixelButton>
        
        <Button
          onClick={handleSoundToggle}
          variant="outline"
          className="flex items-center gap-2 border-2 border-ancient-gold/50 bg-black/50 hover:bg-black/70 font-scroll"
        >
          {isSoundEnabled ? (
            <>
              <Volume2 size={18} className="text-ancient-gold" />
              <span>Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX size={18} className="text-gray-400" />
              <span>Sound OFF</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="text-sm text-white/70 mt-2 font-scroll">
        <p>Using iPad/iOS? Tap any sound button to enable audio</p>
      </div>
    </section>
  );
};

export default HomeHeader;
