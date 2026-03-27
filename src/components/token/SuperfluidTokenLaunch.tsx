import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  Coins,
  BookOpen,
  Shield,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  ExternalLink,
  Award,
  Lock,
} from 'lucide-react';

// ─────────────────────────────────────────────────────── types ──

interface TokenInfo {
  symbol: string;
  name: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
  type: 'governance' | 'rewards' | 'super-governance' | 'super-rewards';
  maxSupply: string;
  description: string;
  scripture: string;
  scriptureRef: string;
  superfluidFeatures: string[];
  earningMethods?: Array<{ action: string; reward: string }>;
  distribution?: Array<{ label: string; pct: string; amount: string }>;
  tiers?: Array<{ name: string; requirement: string; multiplier: string; color: string }>;
  daoUse?: string[];
  deploymentStatus: 'deployed' | 'pending' | 'coming-soon';
}

// ─────────────────────────────────────────────────────── data ──

const TOKENS: TokenInfo[] = [
  {
    symbol: 'BIBLEFI',
    name: 'BibleFi Governance Token',
    emoji: '👑',
    color: 'text-ancient-gold',
    borderColor: 'border-ancient-gold/50',
    bgColor: 'bg-ancient-gold/10',
    type: 'governance',
    maxSupply: '1,000,000,000',
    description:
      'The primary governance token for the BibleFi protocol. Holders vote on protocol upgrades, church partnership approvals, treasury allocations, and BWSP parameter changes. Designed as a Superfluid-native ERC-20 that can be wrapped into $xBIBLEFI for real-time streaming distributions.',
    scripture: '"The plans of the diligent lead to profit as surely as haste leads to poverty."',
    scriptureRef: 'Proverbs 21:5',
    superfluidFeatures: [
      'Can be wrapped into $xBIBLEFI Super Token via Superfluid factory',
      'Enables real-time governance-weight streaming to DAO participants',
      'Compatible with Superfluid IDA/GDA pools for proportional distributions',
      'ERC20Votes extension for on-chain governance (EIP-712 signatures)',
      'SUP/$BIBLEFI pool on Aerodrome (Base) for ecosystem liquidity',
    ],
    distribution: [
      { label: 'Community Rewards', pct: '40%', amount: '400,000,000' },
      { label: 'Development & Ops', pct: '30%', amount: '300,000,000' },
      { label: 'Church Partnerships', pct: '15%', amount: '150,000,000' },
      { label: 'Team (4-yr vest, 1-yr cliff)', pct: '10%', amount: '100,000,000' },
      { label: 'Early Supporters', pct: '5%', amount: '50,000,000' },
    ],
    deploymentStatus: 'pending',
  },
  {
    symbol: 'WISDOM',
    name: 'BibleFi Wisdom Rewards Token',
    emoji: '📖',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-900/10',
    type: 'rewards',
    maxSupply: '1,000,000,000',
    description:
      'Earned — not purchased — through biblical financial faithfulness. $WISDOM tokens are minted by the protocol oracle when users complete qualifying actions. The token can be staked / wrapped into $xWISDOM for VIP streaming rewards.',
    scripture: '"How much better to get wisdom than gold, to get insight rather than silver!"',
    scriptureRef: 'Proverbs 16:16',
    superfluidFeatures: [
      'Can be wrapped into $xWISDOM Super Token for continuous VIP streams',
      'Oracle-controlled minting — earned through on-chain verifiable actions',
      'Daily per-user cap (2,000 $WISDOM) prevents inflation abuse',
      'Activity-tracking stored on-chain for transparent reward history',
      'SUP/$WISDOM pool on Aerodrome for rewards liquidity',
    ],
    earningMethods: [
      { action: 'Active tithe stream (≥ 30 days)', reward: '100 / week' },
      { action: 'Scripture quiz completion', reward: '50 / quiz' },
      { action: 'Farcaster / X biblical post (engagement)', reward: '10–100' },
      { action: 'Successful church referral', reward: '1,000' },
      { action: 'Governance vote cast', reward: '5 / vote' },
      { action: 'BWSP risk warning heeded', reward: '75' },
    ],
    deploymentStatus: 'pending',
  },
  {
    symbol: 'xBIBLEFI',
    name: 'BibleFi Governance Super Token',
    emoji: '⚡👑',
    color: 'text-yellow-300',
    borderColor: 'border-yellow-400/50',
    bgColor: 'bg-yellow-900/10',
    type: 'super-governance',
    maxSupply: '1:1 with $BIBLEFI',
    description:
      'The Superfluid Super Token wrapper of $BIBLEFI. $xBIBLEFI unlocks real-time streaming for the DAO treasury: contributors, church partners, and stakers receive continuous per-second token flows instead of one-off distributions. The DAO treasury streaming controller (BibleFiDAOTreasury) manages all outgoing streams.',
    scripture: '"For everyone who has will be given more, and he will have an abundance."',
    scriptureRef: 'Matthew 25:29',
    superfluidFeatures: [
      'Wrap $BIBLEFI → $xBIBLEFI (upgrade) at 1:1, unwrap anytime',
      'Stream DAO treasury to contributors per-second via CFA',
      'IDA / GDA pools for proportional governance distributions',
      'Superfluid $SUP staking pools: stake $SUP alongside $xBIBLEFI',
      'Real-time balance visible via realtimeBalanceOfNow()',
      'BibleFiDAOTreasury.createTreasuryStream() — manage streams without writing Solidity',
    ],
    daoUse: [
      'Contributor salary streams (per-second payroll)',
      'Church partnership incentive streams',
      'Governance-participation reward streams',
      'Liquidity-mining reward distribution pools',
      'Protocol-owned liquidity maintenance',
    ],
    deploymentStatus: 'coming-soon',
  },
  {
    symbol: 'xWISDOM',
    name: 'BibleFi Wisdom Super Token (VIP)',
    emoji: '⚡📖',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-900/10',
    type: 'super-rewards',
    maxSupply: '1:1 with $WISDOM',
    description:
      'The Superfluid Super Token wrapper of $WISDOM — the VIP LP token for loyal $WISDOM holders. Staking $WISDOM in the BibleFi LP earns $xWISDOM streams. Tiered hodl-based streaming: the longer you hold, the faster your $xWISDOM flows. WisdomVIPRewards.enrolVIP() manages tier upgrades automatically.',
    scripture: '"Wisdom is more precious than rubies, and nothing you desire can compare with her."',
    scriptureRef: 'Proverbs 8:11',
    superfluidFeatures: [
      'Wrap $WISDOM → $xWISDOM for VIP stream eligibility',
      'Tiered streaming: Bronze / Silver / Gold / Solomon',
      'WisdomVIPRewards auto-upgrades tier as hodl duration grows',
      'LP incentive streaming for $WISDOM / $SUP Aerodrome pool',
      'Superfluid IDA distribution to pool subscribers',
    ],
    tiers: [
      { name: 'Bronze', requirement: '≥ 30 days hodl', multiplier: '1× base rate', color: 'text-orange-400' },
      { name: 'Silver', requirement: '≥ 90 days hodl', multiplier: '2× base rate', color: 'text-gray-300' },
      { name: 'Gold',   requirement: '≥ 180 days hodl', multiplier: '3× base rate', color: 'text-ancient-gold' },
      { name: 'Solomon', requirement: '≥ 365 days hodl', multiplier: '5× base rate', color: 'text-purple-300' },
    ],
    deploymentStatus: 'coming-soon',
  },
];

// ─────────────────────────────────────────────── sub-components ──

const StatusBadge: React.FC<{ status: TokenInfo['deploymentStatus'] }> = ({ status }) => {
  if (status === 'deployed')
    return <Badge className="bg-green-900/50 text-green-300 border-green-500/30">✅ Live on Base</Badge>;
  if (status === 'pending')
    return <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">⏳ Pending Deploy</Badge>;
  return <Badge className="bg-blue-900/50 text-blue-300 border-blue-500/30">🔜 Coming Soon</Badge>;
};

const TokenCard: React.FC<{ token: TokenInfo; isSelected: boolean; onClick: () => void }> = ({
  token,
  isSelected,
  onClick,
}) => (
  <Card
    className={`cursor-pointer transition-all border-2 ${
      isSelected ? `${token.borderColor} ${token.bgColor}` : 'border-white/10 bg-black/30 hover:border-white/20'
    }`}
    onClick={onClick}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{token.emoji}</span>
        <StatusBadge status={token.deploymentStatus} />
      </div>
      <CardTitle className={`text-lg ${token.color}`}>${token.symbol}</CardTitle>
      <p className="text-xs text-white/60">{token.name}</p>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-1 text-xs text-white/70">
        <Coins className="w-3 h-3" />
        <span>Supply: {token.maxSupply}</span>
      </div>
    </CardContent>
  </Card>
);

const TokenDetail: React.FC<{ token: TokenInfo }> = ({ token }) => (
  <div className="space-y-6">
    {/* Header */}
    <div className={`p-6 rounded-lg border ${token.borderColor} ${token.bgColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{token.emoji}</span>
            <h2 className={`text-2xl font-bold ${token.color}`}>${token.symbol}</h2>
          </div>
          <p className="text-white/60 text-sm">{token.name}</p>
        </div>
        <StatusBadge status={token.deploymentStatus} />
      </div>
      <p className="text-white/80 text-sm leading-relaxed">{token.description}</p>
      <div className="mt-4 italic text-white/60 text-sm border-l-2 border-white/20 pl-3">
        <p>{token.scripture}</p>
        <p className={`text-xs mt-1 ${token.color}`}>— {token.scriptureRef}</p>
      </div>
    </div>

    {/* Superfluid Features */}
    <Card className="bg-blue-950/30 border-blue-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-300 flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4" /> Superfluid Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {token.superfluidFeatures.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/80">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>

    {/* Distribution (governance token) */}
    {token.distribution && (
      <Card className="bg-black/30 border-ancient-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-ancient-gold flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4" /> Token Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {token.distribution.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{d.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white/50 font-mono text-xs">{d.amount}</span>
                  <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30 w-12 justify-center">
                    {d.pct}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Earning Methods (rewards token) */}
    {token.earningMethods && (
      <Card className="bg-black/30 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-300 flex items-center gap-2 text-sm">
            <Star className="w-4 h-4" /> How to Earn $WISDOM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {token.earningMethods.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{m.action}</span>
                <Badge className="bg-purple-900/40 text-purple-300 border-purple-500/30">
                  {m.reward} $WISDOM
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* DAO Use (xBIBLEFI) */}
    {token.daoUse && (
      <Card className="bg-black/30 border-yellow-400/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-yellow-300 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" /> DAO Treasury Use Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {token.daoUse.map((u, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                {u}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )}

    {/* VIP Tiers (xWISDOM) */}
    {token.tiers && (
      <Card className="bg-black/30 border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-emerald-300 flex items-center gap-2 text-sm">
            <Award className="w-4 h-4" /> VIP Streaming Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {token.tiers.map((tier, i) => (
              <div
                key={i}
                className="text-center p-3 rounded-lg bg-black/40 border border-white/10"
              >
                <div className={`font-bold text-base ${tier.color}`}>{tier.name}</div>
                <div className="text-xs text-white/50 mt-1">{tier.requirement}</div>
                <div className={`text-xs font-mono mt-2 ${tier.color}`}>{tier.multiplier}</div>
              </div>
            ))}
          </div>
          <Alert className="mt-4 border-emerald-500/30 bg-emerald-900/20">
            <Lock className="h-4 w-4 text-emerald-400" />
            <AlertDescription className="text-emerald-300 text-xs">
              Tier upgrades are automatic — WisdomVIPRewards.upgradeVIPTier() can be called by
              anyone once the hodl threshold is met.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )}
  </div>
);

// ─────────────────────────────────────────────────── main component ──

const SuperfluidTokenLaunch: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BIBLEFI');
  const selectedToken = TOKENS.find(t => t.symbol === selectedSymbol) ?? TOKENS[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-3">
          <Zap className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-white">BibleFi × Superfluid Token Suite</h2>
        </div>
        <p className="text-white/70 max-w-2xl mx-auto">
          Four tokens. One protocol. Real-time streams powered by{' '}
          <a
            href="https://superfluid.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Superfluid
          </a>{' '}
          on Base chain — bringing Biblical principles of continuous, cheerful giving to DeFi.
        </p>

        {/* Token type legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <Badge className="bg-ancient-gold/20 text-ancient-gold border-ancient-gold/30">
            <Coins className="w-3 h-3 mr-1" /> Base ERC-20s
          </Badge>
          <Badge className="bg-blue-900/30 text-blue-300 border-blue-500/30">
            <Zap className="w-3 h-3 mr-1" /> Super Tokens
          </Badge>
          <Badge className="bg-green-900/20 text-green-400 border-green-500/30">
            <TrendingUp className="w-3 h-3 mr-1" /> Base Chain
          </Badge>
          <Badge className="bg-purple-900/20 text-purple-300 border-purple-500/30">
            <Users className="w-3 h-3 mr-1" /> $SUP LP Pools
          </Badge>
        </div>
      </div>

      {/* Architecture diagram */}
      <Card className="bg-black/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white/80 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Token Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-ancient-gold">Base ERC-20 Tokens</div>
              <div className="flex items-center gap-2 text-white/70 pl-2">
                <span className="text-ancient-gold">$BIBLEFI</span>
                <span>→ Governance • Voting • Staking</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 pl-2">
                <span className="text-purple-400">$WISDOM</span>
                <span>→ Earned Rewards • Activity Proof</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-blue-400">Superfluid Super Tokens (wrap)</div>
              <div className="flex items-center gap-2 text-white/70 pl-2">
                <span className="text-yellow-300">$xBIBLEFI</span>
                <span>→ DAO Treasury Streams</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 pl-2">
                <span className="text-emerald-400">$xWISDOM</span>
                <span>→ VIP LP Reward Streams</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-950/30 rounded border border-blue-500/20 text-xs text-blue-300">
            <strong>Wrap flow:</strong> $BIBLEFI ⟶ approve xBIBLEFI ⟶ upgrade() ⟶ stream via CFA &nbsp;|&nbsp;
            $WISDOM ⟶ approve xWISDOM ⟶ upgrade() ⟶ VIP stream tier
          </div>
        </CardContent>
      </Card>

      {/* Token selector grid */}
      <div>
        <h3 className="text-white/60 text-sm mb-3 uppercase tracking-wider">Select a token to explore</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOKENS.map(token => (
            <TokenCard
              key={token.symbol}
              token={token}
              isSelected={selectedSymbol === token.symbol}
              onClick={() => setSelectedSymbol(token.symbol)}
            />
          ))}
        </div>
      </div>

      {/* Token detail */}
      <TokenDetail token={selectedToken} />

      {/* SUP LP pools info */}
      <Card className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> $SUP Liquidity Pools (Aerodrome, Base)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/80">
          <p>
            As part of the Superfluid Season 5 grant, BibleFi will establish the following liquidity
            pools on Aerodrome Finance on Base chain — pairing Superfluid's native $SUP token with
            BibleFi tokens:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { pair: '$BIBLEFI / $SUP', purpose: 'Governance token liquidity & price discovery' },
              { pair: '$WISDOM / $SUP', purpose: 'Rewards token liquidity & staking incentives' },
              { pair: '$xBIBLEFI / $SUP', purpose: 'Super token streaming pool for DAO treasury' },
              { pair: '$xWISDOM / $SUP', purpose: 'VIP streaming pool for loyal $WISDOM holders' },
            ].map((pool, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-black/30 rounded border border-blue-500/20">
                <Zap className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-mono font-medium text-blue-300">{pool.pair}</div>
                  <div className="text-xs text-white/50 mt-0.5">{pool.purpose}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deploy / docs links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="border-blue-500/50 text-blue-300 hover:bg-blue-900/20"
          onClick={() => window.open('https://superfluid.org', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Superfluid Docs
        </Button>
        <Button
          variant="outline"
          className="border-ancient-gold/50 text-ancient-gold hover:bg-ancient-gold/10"
          onClick={() => window.open('https://aerodrome.finance', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Aerodrome Finance
        </Button>
        <Button
          variant="outline"
          className="border-green-500/50 text-green-400 hover:bg-green-900/20"
          onClick={() => window.open('https://basescan.org', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          BaseScan Explorer
        </Button>
      </div>

      {/* Legal disclaimer */}
      <Alert className="border-white/10 bg-black/30">
        <Shield className="h-4 w-4 text-white/40" />
        <AlertDescription className="text-white/40 text-xs">
          $BIBLEFI and $WISDOM are utility tokens providing platform access and governance rights.
          They are NOT investments, securities, or promises of profit. Token value may fluctuate.
          Past wisdom does not guarantee future understanding. Always consult a qualified financial
          advisor before making investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SuperfluidTokenLaunch;
