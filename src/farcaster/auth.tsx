
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthStatus, FarcasterUser } from './types';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

// Create a context for Farcaster authentication
interface FarcasterAuthContextType {
  user: FarcasterUser | null;
  status: AuthStatus;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const FarcasterAuthContext = createContext<FarcasterAuthContextType>({
  user: null,
  status: 'disconnected',
  signIn: async () => {},
  signOut: () => {},
});

export const useFarcasterAuth = () => useContext(FarcasterAuthContext);

interface FarcasterAuthProviderProps {
  children: ReactNode;
}

export const FarcasterAuthProvider: React.FC<FarcasterAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('disconnected');
  const { toast } = useToast();
  const { playSound } = useSound();

  // Check if the user is in a Farcaster client environment
  const isFarcasterClient = () => {
    return typeof window !== 'undefined' && !!window.addEventListener && 
           (window.location.href.includes('warpcast.com') || 
            window.navigator.userAgent.includes('Farcaster'));
  };

  useEffect(() => {
    // Check for existing session on load
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem('biblefi_farcaster_user');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setStatus('connected');
          console.log('Restored Farcaster session:', userData);
        } catch (error) {
          console.error('Failed to parse stored user data', error);
          localStorage.removeItem('biblefi_farcaster_user');
        }
      }
      
      // Auto-detect if we're in a Farcaster client
      if (isFarcasterClient()) {
        console.log('Detected Farcaster client environment');
        // In a real implementation, we would authenticate directly
      }
    };
    
    checkExistingSession();
  }, []);

  const signIn = async () => {
    try {
      setStatus('connecting');
      playSound('select');
      
      // For demo purposes, we're using mock data
      // In a real implementation, we would use @farcaster/auth-kit
      const mockUser: FarcasterUser = {
        fid: 12345,
        username: 'biblereader',
        displayName: 'Bible Reader',
        pfp: '/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png'
      };
      
      // Simulate delay for authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(mockUser);
      setStatus('connected');
      localStorage.setItem('biblefi_farcaster_user', JSON.stringify(mockUser));
      
      playSound('success');
      toast({
        title: 'Connected to Farcaster',
        description: `Welcome, ${mockUser.displayName || mockUser.username}!`,
      });
      
      return mockUser;
    } catch (error) {
      console.error('Farcaster sign in error:', error);
      setStatus('disconnected');
      
      playSound('error');
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to Farcaster. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const signOut = () => {
    playSound('select');
    setUser(null);
    setStatus('disconnected');
    localStorage.removeItem('biblefi_farcaster_user');
    
    toast({
      title: 'Disconnected',
      description: 'You have been signed out of Farcaster.',
    });
  };

  return (
    <FarcasterAuthContext.Provider value={{ user, status, signIn, signOut }}>
      {children}
    </FarcasterAuthContext.Provider>
  );
};
