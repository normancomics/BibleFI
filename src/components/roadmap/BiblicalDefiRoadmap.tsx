
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Zap, 
  Shield, 
  BookOpen, 
  Coins, 
  Church, 
  Receipt, 
  Sprout,
  Users,
  Brain,
  Globe,
  TrendingUp,
  Target
} from 'lucide-react';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  category: 'core' | 'integration' | 'enhancement' | 'deployment';
  biblicalPrinciple?: string;
  technicalDetails: string[];
  businessValue: string;
  priority: 'high' | 'medium' | 'low';
}

const roadmapData: RoadmapItem[] = [
  // COMPLETED ITEMS
  {
    id: 'biblical-database',
    title: 'Comprehensive Biblical Financial Database',
    description: 'Complete database of ALL biblical references to money, wealth, stewardship, and economics',
    status: 'completed',
    category: 'core',
    biblicalPrinciple: 'Every word of God is pure (Proverbs 30:5)',
    technicalDetails: [
      'Categorized verses by financial topic',
      'Rarity classification (common, uncommon, rare, obscure)',
      'Testament and book organization',
      'Searchable by keyword, principle, and application',
      'AI-powered verse recommendations'
    ],
    businessValue: 'Provides unique value proposition - no other platform has comprehensive biblical financial guidance',
    priority: 'high'
  },
  {
    id: 'wisdom-engine',
    title: 'Biblical Wisdom AI Engine',
    description: 'AI system that provides financial guidance based on biblical principles',
    status: 'completed',
    category: 'core',
    biblicalPrinciple: 'The beginning of wisdom is the fear of the LORD (Proverbs 9:10)',
    technicalDetails: [
      'Natural language processing for financial queries',
      'Scripture-based response generation',
      'Contextual wisdom recommendations',
      'DeFi strategy suggestions with biblical rationale',
      'Wisdom score calculation'
    ],
    businessValue: 'Differentiates from secular DeFi platforms through spiritual guidance',
    priority: 'high'
  },
  {
    id: 'farcaster-framework',
    title: 'Farcaster Mini-App Framework',
    description: 'Complete framework for deploying as Farcaster mini-app',
    status: 'completed',
    category: 'integration',
    biblicalPrinciple: 'Go into all the world and preach the gospel (Mark 16:15)',
    technicalDetails: [
      'Frame generation for verse sharing',
      'Farcaster authentication integration',
      'Cast composition for wisdom sharing',
      'Mini-app deployment configuration',
      'Frame state management'
    ],
    businessValue: 'First-mover advantage in faith-based DeFi on Farcaster',
    priority: 'high'
  },
  {
    id: 'daimo-integration',
    title: 'Daimo Payment Integration',
    description: 'Seamless integration with Daimo for crypto payments and tithing',
    status: 'completed',
    category: 'integration',
    biblicalPrinciple: 'Honor the LORD with your wealth (Proverbs 3:9)',
    technicalDetails: [
      'Corrected Daimo API endpoints (pay.daimo.com)',
      'Church donation workflows',
      'Recurring tithe setup',
      'Payment link generation',
      'Biblical tithe calculations'
    ],
    businessValue: 'Enables actual monetary transactions, creating revenue streams',
    priority: 'high'
  },
  {
    id: 'military-security',
    title: 'Military-Grade Security Implementation',
    description: 'Advanced security protocols protecting user data and transactions',
    status: 'completed',
    category: 'core',
    biblicalPrinciple: 'The name of the LORD is a fortified tower (Proverbs 18:10)',
    technicalDetails: [
      'AES-256 encryption for all data',
      'Multi-factor authentication',
      'Zero-knowledge architecture',
      'Real-time threat monitoring',
      'Data integrity verification'
    ],
    businessValue: 'Builds trust with faith-based community concerned about security',
    priority: 'high'
  },

  // IN PROGRESS ITEMS
  {
    id: 'biblical-farming',
    title: 'Biblical Yield Farming Strategies',
    description: 'Curated farming strategies based on biblical stewardship principles',
    status: 'in-progress',
    category: 'core',
    biblicalPrinciple: 'The wise store up choice food and olive oil (Proverbs 21:20)',
    technicalDetails: [
      'Risk-assessed farming pools',
      'Biblical principle matching for each strategy',
      'Automated diversification recommendations',
      'Stewardship-focused yield calculations',
      'Integration with Base chain protocols'
    ],
    businessValue: 'Generates yield for users while maintaining biblical values',
    priority: 'high'
  },
  {
    id: 'wallet-integration',
    title: 'Multi-Wallet Support',
    description: 'Support for Farcaster, Coinbase, Rainbow, and WalletConnect',
    status: 'in-progress',
    category: 'integration',
    biblicalPrinciple: 'Where two or three gather in my name (Matthew 18:20)',
    technicalDetails: [
      'Farcaster wallet integration',
      'Coinbase wallet support',
      'Rainbow wallet connectivity',
      'WalletConnect protocol implementation',
      'Unified wallet interface'
    ],
    businessValue: 'Maximizes user accessibility across different wallet preferences',
    priority: 'high'
  },
  {
    id: 'superfluid-streams',
    title: 'Superfluid Streaming Integration',
    description: 'Automated recurring tithing and investment streams',
    status: 'in-progress',
    category: 'integration',
    biblicalPrinciple: 'Bring the whole tithe into the storehouse (Malachi 3:10)',
    technicalDetails: [
      'Recurring tithe stream setup',
      'DCA investment streams',
      'Ministry support automation',
      'Stream management dashboard',
      'Biblical frequency recommendations'
    ],
    businessValue: 'Creates recurring revenue through automation fees',
    priority: 'medium'
  },

  // PLANNED ITEMS
  {
    id: 'eliza-ai',
    title: 'ElizaOS Integration',
    description: 'Advanced AI agent for biblical financial guidance',
    status: 'planned',
    category: 'enhancement',
    biblicalPrinciple: 'Plans fail for lack of counsel (Proverbs 15:22)',
    technicalDetails: [
      'Autonomous financial agent',
      'Biblical decision-making algorithms',
      'Continuous learning from user interactions',
      'Multi-modal interaction (text, voice, visual)',
      'Proactive financial guidance'
    ],
    businessValue: 'Premium AI advisor service for advanced users',
    priority: 'medium'
  },
  {
    id: 'church-dao',
    title: 'Church DAO Framework',
    description: 'Decentralized autonomous organizations for churches',
    status: 'planned',
    category: 'enhancement',
    biblicalPrinciple: 'Where there is no guidance the people fall (Proverbs 11:14)',
    technicalDetails: [
      'Church governance tokens',
      'Democratic decision-making for church funds',
      'Transparent treasury management',
      'Ministry proposal and voting system',
      'Impact measurement and reporting'
    ],
    businessValue: 'Creates new market category in faith-based DAOs',
    priority: 'low'
  },
  {
    id: 'global-missions',
    title: 'Global Missions Support Network',
    description: 'Direct support for missionaries and global ministries',
    status: 'planned',
    category: 'enhancement',
    biblicalPrinciple: 'How beautiful are the feet of those who bring good news (Romans 10:15)',
    technicalDetails: [
      'Missionary verification system',
      'Direct crypto donations to mission fields',
      'Real-time impact reporting',
      'Cultural adaptation for different regions',
      'Currency conversion and local payment support'
    ],
    businessValue: 'Expands global reach and creates international partnerships',
    priority: 'low'
  },
  {
    id: 'biblical-nfts',
    title: 'Biblical Wisdom NFT Collection',
    description: 'NFTs representing biblical financial principles and achievements',
    status: 'planned',
    category: 'enhancement',
    biblicalPrinciple: 'Faith comes by hearing (Romans 10:17)',
    technicalDetails: [
      'Achievement-based NFT minting',
      'Rare verse collections',
      'Wisdom milestone rewards',
      'Community recognition system',
      'Tradeable wisdom assets'
    ],
    businessValue: 'Creates new revenue stream and community engagement',
    priority: 'low'
  },
  {
    id: 'deployment-base',
    title: 'Production Deployment on Base',
    description: 'Full production deployment with Base chain integration',
    status: 'planned',
    category: 'deployment',
    biblicalPrinciple: 'Commit to the LORD whatever you do (Proverbs 16:3)',
    technicalDetails: [
      'Mainnet contract deployment',
      'Base chain optimization',
      'Production security hardening',
      'Performance monitoring',
      'User onboarding flows'
    ],
    businessValue: 'Goes live with real users and transactions',
    priority: 'high'
  }
];

const BiblicalDefiRoadmap: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredItems = roadmapData.filter(item => {
    return (selectedCategory === 'all' || item.category === selectedCategory) &&
           (selectedStatus === 'all' || item.status === selectedStatus);
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'in-progress':
        return <Clock size={20} className="text-yellow-500" />;
      case 'planned':
        return <Circle size={20} className="text-gray-400" />;
      default:
        return <Circle size={20} className="text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core':
        return <BookOpen size={16} />;
      case 'integration':
        return <Zap size={16} />;
      case 'enhancement':
        return <TrendingUp size={16} />;
      case 'deployment':
        return <Target size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const completedCount = roadmapData.filter(item => item.status === 'completed').length;
  const totalCount = roadmapData.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="bg-black/60 border-ancient-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ancient-gold">
          <Target size={24} />
          BibleFi Development Roadmap
        </CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <div className="w-full bg-black/40 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-ancient-gold to-ancient-gold/80 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-white/70 mt-1">
              {completedCount} of {totalCount} milestones completed ({progressPercentage}%)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          <Button
            variant={selectedCategory === 'core' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('core')}
          >
            Core Features
          </Button>
          <Button
            variant={selectedCategory === 'integration' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('integration')}
          >
            Integrations
          </Button>
          <Button
            variant={selectedCategory === 'enhancement' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('enhancement')}
          >
            Enhancements
          </Button>
          <Button
            variant={selectedCategory === 'deployment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('deployment')}
          >
            Deployment
          </Button>
        </div>

        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-black/40 border-ancient-gold/20 hover:border-ancient-gold/40 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <Badge className={`${getPriorityColor(item.priority)} border text-xs`}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </Badge>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-3">{item.description}</p>
                    
                    {item.biblicalPrinciple && (
                      <div className="bg-scripture/20 p-3 rounded-md mb-3 border border-ancient-gold/30">
                        <p className="text-ancient-gold text-sm italic">"{item.biblicalPrinciple}"</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-ancient-gold mb-1">Technical Implementation:</h4>
                        <ul className="text-xs text-white/70 space-y-1">
                          {item.technicalDetails.map((detail, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-ancient-gold mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-ancient-gold mb-1">Business Value:</h4>
                        <p className="text-xs text-white/70">{item.businessValue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 bg-black/40 p-4 rounded-lg border border-ancient-gold/30">
          <h3 className="text-ancient-gold font-medium mb-3">Value Creation Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
            <div>
              <h4 className="font-medium text-white mb-2">Revenue Streams:</h4>
              <ul className="space-y-1">
                <li>• Transaction fees on biblical farming strategies</li>
                <li>• Premium AI wisdom advisor subscriptions</li>
                <li>• Church DAO setup and management fees</li>
                <li>• NFT minting and marketplace commissions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Competitive Advantages:</h4>
              <ul className="space-y-1">
                <li>• First biblical DeFi platform on Farcaster</li>
                <li>• Comprehensive biblical financial database</li>
                <li>• Military-grade security for faith community</li>
                <li>• AI-powered spiritual financial guidance</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiblicalDefiRoadmap;
