
import React from "react";
import { Lock, Unlock } from "lucide-react";

interface FinancialPrincipleProps {
  title: string;
  description: string;
  scriptureReferences: string[];
  isUnlocked: boolean;
}

const FinancialPrinciple: React.FC<FinancialPrincipleProps> = ({
  title,
  description,
  scriptureReferences,
  isUnlocked,
}) => {
  return (
    <div className="relative">
      <div className={`absolute top-3 right-3 ${isUnlocked ? 'text-ancient-gold' : 'text-muted-foreground'}`}>
        {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
      <div className="mt-2 text-xs flex flex-wrap gap-1">
        {scriptureReferences.map((reference) => (
          <div key={reference} className="bg-black/20 px-2 py-1 rounded">{reference}</div>
        ))}
      </div>
    </div>
  );
};

export default FinancialPrinciple;
