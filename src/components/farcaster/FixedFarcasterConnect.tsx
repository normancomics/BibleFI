
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, LogIn } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { useToast } from '@/hooks/use-toast';
import PixelButton from '@/components/PixelButton';
import { SignInButton, useProfile } from '@farcaster/auth-kit';

interface FixedFarcasterConnectProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FixedFarcasterConnect: React.FC<FixedFarcasterConnectProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const { isAuthenticated, profile } = useProfile();
  const { playSound } = useSound();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && profile) {
      toast({
        title: "Farcaster Connected",
        description: `Welcome, ${profile.displayName || profile.username}!`,
      });
      setIsConnecting(false);
    }
  }, [isAuthenticated, profile, toast]);
  
  const handleSignOut = () => {
    playSound('select');
    // Clear any stored auth data
    localStorage.removeItem('farcaster-auth-token');
    // Reload to clear auth state
    window.location.reload();
  };
  
  const handleSignIn = () => {
    playSound('select');
    setIsConnecting(true);
  };
  
  // Determine the size classes
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-3',
    lg: 'text-lg py-3 px-4'
  };
  
  if (isConnecting && !isAuthenticated) {
    return (
      <Card className={`bg-black/40 border border-purple-500/40 ${className}`}>
        <CardContent className="p-3 flex items-center justify-center">
          <div className="animate-pulse text-sm text-white/70">
            Connecting to Farcaster...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isAuthenticated && profile) {
    return (
      <Card className={`bg-black/40 border border-ancient-gold/40 hover:border-ancient-gold/60 transition-colors ${className}`}>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-black/40">
              <AvatarImage src={profile.pfpUrl} alt={profile.displayName || profile.username} />
              <AvatarFallback>{(profile.displayName || profile.username).substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-ancient-gold truncate max-w-[100px]">{profile.displayName || profile.username}</p>
              <p className="text-xs text-white/60">FID: {profile.fid}</p>
            </div>
          </div>
          <PixelButton 
            size="sm" 
            variant="ghost" 
            onClick={handleSignOut}
            className="text-ancient-gold"
          >
            <LogOut size={16} />
          </PixelButton>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={className}>
      <SignInButton
        onSuccess={() => {
          playSound('success');
          setIsConnecting(false);
        }}
        onError={(error) => {
          console.error('Farcaster sign in error:', error);
          toast({
            title: "Connection Failed",
            description: "Failed to connect to Farcaster",
            variant: "destructive",
          });
          playSound('error');
          setIsConnecting(false);
        }}
      >
        <PixelButton 
          onClick={handleSignIn}
          className={`bg-purple-900 border-2 border-ancient-gold/70 hover:bg-purple-800 flex items-center text-ancient-gold ${sizeClasses[size]}`}
        >
          <LogIn size={16} className="mr-2" />
          Connect Farcaster
        </PixelButton>
      </SignInButton>
    </div>
  );
};

export default FixedFarcasterConnect;
