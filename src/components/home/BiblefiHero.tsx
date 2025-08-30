
import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PixelButton from "@/components/PixelButton";
import { motion } from "framer-motion";
import { GlowingText } from "@/components/ui/tailwind-extensions";

const BiblefiHero: React.FC = () => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Mark as loaded after a short delay to trigger animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleOpenFarcaster = () => {
    toast({
      title: "Farcaster Integration",
      description: "Opening Bible.fi mini-app in Farcaster...",
    });
    
    // Open Farcaster frame
    window.open("/frame.html", "_blank");
  };
  
  return (
    <section className="relative text-center py-8 mb-12">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/60 via-purple-800/50 to-purple-900/40 opacity-90"></div>
      </div>
      
      {/* Logo and main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl md:text-6xl font-scroll font-bold mb-2">
            <GlowingText color="yellow">Bible.fi</GlowingText>
          </div>
          <div className="text-lg md:text-xl font-scroll text-ancient-gold opacity-80">
            Biblical Wisdom for Financial Stewardship
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-xl max-w-2xl mx-auto mb-6 text-white font-scroll">
          Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
        </p>
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
          farcasterStyle
        >
          <ExternalLink size={20} className="mr-2" />
          Open in Farcaster
        </PixelButton>
      </motion.div>
    </section>
  );
};

export default BiblefiHero;
