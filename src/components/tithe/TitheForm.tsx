
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import PixelCharacter from "@/components/PixelCharacter";
import { useSound } from "@/contexts/SoundContext";

const TitheForm: React.FC = () => {
  const { playSound } = useSound();
  
  return (
    <>
      <h2 className="text-2xl font-scroll mb-4">Give Your Tithe</h2>
      <Card className="pixel-card mb-6">
        <CardContent className="pt-6">
          <div className="mb-6">
            <PixelCharacter 
              character="solomon" 
              message="Honor the LORD with your wealth, with the firstfruits of all your crops. - Proverbs 3:9"
              size={40}
              soundEffect={true}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Tithe</Label>
              <Input id="amount" placeholder="0.00" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="token">Select Token</Label>
              <select id="token" className="w-full border border-input rounded px-3 py-2 mt-1"
                      onChange={() => playSound("select")}>
                <option>USDC</option>
                <option>DAI</option>
                <option>ETH</option>
              </select>
            </div>
            
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Amount:</span>
                <span>100 USDC</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Conversion Fee:</span>
                <span>2 USDC</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>102 USDC</span>
              </div>
            </div>
            
            <PixelButton className="w-full flex items-center justify-center" onClick={() => playSound("coin")}>
              Give Tithe <ArrowRight size={16} className="ml-2" />
            </PixelButton>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TitheForm;
