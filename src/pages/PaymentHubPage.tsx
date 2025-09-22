import React from 'react';
import NavBar from '@/components/NavBar';
import ComprehensivePaymentHub from '@/components/payment/ComprehensivePaymentHub';
import CostOptimizedPaymentHub from '@/components/payment/CostOptimizedPaymentHub';

const PaymentHubPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-scroll text-ancient-gold mb-4">
            Payment Hub
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Multiple payment options for tithing and donations. Choose from crypto, fiat, mobile payments, 
            and more to support your church in the way that works best for you.
          </p>
        </div>

        <CostOptimizedPaymentHub />
      </main>
    </div>
  );
};

export default PaymentHubPage;