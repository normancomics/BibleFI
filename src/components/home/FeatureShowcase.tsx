
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import PixelIcon from "@/components/PixelIcon";
import PixelButton from "@/components/PixelButton";

const FeatureShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { playSound } = useSound();
  
  const features = [
    {
      title: "Biblical Wisdom",
      iconName: "scroll",
      color: "text-scripture",
      description: "Discover financial principles from scripture and apply them to your life",
      path: "/wisdom"
    },
    {
      title: "Digital Tithing",
      iconName: "coin",
      color: "text-ancient-gold",
      description: "Support your church with crypto or traditional payments",
      path: "/tithe"
    },
    {
      title: "Stablecoin Staking",
      iconName: "temple",
      color: "text-base-blue",
      description: "Earn yield while aligning with biblical principles",
      path: "/staking"
    },
    {
      title: "Render Unto Caesar",
      iconName: "tax",
      color: "text-white",
      description: "Navigate crypto taxes with biblical guidance",
      path: "/taxes"
    }
  ];
  
  const handleFeatureClick = (path: string) => {
    playSound("select");
    navigate(path);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  return (
    <div className="my-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-scroll text-ancient-gold mb-3">Biblical Financial Features</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Applying ancient wisdom to modern finance - built on Base Chain for the Farcaster community
        </p>
      </div>
    
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card 
              className="h-full bg-black/60 border-2 border-scripture/30 hover:border-ancient-gold/50 transition-all duration-300 overflow-hidden group"
              onClick={() => handleFeatureClick(feature.path)}
            >
              <CardContent className="p-0">
                <div className="p-6 flex flex-col h-full">
                  <div className={`bg-black/40 p-4 rounded-lg mb-4 ${feature.color} flex justify-center`}>
                    <PixelIcon name={feature.iconName} className="w-12 h-12" />
                  </div>
                  
                  <h3 className={`text-xl font-pixel mb-3 ${feature.color}`}>{feature.title}</h3>
                  
                  <p className="text-white/70 mb-4 flex-grow">
                    {feature.description}
                  </p>
                  
                  <PixelButton 
                    variant="link" 
                    className={`justify-end group-hover:text-ancient-gold ${feature.color}`}
                    size="sm"
                  >
                    Explore →
                  </PixelButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeatureShowcase;
