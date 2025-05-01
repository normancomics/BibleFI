
import React from "react";
import NavBar from "@/components/NavBar";
import BibleCharacter from "@/components/BibleCharacter";
import StakingPool from "@/components/StakingPool";
import { getVersesByCategory } from "@/data/bibleVerses";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award } from "lucide-react";

const StakingPage: React.FC = () => {
  const wealthVerses = getVersesByCategory("wealth");
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <div className="inline-block relative px-8 py-4 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold shadow-lg transform hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-black/10 opacity-30"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-ancient-gold"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-ancient-gold"></div>
            <div className="absolute -left-2 -top-2 w-4 h-4 border-t-2 border-l-2 border-ancient-gold"></div>
            <div className="absolute -right-2 -top-2 w-4 h-4 border-t-2 border-r-2 border-ancient-gold"></div>
            <div className="absolute -left-2 -bottom-2 w-4 h-4 border-b-2 border-l-2 border-ancient-gold"></div>
            <div className="absolute -right-2 -bottom-2 w-4 h-4 border-b-2 border-r-2 border-ancient-gold"></div>
            <h1 className="text-4xl font-scroll text-white drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] tracking-wider uppercase relative z-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,215,0,0.7)' }}>
              Biblical Staking
            </h1>
          </div>
          <p className="text-xl max-w-2xl mx-auto mt-4">
            "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it." - Proverbs 13:11
          </p>
        </section>
        
        <BibleCharacter 
          character="solomon" 
          message="Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land. - Ecclesiastes 11:2"
          className="mb-8 max-w-2xl mx-auto"
          showWisdomLevel={true}
          size={32}
        />
        
        {/* Achievement System */}
        <div className="mb-8 bg-black/10 p-4 rounded-lg">
          <div className="text-center mb-6">
            <div className="inline-block relative px-6 py-3 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold shadow-lg">
              <div className="absolute inset-0 bg-black/10 opacity-30"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-ancient-gold"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-ancient-gold"></div>
              <div className="absolute -left-1 -top-1 w-3 h-3 border-t-2 border-l-2 border-ancient-gold"></div>
              <div className="absolute -right-1 -top-1 w-3 h-3 border-t-2 border-r-2 border-ancient-gold"></div>
              <div className="absolute -left-1 -bottom-1 w-3 h-3 border-b-2 border-l-2 border-ancient-gold"></div>
              <div className="absolute -right-1 -bottom-1 w-3 h-3 border-b-2 border-r-2 border-ancient-gold"></div>
              <h2 className="text-2xl font-scroll text-white drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] tracking-wider uppercase relative z-10" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(255,215,0,0.7)' }}>
                Faith Achievements
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/20 p-3 rounded-md text-center">
              <div className="mb-2">
                <Trophy size={24} className="mx-auto text-scripture" />
              </div>
              <h3 className="font-pixel text-sm mb-1">First Fruits</h3>
              <p className="text-xs text-muted-foreground">Make your first stake</p>
            </div>
            <div className="bg-black/20 p-3 rounded-md text-center">
              <div className="mb-2">
                <Trophy size={24} className="mx-auto text-gray-400" />
              </div>
              <h3 className="font-pixel text-sm mb-1">Faithful Steward</h3>
              <p className="text-xs text-muted-foreground">Stake for 30 consecutive days</p>
            </div>
            <div className="bg-black/20 p-3 rounded-md text-center">
              <div className="mb-2">
                <Award size={24} className="mx-auto text-gray-400" />
              </div>
              <h3 className="font-pixel text-sm mb-1">Diversified Wisdom</h3>
              <p className="text-xs text-muted-foreground">Stake in 3 different pools</p>
            </div>
            <div className="bg-black/20 p-3 rounded-md text-center">
              <div className="mb-2">
                <Award size={24} className="mx-auto text-gray-400" />
              </div>
              <h3 className="font-pixel text-sm mb-1">Generous Giver</h3>
              <p className="text-xs text-muted-foreground">Share rewards with others</p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <StakingPool 
            title="Proverbs Pool" 
            apy={5.2} 
            description="A stable pool based on the wisdom of Proverbs. Low risk, steady returns." 
            verse={wealthVerses[0]} 
            lockPeriod="30 days"
            riskLevel="low"
            biblicalPrinciple="Steady, patient growth (Proverbs 13:11)"
            returnsMechanism="Lending to verified, established DeFi protocols that follow ethical business practices"
          />
          
          <StakingPool 
            title="Solomon's Wisdom" 
            apy={8.7} 
            description="Medium risk pool inspired by Solomon's investment advice of diversification." 
            verse={wealthVerses[6]} 
            lockPeriod="90 days"
            riskLevel="medium"
            biblicalPrinciple="Diversification (Ecclesiastes 11:2)"
            returnsMechanism="Balanced allocation across multiple yield sources, no usurious interest practices"
          />
          
          <StakingPool 
            title="Faithful Servant" 
            apy={12.3} 
            description="Higher yield pool based on the Parable of the Talents. For those willing to be faithful with more." 
            verse={wealthVerses[3]} 
            lockPeriod="180 days"
            riskLevel="medium"
            biblicalPrinciple="Multiplication of resources (Matthew 25:14-30)"
            returnsMechanism="Active yield farming with ethical protocols that support real-world productivity"
          />
          
          <StakingPool 
            title="Diligent Hands" 
            apy={15.1} 
            description="High yield pool for those who understand that diligent hands bring wealth." 
            verse={wealthVerses[5]} 
            lockPeriod="365 days"
            riskLevel="high"
            biblicalPrinciple="Diligent work brings reward (Proverbs 10:4)"
            returnsMechanism="Strategic investments in high-potential protocols with ethical frameworks"
          />
        </div>
        
        {/* New transparency card */}
        <Card className="pixel-card mt-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-scroll mb-4">Biblical Staking Principles</h2>
            <p className="mb-4">All Bible.fi staking pools adhere to these core biblical principles:</p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-scripture p-3">
                <h3 className="font-bold">No Usury</h3>
                <p className="text-sm">We follow biblical guidance against charging excessive interest (Exodus 22:25). Our pools generate returns through ethical investments that create real value rather than exploitative practices.</p>
              </div>
              
              <div className="border-l-4 border-scripture p-3">
                <h3 className="font-bold">Transparent Returns</h3>
                <p className="text-sm">"Everything exposed by the light becomes visible" (Ephesians 5:13). We provide full transparency about how returns are generated.</p>
              </div>
              
              <div className="border-l-4 border-scripture p-3">
                <h3 className="font-bold">Ethical Investments</h3>
                <p className="text-sm">Our protocols only invest in projects that align with biblical principles of fairness, justice, and ethical business practices.</p>
              </div>
              
              <div className="border-l-4 border-scripture p-3">
                <h3 className="font-bold">Sustainability Focus</h3>
                <p className="text-sm">"The LORD God took the man and put him in the Garden of Eden to work it and take care of it" (Genesis 2:15). We prioritize environmentally responsible protocols.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StakingPage;
