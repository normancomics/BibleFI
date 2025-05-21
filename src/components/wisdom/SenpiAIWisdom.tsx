
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Lightbulb } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

interface SenpiAIWisdomProps {
  apiConfigured?: boolean;
}

const SenpiAIWisdom: React.FC<SenpiAIWisdomProps> = ({ apiConfigured = false }) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [wisdom, setWisdom] = useState<string | null>(null);
  
  // Placeholder responses for demo purposes
  const placeholderResponses = [
    "Proverbs 13:11 teaches us: 'Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.' This reminds us to build wealth steadily through consistent investments rather than seeking quick gains.",
    "Jesus taught in Matthew 25 through the Parable of the Talents that we should be good stewards of our resources. This means diversifying investments and using our resources wisely.",
    "1 Timothy 6:10 warns that 'the love of money is a root of all kinds of evils.' This doesn't mean money itself is evil, but rather our attitude toward it. Invest with integrity and purpose.",
    "Proverbs 22:7 advises: 'The rich rules over the poor, and the borrower is the slave of the lender.' This Biblical wisdom encourages us to avoid debt when possible and achieve financial freedom."
  ];
  
  const handleGenerateWisdom = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a financial topic to receive wisdom",
        variant: "destructive",
      });
      playSound("error");
      return;
    }
    
    setIsGenerating(true);
    playSound("scroll");
    
    // Simulate AI response
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * placeholderResponses.length);
      setWisdom(placeholderResponses[randomIndex]);
      setIsGenerating(false);
      playSound("success");
    }, 1500);
  };

  return (
    <Card className="pixel-card bg-purple-900/40 border border-ancient-gold/50">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <BrainCircuit size={24} className="mr-2 text-ancient-gold" />
          <h2 className="text-2xl font-scroll text-ancient-gold">Biblical AI Wisdom</h2>
        </div>
        
        <p className="mb-4 text-sm text-white/90">
          Ask for Biblical financial wisdom on any topic. Our AI will analyze scripture and provide guidance.
        </p>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="E.g., How should I invest according to the Bible?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="font-scroll bg-purple-900/30 border-ancient-gold/50"
            />
          </div>
          
          <PixelButton
            onClick={handleGenerateWisdom}
            disabled={isGenerating}
            className="w-full"
            farcasterStyle
          >
            {isGenerating ? "Consulting Scripture..." : "Generate Wisdom"}
          </PixelButton>
          
          {wisdom && (
            <div className="mt-4 p-4 bg-purple-900/30 border border-ancient-gold/40 rounded-md">
              <div className="flex items-start">
                <Lightbulb size={20} className="text-ancient-gold mr-2 mt-1 flex-shrink-0" />
                <p className="italic text-white/90">{wisdom}</p>
              </div>
            </div>
          )}
          
          {!apiConfigured && (
            <div className="text-xs text-muted-foreground text-center mt-2">
              Note: AI integration is in demonstration mode. For full functionality, please configure your API key.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SenpiAIWisdom;
