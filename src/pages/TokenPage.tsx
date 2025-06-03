
import React from 'react';
import NavBar from '@/components/NavBar';
import BibleTokenDashboard from '@/components/token/BibleTokenDashboard';

const TokenPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-scroll text-ancient-gold mb-2">
            $BIBLE Token
          </h1>
          <p className="text-white/80 max-w-2xl">
            Earn wisdom rewards through biblical DeFi participation with zero-knowledge privacy protection on Base Chain.
          </p>
        </div>
        
        <BibleTokenDashboard />
      </main>
    </div>
  );
};

export default TokenPage;
```
