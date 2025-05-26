import React, { useState, useEffect } from "react";
import { Search, Plus, Church, CheckCircle, Star, Globe, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Church as ChurchType } from "@/types/church";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { searchChurches, joinChurch, setPrimaryChurch } from "@/services/churchService";
import { ExternalChurchService } from "@/services/externalChurchService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import FarcasterConnect from "@/farcaster/FarcasterConnect";
import { supabase } from "@/integrations/supabase/client";
import { useFarcasterAuth } from "@/farcaster/auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChurchSearchProps {
  onAddChurch?: () => void;
}

const ChurchSearch: React.FC<ChurchSearchProps> = ({ onAddChurch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChurch, setSelectedChurch] = useState<ChurchType | null>(null);
  const [localChurches, setLocalChurches] = useState<ChurchType[]>([]);
  const [externalChurches, setExternalChurches] = useState<ChurchType[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [makeAsPrimary, setMakeAsPrimary] = useState(false);
  const [activeTab, setActiveTab] = useState("local");
  const { playSound } = useSound();
  const { toast } = useToast();
  const { user } = useFarcasterAuth();
  
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
  
  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) return;
    
    playSound("select");
    setLoading(true);
    
    try {
      // Search both local and external sources
      const [localResults, externalResults] = await Promise.all([
        searchChurches(searchQuery),
        ExternalChurchService.searchGooglePlaces(searchQuery)
      ]);
      
      setLocalChurches(localResults);
      setExternalChurches(externalResults);
      setSearched(true);
      
      if (localResults.length === 0 && externalResults.length === 0) {
        toast({
          title: "No churches found",
          description: "Try different search terms or add your church",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${localResults.length + externalResults.length} churches`,
        });
      }
    } catch (error) {
      console.error("Error searching churches:", error);
      toast({
        title: "Search Error",
        description: "There was a problem searching churches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChurchSelect = (church: ChurchType) => {
    playSound("coin");
    setSelectedChurch(church);
  };
  
  const handleJoinChurch = async () => {
    if (!selectedChurch) return;
    
    if (!session && !user) {
      toast({
        title: "Authentication Required",
        description: "Please connect with Farcaster or sign in to join a church",
        variant: "destructive",
      });
      return;
    }
    
    playSound("success");
    
    try {
      if (session || user) {
        const success = await joinChurch(selectedChurch.id);
        
        if (success) {
          if (makeAsPrimary) {
            const primarySuccess = await setPrimaryChurch(selectedChurch.id);
            
            if (primarySuccess) {
              toast({
                title: "Primary Church Set",
                description: `${selectedChurch.name} is now your primary church`,
              });
            }
          }
          
          toast({
            title: "Church Joined",
            description: `You've successfully joined ${selectedChurch.name}`,
          });
        } else {
          throw new Error("Failed to join church");
        }
      }
    } catch (error) {
      console.error("Error joining church:", error);
      toast({
        title: "Error",
        description: "There was a problem joining the church",
        variant: "destructive",
      });
    }
  };
  
  const renderChurchList = (churches: ChurchType[], isExternal = false) => {
    if (churches.length === 0) return null;

    return (
      <Card className="pixel-card mb-4">
        <CardContent className="pt-6 space-y-4">
          {churches.map((church) => (
            <React.Fragment key={church.id}>
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => handleChurchSelect(church)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{church.name}</h3>
                    {isExternal && <Globe size={16} className="text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={12} />
                    <span>{church.location}</span>
                  </div>
                  {church.denomination && (
                    <p className="text-xs text-muted-foreground">{church.denomination}</p>
                  )}
                  {church.website && (
                    <a 
                      href={church.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap gap-1">
                    {church.acceptsCrypto && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Accepts Crypto
                      </span>
                    )}
                    {church.payment_methods?.includes('credit_card') && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Cards
                      </span>
                    )}
                    {church.payment_methods?.includes('paypal') && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        PayPal
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ID: {typeof church.id === 'string' ? church.id.substring(0, 8) : church.id}
                  </span>
                </div>
              </div>
              <Separator />
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-scroll mb-4">Find Your Church</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by church name, denomination, or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <PixelButton onClick={handleSearch} disabled={loading}>
          {loading ? <span className="animate-pulse">...</span> : <Search size={18} />}
        </PixelButton>
      </div>
      
      {!session && !user && (
        <Card className="bg-purple-900/20 border-ancient-gold/20 mb-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-ancient-gold mb-2">
                Connect to join a church or add your own
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <FarcasterConnect size="md" />
                <span className="text-white/50">or</span>
                <PixelButton variant="outline" onClick={() => toast({
                  title: "Coming Soon",
                  description: "Email/password authentication coming soon",
                })}>
                  Sign In with Email
                </PixelButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {searched && localChurches.length === 0 && externalChurches.length === 0 && !loading && (
        <Card className="bg-amber-50 border-amber-200 mb-4">
          <CardContent className="pt-6">
            <p className="text-amber-700 mb-4">
              No churches found matching your search.
            </p>
            <PixelButton 
              variant="outline"
              className="flex items-center"
              onClick={() => {
                playSound("select");
                if (onAddChurch) onAddChurch();
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Your Church
            </PixelButton>
          </CardContent>
        </Card>
      )}
      
      {loading && (
        <Card className="mb-4">
          <CardContent className="pt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Separator className="my-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {(localChurches.length > 0 || externalChurches.length > 0) && !selectedChurch && !loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">
              Local Database ({localChurches.length})
            </TabsTrigger>
            <TabsTrigger value="external">
              <div className="flex items-center gap-2">
                <Globe size={16} />
                Online Search ({externalChurches.length})
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="mt-4">
            {localChurches.length > 0 ? (
              renderChurchList(localChurches, false)
            ) : (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-blue-700 mb-2">No churches in our local database</p>
                  <p className="text-sm text-blue-600">Try the "Online Search" tab or add your church</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="external" className="mt-4">
            {externalChurches.length > 0 ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-700">
                    <Globe size={16} className="inline mr-2" />
                    These churches were found through online search. Contact them directly to verify payment methods.
                  </p>
                </div>
                {renderChurchList(externalChurches, true)}
              </>
            ) : (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-700 mb-2">No churches found in online search</p>
                  <p className="text-sm text-gray-600">Try different search terms or check the local database</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {searched && (localChurches.length > 0 || externalChurches.length > 0) && !selectedChurch && !loading && (
        <div className="text-center">
          <button 
            className="text-sm text-scripture underline hover:text-scripture-dark"
            onClick={() => {
              playSound("select");
              if (onAddChurch) onAddChurch();
            }}
          >
            Don't see your church? Add it now
          </button>
        </div>
      )}
      
      {selectedChurch && (
        <Card className="pixel-card mb-4">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedChurch.name}</h3>
              <span 
                className="text-scripture text-sm cursor-pointer"
                onClick={() => {
                  setSelectedChurch(null);
                  playSound("select");
                }}
              >
                Change
              </span>
            </div>
            
            <div className="flex items-center gap-1 mt-2">
              <MapPin size={16} className="text-muted-foreground" />
              <p className="text-muted-foreground">{selectedChurch.location}</p>
            </div>

            {selectedChurch.denomination && (
              <p className="text-sm text-muted-foreground mt-1">
                Denomination: {selectedChurch.denomination}
              </p>
            )}

            {selectedChurch.website && (
              <a 
                href={selectedChurch.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline mt-1 block"
              >
                Visit Website →
              </a>
            )}
            
            <div className="mt-4">
              <p className="text-sm mb-2">Accepted payment methods:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedChurch.payment_methods?.map((method) => (
                  <span key={method} className="bg-muted px-2 py-1 text-xs rounded">
                    {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                  </span>
                ))}
                {selectedChurch.acceptsCrypto && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">
                    Cryptocurrency
                  </span>
                )}
              </div>
              
              {(session || user) && (
                <div className="flex items-center space-x-2 mt-4">
                  <Switch 
                    id="primary-church" 
                    checked={makeAsPrimary}
                    onCheckedChange={setMakeAsPrimary}
                  />
                  <Label htmlFor="primary-church" className="flex items-center">
                    <Star size={16} className="mr-2 text-yellow-500" />
                    Set as primary church
                  </Label>
                </div>
              )}
              
              <div className="mt-6">
                <PixelButton 
                  className="w-full flex items-center justify-center" 
                  onClick={handleJoinChurch}
                  disabled={!session && !user}
                >
                  <CheckCircle size={16} className="mr-2" />
                  {session || user ? "Select This Church" : "Connect to Select Church"}
                </PixelButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChurchSearch;
