
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import BibleCharacter from "@/components/BibleCharacter";
import ScriptureCard from "@/components/ScriptureCard";
import { financialVerses } from "@/data/bibleVerses";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Unlock, Lock, Award, Share2 } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";

const WisdomPage: React.FC = () => {
  const { playSound } = useSound();
  const [wisdomLevel, setWisdomLevel] = useState(1);
  const [unlockedPrinciples, setUnlockedPrinciples] = useState<string[]>(["avoid-debt"]);
  const maxWisdomLevel = 5;
  
  const unlockNewPrinciple = () => {
    const principles = ["save-consistently", "be-generous", "work-diligently", "practice-contentment"];
    const nextPrinciple = principles.find(p => !unlockedPrinciples.includes(p));
    
    if (nextPrinciple && wisdomLevel < maxWisdomLevel) {
      playSound("powerup");
      setUnlockedPrinciples([...unlockedPrinciples, nextPrinciple]);
      setWisdomLevel(prev => prev + 1);
    }
  };
  
  const renderLockStatus = (principle: string) => {
    const isUnlocked = unlockedPrinciples.includes(principle);
    
    return (
      <div className={`absolute top-3 right-3 ${isUnlocked ? 'text-ancient-gold' : 'text-muted-foreground'}`}>
        {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
      </div>
    );
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
          
          {/* New Wisdom Journey section */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-game text-sm">YOUR WISDOM JOURNEY</h3>
              <span className="font-pixel text-ancient-gold">Level {wisdomLevel}/{maxWisdomLevel}</span>
            </div>
            <Progress value={(wisdomLevel / maxWisdomLevel) * 100} className="h-2 bg-black/30" />
            <div className="mt-2 flex justify-between">
              <div className="flex items-center">
                <Award size={16} className="text-ancient-gold mr-1" />
                <span className="text-xs">{unlockedPrinciples.length} principles unlocked</span>
              </div>
              <PixelButton 
                size="sm" 
                onClick={unlockNewPrinciple} 
                disabled={wisdomLevel >= maxWisdomLevel}
              >
                Gain Wisdom
              </PixelButton>
            </div>
          </div>
        </section>
        
        <BibleCharacter 
          character="jesus" 
          message="For where your treasure is, there your heart will be also. - Matthew 6:21"
          className="mb-8 max-w-2xl mx-auto"
          showWisdomLevel={true}
        />
        
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="wealth">Wealth</TabsTrigger>
            <TabsTrigger value="giving">Giving</TabsTrigger>
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="stewardship">Stewardship</TabsTrigger>
            <TabsTrigger value="debt">Debt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses.map(verse => (
                <ScriptureCard key={verse.key} verse={verse} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="wealth">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "wealth")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="giving">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "giving")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="work">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "work")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="stewardship">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "stewardship")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="debt">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "debt")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
        
        <Card className="pixel-card mt-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-scroll mb-4">Financial Principles from Scripture</h2>
            <div className="space-y-6">
              <div className="relative">
                {renderLockStatus("avoid-debt")}
                <h3 className="text-xl font-semibold mb-2">1. Avoid Debt When Possible</h3>
                <p>The Bible warns against the dangers of debt. While not all debt is sinful, scripture encourages us to live debt-free when possible.</p>
                <div className="mt-2 text-xs flex">
                  <div className="bg-black/20 px-2 py-1 rounded mr-1">Proverbs 22:7</div>
                  <div className="bg-black/20 px-2 py-1 rounded">Romans 13:8</div>
                </div>
              </div>
              
              <div className="relative">
                {renderLockStatus("save-consistently")}
                <h3 className="text-xl font-semibold mb-2">2. Save Consistently</h3>
                <p>Proverbs encourages saving regularly. This principle aligns with modern financial wisdom of building emergency funds and saving for the future.</p>
                <div className="mt-2 text-xs flex">
                  <div className="bg-black/20 px-2 py-1 rounded mr-1">Proverbs 21:20</div>
                  <div className="bg-black/20 px-2 py-1 rounded">Proverbs 6:6-8</div>
                </div>
              </div>
              
              <div className="relative">
                {renderLockStatus("be-generous")}
                <h3 className="text-xl font-semibold mb-2">3. Be Generous</h3>
                <p>Many scriptures teach about the importance of giving. The Bible encourages tithing (giving 10%) as well as additional giving to those in need.</p>
                <div className="mt-2 text-xs flex">
                  <div className="bg-black/20 px-2 py-1 rounded mr-1">Malachi 3:10</div>
                  <div className="bg-black/20 px-2 py-1 rounded">2 Corinthians 9:7</div>
                </div>
              </div>
              
              <div className="relative">
                {renderLockStatus("work-diligently")}
                <h3 className="text-xl font-semibold mb-2">4. Work Diligently</h3>
                <p>Scripture values hard work and diligence. Laziness is consistently discouraged throughout the Bible.</p>
                <div className="mt-2 text-xs flex">
                  <div className="bg-black/20 px-2 py-1 rounded mr-1">Proverbs 10:4</div>
                  <div className="bg-black/20 px-2 py-1 rounded">Colossians 3:23-24</div>
                </div>
              </div>
              
              <div className="relative">
                {renderLockStatus("practice-contentment")}
                <h3 className="text-xl font-semibold mb-2">5. Practice Contentment</h3>
                <p>The Bible warns against greed and the love of money, encouraging us to be content with what we have.</p>
                <div className="mt-2 text-xs flex">
                  <div className="bg-black/20 px-2 py-1 rounded mr-1">1 Timothy 6:6-8</div>
                  <div className="bg-black/20 px-2 py-1 rounded">Hebrews 13:5</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* New Community Discussion Section */}
        <Card className="pixel-card mt-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-scroll">Community Discussion</h2>
              <PixelButton size="sm" onClick={() => playSound("select")}>
                <Share2 size={16} className="mr-2" /> Share on Farcaster
              </PixelButton>
            </div>
            <p className="mb-4">Discuss biblical financial principles with others and form investment study groups.</p>
            <div className="bg-black/10 p-4 rounded-md">
              <p className="font-pixel text-center">Connect your Farcaster account to join the discussion!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WisdomPage;
