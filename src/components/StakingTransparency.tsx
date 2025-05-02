
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Info, BookOpen, Scale } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface StakingTransparencyProps {
  pool?: string;
}

const StakingTransparency: React.FC<StakingTransparencyProps> = ({ pool = "general" }) => {
  return (
    <Card className="pixel-card mb-6">
      <CardContent className="pt-6">
        <div className="relative px-4 py-2 mb-4 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold">
          <div className="absolute inset-0 bg-black/10 opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
          <div className="absolute -left-1 -top-1 w-2 h-2 border-t border-l border-ancient-gold"></div>
          <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-ancient-gold"></div>
          <div className="absolute -left-1 -bottom-1 w-2 h-2 border-b border-l border-ancient-gold"></div>
          <div className="absolute -right-1 -bottom-1 w-2 h-2 border-b border-r border-ancient-gold"></div>
          <h3 className="text-xl font-scroll text-white drop-shadow-[0_0_5px_rgba(255,215,0,0.5)] flex items-center relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(255,215,0,0.7)' }}>
            <Shield size={20} className="text-ancient-gold mr-2" /> 
            Biblical Transparency
          </h3>
        </div>
        
        <p className="mb-4 text-sm">
          Our staking pools are designed with biblical principles in mind, avoiding usury while generating returns through ethical mechanisms aligned with scripture.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-scroll text-scripture">
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Biblical Principles
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <div className="space-y-2">
                <p><strong>Exodus 22:25</strong> - "If you lend money to one of my people among you who is needy, do not treat it like a business deal; charge no interest."</p>
                <p><strong>Psalm 15:5</strong> - "who lends money to the poor without interest; who does not accept a bribe against the innocent."</p>
                <p><strong>Proverbs 13:11</strong> - "Dishonest money dwindles away, but whoever gathers money little by little makes it grow."</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-scroll text-scripture">
              <div className="flex items-center">
                <Scale className="mr-2 h-4 w-4" />
                How Returns Are Generated
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <div className="space-y-3">
                <div className="border-l-2 border-scripture pl-3">
                  <strong>Liquidity Provision</strong>
                  <p>Funds are used to provide liquidity for decentralized exchanges, earning trading fees rather than interest.</p>
                </div>
                
                <div className="border-l-2 border-scripture pl-3">
                  <strong>Investment in Real Projects</strong>
                  <p>Funding ethical businesses and projects that create real value, sharing in their profits rather than charging interest.</p>
                </div>
                
                <div className="border-l-2 border-scripture pl-3">
                  <strong>Validator Services</strong>
                  <p>Securing blockchain networks through staking and validation, earning rewards for supporting network integrity.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-scroll text-scripture">
              <div className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Risk Transparency
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <div className="space-y-2">
                <p><strong>Low Risk Pools</strong> - Diversified across many stable assets with established track records.</p>
                <p><strong>Medium Risk Pools</strong> - Balanced portfolio with some exposure to growth assets while maintaining stability.</p>
                <p><strong>Higher Risk Pools</strong> - Greater exposure to growth opportunities with corresponding higher volatility.</p>
                <div className="mt-3 p-2 bg-black/20 rounded">
                  <p className="text-xs italic">
                    "Suppose one of you wants to build a tower. Won't you first sit down and estimate the cost to see if you have enough money to complete it?" - Luke 14:28
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="text-xs text-muted-foreground mt-4 text-center">
          View our full <span className="text-scripture cursor-pointer">Biblical Investment Policy</span> for more details
        </div>
      </CardContent>
    </Card>
  );
};

export default StakingTransparency;
