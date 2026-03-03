
import React from "react";
import PixelButton from "@/components/PixelButton";
import { ExternalLink, Volume2, VolumeX, ArrowUpRight } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const HomeHeader: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();
  const { toast } = useToast();
  
  const handleOpenFarcaster = () => {
    setUserInteracted(true);
    playSound("select");
    toast({
      title: "Farcaster Integration",
      description: "Opening BibleFi mini-app in Farcaster...",
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
          <div className="relative flex items-center justify-center mb-4">
            <div className="text-6xl md:text-7xl font-bold font-scroll text-ancient-gold tracking-wider">
              BIBLEFI
            </div>
          </div>
          
          <div className="text-lg md:text-xl font-scroll text-ancient-gold">
            Biblical Wisdom for Financial Stewardship
          </div>
        </div>
      </div>
      
      <p className="text-xl max-w-2xl mx-auto mb-6 font-scroll">
        Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
      </p>
      
      <div className="flex items-center justify-center gap-3 mt-2 mb-6">
        <div className="py-1 px-3 bg-black/40 rounded-full flex items-center">
          <img
            src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png"
            alt="Base Chain"
            className="h-4 mr-2"
          />
          <span className="text-sm text-white/80">Built on Base Chain</span>
        </div>
        
        <div className="py-1 px-3 bg-black/40 rounded-full flex items-center">
          <span className="text-sm text-white/80">Farcaster Mini-App</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 mb-6">
        <PixelButton 
          onClick={handleOpenFarcaster}
          className="inline-flex items-center px-6 py-3 text-lg font-scroll bg-purple-900 border-2 border-ancient-gold text-ancient-gold"
          farcasterStyle
        >
          <ExternalLink size={20} className="mr-2" />
          Open in Farcaster
        </PixelButton>
        
        <Button
          onClick={handleSoundToggle}
          variant="outline"
          className="flex items-center gap-2 border-2 border-ancient-gold/50 bg-scripture/30 hover:bg-scripture/50 text-ancient-gold font-scroll"
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
      
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <a 
          href="https://app.superfluid.finance" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-sm text-ancient-gold/70 hover:text-ancient-gold"
          onClick={() => playSound("select")}
        >
          Superfluid <ArrowUpRight size={12} className="ml-1" />
        </a>
        <a 
          href="https://app.odos.xyz" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-sm text-ancient-gold/70 hover:text-ancient-gold"
          onClick={() => playSound("select")}
        >
          Odos <ArrowUpRight size={12} className="ml-1" />
        </a>
        <a 
          href="https://app.daimo.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-sm text-ancient-gold/70 hover:text-ancient-gold"
          onClick={() => playSound("select")}
        >
          Daimo <ArrowUpRight size={12} className="ml-1" />
        </a>
      </div>
      
      <div className="text-sm text-white/70 mt-4 font-scroll">
        <p>Using iPad/iOS? Tap any sound button to enable audio</p>
      </div>
    </section>
  );
};

export default HomeHeader;
