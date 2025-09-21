import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PixelButton from '@/components/PixelButton';
import { comprehensiveWisdomService, EnhancedWisdomQuery, ComprehensiveWisdomResponse } from '@/services/comprehensiveWisdomService';
import { useSound } from '@/contexts/SoundContext';
import { CompleteBiblicalExample } from '@/data/completeBibleFinances';
import { BookOpen, TrendingUp, Shield, Users, Lightbulb, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComprehensiveWisdomDashboardProps {
  className?: string;
}

export const ComprehensiveWisdomDashboard: React.FC<ComprehensiveWisdomDashboardProps> = ({ className }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [testament, setTestament] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [wisdom, setWisdom] = useState<ComprehensiveWisdomResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { playSound } = useSound();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    playSound('scroll');
    
    try {
      const wisdomQuery: EnhancedWisdomQuery = {
        query: query.trim(),
        category: category as any,
        testament: testament as any,
        riskLevel: riskLevel as any,
        includeModernParallels: true,
        includeDefiRelevance: true
      };

      const result = comprehensiveWisdomService.getComprehensiveWisdom(wisdomQuery);
      setWisdom(result);
      playSound('success');

      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        return updated;
      });

    } catch (error) {
      console.error('Error searching wisdom:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    playSound('select');
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('');
    setTestament('');
    setRiskLevel('');
    setWisdom(null);
  };

  const categories = [
    'wealth', 'giving', 'work', 'stewardship', 'taxes', 'debt', 'contentment', 
    'generosity', 'planning', 'investing', 'business', 'contracts', 'inheritance',
    'property', 'farming', 'trading', 'banking', 'partnerships', 'justice',
    'wages', 'poverty', 'budgeting', 'saving', 'borrowing', 'lending',
    'interest', 'profit', 'loss', 'fraud', 'honesty', 'corruption', 'sharing',
    'greed', 'wisdom', 'investment', 'wealth_warning', 'integrity',
    'divine_provision', 'restoration', 'reconciliation', 'forgiveness', 'redemption'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Search Section */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-primary">Biblical Financial Wisdom</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search for financial wisdom (e.g., investing, tithing, debt...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg"
              />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={testament} onValueChange={setTestament}>
              <SelectTrigger>
                <SelectValue placeholder="Testament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Both Testaments</SelectItem>
                <SelectItem value="Old">Old Testament</SelectItem>
                <SelectItem value="New">New Testament</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <PixelButton 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="bg-primary text-primary-foreground"
            >
              {isSearching ? 'Searching...' : 'Search Wisdom'}
            </PixelButton>
            
            <PixelButton 
              onClick={clearSearch} 
              variant="outline"
            >
              Clear
            </PixelButton>

            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Recent Searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleRecentSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      <AnimatePresence>
        {wisdom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Examples
                </TabsTrigger>
                <TabsTrigger value="defi" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  DeFi
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Applications
                </TabsTrigger>
                <TabsTrigger value="characters" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Characters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Biblical Wisdom Response</h3>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="text-lg font-bold text-primary">
                          Wisdom Score: {wisdom.wisdomScore}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="text-lg leading-relaxed">{wisdom.primaryAnswer}</p>
                    </div>

                    {wisdom.recommendedActions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {wisdom.recommendedActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                <div className="grid gap-4">
                  {wisdom.relevantExamples.map((example, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-lg">{example.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {example.book} {example.chapter}:{example.verses} - {example.character}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant={example.riskLevel === 'low' ? 'default' : example.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                              {example.riskLevel} risk
                            </Badge>
                            <Badge variant="outline">{example.category}</Badge>
                          </div>
                        </div>
                        
                        <blockquote className="border-l-4 border-primary pl-4 italic text-sm">
                          {example.text}
                        </blockquote>
                        
                        <div className="space-y-2">
                          <p><strong>Principle:</strong> {example.principle}</p>
                          <p><strong>Modern Application:</strong> {example.modernApplication}</p>
                          {example.defiRelevance && (
                            <p><strong>DeFi Relevance:</strong> {example.defiRelevance}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="defi" className="space-y-4">
                <div className="grid gap-4">
                  {wisdom.defiStrategies.map((strategy, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-lg">{strategy.protocol}</h4>
                          <Badge variant={strategy.riskLevel === 'low' ? 'default' : strategy.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                            {strategy.riskLevel} risk
                          </Badge>
                        </div>
                        <p><strong>Action:</strong> {strategy.action}</p>
                        <p><strong>Biblical Basis:</strong> {strategy.biblicalBasis}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Practical Applications</h3>
                  <div className="grid gap-3">
                    {wisdom.practicalApplications.map((application, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p>{application}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {wisdom.modernParallels.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Modern Parallels</h3>
                    <div className="grid gap-3">
                      {wisdom.modernParallels.map((parallel, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <p>{parallel}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="characters" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Related Biblical Characters</h3>
                  <div className="flex flex-wrap gap-2">
                    {wisdom.relatedCharacters.map((character, index) => (
                      <Badge key={index} variant="outline" className="text-lg p-2">
                        <Users className="h-4 w-4 mr-1" />
                        {character}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComprehensiveWisdomDashboard;