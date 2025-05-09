
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { SoundType } from "../SoundEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const SoundTestPanel: React.FC = () => {
  const { playSound, isSoundEnabled, toggleSound, setUserInteracted } = useSound();
  const [lastPlayedSound, setLastPlayedSound] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<HTMLAudioElement[]>([]);
  const [showSafariControls, setShowSafariControls] = useState(false);

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
    
    // For Safari, create a visible audio element
    if (isIOS || isSafari) {
      createVisibleAudio(sound);
    }
  };
  
  const createVisibleAudio = (sound: SoundType) => {
    // Create audio element with controls
    const audio = document.createElement('audio');
    audio.src = `/sounds/${sound}.mp3`;
    audio.controls = true;
    audio.className = "w-full mb-2";
    audio.volume = 0.7;
    
    // Try to play it
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(e => console.error("Autoplay failed:", e));
    }
    
    // Add to state to render
    setAudioElements(prev => [...prev, audio]);
  };
  
  // Display all Safari audio controls
  const showAllSafariAudioControls = () => {
    setShowSafariControls(true);
    setUserInteracted(true);
    
    // Create controls for all sound types
    const soundTypes: SoundType[] = ["coin", "click", "scroll", "powerup", "select", "success", "error"];
    soundTypes.forEach(sound => createVisibleAudio(sound));
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
        {(isIOS || isSafari) && (
          <Alert variant="destructive" className="bg-red-900/30 border-red-500">
            <AlertTitle className="text-red-400 text-lg">iPad/Safari Sound Fix</AlertTitle>
            <AlertDescription>
              <p className="mb-3 text-white">
                Safari requires you to interact with audio controls directly:
              </p>
              <Button 
                onClick={showAllSafariAudioControls}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-bold"
              >
                SHOW SAFARI AUDIO CONTROLS
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Show visible audio controls for Safari */}
        {showSafariControls && (
          <div className="bg-black/80 border border-ancient-gold p-4 rounded-md mb-4">
            <h3 className="text-ancient-gold text-lg font-bold mb-3">iOS/Safari Audio Controls</h3>
            <p className="text-white mb-3">Tap PLAY on any sound below to enable audio:</p>
            
            <div id="safari-audio-container" className="flex flex-col gap-2 mb-4">
              {/* Audio elements will be inserted here */}
              {audioElements.map((_, index) => (
                <div key={index} className="audio-element-container" 
                     ref={el => {
                       if (el && audioElements[index]) {
                         el.innerHTML = '';
                         el.appendChild(audioElements[index]);
                       }
                     }} />
              ))}
            </div>
            
            <Button 
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowSafariControls(false)}
            >
              Hide Audio Controls
            </Button>
          </div>
        )}

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
        
        <div className="bg-black/50 border border-ancient-gold/20 p-4 rounded text-sm text-white/70 mt-4">
          <h4 className="font-bold mb-2">iPad Sound Troubleshooting:</h4>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Switch to Safari</strong> - Edge and Chrome are more restrictive on iOS</li>
            <li><strong>Use the red "SHOW SAFARI AUDIO CONTROLS" button</strong> above</li>
            <li>Ensure iPad is not in silent mode (check side switch)</li>
            <li>Turn up volume with side buttons</li>
            <li>Close and reopen browser completely</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundTestPanel;
