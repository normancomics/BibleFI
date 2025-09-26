import React from 'react';
import NavBar from '@/components/NavBar';
import GlobalChurchDatabase from '@/components/church/GlobalChurchDatabase';

const ChurchesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-scroll text-ancient-gold mb-4">
            Global Christian Church Network
          </h1>
          <p className="text-white/80 max-w-3xl mx-auto text-lg">
            Discover, search, and connect with Christian churches worldwide. Our comprehensive database 
            includes churches that accept cryptocurrency donations and traditional giving methods. 
            Help us build the most complete directory of Christian congregations on earth.
          </p>
        </div>

        <GlobalChurchDatabase />
      </main>
    </div>
  );
};

export default ChurchesPage;