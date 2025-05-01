
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award, Star } from "lucide-react";

const TithingAchievements: React.FC = () => {
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
            <Trophy size={20} className="text-ancient-gold mr-2" /> 
            Tithing Achievements
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-scripture/20 p-3 rounded-md text-center">
            <h4 className="font-pixel text-sm mb-1">First Fruits</h4>
            <p className="text-xs text-muted-foreground">First time tithing</p>
          </div>
          <div className="border border-dashed border-scripture/20 p-3 rounded-md text-center opacity-50">
            <h4 className="font-pixel text-sm mb-1">Consistent Giver</h4>
            <p className="text-xs text-muted-foreground">Tithe 3 months in a row</p>
          </div>
          <div className="border border-dashed border-scripture/20 p-3 rounded-md text-center opacity-50">
            <h4 className="font-pixel text-sm mb-1">Cheerful Giver</h4>
            <p className="text-xs text-muted-foreground">Tithe to 5 different churches</p>
          </div>
          <div className="border border-dashed border-scripture/20 p-3 rounded-md text-center opacity-50">
            <h4 className="font-pixel text-sm mb-1">Faithful Steward</h4>
            <p className="text-xs text-muted-foreground">Reach 10% of income in tithes</p>
          </div>
          <div className="border border-dashed border-scripture/20 p-3 rounded-md text-center opacity-50">
            <h4 className="font-pixel text-sm mb-1">Abraham's Legacy</h4>
            <p className="text-xs text-muted-foreground">Tithe for a full year consistently</p>
          </div>
          <div className="border border-dashed border-scripture/20 p-3 rounded-md text-center opacity-50">
            <h4 className="font-pixel text-sm mb-1">Kingdom Builder</h4>
            <p className="text-xs text-muted-foreground">Help a church accept crypto</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TithingAchievements;
