import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Coins, Heart, BookOpen } from "lucide-react";

const ActionButtons: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: ArrowUpDown,
      label: "Swap",
      description: "Exchange tokens",
      color: "blue",
      route: "/defi"
    },
    {
      icon: Coins,
      label: "Stake",
      description: "Earn rewards",
      color: "green",
      route: "/staking"
    },
    {
      icon: Heart,
      label: "Tithe",
      description: "Give generously",
      color: "purple",
      route: "/tithe"
    },
    {
      icon: BookOpen,
      label: "Learn",
      description: "Biblical wisdom",
      color: "orange",
      route: "/wisdom"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600",
      green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-600",
      purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-600",
      orange: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.route)}
                className={`border rounded-lg p-4 text-left transition-colors ${getColorClasses(action.color)}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5" />
                  <div className="font-medium">{action.label}</div>
                </div>
                <div className="text-muted-foreground text-xs">{action.description}</div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;