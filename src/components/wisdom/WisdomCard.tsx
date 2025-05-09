
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, CopyCheck, Share2 } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";

export interface WisdomCardProps {
  scripture: string;
  reference: string;
  principle: string;
  application: string;
  tags?: string[];
  className?: string;
}

const WisdomCard: React.FC<WisdomCardProps> = ({
  scripture,
  reference,
  principle,
  application,
  tags = [],
  className = ""
}) => {
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const handleCopyWisdom = () => {
    playSound("scroll");
    
    const textToCopy = `"${scripture}" - ${reference}\n\nPrinciple: ${principle}\n\nApplication: ${application}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: "Wisdom Copied",
          description: "Biblical wisdom copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy to clipboard",
        });
      });
  };
  
  const handleShare = () => {
    playSound("coin");
    
    // Prepare sharing text
    const shareText = `Biblical Financial Wisdom from Bible.fi:\n\n"${scripture}" - ${reference}\n\n#BibleFi #BaseChain #Biblical_Finance`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: "Biblical Financial Wisdom",
        text: shareText,
        url: window.location.href
      }).catch(err => console.error("Error sharing:", err));
    } else {
      // Fallback to Farcaster share
      const encodedText = encodeURIComponent(shareText);
      const farcasterUrl = `https://warpcast.com/~/compose?text=${encodedText}`;
      window.open(farcasterUrl, '_blank');
    }
  };
  
  return (
    <Card className={`bg-black/70 border border-scripture hover:border-ancient-gold/50 transition-colors ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className="bg-scripture/40 text-white border-none">
            <Book className="h-3 w-3 mr-1" />
            Financial Wisdom
          </Badge>
        </div>
        <CardTitle className="text-ancient-gold font-scroll text-lg mt-2">
          {reference}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="bg-black/40 border-l-4 border-ancient-gold/50 pl-3 py-2 mb-4">
          <p className="text-white/90 italic">"{scripture}"</p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-bold text-scripture mb-1">Principle:</h4>
          <p className="text-white/80">{principle}</p>
        </div>
        
        <div className="mb-2">
          <h4 className="text-sm font-bold text-scripture mb-1">Application:</h4>
          <p className="text-white/80">{application}</p>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <PixelButton 
          size="sm" 
          variant="outline" 
          onClick={handleCopyWisdom}
          className="flex items-center"
        >
          <CopyCheck className="h-4 w-4 mr-1" />
          <span>Copy</span>
        </PixelButton>
        
        <PixelButton 
          size="sm"
          onClick={handleShare}
          className="flex items-center bg-base-blue hover:bg-base-blue/80"
        >
          <Share2 className="h-4 w-4 mr-1" />
          <span>Share</span>
        </PixelButton>
      </CardFooter>
    </Card>
  );
};

export default WisdomCard;
