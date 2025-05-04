
import React from "react";
import { Shield } from "lucide-react";

interface RiskBadgeProps {
  riskLevel: "low" | "medium" | "high";
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel }) => {
  const getRiskColor = () => {
    switch(riskLevel) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className={`text-xs px-2 py-1 rounded-md ${getRiskColor()} flex items-center mr-2`}>
      <Shield size={12} className="mr-1" /> {riskLevel.toUpperCase()} RISK
    </div>
  );
};

export default RiskBadge;
