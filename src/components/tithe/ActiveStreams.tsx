
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { superfluidClient, TithingStream, SuperfluidToken } from "@/integrations/superfluid/client";
import { Clock, Coins, ExternalLink, PauseCircle, PlayCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PixelButton from "@/components/PixelButton";

interface ActiveStreamsProps {
  accountAddress?: string;
  onManageStream?: (streamId: string) => void;
}

const ActiveStreams: React.FC<ActiveStreamsProps> = ({ accountAddress, onManageStream }) => {
  const [activeStreams, setActiveStreams] = useState<TithingStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenDetails, setTokenDetails] = useState<Record<string, SuperfluidToken>>({});
  
  const { toast } = useToast();
  const { playSound } = useSound();
  
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        // Fetch the active streams for the current account
        const streams = superfluidClient.getTithingStreams(accountAddress);
        
        // Filter to only show active streams
        const active = streams.filter(stream => stream.status === 'active');
        setActiveStreams(active);
        
        // Collect token details for all tokens used in streams
        const tokenMap: Record<string, SuperfluidToken> = {};
        active.forEach(stream => {
          tokenMap[stream.token.symbol] = stream.token;
        });
        setTokenDetails(tokenMap);
      } catch (error) {
        console.error("Error fetching streams:", error);
        toast({
          title: "Error",
          description: "Failed to load your active tithing streams",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStreams();
  }, [accountAddress, toast]);
  
  const handlePauseStream = (streamId: string) => {
    playSound("select");
    // This would call the actual Superfluid SDK to pause the stream
    toast({
      title: "Coming Soon",
      description: "Pausing streams will be available in a future update"
    });
  };
  
  const handleViewOnSuperfluid = () => {
    playSound("select");
    const dashboardUrl = superfluidClient.getDashboardUrl();
    window.open(dashboardUrl, '_blank');
  };
  
  const formatDuration = (startDate: Date, endDate?: Date) => {
    if (!endDate) {
      return "Ongoing";
    }
    
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    
    if (durationDays < 30) {
      return `${durationDays} days`;
    } else if (durationDays < 365) {
      const months = Math.floor(durationDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(durationDays / 365);
      const remainingMonths = Math.floor((durationDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  };
  
  const calculateMonthlyEquivalent = (flowRate: string) => {
    // Convert flow rate to monthly amount (flowRate is in tokens per second)
    // Average number of seconds in a month: 30.44 days * 24 hours * 60 minutes * 60 seconds
    const secondsInMonth = 30.44 * 24 * 60 * 60;
    const flowRateNum = parseFloat(flowRate);
    
    if (isNaN(flowRateNum)) return "0";
    
    const monthlyAmount = flowRateNum * secondsInMonth;
    return monthlyAmount.toFixed(2);
  };
  
  if (loading) {
    return (
      <Card className="border-2 border-scripture/30 bg-black/20">
        <CardHeader>
          <CardTitle>Active Tithing Streams</CardTitle>
          <CardDescription>Loading your active streams...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancient-gold"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-scripture/30 bg-black/20">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
        <CardTitle className="font-scroll text-ancient-gold">Active Tithing Streams</CardTitle>
        <CardDescription className="text-white/70">
          Your ongoing tithing streams through Superfluid
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {activeStreams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have any active tithing streams.</p>
            <PixelButton 
              onClick={() => {
                playSound("select");
                // Navigate to create stream section
              }}
              farcasterStyle
            >
              Create Your First Stream
            </PixelButton>
          </div>
        ) : (
          <div className="space-y-4">
            {activeStreams.map((stream) => (
              <div 
                key={stream.id} 
                className="bg-black/50 border border-ancient-gold/20 rounded-md p-4 hover:border-ancient-gold/40 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-scripture">{stream.church}</h3>
                    <p className="text-sm text-white/60">
                      Started {formatDistanceToNow(stream.startDate, { addSuffix: true })}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-green-900/20 text-green-400 border-green-500/50"
                  >
                    Active
                  </Badge>
                </div>
                
                <Separator className="my-3 bg-ancient-gold/20" />
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Flow Rate</p>
                    <p className="font-medium">
                      {stream.flowRate} {stream.token.symbol}/sec
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Equivalent</p>
                    <p className="font-medium">
                      {calculateMonthlyEquivalent(stream.flowRate)} {stream.token.symbol}/month
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(stream.startDate, stream.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Streamed</p>
                    <p className="font-medium flex items-center">
                      <Coins size={14} className="mr-1" />
                      {stream.totalStreamed} {stream.token.symbol}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handlePauseStream(stream.id)}
                  >
                    <PauseCircle size={16} className="mr-1" />
                    Pause Stream
                  </Button>
                  
                  <Button 
                    variant="default"
                    size="sm"
                    className="flex-1 bg-purple-900 hover:bg-purple-800"
                    onClick={() => onManageStream && onManageStream(stream.id)}
                  >
                    <PlayCircle size={16} className="mr-1" />
                    Manage Stream
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <Button 
                variant="link"
                onClick={handleViewOnSuperfluid}
                className="text-ancient-gold hover:text-ancient-gold/80"
              >
                <ExternalLink size={14} className="mr-1" />
                View on Superfluid Dashboard
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-black/30 border-t border-ancient-gold/20 p-3 flex justify-center">
        <span className="text-xs text-white/50">
          Powered by <span className="text-ancient-gold">Superfluid</span> on <span className="text-base-blue">Base Chain</span>
        </span>
      </CardFooter>
    </Card>
  );
};

export default ActiveStreams;
