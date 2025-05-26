
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Shield, Heart } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([
    {
      id: "tvl",
      label: "Total Value Locked",
      value: "$2.4M",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-900/20"
    },
    {
      id: "users",
      label: "Faithful Stewards",
      value: "1,247",
      change: "+24.3%",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20"
    },
    {
      id: "yield",
      label: "Average APY",
      value: "8.4%",
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20"
    },
    {
      id: "security",
      label: "Security Score",
      value: "99.8%",
      change: "Excellent",
      icon: Shield,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20"
    },
    {
      id: "donations",
      label: "Total Donated",
      value: "$487K",
      change: "+18.7%",
      icon: Heart,
      color: "text-red-400",
      bgColor: "bg-red-900/20"
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => {
          if (stat.id === "tvl") {
            const baseValue = 2400000;
            const randomChange = (Math.random() - 0.5) * 10000;
            const newValue = baseValue + randomChange;
            return {
              ...stat,
              value: `$${(newValue / 1000000).toFixed(1)}M`
            };
          }
          return stat;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-scroll text-ancient-gold mb-4">
          Platform Metrics
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Real-time statistics showing the growth and impact of our biblical DeFi platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          const isPositive = stat.change.startsWith('+');
          const isExcellent = stat.change === 'Excellent';
          
          return (
            <Card 
              key={stat.id}
              className={`${stat.bgColor} border border-ancient-gold/30 hover:border-ancient-gold/60 transition-all duration-300`}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${stat.bgColor} border border-current flex items-center justify-center ${stat.color}`}>
                  <IconComponent size={20} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60">{stat.label}</p>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      isExcellent 
                        ? 'border-green-500 text-green-400' 
                        : isPositive 
                          ? 'border-green-500 text-green-400' 
                          : 'border-red-500 text-red-400'
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-black/30 p-4 rounded-lg border border-ancient-gold/20">
        <div className="flex items-center justify-center text-center">
          <div className="space-y-2">
            <p className="text-ancient-gold font-medium">Biblical Principle</p>
            <blockquote className="italic text-white/80">
              "Whoever can be trusted with very little can also be trusted with much"
            </blockquote>
            <p className="text-ancient-gold/70 text-sm">— Luke 16:10</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
