import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import FeatureCards from "@/components/home/FeatureCards";
import TaxSection from "@/components/home/TaxSection";
import { useSound } from "@/contexts/SoundContext";
import FarcasterFrame from "@/farcaster/FarcasterFrame";
import FarcasterConnect from "@/farcaster/FarcasterConnect";
import { Card, CardContent } from "@/components/ui/card";
import BiblefiHero from "@/components/home/BiblefiHero";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import WisdomCard from "@/components/wisdom/WisdomCard";
import { getRandomVerse } from "@/data/bibleVerses";
import IntroAnimation from "@/components/home/IntroAnimation";
import UniversalWalletConnect from "@/components/wallet/UniversalWalletConnect";

const Index: React.FC = () => {
  const { setUserInteracted } = useSound();
  const [showIntro, setShowIntro] = useState(true);
  
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
    <div className="min-h-screen">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <FarcasterConnect size="sm" />
            <UniversalWalletConnect 
              buttonText="Connect Wallet"
              buttonVariant="outline"
              buttonClassName="border-ancient-gold text-ancient-gold hover:bg-ancient-gold hover:text-black"
            />
          </div>
        </div>
        
        {/* Hero section */}
        <BiblefiHero />
        
        {/* Feature Showcase */}
        <FeatureShowcase />
        
        {/* Financial Wisdom section */}
        <div className="my-12 bg-purple-900/30 border border-ancient-gold/20 rounded-lg p-6">
          <h2 className="text-2xl font-scroll text-ancient-gold text-center mb-6">Biblical Financial Wisdom</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="mt-4 bg-purple-900/60 p-4 rounded-lg border border-ancient-gold/30">
              <h3 className="text-lg font-scroll text-ancient-gold mb-2">Financial Law</h3>
              <p className="text-white/80 font-scroll text-sm">
                Moses delivered God's law, which contains principles for honest finances, fair dealings, and care for the poor.
              </p>
            </div>
            
            <div>
              <WisdomCard 
                scripture={financialVerse.text}
                reference={financialVerse.reference}
                principle="Wise stewardship requires careful planning and management of resources."
                application="Apply this by creating a monthly budget that prioritizes giving, saving, and responsible spending."
                tags={[financialVerse.category]}
              />
            </div>
            
            <div className="mt-4 bg-purple-900/60 p-4 rounded-lg border border-ancient-gold/30">
              <h3 className="text-lg font-scroll text-ancient-gold mb-2">Royal Wisdom</h3>
              <p className="text-white/80 font-scroll text-sm">
                King David modeled generous giving and responsible stewardship of resources for God's purposes.
              </p>
            </div>
          </div>
        </div>
        
        {/* Daily Scripture and Farcaster */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <DailyScripture />
          <FarcasterFrame />
        </div>
        
        {/* Feature cards */}
        <FeatureCards />
        
        <div className="my-12">
          <Card className="bg-purple-900/20 border border-ancient-gold shadow-md">
            <CardContent className="p-6">
              <h2 className="text-2xl text-ancient-gold font-scroll mb-4">Bible.fi Mini-App</h2>
              <p className="text-white/80 mb-4 font-scroll">
                Bible.fi is built specifically to run as a mini-app inside Farcaster, 
                offering biblical financial wisdom directly to the Farcaster community.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tax Section */}
        <TaxSection />
      </main>
      
      {/* "Made on Base Chain" footer */}
      <footer className="py-6 text-center bg-gradient-to-t from-black/30 to-transparent">
        <p className="text-xs font-pixel tracking-wider text-ancient-gold hover:text-ancient-gold/80 transition-colors">
          MADE ON BASE CHAIN
        </p>
      </footer>
    </div>
  );
};

export default Index;
