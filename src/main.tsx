// Polyfills must be first
import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { WalletProvider } from '@/contexts/WalletContext';
import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

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
            <WalletProvider>
              <App />
            </WalletProvider>
          </BrowserRouter>
        </WagmiProvider>
      </AuthKitProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
