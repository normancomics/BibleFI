
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Page imports
import Index from "@/pages/Index";
import WisdomPage from "@/pages/WisdomPage";
import StakingPage from "@/pages/StakingPage";
import TithePage from "@/pages/TithePage";
import TaxesPage from "@/pages/TaxesPage";
import DefiPage from "@/pages/DefiPage";
import NotFound from "@/pages/NotFound";
import AdminPage from "@/pages/AdminPage";

// Context providers
import { SoundProvider } from "@/contexts/SoundContext";
import SoundInitializer from "@/components/SoundInitializer";
import { FarcasterAuthProvider } from "@/farcaster/auth";

// Initialize QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <SoundProvider>
          <FarcasterAuthProvider>
            <Router>
              <SoundInitializer />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/wisdom" element={<WisdomPage />} />
                <Route path="/staking" element={<StakingPage />} />
                <Route path="/tithe" element={<TithePage />} />
                <Route path="/taxes" element={<TaxesPage />} />
                <Route path="/defi" element={<DefiPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </FarcasterAuthProvider>
        </SoundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
