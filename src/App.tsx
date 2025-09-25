
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SoundProvider } from "@/contexts/SoundContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { SecurityProvider as EnhancedSecurityProvider } from "@/contexts/EnhancedSecurityContext";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import EnhancedWisdomPage from "./pages/EnhancedWisdomPage";
import WalletPage from "./pages/WalletPage";
import AboutPage from "./pages/AboutPage";
import DefiPage from "./pages/DefiPage";
import EnhancedDefiPage from "./pages/EnhancedDefiPage";
import StakingPage from "./pages/StakingPage";
import FarmingPage from "./pages/FarmingPage";
import TithePage from "./pages/TithePage";
import EnhancedTithePage from "./pages/EnhancedTithePage";
import WisdomPage from "./pages/WisdomPage";
import TaxesPage from "./pages/TaxesPage";
import SecurityPage from "./pages/SecurityPage";
import TokenPage from "./pages/TokenPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DeploymentPage from "./pages/DeploymentPage";
import BiblicalDefiPage from "./pages/BiblicalDefiPage";
import LiveDataPage from "./pages/LiveDataPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BiblicalStrategiesPage from "./pages/BiblicalStrategiesPage";
import QuantumSecurityPage from "./pages/QuantumSecurityPage";
import SystemCheckPage from "./pages/SystemCheckPage";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SecurityProvider>
          <EnhancedSecurityProvider>
            <SoundProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/defi" element={<EnhancedDefiPage />} />
              <Route path="/defi-classic" element={<DefiPage />} />
              <Route path="/staking" element={<StakingPage />} />
              <Route path="/farming" element={<FarmingPage />} />
              <Route path="/tithe" element={<EnhancedTithePage />} />
              <Route path="/tithe-classic" element={<TithePage />} />
              <Route path="/wisdom" element={<WisdomPage />} />
              <Route path="/enhanced-wisdom" element={<EnhancedWisdomPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/taxes" element={<TaxesPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/token" element={<TokenPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/deployment" element={<DeploymentPage />} />
              <Route path="/biblical-defi" element={<BiblicalDefiPage />} />
              <Route path="/biblical-strategies" element={<BiblicalStrategiesPage />} />
              <Route path="/quantum-security" element={<QuantumSecurityPage />} />
              <Route path="/system-check" element={<SystemCheckPage />} />
        <Route path="/live-data" element={<LiveDataPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
            </SoundProvider>
          </EnhancedSecurityProvider>
        </SecurityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
