
import React from "react";
import PixelCharacter from "@/components/PixelCharacter";

const SaintsWisdom: React.FC = () => {
  return (
    <div className="mt-12 bg-black/20 p-6 rounded-lg border border-pixel-cyan">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-scroll text-ancient-gold">Wisdom From the Saints</h2>
        <p className="text-sm text-muted-foreground font-pixel">Biblical guidance on giving and tithing</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6">
        <PixelCharacter 
          character="paul" 
          message="Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. - 2 Corinthians 9:7"
          soundEffect={true}
          arcadeStyle={true}
          size="md"
        />
        
        <PixelCharacter 
          character="moses" 
          message="No one should appear before the LORD empty-handed. - Deuteronomy 16:16"
          soundEffect={true}
          arcadeStyle={true}
          size="md"
        />
        
        <PixelCharacter 
          character="abraham" 
          message="Then Abram gave him a tenth of everything. - Genesis 14:20"
          soundEffect={true}
          arcadeStyle={true}
          size="md"
        />
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 mt-8">
        <PixelCharacter 
          character="solomon" 
          message="Honor the LORD with your wealth, with the firstfruits of all your crops. - Proverbs 3:9"
          soundEffect={true}
          arcadeStyle={true}
          size="md"
        />
        
        <PixelCharacter 
          character="david" 
          message="I will not sacrifice to the LORD my God burnt offerings that cost me nothing. - 2 Samuel 24:24"
          soundEffect={true}
          arcadeStyle={true}
          size="md"
        />
        
        <PixelCharacter 
          character="jesus" 
          message="Give, and it will be given to you. A good measure, pressed down, shaken together and running over. - Luke 6:38"
          soundEffect={true}
          arcadeStyle={true}
          size="md"
        />
      </div>
    </div>
  );
};

export default SaintsWisdom;
