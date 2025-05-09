
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSound } from "@/contexts/SoundContext";
import PixelButton from "@/components/PixelButton";
import PixelCharacter from "@/components/PixelCharacter";
import { CharacterType } from "@/components/PixelCharacter";
import { motion } from "framer-motion";
import { CreditCard, Coins, Book, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  character: CharacterType;
}

const FeatureShowcase: React.FC = () => {
  const { playSound } = useSound();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features: Feature[] = [
    {
      id: "wisdom",
      title: "Biblical Wisdom",
      description: "Learn financial principles from the scriptures",
      icon: <Book className="h-6 w-6" />,
      route: "/wisdom",
      character: "solomon"
    },
    {
      id: "tithe",
      title: "Digital Tithing",
      description: "Give to your church using crypto or fiat",
      icon: <CreditCard className="h-6 w-6" />,
      route: "/tithe",
      character: "moses"
    },
    {
      id: "defi",
      title: "Biblical DeFi",
      description: "Stake and earn with biblical principles",
      icon: <Coins className="h-6 w-6" />,
      route: "/defi",
      character: "david"
    },
    {
      id: "tax",
      title: "Render Unto Caesar",
      description: "Understand taxes from a biblical perspective",
      icon: <Calculator className="h-6 w-6" />,
      route: "/taxes",
      character: "jesus"
    }
  ];
  
  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
      playSound("select");
    }, 5000);
    
    return () => clearInterval(interval);
  }, [features.length, playSound]);
  
  const handleFeatureClick = (index: number) => {
    setActiveFeature(index);
    playSound("select");
  };
  
  const handleNavigate = (route: string) => {
    playSound("powerup");
    navigate(route);
  };
  
  return (
    <div className="my-8">
      <h2 className="text-2xl font-pixel text-center mb-6 text-ancient-gold">Bible.fi Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-black/60 border-2 border-scripture/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-[300px] overflow-hidden bg-gradient-to-b from-black/40 to-black/80">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-6 text-center">
                  <motion.div
                    key={features[activeFeature].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-4 bg-scripture/20 p-4 rounded-full">
                      {features[activeFeature].icon}
                    </div>
                    
                    <h3 className="text-2xl font-pixel text-ancient-gold mb-2">
                      {features[activeFeature].title}
                    </h3>
                    
                    <p className="text-white/80 mb-6">
                      {features[activeFeature].description}
                    </p>
                    
                    <PixelButton onClick={() => handleNavigate(features[activeFeature].route)}>
                      Explore {features[activeFeature].title}
                    </PixelButton>
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                key={`character-${features[activeFeature].id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-0 right-0 p-4"
              >
                <PixelCharacter character={features[activeFeature].character} size="xl" animate />
              </motion.div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col space-y-4">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 p-4 rounded-md flex items-center ${
                activeFeature === index 
                  ? 'bg-scripture/40 border-l-4 border-ancient-gold' 
                  : 'bg-black/40 hover:bg-scripture/20 border-l-4 border-transparent'
              }`}
              onClick={() => handleFeatureClick(index)}
            >
              <div className={`p-2 rounded-full mr-4 ${
                activeFeature === index ? 'bg-ancient-gold/20' : 'bg-black/30'
              }`}>
                {feature.icon}
              </div>
              
              <div>
                <h3 className={`font-pixel ${
                  activeFeature === index ? 'text-ancient-gold' : 'text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-white/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
