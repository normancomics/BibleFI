import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  DollarSign, 
  Users, 
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeploymentOption {
  name: string;
  cost: string;
  timeframe: string;
  description: string;
  pros: string[];
  cons: string[];
  recommended: boolean;
}

const TokenDeploymentGuide: React.FC = () => {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState('minimal');
  const [treasuryAddress, setTreasuryAddress] = useState('');

  const deploymentOptions: DeploymentOption[] = [
    {
      name: 'Minimal Launch',
      cost: '$200-500',
      timeframe: '1-2 days',
      description: 'Deploy token and create basic liquidity pool',
      pros: [
        'Secures token name immediately',
        'Low upfront cost',
        'Quick to market',
        'Allows price discovery'
      ],
      cons: [
        'Limited initial trading volume',
        'Higher price volatility',
        'Requires manual liquidity management'
      ],
      recommended: true
    },
    {
      name: 'Fair Launch',
      cost: '$50-200',
      timeframe: '3-5 days',
      description: 'Bonding curve mechanism with no initial liquidity needed',
      pros: [
        'No initial capital required',
        'Automatic price discovery',
        'Community-driven growth',
        'Anti-dump mechanics'
      ],
      cons: [
        'Slower initial adoption',
        'More complex smart contracts',
        'Higher gas costs per transaction'
      ],
      recommended: false
    },
    {
      name: 'Community Presale',
      cost: '$0-100',
      timeframe: '1-2 weeks',
      description: 'Raise funds from community before official launch',
      pros: [
        'No personal capital needed',
        'Built-in community',
        'Marketing during presale',
        'Guaranteed initial liquidity'
      ],
      cons: [
        'Regulatory considerations',
        'Longer timeline',
        'Requires strong marketing',
        'Trust building needed'
      ],
      recommended: false
    }
  ];

  const contractDetails = {
    name: 'Bible Finance',
    symbol: 'BIBLE',
    totalSupply: '1,000,000,000',
    network: 'Base Mainnet',
    compiler: 'Solidity 0.8.19',
    features: [
      '10% transaction fee to treasury',
      'Anti-whale protection (2% max)',
      'Burnable tokens',
      'Pausable for emergencies',
      'Wisdom score tracking',
      'Fee-free church donations'
    ]
  };

  const deploymentSteps = [
    {
      step: 1,
      title: 'Deploy Token Contract',
      description: 'Deploy $BIBLE token on Base mainnet',
      cost: '~$5-10',
      timeEstimate: '5 minutes'
    },
    {
      step: 2,
      title: 'Verify Contract',
      description: 'Verify source code on BaseScan',
      cost: 'Free',
      timeEstimate: '10 minutes'
    },
    {
      step: 3,
      title: 'Create Liquidity Pool',
      description: 'Add ETH/BIBLE pair to Uniswap V3',
      cost: '$200-500',
      timeEstimate: '15 minutes'
    },
    {
      step: 4,
      title: 'Lock Liquidity',
      description: 'Lock LP tokens for trust/security',
      cost: '~$10-20',
      timeEstimate: '10 minutes'
    },
    {
      step: 5,
      title: 'Update Website',
      description: 'Add token contract address to dapp',
      cost: 'Free',
      timeEstimate: '30 minutes'
    }
  ];

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard'
    });
  };

  const handleDeploy = () => {
    if (!treasuryAddress) {
      toast({
        title: 'Treasury Address Required',
        description: 'Please enter a treasury address before deploying',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Deployment Started',
      description: 'Preparing to deploy $BIBLE token contract...'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-scripture/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-scripture" />
            $BIBLE Token Deployment Guide
          </CardTitle>
          <p className="text-muted-foreground">
            Step-by-step guide to launch your Bible Finance token on Base chain with minimal capital
          </p>
        </CardHeader>
      </Card>

      <Tabs value={selectedOption} onValueChange={setSelectedOption} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          {deploymentOptions.map((option, index) => (
            <TabsTrigger key={index} value={index === 0 ? 'minimal' : index === 1 ? 'fair' : 'presale'}>
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium">{option.name}</span>
                <span className="text-xs text-muted-foreground">{option.cost}</span>
                {option.recommended && (
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {deploymentOptions.map((option, index) => (
          <TabsContent 
            key={index} 
            value={index === 0 ? 'minimal' : index === 1 ? 'fair' : 'presale'}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{option.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{option.cost}</Badge>
                    <Badge variant="outline">{option.timeframe}</Badge>
                  </div>
                </CardTitle>
                <p className="text-muted-foreground">{option.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-eboy-green mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Advantages
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {option.pros.map((pro, proIndex) => (
                        <li key={proIndex} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-eboy-green"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Considerations
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {option.cons.map((con, conIndex) => (
                        <li key={conIndex} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-destructive"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-ancient-gold" />
            Token Contract Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{contractDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Symbol:</span>
                <span className="font-medium">{contractDetails.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-medium">{contractDetails.totalSupply}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">{contractDetails.network}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <ul className="space-y-1 text-sm">
                {contractDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-eboy-yellow" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-eboy-green" />
            Deployment Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deploymentSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-border/50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-scripture text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-ancient-gold">{step.cost}</div>
                  <div className="text-xs text-muted-foreground">{step.timeEstimate}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Form */}
      <Card className="border-eboy-green/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-eboy-green" />
            Ready to Deploy?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="treasury">Treasury Address (for fees & church partnerships)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="treasury"
                placeholder="0x..."
                value={treasuryAddress}
                onChange={(e) => setTreasuryAddress(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => handleCopyAddress('0x...')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleDeploy} className="flex-1 bg-scripture hover:bg-scripture/90">
              <Rocket className="h-4 w-4 mr-2" />
              Deploy $BIBLE Token
            </Button>
            <Button variant="outline" asChild>
              <a href="https://basescan.org" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                BaseScan
              </a>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Deploy first to secure the name, then add liquidity when ready. 
            The contract can function without liquidity pools.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenDeploymentGuide;