
import React from "react";
import BibleCharacter from "@/components/BibleCharacter";
import PixelIcon from "@/components/PixelIcon";
import PixelButton from "@/components/PixelButton";
import { ExternalLink } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";

const HomeHeader: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const handleOpenFarcaster = () => {
    playSound("select");
    // This would open the Farcaster mini-app in production
    // For now, we'll just show a toast
    toast({
      title: "Farcaster Integration",
      description: "Opening Bible.fi mini-app in Farcaster...",
    });
    
    // Here you would use Farcaster's client SDK to open the mini-app
    // For now, we'll just open the Frame HTML page
    window.open("/frame.html", "_blank");
  };
  
  return (
    <section className="text-center mb-12 animate-fade-in">
      <h1 className="text-5xl md:text-6xl font-sans tracking-tight mb-6">
        <span className="text-base-blue">Bible</span>.fi
      </h1>
      <p className="text-xl max-w-2xl mx-auto mb-3">
        Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
      </p>
      <div className="flex justify-center items-center mt-2 mb-4">
        <span className="text-sm mr-2">Made on</span>
        <PixelIcon 
          src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png"
          alt="Base Chain Logo" 
          size={20}
          className="inline-block"
        />
        <span className="text-sm ml-1 text-base-blue font-medium">Base Chain</span>
      </div>
      
      <div className="mt-4 mb-6">
        <PixelButton 
          onClick={handleOpenFarcaster}
          className="inline-flex items-center px-4 py-2"
        >
          <ExternalLink size={16} className="mr-2" />
          Open in Farcaster
        </PixelButton>
      </div>
      
      <BibleCharacter 
        character="solomon" 
        message="Wisdom is more precious than rubies, and all the things you may desire cannot compare with her. - Proverbs 8:11"
        className="mt-6 max-w-2xl mx-auto text-left"
      />
    </section>
  );
};

export default HomeHeader;
