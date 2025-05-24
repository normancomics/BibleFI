
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon, BarChart4, Sprout, BookOpen, Check, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BibleVerse } from '@/data/bibleVerses';
import { useToast } from "@/hooks/use-toast";

interface BiblicalFarmingStrategyProps {
  name: string;
  apy: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  asset1: {
    symbol: string;
    logoUrl?: string;
  };
  asset2: {
    symbol: string;
    logoUrl?: string;
  };
  platform: string;
  platformUrl?: string;
  biblicalPrinciple: {
    verse: string;
    reference: string;
    principle: string;
  };
  requirements?: string[];
}

const BiblicalFarmingStrategy: React.FC<BiblicalFarmingStrategyProps> = ({
  name,
  apy,
  riskLevel,
  description,
  asset1,
  asset2,
  platform,
  platformUrl,
  biblicalPrinciple,
  requirements = []
}) => {
  const { toast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const handleFarm = () => {
    toast({
      title: "Preparing Strategy",
      description: "Connecting to farming platform...",
    });
    
    if (platformUrl) {
      setTimeout(() => {
        window.open(platformUrl, '_blank');
      }, 1000);
    } else {
      toast({
        title: "Platform Unavailable",
        description: "The farming platform is currently unavailable.",
        variant: "destructive",
      });
    }
  };
  
  const getRiskBadgeColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    }
  };

  return (
    <Card className="relative overflow-hidden border border-ancient-gold/20 hover:border-ancient-gold/40 transition-all duration-300">
      <CardHeader className="bg-scripture/10 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-scroll text-xl">{name}</CardTitle>
            <CardDescription className="text-sm mt-1">{platform}</CardDescription>
          </div>
          <Badge className={`${getRiskBadgeColor()} border capitalize`}>
            {riskLevel} risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-ancient-gold/30">
                <span className="text-xs font-mono">{asset1.symbol}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-ancient-gold/30">
                <span className="text-xs font-mono">{asset2.symbol}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {asset1.symbol}/{asset2.symbol} Pool
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-ancient-gold">{apy}</div>
            <div className="text-xs text-muted-foreground">Annual Yield</div>
          </div>
        </div>
        
        <p className="text-sm mb-4">{description}</p>
        
        <div className="bg-black/20 rounded-lg p-3 mb-3 border border-ancient-gold/20">
          <div className="flex items-center gap-2 text-ancient-gold mb-1">
            <BookOpen size={14} />
            <span className="font-medium text-sm">Biblical Principle</span>
          </div>
          <p className="text-sm italic mb-1 text-white/80">"{biblicalPrinciple.verse}"</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-ancient-gold/70">{biblicalPrinciple.reference}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <InfoIcon size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="max-w-xs text-xs">{biblicalPrinciple.principle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {isDetailsOpen && (
          <div className="mt-4 space-y-3">
            {requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <BarChart4 size={14} /> Requirements
                </h4>
                <ul className="space-y-1">
                  {requirements.map((req, index) => (
                    <li key={index} className="text-xs flex items-start gap-1">
                      <Check size={12} className="mt-1 flex-shrink-0 text-green-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 border-t border-border pt-4">
        <Button 
          onClick={handleFarm} 
          className="w-full bg-gradient-to-r from-ancient-gold/80 to-ancient-gold/70 hover:from-ancient-gold hover:to-ancient-gold/90 text-black flex items-center gap-2"
        >
          <Sprout size={16} />
          <span>Farm with Biblical Wisdom</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-scripture w-full"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          {isDetailsOpen ? "Hide Details" : "Show Details"}
        </Button>
      </CardFooter>
      
      <div className="absolute top-0 right-0 p-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => window.open(platformUrl, '_blank')}
        >
          <ExternalLink size={14} />
        </Button>
      </div>
    </Card>
  );
};

export default BiblicalFarmingStrategy;
