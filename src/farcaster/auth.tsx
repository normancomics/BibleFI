
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { FARCASTER_CONFIG } from "./config";
import { FarcasterUser, AuthStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

interface FarcasterAuthContextType {
  user: FarcasterUser | null;
  status: AuthStatus;
  signIn: () => Promise<void>; // Changed return type to void
  signOut: () => void;
  updateUser: (user: FarcasterUser) => void;
}

const defaultContext: FarcasterAuthContextType = {
  user: null,
  status: "disconnected",
  signIn: async () => {}, // Now returns void
  signOut: () => {},
  updateUser: () => {},
};

const FarcasterAuthContext = createContext<FarcasterAuthContextType>(defaultContext);

interface FarcasterAuthProviderProps {
  children: ReactNode;
}

export const FarcasterAuthProvider: React.FC<FarcasterAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("disconnected");
  const { toast } = useToast();
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("farcaster_user");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setStatus("connected");
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("farcaster_user");
      }
    }
  }, []);

  // Mock implementation of Farcaster auth
  // In a real app, you would use @farcaster/auth-kit
  const signIn = async (): Promise<void> => {
    try {
      setStatus("connecting");
      
      // Mock user data - in a real implementation, this would come from Farcaster auth
      const mockUser: FarcasterUser = {
        fid: 12345,
        username: "demo_user",
        displayName: "Demo User",
        pfp: "https://i.imgur.com/pBDThdn.png"
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state
      setUser(mockUser);
      setStatus("connected");
      
      // Store in localStorage for persistence
      localStorage.setItem("farcaster_user", JSON.stringify(mockUser));
      
      toast({
        title: "Connected to Farcaster",
        description: `Welcome, ${mockUser.displayName || mockUser.username}!`,
      });
      
      // Return the user (though it's not used in this version)
      return;
    } catch (error) {
      console.error("Farcaster auth error:", error);
      setStatus("disconnected");
      
      toast({
        title: "Connection Failed",
        description: "Could not connect to Farcaster. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setStatus("disconnected");
    localStorage.removeItem("farcaster_user");
    
    toast({
      title: "Disconnected",
      description: "You've been signed out of Farcaster.",
    });
  };

  const updateUser = (updatedUser: FarcasterUser) => {
    setUser(updatedUser);
    localStorage.setItem("farcaster_user", JSON.stringify(updatedUser));
  };

  return (
    <FarcasterAuthContext.Provider value={{ user, status, signIn, signOut, updateUser }}>
      {children}
    </FarcasterAuthContext.Provider>
  );
};

export const useFarcasterAuth = () => useContext(FarcasterAuthContext);
