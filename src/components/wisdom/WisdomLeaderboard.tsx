import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Crown, Share2, ExternalLink, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WISDOM_LEVELS, type WisdomLevel } from '@/types/wisdomProgression';

interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  wisdomScore: number;
  level: WisdomLevel;
  totalTithed: string;
  streak: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: '0x7bEd...aF08', displayName: 'FaithfulSteward.eth', wisdomScore: 962, level: 'elder', totalTithed: '$12,450', streak: 52 },
  { rank: 2, address: '0xA3c1...9B22', displayName: 'KingdomBuilder', wisdomScore: 891, level: 'elder', totalTithed: '$9,800', streak: 38 },
  { rank: 3, address: '0x12eF...4D11', displayName: 'GraceGiver.base', wisdomScore: 847, level: 'elder', totalTithed: '$8,200', streak: 44 },
  { rank: 4, address: '0xF8a2...7C33', displayName: 'ProverbsWalker', wisdomScore: 783, level: 'elder', totalTithed: '$7,100', streak: 31 },
  { rank: 5, address: '0x55bD...eE01', displayName: 'TitheFaithful', wisdomScore: 721, level: 'elder', totalTithed: '$6,500', streak: 27 },
  { rank: 6, address: '0xCC92...1A44', displayName: 'Psalm23Investor', wisdomScore: 654, level: 'elder', totalTithed: '$5,300', streak: 22 },
  { rank: 7, address: '0x9901...bB77', displayName: 'MustardSeed.eth', wisdomScore: 598, level: 'shepherd', totalTithed: '$4,800', streak: 19 },
  { rank: 8, address: '0x4422...dD88', displayName: 'StewardOfGrace', wisdomScore: 543, level: 'shepherd', totalTithed: '$3,900', streak: 16 },
  { rank: 9, address: '0xBB11...9F55', displayName: 'WisdomSeeker42', wisdomScore: 487, level: 'shepherd', totalTithed: '$3,200', streak: 12 },
  { rank: 10, address: '0x6677...2C99', displayName: 'BlessedGiver', wisdomScore: 420, level: 'shepherd', totalTithed: '$2,700', streak: 9 },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-[hsl(var(--sacred-gold))]" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-[hsl(24,60%,50%)]" />;
  return <span className="text-sm text-muted-foreground font-medium">#{rank}</span>;
}

function getLevelBadgeColor(level: WisdomLevel): string {
  switch (level) {
    case 'solomon': return 'bg-primary/20 text-primary border-primary/30';
    case 'elder': return 'bg-accent/20 text-accent-foreground border-accent/30';
    case 'shepherd': return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    case 'steward': return 'bg-muted/40 text-muted-foreground border-muted/30';
    default: return 'bg-muted/20 text-muted-foreground border-muted/20';
  }
}

const WisdomLeaderboard: React.FC = () => {
  const { toast } = useToast();
  const [sharing, setSharing] = useState<number | null>(null);

  const shareRanking = useCallback(async (entry: LeaderboardEntry) => {
    setSharing(entry.rank);
    const castText = `🏆 BibleFi Wisdom Leaderboard\n\n${entry.displayName} is ranked #${entry.rank} with a Wisdom Score of ${entry.wisdomScore}/1000 (${WISDOM_LEVELS[entry.level].name})!\n\n"${WISDOM_LEVELS[entry.level].verse}" — ${WISDOM_LEVELS[entry.level].reference}\n\nBiblical wisdom meets DeFi on @base 🔵\n\n@biblefi`;

    try {
      const encoded = encodeURIComponent(castText);
      window.open(`https://warpcast.com/~/compose?text=${encoded}`, '_blank');
      toast({ title: 'Cast composer opened! 🚀', description: 'Share the ranking on Farcaster.' });
    } catch {
      toast({ title: 'Could not open Warpcast', variant: 'destructive' });
    } finally {
      setSharing(null);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_LEADERBOARD.slice(0, 3).map((entry) => (
          <Card
            key={entry.rank}
            className={`border-border bg-card relative overflow-hidden ${
              entry.rank === 1 ? 'md:order-2 ring-2 ring-primary/40' : entry.rank === 2 ? 'md:order-1' : 'md:order-3'
            }`}
          >
            {entry.rank === 1 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-[hsl(var(--sacred-gold))] to-primary" />
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2">{getRankIcon(entry.rank)}</div>
              <CardTitle className="text-lg text-card-foreground">{entry.displayName}</CardTitle>
              <CardDescription className="text-xs">{entry.address}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="text-3xl font-bold text-foreground">{entry.wisdomScore}</div>
              <Badge variant="outline" className={getLevelBadgeColor(entry.level)}>
                {WISDOM_LEVELS[entry.level].name}
              </Badge>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span>Tithed: {entry.totalTithed}</span>
                <span>🔥 {entry.streak}w streak</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5"
                disabled={sharing === entry.rank}
                onClick={() => shareRanking(entry)}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Share on Farcaster
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Full Rankings
          </CardTitle>
          <CardDescription>
            "The plans of the diligent lead to profit" — Proverbs 21:5
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="hidden sm:table-cell">Level</TableHead>
                <TableHead className="hidden md:table-cell text-right">Tithed</TableHead>
                <TableHead className="hidden md:table-cell text-right">Streak</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LEADERBOARD.map((entry) => (
                <TableRow key={entry.rank}>
                  <TableCell className="font-medium">{getRankIcon(entry.rank)}</TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{entry.displayName}</div>
                    <div className="text-xs text-muted-foreground">{entry.address}</div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">{entry.wisdomScore}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={getLevelBadgeColor(entry.level)}>
                      {WISDOM_LEVELS[entry.level].name}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-muted-foreground">{entry.totalTithed}</TableCell>
                  <TableCell className="hidden md:table-cell text-right text-muted-foreground">🔥 {entry.streak}w</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => shareRanking(entry)}
                      disabled={sharing === entry.rank}
                      aria-label={`Share ${entry.displayName}'s ranking on Farcaster`}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WisdomLeaderboard;
