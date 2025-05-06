
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import HomeHeader from "@/components/home/HomeHeader";
import FeatureCards from "@/components/home/FeatureCards";
import TaxSection from "@/components/home/TaxSection";
import { useSound } from "@/contexts/SoundContext";
import { AnimatedSpriteBackground } from "@/components/ui/tailwind-extensions";
import FarcasterFrame from "@/farcaster/FarcasterFrame";
import FarcasterConnect from "@/farcaster/FarcasterConnect";

const Index: React.FC = () => {
  const { playSound, setUserInteracted } = useSound();
  
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
  
  // Function to handle user interaction
  const handleInteraction = () => {
    setUserInteracted(true);
  };

  return (
    <div className="min-h-screen" onClick={handleInteraction}>
      <AnimatedSpriteBackground opacity={0.05} />
      <NavBar />
      
      <main className="container mx-auto px-4 py-8 animate-entrance">
        <div className="flex justify-end mb-4">
          <FarcasterConnect size="sm" />
        </div>
        
        <HomeHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <DailyScripture />
          <FarcasterFrame />
        </div>
        
        <FeatureCards />
        
        <TaxSection />
      </main>
    </div>
  );
};

export default Index;
