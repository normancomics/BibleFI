
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { 
  Coins, 
  Heart, 
  Shield, 
  BookOpen, 
  TrendingUp, 
  Users,
  Banknote,
  Calculator
} from "lucide-react";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  badge?: string;
  route: string;
  comingSoon?: boolean;
}

const features: FeatureCard[] = [
  {
    id: "defi",
    title: "Biblical DeFi",
    description: "Swap, stake, and provide liquidity while following biblical principles of fair exchange",
    icon: Coins,
    color: "text-green-400",
    bgColor: "bg-green-900/20",
    badge: "Live",
    route: "/defi"
  },
  {
    id: "tithing",
    title: "Digital Tithing",
    description: "Support your church and ministries with crypto payments and streaming donations",
    icon: Heart,
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    badge: "Live",
    route: "/tithe"
  },
  {
    id: "staking",
    title: "Faithful Staking",
    description: "Multiply your talents through secure staking pools with biblical risk management",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    badge: "Live",
    route: "/staking"
  },
  {
    id: "wisdom",
    title: "Biblical Wisdom",
    description: "Learn financial principles from Scripture and get AI-powered guidance",
    icon: BookOpen,
    color: "text-purple-400",
    bgColor: "bg-purple-900/20",
    badge: "Live",
    route: "/wisdom"
  },
  {
    id: "security",
    title: "Fortress Security",
    description: "Military-grade protection for your digital assets with multi-layer security",
    icon: Shield,
    color: "text-orange-400",
    bgColor: "bg-orange-900/20",
    badge: "Live",
    route: "/security"
  },
  {
    id: "taxes",
    title: "Render unto Caesar",
    description: "Comprehensive tax reporting and compliance tools for crypto activities",
    icon: Calculator,
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    badge: "Beta",
    route: "/taxes"
  },
  {
    id: "lending",
    title: "Ethical Lending",
    description: "Lend and borrow assets with fair interest rates based on biblical principles",
    icon: Banknote,
    color: "text-cyan-400",
    bgColor: "bg-cyan-900/20",
    badge: "Coming Soon",
    route: "/defi",
    comingSoon: true
  },
  {
    id: "community",
    title: "Fellowship Hub",
    description: "Connect with other believers, share wisdom, and build together",
    icon: Users,
    color: "text-pink-400",
    bgColor: "bg-pink-900/20",
    badge: "Coming Soon",
    route: "/community",
    comingSoon: true
  }
];

const FeatureShowcaseCards: React.FC = () => {
  const { playSound } = useSound();

  const handleFeatureClick = (feature: FeatureCard) => {
    if (feature.comingSoon) {
      playSound("error");
      return;
    }
    
    playSound("powerup");
    window.location.href = feature.route;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-scroll text-ancient-gold mb-4">
          Platform Features
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Explore our comprehensive suite of biblical DeFi tools designed to help you be a faithful steward 
          of your digital assets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card 
              key={feature.id}
              className={`${feature.bgColor} border border-ancient-gold/30 hover:border-ancient-gold/60 transition-all duration-300 ${!feature.comingSoon ? 'cursor-pointer transform hover:scale-105' : 'opacity-75'}`}
              onClick={() => handleFeatureClick(feature)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} border border-current flex items-center justify-center ${feature.color}`}>
                    <IconComponent size={20} />
                  </div>
                  {feature.badge && (
                    <Badge 
                      variant={feature.comingSoon ? "secondary" : feature.badge === "Beta" ? "outline" : "default"}
                      className={`text-xs ${
                        feature.comingSoon 
                          ? "bg-gray-700 text-gray-300" 
                          : feature.badge === "Beta" 
                            ? "border-yellow-500 text-yellow-400" 
                            : "bg-green-700 text-green-300"
                      }`}
                    >
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 mb-4">{feature.description}</p>
                <PixelButton
                  size="sm"
                  className="w-full"
                  disabled={feature.comingSoon}
                  farcasterStyle={!feature.comingSoon}
                >
                  {feature.comingSoon ? "Coming Soon" : "Explore"}
                </PixelButton>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureShowcaseCards;
