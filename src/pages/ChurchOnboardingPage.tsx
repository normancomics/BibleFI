import React from "react";
import NavBar from "@/components/NavBar";
import ChurchOnboardingFlow from "@/components/church/ChurchOnboardingFlow";

const ChurchOnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-scroll text-ancient-gold mb-3">
            Church Onboarding
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Register your congregation, order branded Burner.pro Tap-To-Pay cards, and watch every tithe arrive —
            transparent, fee-light, and settled straight to your own wallet.
          </p>
        </div>
        <ChurchOnboardingFlow />
      </main>
    </div>
  );
};

export default ChurchOnboardingPage;
