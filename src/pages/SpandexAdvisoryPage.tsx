/**
 * SpandexAdvisoryPage — /spandex-advisory
 *
 * Standalone page exposing the Spandex × BWTYA × BWSP advisory pipeline
 * independently from the swap widget.  Users can input any token pair and
 * get a full biblical advisory without executing a swap.
 *
 * "Where there is no guidance, a people falls, but in an abundance of
 *  counsellors there is safety." – Proverbs 11:14
 */
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, BookOpen, Shield, Activity, ChevronRight, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useSpandexBWTYA } from '@/hooks/useSpandexBWTYA';
import SpandexBWTYAAdvisor from '@/components/defi/SpandexBWTYAAdvisor';
import { useAccount } from 'wagmi';

// ---------------------------------------------------------------------------
// Known Base-chain token list for the advisory form
// ---------------------------------------------------------------------------

const BASE_TOKENS: Record<string, { address: string; decimals: number; label: string }> = {
  ETH:  { address: '0x4200000000000000000000000000000000000006', decimals: 18, label: 'Ethereum (WETH)' },
  USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6,  label: 'USD Coin' },
  USDT: { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6,  label: 'Tether USD' },
  CBETH:{ address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, label: 'Coinbase Wrapped ETH' },
  WBTC: { address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', decimals: 8,  label: 'Wrapped Bitcoin' },
  DAI:  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, label: 'Dai Stablecoin' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SpandexAdvisoryPage: React.FC = () => {
  const { address: walletAddress } = useAccount();

  const [fromSymbol, setFromSymbol] = useState('ETH');
  const [toSymbol, setToSymbol] = useState('USDC');
  const [amountStr, setAmountStr] = useState('1');
  const [wisdomScore, setWisdomScore] = useState(50);
  const [formError, setFormError] = useState<string | null>(null);

  const { advisory, isLoading, error, runAdvisory, reset } = useSpandexBWTYA();

  function validate(): string | null {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return 'Amount must be a positive number.';
    if (fromSymbol === toSymbol) return 'From and To tokens must differ.';
    if (!BASE_TOKENS[fromSymbol]) return `Unsupported token: ${fromSymbol}`;
    if (!BASE_TOKENS[toSymbol]) return `Unsupported token: ${toSymbol}`;
    return null;
  }

  async function handleRun() {
    setFormError(null);
    reset();
    const err = validate();
    if (err) { setFormError(err); return; }

    const fromToken = BASE_TOKENS[fromSymbol];
    const toToken   = BASE_TOKENS[toSymbol];
    const amt = parseFloat(amountStr);
    const inputAmountRaw = BigInt(Math.floor(amt * 10 ** fromToken.decimals));

    await runAdvisory({
      fromToken: fromSymbol,
      toToken: toSymbol,
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      inputAmountHuman: amountStr,
      inputAmountRaw,
      chainId: 8453,
      slippageBps: 50,
      swapperAccount: walletAddress ?? '0x0000000000000000000000000000000000000001',
      wisdomScore,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <Zap className="h-7 w-7 text-ancient-gold" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ancient-gold to-eboy-green bg-clip-text text-transparent">
              spanDEX × BWTYA Advisory
            </h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <BookOpen className="h-4 w-4 text-ancient-gold" />
            Multi-provider swap analysis scored by the Biblical-Wisdom-To-Yield-Algorithm
          </p>
        </motion.div>

        {/* ── Advisory input form ── */}
        <Card className="bg-card/60 backdrop-blur-sm border-ancient-gold/30 mb-6">
          <CardHeader className="py-4 px-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-ancient-gold" />
              Configure Advisory
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {/* Token row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From Token</Label>
                <select
                  value={fromSymbol}
                  onChange={(e) => setFromSymbol(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ancient-gold/50"
                >
                  {Object.entries(BASE_TOKENS).map(([sym, { label }]) => (
                    <option key={sym} value={sym}>{sym} – {label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To Token</Label>
                <select
                  value={toSymbol}
                  onChange={(e) => setToSymbol(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ancient-gold/50"
                >
                  {Object.entries(BASE_TOKENS).map(([sym, { label }]) => (
                    <option key={sym} value={sym}>{sym} – {label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount ({fromSymbol})</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="1.0"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex justify-between">
                  <span>Wisdom Score</span>
                  <span className="font-semibold text-ancient-gold">{wisdomScore}</span>
                </Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wisdomScore}
                  onChange={(e) => setWisdomScore(Number(e.target.value))}
                  className="w-full accent-ancient-gold mt-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Joseph's (conservative)</span>
                  <span>Solomon's (advanced)</span>
                </div>
              </div>
            </div>

            {/* Wallet badge */}
            {walletAddress ? (
              <div className="flex items-center gap-2 text-xs text-eboy-green">
                <Activity className="h-3 w-3 animate-pulse" />
                Wallet connected: {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                Connect wallet for personalised advisory
              </div>
            )}

            {/* Errors */}
            <AnimatePresence>
              {(formError ?? error) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-xs text-destructive"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {formError ?? error}
                </motion.div>
              )}
            </AnimatePresence>

            <Separator className="opacity-20" />

            <Button
              onClick={handleRun}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Advisory…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Run BWTYA Advisory
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Advisory result ── */}
        <AnimatePresence>
          {advisory && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SpandexBWTYAAdvisor
                advisory={advisory}
                fromToken={fromSymbol}
                toToken={toSymbol}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── How it works ── */}
        <Card className="bg-muted/20 border-border/40 mt-6">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              How the Advisory Works
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ol className="text-xs text-muted-foreground space-y-1.5 list-none">
              {[
                ['1', 'spanDEX', 'Queries Fabric, Odos, KyberSwap, and LI.FI simultaneously for the best on-chain route'],
                ['2', 'BWTYA', 'Each provider quote is scored on 4 biblical dimensions: Fruit-bearing, Faithfulness, Biblical Alignment, Transparency'],
                ['3', 'Strategy', 'Based on your Wisdom Score, the Joseph / Talents / Solomon strategy is selected'],
                ['4', 'BWSP', 'The Biblical-Wisdom Scripture Protocol synthesises a specific scripture and action for your swap'],
                ['5', 'Audit', 'The advisory is persisted server-side via the spandex-swap-agent edge function for full traceability'],
              ].map(([n, title, desc]) => (
                <li key={n} className="flex gap-2">
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 shrink-0 mt-0.5 border-ancient-gold/30 text-ancient-gold">
                    {n}
                  </Badge>
                  <span><strong className="text-foreground">{title}:</strong> {desc}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SpandexAdvisoryPage;
