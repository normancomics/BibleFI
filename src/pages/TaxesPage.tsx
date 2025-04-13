
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import ScriptureCard from "@/components/ScriptureCard";
import PixelButton from "@/components/PixelButton";
import { getVersesByCategory } from "@/data/bibleVerses";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownToLine, FileSpreadsheet, BarChart3 } from "lucide-react";
import PixelCharacter from "@/components/PixelCharacter";
import SoundEffect from "@/components/SoundEffect";
import { useSound } from "@/contexts/SoundContext";

const TaxesPage: React.FC = () => {
  const taxesVerses = getVersesByCategory("taxes");
  const { playSound, userInteracted } = useSound();
  
  // Play page load sound
  useEffect(() => {
    if (userInteracted) {
      playSound("powerup");
    }
  }, [userInteracted]);
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-scroll text-scripture-dark mb-4">Render Unto Caesar</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Manage your cryptocurrency taxes with biblical wisdom.
          </p>
        </section>
        
        <PixelCharacter 
          character="jesus" 
          message="Render unto Caesar the things that are Caesar's, and unto God the things that are God's. - Matthew 22:21"
          className="mb-8 max-w-2xl mx-auto"
          soundEffect={true}
        />
        
        {taxesVerses.length > 0 && (
          <ScriptureCard verse={taxesVerses[0]} className="mb-8 max-w-2xl mx-auto" />
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="pixel-card">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-scroll mb-4">Tax Reporting</h2>
              <p className="mb-6">Bible.Fi helps you track and report your cryptocurrency transactions for proper tax compliance.</p>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 border border-border rounded" 
                     onClick={() => playSound("click")}>
                  <ArrowDownToLine size={24} className="text-scripture mr-3" />
                  <div>
                    <h3 className="font-bold">Import Transactions</h3>
                    <p className="text-sm text-muted-foreground">Connect wallets and exchanges</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border border-border rounded"
                     onClick={() => playSound("scroll")}>
                  <BarChart3 size={24} className="text-scripture mr-3" />
                  <div>
                    <h3 className="font-bold">Calculate Gains/Losses</h3>
                    <p className="text-sm text-muted-foreground">Automatically calculate tax implications</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border border-border rounded"
                     onClick={() => playSound("select")}>
                  <FileSpreadsheet size={24} className="text-scripture mr-3" />
                  <div>
                    <h3 className="font-bold">Export Tax Forms</h3>
                    <p className="text-sm text-muted-foreground">Generate IRS-ready documents</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <PixelButton className="w-full" onClick={() => playSound("coin")}>
                  Get Started
                </PixelButton>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pixel-card">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-scroll mb-4">Biblical Tax Wisdom</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold">Honesty in All Things</h3>
                  <p className="text-sm mt-1">
                    "The LORD detests dishonest scales, but accurate weights find favor with him." - Proverbs 11:1
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold">Pay What You Owe</h3>
                  <p className="text-sm mt-1">
                    "Give to everyone what you owe them: If you owe taxes, pay taxes; if revenue, then revenue; if respect, then respect; if honor, then honor." - Romans 13:7
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold">Good Record Keeping</h3>
                  <p className="text-sm mt-1">
                    "Suppose one of you wants to build a tower. Won't you first sit down and estimate the cost to see if you have enough money to complete it?" - Luke 14:28
                  </p>
                </div>
                
                <div className="bg-ancient-scroll border border-ancient-gold p-4 rounded-md">
                  <PixelCharacter 
                    character="solomon" 
                    message="The wise store up knowledge, but the mouth of a fool invites ruin. - Proverbs 10:14" 
                    size={40}
                    soundEffect={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pixel-card">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-scroll mb-4">Crypto Tax Calculator</h2>
              <div className="flex mb-4">
                <PixelCharacter 
                  character="david" 
                  message="Let me help you calculate your crypto gains and losses." 
                  size={32}
                  soundEffect={true}
                />
              </div>
              
              <div className="space-y-4 mt-6">
                <p className="text-base">Interactive calculator coming soon!</p>
                <PixelButton className="w-full" onClick={() => playSound("select")}>
                  Subscribe for Updates
                </PixelButton>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pixel-card">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-scroll mb-4">Tax Filing Deadlines</h2>
              <div className="flex mb-4">
                <PixelCharacter 
                  character="moses" 
                  message="Remember the deadlines, as I remembered the commandments." 
                  size={36}
                  soundEffect={true}
                />
              </div>
              
              <div className="space-y-3 mt-6 bg-black/20 p-4 border border-pixel-cyan">
                <div className="flex justify-between items-center">
                  <span className="font-pixel">Individual Returns</span>
                  <span className="font-game text-pixel-green">APR 15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-pixel">Extension Deadline</span>
                  <span className="font-game text-pixel-yellow">OCT 15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-pixel">Quarterly Estimated</span>
                  <span className="font-game text-pixel-red">Q1-Q4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Hidden audio player to enable sound on iOS */}
      <audio id="sound-enabler" preload="auto" src="/sounds/click.mp3" style={{ display: 'none' }} />
    </div>
  );
};

export default TaxesPage;
