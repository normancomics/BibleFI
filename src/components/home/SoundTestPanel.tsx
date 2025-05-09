
import React, { useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { SoundType } from "../SoundEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SoundTestPanel: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();
  const [lastPlayedSound, setLastPlayedSound] = useState<string | null>(null);
  
  // Check if on iPad/iOS
  const isIOS = typeof navigator !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    
  const isSafari = typeof navigator !== 'undefined' && 
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const handlePlaySound = (sound: SoundType) => {
    setUserInteracted(true);
    playSound(sound);
    setLastPlayedSound(sound);
  };

  return (
    <Card className="border-2 border-scripture mb-8">
      <CardHeader className="bg-black/70">
        <CardTitle className="text-ancient-gold flex items-center justify-between">
          <span>Sound Test Center</span>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              toggleSound();
              setUserInteracted(true);
            }}
            className="flex items-center gap-2"
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{isSoundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        <div className="text-white mb-4">
          Click any button below to test sounds. Each button plays a different sound effect.
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <Button 
            variant="outline" 
            className="bg-scripture/20 text-white flex flex-col items-center py-6 h-auto"
            onClick={() => handlePlaySound("coin")}
            size="lg"
          >
            <span className="text-3xl mb-2">💰</span>
            <span className="text-lg">Coin</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-ancient-gold/20 text-white flex flex-col items-center py-6 h-auto"
            onClick={() => handlePlaySound("click")}
            size="lg"
          >
            <span className="text-3xl mb-2">🖱️</span>
            <span className="text-lg">Click</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-scripture/20 text-white flex flex-col items-center py-6 h-auto"
            onClick={() => handlePlaySound("scroll")}
            size="lg"
          >
            <span className="text-3xl mb-2">📜</span>
            <span className="text-lg">Scroll</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-ancient-gold/20 text-white flex flex-col items-center py-6 h-auto"
            onClick={() => handlePlaySound("powerup")}
            size="lg"
          >
            <span className="text-3xl mb-2">⚡</span>
            <span className="text-lg">Powerup</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-green-500/20 text-white flex flex-col items-center py-6 h-auto"
            onClick={() => handlePlaySound("success")}
            size="lg"
          >
            <span className="text-3xl mb-2">🎉</span>
            <span className="text-lg">Success</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-red-500/20 text-white flex flex-col items-center py-6 h-auto"
            onClick={() => handlePlaySound("error")}
            size="lg"
          >
            <span className="text-3xl mb-2">❌</span>
            <span className="text-lg">Error</span>
          </Button>
        </div>
        
        {lastPlayedSound && (
          <div className="text-center font-pixel text-white animate-pulse mt-2">
            Last played: {lastPlayedSound} sound
          </div>
        )}
        
        {(isIOS || isSafari) && (
          <div className="bg-black/50 border border-red-500 p-4 rounded text-sm text-white mt-4">
            <h4 className="font-bold mb-2">Using iPad/Safari?</h4>
            <p className="mb-2">
              Look for the <strong>RED "UNLOCK SOUNDS" button</strong> in the 
              bottom-right corner of your screen, then tap PLAY on any audio control.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SoundTestPanel;
