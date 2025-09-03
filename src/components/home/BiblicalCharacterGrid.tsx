
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { BookOpen, Crown, Gavel, Heart, Shield, Star, DollarSign, Scale, Handshake } from "lucide-react";

interface BiblicalCharacter {
  id: string;
  name: string;
  title: string;
  wisdom: string;
  verse: string;
  reference: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const characters: BiblicalCharacter[] = [
  {
    id: "solomon",
    name: "Solomon",
    title: "The Wise King",
    wisdom: "Diversify your investments and plan for the future",
    verse: "Divide your portion to seven, or even to eight, for you do not know what misfortune may occur on the earth.",
    reference: "Ecclesiastes 11:2",
    icon: Crown,
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20"
  },
  {
    id: "joseph",
    name: "Joseph",
    title: "The Steward",
    wisdom: "Save during abundance for times of scarcity",
    verse: "Let Pharaoh proceed to appoint overseers over the land and take one-fifth of the produce of the land of Egypt during the seven plentiful years.",
    reference: "Genesis 41:34",
    icon: Shield,
    color: "text-green-400",
    bgColor: "bg-green-900/20"
  },
  {
    id: "david",
    name: "David",
    title: "The Faithful Shepherd",
    wisdom: "The Lord is my shepherd; I shall not want. He guides me to green pastures and leads me in paths of righteousness.",
    verse: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
    icon: Star,
    color: "text-emerald-400",
    bgColor: "bg-emerald-900/20"
  },
  {
    id: "zacchaeus",
    name: "Zacchaeus",
    title: "The Reformed Tax Collector",
    wisdom: "True wealth comes from generous giving and making amends for past wrongs",
    verse: "Half of my goods I give to the poor, and if I have defrauded anyone, I restore fourfold.",
    reference: "Luke 19:8",
    icon: DollarSign,
    color: "text-amber-400",
    bgColor: "bg-amber-900/20"
  },
  {
    id: "matthew",
    name: "Matthew",
    title: "The Transformed Financier",
    wisdom: "You cannot serve both God and money - choose your master wisely",
    verse: "No one can serve two masters. You cannot serve both God and money.",
    reference: "Matthew 6:24",
    icon: Scale,
    color: "text-indigo-400",
    bgColor: "bg-indigo-900/20"
  },
  {
    id: "widow",
    name: "The Widow",
    title: "The Faithful Giver",
    wisdom: "True generosity comes from the heart, not the wallet size",
    verse: "She gave out of her poverty, all she had to live on.",
    reference: "Mark 12:44",
    icon: Heart,
    color: "text-rose-400",
    bgColor: "bg-rose-900/20"
  },
  {
    id: "barnabas",
    name: "Barnabas",
    title: "The Generous Supporter",
    wisdom: "Use your resources to support God's work and build His kingdom",
    verse: "He sold a field and brought the money to support the apostles' ministry.",
    reference: "Acts 4:37",
    icon: Handshake,
    color: "text-teal-400",
    bgColor: "bg-teal-900/20"
  },
  {
    id: "moses",
    name: "Moses",
    title: "The Lawgiver",
    wisdom: "Practice ethical business with just measures",
    verse: "You shall not have in your bag differing weights, a heavy and a light.",
    reference: "Deuteronomy 25:13",
    icon: Gavel,
    color: "text-purple-400",
    bgColor: "bg-purple-900/20"
  },
  {
    id: "proverbs31",
    name: "The Virtuous Woman",
    title: "The Entrepreneur",
    wisdom: "Invest wisely and build sustainable wealth",
    verse: "She considers a field and buys it; from her profits she plants a vineyard.",
    reference: "Proverbs 31:16",
    icon: Heart,
    color: "text-pink-400",
    bgColor: "bg-pink-900/20"
  },
  {
    id: "jesus",
    name: "Jesus",
    title: "The Master Teacher",
    wisdom: "Use your talents to multiply and serve others",
    verse: "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.",
    reference: "Matthew 25:23",
    icon: BookOpen,
    color: "text-ancient-gold",
    bgColor: "bg-ancient-gold/20"
  }
];

const BiblicalCharacterGrid: React.FC = () => {
  const { playSound } = useSound();
  const [selectedCharacter, setSelectedCharacter] = useState<BiblicalCharacter | null>(null);

  const handleCharacterClick = (character: BiblicalCharacter) => {
    playSound("select");
    setSelectedCharacter(character);
  };

  const handleCloseModal = () => {
    playSound("click");
    setSelectedCharacter(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-scroll text-ancient-gold mb-4">
          Biblical Financial Wisdom
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Learn from the greatest financial minds in history. Each character offers timeless principles 
          that guide our DeFi platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => {
          const IconComponent = character.icon;
          return (
            <Card 
              key={character.id}
              className={`${character.bgColor} border border-ancient-gold/30 hover:border-ancient-gold/60 transition-all duration-300 cursor-pointer transform hover:scale-105`}
              onClick={() => handleCharacterClick(character)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${character.bgColor} border border-current flex items-center justify-center ${character.color}`}>
                  <IconComponent size={24} />
                </div>
                <h3 className="font-scroll text-lg text-white mb-1">{character.name}</h3>
                <p className={`text-sm ${character.color} mb-2`}>{character.title}</p>
                <p className="text-xs text-white/70">{character.wisdom}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className={`max-w-md w-full ${selectedCharacter.bgColor} border border-ancient-gold/50`}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className={`w-20 h-20 mx-auto mb-3 rounded-full ${selectedCharacter.bgColor} border-2 border-current flex items-center justify-center ${selectedCharacter.color}`}>
                  <selectedCharacter.icon size={32} />
                </div>
                <h3 className="font-scroll text-2xl text-white mb-1">{selectedCharacter.name}</h3>
                <p className={`text-lg ${selectedCharacter.color} mb-4`}>{selectedCharacter.title}</p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg border border-ancient-gold/20 mb-4">
                <h4 className="font-medium text-ancient-gold mb-2">Financial Wisdom:</h4>
                <p className="text-white/90 mb-3">{selectedCharacter.wisdom}</p>
                <blockquote className="italic text-white/80 text-sm">
                  "{selectedCharacter.verse}"
                </blockquote>
                <p className="text-ancient-gold/70 text-right text-xs mt-2">
                  — {selectedCharacter.reference}
                </p>
              </div>

              <PixelButton
                onClick={handleCloseModal}
                className="w-full"
                farcasterStyle
              >
                Continue Learning
              </PixelButton>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BiblicalCharacterGrid;
