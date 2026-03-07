import React from 'react';
import NavBar from '@/components/NavBar';
import WisdomLeaderboard from '@/components/wisdom/WisdomLeaderboard';
import { Trophy } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Wisdom Leaderboard
        </h1>
        <WisdomLeaderboard />
      </div>
    </div>
  );
};

export default LeaderboardPage;
