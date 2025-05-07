
import React from "react";
import PixelButton from "@/components/PixelButton";
import { ExternalLink } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";

const HomeHeader: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const handleOpenFarcaster = () => {
    playSound("select");
    toast({
      title: "Farcaster Integration",
      description: "Opening Bible.fi mini-app in Farcaster...",
    });
    
    // For now, we'll just open the Frame HTML page
    window.open("/frame.html", "_blank");
  };
  
  return (
    <section className="text-center mb-12 animate-fade-in">
      <div className="mb-8">
        <img 
          src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
          alt="Bible.fi" 
          className="h-32 mx-auto"
        />
      </div>
      
      <p className="text-xl max-w-2xl mx-auto mb-6">
        Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
      </p>
      
      <div className="flex justify-center items-center mt-2 mb-4 bg-black/50 py-2 px-4 rounded-lg inline-block mx-auto border border-ancient-gold/30">
        <span className="text-white mr-2 font-pixel tracking-wider">MADE ON</span>
        <img 
          src="https://base.org/images/favicon.png" 
          alt="Base Chain Logo" 
          className="w-6 h-6 inline-block"
        />
        <span className="ml-1 text-base-blue font-pixel font-bold tracking-wider">BASE CHAIN</span>
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
    </section>
  );
};

export default HomeHeader;
