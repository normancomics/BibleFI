import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Heart, BookOpen } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'swap' | 'stake' | 'tithe' | 'learn';
  description: string;
  amount?: string;
  timestamp: Date;
  hash?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const ActivityIcon = ({ type }: { type: ActivityItem['type'] }) => {
  switch (type) {
    case 'swap':
      return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
    case 'stake':
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    case 'tithe':
      return <Heart className="h-4 w-4 text-purple-600" />;
    case 'learn':
      return <BookOpen className="h-4 w-4 text-orange-600" />;
    default:
      return null;
  }
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">No recent activity</div>
              <div className="text-xs">Connect your wallet to get started</div>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground font-medium truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatTime(activity.timestamp)}
                    </p>
                    {activity.amount && (
                      <p className="text-xs font-medium text-card-foreground">
                        {activity.amount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;