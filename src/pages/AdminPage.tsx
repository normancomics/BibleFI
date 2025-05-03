
import React from 'react';
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SoundManager from "@/components/admin/SoundManager";
import PixelCharacter from "@/components/PixelCharacter";
import { CharacterType } from "@/components/PixelCharacter";
import { useSound } from "@/contexts/SoundContext";

const AdminPage: React.FC = () => {
  const { playSound } = useSound();
  
  // List of all available character types
  const characterTypes: CharacterType[] = [
    "jesus", "moses", "solomon", "david", "noah", "paul", 
    "god", "joseph", "abraham", "widow", "taxcollector", "caesar", "coin"
  ];
  
  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-game text-scripture mb-6">Admin Tools</h1>
        
        {/* Sound Management Section */}
        <SoundManager />
        
        {/* Character Preview Section */}
        <Card className="pixel-card mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-game text-scripture">Character Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Click on any character to hear their sound effect. To replace character images, 
              upload pixel art PNGs (recommended size: 64x64 or 32x32 pixels) to the public folder.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {characterTypes.map(type => (
                <div key={type} className="text-center" onClick={() => playSound("select")}>
                  <PixelCharacter 
                    character={type}
                    withSpeech={false}
                    size={40}
                  />
                  <p className="mt-2 text-sm text-gray-400">/{type}-pixel.png</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-black/50 border border-scripture rounded">
              <h3 className="font-pixel text-ancient-gold mb-2">Character Image Requirements:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>32x32 or 64x64 pixels (square format)</li>
                <li>PNG format with transparency</li>
                <li>Pixelated retro style (8-bit or 16-bit aesthetic)</li>
                <li>High contrast colors for visibility</li>
                <li>Simple design that works at small sizes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminPage;
