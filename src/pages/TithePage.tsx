
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import PixelCharacter from "@/components/PixelCharacter";
import ScriptureCard from "@/components/ScriptureCard";
import { getVersesByCategory } from "@/data/bibleVerses";
import { useSound } from "@/contexts/SoundContext";
import ChurchSearch from "@/components/tithe/ChurchSearch";
import ImpactStories from "@/components/tithe/ImpactStories";
import TitheForm from "@/components/tithe/TitheForm";
import TithingAchievements from "@/components/tithe/TithingAchievements";
import SaintsWisdom from "@/components/tithe/SaintsWisdom";

const TithePage: React.FC = () => {
  const givingVerses = getVersesByCategory("giving");
  const { playSound, userInteracted } = useSound();
  
  // Play page load sound when user has interacted
  useEffect(() => {
    if (userInteracted) {
      playSound("scroll");
    }
  }, [userInteracted, playSound]);
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-scroll text-scripture-dark mb-4">Digital Tithing</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Give your tithe to churches worldwide, even if they don't accept cryptocurrency.
          </p>
        </section>
        
        <PixelCharacter 
          character="jesus" 
          message="It is more blessed to give than to receive. - Acts 20:35"
          className="mb-8 max-w-2xl mx-auto"
          soundEffect={true}
        />
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ChurchSearch />
            <ImpactStories />
          </div>
          
          <div>
            <TitheForm />
            
            <div className="mb-6">
              <PixelCharacter 
                character="david" 
                message="I will not sacrifice to the LORD my GOD burnt offerings that cost me nothing. - 2 Samuel 24:24"
                size="md"
                soundEffect={true}
              />
            </div>
            
            <TithingAchievements />
            
            {givingVerses.length > 0 && (
              <ScriptureCard verse={givingVerses[0]} />
            )}
          </div>
        </div>
        
        <SaintsWisdom />
      </main>
      
      {/* Hidden audio player to enable sound on iOS */}
      <audio id="sound-enabler" preload="auto" src="/sounds/click.mp3" style={{ display: 'none' }} />
    </div>
  );
};

export default TithePage;
