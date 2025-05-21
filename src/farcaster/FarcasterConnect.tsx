
import React from 'react';
import { useFarcasterAuth } from './auth';
import PixelButton from '@/components/PixelButton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, LogIn } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';

interface FarcasterConnectProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FarcasterConnect: React.FC<FarcasterConnectProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const { user, status, signIn, signOut } = useFarcasterAuth();
  const { playSound } = useSound();
  
  const handleConnect = async () => {
    playSound('select');
    if (status === 'disconnected') {
      signIn();
    } else {
      signOut();
    }
  };
  
  // Determine the size classes
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-3',
    lg: 'text-lg py-3 px-4'
  };
  
  if (status === 'connecting') {
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
  
  if (user) {
    return (
      <Card className={`bg-black/40 border border-ancient-gold/40 hover:border-ancient-gold/60 transition-colors ${className}`}>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-black/40">
              <AvatarImage src={user.pfp} alt={user.displayName || user.username} />
              <AvatarFallback>FC</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-ancient-gold">{user.displayName || user.username}</p>
              <p className="text-xs text-white/60">FID: {user.fid}</p>
            </div>
          </div>
          <PixelButton 
            size="sm" 
            variant="ghost" 
            onClick={handleConnect}
            className="text-ancient-gold"
          >
            <LogOut size={16} />
          </PixelButton>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <PixelButton 
      onClick={handleConnect} 
      className={`bg-purple-900 border-2 border-ancient-gold/70 hover:bg-purple-800 flex items-center text-ancient-gold ${sizeClasses[size]} ${className}`}
    >
      <LogIn size={16} className="mr-2" />
      Connect Farcaster
    </PixelButton>
  );
};

export default FarcasterConnect;
