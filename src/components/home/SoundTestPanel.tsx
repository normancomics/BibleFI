
import React from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";

const SoundTestPanel: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();

  const handlePlaySound = (sound: "coin" | "click" | "scroll" | "select" | "powerup" | "success" | "error") => {
    setUserInteracted(true);
    playSound(sound);
  };

  return (
    <div className="bg-black/70 border-2 border-ancient-gold p-4 rounded-lg my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-ancient-gold text-xl font-pixel">SOUND TEST</h3>
        <button 
          onClick={toggleSound}
          className="flex items-center bg-scripture px-3 py-1 rounded"
        >
          {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="ml-2 font-pixel">{isSoundEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>
      
      <p className="text-white mb-3">Click buttons to test sounds:</p>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button 
          onClick={() => handlePlaySound("coin")} 
          className="bg-base-blue text-white py-1 px-2 rounded font-pixel hover:bg-base-blue/80"
        >
          COIN 💰
        </button>
        <button 
          onClick={() => handlePlaySound("click")} 
          className="bg-scripture text-white py-1 px-2 rounded font-pixel hover:bg-scripture/80"
        >
          CLICK 🖱️
        </button>
        <button 
          onClick={() => handlePlaySound("scroll")} 
          className="bg-ancient-gold text-black py-1 px-2 rounded font-pixel hover:bg-ancient-gold/80"
        >
          SCROLL 📜
        </button>
      </div>
      
      <p className="text-sm text-white/70 mt-2">
        Sound not working? Try clicking buttons directly or refreshing the page.
      </p>
    </div>
  );
};

export default SoundTestPanel;
