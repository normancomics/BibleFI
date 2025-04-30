
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScriptureCard from "@/components/ScriptureCard";
import { BibleVerse } from "@/data/bibleVerses";

interface ScriptureFilterProps {
  verses: BibleVerse[];
}

const ScriptureFilter: React.FC<ScriptureFilterProps> = ({ verses }) => {
  return (
    <Tabs defaultValue="all" className="mb-8">
      <TabsList className="grid grid-cols-6 mb-8">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="wealth">Wealth</TabsTrigger>
        <TabsTrigger value="giving">Giving</TabsTrigger>
        <TabsTrigger value="work">Work</TabsTrigger>
        <TabsTrigger value="stewardship">Stewardship</TabsTrigger>
        <TabsTrigger value="debt">Debt</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <div className="grid md:grid-cols-2 gap-6">
          {verses.map(verse => (
            <ScriptureCard key={verse.key} verse={verse} />
          ))}
        </div>
      </TabsContent>
      
      {["wealth", "giving", "work", "stewardship", "debt"].map(category => (
        <TabsContent key={category} value={category}>
          <div className="grid md:grid-cols-2 gap-6">
            {verses
              .filter(verse => verse.category === category)
              .map(verse => (
                <ScriptureCard key={verse.key} verse={verse} />
              ))
            }
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ScriptureFilter;
