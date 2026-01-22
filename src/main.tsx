// Polyfills must be first
import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { SoundProvider } from '@/contexts/SoundContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { WalletErrorBoundary } from '@/components/wallet/WalletErrorBoundary';
import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
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
    <QueryClientProvider client={queryClient}>
      <AuthKitProvider config={authKitConfig}>
        <WagmiProvider config={config}>
          <BrowserRouter>
            <SoundProvider>
              <WalletErrorBoundary>
                <WalletProvider>
                  <App />
                </WalletProvider>
              </WalletErrorBoundary>
            </SoundProvider>
          </BrowserRouter>
        </WagmiProvider>
      </AuthKitProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
