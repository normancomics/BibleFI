import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { SecurityProvider as EnhancedSecurityProvider } from "@/contexts/EnhancedSecurityContext";
import { useFarcasterFrame } from "@/hooks/useFarcasterFrame";
import Index from "./pages/Index";
import AdminGuard from "./components/auth/AdminGuard";
import "./App.css";

// Farcaster Frame auto-connect initializer (runs inside WalletProvider)
function FarcasterFrameInit() {
  useFarcasterFrame();
  return null;
}

// Lazy-load all pages for code splitting
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
const BuilderScorePage = lazy(() => import("./pages/BuilderScorePage"));
const SwapPage = lazy(() => import("./pages/SwapPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const DefiOpportunitiesPage = lazy(() => import("./pages/DefiOpportunitiesPage"));
const ScriptureIntegrityPage = lazy(() => import("./pages/ScriptureIntegrityPage"));
const BWSPDashboard = lazy(() => import("./pages/BWSPDashboard"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-2 border-ancient-gold border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground font-scroll">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <SecurityProvider>
      <EnhancedSecurityProvider>
        <TooltipProvider>
          <FarcasterFrameInit />
          <Toaster />
          <Sonner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/defi" element={<EnhancedDefiPage />} />
              <Route path="/swap" element={<SwapPage />} />
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
              <Route path="/admin" element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
              <Route path="/deployment" element={<AdminGuard><DeploymentPage /></AdminGuard>} />
              <Route path="/biblical-defi" element={<BiblicalDefiPage />} />
              <Route path="/biblical-strategies" element={<BiblicalStrategiesPage />} />
              <Route path="/quantum-security" element={<QuantumSecurityPage />} />
              <Route path="/system-check" element={<SystemCheckPage />} />
              <Route path="/churches" element={<ChurchesPage />} />
              <Route path="/live-data" element={<AdminGuard><LiveDataPage /></AdminGuard>} />
              <Route path="/analytics" element={<AdminGuard><AnalyticsPage /></AdminGuard>} />
              <Route path="/data-crawler" element={<AdminGuard><DataCrawlerPage /></AdminGuard>} />
              <Route path="/launch-plan" element={<AdminGuard><LaunchActionPlanPage /></AdminGuard>} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/tax-compliance" element={<TaxCompliancePage />} />
              <Route path="/zk-monitor" element={<ZKMonitorPage />} />
              <Route path="/biblical-finance" element={<BiblicalFinanceEncyclopediaPage />} />
              <Route path="/builder-score" element={<BuilderScorePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/defi-opportunities" element={<DefiOpportunitiesPage />} />
              <Route path="/scripture-integrity" element={<AdminGuard><ScriptureIntegrityPage /></AdminGuard>} />
              <Route path="/bwsp-dashboard" element={<BWSPDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </EnhancedSecurityProvider>
    </SecurityProvider>
  </ThemeProvider>
);

export default App;
