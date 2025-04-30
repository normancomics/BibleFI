
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import FinancialPrinciple from "./FinancialPrinciple";

interface FinancialPrincipleData {
  id: string;
  title: string;
  description: string;
  scriptureReferences: string[];
}

interface FinancialPrinciplesListProps {
  unlockedPrinciples: string[];
}

const principles: FinancialPrincipleData[] = [
  {
    id: "avoid-debt",
    title: "1. Avoid Debt When Possible",
    description: "The Bible warns against the dangers of debt. While not all debt is sinful, scripture encourages us to live debt-free when possible.",
    scriptureReferences: ["Proverbs 22:7", "Romans 13:8"]
  },
  {
    id: "save-consistently",
    title: "2. Save Consistently",
    description: "Proverbs encourages saving regularly. This principle aligns with modern financial wisdom of building emergency funds and saving for the future.",
    scriptureReferences: ["Proverbs 21:20", "Proverbs 6:6-8"]
  },
  {
    id: "be-generous",
    title: "3. Be Generous",
    description: "Many scriptures teach about the importance of giving. The Bible encourages tithing (giving 10%) as well as additional giving to those in need.",
    scriptureReferences: ["Malachi 3:10", "2 Corinthians 9:7"]
  },
  {
    id: "work-diligently",
    title: "4. Work Diligently",
    description: "Scripture values hard work and diligence. Laziness is consistently discouraged throughout the Bible.",
    scriptureReferences: ["Proverbs 10:4", "Colossians 3:23-24"]
  },
  {
    id: "practice-contentment",
    title: "5. Practice Contentment",
    description: "The Bible warns against greed and the love of money, encouraging us to be content with what we have.",
    scriptureReferences: ["1 Timothy 6:6-8", "Hebrews 13:5"]
  }
];

const FinancialPrinciplesList: React.FC<FinancialPrinciplesListProps> = ({ unlockedPrinciples }) => {
  return (
    <Card className="pixel-card mt-8">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-scroll mb-4">Financial Principles from Scripture</h2>
        <div className="space-y-6">
          {principles.map(principle => (
            <FinancialPrinciple
              key={principle.id}
              title={principle.title}
              description={principle.description}
              scriptureReferences={principle.scriptureReferences}
              isUnlocked={unlockedPrinciples.includes(principle.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialPrinciplesList;
