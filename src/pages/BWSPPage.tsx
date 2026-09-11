import React from 'react';
import NavBar from '@/components/NavBar';
import BwspSynthesisFlow from '@/components/bwsp/BwspSynthesisFlow';

const BWSPPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <NavBar />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-ancient-gold">Biblical Wisdom</h1>
          <p className="text-white/80">
            "If any of you lack wisdom, let him ask of God" — James 1:5
          </p>
        </header>
        <BwspSynthesisFlow />
      </div>
    </div>
  );
};

export default BWSPPage;
