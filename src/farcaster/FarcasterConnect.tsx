
import React, { useEffect } from 'react';
import { useFarcasterAuth } from './auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, LogIn } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Handle connection status changes
  useEffect(() => {
    if (status === 'connected' && user) {
      toast({
        title: "Farcaster Connected",
        description: `Welcome, ${user.displayName || user.username}!`,
      });
    }
  }, [status, user, toast]);
  
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
      <Button 
        disabled
        className={`bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white ${sizeClasses[size]} ${className}`}
      >
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Connecting...
      </Button>
    );
  }
  
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 bg-black/40">
            <AvatarImage src={user.pfp} alt={user.displayName || user.username} />
            <AvatarFallback className="text-xs">{(user.displayName || user.username).substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-sm text-ancient-gold">
            {(user.displayName || user.username).length > 8 
              ? `${(user.displayName || user.username).substring(0, 8)}...` 
              : user.displayName || user.username
            }
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
          className="border-ancient-gold text-ancient-gold hover:bg-ancient-gold hover:text-black"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <Button 
      onClick={handleConnect} 
      className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 text-white ${sizeClasses[size]} ${className}`}
    >
      <LogIn size={16} className="mr-2" />
      Connect Farcaster
    </Button>
  );
};

export default FarcasterConnect;
