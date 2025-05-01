
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award, Star } from "lucide-react";

const TithingAchievements: React.FC = () => {
  return (
    <Card className="pixel-card mb-6">
      <CardContent className="pt-6">
        <h3 className="text-xl font-scroll mb-3 flex items-center">
          <Trophy size={20} className="text-scripture mr-2" /> 
          Tithing Achievements
        </h3>
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
