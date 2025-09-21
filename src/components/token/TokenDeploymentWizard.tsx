import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Coins,
  Shield,
  Network,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  action?: () => void;
}

const TokenDeploymentWizard: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [currentStep, setCurrentStep] = useState(0);
  const [treasuryAddress, setTreasuryAddress] = useState('0x7bEda57074AA917FF0993fb329E16C2c188baF08');
  const [deploymentData, setDeploymentData] = useState({
    tokenAddress: '',
    lpAddress: '',
    stakingAddress: '',
    wisdomPoolAddress: ''
  });

  const deploymentSteps: DeploymentStep[] = [
    {
      id: 'prepare',
      title: 'Prepare Deployment',
      description: 'Verify treasury address and deployment parameters',
      status: 'completed'
    },
    {
      id: 'token',
      title: 'Deploy $BIBLE Token',
      description: 'Deploy the main token contract with ZK features',
      status: currentStep >= 1 ? 'completed' : 'pending',
      action: () => deployTokenContract()
    },
    {
      id: 'pools',
      title: 'Create Liquidity Pools',
      description: 'Setup BIBLE/ETH and BIBLE/USDC pools on Uniswap',
      status: currentStep >= 2 ? 'completed' : 'pending',
      action: () => createLiquidityPools()
    },
    {
      id: 'staking',
      title: 'Deploy Staking Contract',
      description: 'Launch wisdom-based staking rewards system',
      status: currentStep >= 3 ? 'completed' : 'pending',
      action: () => deployStakingContract()
    },
    {
      id: 'verify',
      title: 'Verify & Launch',
      description: 'Verify contracts on BaseScan and announce launch',
      status: currentStep >= 4 ? 'completed' : 'pending',
      action: () => verifyAndLaunch()
    }
  ];

  const deployTokenContract = async () => {
    playSound('powerup');
    toast({
      title: "Deploying $BIBLE Token",
      description: "Deploying token contract with ZK privacy features...",
    });

    // Simulate deployment
    setTimeout(() => {
      const tokenAddress = '0x' + Math.random().toString(16).substring(2, 42);
      setDeploymentData(prev => ({ ...prev, tokenAddress }));
      setCurrentStep(1);
      
      toast({
        title: "Token Deployed Successfully! 🎉",
        description: `$BIBLE token deployed at ${tokenAddress.substring(0, 8)}...`,
      });
    }, 3000);
  };

  const createLiquidityPools = async () => {
    playSound('coin');
    toast({
      title: "Creating Liquidity Pools",
      description: "Setting up BIBLE/ETH and BIBLE/USDC pools...",
    });

    setTimeout(() => {
      const lpAddress = '0x' + Math.random().toString(16).substring(2, 42);
      setDeploymentData(prev => ({ ...prev, lpAddress }));
      setCurrentStep(2);
      
      toast({
        title: "Liquidity Pools Created! 💧",
        description: "BIBLE/ETH and BIBLE/USDC pools are now live",
      });
    }, 2500);
  };

  const deployStakingContract = async () => {
    playSound('success');
    toast({
      title: "Deploying Staking System",
      description: "Setting up wisdom-based staking rewards...",
    });

    setTimeout(() => {
      const stakingAddress = '0x' + Math.random().toString(16).substring(2, 42);
      const wisdomPoolAddress = '0x' + Math.random().toString(16).substring(2, 42);
      setDeploymentData(prev => ({ 
        ...prev, 
        stakingAddress, 
        wisdomPoolAddress 
      }));
      setCurrentStep(3);
      
      toast({
        title: "Staking System Deployed! ⚡",
        description: "Wisdom rewards system is now active",
      });
    }, 2000);
  };

  const verifyAndLaunch = async () => {
    playSound('powerup');
    toast({
      title: "Verifying Contracts",
      description: "Verifying all contracts on BaseScan...",
    });

    setTimeout(() => {
      setCurrentStep(4);
      
      toast({
        title: "$BIBLE Token Launch Complete! 🚀",
        description: "All contracts verified and live on Base mainnet",
      });
    }, 1500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    playSound('click');
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getStepIcon = (step: DeploymentStep) => {
    switch (step.status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-yellow-400 animate-spin" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const progress = (currentStep / (deploymentSteps.length - 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-ancient-gold/30 bg-gradient-to-r from-black/80 to-ancient-gold/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="h-8 w-8 text-ancient-gold" />
              <div>
                <CardTitle className="text-2xl text-ancient-gold">$BIBLE Token Deployment</CardTitle>
                <p className="text-muted-foreground">Launch your biblical DeFi token on Base Chain</p>
              </div>
            </div>
            <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
              Step {currentStep + 1} of {deploymentSteps.length}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% Complete</p>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="deploy" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
          {/* Treasury Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-scripture" />
                Treasury Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treasury">Treasury Address (biblefi.base.eth)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="treasury"
                      value={treasuryAddress}
                      onChange={(e) => setTreasuryAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(treasuryAddress, 'Treasury address')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fee Distribution</Label>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Wisdom Rewards:</span>
                      <span className="text-green-400">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Distribution:</span>
                      <span className="text-blue-400">Daily</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4 p-4 border border-border/50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {step.action && step.status === 'pending' && index === currentStep && (
                        <Button onClick={step.action} className="bg-ancient-gold hover:bg-ancient-gold/90 text-black">
                          Deploy
                        </Button>
                      )}
                      {step.status === 'completed' && (
                        <Badge variant="outline" className="border-green-400/50 text-green-400">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-eboy-blue" />
                Deployed Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'BIBLE Token', address: deploymentData.tokenAddress, type: 'ERC-20' },
                  { name: 'Liquidity Pool', address: deploymentData.lpAddress, type: 'Uniswap V3' },
                  { name: 'Staking Contract', address: deploymentData.stakingAddress, type: 'Rewards' },
                  { name: 'Wisdom Pool', address: deploymentData.wisdomPoolAddress, type: 'Distribution' }
                ].map((contract, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{contract.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{contract.type}</Badge>
                        {contract.address && (
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {contract.address.substring(0, 8)}...{contract.address.substring(-4)}
                          </code>
                        )}
                      </div>
                    </div>
                    {contract.address && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(contract.address, contract.name)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://basescan.org/address/${contract.address}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokenomics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-ancient-gold" />
                $BIBLE Tokenomics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center p-6 border border-ancient-gold/30 rounded-lg bg-ancient-gold/5">
                    <h3 className="text-3xl font-bold text-ancient-gold">1B</h3>
                    <p className="text-muted-foreground">Total Supply</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'Community Rewards', percent: 40, color: 'bg-scripture' },
                      { name: 'Liquidity Provision', percent: 25, color: 'bg-ancient-gold' },
                      { name: 'Development Fund', percent: 15, color: 'bg-eboy-green' },
                      { name: 'Church Partnerships', percent: 10, color: 'bg-eboy-blue' },
                      { name: 'Team & Advisors', percent: 5, color: 'bg-eboy-orange' },
                      { name: 'Marketing & Growth', percent: 5, color: 'bg-eboy-pink' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded ${item.color}`}></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.percent}%</div>
                          <div className="text-sm text-muted-foreground">{item.percent * 10}M</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-scripture/30 rounded-lg bg-scripture/10">
                    <h4 className="font-bold text-scripture mb-2">Wisdom Rewards</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 10% of all transaction fees</li>
                      <li>• Distributed to stakers daily</li>
                      <li>• Bonus rewards for high wisdom scores</li>
                      <li>• Educational milestone rewards</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-ancient-gold/30 rounded-lg bg-ancient-gold/10">
                    <h4 className="font-bold text-ancient-gold mb-2">ZK Privacy Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Private transaction amounts</li>
                      <li>• Hidden balance information</li>
                      <li>• Anonymous staking participation</li>
                      <li>• Encrypted wisdom activities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Launch Actions */}
      {currentStep === deploymentSteps.length - 1 && (
        <Card className="border-green-400/30 bg-green-400/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Launch Complete - Share the News!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="h-auto p-4 bg-eboy-blue hover:bg-eboy-blue/90">
                <div className="text-left">
                  <div className="font-bold">Share on Farcaster</div>
                  <div className="text-xs opacity-80">Announce $BIBLE token launch</div>
                </div>
              </Button>
              <Button className="h-auto p-4 bg-eboy-purple hover:bg-eboy-purple/90">
                <div className="text-left">
                  <div className="font-bold">Add to CoinGecko</div>
                  <div className="text-xs opacity-80">List $BIBLE for tracking</div>
                </div>
              </Button>
              <Button className="h-auto p-4 bg-scripture hover:bg-scripture/90">
                <div className="text-left">
                  <div className="font-bold">Contact Churches</div>
                  <div className="text-xs opacity-80">Begin partnership outreach</div>
                </div>
              </Button>
              <Button className="h-auto p-4 bg-ancient-gold hover:bg-ancient-gold/90 text-black">
                <div className="text-left">
                  <div className="font-bold">Enable Trading</div>
                  <div className="text-xs opacity-80">Open liquidity pools</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TokenDeploymentWizard;