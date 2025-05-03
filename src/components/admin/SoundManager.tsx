
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSound } from "@/contexts/SoundContext";
import { SoundType } from "@/components/SoundEffect";

const SOUND_TYPES: SoundType[] = [
  "coin", "scroll", "powerup", "select", "click", "error", "success"
];

const SoundManager: React.FC = () => {
  const { playSound } = useSound();
  const [currentSound, setCurrentSound] = useState<SoundType | null>(null);
  
  const playTestSound = (sound: SoundType) => {
    setCurrentSound(sound);
    playSound(sound);
  };
  
  return (
    <Card className="pixel-card mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-game text-scripture">Sound File Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-black/50 border-pixel-yellow">
          <AlertTitle className="text-pixel-yellow">About Sound Files</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Bible.Fi uses free 8-bit/retro arcade sound effects. You can test the built-in sounds below or replace them with your own.
            </p>
            <p>
              For custom sounds, upload MP3 files to the public/sounds folder with the exact names listed below.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOUND_TYPES.map(sound => (
            <div 
              key={sound}
              className={`p-3 rounded border cursor-pointer transition-all ${
                currentSound === sound ? 'border-scripture bg-black/70' : 'border-gray-700 bg-black/30'
              }`}
              onClick={() => playTestSound(sound)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-pixel text-ancient-gold">{sound}.mp3</h4>
                  <p className="text-xs text-gray-400">Click to test</p>
                </div>
                <div className="text-2xl">{getEmojiForSound(sound)}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-5 text-sm text-gray-400">
          <h4 className="font-bold mb-2">Where to find free sounds:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><a href="https://freesound.org/search/?q=8-bit" className="underline" target="_blank" rel="noopener noreferrer">freesound.org</a> - search for "8-bit" or "arcade"</li>
            <li><a href="https://pixabay.com/sound-effects/search/arcade/" className="underline" target="_blank" rel="noopener noreferrer">pixabay.com</a> - free sound effects</li>
            <li><a href="https://mixkit.co/free-sound-effects/game/" className="underline" target="_blank" rel="noopener noreferrer">mixkit.co</a> - free game sounds</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get emoji for sound type
function getEmojiForSound(sound: SoundType): string {
  switch (sound) {
    case "coin": return "💰";
    case "scroll": return "📜";
    case "powerup": return "⚡";
    case "select": return "✅";
    case "click": return "🖱️";
    case "error": return "❌";
    case "success": return "🎉";
    default: return "🔊";
  }
}

export default SoundManager;
