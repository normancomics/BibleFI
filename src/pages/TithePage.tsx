import React, { useState, useEffect } from "react";
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
import { ArrowRight, Church, Coins, HandCoins, CreditCard, UserPlus, Clock, LayoutDashboard } from "lucide-react";
import { daimoClient } from "@/integrations/daimo/client";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import TitheAndShare from "@/components/tithe/TitheAndShare";
import AddChurchForm from "@/components/tithe/AddChurchForm";
import FarcasterFrame from "@/components/farcaster/FarcasterFrame";
import { useFarcasterAuth } from "@/farcaster/auth";
import { getUserChurches } from "@/services/churchService";
import { supabase } from "@/integrations/supabase/client";
import { Church as ChurchType } from "@/types/church";
import SuperfluidTithe from "@/components/tithe/SuperfluidTithe";
import TithingDashboard from "@/components/tithe/TithingDashboard";

const TithePage: React.FC = () => {
  // Get a random verse about giving
  const financialVerse = getRandomVerse();
  const { playSound } = useSound();
  const { toast } = useToast();
  const { user } = useFarcasterAuth();
  const [showAddChurch, setShowAddChurch] = useState(false);
  const [activeTab, setActiveTab] = useState("church-search");
  const [userChurches, setUserChurches] = useState<ChurchType[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isLoadingChurches, setIsLoadingChurches] = useState(false);
  const [viewMode, setViewMode] = useState<"forms" | "dashboard">("forms");
  
  // Check if user is logged in with Supabase
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Fetch user churches when auth state changes
  useEffect(() => {
    const fetchUserChurches = async () => {
      if (!session && !user) return;
      
      setIsLoadingChurches(true);
      try {
        const churches = await getUserChurches();
        setUserChurches(churches);
      } catch (error) {
        console.error("Error fetching user churches:", error);
      } finally {
        setIsLoadingChurches(false);
      }
    };
    
    fetchUserChurches();
  }, [session, user]);
  
  const handleDaimoQuickTithe = () => {
    playSound("coin");
    // Generate a Daimo payment link with default values using a Base wallet address
    const paymentLink = daimoClient.generatePaymentLink({
      recipient: "0x742d35Cc6634C0532925a3b8D435bADFF5D6C5b4", // Example Base wallet address
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
  
  const handleChurchAdded = (churchId: string) => {
    // After a church is added, refresh the user churches list
    const fetchUserChurches = async () => {
      try {
        const churches = await getUserChurches();
        setUserChurches(churches);
        
        // Switch to "my-churches" tab if it exists
        if (userChurches.length > 0) {
          setActiveTab("my-churches");
        } else {
          setActiveTab("church-search");
        }
      } catch (error) {
        console.error("Error fetching user churches:", error);
      }
    };
    
    fetchUserChurches();
  };
  
  const toggleViewMode = () => {
    playSound("select");
    setViewMode(prev => prev === "forms" ? "dashboard" : "forms");
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
          
          <div className="flex justify-center items-center gap-4 mt-6">
            <PixelButton 
              onClick={handleDaimoQuickTithe} 
              className="flex items-center bg-gradient-to-r from-purple-800 to-purple-900"
              farcasterStyle
            >
              <CreditCard className="mr-2" size={18} />
              Quick Tithe with Daimo
            </PixelButton>
            
            {(session || user) && (
              <PixelButton 
                onClick={toggleViewMode}
                variant="outline"
                className="flex items-center"
              >
                {viewMode === "forms" ? (
                  <>
                    <LayoutDashboard size={18} className="mr-2" />
                    View Dashboard
                  </>
                ) : (
                  <>
                    <HandCoins size={18} className="mr-2" />
                    Tithe Now
                  </>
                )}
              </PixelButton>
            )}
          </div>
        </div>

        {viewMode === "forms" ? (
          <>
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
                <Tabs defaultValue="one-time" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="one-time" className="font-scroll">One-Time</TabsTrigger>
                    <TabsTrigger value="recurring" className="font-scroll">Recurring</TabsTrigger>
                  </TabsList>
                  <TabsContent value="one-time">
                    <DigitalTithingForm />
                  </TabsContent>
                  <TabsContent value="recurring">
                    <SuperfluidTithe />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="md:col-span-1">
                <TitheAndShare />
              </div>
            </div>
            
            {showAddChurch ? (
              <AddChurchForm 
                onComplete={() => setShowAddChurch(false)} 
                onChurchAdded={handleChurchAdded}
              />
            ) : (
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-12">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="church-search">Find a Church</TabsTrigger>
                  <TabsTrigger value="my-churches" disabled={userChurches.length === 0}>My Churches</TabsTrigger>
                  <TabsTrigger value="impact">Impact Stories</TabsTrigger>
                  <TabsTrigger value="farcaster">Farcaster Frame</TabsTrigger>
                </TabsList>
                
                <TabsContent value="church-search" className="pt-4">
                  <ChurchSearch onAddChurch={() => setShowAddChurch(true)} />
                </TabsContent>
                
                <TabsContent value="my-churches" className="pt-4">
                  {userChurches.length > 0 ? (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-scroll mb-4">My Churches</h2>
                      
                      {userChurches.map(church => (
                        <Card key={church.id} className="mb-4">
                          <CardContent className="pt-6">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-lg font-medium">{church.name}</h3>
                                <p className="text-sm text-muted-foreground">{church.location}</p>
                                {church.isPrimaryChurch && (
                                  <span className="inline-block mt-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                    Primary Church
                                  </span>
                                )}
                              </div>
                              <div>
                                <PixelButton 
                                  onClick={handleDaimoQuickTithe} 
                                  size="sm"
                                  farcasterStyle
                                >
                                  <HandCoins size={14} className="mr-1" /> Tithe Now
                                </PixelButton>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <div className="flex justify-center mt-4">
                        <PixelButton
                          onClick={() => setShowAddChurch(true)}
                          variant="outline"
                          className="flex items-center"
                        >
                          <UserPlus size={16} className="mr-2" />
                          Add Another Church
                        </PixelButton>
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-amber-50 border-amber-200 mb-4">
                      <CardContent className="pt-6 text-center">
                        <p className="text-amber-700 mb-4">
                          You haven't joined any churches yet.
                        </p>
                        <PixelButton 
                          onClick={() => setActiveTab("church-search")}
                          className="mr-2"
                        >
                          Find a Church
                        </PixelButton>
                        <PixelButton 
                          variant="outline"
                          onClick={() => setShowAddChurch(true)}
                        >
                          Add Your Church
                        </PixelButton>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="impact" className="pt-4">
                  <ImpactStories />
                </TabsContent>
                
                <TabsContent value="farcaster" className="pt-4">
                  <FarcasterFrame />
                </TabsContent>
              </Tabs>
            )}
          </>
        ) : (
          <div className="mb-12">
            <TithingDashboard />
          </div>
        )}
        
        <div className="mb-12">
          <TithingAchievements />
        </div>
      </main>
    </div>
  );
};

export default TithePage;
