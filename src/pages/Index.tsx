
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import HomeHeader from "@/components/home/HomeHeader";
import FeatureCards from "@/components/home/FeatureCards";
import TaxSection from "@/components/home/TaxSection";
import { useSound } from "@/contexts/SoundContext";
import FarcasterFrame from "@/farcaster/FarcasterFrame";
import FarcasterConnect from "@/farcaster/FarcasterConnect";
import SoundInitializer from "@/components/SoundInitializer";
import SoundTestPanel from "@/components/home/SoundTestPanel";
import { Card, CardContent } from "@/components/ui/card";

const Index: React.FC = () => {
  const { playSound, setUserInteracted } = useSound();
  
  useEffect(() => {
    // Force enable user interaction for development
    setUserInteracted(true);
    
    // Try to play a sound to unlock audio context
    const timer = setTimeout(() => {
      playSound("select");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [playSound, setUserInteracted]);
  
  return (
    <div className="min-h-screen">
      <SoundInitializer />
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <FarcasterConnect size="sm" />
        </div>
        
        <HomeHeader />
        
        <Card className="border-2 border-scripture mb-8">
          <CardContent className="p-4">
            <h2 className="text-2xl font-bold text-center text-ancient-gold mb-4">
              SOUND TEST CENTER
            </h2>
            <p className="text-white mb-4">
              Click the buttons below to test the sound effects. Make sure your volume is turned up!
            </p>
            
            <SoundTestPanel />
          </CardContent>
        </Card>
        
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
