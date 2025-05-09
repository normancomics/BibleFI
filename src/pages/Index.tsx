import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import HomeHeader from "@/components/home/HomeHeader";
import FeatureCards from "@/components/home/FeatureCards";
import TaxSection from "@/components/home/TaxSection";
import { useSound } from "@/contexts/SoundContext";
import FarcasterFrame from "@/farcaster/FarcasterFrame";
import FarcasterConnect from "@/farcaster/FarcasterConnect";
import SoundInitializer from "@/components/SoundInitializer";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import BiblefiHero from "@/components/home/BiblefiHero";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import BibleCharacterSelector from "@/components/characters/BibleCharacterSelector";
import WisdomCard from "@/components/wisdom/WisdomCard";
import { getRandomVerse } from "@/data/bibleVerses";

const Index: React.FC = () => {
  const { setUserInteracted } = useSound();
  const [selectedCharacter, setSelectedCharacter] = useState("solomon");
  
  // Check if user is on iOS
  const isIOS = typeof navigator !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  
  const isSafari = typeof navigator !== 'undefined' && 
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  useEffect(() => {
    // Force enable user interaction
    setUserInteracted(true);
  }, [setUserInteracted]);
  
  // Get a random financial verse for the wisdom card
  const financialVerse = getRandomVerse("finance");
  
  // Simple component for iOS audio unlocking
  const AudioUnlocker = () => {
    const [showControls, setShowControls] = useState(false);
    
    if (!isIOS && !isSafari) return null;
    
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {!showControls ? (
          <Button
            onClick={() => setShowControls(true)}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2 px-4 py-3 text-white font-bold animate-pulse"
            size="lg"
          >
            <Volume2 className="h-6 w-6" />
            <span className="font-bold">UNLOCK SOUNDS (SAFARI)</span>
          </Button>
        ) : (
          <div className="bg-black/90 border-2 border-red-500 p-4 rounded-lg w-[300px] max-w-full">
            <h3 className="text-white font-bold mb-2">Tap Play on ANY Sound:</h3>
            
            <div className="space-y-2">
              {["/sounds/click.mp3", "/sounds/coin.mp3", "/sounds/powerup.mp3"].map((src, i) => (
                <div key={i} className="bg-gray-800 p-2 rounded">
                  <audio src={src} controls className="w-full" />
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => setShowControls(false)} 
              className="mt-3 w-full"
              variant="outline"
            >
              Close Audio Panel
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen">
      <AudioUnlocker />
      <SoundInitializer />
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <FarcasterConnect size="sm" />
        </div>
        
        {/* Replace HomeHeader with our new Hero */}
        <BiblefiHero />
        
        {(isIOS || isSafari) && (
          <div className="mb-6 bg-red-900/30 border-2 border-red-500 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="text-red-500" />
              <h3 className="text-xl font-bold text-red-500">
                iPad Sound Instructions
              </h3>
            </div>
            <p className="text-white text-lg font-bold mb-2">
              ⚠️ Look for the RED "UNLOCK SOUNDS" button in the corner! ⚠️
            </p>
            <p className="text-white">
              Safari requires you to tap the PLAY button on at least one audio control before any sounds will work.
            </p>
          </div>
        )}
        
        <div id="sound-test-target" className="mb-10">
          <SoundTestPanel />
        </div>
        
        {/* Feature Showcase */}
        <FeatureShowcase />
        
        {/* Character Selection and Wisdom */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-12">
          <div className="lg:col-span-2">
            <BibleCharacterSelector 
              selectedCharacter={selectedCharacter as any}
              onSelect={(character) => setSelectedCharacter(character)}
            />
          </div>
          
          <div>
            <WisdomCard 
              scripture={financialVerse.text}
              reference={financialVerse.reference}
              principle="Wise stewardship requires careful planning and management of resources."
              application="Apply this by creating a monthly budget that prioritizes giving, saving, and responsible spending."
              tags={["stewardship", "planning", "finance"]}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <DailyScripture />
          <FarcasterFrame />
        </div>
        
        <FeatureCards />
        
        <div className="my-12">
          <Card className="bg-scripture/20 border border-ancient-gold shadow-md">
            <CardContent className="p-6">
              <h2 className="text-2xl text-white font-scroll mb-4">Bible.fi Mini-App</h2>
              <p className="text-white/80 mb-4 font-scroll">
                Bible.fi is built specifically to run as a mini-app inside Farcaster, 
                offering biblical financial wisdom directly to the Farcaster community.
              </p>
              
              <div className="flex justify-center my-6">
                <img 
                  src="/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png" 
                  alt="Farcaster Logo"
                  className="h-16"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <TaxSection />
      </main>
    </div>
  );
};

export default Index;
