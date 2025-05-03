
import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockChurches } from "@/data/mockChurches";
import { Church } from "@/types/church";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";

interface ChurchSearchProps {
  onAddChurch?: () => void;
}

const ChurchSearch: React.FC<ChurchSearchProps> = ({ onAddChurch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [searched, setSearched] = useState(false);
  const { playSound } = useSound();
  
  const handleSearch = () => {
    playSound("select");
    
    if (searchQuery.trim().length > 0) {
      const results = mockChurches.filter(church => 
        church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredChurches(results);
      setSearched(true);
    }
  };
  
  const handleChurchSelect = (church: Church) => {
    playSound("coin");
    setSelectedChurch(church);
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
        <PixelButton onClick={handleSearch} className="pixel-button">
          <Search size={18} />
        </PixelButton>
      </div>
      
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
      
      {filteredChurches.length > 0 && !selectedChurch && (
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
                    {church.payment_methods?.includes("crypto") && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                        Accepts Crypto
                      </span>
                    )}
                    <span className="text-xs">ID: {church.id.substring(0, 8)}</span>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChurchSearch;
