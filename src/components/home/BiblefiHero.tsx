
import React, { useState, useEffect } from "react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Wallet, Book } from "lucide-react";
import { motion } from "framer-motion";
import { CharacterType } from "@/components/PixelCharacter";
import PixelCharacter from "@/components/PixelCharacter";
import { useToast } from "@/hooks/use-toast";

// Bible characters to animate through
const characters: CharacterType[] = ["solomon", "moses", "jesus", "david"];

const BiblefiHero: React.FC = () => {
  const { playSound } = useSound();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentCharacter, setCurrentCharacter] = useState<CharacterType>("solomon");
  const [characterIndex, setCharacterIndex] = useState(0);
  
  // Cycle through characters
  useEffect(() => {
    const interval = setInterval(() => {
      setCharacterIndex((prev) => {
        const nextIndex = (prev + 1) % characters.length;
        setCurrentCharacter(characters[nextIndex]);
        return nextIndex;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleConnectWallet = () => {
    playSound("powerup");
    toast({
      title: "Connect Wallet",
      description: "Opening wallet connection dialog...",
    });
    // In a real implementation, this would open a wallet connection modal
  };
  
  const handleLearnMore = () => {
    playSound("scroll");
    navigate("/wisdom");
  };
  
  const handleOpenFarcaster = () => {
    playSound("select");
    window.open("/frame.html", "_blank");
  };
  
  return (
    <section className="relative overflow-hidden py-8 md:py-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-scripture/30 to-transparent opacity-40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-pixel text-ancient-gold mb-4">
                Bible.fi
              </h1>
              
              <h2 className="text-xl md:text-2xl text-white/90 mb-6">
                Biblical wisdom for your financial journey
              </h2>
              
              <p className="text-white/80 mb-8 max-w-md">
                Learn biblical principles for finances, tithe digitally to your church, 
                and explore DeFi opportunities aligned with scripture — all on Base Chain.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <PixelButton 
                  onClick={handleConnectWallet}
                  className="flex items-center"
                >
                  <Wallet size={18} className="mr-2" />
                  Connect Wallet
                </PixelButton>
                
                <PixelButton
                  onClick={handleLearnMore}
                  variant="outline"
                  className="flex items-center"
                >
                  <Book size={18} className="mr-2" />
                  Biblical Wisdom
                </PixelButton>
              </div>
              
              <div className="inline-flex items-center justify-center md:justify-start px-4 py-2 bg-base-blue/20 border border-base-blue/50 rounded-md">
                <img 
                  src="https://base.org/images/favicon.png" 
                  alt="Base Chain" 
                  className="w-5 h-5 mr-2" 
                />
                <span className="text-white/90 text-sm font-medium">Built on Base Chain</span>
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={handleOpenFarcaster} 
                  className="flex items-center text-white/70 hover:text-white/90 text-sm font-medium transition-colors"
                >
                  <ExternalLink size={16} className="mr-1" />
                  Open as Farcaster Frame
                </button>
              </div>
            </motion.div>
          </div>
          
          <div className="flex justify-center md:justify-end">
            <div className="relative h-[300px] w-[300px]">
              {/* Biblical coin animation */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  y: [0, -10, 0]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute top-8 right-8"
              >
                <img 
                  src="/coin-pixel.png" 
                  alt="Bible Coin" 
                  className="w-12 h-12 object-contain" 
                />
              </motion.div>
              
              {/* Biblical scroll animation */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  x: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute bottom-10 left-10"
              >
                <img 
                  src="/scroll-pixel.png" 
                  alt="Biblical Scroll" 
                  className="w-16 h-16 object-contain" 
                />
              </motion.div>
              
              {/* Main character */}
              <motion.div
                key={currentCharacter}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <PixelCharacter 
                  character={currentCharacter} 
                  size="xxl" 
                  animate
                />
              </motion.div>
              
              {/* Logo */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-0 left-1/2 transform -translate-x-1/2"
              >
                <img 
                  src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
                  alt="Bible.fi Logo" 
                  className="w-28 h-28 object-contain" 
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BiblefiHero;
