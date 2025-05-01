
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Church } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";

const ChurchSearch: React.FC = () => {
  const { playSound } = useSound();
  
  return (
    <>
      <h2 className="text-2xl font-scroll mb-4">Find a Church</h2>
      <Card className="pixel-card mb-6">
        <CardContent className="pt-6">
          <div className="mb-4">
            <Label htmlFor="church-search">Search by name or location</Label>
            <div className="flex mt-1">
              <Input id="church-search" placeholder="e.g. First Baptist Church" className="rounded-r-none" />
              <PixelButton className="rounded-l-none" onClick={() => playSound("select")}>
                <Search size={16} />
              </PixelButton>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer"
                 onClick={() => playSound("click")}>
              <div>
                <h3 className="font-bold">First Community Church</h3>
                <p className="text-sm text-muted-foreground">Columbus, OH</p>
              </div>
              <Church size={20} className="text-scripture" />
            </div>
            
            <div className="border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer"
                 onClick={() => playSound("click")}>
              <div>
                <h3 className="font-bold">Grace Fellowship</h3>
                <p className="text-sm text-muted-foreground">Dallas, TX</p>
              </div>
              <Church size={20} className="text-scripture" />
            </div>
            
            <div className="border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer"
                 onClick={() => playSound("click")}>
              <div>
                <h3 className="font-bold">Hope City Church</h3>
                <p className="text-sm text-muted-foreground">Portland, OR</p>
              </div>
              <Church size={20} className="text-scripture" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="pixel-card">
        <CardContent className="pt-6">
          <h3 className="text-xl font-scroll mb-3">Your Church Not Listed?</h3>
          <p className="mb-3">Add your church and we'll help you set up digital tithing.</p>
          <PixelButton onClick={() => playSound("coin")}>Add New Church</PixelButton>
        </CardContent>
      </Card>
    </>
  );
};

export default ChurchSearch;
