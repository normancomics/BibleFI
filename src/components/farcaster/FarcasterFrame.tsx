
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { Share2, ExternalLink, Copy, GalleryVerticalEnd, Stamp, BookOpen } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { getRandomVerse } from "@/data/bibleVerses";
import { generateFrameHTML, farcasterClient } from "@/integrations/farcaster/client";

// Frame configuration type for rendering frame previews
interface FramePreviewProps {
  imageUrl?: string;
  title: string;
  verse?: {
    text: string;
    reference: string;
  };
  buttons?: Array<{
    label: string;
    action?: string;
  }>;
}

const FramePreview: React.FC<FramePreviewProps> = ({ imageUrl, title, verse, buttons = [] }) => {
  return (
    <div className="border-2 border-ancient-gold bg-black/20 rounded-lg overflow-hidden max-w-sm mx-auto transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]">
      <div className="bg-gradient-to-r from-scripture/20 to-scripture/40 px-3 py-2 flex items-center">
        <div className="w-3 h-3 bg-pixel-purple rounded-full mr-2"></div>
        <span className="text-sm font-medium">Farcaster Frame Preview</span>
      </div>
      <div className="relative aspect-[1.91/1] bg-black/40">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-ancient-gold">BIBLEFI</div>
          <div className="text-sm text-white/80 mt-2">Biblical Wisdom for Financial Stewardship</div>
          {verse && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="italic text-sm text-center text-white/90">"{verse.text}"</div>
              <div className="text-xs text-center text-ancient-gold mt-1">{verse.reference}</div>
            </div>
          )}
        </div>
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
  const [randomVerse, setRandomVerse] = useState(getRandomVerse());
  const [frameType, setFrameType] = useState<'default' | 'verse' | 'wisdom'>('default');
  const [previewHTML, setPreviewHTML] = useState<string>("");
  
  // Generate frame HTML for sharing
  const generateFrameHTMLForPreview = () => {
    switch(frameType) {
      case 'verse':
        return farcasterClient.generateVerseFrame(randomVerse.text, randomVerse.reference);
      case 'wisdom':
        return farcasterClient.generateWisdomScoreFrame(75, ['generosity', 'planning'], randomVerse.text);
      case 'default':
      default:
        return farcasterClient.generateDefaultFrame();
    }
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
        playSound("success");
        toast({
          title: "Frame HTML Copied",
          description: "Successfully copied to clipboard. Ready to deploy!",
        });
      })
      .catch(() => {
        playSound("error");
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  const handleOpenFrame = () => {
    playSound("select");
    // Open the frame HTML in a new tab
    const frameHtml = generateFrameHTMLForPreview();
    const blob = new Blob([frameHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };
  
  const handleNewVerse = () => {
    playSound("select");
    setRandomVerse(getRandomVerse());
  };

  return (
    <Card className="pixel-card my-6 border-2 border-ancient-gold bg-gradient-to-b from-black/80 to-black/60">
      <CardContent className="pt-6">
        <h2 className="text-2xl mb-4 text-center font-bold text-ancient-gold">BIBLEFI on Farcaster</h2>
        
        <div className="bg-black/40 p-3 rounded-lg border border-ancient-gold/30 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Frame Type</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setFrameType('default');
                  playSound("select");
                }}
                className={`px-3 py-1 text-xs rounded ${frameType === 'default' ? 'bg-purple-800 text-white' : 'bg-black/40 text-white/70'}`}
              >
                Default
              </button>
              <button 
                onClick={() => {
                  setFrameType('verse');
                  playSound("select");
                }}
                className={`px-3 py-1 text-xs rounded ${frameType === 'verse' ? 'bg-purple-800 text-white' : 'bg-black/40 text-white/70'}`}
              >
                Verse
              </button>
              <button 
                onClick={() => {
                  setFrameType('wisdom');
                  playSound("select");
                }}
                className={`px-3 py-1 text-xs rounded ${frameType === 'wisdom' ? 'bg-purple-800 text-white' : 'bg-black/40 text-white/70'}`}
              >
                Wisdom
              </button>
            </div>
          </div>
          <p className="text-sm text-white/70">
            Select the type of Farcaster Frame you want to generate for your mini-app
          </p>
        </div>
        
        <div className="mb-6 hover:scale-105 transition-transform duration-300">
          {frameType === 'verse' ? (
            <FramePreview 
              title="Biblical Wisdom"
              verse={{
                text: randomVerse.text,
                reference: randomVerse.reference
              }}
              buttons={[
                { label: "Get More Wisdom" },
                { label: "Share This Verse" },
                { label: "Open BibleFi" },
              ]}
            />
          ) : frameType === 'wisdom' ? (
            <FramePreview 
              title="Biblical Finance Wisdom Score: 75"
              buttons={[
                { label: "Get Your Wisdom Score" },
                { label: "Apply Biblical Finance" },
                { label: "Share Your Score" },
              ]}
            />
          ) : (
            <FramePreview 
              title="Biblical wisdom for your financial journey"
              buttons={[
                { label: "Biblical Wisdom" },
                { label: "DeFi Swaps" },
                { label: "Digital Tithing" },
                { label: "Share Wisdom" },
              ]}
            />
          )}
        </div>
        
        {frameType === 'verse' && (
          <div className="bg-black/20 p-3 rounded-md mb-3 border border-ancient-gold/30">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-ancient-scroll">{randomVerse.reference}</p>
              <PixelButton 
                size="sm"
                variant="outline"
                onClick={handleNewVerse}
                className="flex items-center"
              >
                <BookOpen size={14} className="mr-1" /> New Verse
              </PixelButton>
            </div>
            <p className="italic text-white/90">"{randomVerse.text}"</p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <div className="bg-black/20 p-3 rounded-md mb-3 border border-ancient-gold/30 hover:border-ancient-gold transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Deploy as Mini-App</h3>
              <PixelButton 
                size="sm"
                variant="outline"
                onClick={handleCopyFrameHTML}
                className="flex items-center"
                farcasterStyle
              >
                <Copy size={14} className="mr-1" /> Copy HTML
              </PixelButton>
            </div>
            <p className="text-xs text-white/70">
              To deploy BibleFi as a Farcaster mini-app, copy the generated HTML and host it on your domain.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 space-y-3">
            <PixelButton 
              className="w-full flex items-center justify-center"
              onClick={handleGenerateFrame}
              farcasterStyle
            >
              <GalleryVerticalEnd size={16} className="mr-2" /> Generate Frame HTML
            </PixelButton>
            
            <PixelButton 
              className="w-full flex items-center justify-center"
              variant="outline"
              onClick={handleOpenFrame}
              farcasterStyle
            >
              <ExternalLink size={16} className="mr-2" /> Preview Frame
            </PixelButton>
          </div>
          
          <PixelButton 
            className="w-full flex items-center justify-center mt-3"
            onClick={() => window.open(farcasterClient.generateVerseSharingUrl(randomVerse.text, randomVerse.reference), "_blank")}
            farcasterStyle
          >
            <Share2 size={16} className="mr-2" /> Share to Farcaster
          </PixelButton>
          
          <PixelButton 
            className="w-full flex items-center justify-center mt-1 border-dashed"
            variant="outline"
            onClick={() => window.open("https://docs.farcaster.xyz/reference/frames/introduction", "_blank")}
            farcasterStyle
          >
            <Stamp size={16} className="mr-2" /> Frames Documentation
          </PixelButton>
        </div>

        <div className="mt-6 text-sm text-center text-white/60">
          <p>Learn, implement & share Biblical financial wisdom directly to your network on Farcaster.</p>
          <div className="flex items-center justify-center mt-2">
            <img
              src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png"
              alt="Base Chain"
              className="h-4 mr-2"
            />
            <span className="text-xs">Built & deployed on Base chain</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarcasterFrame;
