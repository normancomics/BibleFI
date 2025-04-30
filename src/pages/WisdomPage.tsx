
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import BibleCharacter from "@/components/BibleCharacter";
import { financialVerses } from "@/data/bibleVerses";
import WisdomJourney from "@/components/wisdom/WisdomJourney";
import ScriptureFilter from "@/components/wisdom/ScriptureFilter";
import FinancialPrinciplesList from "@/components/wisdom/FinancialPrinciplesList";
import CommunityDiscussion from "@/components/wisdom/CommunityDiscussion";

const WisdomPage: React.FC = () => {
  const [wisdomLevel, setWisdomLevel] = useState(1);
  const [unlockedPrinciples, setUnlockedPrinciples] = useState<string[]>(["avoid-debt"]);
  const maxWisdomLevel = 5;
  
  const unlockNewPrinciple = () => {
    const principles = ["save-consistently", "be-generous", "work-diligently", "practice-contentment"];
    const nextPrinciple = principles.find(p => !unlockedPrinciples.includes(p));
    
    if (nextPrinciple && wisdomLevel < maxWisdomLevel) {
      setUnlockedPrinciples([...unlockedPrinciples, nextPrinciple]);
      setWisdomLevel(prev => prev + 1);
    }
  };
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-scroll text-scripture-dark mb-4">Biblical Financial Wisdom</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover what the Bible teaches about money, wealth, and stewardship.
          </p>
          
          <WisdomJourney 
            wisdomLevel={wisdomLevel}
            maxWisdomLevel={maxWisdomLevel}
            unlockedPrinciples={unlockedPrinciples}
            onGainWisdom={unlockNewPrinciple}
          />
        </section>
        
        <BibleCharacter 
          character="jesus" 
          message="For where your treasure is, there your heart will be also. - Matthew 6:21"
          className="mb-8 max-w-2xl mx-auto"
          showWisdomLevel={true}
        />
        
        <ScriptureFilter verses={financialVerses} />
        
        <FinancialPrinciplesList unlockedPrinciples={unlockedPrinciples} />
        
        <CommunityDiscussion />
      </main>
    </div>
  );
};

export default WisdomPage;
