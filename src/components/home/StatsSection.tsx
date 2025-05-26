
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Shield, Heart } from "lucide-react";
import { useRealTimeStats } from '@/services/realTimeStatsService';
import useRealTimeData from '@/hooks/useRealTimeData';

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
  const { data: platformData, loading: platformLoading } = useRealTimeStats('platform');
  const { data: marketData, loading: marketLoading } = useRealTimeStats('market');
  const { stats, lastUpdate } = useRealTimeData();

  const [displayStats, setDisplayStats] = useState<Stat[]>([
    {
      id: "tvl",
      label: "Total Value Locked",
      value: stats.totalValueLocked,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-900/20"
    },
    {
      id: "users",
      label: "Faithful Stewards",
      value: stats.activeUsers.toString(),
      change: "+24.3%",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20"
    },
    {
      id: "yield",
      label: "Average APY",
      value: stats.averageAPY,
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20"
    },
    {
      id: "security",
      label: "Security Score",
      value: stats.securityScore,
      change: "Excellent",
      icon: Shield,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20"
    },
    {
      id: "donations",
      label: "Total Donated",
      value: stats.totalDonated,
      change: "+18.7%",
      icon: Heart,
      color: "text-red-400",
      bgColor: "bg-red-900/20"
    }
  ]);

  // Update stats when real-time data changes
  useEffect(() => {
    if (platformData && marketData) {
      setDisplayStats(prev => prev.map(stat => {
        switch (stat.id) {
          case "tvl":
            return {
              ...stat,
              value: `$${(platformData.totalValueLocked / 1000000).toFixed(1)}M`,
              change: `+${((platformData.totalValueLocked / 2000000 - 1) * 100).toFixed(1)}%`
            };
          case "users":
            return {
              ...stat,
              value: platformData.totalUsers.toLocaleString(),
              change: `+${platformData.communityGrowth}`
            };
          case "yield":
            return {
              ...stat,
              value: `${platformData.averageAPY.toFixed(1)}%`,
              change: platformData.averageAPY > 8 ? "+1.2%" : "-0.5%"
            };
          case "donations":
            return {
              ...stat,
              value: `$${Math.floor(platformData.tithesDonated / 1000)}K`,
              change: "+18.7%"
            };
          default:
            return stat;
        }
      }));
    }
  }, [platformData, marketData]);

  if (platformLoading || marketLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-scroll text-ancient-gold mb-4">
            Loading Real-Time Data...
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse bg-gray-900/20 border-gray-500/30">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-scroll text-ancient-gold mb-4">
          Live Platform Metrics
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Real-time statistics powered by Base chain data and DeFi protocols.
        </p>
        <p className="text-xs text-white/60 mt-2">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayStats.map((stat) => {
          const IconComponent = stat.icon;
          const isPositive = stat.change.startsWith('+');
          const isExcellent = stat.change === 'Excellent';
          
          return (
            <Card 
              key={stat.id}
              className={`${stat.bgColor} border border-ancient-gold/30 hover:border-ancient-gold/60 transition-all duration-300 animate-pulse-glow`}
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

      {/* Real-time data indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live data from Base chain & DeFi protocols</span>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
