
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CircularProgressBar } from "@/components/ui/chart";
import { LightningBolt, BookOpen, Coins, Church, Clock3 } from "lucide-react";

interface TithingStatsProps {
  monthlyTotal?: string;
  yearlyTotal?: string;
  tithePercentage?: number;
  mostSupportedChurch?: string;
  churchCount?: number;
  longestStreak?: number;
  goal?: number;
  goalCompleted?: number;
}

const TithingStats: React.FC<TithingStatsProps> = ({
  monthlyTotal = "0",
  yearlyTotal = "0",
  tithePercentage = 10,
  mostSupportedChurch = "Not set",
  churchCount = 0,
  longestStreak = 0,
  goal = 100,
  goalCompleted = 0
}) => {
  const progressPercentage = Math.min(100, (goalCompleted / goal) * 100);
  
  return (
    <Card className="border-2 border-scripture/30 bg-black/20">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
        <CardTitle className="font-scroll text-ancient-gold">Tithing Statistics</CardTitle>
        <CardDescription className="text-white/70">
          Track your giving and set financial goals
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-32 h-32 relative">
            <CircularProgressBar 
              value={progressPercentage} 
              strokeWidth={10}
              strokeColor="url(#titheGradient)"
              className="transform -rotate-90"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-ancient-gold">{progressPercentage.toFixed(0)}%</span>
              <span className="text-xs text-white/70">of goal</span>
            </div>
            
            <svg width="0" height="0">
              <defs>
                <linearGradient id="titheGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9f7aea" />
                  <stop offset="100%" stopColor="#b393d3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/40 rounded-md p-3">
            <p className="text-xs text-white/60 mb-1">Monthly Giving</p>
            <p className="text-lg font-bold text-scripture flex items-center">
              <Coins size={18} className="mr-1 text-ancient-gold" />
              ${monthlyTotal}
            </p>
          </div>
          
          <div className="bg-black/40 rounded-md p-3">
            <p className="text-xs text-white/60 mb-1">Yearly Giving</p>
            <p className="text-lg font-bold text-scripture flex items-center">
              <Coins size={18} className="mr-1 text-ancient-gold" />
              ${yearlyTotal}
            </p>
          </div>
        </div>
        
        <Separator className="my-4 bg-ancient-gold/20" />
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Church size={16} className="text-ancient-gold mr-2" />
              <span className="text-sm">Most Supported</span>
            </div>
            <span className="text-sm font-medium text-scripture">{mostSupportedChurch}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BookOpen size={16} className="text-ancient-gold mr-2" />
              <span className="text-sm">Tithe Percentage</span>
            </div>
            <span className="text-sm font-medium text-scripture">{tithePercentage}%</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Church size={16} className="text-ancient-gold mr-2" />
              <span className="text-sm">Churches Supported</span>
            </div>
            <span className="text-sm font-medium text-scripture">{churchCount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock3 size={16} className="text-ancient-gold mr-2" />
              <span className="text-sm">Giving Streak</span>
            </div>
            <span className="text-sm font-medium text-scripture">{longestStreak} days</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <LightningBolt size={16} className="text-ancient-gold mr-2" />
              <span className="text-sm">Biblical Score</span>
            </div>
            <span className="text-sm font-medium text-scripture">14/20</span>
          </div>
        </div>
        
        <div className="mt-6 bg-scripture/10 p-3 rounded-md">
          <p className="text-xs text-center text-white/70 italic">
            "Honor the LORD with your wealth, with the firstfruits of all your crops; 
            then your barns will be filled to overflowing, and your vats will brim over with new wine." 
            <span className="block mt-1 text-ancient-gold/70">- Proverbs 3:9-10</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TithingStats;
