
import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import PixelButton from "@/components/PixelButton";
import ScriptureCard from "@/components/ScriptureCard";
import { getVersesByCategory } from "@/data/bibleVerses";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Church, ArrowRight, Heart, Users, MapPin, Trophy } from "lucide-react";
import PixelCharacter from "@/components/PixelCharacter";
import { useSound } from "@/contexts/SoundContext";

// Mock impact stories
const impactStories = [
  {
    church: "Hope City Church",
    location: "Portland, OR",
    story: "Your tithes helped feed 120 families through our food pantry this month.",
    imageUrl: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png" 
  },
  {
    church: "Grace Fellowship",
    location: "Dallas, TX",
    story: "With your support, we were able to fund a new children's wing focused on biblical financial education.",
    imageUrl: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png"
  },
  {
    church: "First Community Church",
    location: "Columbus, OH",
    story: "Your contributions helped us launch a financial literacy program for underprivileged youth in our community.",
    imageUrl: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  }
];

const TithePage: React.FC = () => {
  const givingVerses = getVersesByCategory("giving");
  const { playSound, userInteracted } = useSound();
  const [selectedImpact, setSelectedImpact] = useState(0);
  
  // Play page load sound when user has interacted
  useEffect(() => {
    if (userInteracted) {
      playSound("scroll");
    }
  }, [userInteracted, playSound]);
  
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
        
        <PixelCharacter 
          character="jesus" 
          message="It is more blessed to give than to receive. - Acts 20:35"
          className="mb-8 max-w-2xl mx-auto"
          soundEffect={true}
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
            
            {/* New Impact Tracking Section */}
            <Card className="pixel-card mt-6">
              <CardContent className="pt-6">
                <h3 className="text-xl font-scroll mb-3 flex items-center">
                  <Heart size={20} className="text-scripture mr-2" /> 
                  Your Tithing Impact
                </h3>
                
                <div className="bg-black/10 p-4 rounded-md mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={impactStories[selectedImpact].imageUrl} 
                      alt="Church icon" 
                      className="w-12 h-12 rounded-md object-cover" 
                    />
                    <div>
                      <h4 className="font-bold">{impactStories[selectedImpact].church}</h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin size={12} className="mr-1" />
                        {impactStories[selectedImpact].location}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm border-l-4 border-scripture-light pl-3">
                    {impactStories[selectedImpact].story}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {impactStories.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => {
                        setSelectedImpact(index);
                        playSound("select");
                      }}
                      className={`w-3 h-3 rounded-full ${selectedImpact === index ? 'bg-scripture' : 'bg-gray-300'}`}
                      aria-label={`Impact story ${index + 1}`}
                    ></button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
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
            
            <div className="mb-6">
              <PixelCharacter 
                character="david" 
                message="I will not sacrifice to the LORD my God burnt offerings that cost me nothing. - 2 Samuel 24:24"
                size={44}
                soundEffect={true}
              />
            </div>
            
            {/* Achievement Card */}
            <Card className="pixel-card mb-6">
              <CardContent className="pt-6">
                <h3 className="text-xl font-scroll mb-3 flex items-center">
                  <Trophy size={20} className="text-scripture mr-2" /> 
                  Tithing Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-scripture/20 p-3 rounded-md text-center">
                    <h4 className="font-pixel text-sm mb-1">First Fruits</h4>
                    <p className="text-xs text-muted-foreground">First time tithing</p>
                  </div>
                  <div className="border border-dashed border-scripture/20 p-3 rounded-md text-center opacity-50">
                    <h4 className="font-pixel text-sm mb-1">Consistent Giver</h4>
                    <p className="text-xs text-muted-foreground">Tithe 3 months in a row</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {givingVerses.length > 0 && (
              <ScriptureCard verse={givingVerses[0]} />
            )}
          </div>
        </div>
        
        <div className="mt-12 bg-black/20 p-6 rounded-lg border border-pixel-cyan">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-scroll text-ancient-gold">Wisdom From the Saints</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <PixelCharacter 
              character="paul" 
              message="Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. - 2 Corinthians 9:7"
              soundEffect={true}
            />
            
            <PixelCharacter 
              character="moses" 
              message="No one should appear before the LORD empty-handed. - Deuteronomy 16:16"
              soundEffect={true}
            />
          </div>
        </div>
      </main>
      
      {/* Hidden audio player to enable sound on iOS */}
      <audio id="sound-enabler" preload="auto" src="/sounds/click.mp3" style={{ display: 'none' }} />
    </div>
  );
};

export default TithePage;
