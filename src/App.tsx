
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DefiPage from "./pages/DefiPage";
import WisdomPage from "./pages/WisdomPage";
import TithePage from "./pages/TithePage";
import StakingPage from "./pages/StakingPage";
import TaxesPage from "./pages/TaxesPage";
import AdminPage from "./pages/AdminPage";
import BiblicalDefiPage from "./pages/BiblicalDefiPage";
import SecurityPage from "./pages/SecurityPage";
import { SoundProvider } from "./contexts/SoundContext";
import { SecurityProvider } from "./contexts/SecurityContext";
import { SecurityMonitorProvider } from "./contexts/SecurityMonitorContext";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import SoundInitializer from "./components/SoundInitializer";
import IOSAudioUnlocker from "./components/IOSAudioUnlocker";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <SecurityProvider>
        <SecurityMonitorProvider>
          <SoundProvider>
            <SoundInitializer />
            <IOSAudioUnlocker />
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/defi" element={<DefiPage />} />
                <Route path="/wisdom" element={<WisdomPage />} />
                <Route path="/tithe" element={<TithePage />} />
                <Route path="/staking" element={<StakingPage />} />
                <Route path="/taxes" element={<TaxesPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/biblical-defi" element={<BiblicalDefiPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </ThemeProvider>
          </SoundProvider>
        </SecurityMonitorProvider>
      </SecurityProvider>
    </BrowserRouter>
  );
}

export default App;
