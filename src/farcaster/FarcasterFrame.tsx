
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PixelButton from '@/components/PixelButton';
import { useToast } from '@/hooks/use-toast';
import { Share2, ExternalLink, Copy } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import BibleCharacter from '@/components/BibleCharacter';
import { APP_CONFIG } from './config';

const FarcasterFrame: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [copied, setCopied] = useState(false);
  
  // Generate the frame URL for the current domain
  const frameUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/frame.html`
    : 'https://bible.fi/frame.html';
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(frameUrl)
      .then(() => {
        playSound('success');
        setCopied(true);
        toast({
          title: 'URL Copied',
          description: 'Frame URL copied to clipboard.',
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        playSound('error');
        toast({
          title: 'Copy Failed',
          description: 'Could not copy URL. Please try again.',
          variant: 'destructive',
        });
      });
  };
  
  const handleOpenFrame = () => {
    playSound('select');
    window.open('/frame.html', '_blank');
  };
  
  const handleShareToFarcaster = () => {
    playSound('coin');
    const text = 'Check out Bible.fi - Biblical wisdom for your financial journey on Base Chain';
    const url = encodeURIComponent(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(frameUrl)}`);
    window.open(url, '_blank');
  };

  return (
    <Card className="bg-black/80 border-2 border-ancient-gold/60 shadow-glow-sm">
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <h3 className="text-xl font-pixel text-ancient-gold">Bible.fi Frame</h3>
          <p className="text-sm text-white/70">Share biblical wisdom on Farcaster</p>
        </div>
        
        <div className="my-4 flex justify-center">
          <BibleCharacter 
            character="moses" 
            showName={false}
            message="Embed this mini-app in Farcaster"
            className="animate-minimal-sprite"
          />
        </div>
        
        <div className="space-y-3">
          <PixelButton 
            className="w-full flex items-center justify-center"
            onClick={handleOpenFrame}
          >
            <ExternalLink size={16} className="mr-2" /> Preview Frame
          </PixelButton>
          
          <PixelButton 
            className="w-full flex items-center justify-center"
            variant="outline"
            onClick={handleCopyUrl}
          >
            <Copy size={16} className="mr-2" /> {copied ? 'Copied!' : 'Copy Frame URL'}
          </PixelButton>
          
          <PixelButton 
            className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700"
            onClick={handleShareToFarcaster}
          >
            <Share2 size={16} className="mr-2" /> Share to Farcaster
          </PixelButton>
        </div>
        
        <div className="mt-4 text-center text-xs text-white/60">
          <p>Built for Farcaster on Base Chain</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarcasterFrame;
