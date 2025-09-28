import React from 'react';
import ComprehensiveBiblicalAdvisor from '@/components/wisdom/ComprehensiveBiblicalAdvisor';

const WisdomPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <ComprehensiveBiblicalAdvisor />
      </div>
    </div>
  );
};

export default WisdomPage;
