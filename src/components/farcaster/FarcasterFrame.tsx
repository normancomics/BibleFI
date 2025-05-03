
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { Share2, ExternalLink } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { getRandomVerse } from "@/data/bibleVerses";

// Frame configuration type for rendering frame previews
interface FramePreviewProps {
  imageUrl: string;
  title: string;
  buttons?: Array<{
    label: string;
    action?: string;
  }>;
}

const FramePreview: React.FC<FramePreviewProps> = ({ imageUrl, title, buttons = [] }) => {
  return (
    <div className="border-2 border-ancient-gold bg-black/20 rounded-lg overflow-hidden max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-scripture/20 to-scripture/40 px-3 py-2 flex items-center">
        <div className="w-3 h-3 bg-pixel-purple rounded-full mr-2"></div>
        <span className="text-sm font-pixel">Farcaster Frame Preview</span>
      </div>
      <div className="relative aspect-[1.91/1] bg-black/40">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/50">Image Preview</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-scroll text-lg">{title}</h3>
        </div>
      </div>
      <div className="p-2 space-y-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            className="w-full bg-scripture/20 hover:bg-scripture/30 text-white px-3 py-2 rounded-md text-sm font-pixel transition-colors"
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const FarcasterFrame: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [frameImage, setFrameImage] = useState("/pixel-solomon.png"); // Default image
  const verse = getRandomVerse();
  
  const handleShareToFarcaster = () => {
    playSound("coin");
    toast({
      title: "Farcaster Integration",
      description: "This would share to Farcaster. Integration in progress.",
    });
  };
  
  const handleOpenFrame = () => {
    playSound("select");
    // In a fully integrated app, this would open the actual frame URL
    toast({
      title: "Frame URL",
      description: "Frame URL would open in Farcaster app. Coming soon!",
    });
  };

  return (
    <Card className="pixel-card my-6">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-scroll mb-4">Bible.fi on Farcaster</h2>
        
        <div className="mb-6">
          <FramePreview 
            imageUrl={frameImage}
            title="Biblical wisdom for your financial journey"
            buttons={[
              { label: "Share Wisdom" },
              { label: "Learn More" },
            ]}
          />
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <PixelButton 
            className="w-full flex items-center justify-center"
            onClick={handleShareToFarcaster}
          >
            <Share2 size={16} className="mr-2" /> Share to Farcaster
          </PixelButton>
          
          <PixelButton 
            className="w-full flex items-center justify-center"
            variant="outline"
            onClick={handleOpenFrame}
          >
            <ExternalLink size={16} className="mr-2" /> Open Frame
          </PixelButton>
        </div>

        <div className="mt-6 text-sm text-center text-white/60">
          <p>Create and share biblical financial wisdom directly to Farcaster</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarcasterFrame;
