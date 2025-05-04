
import React from "react";

interface StakingHeaderProps {
  title: string;
  apy: number;
}

const StakingHeader: React.FC<StakingHeaderProps> = ({ title, apy }) => {
  return (
    <div className="relative px-4 py-2 mb-4 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold">
      <div className="absolute inset-0 bg-black/10 opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
      <div className="absolute -left-1 -top-1 w-2 h-2 border-t border-l border-ancient-gold"></div>
      <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-ancient-gold"></div>
      <div className="absolute -left-1 -bottom-1 w-2 h-2 border-b border-l border-ancient-gold"></div>
      <div className="absolute -right-1 -bottom-1 w-2 h-2 border-b border-r border-ancient-gold"></div>
      <div className="flex justify-between items-center relative z-10">
        <h3 className="text-xl font-scroll text-white drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(255,215,0,0.7)' }}>
          {title}
        </h3>
        <div className="bg-ancient-gold text-black px-3 py-1 rounded-md font-bold drop-shadow-lg">
          {apy}% APY
        </div>
      </div>
    </div>
  );
};

export default StakingHeader;
