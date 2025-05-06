import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import WisdomPage from "@/pages/WisdomPage";
import TithePage from "@/pages/TithePage";
import StakingPage from "@/pages/StakingPage";
import TaxesPage from "@/pages/TaxesPage";
import AdminPage from "@/pages/AdminPage";
import DefiPage from "@/pages/DefiPage";
import NotFound from "@/pages/NotFound";

import { SoundProvider } from "@/contexts/SoundContext";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <SoundProvider>
      <Router>
        <div className="app min-h-screen bg-background text-foreground overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wisdom" element={<WisdomPage />} />
            <Route path="/tithe" element={<TithePage />} />
            <Route path="/staking" element={<StakingPage />} />
            <Route path="/taxes" element={<TaxesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/defi" element={<DefiPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </SoundProvider>
  );
}

export default App;
