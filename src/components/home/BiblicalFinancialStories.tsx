import React, { useState } from "react";
import { useEnhancedSound } from "@/components/enhanced/SoundSystemManager";
import BibleCharacter from "@/components/BibleCharacter";
import PixelBackground from "@/components/graphics/PixelBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Star, Quote } from "lucide-react";

interface BiblicalCharacterStory {
  character: "jesus" | "moses" | "solomon" | "david" | "paul" | "tax-collector" | "woman-well" | "joseph";
  story: string;
  financialLesson: string;
  modernApplication: string;
  wisdomRating: number;
}

const BiblicalFinancialStories: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<BiblicalCharacterStory | null>(null);
  const { playActionSound, playAchievementSound } = useEnhancedSound();

  const characterStories: BiblicalCharacterStory[] = [
    {
      character: "tax-collector",
      story: "A tax collector, despised for his profession, humbly prayed 'God, be merciful to me, a sinner!' while the self-righteous Pharisee boasted of his wealth and religious works.",
      financialLesson: "True wealth begins with humility and honest assessment of our spiritual condition before God",
      modernApplication: "Before making any financial decisions, check your heart's motivation. Are you seeking to serve God or self? Honest self-reflection leads to wise financial choices.",
      wisdomRating: 85
    },
    {
      character: "woman-well",
      story: "A Samaritan woman came to draw water, but Jesus offered her 'living water' - eternal life that would satisfy her deepest needs forever.",
      financialLesson: "Material wealth and possessions are temporary wells that never truly satisfy our deepest longings",
      modernApplication: "Invest in eternal treasures - relationships, character, and spiritual growth. These investments appreciate forever while material wealth fluctuates.",
      wisdomRating: 90
    },
    {
      character: "joseph",
      story: "Joseph interpreted Pharaoh's dream of seven years of abundance followed by seven years of famine, then managed Egypt's resources to save the nation and surrounding lands.",
      financialLesson: "Save and invest during times of abundance to prepare for inevitable economic downturns",
      modernApplication: "Set aside 20% of income during good times. Use DeFi protocols to earn yield on savings, but always maintain emergency funds for economic uncertainty.",
      wisdomRating: 95
    },
    {
      character: "solomon",
      story: "The richest king in history who said 'Cast your bread upon the waters, for you will find it after many days. Divide your portion to seven, or even to eight.'",
      financialLesson: "Diversification and patient investment across multiple assets reduces risk and increases long-term returns",
      modernApplication: "Don't put all your crypto in one token. Spread investments across DeFi protocols, traditional assets, and different risk levels. Think in decades, not days.",
      wisdomRating: 100
    },
    {
      character: "jesus",
      story: "Jesus told the parable of talents: A master gave servants different amounts to invest. Two doubled their money, one buried his. The master rewarded the faithful stewards.",
      financialLesson: "God expects us to actively grow and multiply the resources He entrusts to us, not hide them in fear",
      modernApplication: "Passive income through staking, yield farming, and lending can multiply your resources. But research thoroughly - faithful stewardship requires wisdom, not recklessness.",
      wisdomRating: 100
    },
    {
      character: "david",
      story: "King David declared 'I will not sacrifice to the LORD my God burnt offerings that cost me nothing.' He insisted on paying full price for the threshing floor.",
      financialLesson: "Meaningful giving and investment requires personal sacrifice and real cost",
      modernApplication: "True generosity and wise investment should stretch you. If your tithe or DeFi investment doesn't require faith and sacrifice, increase it until it does.",
      wisdomRating: 88
    }
  ];

  const handleCharacterSelect = (story: BiblicalCharacterStory) => {
    setSelectedStory(story);
    playActionSound();
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
    playAchievementSound();
  };

  return (
    <div className="relative min-h-screen">
      <PixelBackground theme="heaven" animated />
      
      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="eboy-title text-4xl mb-4">Biblical Financial Stories</h1>
          <p className="text-scripture font-scroll text-lg">
            Learn from history's greatest financial teachers
          </p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characterStories.map((story) => (
            <Card 
              key={story.character}
              className="cursor-pointer isometric-card bg-gradient-to-br from-iso-wall-light/90 to-iso-wall-dark/90 backdrop-blur-sm hover:scale-105 transition-all duration-300"
              onClick={() => handleCharacterSelect(story)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img 
                      src={`/pixel-${story.character}.png`}
                      alt={story.character}
                      className="w-12 h-12 pixelated"
                      onError={(e) => {
                        e.currentTarget.src = '/jesus-pixel.png';
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30">
                      <Star className="h-3 w-3 mr-1" />
                      {story.wisdomRating}/100
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-pixel text-lg text-eboy-green mb-2 capitalize">
                  {story.character.replace('-', ' ')}
                </h3>
                <p className="text-sm text-white/80 font-scroll line-clamp-3">
                  {story.financialLesson}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-ancient-gold/30 hover:bg-ancient-gold/10"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Story
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story Detail Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full isometric-card bg-gradient-to-br from-iso-wall-light to-iso-wall-dark animate-entrance">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 flex items-center justify-center">
                      <img 
                        src={`/pixel-${selectedStory.character}.png`}
                        alt={selectedStory.character}
                        className="w-16 h-16 pixelated"
                        onError={(e) => {
                          e.currentTarget.src = '/jesus-pixel.png';
                        }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-ancient-gold font-scroll capitalize">
                        {selectedStory.character.replace('-', ' ')}
                      </CardTitle>
                      <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30 mt-2">
                        <Star className="h-3 w-3 mr-1" />
                        Wisdom Rating: {selectedStory.wisdomRating}/100
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleCloseStory}
                    className="border-eboy-red text-eboy-red hover:bg-eboy-red/10"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* The Story */}
                <div className="bg-black/20 p-4 rounded border border-scripture/30">
                  <div className="flex items-center gap-2 text-scripture mb-3">
                    <Quote className="h-4 w-4" />
                    <span className="font-pixel text-sm">The Story</span>
                  </div>
                  <p className="text-white/90 font-scroll leading-relaxed">
                    {selectedStory.story}
                  </p>
                </div>

                {/* Financial Lesson */}
                <div className="bg-ancient-gold/10 p-4 rounded border border-ancient-gold/30">
                  <div className="flex items-center gap-2 text-ancient-gold mb-3">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-pixel text-sm">Financial Lesson</span>
                  </div>
                  <p className="text-white/90 font-scroll leading-relaxed">
                    {selectedStory.financialLesson}
                  </p>
                </div>

                {/* Modern Application */}
                <div className="bg-eboy-green/10 p-4 rounded border border-eboy-green/30">
                  <div className="flex items-center gap-2 text-eboy-green mb-3">
                    <Users className="h-4 w-4" />
                    <span className="font-pixel text-sm">DeFi Application</span>
                  </div>
                  <p className="text-white/90 font-scroll leading-relaxed">
                    {selectedStory.modernApplication}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleCloseStory}
                    className="flex-1 eboy-button"
                  >
                    Continue Learning
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-eboy-blue text-eboy-blue hover:bg-eboy-blue/10"
                    onClick={() => {
                      playAchievementSound();
                      // Could implement sharing to Farcaster here
                    }}
                  >
                    Share Wisdom
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiblicalFinancialStories;