import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, TrendingUp, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSound } from "@/contexts/SoundContext";
import bibleFiLogo from '@/assets/bible-fi-main-logo.png';

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
      {/* Background gradient - enhanced purple theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-purple-900/30" />
      
      {/* Animated clouds background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-10 left-10 w-32 h-20 bg-contain bg-no-repeat"
          style={{ backgroundImage: "url('/pixel-clouds-exact.png')" }}
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
          style={{ backgroundImage: "url('/pixel-clouds-exact.png')" }}
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
          className="absolute bottom-20 left-1/3 w-28 h-16 bg-contain bg-no-repeat"
          style={{ backgroundImage: "url('/pixel-clouds-exact.png')" }}
          animate={{ 
            x: [0, 10, 0],
            y: [0, -5, 0],
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
            <motion.div
              className="relative inline-block"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src={bibleFiLogo}
                alt="BibleFi"
                className="pixelated w-full max-w-sm md:max-w-md mx-auto rounded-2xl"
                style={{
                  filter: isHovered 
                    ? 'brightness(1.1) drop-shadow(0 0 30px rgba(147, 51, 234, 0.8))'
                    : 'brightness(1) drop-shadow(0 0 20px rgba(147, 51, 234, 0.6))'
                }}
              />
            </motion.div>
            
            {/* Animated Pixel Bible Icon */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-6 relative"
            >
              <motion.div
                className="relative mx-auto w-24 h-24"
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
                <img 
                  src="/bible-book-exact.png"
                  alt="Holy Bible"
                  className="pixelated w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.7))'
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Contract Address Display */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: showAddress ? 1 : 0, 
                height: showAddress ? "auto" : 0 
              }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 mx-auto max-w-md backdrop-blur-sm">
                <p className="text-xs text-purple-200 mb-2">Contract Address:</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-golden-bright text-xs font-mono flex-1 break-all">
                    biblefi.base.eth
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyAddress}
                    className="p-1 h-6 w-6 text-purple-300 hover:text-golden-bright"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-400 mt-1"
                  >
                    Copied!
                  </motion.p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-golden-bright font-scroll">
            Biblical Wisdom Meets DeFi Innovation
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
            Experience the world's first faith-based DeFi platform, where ancient wisdom guides modern financial decisions.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="bg-purple-900/20 border-purple-500/30 p-6 backdrop-blur-sm">
            <TrendingUp className="h-8 w-8 text-golden-bright mb-3 mx-auto" />
            <h3 className="font-semibold text-purple-100 mb-2">DeFi Trading</h3>
            <p className="text-sm text-purple-200">
              Trade with biblical principles and wisdom-guided strategies
            </p>
          </Card>
          
          <Card className="bg-purple-900/20 border-purple-500/30 p-6 backdrop-blur-sm">
            <Users className="h-8 w-8 text-golden-bright mb-3 mx-auto" />
            <h3 className="font-semibold text-purple-100 mb-2">Digital Tithing</h3>
            <p className="text-sm text-purple-200">
              Support your church through seamless crypto donations
            </p>
          </Card>
          
          <Card className="bg-purple-900/20 border-purple-500/30 p-6 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-golden-bright mb-3 mx-auto" />
            <h3 className="font-semibold text-purple-100 mb-2">Biblical Wisdom</h3>
            <p className="text-sm text-purple-200">
              Learn financial principles from Scripture's timeless teachings
            </p>
          </Card>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mb-8"
        >
          <Button
            onClick={handleOpenApp}
            size="lg"
            className="bg-gradient-to-r from-golden-bright to-ancient-gold hover:from-golden-deep hover:to-golden-bright text-purple-900 font-bold px-8 py-4 text-lg rounded-xl shadow-lg shadow-golden-bright/25 transition-all duration-300 hover:scale-105"
          >
            Enter BibleFi
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Chain indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center items-center gap-8 text-sm text-purple-300"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Built on Base</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>Farcaster Compatible</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ModernBiblefiHero;