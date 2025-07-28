import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Heart, Coins, Building2, Globe, Users } from 'lucide-react';

interface Grant {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  description: string;
  requirements: string[];
  status: 'available' | 'applied' | 'awarded' | 'closed';
  matchPercentage: number;
  category: string;
  logo: string;
}

const availableGrants: Grant[] = [
  {
    id: '1',
    name: 'Base Ecosystem Grant',
    provider: 'Coinbase',
    amount: '$50,000 - $500,000',
    deadline: '2024-03-15',
    description: 'Supporting innovative DeFi applications built on Base chain that promote financial inclusion and education.',
    requirements: [
      'Built on Base chain',
      'Open source code',
      'Educational component',
      'Clear user adoption strategy'
    ],
    status: 'available',
    matchPercentage: 85,
    category: 'Infrastructure',
    logo: '/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png'
  },
  {
    id: '2',
    name: 'Circle USDC Grant',
    provider: 'Circle',
    amount: '$25,000 - $100,000',
    deadline: '2024-04-01',
    description: 'Supporting projects that increase USDC adoption and utility in innovative ways.',
    requirements: [
      'USDC integration',
      'Real-world utility',
      'User-friendly interface',
      'Compliance with regulations'
    ],
    status: 'available',
    matchPercentage: 90,
    category: 'Payments',
    logo: '/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png'
  },
  {
    id: '3',
    name: 'Gitcoin Public Goods',
    provider: 'Gitcoin',
    amount: '$10,000 - $50,000',
    deadline: '2024-02-28',
    description: 'Funding public goods that benefit the broader crypto and web3 ecosystem.',
    requirements: [
      'Open source',
      'Public benefit',
      'Active community',
      'Measurable impact'
    ],
    status: 'applied',
    matchPercentage: 75,
    category: 'Public Goods',
    logo: '/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png'
  },
  {
    id: '4',
    name: 'Christian Foundation Grant',
    provider: 'Various Foundations',
    amount: '$100,000 - $1,000,000',
    deadline: 'Rolling',
    description: 'Supporting faith-based technology initiatives that advance Christian mission and values.',
    requirements: [
      'Christian mission alignment',
      'Clear impact measurement',
      '501(c)(3) status preferred',
      'Detailed financial plan'
    ],
    status: 'available',
    matchPercentage: 95,
    category: 'Religious',
    logo: '/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png'
  }
];

export const GrantFunding = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [donations, setDonations] = useState({
    total: 1250.75,
    goal: 10000,
    donors: 23
  });

  const categories = ['all', 'Infrastructure', 'Payments', 'Public Goods', 'Religious'];

  const filteredGrants = selectedCategory === 'all' 
    ? availableGrants 
    : availableGrants.filter(grant => grant.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'applied': return 'bg-yellow-600';
      case 'awarded': return 'bg-blue-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const progressPercentage = (donations.total / donations.goal) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Grant Funding & Support</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help us build the future of faith-based DeFi through grants and community donations.
        </p>
      </div>

      {/* Community Donations Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Community Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Raised: ${donations.total.toLocaleString()}</span>
            <span>Goal: ${donations.goal.toLocaleString()}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {donations.donors} supporters
              </span>
              <span>{Math.round(progressPercentage)}% funded</span>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent">
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your donation helps us build biblical financial wisdom tools for the global church.
          </p>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Grants' : category}
          </Button>
        ))}
      </div>

      {/* Grant Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredGrants.map((grant) => (
          <Card key={grant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={grant.logo} alt={grant.provider} className="w-10 h-10 rounded" />
                  <div>
                    <CardTitle className="text-lg">{grant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{grant.provider}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(grant.status)} text-white`}>
                  {grant.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-semibold">{grant.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Deadline:</span>
                  <span className="font-semibold">{grant.deadline}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Match:</span>
                  <Badge variant="secondary">{grant.matchPercentage}%</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{grant.description}</p>

              <div>
                <h4 className="font-semibold mb-2 text-sm">Requirements:</h4>
                <ul className="space-y-1">
                  {grant.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {grant.status === 'available' && (
                  <Button className="flex-1">
                    Apply Now
                  </Button>
                )}
                {grant.status === 'applied' && (
                  <Button variant="outline" className="flex-1" disabled>
                    Application Submitted
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="text-center bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Know of Other Grants?</h3>
            <p className="text-muted-foreground">
              Help us find more funding opportunities that align with our biblical mission.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Suggest Grant
            </Button>
            <Button variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              Partner With Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};