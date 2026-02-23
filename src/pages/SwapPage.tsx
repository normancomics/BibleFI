import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import BiblicalDeFiSwap from '@/components/defi/BiblicalDeFiSwap';
import PriceChart from '@/components/swap/PriceChart';
import TokenBalances from '@/components/swap/TokenBalances';
import RecentTransactions from '@/components/swap/RecentTransactions';
import { motion } from 'framer-motion';
import { ArrowLeftRight, BookOpen } from 'lucide-react';

const SwapPage: React.FC = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');

  const handleSelectToken = (symbol: string) => {
    if (symbol !== toToken) {
      setFromToken(symbol);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <ArrowLeftRight className="h-7 w-7 text-ancient-gold" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-eboy-green to-ancient-gold bg-clip-text text-transparent">
              Swap
            </h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="italic">"Dishonest money dwindles away, but whoever gathers money little by little makes it grow." — Proverbs 13:11</span>
          </p>
        </motion.div>

        {/* Main Grid: Chart + Swap + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Chart + Recent Transactions */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <PriceChart fromToken={fromToken} toToken={toToken} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <RecentTransactions />
            </motion.div>
          </div>

          {/* Center: Swap Interface */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <BiblicalDeFiSwap />
            </motion.div>
          </div>

          {/* Right Column: Token Balances */}
          <div className="lg:col-span-4 order-3">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <TokenBalances onSelectToken={handleSelectToken} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SwapPage;
