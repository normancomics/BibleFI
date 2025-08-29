import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  change24h: number;
  staked: number;
  lending: number;
  tithing: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue,
  change24h,
  staked,
  lending,
  tithing
}) => {
  const isPositive = change24h >= 0;

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Portfolio</h2>
            <p className="text-muted-foreground text-sm">Track your biblical DeFi investments</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-card-foreground">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{change24h.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm font-medium text-card-foreground">
              ${staked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Staked</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-card-foreground">
              ${lending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Lending</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-card-foreground">
              ${tithing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Tithed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;