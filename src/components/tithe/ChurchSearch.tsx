
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Church, Plus } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";

// This type will help us work with church data from our future database
type Church = {
  id: string;
  name: string;
  location: string;
  denomination?: string;
  acceptsCrypto: boolean;
};

const ChurchSearch: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - this would come from your Supabase database in the future
  const mockChurches: Church[] = [
    { id: "1", name: "First Community Church", location: "Columbus, OH", acceptsCrypto: true },
    { id: "2", name: "Grace Fellowship", location: "Dallas, TX", acceptsCrypto: false },
    { id: "3", name: "Hope City Church", location: "Portland, OR", acceptsCrypto: true },
  ];
  
  // In a real implementation, this would query your Supabase database
  const handleSearch = () => {
    playSound("select");
    toast({
      title: "Searching for churches",
      description: `Found ${mockChurches.length} churches matching "${searchQuery}"`,
    });
  };
  
  const handleAddNewChurch = () => {
    playSound("coin");
    toast({
      title: "Add New Church",
      description: "This would open a form to add a new church to the database.",
    });
  };
  
  const handleSelectChurch = (church: Church) => {
    playSound("click");
    toast({
      title: "Church Selected",
      description: `You selected ${church.name}`,
    });
  };
  
  return (
    <>
      <h2 className="text-2xl font-scroll mb-4">Find a Church</h2>
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
              <PixelButton className="rounded-l-none" onClick={handleSearch}>
                <Search size={16} />
              </PixelButton>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            {mockChurches.map(church => (
              <div 
                key={church.id}
                className="border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer"
                onClick={() => handleSelectChurch(church)}
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
                  <Church size={20} className="text-scripture" />
                </div>
              </div>
            ))}
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
  );
};

export default ChurchSearch;
