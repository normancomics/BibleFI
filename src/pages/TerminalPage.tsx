/**
 * BibleFi Terminal — /terminal
 *
 * The natural-language command console. Type what you want in plain English
 * ("swap 1 ETH to USDC", "tithe $50 a month to my church", "send 0.1 ETH
 * privately") and BibleFi parses it into a structured, non-custodial action
 * plan (with biblical wisdom) and routes it to the right rail. Your wallet
 * signs — nothing is custodial.
 *
 * "Commit your work to the LORD, and your plans will be established." — Proverbs 16:3
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Zap, BookOpen, AlertTriangle, RefreshCw, ChevronRight, ExternalLink,
  CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useBibleFiTerminal, type TerminalAction } from '@/hooks/useBibleFiTerminal';
import { useSpandexExecute } from '@/hooks/useSpandexExecute';
import type { SpandexSwapAdvisoryInput } from '@/services/spandex/types';

const BASE_TOKENS: Record<string, { address: string; decimals: number }> = {
  ETH:  { address: '0x4200000000000000000000000000000000000006', decimals: 18 },
  WETH: { address: '0x4200000000000000000000000000000000000006', decimals: 18 },
  USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  USDT: { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
  DAI:  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18 },
  CBETH:{ address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18 },
  WBTC: { address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', decimals: 8 },
};

const EXAMPLES = [
  'Swap 1 ETH to USDC',
  'Tithe $50 a month to my church',
  'Send 0.1 ETH privately',
  'Invest $500 in the safest biblical yield',
  'What does the Bible say about debt?',
];

const ACTION_LABEL: Record<string, string> = {
  swap: 'Token Swap',
  tithe_stream: 'Streaming Tithe',
  private_give: 'Anonymous Giving',
  bwtya_invest: 'BWTYA Yield Strategy',
  advice: 'Biblical Wisdom',
  balance: 'Portfolio',
  unknown: 'Needs Clarification',
};

const TerminalPage: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [command, setCommand] = useState('');
  const { isParsing, result, error, notConfigured, parse, reset } = useBibleFiTerminal();
  const { isExecuting, txHash, error: execError, execute, reset: resetExec } = useSpandexExecute();

  async function handleSubmit(cmd?: string) {
    const c = cmd ?? command;
    if (!c.trim()) return;
    resetExec();
    if (cmd) setCommand(cmd);
    await parse(c);
  }

  async function handleExecuteSwap(action: TerminalAction) {
    const from = action.fromToken && BASE_TOKENS[action.fromToken];
    const to = action.toToken && BASE_TOKENS[action.toToken];
    if (!from || !to || !action.amount) return;
    const input: SpandexSwapAdvisoryInput = {
      fromToken: action.fromToken!,
      toToken: action.toToken!,
      fromTokenAddress: from.address,
      toTokenAddress: to.address,
      inputAmountHuman: action.amount,
      inputAmountRaw: BigInt(Math.floor(parseFloat(action.amount) * 10 ** from.decimals)),
      chainId: 8453,
      slippageBps: 50,
      swapperAccount: address ?? '0x0000000000000000000000000000000000000001',
    };
    await execute(input);
  }

  const action = result?.action;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Terminal className="h-7 w-7 text-ancient-gold" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ancient-gold to-eboy-green bg-clip-text text-transparent">
              BibleFi Terminal
            </h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Sparkles className="h-4 w-4 text-ancient-gold" />
            Say what you want — swap, tithe, give privately, or invest — in plain English. Your wallet signs; nothing is custodial.
          </p>
        </motion.div>

        {/* Command input */}
        <Card className="bg-card/60 backdrop-blur-sm border-ancient-gold/30 mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="e.g. swap 1 ETH to USDC"
                className="font-mono"
              />
              <Button
                onClick={() => handleSubmit()}
                disabled={isParsing || !command.trim()}
                className="bg-gradient-to-r from-ancient-gold to-yellow-600 text-black font-semibold shrink-0"
              >
                {isParsing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSubmit(ex)}
                  disabled={isParsing}
                  className="text-[11px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:border-ancient-gold/50 hover:text-ancient-gold transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Not-configured state (LLM key missing) */}
        {notConfigured && (
          <Alert className="bg-yellow-950/20 border-yellow-500/40 mb-4">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm">
              <strong className="text-yellow-500">AI parser not configured.</strong> The natural-language
              brain needs an LLM API key (set <code className="text-xs">ANTHROPIC_API_KEY</code> or{' '}
              <code className="text-xs">OPENAI_API_KEY</code> as a Supabase edge secret). All the underlying
              rails still work from their own panels.
            </AlertDescription>
          </Alert>
        )}

        {error && !notConfigured && (
          <Alert className="bg-destructive/10 border-destructive/30 mb-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {/* Parsed action */}
        <AnimatePresence>
          {action && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-eboy-green/30">
                <CardHeader className="py-4 px-5">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-eboy-green" />
                      {ACTION_LABEL[action.type] ?? 'Action'}
                    </span>
                    <Badge variant="outline" className="border-eboy-green/40 text-eboy-green text-[10px]">
                      non-custodial
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  {/* Action summary */}
                  {action.type === 'swap' && (
                    <div className="text-sm">
                      Swap <strong>{action.amount} {action.fromToken}</strong> →{' '}
                      <strong>{action.toToken}</strong> via the best on-chain route (spanDEX).
                    </div>
                  )}
                  {action.type === 'tithe_stream' && (
                    <div className="text-sm">
                      Stream a tithe of <strong>{action.amount} {action.asset ?? 'USDC'}</strong>/
                      {action.period ?? 'month'}{action.recipient ? <> to <strong>{action.recipient}</strong></> : ''} via Superfluid.
                    </div>
                  )}
                  {action.type === 'private_give' && (
                    <div className="text-sm">
                      Give <strong>{action.amount} {action.asset ?? 'ETH'}</strong> anonymously
                      {action.recipient ? <> to <strong>{action.recipient}</strong></> : ''} via the Veil ZK privacy pool.
                    </div>
                  )}
                  {action.type === 'bwtya_invest' && (
                    <div className="text-sm">
                      Invest <strong>{action.amount} {action.asset ?? 'USDC'}</strong> into a{' '}
                      <strong>{action.risk ?? 'moderate'}</strong> biblically-scored BWTYA strategy.
                    </div>
                  )}
                  {(action.type === 'advice' || action.type === 'balance' || action.type === 'unknown') && (
                    <div className="text-sm text-muted-foreground">
                      {action.clarification || action.question || 'Here is some biblical guidance for your request.'}
                    </div>
                  )}

                  {/* BWSP wisdom */}
                  {result?.wisdom && (
                    <Alert className="bg-purple-950/20 border-ancient-gold/30">
                      <BookOpen className="h-4 w-4 text-ancient-gold" />
                      <AlertDescription className="text-sm italic">{result.wisdom}</AlertDescription>
                    </Alert>
                  )}

                  {/* Routing / execution */}
                  {action.type === 'swap' && (
                    <>
                      {txHash ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-md bg-eboy-green/10 border border-eboy-green/30 text-xs text-eboy-green">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="flex-1">Swap submitted.</span>
                          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                            BaseScan <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : execError ? (
                        <div className="flex items-start gap-2 p-2.5 rounded-md bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />{execError}
                        </div>
                      ) : null}
                      <Button
                        onClick={() => handleExecuteSwap(action)}
                        disabled={isExecuting || !address || !action.amount || !action.fromToken || !action.toToken || !BASE_TOKENS[action.fromToken] || !BASE_TOKENS[action.toToken]}
                        className="w-full bg-gradient-to-r from-eboy-green to-emerald-600 text-black font-semibold"
                      >
                        {isExecuting ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Confirm in wallet…</>
                          : !address ? <><AlertTriangle className="h-4 w-4 mr-2" />Connect wallet to execute</>
                          : <><Zap className="h-4 w-4 mr-2" />Execute Swap on Base<ChevronRight className="h-4 w-4 ml-1" /></>}
                      </Button>
                    </>
                  )}
                  {action.type === 'tithe_stream' && (
                    <Button onClick={() => navigate('/tithe')} variant="outline" className="w-full">
                      Continue in Tithing <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  {action.type === 'private_give' && (
                    <Button onClick={() => navigate('/tithe')} variant="outline" className="w-full">
                      Continue in Anonymous Giving <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  {action.type === 'bwtya_invest' && (
                    <Button onClick={() => navigate('/spandex-advisory')} variant="outline" className="w-full">
                      Open BWTYA Advisory <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <button onClick={() => { reset(); setCommand(''); }} className="text-xs text-muted-foreground hover:text-ancient-gold mt-4">
            ← New command
          </button>
        )}
      </main>
    </div>
  );
};

export default TerminalPage;
