
import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import BibleCharacter from "@/components/BibleCharacter";
import PixelButton from "@/components/PixelButton";
import FarcasterFrame from "@/components/farcaster/FarcasterFrame";
import WalletConnect from "@/components/wallet/WalletConnect";
import { Card } from "@/components/ui/card";
import { 
  Coins, 
  BookOpen, 
  Church, 
  ArrowRight, 
  BarChart 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSound } from "@/contexts/SoundContext";

const Index: React.FC = () => {
  const { playSound, setUserInteracted } = useSound();
  const [showIntro, setShowIntro] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.";
  
  // Enable sound on page load
  useEffect(() => {
    // Force enable user interaction for development
    setUserInteracted(true);
    
    // Play an initial sound to unlock audio on iOS/Safari
    const unlockAudio = () => {
      playSound("select");
    };
    
    // Add a slight delay to ensure the context is ready
    const timer = setTimeout(() => {
      unlockAudio();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [playSound, setUserInteracted]);
  
  // Handle typing animation
  useEffect(() => {
    if (showIntro) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.substring(0, i + 1));
          i++;
          
          // Add sound effect every few characters
          if (i % 5 === 0) {
            playSound("select");
          }
        } else {
          clearInterval(typingInterval);
          
          // Show main content after typing finishes
          setTimeout(() => {
            setShowIntro(false);
            setShowMainContent(true);
            playSound("powerup");
          }, 1000);
        }
      }, 50);
      
      return () => clearInterval(typingInterval);
    }
  }, [showIntro, playSound, fullText]);
  
  // Function to handle user interaction
  const handleInteraction = () => {
    setUserInteracted(true);
    playSound("select");
  };
  
  return (
    <div className="min-h-screen" onClick={handleInteraction}>
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        {showIntro && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
            <div className="text-center max-w-2xl mx-auto p-8">
              <h1 className="text-6xl font-game text-scripture mb-8 animate-pulse">BIBLE.FI</h1>
              <div className="border-2 border-scripture p-6 bg-black/80">
                <p className="text-xl font-pixel text-white">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {showMainContent && (
          <>
            <section className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-scroll text-scripture-dark mb-4">Bible.Fi</h1>
              <p className="text-xl max-w-2xl mx-auto">
                Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
              </p>
              
              <BibleCharacter 
                character="solomon" 
                message="Wisdom is more precious than rubies, and all the things you may desire cannot compare with her. - Proverbs 8:11"
                className="mt-8 max-w-2xl mx-auto text-left"
              />
            </section>
            
            {/* New Wallet Connect Section */}
            <section className="my-10">
              <WalletConnect />
            </section>
            
            <DailyScripture />
            
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
              <Card className="pixel-card p-6 flex flex-col items-center text-center">
                <Church size={48} className="text-scripture mb-4" />
                <h2 className="text-2xl font-scroll mb-2">Digital Tithing</h2>
                <p className="mb-4">Give your tithe to churches worldwide, even if they don't accept crypto.</p>
                <Link to="/tithe" className="mt-auto">
                  <PixelButton className="flex items-center" onClick={() => playSound("scroll")}>
                    Tithe Now <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </Card>
              
              <Card className="pixel-card p-6 flex flex-col items-center text-center">
                <Coins size={48} className="text-scripture mb-4" />
                <h2 className="text-2xl font-scroll mb-2">Biblical Staking</h2>
                <p className="mb-4">Grow your wealth little by little through our scripture-based staking pools.</p>
                <Link to="/staking" className="mt-auto">
                  <PixelButton className="flex items-center" onClick={() => playSound("coin")}>
                    Stake Now <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </Card>
              
              <Card className="pixel-card p-6 flex flex-col items-center text-center">
                <BookOpen size={48} className="text-scripture mb-4" />
                <h2 className="text-2xl font-scroll mb-2">Invest Wisely</h2>
                <p className="mb-4">Learn what the Bible teaches about money, wealth, and stewardship.</p>
                <Link to="/wisdom" className="mt-auto">
                  <PixelButton className="flex items-center" onClick={() => playSound("select")}>
                    Learn More <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </Card>
            </section>
            
            <section className="my-10">
              <div className="bg-ancient-scroll border-2 border-ancient-gold p-6 rounded-lg">
                <h2 className="text-2xl font-scroll mb-4 text-center">Render Unto Caesar</h2>
                <BibleCharacter 
                  character="jesus" 
                  message="Render unto Caesar the things that are Caesar's, and unto God the things that are God's. - Matthew 22:21"
                  className="mb-4"
                />
                <p className="mb-4">Bible.Fi helps you track and report your crypto transactions for proper tax compliance.</p>
                <div className="text-center">
                  <Link to="/taxes">
                    <PixelButton className="flex items-center mx-auto" onClick={() => playSound("powerup")}>
                      <BarChart size={16} className="mr-2" />
                      Track Taxes
                    </PixelButton>
                  </Link>
                </div>
              </div>
            </section>
            
            {/* Updated Farcaster Frame Component */}
            <FarcasterFrame />
          </>
        )}
      </main>
      
      {/* Enhanced sound activation button for iPad */}
      <button 
        onClick={() => {
          setUserInteracted(true);
          playSound("powerup");
          // Skip intro if button is clicked
          setShowIntro(false);
          setShowMainContent(true);
        }} 
        className="fixed bottom-4 right-4 bg-scripture text-white p-3 rounded-lg shadow-lg z-50 flex items-center"
        aria-label="Enable Sounds"
      >
        <span className="mr-2">🔊</span> Tap for Sounds (iPad Pro)
      </button>
    </div>
  );
};

export default Index;
