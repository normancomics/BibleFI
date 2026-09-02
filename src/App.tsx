import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { MiniAppBootstrap } from "@/components/farcaster/MiniAppBootstrap";
import { SecurityProvider as EnhancedSecurityProvider } from "@/contexts/EnhancedSecurityContext";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import "./App.css";
import Index from "./pages/Index";

// Route-level code splitting: each page is its own chunk so the initial
// mobile load (Farcaster / Base App) does not download all 45 routes.
const HomePage = lazy(() => import("./pages/HomePage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage").then(m => ({ default: m.TermsOfServicePage })));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })));
const CompliancePage = lazy(() => import("./pages/CompliancePage").then(m => ({ default: m.CompliancePage })));
const TaxCompliancePage = lazy(() => import("./pages/TaxCompliancePage").then(m => ({ default: m.TaxCompliancePage })));
const EnhancedWisdomPage = lazy(() => import("./pages/EnhancedWisdomPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const DefiPage = lazy(() => import("./pages/DefiPage"));
const EnhancedDefiPage = lazy(() => import("./pages/EnhancedDefiPage"));
const StakingPage = lazy(() => import("./pages/StakingPage"));
const FarmingPage = lazy(() => import("./pages/FarmingPage"));
const TithePage = lazy(() => import("./pages/TithePage"));
const EnhancedTithePage = lazy(() => import("./pages/EnhancedTithePage"));
const WisdomPage = lazy(() => import("./pages/WisdomPage"));
const TaxesPage = lazy(() => import("./pages/TaxesPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const TokenPage = lazy(() => import("./pages/TokenPage"));
const WisdomTokenPage = lazy(() => import("./pages/WisdomTokenPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const ChurchesPage = lazy(() => import("./pages/ChurchesPage"));
const DeploymentPage = lazy(() => import("./pages/DeploymentPage"));
const BiblicalDefiPage = lazy(() => import("./pages/BiblicalDefiPage"));
const LiveDataPage = lazy(() => import("./pages/LiveDataPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const BiblicalStrategiesPage = lazy(() => import("./pages/BiblicalStrategiesPage"));
const QuantumSecurityPage = lazy(() => import("./pages/QuantumSecurityPage"));
const SystemCheckPage = lazy(() => import("./pages/SystemCheckPage"));
const DataCrawlerPage = lazy(() => import("./pages/DataCrawlerPage"));
const LaunchActionPlanPage = lazy(() => import("./pages/LaunchActionPlanPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ZKMonitorPage = lazy(() => import("./pages/ZKMonitorPage"));
const BiblicalFinanceEncyclopediaPage = lazy(() => import("./pages/BiblicalFinanceEncyclopediaPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const BWSPAgentsPage = lazy(() => import("./pages/BWSPAgentsPage"));
const BWTYAAgentsPage = lazy(() => import("./pages/BWTYAAgentsPage"));
const MCPNetworkPage = lazy(() => import("./pages/MCPNetworkPage"));
const SpandexAdvisoryPage = lazy(() => import("./pages/SpandexAdvisoryPage"));
const TerminalPage = lazy(() => import("./pages/TerminalPage"));
const SuperVaultPage = lazy(() => import("./pages/SuperVaultPage"));
const SuperBoringPage = lazy(() => import("./pages/SuperBoringPage"));
const SwapPage = lazy(() => import("./pages/SwapPage"));
const TechGraphsPage = lazy(() => import("./pages/TechGraphsPage"));
const ChurchOnboardingPage = lazy(() => import("./pages/ChurchOnboardingPage"));
const ChurchDashboardPage = lazy(() => import("./pages/ChurchDashboardPage"));

/** Shown while a lazily-loaded route chunk is being fetched. */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ancient-gold/30 border-t-ancient-gold" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <MiniAppBootstrap />
    <SecurityProvider>
      <EnhancedSecurityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouteErrorBoundary>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/defi" element={<EnhancedDefiPage />} />
            <Route path="/defi-classic" element={<DefiPage />} />
            <Route path="/staking" element={<StakingPage />} />
            <Route path="/farming" element={<FarmingPage />} />
            <Route path="/tithe" element={<TithePage />} />
            <Route path="/tithe-enhanced" element={<EnhancedTithePage />} />
            <Route path="/wisdom" element={<WisdomPage />} />
            <Route path="/enhanced-wisdom" element={<EnhancedWisdomPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/taxes" element={<TaxesPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/token" element={<TokenPage />} />
            <Route path="/wisdom-token" element={<WisdomTokenPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/deployment" element={<DeploymentPage />} />
            <Route path="/biblical-defi" element={<BiblicalDefiPage />} />
            <Route path="/biblical-strategies" element={<BiblicalStrategiesPage />} />
            <Route path="/quantum-security" element={<QuantumSecurityPage />} />
            <Route path="/system-check" element={<SystemCheckPage />} />
            <Route path="/churches" element={<ChurchesPage />} />
            <Route path="/church-onboarding" element={<ChurchOnboardingPage />} />
            <Route path="/church-dashboard" element={<ChurchDashboardPage />} />
            <Route path="/live-data" element={<LiveDataPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/data-crawler" element={<DataCrawlerPage />} />
            <Route path="/launch-plan" element={<LaunchActionPlanPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/tax-compliance" element={<TaxCompliancePage />} />
            <Route path="/zk-monitor" element={<ZKMonitorPage />} />
            <Route path="/biblical-finance" element={<BiblicalFinanceEncyclopediaPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/bwsp-agents" element={<BWSPAgentsPage />} />
            <Route path="/bwtya-agents" element={<BWTYAAgentsPage />} />
            <Route path="/mcp-network" element={<MCPNetworkPage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/spandex-advisory" element={<SpandexAdvisoryPage />} />
            <Route path="/terminal" element={<TerminalPage />} />
            <Route path="/vault" element={<SuperVaultPage />} />
            <Route path="/dca" element={<SuperBoringPage />} />
            <Route path="/tech-graphs" element={<TechGraphsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </TooltipProvider>
      </EnhancedSecurityProvider>
    </SecurityProvider>
  </ThemeProvider>
);

export default App;
