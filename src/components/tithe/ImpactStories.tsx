
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

interface ImpactStory {
  church: string;
  location: string;
  story: string;
  imageUrl: string;
}

const impactStories: ImpactStory[] = [
  {
    church: "Hope City Church",
    location: "Portland, OR",
    story: "Your tithes helped feed 120 families through our food pantry this month.",
    imageUrl: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png" 
  },
  {
    church: "Grace Fellowship",
    location: "Dallas, TX",
    story: "With your support, we were able to fund a new children's wing focused on biblical financial education.",
    imageUrl: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png"
  },
  {
    church: "First Community Church",
    location: "Columbus, OH",
    story: "Your contributions helped us launch a financial literacy program for underprivileged youth in our community.",
    imageUrl: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  }
];

const ImpactStories: React.FC = () => {
  const { playSound } = useSound();
  const [selectedImpact, setSelectedImpact] = useState(0);
  
  return (
    <Card className="pixel-card mt-6">
      <CardContent className="pt-6">
        <h3 className="text-xl font-scroll mb-3 flex items-center">
          <Heart size={20} className="text-scripture mr-2" /> 
          Your Tithing Impact
        </h3>
        
        <div className="bg-black/10 p-4 rounded-md mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={impactStories[selectedImpact].imageUrl} 
              alt="Church icon" 
              className="w-12 h-12 rounded-md object-cover" 
            />
            <div>
              <h4 className="font-bold">{impactStories[selectedImpact].church}</h4>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin size={12} className="mr-1" />
                {impactStories[selectedImpact].location}
              </div>
            </div>
          </div>
          
          <p className="text-sm border-l-4 border-scripture-light pl-3">
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
              className={`w-3 h-3 rounded-full ${selectedImpact === index ? 'bg-scripture' : 'bg-gray-300'}`}
              aria-label={`Impact story ${index + 1}`}
            ></button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactStories;
