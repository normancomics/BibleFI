
import React from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SoundTestPanel: React.FC = () => {
  const { isSoundEnabled, toggleSound } = useSound();

  return (
    <div className="flex items-center justify-end space-x-2 mb-4">
      <Label htmlFor="sound-toggle" className="text-sm text-gray-400">Sound</Label>
      <Switch 
        id="sound-toggle" 
        checked={isSoundEnabled} 
        onCheckedChange={toggleSound} 
      />
      {isSoundEnabled ? 
        <Volume2 size={16} className="text-ancient-gold" /> : 
        <VolumeX size={16} className="text-gray-400" />
      }
    </div>
  );
};

export default SoundTestPanel;
