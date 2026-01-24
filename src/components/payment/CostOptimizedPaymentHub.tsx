import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Zap, 
  Shield, 
  TrendingDown,
  Calculator,
  Globe,
  Smartphone,
  Clock,
  Nfc
} from 'lucide-react';
import OpenSourcePaymentService from '@/services/openSourcePaymentService';
import { useToast } from '@/hooks/use-toast';
import BasePayTithe from './BasePayTithe';

const CostOptimizedPaymentHub: React.FC = () => {
  const { toast } = useToast();
  const [monthlyVolume, setMonthlyVolume] = useState<number>(1000);
  
  const freeMethods = OpenSourcePaymentService.getFreeMethods();
  const lowCostMethods = OpenSourcePaymentService.getLowCostMethods();
  const savings = OpenSourcePaymentService.calculateSavings(monthlyVolume);
  const openBankingProviders = OpenSourcePaymentService.getOpenBankingProviders();

  const getCostBadge = (cost: string) => {
    switch (cost) {
      case 'free':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">FREE</Badge>;
      case 'gas_only':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">~$0.01</Badge>;
      case 'low':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Low Cost</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crypto':
        return <DollarSign className="h-5 w-5" />;
      case 'stablecoin':
        return <Shield className="h-5 w-5" />;
      case 'lightning':
        return <Zap className="h-5 w-5" />;
      case 'open_banking':
        return <Globe className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cost Savings Calculator */}
      <Card className="border-green-400/30 bg-green-400/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-400" />
            Cost Savings Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Monthly Payment Volume ($)</label>
            <input 
              type="number"
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-white/20 rounded-lg bg-black/50 text-white"
              placeholder="1000"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                ${savings.stripeAnnualCost.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Stripe Annual Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${savings.baseCost.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Base Chain Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                ${savings.annualSavings.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Annual Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {savings.percentSaved.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cost Reduction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="base-pay" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="base-pay" className="gap-1">
            <Nfc className="h-3 w-3" />
            Base Pay
          </TabsTrigger>
          <TabsTrigger value="free">Free Methods</TabsTrigger>
          <TabsTrigger value="low-cost">Low Cost</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
        </TabsList>

        <TabsContent value="base-pay" className="space-y-4">
          <BasePayTithe 
            recipientName="Your Church"
            testnet={true}
          />
          
          {/* burner.pro Integration Info */}
          <Card className="border-blue-400/30 bg-blue-400/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5 text-blue-400" />
                burner.pro Terminal Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Base Pay is designed for seamless integration with burner.pro physical terminals, 
                enabling tap-to-tithe experiences in churches.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Supported Now:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• USDC (Primary)</li>
                    <li>• DAI, USDT</li>
                    <li>• ETH, WETH</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Coming Soon:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• $BIBLEFI token</li>
                    <li>• $WISDOM token</li>
                    <li>• cbBTC, USD1, NERITE</li>
                  </ul>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                <Nfc className="mr-2 h-4 w-4" />
                Connect burner.pro Terminal (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="free" className="space-y-4">
          <div className="grid gap-4">
            {freeMethods.map((method) => (
              <Card key={method.id} className="border-green-400/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {getTypeIcon(method.type)}
                      {method.name}
                    </CardTitle>
                    {getCostBadge(method.cost)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {method.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" variant="outline">
                    Set Up {method.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low-cost" className="space-y-4">
          <div className="grid gap-4">
            {lowCostMethods.map((method) => (
              <Card key={method.id} className="border-blue-400/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {getTypeIcon(method.type)}
                      {method.name}
                    </CardTitle>
                    {getCostBadge(method.cost)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {method.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" variant={method.supported ? "default" : "outline"}>
                    {method.supported ? `Configure ${method.name}` : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alternatives" className="space-y-4">
          <div className="space-y-4">
            {Object.entries(OpenSourcePaymentService.FREE_ALTERNATIVES).map(([service, alt]) => (
              <Card key={service} className="border-purple-400/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-purple-400" />
                      Alternative to {service.charAt(0).toUpperCase() + service.slice(1)}
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Save {alt.savings}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-green-400">Recommended: {alt.alternative}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alt.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-yellow-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-yellow-400" />
                Open Banking Providers (Free Tiers)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {openBankingProviders.map((provider, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{provider.name}</h4>
                      <Badge variant="outline">{provider.cost}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Regions: {provider.regions.join(', ')}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {provider.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Guide */}
      <Card className="border-blue-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Implementation Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Phase 1:</span>
              <span className="text-sm">Base Pay tap-to-tithe (USDC, instant)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="font-medium">Phase 2:</span>
              <span className="text-sm">burner.pro physical terminal integration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="font-medium">Phase 3:</span>
              <span className="text-sm">Multi-token support (DAI, USDT, ETH, cbBTC)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="font-medium">Phase 4:</span>
              <span className="text-sm">$BIBLEFI & $WISDOM token integration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span className="font-medium">Phase 5:</span>
              <span className="text-sm">Superfluid streams for recurring donations</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostOptimizedPaymentHub;