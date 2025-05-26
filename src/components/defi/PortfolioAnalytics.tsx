
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, PieChart, BarChart3, AlertTriangle } from "lucide-react";

interface PortfolioData {
  totalValue: string;
  dailyChange: string;
  weeklyChange: string;
  monthlyChange: string;
  allocation: {
    tokens: number;
    liquidity: number;
    staking: number;
    lending: number;
  };
  riskScore: number;
  diversificationScore: number;
}

interface PortfolioAnalyticsProps {
  data: PortfolioData;
}

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ data }) => {
  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-400";
    if (score < 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getChangeColor = (change: string) => {
    return change.startsWith('+') ? "text-green-400" : "text-red-400";
  };

  const getChangeIcon = (change: string) => {
    return change.startsWith('+') ? TrendingUp : TrendingDown;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Portfolio Value */}
      <Card className="border border-ancient-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-ancient-gold">${data.totalValue}</p>
              <p className="text-sm text-white/60">Total Portfolio</p>
            </div>
            <div className="space-y-1">
              {[
                { label: "24h", value: data.dailyChange },
                { label: "7d", value: data.weeklyChange },
                { label: "30d", value: data.monthlyChange }
              ].map((period) => {
                const Icon = getChangeIcon(period.value);
                return (
                  <div key={period.label} className="flex justify-between items-center">
                    <span className="text-xs text-white/60">{period.label}</span>
                    <div className={`flex items-center gap-1 ${getChangeColor(period.value)}`}>
                      <Icon size={12} />
                      <span className="text-xs font-medium">{period.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card className="border border-scripture/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChart size={18} />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Tokens", value: data.allocation.tokens, color: "bg-blue-500" },
              { label: "Liquidity", value: data.allocation.liquidity, color: "bg-green-500" },
              { label: "Staking", value: data.allocation.staking, color: "bg-purple-500" },
              { label: "Lending", value: data.allocation.lending, color: "bg-yellow-500" }
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className="border border-amber-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 size={18} />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Portfolio Risk</span>
                <Badge className={`${getRiskColor(data.riskScore)} bg-black/30 border-current`}>
                  {data.riskScore < 30 ? 'Low' : data.riskScore < 70 ? 'Medium' : 'High'}
                </Badge>
              </div>
              <Progress value={data.riskScore} className="h-2" />
              <p className="text-xs text-white/60 mt-1">{data.riskScore}/100</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Diversification</span>
                <span className={`text-sm font-medium ${data.diversificationScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {data.diversificationScore}%
                </span>
              </div>
              <Progress value={data.diversificationScore} className="h-2" />
            </div>

            <div className="bg-black/30 p-3 rounded border border-ancient-gold/20">
              <div className="flex items-center gap-2 text-ancient-gold mb-1">
                <AlertTriangle size={12} />
                <span className="text-xs font-medium">Biblical Wisdom</span>
              </div>
              <p className="text-xs italic text-white/80">
                "Do not put all your eggs in one basket. Divide your portion to seven, or even to eight, for you do not know what misfortune may occur on the earth."
              </p>
              <p className="text-xs text-ancient-gold/70 text-right mt-1">Ecclesiastes 11:2</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioAnalytics;
