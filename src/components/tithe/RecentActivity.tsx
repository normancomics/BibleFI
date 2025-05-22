
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { TithingHistoryItem } from "@/types/tithing";
import { useSound } from "@/contexts/SoundContext";

interface RecentActivityProps {
  historyItems: TithingHistoryItem[];
  onViewHistory: () => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ historyItems, onViewHistory }) => {
  const { playSound } = useSound();
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const renderStatusBadge = (status: TithingHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-900/20 text-green-400 border-green-500/50">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/50">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-900/20 text-red-400 border-red-500/50">Failed</Badge>;
      default:
        return null;
    }
  };
  
  const renderMethodBadge = (method: TithingHistoryItem['method']) => {
    switch (method) {
      case 'one-time':
        return <Badge variant="outline" className="bg-slate-900/20">One-time</Badge>;
      case 'stream':
        return <Badge variant="outline" className="bg-purple-900/20">Stream</Badge>;
      case 'automatic':
        return <Badge variant="outline" className="bg-blue-900/20">Automatic</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="border-2 border-scripture/30 bg-black/20">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
        <CardTitle className="font-scroll text-ancient-gold">Recent Activity</CardTitle>
        <CardDescription className="text-white/70">
          Your latest tithing transactions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          {historyItems.slice(0, 3).map((item) => (
            <div 
              key={item.id}
              className="bg-black/50 border border-ancient-gold/20 rounded-md p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-scripture">{item.church}</p>
                <p className="text-sm text-white/60">{formatDate(item.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-ancient-gold">{item.amount} {item.token}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  {renderMethodBadge(item.method)}
                  {renderStatusBadge(item.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <PixelButton 
            variant="outline" 
            onClick={() => {
              onViewHistory();
              playSound("select");
            }}
            size="sm"
          >
            <CalendarRange size={16} className="mr-2" />
            View Full History
          </PixelButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
