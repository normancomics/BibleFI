
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import { ExternalLink, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PixelButton from "@/components/PixelButton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const BiblefiHero: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Mark as loaded after a short delay to trigger animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleOpenFarcaster = () => {
    setUserInteracted(true);
    playSound("select");
    toast({
      title: "Farcaster Integration",
      description: "Opening Bible.fi mini-app in Farcaster...",
    });
    
    // Open Farcaster frame
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
    <section className="relative text-center py-8 mb-12">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-black/80 to-black opacity-80"></div>
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            backgroundImage: "url('/pixel-temple-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
      
      {/* Logo and main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <img 
          src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
          alt="Bible.fi" 
          className="h-32 mx-auto"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-xl max-w-2xl mx-auto mb-6 text-white">
          Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
        </p>
        
        <div className="flex justify-center items-center mt-2 mb-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isLoaded ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="bg-black/70 py-2 px-6 rounded-lg inline-block mx-auto border-2 border-ancient-gold/50"
          >
            <span className="text-white mr-3 font-pixel tracking-wider text-lg">MADE ON</span>
            <img 
              src="https://base.org/images/favicon.png" 
              alt="Base Chain Logo" 
              className="w-6 h-6 inline-block"
            />
            <span className="ml-2 text-base-blue font-pixel font-bold tracking-wider text-lg">BASE CHAIN</span>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 mb-6"
      >
        <PixelButton 
          onClick={handleOpenFarcaster}
          className="inline-flex items-center px-6 py-3 text-lg"
          size="lg"
        >
          <ExternalLink size={20} className="mr-2" />
          Open in Farcaster
        </PixelButton>
        
        <Button
          onClick={handleSoundToggle}
          variant="outline"
          className="flex items-center gap-2 border-2 border-ancient-gold/50 bg-black/50 hover:bg-black/70"
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
      </motion.div>
      
      {/* Biblical characters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex justify-center items-end mt-8 -mb-8 overflow-hidden"
      >
        <div className="flex gap-4 md:gap-8 px-2 overflow-x-auto pb-4 justify-center">
          {["solomon", "jesus", "moses", "david"].map((character, index) => (
            <motion.div
              key={character}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1 + index * 0.2, duration: 0.4 }}
              className="flex-shrink-0"
            >
              <img 
                src={`/pixel-${character}.png`} 
                alt={`${character} character`}
                className="h-24 md:h-32 object-contain"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default BiblefiHero;
