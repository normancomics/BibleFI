
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { SoundProvider } from '@/contexts/SoundContext';
import HomePage from "@/pages/HomePage";
import WisdomPage from "@/pages/WisdomPage";
import DefiPage from "@/pages/DefiPage";
import TaxesPage from "@/pages/TaxesPage";
import TithePage from "@/pages/TithePage";
import AboutPage from "@/pages/AboutPage";
import FarmingPage from "@/pages/FarmingPage";

function App() {
  return (
    <SoundProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wisdom" element={<WisdomPage />} />
          <Route path="/defi" element={<DefiPage />} />
          <Route path="/tax" element={<TaxesPage />} />
          <Route path="/taxes" element={<TaxesPage />} />
          <Route path="/tithe" element={<TithePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/farming" element={<FarmingPage />} />
        </Routes>
      </Router>
    </SoundProvider>
  );
}

export default App;
