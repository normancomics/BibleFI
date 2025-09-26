
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SoundProvider } from "@/contexts/SoundContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { WalletProvider } from '@/contexts/WalletContext';
import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import App from "./App";
import "./index.css";
import "./polyfills";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const authKitConfig = {
  rpcUrl: 'https://base.rpc.subquery.network/public',
  domain: typeof window !== 'undefined' ? window.location.hostname : 'fa7c5ef0-7079-46e3-a705-c9b6e519b067.lovableproject.com',
  siweUri: typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : 'https://fa7c5ef0-7079-46e3-a705-c9b6e519b067.lovableproject.com/api/auth/callback',
  relay: 'https://relay.farcaster.xyz',
  version: 'vNext',
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthKitProvider config={authKitConfig}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <SecurityProvider>
                <SoundProvider>
                  <WalletProvider>
                    <App />
                    <Toaster />
                  </WalletProvider>
                </SoundProvider>
              </SecurityProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </AuthKitProvider>
  </React.StrictMode>
);
