import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PixelButton from '../PixelButton';
import { getRandomVerse } from '@/data/bibleVerses';
import { Share2, ZapIcon, Wallet, Users, TrendingUp } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { useToast } from '@/hooks/use-toast';

interface FarcasterSDK {
  context: {
    location: {
      type: 'cast_embed' | 'cast_share' | 'notification_details' | 'profile' | 'composer' | 'home';
    };
    user: {
      fid: number;
      username: string;
      displayName?: string;
      pfp?: string;
    };
  };
  actions: {
    openUrl: (url: string) => void;
    close: () => void;
    ready: () => void;
  };
  wallet: {
    requestAccounts: () => Promise<string[]>;
    requestPermissions: () => Promise<any>;
    watchAsset: (asset: any) => Promise<boolean>;
  };
  quickAuth: {
    getToken: () => Promise<string>;
    fetch: (url: string, options?: RequestInit) => Promise<Response>;
  };
}

declare global {
  interface Window {
    fc?: FarcasterSDK;
  }
}

const ModernFarcasterMiniApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fcUser, setFcUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { playSound } = useSound();
  const { toast } = useToast();
  const verse = getRandomVerse();

  useEffect(() => {
    initializeFarcasterSDK();
  }, []);

  const initializeFarcasterSDK = async () => {
    try {
      // Wait for Farcaster SDK to be available
      let attempts = 0;
      while (!window.fc && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (window.fc) {
        // Set up the mini app
        await window.fc.actions.ready();
        
        // Get user context
        if (window.fc.context?.user) {
          setFcUser(window.fc.context.user);
        }

        // Get auth token if available
        try {
          const token = await window.fc.quickAuth.getToken();
          setAuthToken(token);
        } catch (error) {
          console.log('Quick auth not available:', error);
        }

        playSound('powerup');
        toast({
          title: "🎮 Bible.fi Mini App Ready!",
          description: "Connected to Farcaster successfully",
        });
      } else {
        console.log('Running outside Farcaster environment');
        toast({
          title: "⚠️ Farcaster SDK not found",
          description: "Some features may be limited",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to initialize Farcaster SDK:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.fc?.wallet) {
        playSound('select');
        const accounts = await window.fc.wallet.requestAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          playSound('success');
          toast({
            title: "💰 Wallet Connected!",
            description: `Address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      } else {
        toast({
          title: "Wallet not available",
          description: "Please use a Farcaster client that supports wallet connections",
          variant: "destructive"
        });
      }
    } catch (error) {
      playSound('error');
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to wallet",
        variant: "destructive"
      });
    }
  };

  const shareToWarpcast = async () => {
    try {
      playSound('coin');
      
      const shareText = `💰 Just discovered some biblical financial wisdom on Bible.fi!\n\n"${verse.text}" - ${verse.reference}\n\n🎮 Play the retro DeFi game: `;
      
      if (window.fc) {
        // Use Farcaster SDK to share
        window.fc.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`);
      } else {
        // Fallback for non-Farcaster environments
        window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`, '_blank');
      }
      
      toast({
        title: "✨ Sharing to Warpcast!",
        description: "Biblical wisdom is being shared",
      });
    } catch (error) {
      playSound('error');
      console.error('Failed to share:', error);
    }
  };

  const openBibleFi = () => {
    playSound('powerup');
    if (window.fc) {
      window.fc.actions.openUrl('/');
    } else {
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <Card className="retro-card p-6 text-center animate-pulse">
        <div className="w-16 h-16 bg-pixel-purple rounded-lg mx-auto mb-4 animate-bounce"></div>
        <div className="text-retro-cyan font-pixel">Loading Bible.fi...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Header */}
      <Card className="retro-card p-4 bg-gradient-to-r from-pixel-purple/20 to-pixel-cyan/20 border-2 border-pixel-purple">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pixel-purple rounded-lg mr-3 animate-pulse"></div>
            <div>
              <h1 className="font-orbitron text-lg font-bold text-retro-cyan">Bible.fi</h1>
              <p className="text-xs text-retro-green">Retro DeFi Wisdom</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-retro-cyan/20 text-retro-cyan border-retro-cyan">
            Mini App
          </Badge>
        </div>

        {fcUser && (
          <div className="flex items-center bg-black/40 rounded-lg p-2 mb-3">
            {fcUser.pfp && (
              <img 
                src={fcUser.pfp} 
                alt="Profile" 
                className="w-6 h-6 rounded-full mr-2 pixelated"
              />
            )}
            <div className="text-xs">
              <div className="text-retro-cyan">@{fcUser.username}</div>
              <div className="text-retro-green">FID: {fcUser.fid}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Wisdom Card */}
      <Card className="retro-card p-4 bg-black/60 border-2 border-pixel-gold">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="bg-pixel-gold/20 text-pixel-gold border-pixel-gold text-xs">
            {verse.reference}
          </Badge>
          <div className="flex items-center">
            <ZapIcon size={14} className="text-retro-yellow mr-1" />
            <span className="text-retro-yellow text-xs font-pixel">42</span>
          </div>
        </div>
        <p className="text-sm text-retro-cyan font-pixel mb-4 leading-relaxed">
          "{verse.text}"
        </p>
        
        <PixelButton 
          onClick={shareToWarpcast}
          className="w-full bg-gradient-to-r from-pixel-purple to-pixel-cyan hover:from-pixel-cyan hover:to-pixel-purple transition-all duration-300"
        >
          <Share2 size={16} className="mr-2" />
          Cast This Wisdom
        </PixelButton>
      </Card>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <PixelButton 
          onClick={connectWallet}
          className="bg-gradient-to-r from-retro-green to-retro-cyan text-black font-bold"
          disabled={!!walletAddress}
        >
          <Wallet size={16} className="mr-1" />
          {walletAddress ? '✅ Connected' : 'Connect'}
        </PixelButton>

        <PixelButton 
          onClick={openBibleFi}
          className="bg-gradient-to-r from-pixel-gold to-retro-yellow text-black font-bold"
        >
          <TrendingUp size={16} className="mr-1" />
          Play DeFi
        </PixelButton>
      </div>

      {/* Status Bar */}
      <Card className="retro-card p-3 bg-black/80 border border-retro-green">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${authToken ? 'bg-retro-green animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-retro-green font-pixel">
              {authToken ? 'Authenticated' : 'Guest Mode'}
            </span>
          </div>
          <div className="text-retro-cyan font-pixel">
            Base Chain ⚡
          </div>
        </div>
        
        {walletAddress && (
          <div className="mt-2 text-xs text-retro-yellow font-pixel">
            💰 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-retro-green/60 font-pixel">
        <p>Powered by Base Chain & Farcaster</p>
        <p className="mt-1">🎮 Biblical wisdom meets retro gaming</p>
      </div>
    </div>
  );
};

export default ModernFarcasterMiniApp;