
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

const DefiPortfolio: React.FC = () => {
  const holdings = [
    { token: 'ETH', amount: '2.45', value: '$5,880', change: '+5.2%', positive: true },
    { token: 'USDC', amount: '1,250', value: '$1,250', change: '0%', positive: true },
    { token: 'DAI', amount: '500', value: '$505', change: '+1.0%', positive: true },
    { token: 'WETH', amount: '0.75', value: '$1,796', change: '+4.8%', positive: true }
  ];

  const totalValue = holdings.reduce((sum, holding) => 
    sum + parseFloat(holding.value.replace('$', '').replace(',', '')), 0
  );

  return (
    <div className="space-y-6">
      <Card className="border-scripture/30 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="text-ancient-gold" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-ancient-gold">
              ${totalValue.toLocaleString()}
            </div>
            <div className="flex items-center justify-center gap-1 text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span>+8.7% (24h)</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {holdings.map((holding, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-scripture/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {holding.token}
                  </div>
                  <div>
                    <div className="font-medium">{holding.amount} {holding.token}</div>
                    <div className="text-sm text-white/60">{holding.value}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${holding.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {holding.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="text-sm">{holding.change}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-scripture/30 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="text-ancient-gold" />
            Yield Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
              <div>
                <div className="font-medium">USDC-DAI LP</div>
                <div className="text-sm text-white/60">Stablecoin Pool</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-medium">8.5% APY</div>
                <div className="text-sm text-white/60">$755 deposited</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
              <div>
                <div className="font-medium">ETH-USDC LP</div>
                <div className="text-sm text-white/60">Balanced Pool</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-medium">12.3% APY</div>
                <div className="text-sm text-white/60">$1,200 deposited</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefiPortfolio;
