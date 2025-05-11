
import React from "react";
import { BookOpen, ChartBar } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

interface StakingDetailsProps {
  returnsMechanism: string;
  biblicalPrinciple: string;
  onShowTransparency: () => void;
  visible: boolean;
}

const StakingDetails: React.FC<StakingDetailsProps> = ({
  returnsMechanism,
  biblicalPrinciple,
  onShowTransparency,
  visible = false // Default to not visible
}) => {
  const { playSound } = useSound();
  
  if (!visible) return null;

  return (
    <div className="bg-black/10 p-3 rounded-md mb-4 text-sm mx-4">
      <div className="flex items-start mb-2">
        <ChartBar size={16} className="mr-2 flex-shrink-0 mt-1 text-scripture" />
        <div>
          <strong>Returns Mechanism:</strong> {returnsMechanism}
        </div>
      </div>
      <div className="flex items-start">
        <BookOpen size={16} className="mr-2 flex-shrink-0 mt-1 text-scripture" />
        <div>
          <strong>Biblical Principle:</strong> {biblicalPrinciple}
        </div>
      </div>
      <div className="mt-2 text-center">
        <button 
          className="text-xs text-scripture underline hover:text-scripture-dark"
          onClick={() => {
            onShowTransparency();
            playSound("select");
          }}
        >
          View full biblical transparency report
        </button>
      </div>
    </div>
  );
};

export default StakingDetails;
