import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share2, Trophy, TrendingUp, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';

interface CastTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  generateText: (data: MilestoneData) => string;
}

interface MilestoneData {
  wisdomScore?: number;
  wisdomBand?: string;
  totalInvested?: string;
  totalYield?: string;
  titheStreaming?: boolean;
  poolName?: string;
}

const CAST_TEMPLATES: CastTemplate[] = [
  {
    id: 'wisdom-score',
    label: 'Wisdom Score',
    icon: <Trophy className="h-4 w-4" />,
    generateText: (d) =>
      `📖 My BibleFi Wisdom Score: ${d.wisdomScore ?? 0}/1000 (${d.wisdomBand ?? 'Beginner'})\n\n"The fear of the LORD is the beginning of wisdom" — Proverbs 9:10\n\nBiblical wisdom meets DeFi on @base 🔵\n\n@biblefi`,
  },
  {
    id: 'investment',
    label: 'Investment Milestone',
    icon: <TrendingUp className="h-4 w-4" />,
    generateText: (d) =>
      `🌱 Investing with Biblical wisdom on BibleFi!\n\n"The plans of the diligent lead to profit" — Proverbs 21:5\n\nGrowing wealth God's way on @base 🔵\n\n@biblefi`,
  },
  {
    id: 'tithe',
    label: 'Tithing Active',
    icon: <Sparkles className="h-4 w-4" />,
    generateText: () =>
      `💛 Automated tithing is live via Superfluid streams on BibleFi!\n\n"Bring the whole tithe into the storehouse" — Malachi 3:10\n\nFaithful stewardship, powered by DeFi on @base 🔵\n\n@biblefi`,
  },
  {
    id: 'custom',
    label: 'Custom Wisdom',
    icon: <BookOpen className="h-4 w-4" />,
    generateText: () => '',
  },
];

const CastComposer: React.FC = () => {
  const [castText, setCastText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const { toast } = useToast();
  const { isConnected } = useWallet();

  // Mock milestone data — in production, pull from contracts
  const milestoneData: MilestoneData = {
    wisdomScore: 420,
    wisdomBand: 'Faithful',
    totalInvested: '$2,500',
    totalYield: '$185',
    titheStreaming: true,
  };

  const selectTemplate = useCallback(
    (templateId: string) => {
      setSelectedTemplate(templateId);
      const template = CAST_TEMPLATES.find((t) => t.id === templateId);
      if (template && templateId !== 'custom') {
        setCastText(template.generateText(milestoneData));
      } else {
        setCastText('');
      }
    },
    [milestoneData],
  );

  const publishCast = useCallback(async () => {
    if (!castText.trim()) {
      toast({ title: 'Empty cast', description: 'Write something to share!' });
      return;
    }

    setIsCasting(true);

    try {
      // Try Frame SDK composeCast (works inside Warpcast)
      const frameSdk = await import('@farcaster/frame-sdk').catch(() => null);
      const sdk = frameSdk?.default || (frameSdk as any)?.sdk;

      if (sdk?.actions?.openUrl) {
        // Compose via Warpcast deep link (works everywhere)
        const encoded = encodeURIComponent(castText);
        const warpcastUrl = `https://warpcast.com/~/compose?text=${encoded}`;
        await sdk.actions.openUrl(warpcastUrl);
      } else {
        // Fallback: open Warpcast compose in new tab
        const encoded = encodeURIComponent(castText);
        window.open(`https://warpcast.com/~/compose?text=${encoded}`, '_blank');
      }

      toast({
        title: 'Cast composer opened! 🚀',
        description: 'Complete your cast in Warpcast.',
      });
    } catch {
      // Final fallback
      const encoded = encodeURIComponent(castText);
      window.open(`https://warpcast.com/~/compose?text=${encoded}`, '_blank');
      toast({
        title: 'Cast composer opened! 🚀',
        description: 'Complete your cast in Warpcast.',
      });
    } finally {
      setIsCasting(false);
    }
  }, [castText, toast]);

  const charCount = castText.length;
  const maxChars = 1024;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Share2 className="h-5 w-5 text-primary" />
          Cast to Farcaster
        </CardTitle>
        <CardDescription>
          Share your Wisdom Score, milestones, or Biblical financial insights as a Farcaster cast
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template selector */}
        <div className="flex flex-wrap gap-2">
          {CAST_TEMPLATES.map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={selectedTemplate === t.id ? 'default' : 'outline'}
              onClick={() => selectTemplate(t.id)}
              className="gap-1.5"
            >
              {t.icon}
              {t.label}
            </Button>
          ))}
        </div>

        {/* Composer */}
        <div className="relative">
          <Textarea
            placeholder="Write your cast… Share Biblical wisdom with the Farcaster community"
            value={castText}
            onChange={(e) => setCastText(e.target.value)}
            className="min-h-[140px] resize-none bg-background text-foreground"
            maxLength={maxChars}
          />
          <span
            className={`absolute bottom-2 right-3 text-xs ${
              charCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {charCount}/{maxChars}
          </span>
        </div>

        {/* Wisdom Score preview badge */}
        {milestoneData.wisdomScore !== undefined && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Your Wisdom Score:</span>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {milestoneData.wisdomScore}/1000
            </Badge>
            <Badge variant="outline" className="text-xs">
              {milestoneData.wisdomBand}
            </Badge>
          </div>
        )}

        {/* Publish button */}
        <Button
          onClick={publishCast}
          disabled={isCasting || !castText.trim()}
          className="w-full gap-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
        >
          {isCasting ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Opening Warpcast…
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Cast on Farcaster
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Opens Warpcast composer with your message pre-filled
        </p>
      </CardContent>
    </Card>
  );
};

export default CastComposer;
