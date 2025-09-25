import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, DollarSign, Clock, TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/contexts/SoundContext';
import { toast } from '@/components/ui/use-toast';

interface Church {
  id: string;
  name: string;
  denomination: string;
  city: string;
  country: string;
  cryptoAddress?: string;
  acceptsCrypto: boolean;
  verified: boolean;
  rating: number;
}

interface TitheStream {
  id: string;
  churchName: string;
  amount: string;
  frequency: string;
  totalStreamed: string;
  status: 'active' | 'paused' | 'completed';
}

const EnhancedStreamingTithe: React.FC = () => {
  const { playSound } = useSound();
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [titheAmount, setTitheAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeStreams, setActiveStreams] = useState<TitheStream[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app this would come from Supabase
  useEffect(() => {
    const mockChurches: Church[] = [
      {
        id: '1',
        name: 'Grace Community Church',
        denomination: 'Baptist',
        city: 'Dallas',
        country: 'USA',
        cryptoAddress: '0x742d35Cc0F8E5b5C8b5B5B5B5B5B5B5B5B5B5B5B',
        acceptsCrypto: true,
        verified: true,
        rating: 4.8
      },
      {
        id: '2',
        name: 'New Life Fellowship',
        denomination: 'Pentecostal',
        city: 'Austin',
        country: 'USA',
        cryptoAddress: '0x853e46Dd1F9F6c6D9c6D9c6D9c6D9c6D9c6D9c6D',
        acceptsCrypto: true,
        verified: true,
        rating: 4.9
      },
      {
        id: '3',
        name: 'St. Mary Catholic Church',
        denomination: 'Catholic',
        city: 'New York',
        country: 'USA',
        acceptsCrypto: false,
        verified: true,
        rating: 4.7
      }
    ];
    setChurches(mockChurches);
  }, []);

  const filteredChurches = churches.filter(church =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartStream = async () => {
    if (!selectedChurch || !titheAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a church and enter an amount",
        variant: "destructive"
      });
      return;
    }

    playSound('success');
    setIsStreaming(true);

    // Simulate stream creation
    setTimeout(() => {
      const newStream: TitheStream = {
        id: Date.now().toString(),
        churchName: selectedChurch.name,
        amount: titheAmount,
        frequency,
        totalStreamed: '0',
        status: 'active'
      };

      setActiveStreams(prev => [...prev, newStream]);
      setIsStreaming(false);
      
      toast({
        title: "Stream Started! 🙏",
        description: `Now streaming $${titheAmount} ${frequency} to ${selectedChurch.name}`,
      });

      // Reset form
      setTitheAmount('');
      setSelectedChurch(null);
    }, 2000);
  };

  const pauseStream = (streamId: string) => {
    playSound('click');
    setActiveStreams(prev =>
      prev.map(stream =>
        stream.id === streamId
          ? { ...stream, status: stream.status === 'active' ? 'paused' : 'active' }
          : stream
      )
    );
  };

  const calculateMonthlyTotal = () => {
    return activeStreams
      .filter(stream => stream.status === 'active')
      .reduce((total, stream) => {
        const amount = parseFloat(stream.amount) || 0;
        const multiplier = stream.frequency === 'weekly' ? 4.33 : 
                          stream.frequency === 'daily' ? 30 : 1;
        return total + (amount * multiplier);
      }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ancient-gold to-yellow-600 bg-clip-text text-transparent mb-2">
          Digital Tithing & Streaming
        </h2>
        <p className="text-muted-foreground">
          "Bring the whole tithe into the storehouse" - Malachi 3:10
        </p>
      </motion.div>

      {/* Active Streams Summary */}
      {activeStreams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-r from-ancient-gold/10 to-yellow-600/10 border-ancient-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ancient-gold">
                <TrendingUp className="h-5 w-5" />
                Your Active Tithing Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ancient-gold">{activeStreams.length}</div>
                  <div className="text-sm text-muted-foreground">Active Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-eboy-green">${calculateMonthlyTotal().toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Monthly Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ancient-purple">
                    ${activeStreams.reduce((sum, s) => sum + parseFloat(s.totalStreamed || '0'), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Streamed</div>
                </div>
              </div>

              <div className="space-y-2">
                {activeStreams.map((stream) => (
                  <div key={stream.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div>
                      <div className="font-medium">{stream.churchName}</div>
                      <div className="text-sm text-muted-foreground">
                        ${stream.amount} {stream.frequency} • ${stream.totalStreamed} streamed
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        stream.status === 'active' ? 'bg-eboy-green' : 'bg-yellow-500'
                      }`} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseStream(stream.id)}
                      >
                        {stream.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create New Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-ancient-gold" />
            Start New Tithe Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Church Search */}
          <div className="space-y-2">
            <Label htmlFor="church-search">Search Churches</Label>
            <Input
              id="church-search"
              placeholder="Search by name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Church Selection */}
          <div className="space-y-2">
            <Label>Select Church</Label>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filteredChurches.map((church) => (
                <motion.div
                  key={church.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedChurch?.id === church.id
                      ? 'border-ancient-gold bg-ancient-gold/10'
                      : 'border-border hover:border-ancient-gold/50'
                  }`}
                  onClick={() => {
                    setSelectedChurch(church);
                    playSound('click');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {church.name}
                        {church.verified && <CheckCircle className="h-4 w-4 text-eboy-green" />}
                        {!church.acceptsCrypto && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {church.denomination} • {church.city}, {church.country}
                      </div>
                      {!church.acceptsCrypto && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Fiat conversion required - additional fees may apply
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">⭐ {church.rating}</div>
                      {church.acceptsCrypto && (
                        <div className="text-xs text-eboy-green">Crypto Ready</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Amount and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={titheAmount}
                  onChange={(e) => setTitheAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stream Button */}
          <Button
            onClick={handleStartStream}
            disabled={!selectedChurch || !titheAmount || isStreaming}
            className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-semibold"
          >
            <AnimatePresence mode="wait">
              {isStreaming ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating Stream...
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Start Tithe Stream
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {selectedChurch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-muted rounded-lg"
            >
              <h4 className="font-medium mb-2">Stream Preview</h4>
              <div className="text-sm space-y-1">
                <p><strong>Church:</strong> {selectedChurch.name}</p>
                <p><strong>Amount:</strong> ${titheAmount} {frequency}</p>
                {titheAmount && (
                  <p><strong>Annual Total:</strong> ${(
                    parseFloat(titheAmount) * 
                    (frequency === 'daily' ? 365 : frequency === 'weekly' ? 52 : 12)
                  ).toFixed(2)}</p>
                )}
                <p className="text-muted-foreground">
                  Stream will be powered by Superfluid for real-time transfers
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Biblical Tithing Wisdom */}
      <Card className="bg-gradient-to-r from-ancient-purple/10 to-indigo-600/10 border-ancient-purple/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ancient-purple">
            <Users className="h-5 w-5" />
            Biblical Tithing Wisdom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="italic text-muted-foreground mb-4">
            "Honor the Lord with your wealth, with the firstfruits of all your crops; 
            then your barns will be filled to overflowing, and your vats will brim over with new wine."
          </blockquote>
          <p className="text-sm text-muted-foreground text-right">- Proverbs 3:9-10</p>
          
          <div className="mt-4 p-3 bg-card rounded-lg">
            <h4 className="font-medium mb-2">Why Stream Your Tithe?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Consistent giving builds discipline and faith</li>
              <li>• Churches receive steady support for planning</li>
              <li>• Lower transaction fees with streaming</li>
              <li>• Full transparency and control over your gifts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStreamingTithe;