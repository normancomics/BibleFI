import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Droplets, Zap, ArrowDownToLine } from 'lucide-react';

// ── Contract addresses (replace with deployed addresses after running the deploy script) ──
const BFI_USD_ADDRESS = '0xYOUR_DEPLOYED_BIBLEFIUSD_ADDRESS' as `0x${string}`;
const BFI_SUPERFLUID_ADDRESS = '0xYOUR_DEPLOYED_BIBLEFISUPERFLUID_ADDRESS' as `0x${string}`;
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;
// USDCx SuperToken on Base Mainnet — verify the exact address before deployment
const USDCX_ADDRESS = '0xD04383398dD2426297da660F9CCD3Ab1B8c2c720' as `0x${string}`;

// ── Minimal ABIs ──────────────────────────────────────────────────────────────

const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const BIBLEFI_USD_ABI = [
  {
    name: 'depositUSDC',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'userNote', type: 'string' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'rebaseAndTithe',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

const BIBLEFI_SUPERFLUID_ABI = [
  {
    name: 'startTitheStream',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'receiver', type: 'address' },
      { name: 'flowRate', type: 'int96' },
      { name: 'scripture', type: 'string' },
    ],
    outputs: [],
  },
] as const;

// ── Scripture references shown in the UI ─────────────────────────────────────

const SCRIPTURES = [
  'Malachi 3:10 – Bring ye all the tithes into the storehouse.',
  'Luke 6:38 – Give, and it will be given to you.',
  'Proverbs 3:9 – Honor the LORD with your wealth.',
  '2 Corinthians 9:7 – God loves a cheerful giver.',
];

// ── Helper: compute per-second flow rate from a monthly USDCx amount ─────────
// USDCx is Superfluid's wrapped USDC token and uses 18 decimals.
// Flow rate is expressed in USDCx atomic units (1e18) per second.

function monthlyUsdcToFlowRate(monthlyUsdc: string): bigint {
  const monthly = parseFloat(monthlyUsdc);
  if (isNaN(monthly) || monthly <= 0) return 0n;
  // USDCx uses 18 decimals; divide monthly token amount by seconds in 30 days
  const perSecond = (monthly * 1e18) / (30 * 24 * 3600);
  const rate = BigInt(Math.floor(perSecond));
  // int96 max ≈ 3.96e28; practical flow rates are well within range
  const INT96_MAX = BigInt('39614081257132168796771975168');
  return rate > INT96_MAX ? INT96_MAX : rate;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * BibleFiPolishedPanel
 *
 * Farcaster mini-app panel that allows users to:
 * 1. Deposit USDC into BibleFiUSD (ERC4626 vault with 10% auto-tithe)
 * 2. Start a continuous Superfluid tithe stream to a receiver
 * 3. Trigger the daily rebase (distributes yield and auto-tithes 10% to charity)
 */
const BibleFiPolishedPanel: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { writeContract, isPending } = useWriteContract();

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('Malachi 3:10 – Tithing in obedience');
  const [activeScripture] = useState(() => SCRIPTURES[Math.floor(Math.random() * SCRIPTURES.length)]);
  // Tracks whether the USDC approval has been submitted (step 1 of 2)
  const [approvalSubmitted, setApprovalSubmitted] = useState(false);

  // Stream state
  const [streamReceiver, setStreamReceiver] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [streamScripture, setStreamScripture] = useState('Malachi 3:10 – Productive Tithing');

  // ── Handlers ───────────────────────────────────────────────────────────────

  /**
   * Step 1: Approve BibleFiUSD to spend USDC.
   * The user must confirm this transaction in their wallet, then call handleDeposit.
   */
  const handleApprove = () => {
    if (!isConnected) {
      toast({ title: 'Connect wallet', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a valid USDC amount (minimum 1 USDC).', variant: 'destructive' });
      return;
    }

    const assets = parseUnits(depositAmount, 6); // USDC has 6 decimals

    writeContract(
      {
        address: USDC_ADDRESS,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [BFI_USD_ADDRESS, assets],
      } as any,
      {
        onSuccess: () => {
          setApprovalSubmitted(true);
          toast({
            title: '✅ Approval submitted',
            description: 'USDC approval sent. Wait for confirmation, then click Deposit.',
          });
        },
        onError: (err) => {
          toast({ title: 'Approval failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  /**
   * Step 2: Deposit USDC into BibleFiUSD after the approval has been confirmed.
   */
  const handleDeposit = () => {
    if (!isConnected) {
      toast({ title: 'Connect wallet', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a valid USDC amount (minimum 1 USDC).', variant: 'destructive' });
      return;
    }

    const assets = parseUnits(depositAmount, 6);

    writeContract(
      {
        address: BFI_USD_ADDRESS,
        abi: BIBLEFI_USD_ABI,
        functionName: 'depositUSDC',
        args: [assets, depositNote],
      } as any,
      {
        onSuccess: () => {
          toast({
            title: '✅ Deposit successful',
            description: `${depositAmount} USDC deposited into BibleFiUSD. 10% auto-tithe will be distributed on next rebase.`,
          });
          setDepositAmount('');
          setApprovalSubmitted(false);
        },
        onError: (err) => {
          toast({ title: 'Deposit failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleStartStream = () => {
    if (!isConnected) {
      toast({ title: 'Connect wallet', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    if (!streamReceiver || !streamReceiver.startsWith('0x')) {
      toast({ title: 'Invalid receiver', description: 'Enter a valid 0x wallet address.', variant: 'destructive' });
      return;
    }
    if (!monthlyAmount || parseFloat(monthlyAmount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a monthly tithe amount greater than 0.', variant: 'destructive' });
      return;
    }

    const flowRate = monthlyUsdcToFlowRate(monthlyAmount);
    if (flowRate === 0n) {
      toast({ title: 'Invalid flow rate', description: 'Monthly amount is too small to produce a valid flow rate.', variant: 'destructive' });
      return;
    }

    writeContract(
      {
        address: BFI_SUPERFLUID_ADDRESS,
        abi: BIBLEFI_SUPERFLUID_ABI,
        functionName: 'startTitheStream',
        args: [USDCX_ADDRESS, streamReceiver as `0x${string}`, flowRate, streamScripture],
      } as any,
      {
        onSuccess: () => {
          toast({
            title: '🌊 Stream started',
            description: `Tithing ${monthlyAmount} USDCx/month to ${streamReceiver.slice(0, 6)}…${streamReceiver.slice(-4)}`,
          });
          setStreamReceiver('');
          setMonthlyAmount('');
        },
        onError: (err) => {
          toast({ title: 'Stream failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleRebase = () => {
    if (!isConnected) {
      toast({ title: 'Connect wallet', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }

    writeContract(
      {
        address: BFI_USD_ADDRESS,
        abi: BIBLEFI_USD_ABI,
        functionName: 'rebaseAndTithe',
        args: [],
      } as any,
      {
        onSuccess: () => {
          toast({
            title: '📖 Rebase complete',
            description: 'Yield distributed. 10% tithed to charity wallet per Malachi 3:10.',
          });
        },
        onError: (err) => {
          toast({ title: 'Rebase failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 max-w-lg mx-auto p-4">
      {/* Header */}
      <Card className="border border-yellow-500/30 bg-gradient-to-br from-yellow-950/40 to-black/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-yellow-400 text-xl font-bold flex items-center gap-2">
              <BookOpen size={20} />
              BibleFi Yield Panel
            </CardTitle>
            <Badge
              variant="outline"
              className="text-yellow-400 border-yellow-500/50 text-xs"
            >
              Base Mainnet
            </Badge>
          </div>
          <p className="text-xs text-yellow-200/70 italic mt-1">"{activeScripture}"</p>
        </CardHeader>
        <CardContent>
          {!isConnected && (
            <p className="text-sm text-red-400">Connect your wallet to continue.</p>
          )}
          {isConnected && address && (
            <p className="text-xs text-green-400 truncate">
              Connected: {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="deposit">
        <TabsList className="w-full bg-black/40 border border-yellow-500/20">
          <TabsTrigger value="deposit" className="flex-1 text-xs data-[state=active]:text-yellow-400">
            <ArrowDownToLine size={14} className="mr-1" /> Deposit
          </TabsTrigger>
          <TabsTrigger value="stream" className="flex-1 text-xs data-[state=active]:text-yellow-400">
            <Droplets size={14} className="mr-1" /> Stream Tithe
          </TabsTrigger>
          <TabsTrigger value="rebase" className="flex-1 text-xs data-[state=active]:text-yellow-400">
            <Zap size={14} className="mr-1" /> Rebase
          </TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit">
          <Card className="border border-yellow-500/20 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-300">Deposit USDC → BFiUSD</CardTitle>
              <p className="text-xs text-muted-foreground">
                Earn yield via Morpho vaults. 10% of accrued yield is auto-tithed on each daily rebase.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="deposit-amount" className="text-xs text-yellow-200/80">
                  USDC Amount
                </Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-black/60 border-yellow-500/30 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deposit-note" className="text-xs text-yellow-200/80">
                  Scripture / Note (logged on-chain)
                </Label>
                <Input
                  id="deposit-note"
                  type="text"
                  placeholder="Malachi 3:10 – Tithing in obedience"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="bg-black/60 border-yellow-500/30 text-white mt-1"
                />
              </div>
              <Button
                onClick={approvalSubmitted ? handleDeposit : handleApprove}
                disabled={isPending || !isConnected}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-semibold"
              >
                {isPending
                  ? 'Processing…'
                  : approvalSubmitted
                  ? 'Step 2: Deposit USDC'
                  : 'Step 1: Approve USDC'}
              </Button>
              {approvalSubmitted && (
                <p className="text-xs text-yellow-200/60">
                  Approval submitted. After it confirms on-chain, click "Step 2: Deposit USDC".
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stream Tithe Tab */}
        <TabsContent value="stream">
          <Card className="border border-yellow-500/20 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-300">Start Superfluid Tithe Stream</CardTitle>
              <p className="text-xs text-muted-foreground">
                Stream USDCx continuously to a church, charity, or individual — powered by Superfluid.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="stream-receiver" className="text-xs text-yellow-200/80">
                  Receiver Address
                </Label>
                <Input
                  id="stream-receiver"
                  type="text"
                  placeholder="0x…"
                  value={streamReceiver}
                  onChange={(e) => setStreamReceiver(e.target.value)}
                  className="bg-black/60 border-yellow-500/30 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="monthly-amount" className="text-xs text-yellow-200/80">
                  Monthly Tithe (USDCx)
                </Label>
                <Input
                  id="monthly-amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 50"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className="bg-black/60 border-yellow-500/30 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="stream-scripture" className="text-xs text-yellow-200/80">
                  Scripture Reference (logged on-chain)
                </Label>
                <Input
                  id="stream-scripture"
                  type="text"
                  placeholder="Malachi 3:10 – Productive Tithing"
                  value={streamScripture}
                  onChange={(e) => setStreamScripture(e.target.value)}
                  className="bg-black/60 border-yellow-500/30 text-white mt-1"
                />
              </div>
              {monthlyAmount && parseFloat(monthlyAmount) > 0 && (
                <p className="text-xs text-yellow-200/60">
                  Flow rate: ~{(parseFloat(monthlyAmount) / (30 * 24 * 3600)).toExponential(3)} USDCx/sec
                </p>
              )}
              <Button
                onClick={handleStartStream}
                disabled={isPending || !isConnected}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold"
              >
                {isPending ? 'Processing…' : 'Start Tithe Stream'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rebase Tab */}
        <TabsContent value="rebase">
          <Card className="border border-yellow-500/20 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-300">Daily Rebase & Auto-Tithe</CardTitle>
              <p className="text-xs text-muted-foreground">
                Trigger the daily rebase to distribute Morpho yield. 10% of yield is auto-tithed to
                the charity wallet per Malachi 3:10. Can only be called once per 24 hours.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-yellow-500/20 bg-yellow-950/20 p-3 text-xs text-yellow-200/70 space-y-1">
                <p>📖 <span className="italic">Malachi 3:10</span> – "Bring the full tithe into the storehouse."</p>
                <p>• Yield accrued from Morpho vault is rebased into BFiUSD supply.</p>
                <p>• 10% (TITHE_BPS = 1000) is minted directly to the charity wallet.</p>
                <p>• Remaining 90% is retained in the vault, growing your BFiUSD value.</p>
              </div>
              <Button
                onClick={handleRebase}
                disabled={isPending || !isConnected}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold"
              >
                {isPending ? 'Processing…' : '⚡ Rebase & Tithe'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BibleFiPolishedPanel;
