
import React, { useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import SoundButton from "../ui/SoundButton";
import { SoundType } from "../SoundEffect";

const SoundTestPanel: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();
  const [lastPlayedSound, setLastPlayedSound] = useState<string | null>(null);

  const handlePlaySound = (sound: SoundType) => {
    setUserInteracted(true);
    playSound(sound);
    setLastPlayedSound(sound);
  };

  return (
    <div className="bg-black/70 border-2 border-ancient-gold p-4 rounded-lg my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-ancient-gold text-xl font-bold">Sound Test Panel</h3>
        <button 
          onClick={toggleSound}
          className="flex items-center bg-scripture px-3 py-1 rounded"
        >
          {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="ml-2">{isSoundEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button 
          onClick={() => handlePlaySound("coin")} 
          className="bg-base-blue text-white py-2 px-3 rounded font-bold hover:bg-base-blue/80"
        >
          COIN 💰
        </button>
        <button 
          onClick={() => handlePlaySound("click")} 
          className="bg-scripture text-white py-2 px-3 rounded font-bold hover:bg-scripture/80"
        >
          CLICK 🖱️
        </button>
        <button 
          onClick={() => handlePlaySound("scroll")} 
          className="bg-ancient-gold text-black py-2 px-3 rounded font-bold hover:bg-ancient-gold/80"
        >
          SCROLL 📜
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => handlePlaySound("powerup")} 
          className="bg-ancient-temple text-black py-2 px-3 rounded font-bold hover:bg-ancient-temple/80"
        >
          POWERUP ⚡
        </button>
        <button 
          onClick={() => handlePlaySound("success")} 
          className="bg-pixel-green text-black py-2 px-3 rounded font-bold hover:bg-pixel-green/80"
        >
          SUCCESS 🎉
        </button>
      </div>
      
      {lastPlayedSound && (
        <div className="mt-3 text-center text-ancient-gold">
          Last played: {lastPlayedSound} sound
        </div>
      )}
      
      <p className="text-sm text-white/70 mt-2">
        Sound not working? Try clicking buttons directly or refreshing the page.
      </p>
    </div>
  );
};

export default SoundTestPanel;
