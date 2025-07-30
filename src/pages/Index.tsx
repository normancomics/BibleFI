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
    <div className="min-h-screen bg-white">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <NavBar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header with Connect */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bible.fi</h1>
            <p className="text-gray-500 text-sm">Biblical DeFi on Base</p>
          </div>
          <div className="flex items-center gap-2">
            <FixedFarcasterConnect size="sm" />
            <RealWalletConnect 
              buttonText="Connect"
              buttonVariant="default"
              buttonClassName="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
            />
          </div>
        </div>
        
        {/* Main Cards */}
        <div className="space-y-4">
          {/* Portfolio Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Portfolio</h2>
                <p className="text-gray-500 text-sm">Track your biblical DeFi investments</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$0.00</div>
                <div className="text-sm text-green-600">+0.00%</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">$0.00</div>
                <div className="text-xs text-gray-500">Staked</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">$0.00</div>
                <div className="text-xs text-gray-500">Lending</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">$0.00</div>
                <div className="text-xs text-gray-500">Tithing</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors">
                <div className="text-blue-600 text-sm font-medium">Swap</div>
                <div className="text-gray-500 text-xs">Exchange tokens</div>
              </button>
              <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors">
                <div className="text-green-600 text-sm font-medium">Stake</div>
                <div className="text-gray-500 text-xs">Earn rewards</div>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors">
                <div className="text-purple-600 text-sm font-medium">Tithe</div>
                <div className="text-gray-500 text-xs">Give generously</div>
              </button>
              <button className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-left transition-colors">
                <div className="text-orange-600 text-sm font-medium">Learn</div>
                <div className="text-gray-500 text-xs">Biblical wisdom</div>
              </button>
            </div>
          </div>

          {/* Daily Verse */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Today's Wisdom</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm mb-2">"{financialVerse.text}"</p>
              <p className="text-gray-500 text-xs font-medium">{financialVerse.reference}</p>
            </div>
            <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition-colors">
              Share to Farcaster
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No recent activity</div>
                <div className="text-xs">Connect your wallet to get started</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Setup Guide */}
        <div className="mt-8">
          <MobileSetupGuide />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-200 bg-gray-50">
        <p className="text-gray-400 text-xs">Built on Base Chain</p>
      </footer>
    </div>
  );
};

export default Index;
