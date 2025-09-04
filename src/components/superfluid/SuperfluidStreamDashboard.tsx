import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuperfluid } from '@/hooks/useSuperfluid';
import { Play, Pause, Square, Edit, Trash2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import SoundEffect from '@/components/SoundEffect';
import { useSound } from '@/contexts/SoundContext';

interface StreamData {
  id: string;
  receiver: string;
  token: string;
  flowRate: string;
  status: 'active' | 'paused' | 'cancelled';
  monthlyAmount: number;
  type: 'tithe' | 'staking' | 'general';
  createdAt: Date;
}

const SuperfluidStreamDashboard: React.FC = () => {
  const { isSoundEnabled } = useSound();
  const [playSound, setPlaySound] = useState<string | null>(null);
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    isConnected, 
    updateFlow, 
    deleteFlow, 
    getAvailableTokens,
    calculateFlowRateFromPeriod 
  } = useSuperfluid();

  const mockStreams: StreamData[] = [
    {
      id: '1',
      receiver: '0x1234...5678',
      token: 'USDC',
      flowRate: '38580246913580', // ~$100/month
      status: 'active',
      monthlyAmount: 100,
      type: 'tithe',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2', 
      receiver: '0x5678...9012',
      token: 'DAI',
      flowRate: '19290123456790', // ~$50/month
      status: 'active',
      monthlyAmount: 50,
      type: 'staking',
      createdAt: new Date('2024-02-01')
    },
    {
      id: '3', 
      receiver: '0x9012...3456',
      token: 'WETH',
      flowRate: '9645061728395', // ~$25/month
      status: 'paused',
      monthlyAmount: 25,
      type: 'general',
      createdAt: new Date('2024-03-01')
    }
  ];

  useEffect(() => {
    // Simulate loading streams
    setTimeout(() => {
      setStreams(mockStreams);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handlePlaySound = (soundType: string) => {
    if (isSoundEnabled) {
      setPlaySound(soundType);
      setTimeout(() => setPlaySound(null), 300);
    }
  };

  const handlePauseStream = async (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    handlePlaySound('click');
    const result = await updateFlow(stream.receiver, stream.token, '0');
    
    if (result.success) {
      setStreams(prev => prev.map(s => 
        s.id === streamId ? { ...s, status: 'paused' as const } : s
      ));
      toast.success('Stream paused successfully');
    }
  };

  const handleResumeStream = async (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    handlePlaySound('powerup');
    const result = await updateFlow(stream.receiver, stream.token, stream.flowRate);
    
    if (result.success) {
      setStreams(prev => prev.map(s => 
        s.id === streamId ? { ...s, status: 'active' as const } : s
      ));
      toast.success('Stream resumed successfully');
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    handlePlaySound('error');
    const result = await deleteFlow(stream.receiver, stream.token);
    
    if (result.success) {
      setStreams(prev => prev.filter(s => s.id !== streamId));
      toast.success('Stream deleted successfully');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tithe': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'staking': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'general': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTokenImageId = (token: string) => {
    const tokenIds: Record<string, string> = {
      'USDC': '6319',
      'DAI': '9956', 
      'USDT': '325',
      'WETH': '2518',
      'ETH': '279',
      'WBTC': '7598',
      'cbBTC': '33052',
      'cbETH': '27008'
    };
    return tokenIds[token] || '279';
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Superfluid Stream Dashboard</CardTitle>
          <CardDescription className="text-center">
            Connect your wallet to view and manage your streams
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Superfluid Stream Dashboard</CardTitle>
          </div>
          <CardDescription>
            Monitor and manage your active Superfluid money streams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background/50 p-4 rounded-lg border border-primary/10">
              <div className="text-sm text-muted-foreground">Active Streams</div>
              <div className="text-2xl font-bold text-primary">
                {streams.filter(s => s.status === 'active').length}
              </div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-primary/10">
              <div className="text-sm text-muted-foreground">Monthly Outflow</div>
              <div className="text-2xl font-bold text-green-400">
                ${streams.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthlyAmount, 0)}
              </div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-primary/10">
              <div className="text-sm text-muted-foreground">Total Streams</div>
              <div className="text-2xl font-bold text-blue-400">
                {streams.length}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No streams found. Create your first stream to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {streams.map((stream) => (
                <Card key={stream.id} className="bg-background/30 border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(stream.status)}>
                            {stream.status}
                          </Badge>
                          <Badge className={getTypeColor(stream.type)}>
                            {stream.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <img 
                              src={`https://assets.coingecko.com/coins/images/${getTokenImageId(stream.token)}/small/${stream.token.toLowerCase()}.png`}
                              alt={stream.token}
                              className="w-4 h-4 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/coin-pixel.png';
                              }}
                            />
                            <span className="text-sm text-muted-foreground font-medium">
                              {stream.token}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Receiver</div>
                            <div className="font-mono text-sm">{stream.receiver}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Monthly Amount</div>
                            <div className="font-bold text-lg">${stream.monthlyAmount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Created</div>
                            <div className="text-sm">{stream.createdAt.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {stream.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseStream(stream.id)}
                            className="border-yellow-500/30 hover:bg-yellow-500/20"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : stream.status === 'paused' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeStream(stream.id)}
                            className="border-green-500/30 hover:bg-green-500/20"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStream(stream.id)}
                          className="border-red-500/30 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {playSound && (
        <SoundEffect
          src={`/sounds/${playSound}.mp3`}
          play={true}
          volume={0.5}
          onEnded={() => setPlaySound(null)}
        />
      )}
    </div>
  );
};

export default SuperfluidStreamDashboard;