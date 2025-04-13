
import React from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowUpRight } from "lucide-react";
import PixelButton from "./PixelButton";
import ScriptureCard from "./ScriptureCard";
import { BibleVerse } from "@/data/bibleVerses";

interface StakingPoolProps {
  title: string;
  apy: number;
  description: string;
  verse: BibleVerse;
  lockPeriod: string;
}

const StakingPool: React.FC<StakingPoolProps> = ({
  title,
  apy,
  description,
  verse,
  lockPeriod
}) => {
  return (
    <Card className="pixel-card overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-scroll">{title}</h3>
        <div className="bg-scripture-light text-scripture-dark px-3 py-1 rounded-md font-bold">
          {apy}% APY
        </div>
      </div>
      
      <p className="mb-4">{description}</p>
      
      <div className="flex items-center mb-4 text-sm text-muted-foreground">
        <BookOpen size={16} className="mr-1" />
        <span>Lock Period: {lockPeriod}</span>
      </div>
      
      <ScriptureCard verse={verse} className="mb-4" />
      
      <div className="flex space-x-2">
        <PixelButton className="flex-1">
          Stake
        </PixelButton>
        <PixelButton variant="outline" className="flex items-center">
          Learn <ArrowUpRight size={16} className="ml-1" />
        </PixelButton>
      </div>
    </Card>
  );
};

export default StakingPool;
