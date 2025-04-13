
import React from "react";
import NavBar from "@/components/NavBar";
import BibleCharacter from "@/components/BibleCharacter";
import PixelButton from "@/components/PixelButton";
import ScriptureCard from "@/components/ScriptureCard";
import { getVersesByCategory } from "@/data/bibleVerses";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Church, ArrowRight } from "lucide-react";

const TithePage: React.FC = () => {
  const givingVerses = getVersesByCategory("giving");
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-scroll text-scripture-dark mb-4">Digital Tithing</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Give your tithe to churches worldwide, even if they don't accept cryptocurrency.
          </p>
        </section>
        
        <BibleCharacter 
          character="jesus" 
          message="It is more blessed to give than to receive. - Acts 20:35"
          className="mb-8 max-w-2xl mx-auto"
        />
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-scroll mb-4">Find a Church</h2>
            <Card className="pixel-card mb-6">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Label htmlFor="church-search">Search by name or location</Label>
                  <div className="flex mt-1">
                    <Input id="church-search" placeholder="e.g. First Baptist Church" className="rounded-r-none" />
                    <PixelButton className="rounded-l-none">
                      <Search size={16} />
                    </PixelButton>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer">
                    <div>
                      <h3 className="font-bold">First Community Church</h3>
                      <p className="text-sm text-muted-foreground">Columbus, OH</p>
                    </div>
                    <Church size={20} className="text-scripture" />
                  </div>
                  
                  <div className="border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer">
                    <div>
                      <h3 className="font-bold">Grace Fellowship</h3>
                      <p className="text-sm text-muted-foreground">Dallas, TX</p>
                    </div>
                    <Church size={20} className="text-scripture" />
                  </div>
                  
                  <div className="border border-border p-3 rounded flex justify-between items-center hover:bg-secondary cursor-pointer">
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
                <PixelButton>Add New Church</PixelButton>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-2xl font-scroll mb-4">Give Your Tithe</h2>
            <Card className="pixel-card mb-6">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-4">First Community Church</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount to Tithe</Label>
                    <Input id="amount" placeholder="0.00" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="token">Select Token</Label>
                    <select id="token" className="w-full border border-input rounded px-3 py-2 mt-1">
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
                  
                  <PixelButton className="w-full flex items-center justify-center">
                    Give Tithe <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </div>
              </CardContent>
            </Card>
            
            <ScriptureCard verse={givingVerses[0]} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TithePage;
