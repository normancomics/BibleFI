import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Book,
  Heart,
  Calculator,
  TrendingUp,
  Shield,
  Coins,
  Scale,
  Search,
  BookOpen,
  Sparkles
} from 'lucide-react';
import {
  getAllFinancialVerses,
  getVersesByCategory,
  getPrimaryVerses,
  searchVerses,
  type BiblicalFinanceVerse
} from '@/services/comprehensiveBiblicalFinanceDatabase';

const BiblicalFinanceEncyclopediaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allVerses = getAllFinancialVerses();
  const primaryVerses = getPrimaryVerses();

  const displayedVerses = searchTerm
    ? searchVerses(searchTerm)
    : selectedCategory === 'all'
    ? allVerses
    : getVersesByCategory(selectedCategory as any);

  const categories = [
    { id: 'all', label: 'All Verses', icon: BookOpen, color: 'bg-scripture' },
    { id: 'tithing', label: 'Tithing', icon: Heart, color: 'bg-eboy-red' },
    { id: 'taxes', label: 'Taxes', icon: Calculator, color: 'bg-eboy-orange' },
    { id: 'lending', label: 'Lending', icon: Coins, color: 'bg-eboy-green' },
    { id: 'borrowing', label: 'Borrowing', icon: TrendingUp, color: 'bg-eboy-blue' },
    { id: 'stewardship', label: 'Stewardship', icon: Shield, color: 'bg-ancient-gold' },
    { id: 'wealth', label: 'Wealth', icon: Sparkles, color: 'bg-eboy-purple' },
    { id: 'justice', label: 'Justice', icon: Scale, color: 'bg-eboy-pink' },
  ];

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Book;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-scripture';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-scripture/5 to-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="h-12 w-12 text-ancient-gold animate-pulse-glow" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-ancient-gold via-scripture to-eboy-pink bg-clip-text text-transparent">
              Biblical Finance Encyclopedia
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Every mention of finances in Scripture - KJV with original Hebrew, Aramaic & Greek texts.
            <br />
            <span className="text-ancient-gold font-semibold">
              100% Biblically Accurate • Comprehensive • Linked to DeFi Applications
            </span>
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-eboy-red/20 to-red-900/20 border-eboy-red/30">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-eboy-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {getVersesByCategory('tithing').length}
              </div>
              <div className="text-xs text-muted-foreground">Tithing Verses</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-eboy-orange/20 to-orange-900/20 border-eboy-orange/30">
            <CardContent className="p-4 text-center">
              <Calculator className="h-6 w-6 text-eboy-orange mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {getVersesByCategory('taxes').length}
              </div>
              <div className="text-xs text-muted-foreground">Tax Verses</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-ancient-gold/20 to-yellow-900/20 border-ancient-gold/30">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-ancient-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {getVersesByCategory('stewardship').length}
              </div>
              <div className="text-xs text-muted-foreground">Stewardship</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-scripture/20 to-purple-900/20 border-scripture/30">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-scripture mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{allVerses.length}</div>
              <div className="text-xs text-muted-foreground">Total Verses</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-ancient-gold/30">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by verse text, principle, or DeFi application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-ancient-gold/20 focus:border-ancient-gold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={`${
                  selectedCategory === cat.id
                    ? `${cat.color} text-white hover:opacity-90`
                    : 'border-ancient-gold/30 hover:border-ancient-gold'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Verses Display */}
        <div className="space-y-4">
          {displayedVerses.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-ancient-gold/30">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No verses found matching your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            displayedVerses.map((verse, idx) => {
              const CategoryIcon = getCategoryIcon(verse.category);
              const categoryColor = getCategoryColor(verse.category);

              return (
                <Card
                  key={idx}
                  className="bg-card/50 backdrop-blur-sm border-ancient-gold/20 hover:border-ancient-gold/50 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryColor}`}>
                          <CategoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-ancient-gold">
                            {verse.reference}
                          </CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className={`${categoryColor} text-white text-xs`}>
                              {verse.category}
                            </Badge>
                            {verse.importance === 'primary' && (
                              <Badge className="bg-scripture text-white text-xs">
                                ⭐ Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* KJV Text */}
                    <div className="bg-background/50 rounded-lg p-4 border border-ancient-gold/20">
                      <div className="text-xs text-muted-foreground mb-2 font-semibold">
                        King James Version
                      </div>
                      <p className="text-foreground italic leading-relaxed">
                        "{verse.kjv}"
                      </p>
                    </div>

                    {/* Original Languages */}
                    {(verse.hebrew || verse.greek || verse.aramaic) && (
                      <div className="grid md:grid-cols-3 gap-3">
                        {verse.hebrew && (
                          <div className="bg-eboy-purple/10 rounded-lg p-3 border border-eboy-purple/30">
                            <div className="text-xs text-eboy-purple font-semibold mb-1">
                              Hebrew
                            </div>
                            <p className="text-sm text-foreground font-serif" dir="rtl">
                              {verse.hebrew}
                            </p>
                          </div>
                        )}
                        {verse.greek && (
                          <div className="bg-eboy-blue/10 rounded-lg p-3 border border-eboy-blue/30">
                            <div className="text-xs text-eboy-blue font-semibold mb-1">
                              Greek
                            </div>
                            <p className="text-sm text-foreground font-serif">
                              {verse.greek}
                            </p>
                          </div>
                        )}
                        {verse.aramaic && (
                          <div className="bg-eboy-cyan/10 rounded-lg p-3 border border-eboy-cyan/30">
                            <div className="text-xs text-eboy-cyan font-semibold mb-1">
                              Aramaic
                            </div>
                            <p className="text-sm text-foreground font-serif" dir="rtl">
                              {verse.aramaic}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Strong's Numbers */}
                    {verse.strongsNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">
                          Strong's Numbers:
                        </span>
                        {verse.strongsNumbers.map((num) => (
                          <Badge
                            key={num}
                            variant="outline"
                            className="text-xs border-ancient-gold/30"
                          >
                            {num}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Biblical Principle */}
                    <div className="bg-ancient-gold/10 rounded-lg p-4 border border-ancient-gold/30">
                      <div className="text-xs text-ancient-gold font-semibold mb-2">
                        📖 Biblical Principle
                      </div>
                      <p className="text-sm text-foreground">{verse.principle}</p>
                    </div>

                    {/* DeFi Application */}
                    <div className="bg-eboy-green/10 rounded-lg p-4 border border-eboy-green/30">
                      <div className="text-xs text-eboy-green font-semibold mb-2">
                        ⚡ DeFi Application
                      </div>
                      <p className="text-sm text-foreground">{verse.defiApplication}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <Card className="mt-12 bg-gradient-to-br from-scripture/20 to-ancient-gold/20 border-ancient-gold/30">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-ancient-gold mx-auto mb-3" />
            <p className="text-foreground font-semibold mb-2">
              Bible.fi is committed to 100% Biblical accuracy
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Every DeFi feature on this platform is grounded in Scripture. We prioritize tithing
              as the primary biblical financial principle, followed by faithful stewardship,
              honest dealings, and wise investment - all supported by God's Word.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BiblicalFinanceEncyclopediaPage;
