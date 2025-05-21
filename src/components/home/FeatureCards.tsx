
import React from "react";
import { Link } from "react-router-dom";
import { Church, Coins, BookOpen, ArrowRight, Repeat, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";

const FeatureCards: React.FC = () => {
  const { playSound } = useSound();

  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
      <Card className="pixel-card p-6 flex flex-col items-center text-center bg-purple-900/70 border border-ancient-gold/50">
        <Church size={48} className="text-ancient-gold mb-4" />
        <h2 className="text-2xl font-scroll mb-2 text-ancient-gold">Digital Tithing</h2>
        <p className="mb-4 text-white/90">Give your tithe to churches worldwide with Daimo direct payments.</p>
        <Link to="/tithe" className="mt-auto">
          <PixelButton className="flex items-center" onClick={() => playSound("scroll")} farcasterStyle>
            Tithe Now <ArrowRight size={16} className="ml-2" />
          </PixelButton>
        </Link>
      </Card>
      
      <Card className="pixel-card p-6 flex flex-col items-center text-center bg-purple-900/70 border border-ancient-gold/50">
        <Coins size={48} className="text-ancient-gold mb-4" />
        <h2 className="text-2xl font-scroll mb-2 text-ancient-gold">BIBLICAL Staking</h2>
        <p className="mb-4 text-white/90">Grow your wealth with Superfluid-powered scripture-based staking pools.</p>
        <Link to="/staking" className="mt-auto">
          <PixelButton className="flex items-center" onClick={() => playSound("coin")} farcasterStyle>
            Stake Now <ArrowRight size={16} className="ml-2" />
          </PixelButton>
        </Link>
      </Card>
      
      <Card className="pixel-card p-6 flex flex-col items-center text-center bg-purple-900/70 border border-ancient-gold/50">
        <Repeat size={48} className="text-ancient-gold mb-4" />
        <h2 className="text-2xl font-scroll mb-2 text-ancient-gold">BIBLICAL Swaps</h2>
        <p className="mb-4 text-white/90">Swap tokens wisely with Odos for the best rates and lowest fees.</p>
        <Link to="/defi" className="mt-auto">
          <PixelButton className="flex items-center" onClick={() => playSound("select")} farcasterStyle>
            Swap Now <ArrowRight size={16} className="ml-2" />
          </PixelButton>
        </Link>
      </Card>
    </section>
  );
};

export default FeatureCards;
