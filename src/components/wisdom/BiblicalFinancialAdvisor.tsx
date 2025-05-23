
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FinancialGuidanceResponse } from "@/types/wisdom";
import { getBiblicalFinancialGuidance } from "@/services/biblicalAdvisorService";
import { Separator } from "@/components/ui/separator";
import { Loader2, MessageSquare, Book, Sparkles } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import PixelButton from "@/components/PixelButton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PixelCharacter from "@/components/PixelCharacter";

const BiblicalFinancialAdvisor: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<FinancialGuidanceResponse | null>(null);
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Please enter a question",
        description: "Ask about biblical financial principles or guidance",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    setIsLoading(true);
    playSound("scroll");
    
    try {
      const guidance = await getBiblicalFinancialGuidance({ query });
      setResponse(guidance);
      playSound("success");
    } catch (error) {
      console.error("Error getting guidance:", error);
      toast({
        title: "Failed to get guidance",
        description: "There was an error processing your request",
        variant: "destructive"
      });
      playSound("error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShareToFarcaster = () => {
    if (!response) return;
    
    playSound("select");
    
    // Create text to share
    const shareText = `Biblical Financial Wisdom:\n\n"${response.relevantScriptures[0]?.text}"\n- ${response.relevantScriptures[0]?.reference}\n\n#BibleFi #BiblicalFinance`;
    
    // Open Farcaster share dialog
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`, "_blank");
    
    toast({
      title: "Ready to share",
      description: "Opening Farcaster to share this wisdom",
    });
  };

  return (
    <Card className="border-2 border-scripture/30 bg-black/20">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
        <CardTitle className="font-scroll text-ancient-gold">Biblical Financial Advisor</CardTitle>
        <CardDescription className="text-white/70">
          Seek wisdom from scripture about money, investing, and stewardship
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            {!response && (
              <PixelCharacter 
                character="solomon" 
                message="Ask me about biblical financial principles, tithing, investing, or stewardship."
                size="md"
                soundEffect={true}
              />
            )}
          </div>
          
          <Textarea
            placeholder="Ask a question about biblical financial principles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="font-scroll min-h-24 bg-black/30 border-ancient-gold/30"
          />
          
          <div className="flex justify-end">
            <PixelButton 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeking wisdom...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask for Wisdom
                </>
              )}
            </PixelButton>
          </div>
        </form>
        
        {response && (
          <div className="mt-6 space-y-4">
            <div className="bg-scripture/10 p-4 rounded-md border border-scripture/30">
              <p className="text-white/90 mb-4">{response.answer}</p>
              
              <Separator className="my-4 bg-ancient-gold/30" />
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-ancient-gold flex items-center">
                  <Book className="mr-2 h-4 w-4" />
                  Relevant Scriptures
                </p>
                
                {response.relevantScriptures.map((scripture, index) => (
                  <div key={index} className="bg-black/30 p-3 rounded border border-ancient-gold/20">
                    <p className="italic text-white/80">"{scripture.text}"</p>
                    <p className="text-right text-sm text-ancient-gold mt-1">{scripture.reference}</p>
                  </div>
                ))}
              </div>
              
              {response.defiSuggestions && response.defiSuggestions.length > 0 && (
                <>
                  <Separator className="my-4 bg-ancient-gold/30" />
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-ancient-gold flex items-center">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Biblical DeFi Applications
                    </p>
                    
                    {response.defiSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-purple-900/10 p-3 rounded border border-purple-500/20">
                        <div className="flex justify-between items-center mb-2">
                          <Badge className="bg-purple-900/30 text-ancient-gold border-ancient-gold/50">
                            {suggestion.protocol}
                          </Badge>
                        </div>
                        <p className="text-white/80">{suggestion.action}</p>
                        <p className="text-sm text-white/60 mt-1">{suggestion.rationale}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="mt-4 flex justify-end">
                <PixelButton 
                  variant="outline" 
                  onClick={handleShareToFarcaster}
                  size="sm"
                  className="flex items-center"
                >
                  Share this wisdom on Farcaster
                </PixelButton>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-black/30 border-t border-ancient-gold/20 p-3 flex justify-center">
        <span className="text-xs text-white/50">
          Powered by Scripture and Biblical Financial Principles
        </span>
      </CardFooter>
    </Card>
  );
};

export default BiblicalFinancialAdvisor;
