import React from 'react';
import StreamlinedDefiHub from '@/components/defi/StreamlinedDefiHub';

const DefiPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <StreamlinedDefiHub />
      </div>
    </div>
  );
};

export default DefiPage;
