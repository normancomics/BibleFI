import React from 'react';
import NavBar from '@/components/NavBar';
import BuilderScoreDashboard from '@/components/dashboard/BuilderScoreDashboard';

const BuilderScorePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Builder Score Dashboard
        </h1>
        <p className="text-muted-foreground mb-6">
          Powered by Talent Protocol — Reputation-based APY multipliers for faithful builders.
        </p>
        <BuilderScoreDashboard />
      </main>
    </div>
  );
};

export default BuilderScorePage;
