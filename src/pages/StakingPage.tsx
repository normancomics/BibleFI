
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import StakingPool from "@/components/StakingPool";
import StakingTransparency from "@/components/StakingTransparency";
import BibleCharacter from "@/components/BibleCharacter";
import { getVersesByCategory } from "@/data/bibleVerses";
import ScriptureCard from "@/components/ScriptureCard";
import { useSound } from "@/contexts/SoundContext";

const StakingPage: React.FC = () => {
  const wealthVerses = getVersesByCategory("wealth");
  const { playSound, userInteracted } = useSound();
  
  useEffect(() => {
    if (userInteracted) {
      playSound("coin");
    }
  }, [userInteracted, playSound]);
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-scroll text-scripture-dark mb-4">Biblical Staking</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Grow your wealth little by little through faithful stewardship.
          </p>
        </section>
        
        <div className="mb-8">
          <BibleCharacter
            character="solomon"
            message="Wealth gained hastily will dwindle, but whoever gathers little by little will increase it. - Proverbs 13:11"
            className="mb-4 max-w-2xl mx-auto"
            showWisdomLevel={true}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-scroll mb-4">Staking Pools</h2>
            <div className="space-y-6">
              <StakingPool 
                name="Proverbs Pool" 
                apy={5.2} 
                lockPeriod={30} 
                tvl={125000} 
                supportedTokens={["USDC", "DAI", "ETH"]}
              />
              
              <StakingPool 
                name="Ecclesiastes Pool" 
                apy={8.4} 
                lockPeriod={90} 
                tvl={320000} 
                supportedTokens={["USDC", "DAI", "ETH", "USDT"]}
                featured={true}
              />
              
              <StakingPool 
                name="Genesis Pool" 
                apy={12.7} 
                lockPeriod={180} 
                tvl={780000} 
                supportedTokens={["USDC", "DAI"]}
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-scroll mb-4">Stable Growth</h2>
            
            <Card className="pixel-card p-6 mb-6">
              <p className="mb-4">
                Our staking pools are designed based on Biblical principles of patient growth, 
                faithful stewardship, and ethical investing.
              </p>
              
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Key Features:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Transparent fund allocation</li>
                  <li>Ethical investment strategy</li>
                  <li>Regular rewards distribution</li>
                  <li>Educational resources</li>
                </ul>
              </div>
              
              {wealthVerses.length > 0 && (
                <ScriptureCard verse={wealthVerses[0]} />
              )}
            </Card>
            
            <StakingTransparency />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StakingPage;
