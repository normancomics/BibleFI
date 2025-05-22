
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_CONFIG, FARCASTER_CONFIG } from './config';
import { SignInButton, useProfile, AuthKitProvider } from '@farcaster/auth-kit';

// Define the user type
export type FarcasterUser = {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
  bio?: string;
  custody?: string;
  verifications?: string[];
};

// Define the authentication state
type FarcasterAuthState = {
  user: FarcasterUser | null;
  status: 'connected' | 'connecting' | 'disconnected';
  signIn: () => void;
  signOut: () => void;
};

// Create context for Farcaster Auth
const FarcasterAuthContext = createContext<FarcasterAuthState>({
  user: null,
  status: 'disconnected',
  signIn: () => {},
  signOut: () => {},
});

// Create provider for Farcaster Auth
export const FarcasterAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  const config = {
    domain: FARCASTER_CONFIG.domain,
    siweUri: FARCASTER_CONFIG.siweUri,
    rpcUrl: FARCASTER_CONFIG.rpcUrl,
    relay: FARCASTER_CONFIG.relay,
    version: FARCASTER_CONFIG.version,
  };

  // Create a ref for SignIn button
  const signInButtonRef = React.useRef<HTMLButtonElement>(null);

  // Function to sign in
  const signIn = () => {
    setStatus('connecting');
    // Trigger the SignInButton click
    if (signInButtonRef.current) {
      signInButtonRef.current.click();
    }
  };

  // Function to sign out - Uses the native signOut method
  const signOut = () => {
    // We'll implement our own sign out logic
    localStorage.removeItem('farcaster-auth-token');
    setUser(null);
    setStatus('disconnected');
    
    // Reload to clear the auth state completely
    // This is a simple approach but works for Farcaster auth
    window.location.reload();
  };

  return (
    <FarcasterAuthContext.Provider
      value={{
        user,
        status,
        signIn,
        signOut,
      }}
    >
      <AuthKitProvider config={config}>
        <div style={{ display: 'none' }}>
          <SignInButton 
            onSuccess={(res) => {
              console.log('SignIn successful:', res);
            }}
            onError={(error) => {
              console.error('SignIn error:', error);
              setStatus('disconnected');
            }}
          />
          <button ref={signInButtonRef} onClick={() => {
            // Find the real SignInButton and click it
            const realButton = document.querySelector('[data-testid="farcaster-signinbutton"]');
            if (realButton && realButton instanceof HTMLElement) {
              realButton.click();
            }
          }} style={{display: 'none'}}>Hidden Trigger</button>
        </div>
        <FarcasterProfileWrapper setUser={setUser} setStatus={setStatus} />
        {children}
      </AuthKitProvider>
    </FarcasterAuthContext.Provider>
  );
};

// Wrapper component to use the useProfile hook
const FarcasterProfileWrapper: React.FC<{
  setUser: React.Dispatch<React.SetStateAction<FarcasterUser | null>>;
  setStatus: React.Dispatch<React.SetStateAction<'connected' | 'connecting' | 'disconnected'>>;
}> = ({ setUser, setStatus }) => {
  const { isAuthenticated, profile } = useProfile();

  useEffect(() => {
    if (isAuthenticated && profile) {
      setUser({
        fid: profile.fid,
        username: profile.username || `user_${profile.fid}`,
        displayName: profile.displayName || profile.username,
        pfp: profile.pfpUrl || '', // Fixed property name to match Farcaster auth-kit types
        bio: profile.bio || '',
        custody: profile.custody || '', // Fixed property access
        verifications: profile.verifications || [],
      });
      setStatus('connected');
    } else if (!isAuthenticated) {
      setUser(null);
      setStatus('disconnected');
    }
  }, [isAuthenticated, profile, setStatus, setUser]);

  return null;
};

// Custom hook to use Farcaster Auth
export const useFarcasterAuth = () => useContext(FarcasterAuthContext);
