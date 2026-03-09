import React from 'react';
import NavBar from '@/components/NavBar';
import DefiOpportunitiesDashboard from '@/components/defi/DefiOpportunitiesDashboard';

const DefiOpportunitiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <DefiOpportunitiesDashboard />
    </div>
  );
};

export default DefiOpportunitiesPage;
