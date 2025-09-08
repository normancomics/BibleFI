import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, TrendingUp, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSound } from "@/contexts/SoundContext";

const ModernBiblefiHero: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const contractAddress = "0x7bEda57074AA917FF0993fb329E16C2c188baF08";
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      playSound("success");
      toast({
        title: "Address Copied",
        description: "biblefi.base.eth address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  const handleOpenApp = () => {
    playSound("powerup");
    window.location.href = "/defi";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/30 to-black" />
      
      {/* Animated clouds background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-10 left-10 w-32 h-20 bg-contain bg-no-repeat"
          style={{ backgroundImage: "url('/pixel-clouds.png')" }}
          animate={{ 
            x: [0, 20, 0],
            y: [0, -10, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-20 right-20 w-40 h-24 bg-contain bg-no-repeat"
          style={{ backgroundImage: "url('/pixel-clouds.png')" }}
          animate={{ 
            x: [0, -15, 0],
            y: [0, 8, 0],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-28 h-16 bg-contain bg-no-repeat"
          style={{ backgroundImage: "url('/pixel-clouds.png')" }}
          animate={{ 
            x: [0, 25, 0],
            y: [0, -12, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
      
      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Logo and title */}
        <div className="mb-8">
          <motion.div 
            className="relative inline-block cursor-pointer"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => setShowAddress(!showAddress)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4 relative">
              <span 
                className="font-orbitron"
                style={{ 
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  color: '#4A1A5C',
                  textShadow: isHovered 
                    ? '3px 0px 0px #FF8C00, -3px 0px 0px #FF8C00, 0px 3px 0px #FF8C00, 0px -3px 0px #FF8C00, 3px 3px 0px #FF8C00, -3px -3px 0px #FF8C00, 3px -3px 0px #FF8C00, -3px 3px 0px #FF8C00, 2px 0px 0px #FF8C00, -2px 0px 0px #FF8C00, 0px 2px 0px #FF8C00, 0px -2px 0px #FF8C00, 2px 2px 0px #FF8C00, -2px -2px 0px #FF8C00, 2px -2px 0px #FF8C00, -2px 2px 0px #FF8C00, 4px 0px 0px #FF8C00, -4px 0px 0px #FF8C00, 0px 4px 0px #FF8C00, 0px -4px 0px #FF8C00, 0 0 20px rgba(255, 140, 0, 0.8)'
                    : '3px 0px 0px #FF8C00, -3px 0px 0px #FF8C00, 0px 3px 0px #FF8C00, 0px -3px 0px #FF8C00, 3px 3px 0px #FF8C00, -3px -3px 0px #FF8C00, 3px -3px 0px #FF8C00, -3px 3px 0px #FF8C00, 2px 0px 0px #FF8C00, -2px 0px 0px #FF8C00, 0px 2px 0px #FF8C00, 0px -2px 0px #FF8C00, 2px 2px 0px #FF8C00, -2px -2px 0px #FF8C00, 2px -2px 0px #FF8C00, -2px 2px 0px #FF8C00, 4px 0px 0px #FF8C00, -4px 0px 0px #FF8C00, 0px 4px 0px #FF8C00, 0px -4px 0px #FF8C00',
                }}
              >
                Bible.Fi
              </span>
            </h1>
            
            {/* Animated Glowing Bible Icon */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-6 relative"
            >
              <motion.div
                className="relative mx-auto w-20 h-20"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Glowing effect background */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.2) 50%, transparent 70%)',
                    filter: 'blur(8px)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Bible icon */}
                <motion.img
                  src="/glowing-bible-icon.png"
                  alt="Glowing Bible"
                  className="relative z-10 w-full h-full object-contain pixelated"
                  animate={{
                    filter: [
                      'brightness(1) drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))',
                      'brightness(1.1) drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))',
                      'brightness(1) drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Light rays emanating from Bible */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-400/30 to-transparent"
                      style={{
                        height: '60px',
                        left: '50%',
                        top: '-30px',
                        transformOrigin: '50% 60px',
                        transform: `translateX(-50%) rotate(${i * 45}deg)`
                      }}
                      animate={{
                        opacity: [0.2, 0.6, 0.2],
                        scaleY: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Base.eth address */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: showAddress ? 1 : (isHovered ? 0.7 : 0.4),
                y: showAddress ? 0 : 10 
              }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="text-sm md:text-base text-yellow-400/80 font-mono tracking-wider">
                biblefi.base.eth
              </div>
              {showAddress && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 p-3 bg-black/50 border border-yellow-400/30 rounded-lg backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-xs text-yellow-300 font-mono">
                    <span className="truncate">{contractAddress}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAddress();
                      }}
                      className="h-6 w-6 p-0 hover:bg-yellow-400/20"
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-green-400 text-xs mt-1"
                    >
                      Copied!
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Biblical wisdom meets modern DeFi
          </motion.p>
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-sm">
            <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-white/70">DeFi Trading</p>
          </Card>
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-sm">
            <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-white/70">Digital Tithing</p>
          </Card>
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-white/70">Biblical Wisdom</p>
          </Card>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Button
            onClick={handleOpenApp}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
          >
            Enter Bible.fi
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Chain indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-12 flex items-center justify-center gap-6 text-sm text-white/60"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <span>Built on Base</span>
          </div>
          <div className="w-1 h-1 bg-white/30 rounded-full" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full" />
            <span>Farcaster Compatible</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ModernBiblefiHero;