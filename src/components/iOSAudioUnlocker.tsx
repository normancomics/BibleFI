
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, Music } from "lucide-react";

const iOSAudioUnlocker: React.FC = () => {
  const [showControls, setShowControls] = useState(false);
  const [audioElements, setAudioElements] = useState<HTMLAudioElement[]>([]);
  
  // Check if we're on iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
               
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  const unlockAudio = () => {
    setShowControls(true);
    
    // Create fully visible audio elements for each sound file
    const sounds = ['click', 'coin', 'select', 'powerup', 'scroll', 'success', 'error'];
    const newElements: HTMLAudioElement[] = [];
    
    sounds.forEach(sound => {
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.controls = true; // Critical for iOS Safari
      audio.volume = 0.5;
      audio.loop = false;
      
      newElements.push(audio);
    });
    
    setAudioElements(newElements);
  };
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      audioElements.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [audioElements]);
  
  if (!isIOS && !isSafari) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {!showControls ? (
        <Button
          onClick={unlockAudio}
          className="bg-red-600 hover:bg-red-700 flex items-center gap-2 px-4 py-3 text-white font-bold animate-pulse"
          size="lg"
        >
          <Music className="h-6 w-6" />
          <span className="font-bold">UNLOCK SOUNDS (SAFARI)</span>
        </Button>
      ) : (
        <div className="bg-black/90 border-2 border-red-500 p-4 rounded-lg w-[300px] max-w-full">
          <h3 className="text-white font-bold mb-2 flex items-center">
            <Volume2 className="mr-2" /> Tap Play on ANY Audio
          </h3>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {audioElements.map((audio, index) => (
              <div 
                key={index} 
                className="audio-container bg-gray-800 p-2 rounded"
                ref={el => {
                  if (el && audio) {
                    el.innerHTML = '';
                    el.appendChild(audio);
                  }
                }}
              />
            ))}
          </div>
          
          <div className="mt-3 text-white/80 text-sm">
            <p>After playing any sound, all audio will be unlocked</p>
          </div>
          
          <Button 
            onClick={() => setShowControls(false)} 
            className="mt-3 w-full"
            variant="outline"
          >
            Close Audio Panel
          </Button>
        </div>
      )}
    </div>
  );
};

export default iOSAudioUnlocker;
