import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { useSound } from "@/contexts/SoundContext";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomVerse } from "@/data/bibleVerses";
import IntroAnimation from "@/components/home/IntroAnimation";
import FixedFarcasterConnect from "@/components/farcaster/FixedFarcasterConnect";
import RealWalletConnect from "@/components/wallet/RealWalletConnect";
import MobileSetupGuide from "@/components/setup/MobileSetupGuide";
import LaunchStatusBanner from "@/components/home/LaunchStatusBanner";
import BiblicalFinancialStories from "@/components/home/BiblicalFinancialStories";
import SoundSystemManager from "@/components/enhanced/SoundSystemManager";
import EnhancedPixelLanding from "@/components/home/EnhancedPixelLanding";
import { EnhancedDashboard } from "@/components/home/EnhancedDashboard";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";
import { LegalFooter } from "@/components/legal/LegalFooter";

const Index: React.FC = () => {
  const { setUserInteracted } = useSound();
  const [showIntro, setShowIntro] = useState(true);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showEnhancedLanding, setShowEnhancedLanding] = useState(false);
  
  useEffect(() => {
    // Enable user interaction on page load
    const handleUserInteraction = () => {
      console.log("User interaction detected - enabling sounds");
      setUserInteracted(true);
      // Remove listeners after first interaction
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
    
    // Add event listeners for user interaction
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    
    // Clean up
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [setUserInteracted]);
  
  // Get a random financial verse for the wisdom card
  const financialVerse = getRandomVerse();
  
  const handleIntroComplete = () => {
    setShowIntro(false);
    setUserInteracted(true);
  };

  // Show character stories if user wants them
  if (showCharacters) {
    return (
      <SoundSystemManager>
        <BiblicalFinancialStories />
        <Button 
          onClick={() => setShowCharacters(false)}
          className="fixed top-4 left-4 z-50 bg-black/70 border border-eboy-green hover:bg-eboy-green/20"
        >
          ← Back to Home
        </Button>
      </SoundSystemManager>
    );
  }

  // Show enhanced pixel landing by default
  if (showEnhancedLanding && !showIntro) {
    return (
      <SoundSystemManager>
        <EnhancedPixelLanding />
        <Button 
          onClick={() => setShowEnhancedLanding(false)}
          className="fixed top-4 right-4 z-50 bg-black/70 border border-ancient-gold hover:bg-ancient-gold/20 text-ancient-gold"
        >
          Classic View →
        </Button>
      </SoundSystemManager>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-scripture/5 to-background">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header with Wallet Connect */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <span className="bg-gradient-to-r from-ancient-gold via-scripture to-eboy-pink bg-clip-text text-transparent">
                Bible.fi
              </span>
              <Sparkles className="h-8 w-8 text-ancient-gold animate-pulse-glow" />
            </h1>
            <p className="text-muted-foreground mt-2">
              Biblical wisdom meets DeFi innovation on Base chain
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FixedFarcasterConnect size="sm" />
            <RealWalletConnect 
              buttonText="Connect Wallet"
              buttonVariant="default"
              buttonClassName="bg-ancient-gold hover:bg-ancient-gold/90 text-black font-semibold"
            />
          </div>
        </div>
        
        {/* Launch Status Banner */}
        <LaunchStatusBanner />

        {/* Enhanced Dashboard */}
        <EnhancedDashboard />

        {/* Daily Scripture */}
        <Card className="mt-8 bg-gradient-to-br from-card to-scripture/10 border-ancient-gold/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-ancient-gold" />
              Today's Financial Wisdom
            </h3>
            <div className="bg-background/50 rounded-lg p-6 border border-ancient-gold/20">
              <p className="text-foreground text-base mb-3 italic leading-relaxed">
                "{financialVerse.text}"
              </p>
              <p className="text-ancient-gold text-sm font-semibold">
                {financialVerse.reference}
              </p>
            </div>
            <Button 
              className="w-full mt-4 bg-scripture hover:bg-scripture/90 text-white"
            >
              Share Wisdom to Farcaster
            </Button>
          </CardContent>
        </Card>

        {/* Biblical Characters Access */}
        <Card className="mt-6 bg-gradient-to-br from-eboy-purple/20 to-eboy-pink/20 border-eboy-purple/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Biblical Financial Characters
                </h3>
                <p className="text-muted-foreground text-sm">
                  Explore timeless wisdom from biblical figures like the Tax Collector, 
                  Woman at the Well, and the Parable of the Talents.
                </p>
              </div>
              <Button 
                onClick={() => setShowCharacters(true)}
                size="lg"
                className="bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-semibold shadow-lg"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Stories
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Setup Guide */}
        <div className="mt-8">
          <MobileSetupGuide />
        </div>
      </main>
      
      {/* Legal Footer */}
      <LegalFooter />
    </div>
  );
};

export default Index;
