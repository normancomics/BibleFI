
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
import SoundTestPanel from "@/components/home/SoundTestPanel";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import IOSAudioUnlocker from "@/components/iOSAudioUnlocker"; // Fixed import with capital I for iOS

const Index: React.FC = () => {
  const { setUserInteracted } = useSound();
  
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
  
  return (
    <div className="min-h-screen">
      <IOSAudioUnlocker /> {/* Fixed with capital I */}
      <SoundInitializer />
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <FarcasterConnect size="sm" />
        </div>
        
        <HomeHeader />
        
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
