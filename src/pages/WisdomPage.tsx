
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WisdomCard from "@/components/wisdom/WisdomCard";
import FinancialPrinciple from "@/components/wisdom/FinancialPrinciple";
import ScriptureFilter from "@/components/wisdom/ScriptureFilter";
import BibleCharacterSelector from "@/components/characters/BibleCharacterSelector";
import SenpiWisdomSection from "@/components/wisdom/SenpiWisdomSection";
import CommunityDiscussion from "@/components/community/CommunityDiscussion";
import { getRandomVerse } from "@/data/bibleVerses";
import { CharacterType } from "@/components/PixelCharacter";
import { useSound } from "@/contexts/SoundContext";

const WisdomPage: React.FC = () => {
  const { playSound } = useSound();
  const [activeTab, setActiveTab] = useState("scriptures");
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>("solomon");
  const [filter, setFilter] = useState<string>("all");
  
  const handleTabChange = (value: string) => {
    playSound("select");
    setActiveTab(value);
  };
  
  const handleCharacterSelect = (character: CharacterType) => {
    setSelectedCharacter(character);
    playSound("select");
  };
  
  const wisdomVerses = [
    getRandomVerse(),
    getRandomVerse(),
    getRandomVerse(),
  ];
  
  const principles = [
    {
      title: "Stewardship",
      verse: "The earth is the LORD's, and everything in it, the world, and all who live in it.",
      reference: "Psalm 24:1",
      description: "All wealth ultimately belongs to God, and we are merely stewards of what He has entrusted to us."
    },
    {
      title: "Avoiding Debt",
      verse: "The borrower is slave to the lender.",
      reference: "Proverbs 22:7",
      description: "Borrowing can lead to financial bondage. Living debt-free provides financial freedom and security."
    },
    {
      title: "Generosity",
      verse: "Whoever is kind to the poor lends to the LORD, and he will reward them for what they have done.",
      reference: "Proverbs 19:17",
      description: "Giving generously brings spiritual rewards and reflects God's character."
    }
  ];
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-scroll text-ancient-gold mb-2">Biblical Financial Wisdom</h1>
          <p className="text-white/80 max-w-2xl">
            Discover God's timeless principles for handling money wisely and building wealth with purpose.
          </p>
        </div>
        
        <div className="mb-8">
          <BibleCharacterSelector 
            selectedCharacter={selectedCharacter} 
            onSelect={handleCharacterSelect}
            className="bg-black/50 border border-ancient-gold/30"
          />
        </div>
        
        <Tabs defaultValue="scriptures" value={activeTab} onValueChange={handleTabChange} className="mb-12">
          <TabsList className="bg-black/70 border border-scripture/50 p-1">
            <TabsTrigger value="scriptures" className="data-[state=active]:bg-scripture/50">Scriptures</TabsTrigger>
            <TabsTrigger value="principles" className="data-[state=active]:bg-scripture/50">Principles</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-scripture/50">AI Guidance</TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-scripture/50">Community</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scriptures" className="mt-6">
            <div className="mb-6">
              <ScriptureFilter verses={wisdomVerses} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wisdomVerses.map((verse, index) => (
                <WisdomCard 
                  key={index}
                  scripture={verse.text}
                  reference={verse.reference}
                  principle={verse.category === "finance" ? 
                    "Financial wisdom requires careful planning and foresight" : 
                    "Trust in God's provision while being a faithful steward"}
                  application={verse.category === "finance" ? 
                    "Create a budget that includes saving, giving and spending with purpose" : 
                    "Apply biblical principles to manage your resources faithfully"}
                  tags={[verse.category]}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="principles" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {principles.map((principle, index) => (
                <FinancialPrinciple 
                  key={index}
                  title={principle.title}
                  verse={principle.verse}
                  reference={principle.reference}
                  description={principle.description}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="mt-6">
            <SenpiWisdomSection />
          </TabsContent>
          
          <TabsContent value="community" className="mt-6">
            <CommunityDiscussion />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WisdomPage;
