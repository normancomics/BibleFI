
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

interface ImpactStory {
  church: string;
  location: string;
  story: string;
}

const impactStories: ImpactStory[] = [
  {
    church: "Hope City Church",
    location: "Portland, OR",
    story: "Your tithes helped feed 120 families through our food pantry this month."
  },
  {
    church: "Grace Fellowship",
    location: "Dallas, TX",
    story: "With your support, we were able to fund a new children's wing focused on biblical financial education."
  },
  {
    church: "First Community Church",
    location: "Columbus, OH",
    story: "Your contributions helped us launch a financial literacy program for underprivileged youth in our community."
  }
];

const ImpactStories: React.FC = () => {
  const { playSound } = useSound();
  const [selectedImpact, setSelectedImpact] = useState(0);
  
  return (
    <Card className="pixel-card mt-6 bg-purple-900/40 border border-ancient-gold/50">
      <CardContent className="pt-6">
        <h3 className="text-xl font-scroll mb-3 flex items-center text-ancient-gold">
          <Heart size={20} className="text-ancient-gold mr-2" /> 
          Your Tithing Impact
        </h3>
        
        <div className="bg-purple-900/40 p-4 rounded-md mb-4 border border-ancient-gold/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-md bg-purple-800/70 flex items-center justify-center">
              <Heart size={24} className="text-ancient-gold" />
            </div>
            <div>
              <h4 className="font-bold text-ancient-gold">{impactStories[selectedImpact].church}</h4>
              <div className="flex items-center text-xs text-white/60">
                <MapPin size={12} className="mr-1" />
                {impactStories[selectedImpact].location}
              </div>
            </div>
          </div>
          
          <p className="text-sm border-l-4 border-ancient-gold/50 pl-3 text-white/90">
            {impactStories[selectedImpact].story}
          </p>
        </div>
        
        <div className="flex gap-2">
          {impactStories.map((_, index) => (
            <button 
              key={index} 
              onClick={() => {
                setSelectedImpact(index);
                playSound("select");
              }}
              className={`w-3 h-3 rounded-full ${selectedImpact === index ? 'bg-ancient-gold' : 'bg-gray-300'}`}
              aria-label={`Impact story ${index + 1}`}
            ></button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactStories;
