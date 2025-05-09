
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Share2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";

interface WisdomCardProps {
  scripture: string;
  reference: string;
  principle: string;
  application: string;
  tags: string[];
}

const WisdomCard: React.FC<WisdomCardProps> = ({
  scripture,
  reference,
  principle,
  application,
  tags
}) => {
  const { toast } = useToast();
  const { playSound } = useSound();

  const shareWisdom = () => {
    playSound("select");
    
    // Create share text
    const shareText = `"${scripture}" - ${reference}\n\nPrinciple: ${principle}\n\n#Bible #Finance #Wisdom`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Biblical Financial Wisdom',
        text: shareText,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared Successfully",
          description: "Wisdom shared with others!",
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        
        // Fallback to clipboard
        copyToClipboard(shareText);
      });
    } else {
      // Fallback for browsers that don't support sharing
      copyToClipboard(shareText);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Share this wisdom with others!",
      });
    });
  };

  return (
    <Card className="bg-black/60 border border-scripture/30 hover:border-ancient-gold/30 transition-all overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-end mb-3">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="text-xs px-2 py-1 rounded-full bg-scripture/20 text-scripture mr-2"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mb-4">
          <blockquote className="italic text-ancient-gold border-l-4 border-ancient-gold/50 pl-4 py-1">
            "{scripture}"
          </blockquote>
          <p className="text-right text-white/80 mt-2">— {reference}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">Principle:</h4>
          <p className="text-white/70">{principle}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">Application:</h4>
          <p className="text-white/70">{application}</p>
        </div>
        
        <div className="flex justify-between mt-4">
          <button 
            className="flex items-center text-ancient-gold hover:text-scripture transition-colors"
            onClick={() => {
              playSound("click");
              window.open(`https://www.biblegateway.com/passage/?search=${reference}`, '_blank');
            }}
          >
            <BookOpen size={16} className="mr-1" />
            <span>Read More</span>
          </button>
          
          <button 
            className="flex items-center text-ancient-gold hover:text-scripture transition-colors"
            onClick={shareWisdom}
          >
            <Share2 size={16} className="mr-1" />
            <span>Share</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WisdomCard;
