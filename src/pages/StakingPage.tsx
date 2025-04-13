
import React from "react";
import NavBar from "@/components/NavBar";
import BibleCharacter from "@/components/BibleCharacter";
import StakingPool from "@/components/StakingPool";
import { getVersesByCategory } from "@/data/bibleVerses";

const StakingPage: React.FC = () => {
  const wealthVerses = getVersesByCategory("wealth");
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-scroll text-scripture-dark mb-4">Biblical Staking</h1>
          <p className="text-xl max-w-2xl mx-auto">
            "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it." - Proverbs 13:11
          </p>
        </section>
        
        <BibleCharacter 
          character="solomon" 
          message="Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land. - Ecclesiastes 11:2"
          className="mb-8 max-w-2xl mx-auto"
        />
        
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <StakingPool 
            title="Proverbs Pool" 
            apy={5.2} 
            description="A stable pool based on the wisdom of Proverbs. Low risk, steady returns." 
            verse={wealthVerses[0]} 
            lockPeriod="30 days"
          />
          
          <StakingPool 
            title="Solomon's Wisdom" 
            apy={8.7} 
            description="Medium risk pool inspired by Solomon's investment advice of diversification." 
            verse={wealthVerses[6]} 
            lockPeriod="90 days"
          />
          
          <StakingPool 
            title="Faithful Servant" 
            apy={12.3} 
            description="Higher yield pool based on the Parable of the Talents. For those willing to be faithful with more." 
            verse={wealthVerses[3]} 
            lockPeriod="180 days"
          />
          
          <StakingPool 
            title="Diligent Hands" 
            apy={15.1} 
            description="High yield pool for those who understand that diligent hands bring wealth." 
            verse={wealthVerses[5]} 
            lockPeriod="365 days"
          />
        </div>
      </main>
    </div>
  );
};

export default StakingPage;
