
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TithingHistoryItem } from "@/types/tithing";

interface TithingHistoryProps {
  historyItems: TithingHistoryItem[];
}

const TithingHistory: React.FC<TithingHistoryProps> = ({ historyItems }) => {
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
        <CardTitle className="font-scroll text-ancient-gold">Tithing History</CardTitle>
        <CardDescription className="text-white/70">
          A record of all your past giving
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {historyItems.length > 0 ? (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div 
                key={item.id}
                className="bg-black/50 border border-ancient-gold/20 rounded-md p-4 flex flex-col sm:flex-row justify-between"
              >
                <div>
                  <p className="font-medium text-scripture">{item.church}</p>
                  <p className="text-sm text-white/60">{formatDate(item.date)}</p>
                  <div className="flex gap-1 mt-2 sm:hidden">
                    {renderMethodBadge(item.method)}
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <p className="font-medium text-ancient-gold">{item.amount} {item.token}</p>
                  <div className="hidden sm:flex gap-1 mt-2 justify-end">
                    {renderMethodBadge(item.method)}
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You don't have any tithing history yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TithingHistory;
