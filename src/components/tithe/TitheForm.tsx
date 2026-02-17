
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, CreditCard, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

const TitheForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [church, setChurch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();

  const handleTithe = async () => {
    if (!amount || !church) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount and select a church",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    playSound('coin');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Tithe Sent Successfully! 🙏",
      description: `${amount} ${currency} sent to ${church}`,
    });
    
    setIsProcessing(false);
    setAmount('');
    setChurch('');
  };

  return (
    <Card className="border-scripture/30 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="text-ancient-gold" />
          Digital Tithe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-black/50 p-4 rounded-lg border border-ancient-gold/30">
          <p className="italic text-white/80 text-sm">
            "Bring the whole tithe into the storehouse, that there may be food in my house."
          </p>
          <p className="text-right text-xs text-ancient-gold/70 mt-2">- Malachi 3:10</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">💵 USDC</SelectItem>
                <SelectItem value="DAI">🟡 DAI</SelectItem>
                <SelectItem value="ETH">💎 ETH</SelectItem>
                <SelectItem value="USDT">💚 USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Church</label>
          <Select value={church} onValueChange={setChurch}>
            <SelectTrigger>
              <SelectValue placeholder="Select your church" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v1-church-mountdora">V1 Church — Non-Denominational · Mount Dora, FL 32757</SelectItem>
              <SelectItem value="st-patricks-manhattan">St. Patrick's Cathedral — Catholic · Manhattan, NY 10022</SelectItem>
              <SelectItem value="calvary-baptist-manhattan">Calvary Baptist Church — Baptist · Manhattan, NY 10019</SelectItem>
              <SelectItem value="redeemer-presbyterian">Redeemer Presbyterian — Presbyterian · Manhattan, NY 10023</SelectItem>
              <SelectItem value="first-baptist-mountdora">First Baptist Church of Mount Dora — Baptist · Mount Dora, FL 32757</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleTithe}
            disabled={isProcessing}
            className="bg-scripture hover:bg-scripture/80"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Send Tithe'}
          </Button>
          
          <Button 
            variant="outline"
            className="border-ancient-gold text-ancient-gold hover:bg-ancient-gold/20"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Recurring
          </Button>
        </div>

        <div className="text-xs text-white/60 text-center">
          Powered by Daimo • Ultra-low fees on Base Chain
        </div>
      </CardContent>
    </Card>
  );
};

export default TitheForm;
