
import React from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

// This component is now just a small toggle button that appears only when needed
const SoundActivationButton: React.FC = () => {
  const { isSoundEnabled, toggleSound } = useSound();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={toggleSound}
        size="sm"
        variant="outline"
        className="bg-black/70 border border-ancient-gold/50 p-2 rounded-full shadow-lg"
        aria-label={isSoundEnabled ? "Mute Sounds" : "Enable Sounds"}
      >
        {isSoundEnabled ? (
          <Volume2 size={20} className="text-ancient-gold" />
        ) : (
          <VolumeX size={20} className="text-gray-400" />
        )}
      </Button>
    </div>
  );
};

export default SoundActivationButton;
