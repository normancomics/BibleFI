
import React from "react";
import PixelCharacter from "@/components/PixelCharacter";

const SaintsWisdom: React.FC = () => {
  return (
    <div className="mt-12 bg-black/20 p-6 rounded-lg border border-pixel-cyan">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-scroll text-ancient-gold">Wisdom From the Saints</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <PixelCharacter 
          character="paul" 
          message="Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. - 2 Corinthians 9:7"
          soundEffect={true}
        />
        
        <PixelCharacter 
          character="moses" 
          message="No one should appear before the LORD empty-handed. - Deuteronomy 16:16"
          soundEffect={true}
        />
      </div>
    </div>
  );
};

export default SaintsWisdom;
