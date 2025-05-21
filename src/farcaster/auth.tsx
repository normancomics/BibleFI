
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_CONFIG, FARCASTER_CONFIG } from './config';
import { SignInButton, SignOutButton, useProfile, AuthKitProvider } from '@farcaster/auth-kit';

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

  // Create a ref for SignIn and SignOut buttons
  const signInButtonRef = React.useRef<HTMLButtonElement>(null);
  const signOutButtonRef = React.useRef<HTMLButtonElement>(null);

  // Function to sign in
  const signIn = () => {
    setStatus('connecting');
    // Trigger the SignInButton click
    if (signInButtonRef.current) {
      signInButtonRef.current.click();
    }
  };

  // Function to sign out
  const signOut = () => {
    // Trigger the SignOutButton click
    if (signOutButtonRef.current) {
      signOutButtonRef.current.click();
    }
    setUser(null);
    setStatus('disconnected');
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
          <SignInButton ref={signInButtonRef} />
          <SignOutButton ref={signOutButtonRef} />
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
        pfp: profile.pfp,
        bio: profile.bio,
        custody: profile.custody,
        verifications: profile.verifications,
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
