
import React, { useState } from "react";
import SenpiAIWisdom from "./SenpiAIWisdom";
import PixelButton from "../PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { Volume, VolumeOff } from "lucide-react";
import PixelCharacter from "../PixelCharacter";

const SenpiWisdomSection: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();
  const [lastPlayedSound, setLastPlayedSound] = useState<string | null>(null);

  // Function to play test sounds
  const playTestSound = (sound: "coin" | "scroll" | "powerup" | "select" | "click" | "error" | "success") => {
    setUserInteracted(true); // Important: Mark user as interacted
    playSound(sound);
    setLastPlayedSound(sound);
  };

  return (
    <div className="my-8">
      <h2 className="text-2xl font-scroll mb-4 text-glow">AI-Powered Biblical Wisdom</h2>
      
      {/* Sound test section - improved for better user experience */}
      <div className="bg-black/80 border-2 border-scripture p-4 rounded-lg mb-6">
        <h3 className="text-xl font-game mb-3 text-ancient-gold">Sound Test Center</h3>
        <p className="mb-4 text-white">
          Click any button below to test sounds. Each button plays a different retro arcade sound effect.
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-pixel">Sound: {isSoundEnabled ? 'ON' : 'OFF'}</span>
          <button 
            onClick={() => {
              toggleSound();
              playSound("click");
            }} 
            className="flex items-center bg-scripture px-3 py-1 rounded"
          >
            {isSoundEnabled ? <Volume size={20} /> : <VolumeOff size={20} />}
            <span className="ml-2">{isSoundEnabled ? 'Mute' : 'Unmute'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <PixelButton onClick={() => playTestSound("coin")}>Coin 💰</PixelButton>
          <PixelButton onClick={() => playTestSound("scroll")}>Scroll 📜</PixelButton>
          <PixelButton onClick={() => playTestSound("powerup")}>Powerup ⚡</PixelButton>
          <PixelButton onClick={() => playTestSound("select")}>Select ✅</PixelButton>
          <PixelButton onClick={() => playTestSound("click")}>Click 🖱️</PixelButton>
          <PixelButton onClick={() => playTestSound("error")}>Error ❌</PixelButton>
          <PixelButton onClick={() => playTestSound("success")}>Success 🎉</PixelButton>
        </div>
        
        {lastPlayedSound && (
          <div className="text-center text-pixel-green font-pixel animate-pulse mt-2">
            Attempted to play: {lastPlayedSound} sound
          </div>
        )}
        
        <div className="bg-black/50 border border-scripture p-3 mt-4 rounded text-white text-sm">
          <h4 className="font-bold mb-1">Sound Troubleshooting Tips:</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Try clicking multiple buttons - browsers require user interaction</li>
            <li>Make sure your device volume is turned up</li>
            <li>For iOS/Safari: tap the screen a few times first</li>
            <li>Make sure your browser allows sounds (check permissions)</li>
            <li>Try refreshing the page and clicking immediately</li>
          </ol>
        </div>
      </div>
      
      {/* Character demonstrates sound - improved interaction */}
      <div className="mb-6">
        <h3 className="text-xl font-game mb-3 text-pixel-yellow">Meet the Bible Characters</h3>
        <p className="mb-4 text-white">Click on any character to hear their sound effect!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <PixelCharacter 
            character="solomon" 
            message="The wise have wealth and luxury, but fools spend whatever they get. - Proverbs 21:20"
          />
          
          <PixelCharacter 
            character="jesus" 
            message="Give, and it will be given to you. - Luke 6:38"
          />
          
          <PixelCharacter 
            character="coin" 
            message="Honor the Lord with your wealth. - Proverbs 3:9"
          />
        </div>
      </div>
      
      <SenpiAIWisdom />
    </div>
  );
};

export default SenpiWisdomSection;
