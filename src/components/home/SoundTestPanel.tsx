
import React, { useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { SoundType } from "../SoundEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SoundTestPanel: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted, userInteracted } = useSound();
  const [lastPlayedSound, setLastPlayedSound] = useState<string | null>(null);
  const [testCount, setTestCount] = useState(0);

  const handlePlaySound = (sound: SoundType) => {
    setUserInteracted(true); // Important to mark user as interacted
    playSound(sound);
    setLastPlayedSound(sound);
    setTestCount(prev => prev + 1);
  };
  
  const unlockAudioForIOS = () => {
    // Create and play multiple silent sounds to maximize chances of unlocking
    const audioElements = [];
    const soundTypes = ["click", "coin", "select"];
    
    soundTypes.forEach(soundType => {
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.volume = 0.1;
      audio.muted = false;
      audio.load();
      
      // Play with user gesture
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log(`Failed attempt: ${e}`));
      }
      
      audioElements.push(audio);
    });
    
    setUserInteracted(true);
    setTimeout(() => playSound("coin"), 300);
  };

  return (
    <Card className="border-2 border-scripture">
      <CardHeader className="bg-black/70">
        <CardTitle className="text-ancient-gold flex items-center justify-between">
          <span>Sound Test Center</span>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              toggleSound();
              if (isSoundEnabled) {
                playSound("click");
              }
            }}
            className="flex items-center gap-2"
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{isSoundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {!userInteracted && (
          <div className="bg-black/50 border border-yellow-500/50 p-3 rounded-md mb-4">
            <p className="text-yellow-400 font-bold mb-1">⚠️ Sounds require user interaction</p>
            <p className="text-sm text-white/80">
              Mobile browsers (especially iOS) require user action before playing audio.
              Tap the button below to enable sound:
            </p>
            <Button 
              className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              onClick={unlockAudioForIOS}
            >
              TAP HERE TO ENABLE AUDIO ON YOUR IPAD
            </Button>
          </div>
        )}

        <p className="text-white/80">
          Click any button below to test sounds. Each button plays a different sound effect.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <Button 
            variant="outline" 
            className="bg-scripture/20 text-white flex flex-col items-center py-4 h-auto"
            onClick={() => handlePlaySound("coin")}
          >
            <span className="text-2xl mb-1">💰</span>
            <span>Coin</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-ancient-gold/20 text-white flex flex-col items-center py-4 h-auto"
            onClick={() => handlePlaySound("click")}
          >
            <span className="text-2xl mb-1">🖱️</span>
            <span>Click</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-scripture/20 text-white flex flex-col items-center py-4 h-auto"
            onClick={() => handlePlaySound("scroll")}
          >
            <span className="text-2xl mb-1">📜</span>
            <span>Scroll</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-ancient-gold/20 text-white flex flex-col items-center py-4 h-auto"
            onClick={() => handlePlaySound("powerup")}
          >
            <span className="text-2xl mb-1">⚡</span>
            <span>Powerup</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-green-500/20 text-white flex flex-col items-center py-4 h-auto"
            onClick={() => handlePlaySound("success")}
          >
            <span className="text-2xl mb-1">🎉</span>
            <span>Success</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-red-500/20 text-white flex flex-col items-center py-4 h-auto"
            onClick={() => handlePlaySound("error")}
          >
            <span className="text-2xl mb-1">❌</span>
            <span>Error</span>
          </Button>
        </div>
        
        {lastPlayedSound && (
          <div className={`text-center font-pixel ${testCount > 1 ? 'text-white' : 'text-ancient-gold animate-pulse'}`}>
            Last played: {lastPlayedSound} sound
            {testCount === 1 && <p className="text-xs mt-1">Try clicking more buttons!</p>}
          </div>
        )}
        
        <div className="bg-black/50 border border-ancient-gold/20 p-3 rounded text-sm text-white/70 mt-4">
          <h4 className="font-bold mb-1">🔍 iPad Sound Troubleshooting:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure your iPad volume is turned up</li>
            <li>Make sure your iPad is not in silent mode</li>
            <li>Try closing other apps that might be using audio</li>
            <li>Try refreshing the page and immediately tapping a sound button</li>
            <li>For Safari: Check Settings → Safari → Content Blockers are disabled</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundTestPanel;
