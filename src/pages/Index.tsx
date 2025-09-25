import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import { useSound } from "@/contexts/SoundContext";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomVerse } from "@/data/bibleVerses";
import IntroAnimation from "@/components/home/IntroAnimation";
import FixedFarcasterConnect from "@/components/farcaster/FixedFarcasterConnect";
import RealWalletConnect from "@/components/wallet/RealWalletConnect";
import MobileSetupGuide from "@/components/setup/MobileSetupGuide";
import PortfolioSummary from "@/components/home/PortfolioSummary";
import ActionButtons from "@/components/home/ActionButtons";
import LaunchStatusBanner from "@/components/home/LaunchStatusBanner";
import RecentActivity from "@/components/home/RecentActivity";
import BiblicalFinancialStories from "@/components/home/BiblicalFinancialStories";
import SoundSystemManager from "@/components/enhanced/SoundSystemManager";
import EnhancedPixelLanding from "@/components/home/EnhancedPixelLanding";
import { Button } from "@/components/ui/button";
import { Users, BookOpen } from "lucide-react";

const Index: React.FC = () => {
  const { setUserInteracted } = useSound();
  const [showIntro, setShowIntro] = useState(true);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showEnhancedLanding, setShowEnhancedLanding] = useState(true);
  
  // Mock portfolio data - in real app this would come from wallet/DeFi protocols
  const portfolioData = {
    totalValue: 0,
    change24h: 0,
    staked: 0,
    lending: 0,
    tithing: 0
  };
  
  // Mock recent activities
  const recentActivities = [
    // Empty for now - will be populated when user connects wallet
  ];
  
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
    <div className="min-h-screen bg-background">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <NavBar />
      
      {/* Toggle to enhanced view */}
      <Button 
        onClick={() => setShowEnhancedLanding(true)}
        className="fixed top-4 right-4 z-50 bg-ancient-gold/20 border border-ancient-gold hover:bg-ancient-gold/30 text-ancient-gold"
      >
        ← Pixel View
      </Button>
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header with Connect */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bible.fi</h1>
            <p className="text-muted-foreground text-sm">Biblical DeFi on Base</p>
          </div>
          <div className="flex items-center gap-2">
            <FixedFarcasterConnect size="sm" />
            <RealWalletConnect 
              buttonText="Connect"
              buttonVariant="default"
              buttonClassName="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2"
            />
          </div>
        </div>
        
        {/* Launch Status Banner */}
        <LaunchStatusBanner />

        {/* Main Cards */}
        <div className="space-y-4">
          <PortfolioSummary {...portfolioData} />
          <ActionButtons />

          {/* Daily Verse */}
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">Today's Wisdom</h3>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-card-foreground text-sm mb-2">"{financialVerse.text}"</p>
                <p className="text-muted-foreground text-xs font-medium">{financialVerse.reference}</p>
              </div>
              <button className="w-full mt-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm py-2 rounded-lg transition-colors">
                Share to Farcaster
              </button>
            </CardContent>
          </Card>

          {/* Biblical Characters Button */}
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Biblical Financial Wisdom
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Learn from the Tax Collector's humility, the Woman at the Well's spiritual priorities, 
                and the Parable of the Talents. Discover timeless financial principles from biblical characters.
              </p>
              <Button 
                onClick={() => setShowCharacters(true)}
                className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-medium"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Character Stories
              </Button>
            </CardContent>
          </Card>

          <RecentActivity activities={recentActivities} />
        </div>

        {/* Mobile Setup Guide */}
        <div className="mt-8">
          <MobileSetupGuide />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center border-t border-border bg-muted/30">
        <p className="text-muted-foreground text-xs">Built on Base Chain</p>
      </footer>
    </div>
  );
};

export default Index;
