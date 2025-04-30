
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { Share2 } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

const CommunityDiscussion: React.FC = () => {
  const { playSound } = useSound();

  return (
    <Card className="pixel-card mt-8">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-scroll">Community Discussion</h2>
          <PixelButton size="sm" onClick={() => playSound("select")}>
            <Share2 size={16} className="mr-2" /> Share on Farcaster
          </PixelButton>
        </div>
        <p className="mb-4">Discuss biblical financial principles with others and form investment study groups.</p>
        <div className="bg-black/10 p-4 rounded-md">
          <p className="font-pixel text-center">Connect your Farcaster account to join the discussion!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityDiscussion;
