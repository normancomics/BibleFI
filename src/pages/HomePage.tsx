
import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import BiblefiHero from "@/components/home/BiblefiHero";
import FeatureCards from "@/components/home/FeatureCards";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import TaxSection from "@/components/home/TaxSection";
import BiblicalCharacterGrid from "@/components/home/BiblicalCharacterGrid";
import FeatureShowcaseCards from "@/components/home/FeatureShowcaseCards";
import StatsSection from "@/components/home/StatsSection";
import IntroAnimation from "@/components/home/IntroAnimation";
import SoundActivationButton from "@/components/home/SoundActivationButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

const HomePage: React.FC = () => {
  const { playSound } = useSound();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('bible-fi-intro-seen');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem('bible-fi-intro-seen', 'true');
    setShowIntro(false);
    playSound("success");
  };

  const handleGetStarted = () => {
    playSound("powerup");
    window.location.href = "/defi";
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      
      <main className="relative">
        {/* Hero Section */}
        <section>
          <BiblefiHero />
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <StatsSection />
          </div>
        </section>

        <Separator className="bg-ancient-gold/20" />

        {/* Biblical Characters Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <BiblicalCharacterGrid />
          </div>
        </section>

        <Separator className="bg-ancient-gold/20" />

        {/* Features Showcase */}
        <section id="features" className="py-16 px-4">
          <div className="container mx-auto">
            <FeatureShowcaseCards />
          </div>
        </section>

        <Separator className="bg-ancient-gold/20" />

        {/* Legacy Feature Cards */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <FeatureCards />
          </div>
        </section>

        <Separator className="bg-ancient-gold/20" />

        {/* Feature Showcase */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <FeatureShowcase />
          </div>
        </section>

        <Separator className="bg-ancient-gold/20" />

        {/* Tax Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <TaxSection />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <Card className="max-w-2xl mx-auto border-ancient-gold/30 bg-gradient-to-br from-ancient-gold/10 to-black/40">
              <CardContent className="p-8">
                <h2 className="text-3xl font-scroll text-ancient-gold mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-white/80 mb-6">
                  Join thousands of believers who are already using biblical principles 
                  to guide their DeFi investments. Start with wisdom, multiply with faith.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-bold"
                  >
                    Launch Bible.fi
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-ancient-gold text-ancient-gold hover:bg-ancient-gold hover:text-black"
                    onClick={() => {
                      playSound("select");
                      window.open("https://docs.bible.fi", "_blank");
                    }}
                  >
                    Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-ancient-gold/20">
          <div className="container mx-auto text-center">
            {/* Developer's Note */}
            <div className="mb-6 p-4 bg-scripture/10 border border-ancient-gold/20 rounded-lg max-w-3xl mx-auto">
              <h3 className="text-lg font-scroll text-ancient-gold mb-2 flex items-center justify-center gap-2">
                <BookOpen className="h-5 w-5" />
                Developer's Note
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                This dapp is based entirely on scriptural wisdom found within the <strong className="text-ancient-gold">ONLY book on planet earth which is truly alive</strong>, The Holy Bible. 
                Every principle, strategy, and feature has been carefully crafted to honor God and align with biblical teachings on stewardship and financial wisdom.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-ancient-gold/50 text-ancient-gold hover:bg-ancient-gold hover:text-black"
                onClick={() => {
                  playSound("select");
                  window.open("https://www.bible.com/app", "_blank");
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Read the Holy Bible
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>

            <p className="text-white/60 text-sm">
              Built with faith on Base Chain • Powered by Biblical Wisdom
            </p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <img src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" alt="Bible.fi" className="h-8" />
              <span className="text-white/40">•</span>
              <span className="text-base-blue text-sm font-medium">Base Chain</span>
              <span className="text-white/40">•</span>
              <span className="text-purple-400 text-sm font-medium">Farcaster</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
