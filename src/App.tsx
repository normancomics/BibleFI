
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { SoundProvider } from '@/contexts/SoundContext';
import { FarcasterAuthProvider } from '@/farcaster/auth';
import HomePage from "@/pages/HomePage";
import WisdomPage from "@/pages/WisdomPage";
import DefiPage from "@/pages/DefiPage";
import BiblicalDefiPage from "@/pages/BiblicalDefiPage";
import TaxesPage from "@/pages/TaxesPage";
import TithePage from "@/pages/TithePage";
import AboutPage from "@/pages/AboutPage";
import FarmingPage from "@/pages/FarmingPage";
import DeploymentPage from "@/pages/DeploymentPage";

function App() {
  return (
    <FarcasterAuthProvider>
      <SoundProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wisdom" element={<WisdomPage />} />
            <Route path="/defi" element={<DefiPage />} />
            <Route path="/biblical-defi" element={<BiblicalDefiPage />} />
            <Route path="/tax" element={<TaxesPage />} />
            <Route path="/taxes" element={<TaxesPage />} />
            <Route path="/tithe" element={<TithePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/farming" element={<FarmingPage />} />
            <Route path="/deploy" element={<DeploymentPage />} />
            <Route path="/deployment" element={<DeploymentPage />} />
          </Routes>
        </Router>
      </SoundProvider>
    </FarcasterAuthProvider>
  );
}

export default App;
