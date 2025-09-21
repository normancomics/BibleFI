import React from 'react';
import { ComprehensiveWisdomDashboard } from '@/components/wisdom/ComprehensiveWisdomDashboard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BookOpen, TrendingUp, Users, Lightbulb, Target, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const EnhancedWisdomPage = () => {
  const featuredWisdomTopics = [
    {
      topic: "Investing Wisdom",
      description: "Biblical principles for wise investing and wealth building",
      icon: TrendingUp,
      examples: ["Solomon's trading empire", "Joseph's economic planning", "Parable of the talents"],
      color: "text-green-500"
    },
    {
      topic: "Stewardship Principles", 
      description: "Managing resources as faithful stewards of God's blessings",
      icon: Crown,
      examples: ["Faithful steward parable", "David's temple preparations", "Lydia's business"],
      color: "text-blue-500"
    },
    {
      topic: "Generous Giving",
      description: "Biblical guidance on tithing, offerings, and charitable giving",
      icon: Target,
      examples: ["Widow's mite", "Macedonian churches", "Malachi's tithing test"],
      color: "text-purple-500"
    },
    {
      topic: "Debt & Lending",
      description: "Wise approaches to borrowing, lending, and debt management",
      icon: Users,
      examples: ["Jubilee year", "Good Samaritan", "Nehemiah's reforms"],
      color: "text-orange-500"
    }
  ];

  const bibleStats = [
    { label: "Total Financial Examples", value: "500+", description: "From Genesis to Revelation" },
    { label: "Old Testament Books", value: "39", description: "With financial wisdom" },
    { label: "New Testament Books", value: "27", description: "Including parables" },
    { label: "Key Characters", value: "100+", description: "With financial stories" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Biblical Financial Wisdom
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover comprehensive financial guidance from every book of the Bible. 
            From Genesis to Revelation, explore timeless principles for modern DeFi and traditional finance.
          </p>

          {/* Bible Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {bibleStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-4 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm font-semibold">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Separator className="my-8" />

        {/* Featured Topics */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-2">Featured Wisdom Topics</h2>
            <p className="text-muted-foreground">Explore key areas of biblical financial wisdom</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredWisdomTopics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="p-6 h-full bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-8 w-8 ${topic.color} flex-shrink-0 mt-1`} />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{topic.topic}</h3>
                          <p className="text-muted-foreground">{topic.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Key Examples:</p>
                        <div className="flex flex-wrap gap-1">
                          {topic.examples.map((example, exIndex) => (
                            <Badge key={exIndex} variant="outline" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <Separator className="my-8" />

        {/* Main Wisdom Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-2">Comprehensive Wisdom Search</h2>
            <p className="text-muted-foreground">
              Search through the complete biblical financial database with advanced filtering and modern applications
            </p>
          </div>

          <ComprehensiveWisdomDashboard />
        </motion.section>

        {/* Footer Information */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center space-y-4">
              <Lightbulb className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">About Biblical Financial Wisdom</h3>
              <div className="max-w-4xl mx-auto space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  This comprehensive database contains over 500 financial examples, principles, and stories from every book of the Bible. 
                  Each example includes the original scripture, the underlying principle, modern applications, and specific relevance to DeFi and cryptocurrency.
                </p>
                <p className="leading-relaxed">
                  From Solomon's international trading empire to Jesus' parables about stewardship, from Joseph's economic planning to Paul's teachings on generosity, 
                  discover how ancient wisdom applies to modern financial decisions and blockchain technology.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline">39 Old Testament Books</Badge>
                  <Badge variant="outline">27 New Testament Books</Badge>
                  <Badge variant="outline">100+ Biblical Characters</Badge>
                  <Badge variant="outline">25+ Financial Categories</Badge>
                  <Badge variant="outline">DeFi Applications</Badge>
                  <Badge variant="outline">Risk Assessments</Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

      </div>
    </div>
  );
};

export default EnhancedWisdomPage;