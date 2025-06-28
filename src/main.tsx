
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SoundContextProvider } from "@/contexts/SoundContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { FarcasterAuthProvider } from "@/farcaster/auth";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <SecurityProvider>
              <SoundContextProvider>
                <FarcasterAuthProvider>
                  <App />
                  <Toaster />
                </FarcasterAuthProvider>
              </SoundContextProvider>
            </SecurityProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
