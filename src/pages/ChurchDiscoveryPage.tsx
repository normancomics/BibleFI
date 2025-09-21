import React from 'react';
import NavBar from '@/components/NavBar';
import EnhancedChurchCrawler from '@/components/church/EnhancedChurchCrawler';

const ChurchDiscoveryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-scroll text-ancient-gold mb-4">
            Global Church Discovery
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Discover Christian churches worldwide that accept crypto donations and support modern giving methods. 
            Find your spiritual home and connect with congregations that embrace digital stewardship.
          </p>
        </div>

        <EnhancedChurchCrawler />
      </main>
    </div>
  );
};

export default ChurchDiscoveryPage;