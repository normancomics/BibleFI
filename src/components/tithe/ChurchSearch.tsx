
import React, { useState, useEffect } from "react";
import { Search, Plus, Church, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockChurches } from "@/data/mockChurches";
import { Church as ChurchType } from "@/types/church";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { searchChurches, joinChurch } from "@/services/churchService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import FarcasterConnect from "@/farcaster/FarcasterConnect";
import { supabase } from "@/integrations/supabase/client";
import { useFarcasterAuth } from "@/farcaster/auth";

interface ChurchSearchProps {
  onAddChurch?: () => void;
}

const ChurchSearch: React.FC<ChurchSearchProps> = ({ onAddChurch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChurch, setSelectedChurch] = useState<ChurchType | null>(null);
  const [filteredChurches, setFilteredChurches] = useState<ChurchType[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
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
      const results = await searchChurches(searchQuery);
      setFilteredChurches(results);
      setSearched(true);
      
      if (results.length === 0) {
        toast({
          title: "No churches found",
          description: "Try different search terms or add your church",
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
      // If we have a Supabase session, use that to join the church
      if (session) {
        const success = await joinChurch(selectedChurch.id);
        
        if (success) {
          toast({
            title: "Church Joined",
            description: `You've successfully joined ${selectedChurch.name}`,
          });
        } else {
          throw new Error("Failed to join church");
        }
      } else {
        // Just show success for now when using Farcaster
        toast({
          title: "Church Selected",
          description: `${selectedChurch.name} selected as your church`,
        });
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
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-scroll mb-4">Find Your Church</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by church name or location"
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
      
      {searched && filteredChurches.length === 0 && (
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
      
      {filteredChurches.length > 0 && !selectedChurch && !loading && (
        <Card className="pixel-card mb-4">
          <CardContent className="pt-6 space-y-4">
            {filteredChurches.map((church) => (
              <React.Fragment key={church.id}>
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-muted/50 p-2 rounded"
                  onClick={() => handleChurchSelect(church)}
                >
                  <div>
                    <h3 className="font-bold">{church.name}</h3>
                    <p className="text-sm text-muted-foreground">{church.location}</p>
                  </div>
                  <div className="flex items-center">
                    {church.acceptsCrypto && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                        Accepts Crypto
                      </span>
                    )}
                    <span className="text-xs">ID: {typeof church.id === 'string' ? church.id.substring(0, 8) : church.id}</span>
                  </div>
                </div>
                <Separator />
              </React.Fragment>
            ))}
            
            <div className="pt-2 text-center">
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
          </CardContent>
        </Card>
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
            
            <p className="text-muted-foreground">{selectedChurch.location}</p>
            
            <div className="mt-4">
              <p className="text-sm">Accepted payment methods:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedChurch.payment_methods?.map((method) => (
                  <span key={method} className="bg-muted px-2 py-1 text-xs rounded">
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </span>
                ))}
              </div>
              
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
