
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Church as ChurchIcon, Plus } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import { searchChurches, Church } from "@/services/churchService";
import AddChurchForm from "./AddChurchForm";

const ChurchSearch: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddChurchForm, setShowAddChurchForm] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  
  useEffect(() => {
    // Initial load of churches
    handleSearch();
  }, []);
  
  const handleSearch = async () => {
    try {
      setLoading(true);
      playSound("select");
      
      const results = await searchChurches(searchQuery);
      setChurches(results);
      
      toast({
        title: "Churches Found",
        description: `Found ${results.length} churches${searchQuery ? ` matching "${searchQuery}"` : ''}`,
      });
    } catch (error) {
      console.error("Error searching churches:", error);
      toast({
        title: "Error",
        description: "Failed to search churches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNewChurch = () => {
    playSound("coin");
    setShowAddChurchForm(true);
  };
  
  const handleCloseAddChurchForm = () => {
    setShowAddChurchForm(false);
    // Refresh the church list after adding a new one
    handleSearch();
  };
  
  const handleSelectChurch = (church: Church) => {
    playSound("click");
    setSelectedChurch(church);
    
    toast({
      title: "Church Selected",
      description: `You selected ${church.name}`,
    });
    
    // Here you would typically update some parent component or context with the selected church
    // For now, we just display a toast notification
  };
  
  return (
    <>
      <h2 className="text-2xl font-scroll mb-4">Find a Church</h2>
      
      {showAddChurchForm ? (
        <AddChurchForm onClose={handleCloseAddChurchForm} />
      ) : (
        <>
          <Card className="pixel-card mb-6">
            <CardContent className="pt-6">
              <div className="mb-4">
                <Label htmlFor="church-search">Search by name or location</Label>
                <div className="flex mt-1">
                  <Input 
                    id="church-search" 
                    placeholder="e.g. First Baptist Church" 
                    className="rounded-r-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <PixelButton 
                    className="rounded-l-none" 
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    <Search size={16} />
                  </PixelButton>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : churches.length > 0 ? (
                  churches.map(church => (
                    <div 
                      key={church.id}
                      className={`border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer ${selectedChurch?.id === church.id ? 'bg-secondary' : ''}`}
                      onClick={() => handleSelectChurch(church)}
                    >
                      <div>
                        <h3 className="font-bold">{church.name}</h3>
                        <p className="text-sm text-muted-foreground">{church.location}</p>
                        {church.denomination && (
                          <p className="text-xs text-muted-foreground">{church.denomination}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        {church.acceptsCrypto && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                            Accepts Crypto
                          </span>
                        )}
                        <ChurchIcon size={20} className="text-scripture" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    No churches found. Try adjusting your search or add a new church.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="pixel-card">
            <CardContent className="pt-6">
              <h3 className="text-xl font-scroll mb-3">Your Church Not Listed?</h3>
              <p className="mb-3">Add your church and we'll help you set up digital tithing.</p>
              <PixelButton onClick={handleAddNewChurch} className="flex items-center">
                <Plus size={16} className="mr-2" /> Add New Church
              </PixelButton>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default ChurchSearch;
