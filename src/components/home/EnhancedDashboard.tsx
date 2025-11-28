import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  Heart,
  BookOpen,
  Coins,
  Lock,
  Wheat,
  Calculator,
  Sparkles,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  badge?: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  link,
  badge,
  gradient,
}) => {
  return (
    <Link to={link} className="block group">
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border hover:border-ancient-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-ancient-gold/10 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${gradient} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {badge && (
              <Badge className="bg-scripture text-white text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-ancient-gold transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center text-ancient-gold text-sm font-medium">
            Explore <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export const EnhancedDashboard: React.FC = () => {
  const features = [
    {
      title: 'DeFi Swaps',
      description: 'Swap tokens with biblical wisdom guidance and best price aggregation across Base DEXs',
      icon: TrendingUp,
      link: '/defi',
      gradient: 'bg-gradient-to-br from-eboy-green to-emerald-600',
    },
    {
      title: 'Yield Staking',
      description: 'Earn rewards through biblical stewardship principles with transparent APYs',
      icon: Coins,
      link: '/staking',
      gradient: 'bg-gradient-to-br from-ancient-gold to-yellow-600',
    },
    {
      title: 'Yield Farming',
      description: 'Cultivate your crypto harvest with liquidity pools and farming strategies',
      icon: Wheat,
      link: '/farming',
      gradient: 'bg-gradient-to-br from-scripture to-purple-600',
    },
    {
      title: 'ZK Private Tithing',
      description: 'Anonymous giving with zero-knowledge proofs - give in secret, blessed in public',
      icon: Lock,
      link: '/zk-monitor',
      badge: 'NEW',
      gradient: 'bg-gradient-to-br from-eboy-pink to-pink-600',
    },
    {
      title: 'Digital Tithing',
      description: 'Support churches globally with crypto, fiat, or streaming donations via Superfluid',
      icon: Heart,
      link: '/tithe',
      gradient: 'bg-gradient-to-br from-eboy-red to-red-600',
    },
    {
      title: 'Biblical Wisdom',
      description: 'AI-powered financial guidance rooted in timeless biblical principles',
      icon: BookOpen,
      link: '/wisdom',
      badge: 'AI',
      gradient: 'bg-gradient-to-br from-eboy-blue to-blue-600',
    },
    {
      title: 'Tax Compliance',
      description: 'Render unto Caesar - automated tax reporting and compliance tools',
      icon: Calculator,
      link: '/taxes',
      gradient: 'bg-gradient-to-br from-eboy-orange to-orange-600',
    },
    {
      title: 'Security Dashboard',
      description: 'Military-grade security monitoring with quantum-resistant encryption',
      icon: Shield,
      link: '/security',
      gradient: 'bg-gradient-to-br from-eboy-purple to-violet-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-scripture/20 to-purple-900/20 border-scripture/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-scripture" />
              <Badge variant="secondary" className="bg-scripture/20 text-scripture">
                Live
              </Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">$0.00</div>
            <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
            <div className="text-xs text-eboy-green mt-1">Connect wallet to view</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-ancient-gold/20 to-yellow-900/20 border-ancient-gold/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-5 w-5 text-ancient-gold" />
              <Badge variant="secondary" className="bg-ancient-gold/20 text-ancient-gold">
                Wisdom
              </Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">0</div>
            <div className="text-sm text-muted-foreground">Wisdom Score</div>
            <div className="text-xs text-eboy-green mt-1">Complete activities to earn</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-eboy-green/20 to-emerald-900/20 border-eboy-green/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-5 w-5 text-eboy-green" />
              <Badge variant="secondary" className="bg-eboy-green/20 text-eboy-green">
                Impact
              </Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">$0.00</div>
            <div className="text-sm text-muted-foreground">Total Tithed</div>
            <div className="text-xs text-eboy-green mt-1">Start giving today</div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Explore Features</h2>
          <Badge className="bg-scripture text-white">
            8 Features Available
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-background to-scripture/10 border-ancient-gold/30">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/defi">
              <Button className="bg-eboy-green hover:bg-eboy-green/90 text-black">
                <TrendingUp className="mr-2 h-4 w-4" />
                Swap Tokens
              </Button>
            </Link>
            <Link to="/staking">
              <Button className="bg-ancient-gold hover:bg-ancient-gold/90 text-black">
                <Coins className="mr-2 h-4 w-4" />
                Stake & Earn
              </Button>
            </Link>
            <Link to="/tithe">
              <Button className="bg-eboy-red hover:bg-eboy-red/90 text-white">
                <Heart className="mr-2 h-4 w-4" />
                Give to Church
              </Button>
            </Link>
            <Link to="/zk-monitor">
              <Button className="bg-eboy-pink hover:bg-eboy-pink/90 text-white">
                <Lock className="mr-2 h-4 w-4" />
                ZK Privacy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
