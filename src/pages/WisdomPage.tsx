import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WisdomCard from "@/components/wisdom/WisdomCard";
import FinancialPrinciple from "@/components/wisdom/FinancialPrinciple";
import ScriptureFilter from "@/components/wisdom/ScriptureFilter";
import { Link } from "react-router-dom";
import DigitalWisdomAdvisor from "@/components/wisdom/DigitalWisdomAdvisor";
import BiblicalWisdomCrawler from "@/components/wisdom/BiblicalWisdomCrawler";
import CommunityDiscussion from "@/components/community/CommunityDiscussion";
import { getRandomVerse } from "@/data/bibleVerses";
import { useSound } from "@/contexts/SoundContext";
import { BookOpen, Users, Database, Scroll } from "lucide-react";

const WisdomPage: React.FC = () => {
  const { playSound } = useSound();
  const [activeTab, setActiveTab] = useState("digital-wisdom");
  
  const handleTabChange = (value: string) => {
    playSound("select");
    setActiveTab(value);
  };
  
  const wisdomVerses = [
    getRandomVerse(),
    getRandomVerse(),
    getRandomVerse(),
  ];
  
  const principles = [
    {
      title: "1. Stewardship",
      description: "All wealth ultimately belongs to God, and we are merely stewards of what He has entrusted to us.",
      scriptureReferences: ["Psalm 24:1", "Matthew 25:14-30"],
      isUnlocked: true
    },
    {
      title: "2. Avoiding Debt",
      description: "Borrowing can lead to financial bondage. Living debt-free provides financial freedom and security.",
      scriptureReferences: ["Proverbs 22:7", "Romans 13:8"],
      isUnlocked: true
    },
    {
      title: "3. Generosity",
      description: "Giving generously brings spiritual rewards and reflects God's character.",
      scriptureReferences: ["Proverbs 19:17", "2 Corinthians 9:6-7"],
      isUnlocked: true
    }
  ];
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-scroll text-ancient-gold mb-4">
            Bible.fi Digital Wisdom
          </h1>
          <p className="text-white/80 max-w-3xl mx-auto text-lg">
            Get comprehensive biblical guidance for your financial questions. Ask about tithing, stewardship, DeFi strategies, and more. 
            Our AI-powered system searches through extensive biblical financial wisdom to provide scripture-based answers.
          </p>
          <Link to="/comprehensive-wisdom" className="inline-block mt-4 px-6 py-2 bg-ancient-gold text-royal-purple rounded-lg hover:bg-ancient-gold/80 transition-colors">
            Access Complete Biblical Financial Database →
          </Link>
        </div>
        
        <Tabs defaultValue="digital-wisdom" value={activeTab} onValueChange={handleTabChange} className="mb-12">
          <TabsList className="bg-scripture/40 border border-ancient-gold/50 p-1 w-full">
            <TabsTrigger value="digital-wisdom" className="data-[state=active]:bg-purple-900/70 text-ancient-gold flex items-center gap-2">
              <BookOpen size={16} />
              Digital Wisdom
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-purple-900/70 text-ancient-gold flex items-center gap-2">
              <Database size={16} />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="scriptures" className="data-[state=active]:bg-purple-900/70 text-ancient-gold flex items-center gap-2">
              <Scroll size={16} />
              Scriptures
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-purple-900/70 text-ancient-gold flex items-center gap-2">
              <Users size={16} />
              Community
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="digital-wisdom" className="mt-6">
            <DigitalWisdomAdvisor />
          </TabsContent>
          
          <TabsContent value="database" className="mt-6">
            <BiblicalWisdomCrawler />
          </TabsContent>
          
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
                  principle={verse.category === "wealth" ? 
                    "Financial wisdom requires careful planning and foresight" : 
                    "Trust in God's provision while being a faithful steward"}
                  application={verse.category === "wealth" ? 
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
                  description={principle.description}
                  scriptureReferences={principle.scriptureReferences}
                  isUnlocked={principle.isUnlocked}
                />
              ))}
            </div>
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
