import React from "react";
import NavBar from "@/components/NavBar";
import ChurchTreasuryDashboard from "@/components/church/ChurchTreasuryDashboard";

const ChurchDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-scroll text-ancient-gold mb-3">
            Church Treasury Dashboard
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Every tithe, every Tap-To-Pay card, and every unswept BWTYA yield in one faithful ledger.
            "Moreover it is required in stewards, that a man be found faithful" (1 Corinthians 4:2).
          </p>
        </div>
        <ChurchTreasuryDashboard />
      </main>
    </div>
  );
};

export default ChurchDashboardPage;
