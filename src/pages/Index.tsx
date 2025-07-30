import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import FeatureCards from "@/components/home/FeatureCards";
import TaxSection from "@/components/home/TaxSection";
import { useSound } from "@/contexts/SoundContext";
import FarcasterFrame from "@/farcaster/FarcasterFrame";
import { Card, CardContent } from "@/components/ui/card";
import BiblefiHero from "@/components/home/BiblefiHero";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import WisdomCard from "@/components/wisdom/WisdomCard";
import { getRandomVerse } from "@/data/bibleVerses";
import IntroAnimation from "@/components/home/IntroAnimation";
import FixedFarcasterConnect from "@/components/farcaster/FixedFarcasterConnect";
import RealWalletConnect from "@/components/wallet/RealWalletConnect";
import MobileSetupGuide from "@/components/setup/MobileSetupGuide";

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
    <div className="min-h-screen bg-gradient-to-b from-black via-pixel-purple/10 to-black">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <FixedFarcasterConnect size="sm" />
            <RealWalletConnect 
              buttonText="Connect Wallet"
              buttonVariant="outline"
              buttonClassName="border-retro-cyan text-retro-cyan hover:bg-retro-cyan hover:text-black font-pixel"
            />
          </div>
        </div>
        
        {/* Retro Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-[url('/pixel-temple-bg.png')] bg-cover bg-center opacity-20" />
          <div className="relative z-10">
            <h1 className="font-orbitron text-6xl font-bold text-retro-cyan mb-4 text-shadow-neon">
              BIBLE.FI
            </h1>
            <p className="font-pixel text-retro-green text-xl mb-2">
              🎮 RETRO DEFI WISDOM 🎮
            </p>
            <p className="font-pixel text-pixel-gold text-sm">
              MADE ON BASE CHAIN
            </p>
          </div>
        </div>
        
        {/* Mobile Setup Guide for iPad users */}
        <div className="my-12">
          <MobileSetupGuide />
        </div>
        
        {/* Feature Showcase */}
        <FeatureShowcase />
        
        {/* Retro Wisdom Section */}
        <div className="my-12 retro-card p-6 bg-gradient-to-r from-pixel-purple/20 to-pixel-cyan/20 border-2 border-pixel-gold">
          <h2 className="text-2xl font-orbitron text-pixel-gold text-center mb-6 text-shadow-neon">
            🎮 BIBLICAL FINANCIAL WISDOM 🎮
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="retro-card bg-black/60 p-4 border-2 border-retro-green">
              <h3 className="text-lg font-orbitron text-retro-green mb-2">⚖️ FINANCIAL LAW</h3>
              <p className="text-retro-cyan font-pixel text-sm">
                Moses delivered God's law for honest finances and fair dealings
              </p>
            </div>
            
            <div>
              <WisdomCard 
                scripture={financialVerse.text}
                reference={financialVerse.reference}
                principle="Wise stewardship requires careful planning"
                application="Create a budget that prioritizes giving and saving"
                tags={[financialVerse.category]}
              />
            </div>
            
            <div className="retro-card bg-black/60 p-4 border-2 border-retro-yellow">
              <h3 className="text-lg font-orbitron text-retro-yellow mb-2">👑 ROYAL WISDOM</h3>
              <p className="text-retro-cyan font-pixel text-sm">
                King David modeled generous giving and stewardship
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
          <div className="retro-card p-6 bg-gradient-to-r from-pixel-purple/20 to-retro-green/20 border-2 border-retro-cyan">
            <h2 className="text-2xl text-retro-cyan font-orbitron mb-4 text-shadow-neon">
              🎮 BIBLE.FI MINI-APP 🎮
            </h2>
            <p className="text-retro-green mb-4 font-pixel">
              Built for Farcaster with retro DeFi wisdom!
            </p>
          </div>
        </div>
        
        {/* Tax Section */}
        <TaxSection />
      </main>
      
      {/* Retro Footer */}
      <footer className="py-6 text-center bg-gradient-to-t from-black/80 to-transparent border-t border-pixel-gold">
        <p className="text-pixel-gold font-pixel tracking-wider text-shadow-neon animate-pulse">
          🎮 MADE ON BASE CHAIN 🎮
        </p>
      </footer>
    </div>
  );
};

export default Index;
