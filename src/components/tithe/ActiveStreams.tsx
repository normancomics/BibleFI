import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Settings, ExternalLink, Coins } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { SuperfluidService, SuperfluidStreamData } from "@/services/superfluidService";
import { useToast } from "@/hooks/use-toast";

interface ActiveStreamsProps {
  accountAddress?: string;
  onManageStream?: (streamId: string) => void;
}

const ActiveStreams: React.FC<ActiveStreamsProps> = ({ 
  accountAddress,
  onManageStream
}) => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [streams, setStreams] = useState<SuperfluidStreamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const userStreams = await SuperfluidService.getUserStreams();
      setStreams(userStreams);
    } catch (error) {
      console.error("Error fetching streams:", error);
      toast({
        title: "Error",
        description: "Failed to load your streams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStream = async (streamId: string, currentStatus: string) => {
    playSound("select");
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await SuperfluidService.updateStreamStatus(streamId, newStatus as any);
      await fetchStreams(); // Refresh the list
      toast({
        title: "Stream Updated",
        description: `Stream has been ${newStatus}`,
      });
    } catch (error) {
      console.error("Error toggling stream:", error);
      toast({
        title: "Error",
        description: "Failed to update stream status",
        variant: "destructive"
      });
    }
  };
  
  const handleStreamSettings = (streamId: string) => {
    playSound("select");
    console.log(`Opening settings for stream ${streamId}`);
    onManageStream?.(streamId);
  };

  const formatAmount = (flowRate: string) => {
    const monthlyAmount = SuperfluidService.calculateMonthlyAmount(flowRate);
    return monthlyAmount.toFixed(4);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-scroll text-ancient-gold mb-2">Active Superfluid Streams</h2>
        <p className="text-white/70 mb-4">Manage your active Superfluid streams</p>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-white/70">Loading streams...</div>
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">You don't have any active streams yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {streams.map((stream) => (
            <Card key={stream.id} className="border-scripture/30 bg-black/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-ancient-gold font-scroll">
                      {stream.stream_type === 'tithe' ? 'Church Tithe' : `${stream.stream_type} Stream`}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {formatAmount(stream.flow_rate)} {stream.token_symbol}/month
                    </CardDescription>
                    <CardDescription className="text-white/40 text-xs">
                      Stream ID: {stream.stream_id}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={stream.status === 'active' ? 'default' : 'secondary'}
                    className="font-scroll"
                  >
                    {stream.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-white/60">Flow Rate</p>
                    <p className="font-medium text-ancient-gold">
                      {stream.flow_rate} wei/sec
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Started</p>
                    <p className="font-medium text-white">
                      {new Date(stream.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStream(stream.id, stream.status)}
                    className="flex items-center gap-2"
                    disabled={stream.status === 'cancelled' || stream.status === 'completed'}
                  >
                    {stream.status === 'active' ? (
                      <>
                        <Pause size={16} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Resume
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStreamSettings(stream.id)}
                    className="flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Settings
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://app.superfluid.finance/`, "_blank")}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Dashboard
                  </Button>
                  
                  {stream.tx_hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://basescan.org/tx/${stream.tx_hash}`, "_blank")}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      TX
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveStreams;