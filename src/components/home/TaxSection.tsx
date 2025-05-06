
import React from "react";
import { Card } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useNavigate } from "react-router-dom";
import { DollarSign } from "lucide-react";

const TaxSection: React.FC = () => {
  const { playSound } = useSound();
  const navigate = useNavigate();
  
  const handleTaxClick = () => {
    playSound("coin");
    navigate("/taxes");
  };
  
  return (
    <Card className="bg-black/60 border border-base-blue p-6 my-10">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="md:w-2/3">
          <h2 className="text-2xl font-medium text-white mb-4">Render Unto Caesar</h2>
          
          <p className="text-base text-white/80 mb-4">
            "Then Jesus said to them, 'Give back to Caesar what is Caesar's and to God what is God's.' And they were amazed at him." 
            <span className="text-white/60 text-sm block mt-1">— Mark 12:17</span>
          </p>
          
          <p className="text-base text-white/80 mb-6">
            Understanding your tax obligations is an important part of biblical financial wisdom. 
            Our Tax Section helps you calculate and manage your crypto taxes properly.
          </p>
          
          <PixelButton onClick={handleTaxClick} className="flex items-center">
            <DollarSign size={16} className="mr-2" />
            Explore Tax Tools
          </PixelButton>
        </div>
        
        <div className="md:w-1/3 flex justify-center">
          <div className="bg-base-blue/20 border border-base-blue/50 rounded-full p-5 inline-block">
            <div className="relative">
              <img 
                src="/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png" 
                alt="Render unto Caesar" 
                className="w-24 h-24 object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaxSection;
