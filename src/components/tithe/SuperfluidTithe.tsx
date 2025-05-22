
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { superfluidClient, SuperfluidToken } from "@/integrations/superfluid/client";
import { ArrowRight, HelpCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Church } from "@/types/church";
import { getUserChurches } from "@/services";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useFarcasterAuth } from "@/farcaster/auth";
import WalletConnect from "@/components/wallet/WalletConnect";

const formatFlowRate = (amount: number, period: string) => {
  switch (period) {
    case "month":
      return `${amount.toFixed(2)}/month`;
    case "week":
      return `${amount.toFixed(2)}/week`;
    case "day":
      return `${amount.toFixed(2)}/day`;
    default:
      return `${amount.toFixed(2)}/month`;
  }
};

const calculateMonthlyAmount = (amount: number, period: string) => {
  switch (period) {
    case "month":
      return amount;
    case "week":
      return amount * 4.34524; // average weeks in a month
    case "day":
      return amount * 30.4167; // average days in a month
    default:
      return amount;
  }
};

const SuperfluidTithe: React.FC = () => {
  const [availableTokens, setAvailableTokens] = useState<SuperfluidToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("10");
  const [period, setPeriod] = useState<string>("month");
  const [duration, setDuration] = useState<number>(12); // in months
  const [userChurches, setUserChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scriptureReference, setScriptureReference] = useState<string>("Give, and it will be given to you. - Luke 6:38");
  
  const { toast } = useToast();
  const { playSound } = useSound();
  const { user: farcasterUser } = useFarcasterAuth();

  useEffect(() => {
    // Fetch available Superfluid tokens
    const tokens = superfluidClient.getAvailableTokens();
    setAvailableTokens(tokens);
    if (tokens.length > 0) {
      setSelectedToken(tokens[0].symbol);
    }
    
    // Check authentication status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session || !!farcasterUser);
      
      if (data.session || farcasterUser) {
        fetchUserChurches();
      }
    };
    
    checkAuth();
  }, [farcasterUser]);
  
  const fetchUserChurches = async () => {
    try {
      const churches = await getUserChurches();
      setUserChurches(churches);
      
      // Set primary church as default if available
      const primaryChurch = churches.find(church => church.isPrimaryChurch);
      if (primaryChurch) {
        setSelectedChurch(primaryChurch.id);
      } else if (churches.length > 0) {
        setSelectedChurch(churches[0].id);
      }
    } catch (error) {
      console.error("Error fetching user churches:", error);
    }
  };
  
  const handleWalletConnected = (address: string) => {
    // For now, just show a success message
    toast({
      title: "Wallet Connected",
      description: `Connected with ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    });
    
    setIsWalletModalOpen(false);
    handleCreateStream(address);
  };
  
  const handleCreateStream = async (walletAddress?: string) => {
    if (!selectedToken || !selectedChurch || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    setIsProcessing(true);
    playSound("select");
    
    try {
      // Calculate the monthly equivalent for the flow rate
      const monthlyAmount = calculateMonthlyAmount(amountNum, period);
      
      // Get the selected church details
      const church = userChurches.find(c => c.id === selectedChurch);
      if (!church) throw new Error("Selected church not found");
      
      // Get the token details
      const token = superfluidClient.getToken(selectedToken);
      if (!token) throw new Error("Selected token not found");
      
      // In a real implementation, this would create a Superfluid stream
      // For now, we'll generate a link to the Superfluid dashboard
      const mockAddress = walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`;
      const churchAddress = `0x${Math.random().toString(16).substr(2, 40)}`; // Mock church address
      
      const flowRate = superfluidClient.calculateFlowRate(monthlyAmount);
      const streamingUrl = superfluidClient.getStreamingUrl(
        token.address, 
        churchAddress, 
        flowRate
      );
      
      // Show success message
      toast({
        title: "Success!",
        description: `Your recurring tithe of ${formatFlowRate(amountNum, period)} to ${church.name} has been initiated.`,
      });
      
      // Open Superfluid dashboard in a new tab
      window.open(streamingUrl, "_blank");
      
      playSound("success");
    } catch (error) {
      console.error("Error setting up Superfluid stream:", error);
      toast({
        title: "Error",
        description: "There was a problem setting up your recurring tithe",
        variant: "destructive"
      });
      playSound("error");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect with Farcaster or sign in to set up a recurring tithe",
        variant: "destructive"
      });
      return;
    }
    
    setIsWalletModalOpen(true);
  };
  
  // Scripture references related to consistent giving
  const scriptureReferences = [
    "Give, and it will be given to you. - Luke 6:38",
    "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. - 2 Corinthians 9:7",
    "Honor the Lord with your wealth, with the firstfruits of all your crops. - Proverbs 3:9",
    "Bring the whole tithe into the storehouse, that there may be food in my house. - Malachi 3:10",
    "But who am I, and who are my people, that we should be able to give as generously as this? Everything comes from you, and we have given you only what comes from your hand. - 1 Chronicles 29:14"
  ];
  
  // Cycle through Scripture references every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * scriptureReferences.length);
      setScriptureReference(scriptureReferences[randomIndex]);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-2 border-scripture/30 bg-black/20">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
        <CardTitle className="font-scroll text-ancient-gold flex items-center gap-2">
          Recurring Tithe with Superfluid
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={18} className="text-ancient-gold/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Superfluid allows you to set up continuous streams of tokens as a form of recurring tithing.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="text-white/70">
          Create a continuous stream of funds to support your church
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="bg-purple-900/10 border border-ancient-gold/20 p-3 rounded-md mb-6">
          <p className="text-sm text-ancient-gold/90 italic">"{scriptureReference}"</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {userChurches.length > 0 ? (
            <div>
              <Label htmlFor="church" className="font-scroll">Select Church</Label>
              <Select 
                value={selectedChurch} 
                onValueChange={setSelectedChurch}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a church" />
                </SelectTrigger>
                <SelectContent>
                  {userChurches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name} {church.isPrimaryChurch && "(Primary)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a church to receive your recurring tithe
              </p>
            </div>
          ) : (
            <div className="bg-amber-100/10 border border-amber-200/30 p-3 rounded-md">
              <p className="text-amber-200 text-sm">You haven't joined any churches yet. Please join a church in the "Find a Church" section to set up recurring tithing.</p>
            </div>
          )}
          
          <div>
            <Label htmlFor="token" className="font-scroll">Select Token</Label>
            <Select 
              value={selectedToken} 
              onValueChange={setSelectedToken}
              disabled={availableTokens.length === 0}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.name} ({token.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a Superfluid token for your recurring tithe
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="font-scroll">Amount</Label>
              <Input 
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="period" className="font-scroll">Frequency</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="day">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <Label className="font-scroll">Duration: {duration} months</Label>
              <Badge variant="outline" className="font-scroll text-xs">
                {duration === 0 ? "Indefinite" : `Ends after ${duration} months`}
              </Badge>
            </div>
            <div className="pt-2 pb-6">
              <Slider
                defaultValue={[12]}
                min={0}
                max={36}
                step={1}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Indefinite</span>
                <span>3 Years</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Flow Rate:</span>
              <span className="font-medium">
                {formatFlowRate(parseFloat(amount) || 0, period)} {selectedToken}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Monthly Equivalent:</span>
              <span className="font-medium">
                {calculateMonthlyAmount(parseFloat(amount) || 0, period).toFixed(2)} {selectedToken}/month
              </span>
            </div>
            
            {duration > 0 && (
              <div className="flex justify-between text-sm">
                <span>Total Amount (over {duration} months):</span>
                <span className="font-medium">
                  {(calculateMonthlyAmount(parseFloat(amount) || 0, period) * duration).toFixed(2)} {selectedToken}
                </span>
              </div>
            )}
          </div>
        
          <div className="pt-2">
            <PixelButton
              type="submit"
              disabled={isProcessing || !selectedToken || !selectedChurch || userChurches.length === 0}
              className="w-full font-scroll"
              farcasterStyle
            >
              {isProcessing ? "Processing..." : "Set Up Recurring Tithe"}
              {!isProcessing && <ArrowRight size={16} className="ml-2" />}
            </PixelButton>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="bg-black/30 border-t border-ancient-gold/20 p-3 flex justify-center">
        <span className="text-xs text-white/50">
          Powered by <span className="text-ancient-gold">Superfluid</span> on <span className="text-base-blue">Base Chain</span>
        </span>
      </CardFooter>
      
      {isWalletModalOpen && (
        <WalletConnect 
          onConnect={handleWalletConnected}
          onCancel={() => setIsWalletModalOpen(false)}
        />
      )}
    </Card>
  );
};

export default SuperfluidTithe;
