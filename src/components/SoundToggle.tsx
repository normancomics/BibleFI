
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import PixelButton from './PixelButton';

interface SoundToggleProps {
  className?: string;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ className = "" }) => {
  const { isEnabled, setIsEnabled } = useSound();

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <PixelButton
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
    >
      {isEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      <span className="hidden md:inline">{isEnabled ? 'On' : 'Off'}</span>
    </PixelButton>
  );
};

export default SoundToggle;
