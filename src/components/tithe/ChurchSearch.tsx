
import React, { useState } from "react";
import { searchChurches } from "@/services/churchService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Church } from "@/types/church";

interface ChurchSearchProps {
  onSelectChurch?: (church: Church) => void;
}

const ChurchSearch: React.FC<ChurchSearchProps> = ({ onSelectChurch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { playSound } = useSound();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      playSound("scroll");
      
      const results = await searchChurches(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        playSound("error");
      } else {
        playSound("success");
      }
    } catch (error) {
      console.error("Error searching churches:", error);
      playSound("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChurch = (church: Church) => {
    setSelectedChurch(church);
    setDetailsOpen(true);
    playSound("select");
    
    if (onSelectChurch) {
      onSelectChurch(church);
    }
  };

  // Create a separate ChurchDetailsDialog component that accepts a proper onClose prop
  const ChurchDetailsDialog = ({ 
    church, 
    open, 
    onClose 
  }: { 
    church: Church | null, 
    open: boolean, 
    onClose: () => void 
  }) => {
    if (!church) return null;
    
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{church.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-2">
            <p><strong>Location:</strong> {church.city}, {church.state}, {church.country}</p>
            {church.denomination && <p><strong>Denomination:</strong> {church.denomination}</p>}
            {church.website && (
              <p>
                <strong>Website:</strong>{" "}
                <a 
                  href={church.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {church.website}
                </a>
              </p>
            )}
            <p>
              <strong>Accepts Cryptocurrency:</strong>{" "}
              {church.acceptsCrypto ? "Yes" : "No"}
            </p>
            <p>
              <strong>Payment Methods:</strong>{" "}
              {church.paymentMethods.join(", ")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Search churches by name or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          <Search size={18} className="mr-1" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((church) => (
            <Card 
              key={church.id} 
              className="p-4 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectChurch(church)}
            >
              <h3 className="font-medium">{church.name}</h3>
              <p className="text-gray-600">
                {church.city}, {church.state}, {church.country}
              </p>
              <p className="text-xs text-gray-500">
                {church.acceptsCrypto ? "Accepts crypto" : "Traditional giving only"}
              </p>
            </Card>
          ))}
        </div>
      ) : searchTerm.length > 0 && !isLoading ? (
        <p className="text-gray-500">No churches found. Would you like to add one?</p>
      ) : null}
      
      <ChurchDetailsDialog 
        church={selectedChurch} 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
      />
    </div>
  );
};

export default ChurchSearch;
