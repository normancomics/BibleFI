
import React from "react";
import { Card } from "@/components/ui/card";
import PixelButton from "./PixelButton";
import { getRandomVerse } from "@/data/bibleVerses";
import { Share2 } from "lucide-react";

const FarcasterFrame: React.FC = () => {
  const verse = getRandomVerse();
  
  return (
    <Card className="pixel-card p-4 my-4">
      <h3 className="text-xl font-scroll mb-2">Share Bible Wisdom</h3>
      <p className="mb-2">Share this financial wisdom from scripture to your Farcaster feed:</p>
      
      <div className="bg-ancient-scroll border border-ancient-gold p-3 rounded mb-4">
        <p className="font-bold">{verse.reference}</p>
        <p className="italic">"{verse.text}"</p>
      </div>
      
      <PixelButton className="w-full flex items-center justify-center">
        <Share2 size={16} className="mr-2" />
        Share to Farcaster
      </PixelButton>
    </Card>
  );
};

export default FarcasterFrame;
