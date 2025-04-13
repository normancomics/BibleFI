
import React from "react";
import NavBar from "@/components/NavBar";
import DailyScripture from "@/components/DailyScripture";
import BibleCharacter from "@/components/BibleCharacter";
import PixelButton from "@/components/PixelButton";
import FarcasterFrame from "@/components/FarcasterFrame";
import { Card } from "@/components/ui/card";
import { 
  Coins, 
  BookOpen, 
  Church, 
  ArrowRight, 
  BarChart 
} from "lucide-react";
import { Link } from "react-router-dom";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-scroll text-scripture-dark mb-4">Bible.Fi</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Biblical wisdom for your financial journey. Stake, tithe, and grow wealth according to scripture.
          </p>
          
          <BibleCharacter 
            character="solomon" 
            message="Wisdom is more precious than rubies, and all the things you may desire cannot compare with her. - Proverbs 8:11"
            className="mt-8 max-w-2xl mx-auto text-left"
          />
        </section>
        
        <DailyScripture />
        
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
          <Card className="pixel-card p-6 flex flex-col items-center text-center">
            <Coins size={48} className="text-scripture mb-4" />
            <h2 className="text-2xl font-scroll mb-2">Biblical Staking</h2>
            <p className="mb-4">Grow your wealth little by little through our scripture-based staking pools.</p>
            <Link to="/staking" className="mt-auto">
              <PixelButton className="flex items-center">
                Stake Now <ArrowRight size={16} className="ml-2" />
              </PixelButton>
            </Link>
          </Card>
          
          <Card className="pixel-card p-6 flex flex-col items-center text-center">
            <Church size={48} className="text-scripture mb-4" />
            <h2 className="text-2xl font-scroll mb-2">Digital Tithing</h2>
            <p className="mb-4">Give your tithe to churches worldwide, even if they don't accept crypto.</p>
            <Link to="/tithe" className="mt-auto">
              <PixelButton className="flex items-center">
                Tithe Now <ArrowRight size={16} className="ml-2" />
              </PixelButton>
            </Link>
          </Card>
          
          <Card className="pixel-card p-6 flex flex-col items-center text-center">
            <BookOpen size={48} className="text-scripture mb-4" />
            <h2 className="text-2xl font-scroll mb-2">Scripture Wisdom</h2>
            <p className="mb-4">Learn what the Bible teaches about money, wealth, and stewardship.</p>
            <Link to="/wisdom" className="mt-auto">
              <PixelButton className="flex items-center">
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
                <PixelButton className="flex items-center mx-auto">
                  <BarChart size={16} className="mr-2" />
                  Track Taxes
                </PixelButton>
              </Link>
            </div>
          </div>
        </section>
        
        <FarcasterFrame />
      </main>
    </div>
  );
};

export default Index;
