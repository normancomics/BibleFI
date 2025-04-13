
import React from "react";
import NavBar from "@/components/NavBar";
import BibleCharacter from "@/components/BibleCharacter";
import ScriptureCard from "@/components/ScriptureCard";
import { financialVerses } from "@/data/bibleVerses";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WisdomPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-scroll text-scripture-dark mb-4">Biblical Financial Wisdom</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover what the Bible teaches about money, wealth, and stewardship.
          </p>
        </section>
        
        <BibleCharacter 
          character="jesus" 
          message="For where your treasure is, there your heart will be also. - Matthew 6:21"
          className="mb-8 max-w-2xl mx-auto"
        />
        
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
              {financialVerses.map(verse => (
                <ScriptureCard key={verse.key} verse={verse} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="wealth">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "wealth")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="giving">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "giving")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="work">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "work")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="stewardship">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "stewardship")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="debt">
            <div className="grid md:grid-cols-2 gap-6">
              {financialVerses
                .filter(verse => verse.category === "debt")
                .map(verse => (
                  <ScriptureCard key={verse.key} verse={verse} />
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
        
        <Card className="pixel-card mt-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-scroll mb-4">Financial Principles from Scripture</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Avoid Debt When Possible</h3>
                <p>The Bible warns against the dangers of debt. While not all debt is sinful, scripture encourages us to live debt-free when possible.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Save Consistently</h3>
                <p>Proverbs encourages saving regularly. This principle aligns with modern financial wisdom of building emergency funds and saving for the future.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">3. Be Generous</h3>
                <p>Many scriptures teach about the importance of giving. The Bible encourages tithing (giving 10%) as well as additional giving to those in need.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">4. Work Diligently</h3>
                <p>Scripture values hard work and diligence. Laziness is consistently discouraged throughout the Bible.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">5. Practice Contentment</h3>
                <p>The Bible warns against greed and the love of money, encouraging us to be content with what we have.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WisdomPage;
