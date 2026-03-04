import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import BibleCharacter from "@/components/BibleCharacter";
import PixelBackground from "@/components/graphics/PixelBackground";
import PixelCoin from "@/components/graphics/PixelCoin";
import IsometricBuilding from "@/components/graphics/IsometricBuilding";
import { Button } from "@/components/ui/button";
import { Sparkles, Coins, BookOpen } from "lucide-react";

const EnhancedHeroSection: React.FC = () => {
  const { playSound } = useSound();
  const [currentCharacter, setCurrentCharacter] = useState<number>(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const heroCharacters = [
    { type: "jesus" as const, message: "Welcome to BibleFi, where faith meets finance!" },
    { type: "solomon" as const, message: "Discover biblical wisdom for modern financial decisions" },
    { type: "moses" as const, message: "Lead your finances with divine guidance" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacter((prev) => (prev + 1) % heroCharacters.length);
      playSound("scroll");
    }, 5000);

    return () => clearInterval(interval);
  }, [playSound]);

  const handleGetStarted = () => {
    playSound("powerup");
    setShowWelcome(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pixel-sky to-background">
      {/* Animated Background */}
      <PixelBackground theme="temple" animated />
      
      {/* Main Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        
        {/* Animated Logo */}
        <div className="text-center mb-8 animate-entrance">
          <h1 className="eboy-title text-6xl md:text-8xl mb-4 animate-pulse-glow">
            BIBLEFI
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm font-pixel text-eboy-green">
            <span>MADE ON</span>
            <IsometricBuilding type="bank" size="sm" animated />
            <span>BASE CHAIN</span>
          </div>
        </div>

        {/* Central Character Display */}
        <div className="mb-8 animate-entrance" style={{ animationDelay: "0.3s" }}>
          <BibleCharacter
            character={heroCharacters[currentCharacter].type}
            message={heroCharacters[currentCharacter].message}
            showName
            showWisdomLevel
            onClick={() => playSound("coin")}
          />
        </div>

        {/* Interactive Elements */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 animate-entrance" style={{ animationDelay: "0.6s" }}>
          <PixelCoin type="gold" size="md" animated clickable onClick={() => playSound("coin")} />
          <PixelCoin type="crypto" size="md" animated clickable onClick={() => playSound("success")} />
          <PixelCoin type="tithe" size="md" animated clickable onClick={() => playSound("powerup")} />
        </div>

        {/* Action Buttons */}
        {showWelcome && (
          <div className="flex flex-col sm:flex-row gap-4 animate-entrance" style={{ animationDelay: "0.9s" }}>
            <Button 
              className="eboy-button text-lg px-8 py-4"
              onClick={handleGetStarted}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
            
            <Button 
              variant="outline"
              className="isometric-card text-lg px-8 py-4 bg-transparent border-2 border-eboy-yellow hover:bg-eboy-yellow/10"
              onClick={() => playSound("scroll")}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Learn Wisdom
            </Button>
          </div>
        )}

        {/* Floating Action Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroCharacters.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 border-eboy-green transition-all duration-300 ${
                index === currentCharacter 
                  ? 'bg-eboy-green eboy-glow' 
                  : 'bg-transparent hover:bg-eboy-green/30'
              }`}
              onClick={() => {
                setCurrentCharacter(index);
                playSound("select");
              }}
            />
          ))}
        </div>

        {/* Side Decorations */}
        <div className="absolute top-1/4 left-8 hidden lg:block animate-float">
          <IsometricBuilding type="temple" size="lg" animated />
        </div>
        
        <div className="absolute top-1/3 right-8 hidden lg:block animate-float" style={{ animationDelay: "2s" }}>
          <IsometricBuilding type="church" size="md" animated />
        </div>

        {/* Floating Coins */}
        <div className="absolute top-16 left-1/4 animate-pixel-bounce" style={{ animationDelay: "1s" }}>
          <PixelCoin type="gold" size="sm" animated />
        </div>
        
        <div className="absolute top-20 right-1/4 animate-pixel-bounce" style={{ animationDelay: "3s" }}>
          <PixelCoin type="crypto" size="sm" animated />
        </div>

        {/* Version Info */}
        <div className="absolute bottom-4 right-4 text-xs font-pixel text-eboy-green/70">
          v1.0 BETA
        </div>
      </div>
    </div>
  );
};

export default EnhancedHeroSection;