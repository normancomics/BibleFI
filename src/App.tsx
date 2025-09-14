
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SoundProvider } from "@/contexts/SoundContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DefiPage from "./pages/DefiPage";
import StakingPage from "./pages/StakingPage";
import FarmingPage from "./pages/FarmingPage";
import TithePage from "./pages/TithePage";
import WisdomPage from "./pages/WisdomPage";
import TaxesPage from "./pages/TaxesPage";
import SecurityPage from "./pages/SecurityPage";
import TokenPage from "./pages/TokenPage";
import AdminPage from "./pages/AdminPage";
import DeploymentPage from "./pages/DeploymentPage";
import BiblicalDefiPage from "./pages/BiblicalDefiPage";
import BrandingPage from "./pages/BrandingPage";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SecurityProvider>
        <SoundProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/defi" element={<DefiPage />} />
              <Route path="/staking" element={<StakingPage />} />
              <Route path="/farming" element={<FarmingPage />} />
              <Route path="/tithe" element={<TithePage />} />
              <Route path="/wisdom" element={<WisdomPage />} />
              <Route path="/taxes" element={<TaxesPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/token" element={<TokenPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/deployment" element={<DeploymentPage />} />
              <Route path="/biblical-defi" element={<BiblicalDefiPage />} />
              <Route path="/branding" element={<BrandingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </SoundProvider>
      </SecurityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
