import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Fuel, 
  Blocks, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Clock,
  Server,
  TrendingUp
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSound } from '@/contexts/SoundContext';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface NetworkDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NetworkData {
  gasPrice: string;
  gasPriceGwei: number;
  blockNumber: number;
  rpcLatency: number;
  rpcStatus: 'healthy' | 'degraded' | 'error';
  chainId: number;
  lastUpdated: Date;
}

interface GasHistoryPoint {
  time: string;
  timestamp: number;
  gwei: number;
}

const BASE_RPC = 'https://mainnet.base.org';
const MAX_HISTORY_POINTS = 60; // 1 hour at 1-minute intervals

const NetworkDetailsModal: React.FC<NetworkDetailsModalProps> = ({ open, onOpenChange }) => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [gasHistory, setGasHistory] = useState<GasHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { playSound } = useSound();
  const historyRef = useRef<GasHistoryPoint[]>([]);

  const fetchNetworkData = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      // Fetch gas price
      const gasPriceResponse = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1,
        }),
      });
      
      // Fetch block number
      const blockResponse = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 2,
        }),
      });

      // Fetch chain ID
      const chainIdResponse = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 3,
        }),
      });

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      const gasData = await gasPriceResponse.json();
      const blockData = await blockResponse.json();
      const chainData = await chainIdResponse.json();

      const gasPriceWei = BigInt(gasData.result);
      const gasPriceGwei = Number(gasPriceWei) / 1e9;
      const blockNumber = parseInt(blockData.result, 16);
      const chainId = parseInt(chainData.result, 16);

      let rpcStatus: 'healthy' | 'degraded' | 'error' = 'healthy';
      if (latency > 1000) rpcStatus = 'degraded';
      if (latency > 3000) rpcStatus = 'error';

      const now = new Date();
      
      // Add to gas history
      const newPoint: GasHistoryPoint = {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
        gwei: gasPriceGwei,
      };
      
      historyRef.current = [...historyRef.current, newPoint].slice(-MAX_HISTORY_POINTS);
      setGasHistory([...historyRef.current]);

      setNetworkData({
        gasPrice: gasData.result,
        gasPriceGwei,
        blockNumber,
        rpcLatency: latency,
        rpcStatus,
        chainId,
        lastUpdated: now,
      });

      if (!loading) {
        playSound('success');
      }
    } catch (error) {
      console.error('Failed to fetch network data:', error);
      setNetworkData(prev => prev ? { ...prev, rpcStatus: 'error' } : null);
      playSound('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [playSound, loading]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchNetworkData();
      
      // Auto-refresh every 12 seconds (Base block time)
      const interval = setInterval(fetchNetworkData, 12000);
      return () => clearInterval(interval);
    }
  }, [open, fetchNetworkData]);

  const handleRefresh = () => {
    setRefreshing(true);
    playSound('click');
    fetchNetworkData();
  };

  const getGasPriceLevel = (gwei: number) => {
    if (gwei < 0.01) return { label: 'Very Low', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    if (gwei < 0.05) return { label: 'Low', color: 'text-green-400', bgColor: 'bg-green-400/10' };
    if (gwei < 0.1) return { label: 'Normal', color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
    return { label: 'High', color: 'text-red-500', bgColor: 'bg-red-500/10' };
  };

  const getRpcStatusConfig = (status: 'healthy' | 'degraded' | 'error') => {
    switch (status) {
      case 'healthy':
        return { label: 'Healthy', color: 'text-green-500', icon: CheckCircle, bgColor: 'bg-green-500/10' };
      case 'degraded':
        return { label: 'Degraded', color: 'text-amber-500', icon: AlertCircle, bgColor: 'bg-amber-500/10' };
      case 'error':
        return { label: 'Error', color: 'text-red-500', icon: AlertCircle, bgColor: 'bg-red-500/10' };
    }
  };

  const getAverageGas = () => {
    if (gasHistory.length === 0) return 0;
    return gasHistory.reduce((sum, p) => sum + p.gwei, 0) / gasHistory.length;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border/50 bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-sm">
          <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
          <p className="text-sm font-bold font-mono text-primary">
            {payload[0].value.toFixed(4)} Gwei
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-primary/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Activity className="h-5 w-5 text-primary" />
            Base Network Status
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Gas Price Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border/50 bg-card/50 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Fuel className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gas Price</p>
                  {loading ? (
                    <Skeleton className="h-6 w-24 mt-1" />
                  ) : (
                    <p className="text-xl font-bold font-mono">
                      {networkData?.gasPriceGwei.toFixed(4)} <span className="text-sm text-muted-foreground">Gwei</span>
                    </p>
                  )}
                </div>
              </div>
              {networkData && !loading && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  getGasPriceLevel(networkData.gasPriceGwei).bgColor,
                  getGasPriceLevel(networkData.gasPriceGwei).color
                )}>
                  {getGasPriceLevel(networkData.gasPriceGwei).label}
                </div>
              )}
            </div>
          </motion.div>

          {/* Gas Price History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border/50 bg-card/50 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Gas Price Trend</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Avg: {getAverageGas().toFixed(4)} Gwei</span>
                <span>•</span>
                <span>{gasHistory.length} samples</span>
              </div>
            </div>
            
            {gasHistory.length < 2 ? (
              <div className="h-32 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs">Collecting gas price data...</p>
                  <p className="text-xs">Chart will appear after a few samples</p>
                </div>
              </div>
            ) : (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gasHistory} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(value) => value.toFixed(3)}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine 
                      y={getAverageGas()} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="3 3" 
                      strokeOpacity={0.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="gwei"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Block Number Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/50 bg-card/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Blocks className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest Block</p>
                {loading ? (
                  <Skeleton className="h-6 w-32 mt-1" />
                ) : (
                  <p className="text-xl font-bold font-mono">
                    #{networkData?.blockNumber.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* RPC Health Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border/50 bg-card/50 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-violet-500/10 p-2">
                  <Server className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RPC Health</p>
                  {loading ? (
                    <Skeleton className="h-6 w-20 mt-1" />
                  ) : networkData && (
                    <div className="flex items-center gap-2">
                      {React.createElement(getRpcStatusConfig(networkData.rpcStatus).icon, {
                        className: cn("h-4 w-4", getRpcStatusConfig(networkData.rpcStatus).color)
                      })}
                      <span className={cn("font-medium", getRpcStatusConfig(networkData.rpcStatus).color)}>
                        {getRpcStatusConfig(networkData.rpcStatus).label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {networkData && !loading && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-sm font-mono">{networkData.rpcLatency}ms</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Chain Info Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span>Updated {networkData?.lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Chain ID:</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                {networkData?.chainId || '8453'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* RPC Endpoint Info */}
        <div className="border-t border-border/50 pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Connected to <span className="font-mono text-foreground">mainnet.base.org</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkDetailsModal;
