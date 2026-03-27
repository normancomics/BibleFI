import React from 'react';
import NavBar from '@/components/NavBar';
import SuperfluidTokenLaunch from '@/components/token/SuperfluidTokenLaunch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BookOpen } from 'lucide-react';

const SuperfluidTokensPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold font-scroll text-white">
              Superfluid Native Tokens
            </h1>
          </div>
          <p className="text-white/70 max-w-3xl mx-auto text-lg">
            $BIBLEFI · $WISDOM · $xBIBLEFI · $xWISDOM — the four-token ecosystem
            powering real-time biblical finance on Base chain via Superfluid.
          </p>
        </div>

        {/* Biblical context */}
        <Card className="border-ancient-gold/30 bg-black/40 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-ancient-gold">
              <BookOpen className="w-5 h-5" />
              The Biblical Case for Streaming Finance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
            <div className="space-y-3">
              <blockquote className="border-l-2 border-ancient-gold/50 pl-3 italic">
                "Each of you should give what you have decided in your heart to give, not
                reluctantly or under compulsion, for God loves a cheerful giver."
                <footer className="text-ancient-gold/70 mt-1 not-italic">— 2 Corinthians 9:7</footer>
              </blockquote>
              <p>
                Superfluid's per-second money streams mirror the biblical principle of
                continuous, faithful giving — removing the friction of periodic lump-sum
                transfers and making stewardship automatic.
              </p>
            </div>
            <div className="space-y-3">
              <blockquote className="border-l-2 border-ancient-gold/50 pl-3 italic">
                {"\"Bring the whole tithe into the storehouse\u2026 and see if I will not throw open the floodgates of heaven and pour out so much blessing.\""}
                <footer className="text-ancient-gold/70 mt-1 not-italic">— Malachi 3:10</footer>
              </blockquote>
              <p>
                $WISDOM streaming rewards continuously flow to faithful users — a digital
                fulfillment of blessings poured out for consistent stewardship.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main token launch component */}
        <SuperfluidTokenLaunch />
      </main>
    </div>
  );
};

export default SuperfluidTokensPage;
