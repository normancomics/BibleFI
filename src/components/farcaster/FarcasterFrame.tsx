
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { Share2, ExternalLink, Copy } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { getRandomVerse } from "@/data/bibleVerses";
import { generateFrameHTML } from "@/integrations/farcaster/client";

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
        <span className="text-sm font-medium">Farcaster Frame Preview</span>
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
          <h3 className="text-white font-medium text-lg">{title}</h3>
        </div>
      </div>
      <div className="p-2 space-y-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            className="w-full bg-scripture/20 hover:bg-scripture/30 text-white px-3 py-2 rounded-md text-sm transition-colors"
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
  const [previewHTML, setPreviewHTML] = useState<string>("");
  
  // Generate frame HTML for sharing
  const generateFrameHTMLForPreview = () => {
    const frameConfig = {
      image: `${window.location.origin}${frameImage}`,
      buttons: [
        { label: "Learn Biblical Finance", action: "link", target: window.location.origin },
        { label: "Share Wisdom", action: "post", target: `${window.location.origin}/wisdom` }
      ],
      postUrl: `${window.location.origin}/api/frame`,
      state: btoa(JSON.stringify({ referrer: "farcaster-frame" }))
    };
    
    return generateFrameHTML(frameConfig);
  };
  
  const handleGenerateFrame = () => {
    playSound("scroll");
    const html = generateFrameHTMLForPreview();
    setPreviewHTML(html);
    
    toast({
      title: "Frame HTML Generated",
      description: "Your Farcaster Frame HTML has been generated.",
    });
  };
  
  const handleCopyFrameHTML = () => {
    playSound("select");
    if (!previewHTML) {
      handleGenerateFrame();
    }
    
    navigator.clipboard.writeText(previewHTML || generateFrameHTMLForPreview())
      .then(() => {
        toast({
          title: "Frame HTML Copied",
          description: "Successfully copied to clipboard. Ready to deploy!",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  const handleShareToFarcaster = () => {
    playSound("coin");
    toast({
      title: "Coming Soon",
      description: "Direct sharing to Farcaster will be available soon.",
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
        <h2 className="text-2xl mb-4">Bible.fi on Farcaster</h2>
        
        <div className="mb-6">
          <FramePreview 
            imageUrl={frameImage}
            title="Biblical wisdom for your financial journey"
            buttons={[
              { label: "Learn Biblical Finance" },
              { label: "Share Wisdom" },
            ]}
          />
        </div>
        
        <div className="flex flex-col space-y-3">
          <div className="bg-black/20 p-3 rounded-md mb-3 border border-ancient-gold/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Deploy as Mini-App</h3>
              <PixelButton 
                size="sm"
                variant="outline"
                onClick={handleCopyFrameHTML}
                className="flex items-center"
              >
                <Copy size={14} className="mr-1" /> Copy HTML
              </PixelButton>
            </div>
            <p className="text-xs text-white/70">
              To deploy Bible.fi as a Farcaster mini-app, copy the generated HTML and host it on your domain.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 space-y-3">
            <PixelButton 
              className="w-full flex items-center justify-center"
              onClick={handleGenerateFrame}
            >
              Generate Frame HTML
            </PixelButton>
            
            <PixelButton 
              className="w-full flex items-center justify-center"
              variant="outline"
              onClick={handleOpenFrame}
            >
              <ExternalLink size={16} className="mr-2" /> Preview Frame
            </PixelButton>
          </div>
        </div>

        <div className="mt-6 text-sm text-center text-white/60">
          <p>Learn, implement & share Biblical financial wisdom directly to your network on Farcaster.</p>
          <p className="mt-2 text-xs">Built & deployed on Base chain.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarcasterFrame;
