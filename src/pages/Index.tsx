
import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import FarcasterFrame from "@/components/farcaster/FarcasterFrame";
import WalletConnect from "@/components/wallet/WalletConnect";
import { useSound } from "@/contexts/SoundContext";

// Import refactored components
import IntroAnimation from "@/components/home/IntroAnimation";
import HomeHeader from "@/components/home/HomeHeader";
import FeatureCards from "@/components/home/FeatureCards";
import TaxSection from "@/components/home/TaxSection";
import SoundActivationButton from "@/components/home/SoundActivationButton";
import { AnimatedSpriteBackground } from "@/components/ui/tailwind-extensions";

const Index: React.FC = () => {
  const { playSound, setUserInteracted } = useSound();
  const [showIntro, setShowIntro] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  
  // Enable sound on page load
  useEffect(() => {
    // Force enable user interaction for development
    setUserInteracted(true);
    
    // Play an initial sound to unlock audio on iOS/Safari
    const unlockAudio = () => {
      playSound("select");
    };
    
    // Add a slight delay to ensure the context is ready
    const timer = setTimeout(() => {
      unlockAudio();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [playSound, setUserInteracted]);
  
  // Function to handle intro completion
  const handleIntroComplete = () => {
    setShowIntro(false);
    setShowMainContent(true);
    playSound("powerup");
  };
  
  // Function to handle user interaction
  const handleInteraction = () => {
    setUserInteracted(true);
    if (!showMainContent) {
      playSound("select");
    }
  };

  // Function to handle sound activation button
  const handleSoundActivation = () => {
    // Skip intro if button is clicked
    setShowIntro(false);
    setShowMainContent(true);
    playSound("powerup");
  };
  
  return (
    <div className="min-h-screen" onClick={handleInteraction}>
      <AnimatedSpriteBackground opacity={0.05} />
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
        
        {showMainContent && (
          <div className="animate-entrance">
            <HomeHeader />
            
            {/* Wallet Connect Section */}
            <section className="my-10">
              <WalletConnect />
            </section>
            
            <DailyScripture />
            
            <FeatureCards />
            
            <TaxSection />
            
            {/* Farcaster Frame Component */}
            <FarcasterFrame />
          </div>
        )}
      </main>
      
      {/* Sound activation button */}
      {!showMainContent && !showIntro && <SoundActivationButton onActivate={handleSoundActivation} />}
    </div>
  );
};

export default Index;
