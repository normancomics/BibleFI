
import React from "react";
import { Shield } from "lucide-react";

interface RiskBadgeProps {
  riskLevel: "low" | "medium" | "medium-high" | "high";
  risk?: string; // Alternative prop name for backward compatibility
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel, risk }) => {
  // Use the provided riskLevel or fallback to risk prop
  const effectiveRisk = riskLevel || (risk as "low" | "medium" | "medium-high" | "high") || "low";
  
  const getRiskColor = () => {
    switch(effectiveRisk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "medium-high": return "bg-orange-100 text-orange-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className={`text-xs px-2 py-1 rounded-md ${getRiskColor()} flex items-center mr-2`}>
      <Shield size={12} className="mr-1" /> {effectiveRisk.toUpperCase()} RISK
    </div>
  );
};

export default RiskBadge;
