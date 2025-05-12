
import React, { useEffect } from "react";
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
import BibleCharacterSelector from "@/components/characters/BibleCharacterSelector";
import WisdomCard from "@/components/wisdom/WisdomCard";
import { getRandomVerse } from "@/data/bibleVerses";

const Index: React.FC = () => {
  const { setUserInteracted } = useSound();
  const [selectedCharacter, setSelectedCharacter] = React.useState("solomon");
  
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
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <FarcasterConnect size="sm" />
        </div>
        
        {/* Hero section */}
        <BiblefiHero />
        
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
              tags={[financialVerse.category]}
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
      
      {/* Moved "Made on Base Chain" to the bottom as a footer */}
      <footer className="py-4 text-center">
        <p className="text-xs font-pixel tracking-wider text-scripture-dark/40 hover:text-scripture-dark/60 transition-colors">
          MADE ON 
          <img 
            src="https://base.org/images/favicon.png" 
            alt="Base Chain Logo" 
            className="w-3 h-3 inline-block mx-1"
          />
          BASE CHAIN
        </p>
      </footer>
    </div>
  );
};

export default Index;
