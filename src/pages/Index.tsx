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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <FixedFarcasterConnect size="sm" />
            <RealWalletConnect 
              buttonText="Connect"
              buttonVariant="outline"
              buttonClassName="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
            />
          </div>
        </div>
        
        {/* Clean Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Bible.fi
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Biblical wisdom for DeFi
          </p>
          <p className="text-blue-400 text-sm">
            Built on Base
          </p>
        </div>
        
        {/* Mobile Setup Guide */}
        <div className="my-12">
          <MobileSetupGuide />
        </div>
        
        {/* Feature Showcase */}
        <FeatureShowcase />
        
        {/* Simple Wisdom Section */}
        <div className="my-12 bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            Biblical Financial Principles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Stewardship</h3>
              <p className="text-gray-300 text-sm">
                Manage resources wisely and responsibly
              </p>
            </div>
            
            <div>
              <WisdomCard 
                scripture={financialVerse.text}
                reference={financialVerse.reference}
                principle="Wise planning leads to prosperity"
                application="Budget and invest with intention"
                tags={[financialVerse.category]}
              />
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Generosity</h3>
              <p className="text-gray-300 text-sm">
                Give generously and invest in others
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
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Farcaster Mini App
            </h2>
            <p className="text-gray-300 mb-4">
              Access Bible.fi directly within Farcaster for seamless DeFi interactions.
            </p>
          </div>
        </div>
        
        {/* Tax Section */}
        <TaxSection />
      </main>
      
      {/* Clean Footer */}
      <footer className="py-6 text-center border-t border-slate-800">
        <p className="text-gray-500 text-sm">
          Built on Base Chain
        </p>
      </footer>
    </div>
  );
};

export default Index;
