import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';

interface PriceChartProps {
  fromToken: string;
  toToken: string;
}

type TimeRange = '1H' | '1D' | '1W' | '1M';

const PriceChart: React.FC<PriceChartProps> = ({ fromToken, toToken }) => {
  const { prices, formatPrice, formatChange } = useRealTokenPrices();
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [chartData, setChartData] = useState<{ time: string; price: number }[]>([]);

  const fromPrice = prices[fromToken]?.price || 0;
  const toPrice = prices[toToken]?.price || 1;
  const exchangeRate = fromPrice / toPrice;
  const change24h = (prices[fromToken]?.change24h || 0) - (prices[toToken]?.change24h || 0);

  // Generate simulated historical data based on current price & 24h change
  useEffect(() => {
    if (!exchangeRate) return;

    const points = timeRange === '1H' ? 60 : timeRange === '1D' ? 24 : timeRange === '1W' ? 7 : 30;
    const volatility = timeRange === '1H' ? 0.001 : timeRange === '1D' ? 0.005 : timeRange === '1W' ? 0.02 : 0.05;
    const data: { time: string; price: number }[] = [];
    let currentPrice = exchangeRate * (1 - (change24h / 100));

    for (let i = 0; i < points; i++) {
      const noise = (Math.random() - 0.48) * volatility * currentPrice;
      const trend = ((exchangeRate - currentPrice) / (points - i)) * 0.5;
      currentPrice += noise + trend;
      currentPrice = Math.max(currentPrice * 0.9, Math.min(currentPrice * 1.1, currentPrice));

      let label: string;
      if (timeRange === '1H') label = `${points - i}m`;
      else if (timeRange === '1D') label = `${points - i}h`;
      else if (timeRange === '1W') label = `${points - i}d`;
      else label = `${points - i}d`;

      data.push({ time: label, price: currentPrice });
    }
    data.push({ time: 'Now', price: exchangeRate });
    setChartData(data);
  }, [exchangeRate, timeRange, change24h]);

  const isPositive = change24h >= 0;
  const chartColor = isPositive ? 'hsl(162, 100%, 45%)' : 'hsl(0, 84%, 60%)';

  return (
    <Card className="border-ancient-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {fromToken}/{toToken}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">
                {exchangeRate < 1 ? exchangeRate.toFixed(6) : exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <Badge
                variant={isPositive ? 'default' : 'destructive'}
                className="text-xs"
              >
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {formatChange(change24h)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {(['1H', '1D', '1W', '1M'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={timeRange === range ? 'default' : 'ghost'}
                onClick={() => setTimeRange(range)}
                className={`text-xs h-7 px-2 ${
                  timeRange === range
                    ? 'bg-ancient-gold text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v) => v < 1 ? v.toFixed(4) : v.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                formatter={(value: number) => [
                  value < 1 ? value.toFixed(6) : value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                  `${fromToken}/${toToken}`,
                ]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
