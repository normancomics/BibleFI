
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSound } from "@/contexts/SoundContext";
import PixelCharacter from "@/components/PixelCharacter";
import { CharacterType } from "@/components/PixelCharacter";
import { Scroll, Coins, Book, GraduationCap } from "lucide-react";

interface BibleCharacterSelectorProps {
  onSelect?: (character: CharacterType) => void;
  selectedCharacter?: CharacterType;
  className?: string;
}

const BibleCharacterSelector: React.FC<BibleCharacterSelectorProps> = ({
  onSelect,
  selectedCharacter = "solomon",
  className = ""
}) => {
  const { playSound } = useSound();
  
  const characters: Array<{
    id: CharacterType;
    name: string;
    wisdom: number;
    specialty: "finance" | "wisdom" | "leadership" | "faith";
    description: string;
  }> = [
    {
      id: "solomon",
      name: "King Solomon",
      wisdom: 100,
      specialty: "wisdom",
      description: "Known for his great wealth and wisdom about finances"
    },
    {
      id: "david",
      name: "King David",
      wisdom: 85,
      specialty: "leadership",
      description: "Managed kingdom resources with divine guidance"
    },
    {
      id: "moses",
      name: "Moses",
      wisdom: 90,
      specialty: "leadership",
      description: "Led God's people with wisdom and faithfulness"
    },
    {
      id: "jesus",
      name: "Jesus",
      wisdom: 100,
      specialty: "wisdom",
      description: "Taught many parables about money and stewardship"
    }
  ];
  
  const handleSelect = (character: CharacterType) => {
    playSound("select");
    if (onSelect) {
      onSelect(character);
    }
  };
  
  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case "finance":
        return <Coins className="h-3 w-3 mr-1" />;
      case "wisdom":
        return <Book className="h-3 w-3 mr-1" />;
      case "leadership":
        return <GraduationCap className="h-3 w-3 mr-1" />;
      case "faith":
        return <Scroll className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className={`bg-black/60 border-2 border-ancient-gold/50 shadow-md ${className}`}>
      <CardContent className="p-4">
        <h3 className="text-center text-ancient-gold font-pixel text-lg mb-4">Choose Your Guide</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {characters.map((character) => (
            <div 
              key={character.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 rounded-md p-2 ${
                selectedCharacter === character.id 
                  ? 'bg-scripture/40 border border-ancient-gold' 
                  : 'bg-black/30 hover:bg-scripture/20'
              }`}
              onClick={() => handleSelect(character.id)}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <PixelCharacter 
                    character={character.id} 
                    size="md" 
                  />
                  <Badge className="absolute -top-2 -right-2 bg-ancient-gold text-black text-xs font-pixel">
                    {character.wisdom}
                  </Badge>
                </div>
                
                <h4 className="mt-2 text-sm font-pixel text-white text-center">
                  {character.name}
                </h4>
                
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs flex items-center justify-center px-1 py-0.5">
                    {getSpecialtyIcon(character.specialty)}
                    <span>{character.specialty}</span>
                  </Badge>
                </div>
                
                <p className="text-xs text-white/70 mt-2 text-center hidden md:block">
                  {character.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BibleCharacterSelector;
