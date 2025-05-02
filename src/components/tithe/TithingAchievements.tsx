
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award, Star, Users, BookOpen, Shield, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import PixelButton from "@/components/PixelButton";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  scriptureReference?: string;
}

const TithingAchievements: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  const achievements: Achievement[] = [
    {
      id: "first-fruits",
      title: "First Fruits",
      description: "First time tithing",
      icon: <Trophy size={18} className="text-ancient-gold" />,
      unlocked: true,
      scriptureReference: "Proverbs 3:9-10"
    },
    {
      id: "consistent-giver",
      title: "Consistent Giver",
      description: "Tithe 3 months in a row",
      icon: <Award size={18} className="text-ancient-gold" />,
      unlocked: false,
      scriptureReference: "Malachi 3:10"
    },
    {
      id: "cheerful-giver",
      title: "Cheerful Giver",
      description: "Tithe to 5 different churches",
      icon: <Star size={18} className="text-pixel-yellow" />,
      unlocked: false,
      scriptureReference: "2 Corinthians 9:7"
    },
    {
      id: "faithful-steward",
      title: "Faithful Steward",
      description: "Reach 10% of income in tithes",
      icon: <Shield size={18} className="text-scripture" />,
      unlocked: false,
      scriptureReference: "Luke 16:11"
    },
    {
      id: "abrahams-legacy",
      title: "Abraham's Legacy",
      description: "Tithe for a full year consistently",
      icon: <BookOpen size={18} className="text-ancient-temple" />,
      unlocked: false,
      scriptureReference: "Genesis 14:20"
    },
    {
      id: "kingdom-builder",
      title: "Kingdom Builder",
      description: "Help a church accept crypto",
      icon: <TrendingUp size={18} className="text-pixel-blue" />,
      unlocked: false,
      scriptureReference: "Matthew 6:33"
    }
  ];

  const handleViewCommunity = () => {
    playSound("select");
    toast({
      title: "Coming Soon",
      description: "Join the community of faith-based investors to discuss biblical financial principles."
    });
  };
  
  const toggleDetails = (id: string) => {
    playSound("select");
    setShowDetails(showDetails === id ? null : id);
  };

  return (
    <Card className="pixel-card mb-6">
      <CardContent className="pt-6">
        <div className="relative px-4 py-2 mb-4 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold">
          <div className="absolute inset-0 bg-black/10 opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
          <div className="absolute -left-1 -top-1 w-2 h-2 border-t border-l border-ancient-gold"></div>
          <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-ancient-gold"></div>
          <div className="absolute -left-1 -bottom-1 w-2 h-2 border-b border-l border-ancient-gold"></div>
          <div className="absolute -right-1 -bottom-1 w-2 h-2 border-b border-r border-ancient-gold"></div>
          <h3 className="text-xl font-scroll text-white drop-shadow-[0_0_5px_rgba(255,215,0,0.5)] flex items-center relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(255,215,0,0.7)' }}>
            <Trophy size={20} className="text-ancient-gold mr-2" /> 
            Tithing Achievements
          </h3>
        </div>

        {/* Community and Progress Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm">
            <span className="font-pixel text-ancient-gold">1/6</span> achievements unlocked
          </div>
          <PixelButton 
            size="sm" 
            variant="outline" 
            onClick={handleViewCommunity}
            className="flex items-center gap-1 text-xs"
          >
            <Users size={14} /> Community
          </PixelButton>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`relative border ${achievement.unlocked ? 'border-ancient-gold bg-black/10' : 'border-dashed border-scripture/20 opacity-50'} p-3 rounded-md text-center cursor-pointer transition-all hover:bg-black/20`}
              onClick={() => toggleDetails(achievement.id)}
            >
              <div className="absolute top-2 left-2">
                {achievement.icon}
              </div>
              <h4 className="font-pixel text-sm mb-1 pt-6">{achievement.title}</h4>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
              
              {showDetails === achievement.id && (
                <div className="mt-2 pt-2 border-t border-dashed border-scripture/20 text-xs">
                  <p className="font-scroll text-ancient-gold">{achievement.scriptureReference}</p>
                  {achievement.unlocked ? (
                    <span className="text-pixel-green">Unlocked!</span>
                  ) : (
                    <span className="text-pixel-blue">Keep going!</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Impact Tracking Preview */}
        <div className="mt-4 border border-dashed border-scripture/20 p-3 rounded-md">
          <h4 className="flex items-center font-pixel text-sm mb-2">
            <TrendingUp size={16} className="mr-2 text-ancient-gold" />
            Your Tithing Impact
          </h4>
          <p className="text-xs text-muted-foreground">
            Track the real-world impact of your tithes and see how they're helping communities.
          </p>
          <div className="mt-2 text-center">
            <PixelButton 
              size="sm"
              onClick={() => {
                playSound("powerup");
                toast({
                  title: "Coming Soon",
                  description: "Impact tracking will be available in the next update!"
                });
              }}
            >
              View Impact Reports
            </PixelButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TithingAchievements;
