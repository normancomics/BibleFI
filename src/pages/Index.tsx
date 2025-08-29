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
import RecentActivity from "@/components/home/RecentActivity";

const Index: React.FC = () => {
  const { setUserInteracted } = useSound();
  const [showIntro, setShowIntro] = useState(true);
  
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
  
  return (
    <div className="min-h-screen bg-background">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <NavBar />
      
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
