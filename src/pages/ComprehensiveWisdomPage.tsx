import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSound } from "@/contexts/SoundContext";
import { comprehensiveWisdomService, EnhancedWisdomQuery, ComprehensiveWisdomResponse } from "@/services/comprehensiveWisdomService";
import { CompleteBiblicalExample } from "@/data/completeBibleFinances";
import { Search, BookOpen, Users, TrendingUp, Shield, Lightbulb, Target } from "lucide-react";

const ComprehensiveWisdomPage: React.FC = () => {
  const { playSound } = useSound();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ComprehensiveWisdomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    category?: CompleteBiblicalExample["category"];
    character?: string;
    book?: string;
    testament?: "Old" | "New";
    riskLevel?: "low" | "medium" | "high";
  }>({});
  
  const availableFilters = comprehensiveWisdomService.getAvailableFilters();
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    playSound("select");
    setLoading(true);
    
    try {
      const enhancedQuery: EnhancedWisdomQuery = {
        query,
        ...filters,
        includeModernParallels: true,
        includeDefiRelevance: true
      };
      
      const result = comprehensiveWisdomService.getComprehensiveWisdom(enhancedQuery);
      setResponse(result);
      playSound("success");
    } catch (error) {
      console.error("Error getting wisdom:", error);
      playSound("error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleExampleClick = (example: CompleteBiblicalExample) => {
    playSound("click");
    setQuery(example.principle);
    handleSearch();
  };
  
  const clearFilters = () => {
    playSound("click");
    setFilters({});
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-royal-purple via-deep-purple to-scripture">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-scroll text-ancient-gold mb-4 drop-shadow-lg">
            Complete Biblical Financial Wisdom
          </h1>
          <p className="text-white/90 max-w-4xl mx-auto text-lg leading-relaxed">
            Access EVERY financial example, principle, and story from the Bible. From Genesis to Revelation, 
            discover comprehensive wisdom for modern financial decisions and DeFi strategies.
          </p>
        </div>
        
        {/* Search Interface */}
        <Card className="mb-8 bg-scripture/40 border-ancient-gold/50">
          <CardHeader>
            <CardTitle className="text-ancient-gold flex items-center gap-2">
              <Search size={24} />
              Search All Biblical Financial Wisdom
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask about any financial topic (e.g., 'What does the Bible say about debt?', 'Joseph's economic strategy', 'Solomon's wealth')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-white/10 border-ancient-gold/30 text-white placeholder:text-white/60"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || !query.trim()}
                className="bg-ancient-gold hover:bg-ancient-gold/80 text-royal-purple"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Select value={filters.category || ""} onValueChange={(value) => setFilters(prev => ({ ...prev, category: (value || undefined) as CompleteBiblicalExample["category"] }))}>
                <SelectTrigger className="bg-white/10 border-ancient-gold/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {availableFilters.categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.book || ""} onValueChange={(value) => setFilters(prev => ({ ...prev, book: value || undefined }))}>
                <SelectTrigger className="bg-white/10 border-ancient-gold/30">
                  <SelectValue placeholder="Book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Books</SelectItem>
                  {availableFilters.books.map(book => (
                    <SelectItem key={book} value={book}>{book}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.testament || ""} onValueChange={(value) => setFilters(prev => ({ ...prev, testament: value as "Old" | "New" || undefined }))}>
                <SelectTrigger className="bg-white/10 border-ancient-gold/30">
                  <SelectValue placeholder="Testament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Both</SelectItem>
                  <SelectItem value="Old">Old Testament</SelectItem>
                  <SelectItem value="New">New Testament</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.riskLevel || ""} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value as "low" | "medium" | "high" || undefined }))}>
                <SelectTrigger className="bg-white/10 border-ancient-gold/30">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risks</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                className="border-ancient-gold/50 text-ancient-gold hover:bg-ancient-gold/10"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Results */}
        {response && (
          <Tabs defaultValue="answer" className="space-y-6">
            <TabsList className="bg-scripture/40 border border-ancient-gold/50 p-1 w-full">
              <TabsTrigger value="answer" className="data-[state=active]:bg-purple-900/70 text-ancient-gold">
                Primary Answer
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-purple-900/70 text-ancient-gold">
                Biblical Examples
              </TabsTrigger>
              <TabsTrigger value="defi" className="data-[state=active]:bg-purple-900/70 text-ancient-gold">
                DeFi Applications
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-purple-900/70 text-ancient-gold">
                Recommended Actions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="answer">
              <Card className="bg-scripture/40 border-ancient-gold/50">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <BookOpen size={20} />
                    Biblical Wisdom Response
                    <Badge className="bg-ancient-gold text-royal-purple ml-auto">
                      Wisdom Score: {response.wisdomScore}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    {response.primaryAnswer}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-ancient-gold font-semibold mb-3 flex items-center gap-2">
                        <Users size={16} />
                        Related Biblical Characters
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {response.relatedCharacters.map((character, index) => (
                          <Badge key={index} variant="outline" className="border-ancient-gold/50 text-ancient-gold">
                            {character}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-ancient-gold font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Modern Parallels
                      </h4>
                      <ul className="text-white/80 text-sm space-y-1">
                        {response.modernParallels.slice(0, 3).map((parallel, index) => (
                          <li key={index}>• {parallel}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="examples">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {response.relevantExamples.map((example, index) => (
                  <Card key={index} className="bg-scripture/40 border-ancient-gold/50 cursor-pointer hover:bg-scripture/60 transition-colors"
                        onClick={() => handleExampleClick(example)}>
                    <CardHeader>
                      <CardTitle className="text-ancient-gold text-lg">
                        {example.character || example.book}
                      </CardTitle>
                      <p className="text-ancient-gold/70 text-sm">{example.reference}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/90 text-sm mb-3 italic">
                        "{example.text.length > 150 ? example.text.substring(0, 150) + "..." : example.text}"
                      </p>
                      <Separator className="bg-ancient-gold/30 my-3" />
                      <div className="space-y-2">
                        <div>
                          <p className="text-ancient-gold font-medium text-sm">Principle:</p>
                          <p className="text-white/80 text-sm">{example.principle}</p>
                        </div>
                        <div>
                          <p className="text-ancient-gold font-medium text-sm">DeFi Application:</p>
                          <p className="text-white/80 text-sm">{example.defiRelevance}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
                          {example.category}
                        </Badge>
                        {example.riskLevel && (
                          <Badge 
                            className={`
                              ${example.riskLevel === 'low' ? 'bg-green-500/20 text-green-300' : ''}
                              ${example.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                              ${example.riskLevel === 'high' ? 'bg-red-500/20 text-red-300' : ''}
                            `}
                          >
                            {example.riskLevel} risk
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="defi">
              <div className="grid md:grid-cols-2 gap-6">
                {response.defiStrategies.map((strategy, index) => (
                  <Card key={index} className="bg-scripture/40 border-ancient-gold/50">
                    <CardHeader>
                      <CardTitle className="text-ancient-gold flex items-center gap-2">
                        <Shield size={20} />
                        {strategy.protocol}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-ancient-gold font-medium">Recommended Action:</p>
                          <p className="text-white/90">{strategy.action}</p>
                        </div>
                        <div>
                          <p className="text-ancient-gold font-medium">Biblical Basis:</p>
                          <p className="text-white/80 text-sm italic">{strategy.biblicalBasis}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge 
                            className={`
                              ${strategy.riskLevel === 'low' ? 'bg-green-500/20 text-green-300' : ''}
                              ${strategy.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                              ${strategy.riskLevel === 'high' ? 'bg-red-500/20 text-red-300' : ''}
                            `}
                          >
                            {strategy.riskLevel} risk
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="actions">
              <Card className="bg-scripture/40 border-ancient-gold/50">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <Target size={20} />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-ancient-gold font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb size={16} />
                        Practical Applications
                      </h4>
                      <ul className="space-y-2">
                        {response.practicalApplications.map((application, index) => (
                          <li key={index} className="text-white/90 text-sm flex items-start gap-2">
                            <span className="text-ancient-gold mt-1">•</span>
                            {application}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-ancient-gold font-semibold mb-3 flex items-center gap-2">
                        <Target size={16} />
                        Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {response.recommendedActions.map((action, index) => (
                          <li key={index} className="text-white/90 text-sm flex items-start gap-2">
                            <span className="text-ancient-gold mt-1">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Quick Examples */}
        {!response && (
          <Card className="bg-scripture/40 border-ancient-gold/50">
            <CardHeader>
              <CardTitle className="text-ancient-gold">Quick Examples to Explore</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  "Joseph's economic planning during famine",
                  "Solomon's wisdom in business partnerships",
                  "Jesus on money and wealth",
                  "Abraham's tithing to Melchizedek",
                  "Proverbs on investment diversification",
                  "Paul's teachings on work and generosity"
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="border-ancient-gold/50 text-ancient-gold hover:bg-ancient-gold/10 text-left h-auto p-3"
                    onClick={() => {
                      setQuery(example);
                      setTimeout(handleSearch, 100);
                    }}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ComprehensiveWisdomPage;