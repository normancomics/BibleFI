
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PixelButton from '@/components/PixelButton';
import { useToast } from '@/hooks/use-toast';
import { Share2, ExternalLink, Copy } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { APP_CONFIG } from './config';

const FarcasterFrame: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [copied, setCopied] = useState(false);
  
  // Generate the frame URL for the current domain
  const frameUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/frame.html`
    : 'https://biblefi.app/frame.html';
  
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
    const text = 'Check out BibleFi - Biblical wisdom for your financial journey on Base Chain';
    const url = encodeURIComponent(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(frameUrl)}`);
    window.open(url, '_blank');
  };

  return (
    <Card className="bg-scripture/20 border border-ancient-gold shadow-md">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-xl text-ancient-gold font-medium">BibleFi Frame</h3>
          <p className="text-sm text-white/70">Share biblical wisdom on Farcaster</p>
        </div>
        
        <div className="my-4 flex justify-center">
          <img 
            src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
            alt="BibleFi Logo" 
            className="h-24 object-contain"
          />
        </div>
        
        <div className="space-y-3">
          <PixelButton 
            className="w-full flex items-center justify-center bg-purple-900 text-ancient-gold border border-ancient-gold/50 hover:bg-purple-800"
            onClick={handleOpenFrame}
          >
            <ExternalLink size={16} className="mr-2" /> Preview Frame
          </PixelButton>
          
          <PixelButton 
            className="w-full flex items-center justify-center bg-black/40 text-ancient-gold border border-ancient-gold/50 hover:bg-black/60"
            onClick={handleCopyUrl}
          >
            <Copy size={16} className="mr-2" /> {copied ? 'Copied!' : 'Copy Frame URL'}
          </PixelButton>
          
          <PixelButton 
            className="w-full flex items-center justify-center bg-purple-800 text-ancient-gold border border-ancient-gold/50 hover:bg-purple-900"
            onClick={handleShareToFarcaster}
          >
            <Share2 size={16} className="mr-2" /> Share to Farcaster
          </PixelButton>
        </div>
        
        <div className="mt-4 text-center text-xs text-ancient-gold/60">
          <p>Built for Farcaster on Base Chain</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarcasterFrame;
