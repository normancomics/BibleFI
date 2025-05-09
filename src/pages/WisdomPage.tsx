
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import PixelButton from "@/components/PixelButton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Share2, ScrollText, BookOpen } from "lucide-react";
import FarcasterConnect from "@/farcaster/FarcasterConnect";
import BibleCharacterSelector from "@/components/characters/BibleCharacterSelector";
import WisdomCard from "@/components/wisdom/WisdomCard";
import { CharacterType } from "@/components/PixelCharacter";
import PixelCharacter from "@/components/PixelCharacter";
import { motion } from "framer-motion";

// Financial wisdom data
const financialWisdomData = [
  {
    id: 1,
    scripture: "The wise store up choice food and olive oil, but fools gulp theirs down.",
    reference: "Proverbs 21:20",
    principle: "Save for the future instead of consuming everything now.",
    application: "Create an emergency fund and contribute to it regularly before spending on non-essentials.",
    tags: ["saving", "wisdom", "planning"],
    character: "solomon" as CharacterType
  },
  {
    id: 2,
    scripture: "Dishonest money dwindles away, but whoever gathers money little by little makes it grow.",
    reference: "Proverbs 13:11",
    principle: "Wealth built slowly through honest work is more sustainable than quick riches.",
    application: "Focus on consistent investing over time rather than get-rich-quick schemes.",
    tags: ["investing", "honesty", "patience"],
    character: "david" as CharacterType
  },
  {
    id: 3,
    scripture: "The rich rule over the poor, and the borrower is slave to the lender.",
    reference: "Proverbs 22:7",
    principle: "Debt creates financial bondage and limits freedom.",
    application: "Minimize debt, especially high-interest consumer debt, and create a debt elimination plan.",
    tags: ["debt", "freedom", "planning"],
    character: "moses" as CharacterType
  },
  {
    id: 4,
    scripture: "Honor the Lord with your wealth, with the firstfruits of all your crops.",
    reference: "Proverbs 3:9",
    principle: "Giving should be a priority, not an afterthought.",
    application: "Set aside money for giving first before budgeting other expenses.",
    tags: ["giving", "tithing", "priorities"],
    character: "jesus" as CharacterType
  },
  {
    id: 5,
    scripture: "For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?",
    reference: "Luke 14:28",
    principle: "Planning is essential for good financial stewardship.",
    application: "Create a budget and financial plan before making major financial decisions.",
    tags: ["planning", "stewardship", "wisdom"],
    character: "solomon" as CharacterType
  }
];

const WisdomPage: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>("solomon");
  
  // Filter wisdom by character
  const filteredWisdom = selectedCharacter === "all" 
    ? financialWisdomData 
    : financialWisdomData.filter(item => item.character === selectedCharacter);
  
  const handleCharacterSelect = (character: CharacterType) => {
    playSound("select");
    setSelectedCharacter(character);
  };
  
  const handleShareToFarcaster = () => {
    playSound("coin");
    const shareText = "I'm exploring Biblical financial wisdom on Bible.fi!\n\nCheck it out: https://bible.fi";
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-pixel text-ancient-gold">Biblical Financial Wisdom</h1>
          <FarcasterConnect size="sm" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-black/60 border border-ancient-gold/40 sticky top-4">
              <CardContent className="p-4">
                <h2 className="text-xl font-pixel mb-4">Wisdom Guides</h2>
                
                <div className="mb-6">
                  <BibleCharacterSelector
                    selectedCharacter={selectedCharacter}
                    onSelect={handleCharacterSelect}
                  />
                </div>
                
                <div className="mt-6">
                  <PixelButton
                    onClick={handleShareToFarcaster}
                    className="w-full flex items-center justify-center"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share on Farcaster
                  </PixelButton>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="bg-black/70 border border-ancient-gold/30 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="mr-4">
                    <PixelCharacter character={selectedCharacter} size="lg" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-pixel text-ancient-gold mb-2">
                      Biblical Financial Wisdom
                    </h2>
                    <p className="text-white/80 mb-4">
                      Explore timeless financial principles from scripture that can guide your 
                      financial decisions and help you build wealth while honoring God.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="principles" className="mb-8">
              <TabsList className="bg-black/40 border border-ancient-gold/30">
                <TabsTrigger value="principles" className="data-[state=active]:bg-scripture/30">
                  <Book className="h-4 w-4 mr-2" />
                  <span>Principles</span>
                </TabsTrigger>
                <TabsTrigger value="applications" className="data-[state=active]:bg-scripture/30">
                  <ScrollText className="h-4 w-4 mr-2" />
                  <span>Applications</span>
                </TabsTrigger>
                <TabsTrigger value="study" className="data-[state=active]:bg-scripture/30">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Study</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="principles" className="mt-4">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {filteredWisdom.map((wisdom, index) => (
                      <motion.div
                        key={wisdom.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <WisdomCard
                          scripture={wisdom.scripture}
                          reference={wisdom.reference}
                          principle={wisdom.principle}
                          application={wisdom.application}
                          tags={wisdom.tags}
                        />
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="applications">
                <Card className="bg-black/70 border border-scripture">
                  <CardContent className="p-6">
                    <h3 className="text-xl text-ancient-gold font-pixel mb-4">
                      Practical Applications
                    </h3>
                    <p className="text-white/80 mb-4">
                      Discover how to apply biblical financial principles in today's digital economy.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-black/40 border-l-4 border-ancient-gold p-4">
                        <h4 className="text-white font-medium mb-1">Modern Tithing</h4>
                        <p className="text-white/70 text-sm">
                          Using digital currencies to give to your church and charitable causes.
                        </p>
                      </div>
                      
                      <div className="bg-black/40 border-l-4 border-ancient-gold p-4">
                        <h4 className="text-white font-medium mb-1">Biblical Investing</h4>
                        <p className="text-white/70 text-sm">
                          Applying scripture principles to modern investment strategies.
                        </p>
                      </div>
                      
                      <div className="bg-black/40 border-l-4 border-ancient-gold p-4">
                        <h4 className="text-white font-medium mb-1">Debt Management</h4>
                        <p className="text-white/70 text-sm">
                          Creating a biblical approach to handling and eliminating debt.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="study">
                <Card className="bg-black/70 border border-scripture">
                  <CardContent className="p-6">
                    <h3 className="text-xl text-ancient-gold font-pixel mb-4">
                      Deep Study
                    </h3>
                    <p className="text-white/80 mb-4">
                      Comprehensive study guides on biblical financial wisdom coming soon.
                    </p>
                    
                    <div className="p-8 text-center">
                      <p className="text-white/60">
                        This feature is under development. Check back soon!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WisdomPage;
