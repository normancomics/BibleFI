
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import PixelButton from '@/components/PixelButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSound } from '@/contexts/SoundContext';
import { ArrowRight, BookOpen, Coins, Church, Receipt, Sprout, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRandomVerse } from '@/data/bibleVerses';

const HomePage: React.FC = () => {
  const { playSound } = useSound();
  const [currentVerse, setCurrentVerse] = useState(getRandomVerse());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse(getRandomVerse());
    }, 10000); // Change verse every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path: string) => {
    playSound('select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/20 to-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
              alt="Bible.fi Logo" 
              className="h-24 mx-auto mb-6 animate-pulse"
            />
            <h1 className="text-6xl font-scroll text-ancient-gold mb-4 animate-fadeIn">
              BIBLE.FI
            </h1>
            <p className="text-2xl text-white/90 mb-2">
              Biblical Wisdom for Your Financial Journey
            </p>
            <p className="text-lg text-ancient-gold/80 mb-8">
              The World's First Biblical DeFi Platform on Base Chain
            </p>
          </div>

          {/* Current Verse Display */}
          <Card className="max-w-2xl mx-auto mb-12 bg-scripture/20 border-ancient-gold/30">
            <CardContent className="pt-6">
              <blockquote className="italic text-white/90 text-lg mb-2">
                "{currentVerse.text}"
              </blockquote>
              <cite className="text-ancient-gold font-medium">
                {currentVerse.reference}
              </cite>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/wisdom" onClick={() => handleNavigate('/wisdom')}>
              <PixelButton className="flex items-center gap-2 bg-gradient-to-r from-ancient-gold to-ancient-gold/80 text-black font-bold">
                <BookOpen size={20} />
                Discover Biblical Wisdom
              </PixelButton>
            </Link>
            <Link to="/defi" onClick={() => handleNavigate('/defi')}>
              <PixelButton className="flex items-center gap-2" variant="outline">
                <Coins size={20} />
                Start DeFi Journey
              </PixelButton>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-black/40 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <BookOpen size={24} />
                  Biblical Wisdom
                </CardTitle>
                <CardDescription>
                  Learn financial principles from Scripture with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/wisdom">
                  <PixelButton className="w-full" variant="outline">
                    Explore Wisdom <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Sprout size={24} />
                  Biblical Farming
                </CardTitle>
                <CardDescription>
                  Yield farming strategies based on biblical stewardship principles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/farming">
                  <PixelButton className="w-full" variant="outline">
                    Start Farming <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Church size={24} />
                  Digital Tithing
                </CardTitle>
                <CardDescription>
                  Support ministries worldwide with crypto and fiat payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/tithe">
                  <PixelButton className="w-full" variant="outline">
                    Give Today <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Coins size={24} />
                  DeFi Trading
                </CardTitle>
                <CardDescription>
                  Swap tokens with biblical wisdom and risk management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/defi">
                  <PixelButton className="w-full" variant="outline">
                    Trade Wisely <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Receipt size={24} />
                  Tax Management
                </CardTitle>
                <CardDescription>
                  "Render unto Caesar" - Manage crypto taxes biblically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/taxes">
                  <PixelButton className="w-full" variant="outline">
                    Manage Taxes <ArrowRight size={16} className="ml-2" />
                  </PixelButton>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-ancient-gold/30 hover:border-ancient-gold/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Shield size={24} />
                  Security First
                </CardTitle>
                <CardDescription>
                  Military-grade encryption protecting your spiritual and financial journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PixelButton className="w-full" variant="outline" disabled>
                  <Shield size={16} className="mr-2" />
                  Protected
                </PixelButton>
              </CardContent>
            </Card>
          </div>

          {/* Platform Features */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-scroll text-ancient-gold mb-8">
              Built for the Future of Biblical Finance
            </h2>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png" alt="Base Chain" className="h-8" />
                <span className="text-white/80">Built on Base</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-purple-400" />
                <span className="text-white/80">Farcaster Mini-App</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-green-400" />
                <span className="text-white/80">Military-Grade Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
