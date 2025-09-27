
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BiblicalFarmingStrategy from "@/components/defi/BiblicalFarmingStrategy";
import WisdomScore from "@/components/wisdom/WisdomScore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRandomVerse } from "@/data/bibleVerses";
import { useSound } from "@/contexts/SoundContext";
import { Wallet, Filter, AlertTriangle, BookOpen, Shield, GanttChartSquare } from "lucide-react";

const FarmingPage: React.FC = () => {
  const { playSound } = useSound();
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterYield, setFilterYield] = useState<string>("all");
  
  const handleTabChange = (value: string) => {
    playSound("select");
  };
  
  const wisdomVerse = getRandomVerse();
  
  // Biblical farming strategies using biblical principles
  const biblicalFarmingStrategies = [
    {
      id: "faithful-steward-pool",
      name: "Faithful Steward Pool",
      apy: "8.5% APY",
      riskLevel: "low" as const,
      description: "A conservative strategy based on stablecoin pairs, offering consistent returns while minimizing risk.",
      asset1: { symbol: "USDC" },
      asset2: { symbol: "DAI" },
      platform: "Base Swap",
      platformUrl: "https://baseswap.fi",
      biblicalPrinciple: {
        verse: "The wise store up choice food and olive oil, but fools gulp theirs down.",
        reference: "Proverbs 21:20",
        principle: "Save for the future rather than consuming everything immediately. Biblical wisdom encourages prudent reserves."
      },
      requirements: [
        "Minimum 100 USDC/DAI LP tokens",
        "7-day minimum lock period",
        "Stablecoins (low volatility)",
      ]
    },
    {
      id: "fruitful-vineyard",
      name: "Fruitful Vineyard Strategy",
      apy: "12% APY",
      riskLevel: "medium" as const,
      description: "A balanced approach with moderate growth potential, designed for patient investors seeking steady returns.",
      asset1: { symbol: "ETH" },
      asset2: { symbol: "USDC" },
      platform: "Aerodrome",
      platformUrl: "https://aerodrome.finance",
      biblicalPrinciple: {
        verse: "But the seed on good soil stands for those with a noble and good heart, who hear the word, retain it, and by persevering produce a crop.",
        reference: "Luke 8:15",
        principle: "Patient investment with good fundamentals yields multiplied returns over time."
      },
      requirements: [
        "Minimum 0.1 ETH and equivalent USDC",
        "30-day recommended holding period",
        "Impermanent loss protection after 90 days"
      ]
    },
    {
      id: "diversified-blessings",
      name: "Diversified Blessings Fund",
      apy: "15% APY",
      riskLevel: "medium" as const,
      description: "A diversified strategy that automatically balances across multiple high-quality assets.",
      asset1: { symbol: "ETH" },
      asset2: { symbol: "wBTC" },
      platform: "Uniswap on Base",
      platformUrl: "https://app.uniswap.org",
      biblicalPrinciple: {
        verse: "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land.",
        reference: "Ecclesiastes 11:2",
        principle: "Spread investments across multiple ventures to protect against unforeseen calamities."
      },
      requirements: [
        "Minimum 0.05 ETH or equivalent",
        "Auto-compounding rewards",
        "Cross-chain diversification"
      ]
    },
    {
      id: "first-fruits-offering",
      name: "First Fruits Offering",
      apy: "10% APY",
      riskLevel: "low" as const,
      description: "A conservative strategy that automatically donates 10% of earnings to Christian ministries.",
      asset1: { symbol: "USDC" },
      asset2: { symbol: "ETH" },
      platform: "Bible.fi",
      platformUrl: "https://bible.fi",
      biblicalPrinciple: {
        verse: "Honor the LORD with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing.",
        reference: "Proverbs 3:9-10",
        principle: "Giving the first portion of your increase to God leads to blessing and abundance."
      },
      requirements: [
        "Automatic 10% donation to ministry of choice",
        "Minimum 50 USDC or 0.05 ETH",
        "Monthly donation reports",
        "Tax-deductible receipts available"
      ]
    },
    {
      id: "diligent-hands",
      name: "Diligent Hands Strategy",
      apy: "16% APY",
      riskLevel: "medium" as const,
      description: "A yield optimizing strategy that automatically shifts between protocols to maximize returns.",
      asset1: { symbol: "DAI" },
      asset2: { symbol: "USDT" },
      platform: "Beefy Finance",
      platformUrl: "https://beefy.finance",
      biblicalPrinciple: {
        verse: "Lazy hands make for poverty, but diligent hands bring wealth.",
        reference: "Proverbs 10:4",
        principle: "Active management and diligent optimization lead to better returns than passive neglect."
      },
      requirements: [
        "Auto-optimizing strategy",
        "Minimum 100 DAI/USDT LP",
        "Smart rebalancing algorithm",
        "Weekly performance reports"
      ]
    }
  ];
  
  // Filter strategies based on user selections
  const filteredStrategies = biblicalFarmingStrategies.filter(strategy => {
    if (filterRisk !== "all" && strategy.riskLevel !== filterRisk) {
      return false;
    }
    
    if (filterYield !== "all") {
      const apyValue = parseFloat(strategy.apy);
      if (filterYield === "low" && apyValue > 10) return false;
      if (filterYield === "medium" && (apyValue <= 10 || apyValue > 15)) return false;
      if (filterYield === "high" && apyValue <= 15) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-scroll text-ancient-gold">Biblical Farming Strategies</h1>
          <p className="text-white/80 max-w-2xl">
            Apply biblical financial principles to DeFi yield farming strategies, 
            balancing profitability with wisdom, stewardship, and generosity.
          </p>
          
          <Alert className="bg-scripture/10 border-scripture/30">
            <BookOpen className="h-4 w-4 text-ancient-gold" />
            <AlertTitle className="text-ancient-gold">Biblical Wisdom</AlertTitle>
            <AlertDescription className="text-white/90 italic">
              "{wisdomVerse.text}" - <span className="text-ancient-gold/80">{wisdomVerse.reference}</span>
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <Tabs defaultValue="strategies" onValueChange={handleTabChange}>
              <div className="flex justify-between items-center mb-4">
                <TabsList className="bg-scripture/40 border border-ancient-gold/50 p-1">
                  <TabsTrigger value="strategies" className="data-[state=active]:bg-purple-900/70 text-ancient-gold">
                    Strategies
                  </TabsTrigger>
                  <TabsTrigger value="education" className="data-[state=active]:bg-purple-900/70 text-ancient-gold">
                    Education
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="data-[state=active]:bg-purple-900/70 text-ancient-gold">
                    Rewards
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Select 
                    value={filterRisk} 
                    onValueChange={(value) => {
                      setFilterRisk(value);
                      playSound("select");
                    }}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <div className="flex items-center gap-1">
                        <Shield size={12} />
                        <span>Risk Level</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risks</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filterYield} 
                    onValueChange={(value) => {
                      setFilterYield(value);
                      playSound("select");
                    }}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <div className="flex items-center gap-1">
                        <GanttChartSquare size={12} />
                        <span>Yield</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Yields</SelectItem>
                      <SelectItem value="low">Under 10%</SelectItem>
                      <SelectItem value="medium">10-15%</SelectItem>
                      <SelectItem value="high">Over 15%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <TabsContent value="strategies" className="space-y-6">
                {filteredStrategies.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-ancient-gold/20 rounded-lg">
                    <Filter className="mx-auto h-12 w-12 text-ancient-gold/40 mb-2" />
                    <h3 className="text-lg font-medium text-ancient-gold">No Matching Strategies</h3>
                    <p className="text-white/60 max-w-md mx-auto mt-2">
                      Try adjusting your filters to see more biblical farming strategies
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setFilterRisk("all");
                        setFilterYield("all");
                        playSound("select");
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredStrategies.map(strategy => (
                      <BiblicalFarmingStrategy
                        key={strategy.id}
                        name={strategy.name}
                        apy={strategy.apy}
                        riskLevel={strategy.riskLevel}
                        description={strategy.description}
                        asset1={strategy.asset1}
                        asset2={strategy.asset2}
                        platform={strategy.platform}
                        platformUrl={strategy.platformUrl}
                        biblicalPrinciple={strategy.biblicalPrinciple}
                        requirements={strategy.requirements}
                      />
                    ))}
                  </div>
                )}
                
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-400">Risk Warning</AlertTitle>
                  <AlertDescription className="text-amber-200/70">
                    "For which of you, intending to build a tower, does not sit down first and count the cost, whether he has enough to finish it?" - Luke 14:28. DeFi farming involves risk; invest only what you can afford to lose.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="education" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Biblical Farming Education</CardTitle>
                    <CardDescription>
                      Learn how to apply biblical principles to your farming strategy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-ancient-gold/20 rounded-lg bg-scripture/10">
                        <h3 className="text-lg font-medium text-ancient-gold mb-2">Stewardship Principles</h3>
                        <p className="text-sm text-white/80">
                          Learn how the biblical principle of stewardship applies to DeFi farming. God entrusts resources to us to manage wisely, not waste or hoard.
                        </p>
                        <Button variant="link" className="text-ancient-gold p-0 h-auto mt-2">
                          Study Stewardship →
                        </Button>
                      </div>
                      
                      <div className="p-4 border border-ancient-gold/20 rounded-lg bg-scripture/10">
                        <h3 className="text-lg font-medium text-ancient-gold mb-2">Risk Management in Scripture</h3>
                        <p className="text-sm text-white/80">
                          Explore how the Bible guides us in managing risk and uncertainty, from Joseph's preparation to Jesus's teaching on counting the cost.
                        </p>
                        <Button variant="link" className="text-ancient-gold p-0 h-auto mt-2">
                          Study Risk Management →
                        </Button>
                      </div>
                      
                      <div className="p-4 border border-ancient-gold/20 rounded-lg bg-scripture/10">
                        <h3 className="text-lg font-medium text-ancient-gold mb-2">Giving as Investment</h3>
                        <p className="text-sm text-white/80">
                          Discover how biblical giving principles can be integrated into your yield farming strategy to bless others while growing your resources.
                        </p>
                        <Button variant="link" className="text-ancient-gold p-0 h-auto mt-2">
                          Study Giving Principles →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rewards" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Farming Rewards</CardTitle>
                    <CardDescription>
                      Track and claim your biblical farming rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Wallet className="mx-auto h-12 w-12 text-ancient-gold/40 mb-2" />
                      <h3 className="text-lg font-medium">Connect Your Wallet</h3>
                      <p className="text-white/60 max-w-md mx-auto mt-2">
                        Connect your wallet to view and claim your farming rewards
                      </p>
                      <Button className="mt-4">
                        Connect Wallet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-1">
            <WisdomScore />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmingPage;
