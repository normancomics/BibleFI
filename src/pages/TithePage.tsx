
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SaintsWisdom from "@/components/tithe/SaintsWisdom";
import TitheForm from "@/components/tithe/TitheForm";
import DigitalTithingForm from "@/components/tithe/DigitalTithingForm";
import ImpactStories from "@/components/tithe/ImpactStories";
import ChurchSearch from "@/components/tithe/ChurchSearch";
import TithingAchievements from "@/components/tithe/TithingAchievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRandomVerse } from "@/data/bibleVerses";
import { ArrowRight, Church, Coins, HandCoins, CreditCard } from "lucide-react";
import { daimoClient } from "@/integrations/daimo/client";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import TitheAndShare from "@/components/tithe/TitheAndShare";
import AddChurchForm from "@/components/tithe/AddChurchForm";
import FarcasterFrame from "@/components/farcaster/FarcasterFrame";

const TithePage: React.FC = () => {
  // Get a random verse about giving
  const financialVerse = getRandomVerse();
  const { playSound } = useSound();
  const { toast } = useToast();
  const [showAddChurch, setShowAddChurch] = useState(false);
  
  const handleDaimoQuickTithe = () => {
    playSound("coin");
    // Generate a Daimo payment link with default values
    const paymentLink = daimoClient.generatePaymentLink({
      recipient: "example-church.eth", // This would be dynamically set based on selected church
      amount: "10",
      token: "usdc",
      message: "Tithe from Bible.fi"
    });
    
    toast({
      title: "Opening Daimo",
      description: "Redirecting to Daimo for quick tithing...",
    });
    
    // Open the payment link in a new tab
    window.open(paymentLink, "_blank");
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-scroll text-ancient-gold mb-4">Biblical Digital Tithing</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            "Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this," says the LORD Almighty, "and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it."
          </p>
          <p className="text-ancient-gold/70 mt-2 font-scroll">- Malachi 3:10</p>
          
          <div className="flex justify-center mt-6">
            <PixelButton 
              onClick={handleDaimoQuickTithe} 
              className="flex items-center bg-gradient-to-r from-purple-800 to-purple-900"
              farcasterStyle
            >
              <CreditCard className="mr-2" size={18} />
              Quick Tithe with Daimo
            </PixelButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <Card className="h-full border-2 border-scripture/30 bg-black/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church size={24} className="text-ancient-gold" />
                  <span>About Digital Tithing</span>
                </CardTitle>
                <CardDescription>
                  Supporting ministries with digital currencies via Daimo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Digital tithing allows believers to honor God with their finances using modern technology. 
                  Whether you prefer cryptocurrency or traditional payment methods, Bible.fi makes it easy 
                  to give to your local church or global ministries.
                </p>
                
                <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30 mb-4">
                  <h3 className="text-ancient-gold font-medium mb-2">Scripture Reference</h3>
                  <p className="italic text-white/80">{financialVerse.text}</p>
                  <p className="text-right text-sm text-ancient-gold/70 mt-2">{financialVerse.reference}</p>
                </div>
                
                <h3 className="font-medium text-scripture mb-2">Benefits of Digital Tithing with Daimo</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ArrowRight size={16} className="text-ancient-gold flex-shrink-0" />
                    <span>Fast, direct payments to churches worldwide</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={16} className="text-ancient-gold flex-shrink-0" />
                    <span>Ultra-low transaction fees on Base Chain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={16} className="text-ancient-gold flex-shrink-0" />
                    <span>Support churches that don't accept crypto directly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={16} className="text-ancient-gold flex-shrink-0" />
                    <span>Track your giving history and impact</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={16} className="text-ancient-gold flex-shrink-0" />
                    <span>Automate recurring tithes with Superfluid streams</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <DigitalTithingForm />
          </div>
          
          <div className="md:col-span-1">
            <TitheAndShare />
          </div>
        </div>
        
        {showAddChurch ? (
          <AddChurchForm onComplete={() => setShowAddChurch(false)} />
        ) : (
          <Tabs defaultValue="church-search" className="mb-12">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="church-search">Find a Church</TabsTrigger>
              <TabsTrigger value="impact">Impact Stories</TabsTrigger>
              <TabsTrigger value="farcaster">Farcaster Frame</TabsTrigger>
            </TabsList>
            <TabsContent value="church-search" className="pt-4">
              <ChurchSearch onAddChurch={() => setShowAddChurch(true)} />
            </TabsContent>
            <TabsContent value="impact" className="pt-4">
              <ImpactStories />
            </TabsContent>
            <TabsContent value="farcaster" className="pt-4">
              <FarcasterFrame />
            </TabsContent>
          </Tabs>
        )}
        
        <div className="mb-12">
          <TithingAchievements />
        </div>
      </main>
    </div>
  );
};

export default TithePage;
