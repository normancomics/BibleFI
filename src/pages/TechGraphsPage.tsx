/**
 * TechGraphsPage – Animated Technical Graphs for BibleFI
 *
 * Six live-animated visualisations that explain the core algorithms:
 *
 *  1. BWTYA Pipeline Flow     – animated step-by-step processing diagram
 *  2. Fruit Sustainability    – log-normal APY curve (Recharts AreaChart)
 *  3. Monte Carlo Fan Chart   – P10/P25/P75/P90 yield probability bands
 *  4. Kelly Allocation Radar  – optimal position sizing spider chart
 *  5. BWSP Agent Architecture – animated node-edge flow diagram
 *  6. Wisdom Belief Evolution – Bayesian Beta posterior narrowing over time
 */
import React, { useEffect, useRef, useState } from 'react';
import NavBar from '@/components/NavBar';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  BarChart3,
  Brain,
  GitBranch,
  Network,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

// ─── Utility ────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

function ln(x: number) {
  return x <= 0 ? -Infinity : Math.log(x);
}

// ─── 1. BWTYA Pipeline Data ──────────────────────────────────────────────────

const PIPELINE_STEPS = [
  {
    id: 'input',
    label: 'Input',
    sub: 'YieldOpportunities[]',
    color: '#8b5cf6',
    icon: '📥',
    biblicalNote: 'Proverbs 4:7 – Wisdom is the principal thing',
  },
  {
    id: 'scorer',
    label: 'Scorer',
    sub: 'Fruit · Faithfulness · Alignment · Transparency',
    color: '#6d28d9',
    icon: '🍎',
    biblicalNote: 'John 15:16 – Fruit that will last',
  },
  {
    id: 'ranker',
    label: 'Ranker',
    sub: 'Pareto dominance + convictionScore',
    color: '#5b21b6',
    icon: '🏆',
    biblicalNote: 'Matthew 25:14 – Parable of the Talents',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    sub: 'Kelly Criterion allocation',
    color: '#4c1d95',
    icon: '🎯',
    biblicalNote: 'Ecc 11:2 – Divide your portion to seven',
  },
  {
    id: 'simulator',
    label: 'Simulator',
    sub: 'Monte Carlo · 1 000 trials',
    color: '#7c3aed',
    icon: '🎲',
    biblicalNote: 'Proverbs 16:9 – The LORD establishes his steps',
  },
  {
    id: 'rebalancer',
    label: 'Rebalancer',
    sub: 'RSS drift urgency',
    color: '#9333ea',
    icon: '⚖️',
    biblicalNote: 'Proverbs 27:23 – Know the condition of your flocks',
  },
  {
    id: 'output',
    label: 'Result',
    sub: 'BWTYAResult with sim bands',
    color: '#a855f7',
    icon: '📊',
    biblicalNote: 'Proverbs 21:5 – Plans of the diligent lead to profit',
  },
];

// ─── 2. Fruit Sustainability Curve data ──────────────────────────────────────

function fruitCurvePoint(apy: number) {
  const APY_PEAK = 12;
  const LOG_SIGMA = 0.9;
  if (apy <= 0) return 0;
  const logRatio = ln(apy / APY_PEAK) / LOG_SIGMA;
  return clamp(30 * Math.exp(-0.5 * logRatio * logRatio), 0, 30);
}

const FRUIT_DATA = Array.from({ length: 121 }, (_, i) => {
  const apy = i * 2; // 0–240 %
  return { apy, score: parseFloat(fruitCurvePoint(apy).toFixed(2)) };
});

// ─── 3. Monte Carlo Fan Chart data ───────────────────────────────────────────

function logNormalQuantile(p: number, mu: number, sigma: number) {
  // Beasley-Springer-Moro algorithm for the normal quantile function.
  // Reference: Moro (1995) "The full Monte", RISK 8(2):57-58.
  // Splits the [0,1] domain into three regions for accuracy:
  //   low-tail (p < 0.02425), central (0.02425 ≤ p ≤ 0.97575), high-tail.
  const a = [0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
              1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
              6.680131188771972e1, -1.328068155288572e1];
  const c = [0, -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
              -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0, 7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
              3.754408661907416];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  if (p < pLow) {
    const s = Math.sqrt(-2 * Math.log(p));
    q = (((((c[1]*s+c[2])*s+c[3])*s+c[4])*s+c[5])*s+c[6]) /
        ((((d[1]*s+d[2])*s+d[3])*s+d[4])*s+1);
  } else if (p <= pHigh) {
    const s = p - 0.5;
    const r = s * s;
    q = (((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*s /
        (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);
  } else {
    const s = Math.sqrt(-2 * Math.log(1 - p));
    q = -(((((c[1]*s+c[2])*s+c[3])*s+c[4])*s+c[5])*s+c[6]) /
         ((((d[1]*s+d[2])*s+d[3])*s+d[4])*s+1);
  }
  return (Math.exp(mu + sigma * q) - 1) * 100;
}

function buildMonteCarloData(baseApy: number, riskScore: number) {
  const sigma = 0.05 + riskScore * 0.0115;
  const mu = Math.log(1 + baseApy / 100) - 0.5 * sigma * sigma;
  const months = Array.from({ length: 13 }, (_, i) => i);
  return months.map((m) => {
    const t = m / 12;
    const muT = mu * t;
    const sigmaT = sigma * Math.sqrt(t);
    if (m === 0) return { month: m, p10: 0, p25: 0, median: 0, p75: 0, p90: 0 };
    return {
      month: m,
      p10: parseFloat(logNormalQuantile(0.10, muT, sigmaT).toFixed(2)),
      p25: parseFloat(logNormalQuantile(0.25, muT, sigmaT).toFixed(2)),
      median: parseFloat(logNormalQuantile(0.50, muT, sigmaT).toFixed(2)),
      p75: parseFloat(logNormalQuantile(0.75, muT, sigmaT).toFixed(2)),
      p90: parseFloat(logNormalQuantile(0.90, muT, sigmaT).toFixed(2)),
    };
  });
}

// ─── 4. Kelly Allocation Radar data ──────────────────────────────────────────

const KELLY_PROTOCOLS = [
  { subject: 'Aave USDC', kelly: 32, conviction: 78, riskAdj: 88 },
  { subject: 'Compound ETH', kelly: 18, conviction: 65, riskAdj: 72 },
  { subject: 'Curve 3pool', kelly: 25, conviction: 82, riskAdj: 90 },
  { subject: 'Uniswap ETH/USDC', kelly: 12, conviction: 58, riskAdj: 65 },
  { subject: 'Yearn USDT', kelly: 8, conviction: 70, riskAdj: 75 },
  { subject: 'Lido stETH', kelly: 5, conviction: 88, riskAdj: 95 },
];

// ─── 6. Wisdom Belief Bayesian data ──────────────────────────────────────────

function betaMean(alpha: number, beta: number) {
  return (alpha / (alpha + beta)) * 100;
}
function betaStd(alpha: number, beta: number) {
  const ab = alpha + beta;
  return Math.sqrt((alpha * beta) / (ab * ab * (ab + 1))) * 100;
}

function buildBayesianData(observations: number[]) {
  let alpha = 2;
  let beta = 2;
  return [
    { obs: 0, mean: betaMean(alpha, beta), low: clamp(betaMean(alpha, beta) - 1.96 * betaStd(alpha, beta), 0, 100), high: clamp(betaMean(alpha, beta) + 1.96 * betaStd(alpha, beta), 0, 100) },
    ...observations.map((obs, i) => {
      const norm = obs / 100;
      alpha += norm;
      beta  += (1 - norm);
      const mean = betaMean(alpha, beta);
      const std  = betaStd(alpha, beta);
      return {
        obs: i + 1,
        mean: parseFloat(mean.toFixed(1)),
        low:  parseFloat(clamp(mean - 1.96 * std, 0, 100).toFixed(1)),
        high: parseFloat(clamp(mean + 1.96 * std, 0, 100).toFixed(1)),
      };
    }),
  ];
}

const WISDOM_OBSERVATIONS = [70, 55, 80, 90, 65, 85, 75, 88, 92, 78, 95, 85, 90, 88, 92];
const BAYESIAN_DATA = buildBayesianData(WISDOM_OBSERVATIONS);

// ─── BWSP Node Graph data ────────────────────────────────────────────────────

const BWSP_NODES = [
  { id: 'query',    label: 'User Query',         x: 10,  y: 50,  color: '#8b5cf6' },
  { id: 'intent',   label: 'TF-IDF Intent',       x: 28,  y: 20,  color: '#6d28d9' },
  { id: 'retriever',label: 'RAG Retriever',        x: 28,  y: 80,  color: '#5b21b6' },
  { id: 'market',   label: 'Market Context',       x: 28,  y: 50,  color: '#7c3aed' },
  { id: 'context',  label: 'Context Assembler',    x: 50,  y: 50,  color: '#4c1d95' },
  { id: 'synth',    label: 'Synthesizer',          x: 70,  y: 50,  color: '#6d28d9' },
  { id: 'resonance',label: 'Authority Resonance',  x: 70,  y: 20,  color: '#7c3aed' },
  { id: 'bayesian', label: 'Bayesian Belief',      x: 70,  y: 80,  color: '#5b21b6' },
  { id: 'output',   label: 'BWSPResponse',         x: 90,  y: 50,  color: '#a855f7' },
];

const BWSP_EDGES = [
  { from: 'query',    to: 'intent' },
  { from: 'query',    to: 'retriever' },
  { from: 'query',    to: 'market' },
  { from: 'intent',   to: 'context' },
  { from: 'retriever',to: 'context' },
  { from: 'market',   to: 'context' },
  { from: 'context',  to: 'synth' },
  { from: 'synth',    to: 'resonance' },
  { from: 'synth',    to: 'bayesian' },
  { from: 'resonance',to: 'output' },
  { from: 'bayesian', to: 'output' },
  { from: 'synth',    to: 'output' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Animated BWTYA pipeline step row */
function PipelineFlow({ activeStep }: { activeStep: number }) {
  return (
    <div className="relative flex flex-col gap-0">
      {PIPELINE_STEPS.map((step, i) => (
        <React.Fragment key={step.id}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 100 }}
            className={`relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
              i === activeStep
                ? 'border-purple-400/60 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                : 'border-purple-900/30 bg-black/20'
            }`}
          >
            {/* Step number + connector */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={i === activeStep ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border-2"
                style={{ borderColor: step.color, backgroundColor: step.color + '22' }}
              >
                {step.icon}
              </motion.div>
              {i < PIPELINE_STEPS.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.12 + 0.3 }}
                  className="w-0.5 h-6 origin-top"
                  style={{ backgroundColor: step.color + '66' }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{step.label}</span>
                {i === activeStep && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-2 h-2 rounded-full bg-purple-400"
                  />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{step.sub}</p>
              {i === activeStep && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-purple-300 mt-1 italic"
                >
                  📖 {step.biblicalNote}
                </motion.p>
              )}
            </div>
            <span className="text-xs text-gray-500 font-mono">Step {i + 1}</span>
          </motion.div>
        </React.Fragment>
      ))}
    </div>
  );
}

/** SVG node-edge BWSP architecture diagram */
function BWSPArchitectureDiagram({ tick }: { tick: number }) {
  const nodeMap = Object.fromEntries(BWSP_NODES.map((n) => [n.id, n]));
  const W = 800;
  const H = 340;

  // Animated particle along each edge
  const progress = (tick % 120) / 120;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: 280 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {BWSP_EDGES.map((edge, ei) => {
        const from = nodeMap[edge.from];
        const to   = nodeMap[edge.to];
        if (!from || !to) return null;
        const x1 = (from.x / 100) * W;
        const y1 = (from.y / 100) * H;
        const x2 = (to.x   / 100) * W;
        const y2 = (to.y   / 100) * H;
        // Particle position
        const pOffset = ((tick + ei * 15) % 120) / 120;
        const px = x1 + (x2 - x1) * pOffset;
        const py = y1 + (y2 - y1) * pOffset;
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#7c3aed44"
              strokeWidth={1.5}
            />
            <circle cx={px} cy={py} r={3} fill="#a855f7" opacity={0.9} filter="url(#glow)" />
          </g>
        );
      })}

      {/* Nodes */}
      {BWSP_NODES.map((node) => {
        const cx = (node.x / 100) * W;
        const cy = (node.y / 100) * H;
        return (
          <g key={node.id}>
            <circle
              cx={cx} cy={cy} r={28}
              fill={node.color + '33'}
              stroke={node.color}
              strokeWidth={1.5}
              filter="url(#glow)"
            />
            <foreignObject x={cx - 38} y={cy + 30} width={76} height={32}>
              <div
                style={{ fontSize: 10, color: '#d8b4fe', textAlign: 'center', lineHeight: 1.2 }}
              >
                {node.label}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

/** Animated pulsing metric badge */
function MetricBadge({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 text-center"
      style={{ borderColor: color + '44', backgroundColor: color + '11' }}
    >
      <div className="text-2xl font-bold" style={{ color }}>{value}<span className="text-sm ml-1">{unit}</span></div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TechGraphsPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [mcRisk, setMcRisk] = useState(40);
  const [mcApy, setMcApy] = useState(12);
  const [tab, setTab] = useState('pipeline');
  const tickRef = useRef(0);
  const [tick, setTick] = useState(0);

  // Advance pipeline step every 2 s
  useEffect(() => {
    const id = setInterval(() => setActiveStep((s) => (s + 1) % PIPELINE_STEPS.length), 2000);
    return () => clearInterval(id);
  }, []);

  // RAF tick for SVG particles
  useAnimationFrame(() => {
    tickRef.current = (tickRef.current + 1) % 120;
    setTick(tickRef.current);
  });

  const mcData = buildMonteCarloData(mcApy, mcRisk);

  const CustomTooltipMC = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-purple-500/40 bg-black/90 p-3 text-xs">
        <p className="font-bold text-purple-300 mb-1">Month {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(1)}%</p>
        ))}
      </div>
    );
  };

  const CustomTooltipFruit = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-purple-500/40 bg-black/90 p-3 text-xs">
        <p className="font-bold text-purple-300 mb-1">APY: {label}%</p>
        <p className="text-green-400">Score: {payload[0]?.value?.toFixed(1)} / 30</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge className="mb-3 bg-purple-900/40 text-purple-300 border-purple-500/40">
            <Sparkles className="w-3 h-3 mr-1" />
            Animated Technical Architecture
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
            BibleFI Tech Graphs
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm">
            Live animated visualisations of the BWTYA, BWSP, Monte Carlo, Bayesian Belief and
            Agent Architecture systems — all anchored to biblical stewardship principles.
          </p>
        </motion.div>

        {/* Metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <MetricBadge label="Monte Carlo Trials / Opportunity" value="1,000" color="#8b5cf6" />
          <MetricBadge label="BWTYA Pipeline Steps" value="7" color="#6d28d9" />
          <MetricBadge label="Kelly Max Allocation" value="35" unit="%" color="#a855f7" />
          <MetricBadge label="Wisdom TWAP Window" value="7" unit=" days" color="#7c3aed" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-6 bg-black/40 border border-purple-900/40 h-auto gap-1 p-1">
            {[
              { id: 'pipeline',  label: 'Pipeline',    icon: <GitBranch className="w-3 h-3" /> },
              { id: 'fruit',     label: 'Fruit Curve',  icon: <TrendingUp className="w-3 h-3" /> },
              { id: 'montecarlo',label: 'Monte Carlo',  icon: <BarChart3 className="w-3 h-3" /> },
              { id: 'kelly',     label: 'Kelly Radar',  icon: <Activity className="w-3 h-3" /> },
              { id: 'bwsp',      label: 'BWSP Agent',   icon: <Network className="w-3 h-3" /> },
              { id: 'bayesian',  label: 'Bayesian',     icon: <Brain className="w-3 h-3" /> },
            ].map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="text-xs flex items-center gap-1.5 data-[state=active]:bg-purple-800/60 data-[state=active]:text-white"
              >
                {t.icon}{t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Tab 1: BWTYA Pipeline ── */}
          <TabsContent value="pipeline">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-300">
                    <GitBranch className="w-4 h-4" />
                    BWTYA 7-Step Pipeline
                  </CardTitle>
                  <CardDescription>
                    Animates through each processing step automatically. Active step highlights with
                    its biblical anchor verse.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PipelineFlow activeStep={activeStep} />
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="text-purple-300">Step Detail</CardTitle>
                  <CardDescription>Currently processing step {activeStep + 1} of {PIPELINE_STEPS.length}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: 'spring', stiffness: 150 }}
                      className="rounded-2xl border border-purple-500/30 p-6 text-center"
                      style={{ backgroundColor: PIPELINE_STEPS[activeStep].color + '11' }}
                    >
                      <div className="text-6xl mb-4">{PIPELINE_STEPS[activeStep].icon}</div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {PIPELINE_STEPS[activeStep].label}
                      </h2>
                      <p className="text-sm text-gray-400 mb-4">{PIPELINE_STEPS[activeStep].sub}</p>
                      <div className="rounded-lg bg-black/40 p-3 border border-purple-900/30">
                        <p className="text-xs text-purple-300 italic">
                          📖 {PIPELINE_STEPS[activeStep].biblicalNote}
                        </p>
                      </div>

                      {/* Step progress dots */}
                      <div className="flex justify-center gap-2 mt-5">
                        {PIPELINE_STEPS.map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: i === activeStep ? 1.4 : 1, opacity: i === activeStep ? 1 : 0.35 }}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: PIPELINE_STEPS[i].color }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Manual nav */}
                  <div className="flex justify-between mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-700 text-purple-300"
                      onClick={() => setActiveStep((s) => (s - 1 + PIPELINE_STEPS.length) % PIPELINE_STEPS.length)}
                    >
                      ← Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-700 text-purple-300"
                      onClick={() => setActiveStep((s) => (s + 1) % PIPELINE_STEPS.length)}
                    >
                      Next →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 2: Fruit Sustainability Curve ── */}
          <TabsContent value="fruit">
            <Card className="bg-black/40 border-purple-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <TrendingUp className="w-4 h-4" />
                  Fruit Sustainability Curve
                  <Badge className="text-xs bg-green-900/40 text-green-300 border-green-700/40">John 15:16</Badge>
                </CardTitle>
                <CardDescription>
                  Log-normal bell curve centered at 12% APY. Too little = barren ground; too much = unsustainable extraction.
                  Peak score of 30 pts at 12% APY. The curve penalises both extremes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  <MetricBadge label="Peak APY" value="12" unit="%" color="#22c55e" />
                  <MetricBadge label="Max Score" value="30" unit=" pts" color="#a855f7" />
                  <MetricBadge label="Log σ spread" value="0.9" color="#f59e0b" />
                </div>
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={FRUIT_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="fruitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#7c3aed22" />
                    <XAxis dataKey="apy" tickFormatter={(v) => `${v}%`} stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'APY (%)', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Score (0–30)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltipFruit />} />
                    <ReferenceLine x={12} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Peak 12%', fill: '#22c55e', fontSize: 11 }} />
                    <ReferenceLine x={60} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Risk 60%+', fill: '#ef4444', fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fill="url(#fruitGrad)"
                      dot={false}
                      isAnimationActive
                      animationDuration={1800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 mt-3 text-center italic">
                  "You did not choose me, but I chose you and appointed you so that you might go and bear fruit — fruit that will last." — John 15:16
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: Monte Carlo Fan ── */}
          <TabsContent value="montecarlo">
            <Card className="bg-black/40 border-purple-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <BarChart3 className="w-4 h-4" />
                  Monte Carlo Yield Fan Chart
                  <Badge className="text-xs bg-purple-900/40 text-purple-300 border-purple-700/40">1 000 trials</Badge>
                </CardTitle>
                <CardDescription>
                  Log-normal return distribution across 12 months. Adjust APY and risk to see the
                  probability cone widen or narrow — P10 (worst 10%), P25, Median, P75, P90 (best 10%).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Controls */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex-1 min-w-40">
                    <label className="text-xs text-gray-400 mb-1 block">Base APY: <span className="text-purple-300 font-bold">{mcApy}%</span></label>
                    <input
                      type="range" min={1} max={80} value={mcApy}
                      onChange={(e) => setMcApy(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div className="flex-1 min-w-40">
                    <label className="text-xs text-gray-400 mb-1 block">Risk Score: <span className="text-red-400 font-bold">{mcRisk}/100</span></label>
                    <input
                      type="range" min={1} max={95} value={mcRisk}
                      onChange={(e) => setMcRisk(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs self-end">
                    <MetricBadge label="σ (vol)" value={(0.05 + mcRisk * 0.0115).toFixed(2)} color="#f59e0b" />
                    <MetricBadge label="P90 APY" value={`${mcData[12]?.p90?.toFixed(0) ?? '–'}%`} color="#22c55e" />
                    <MetricBadge label="P10 APY" value={`${mcData[12]?.p10?.toFixed(0) ?? '–'}%`} color="#ef4444" />
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={360}>
                  <LineChart data={mcData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="fanGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#7c3aed22" />
                    <XAxis dataKey="month" tickFormatter={(v) => `M${v}`} stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltipMC />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                    <Line type="monotone" dataKey="p90" name="P90 (Best 10%)" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="6 3" isAnimationActive animationDuration={800} />
                    <Line type="monotone" dataKey="p75" name="P75" stroke="#86efac" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={800} />
                    <Line type="monotone" dataKey="median" name="Median" stroke="#a855f7" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={800} />
                    <Line type="monotone" dataKey="p25" name="P25" stroke="#f87171" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={800} />
                    <Line type="monotone" dataKey="p10" name="P10 (Worst 10%)" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="6 3" isAnimationActive animationDuration={800} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 mt-3 text-center italic">
                  "The heart of man plans his way, but the LORD establishes his steps." — Proverbs 16:9
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 4: Kelly Radar ── */}
          <TabsContent value="kelly">
            <Card className="bg-black/40 border-purple-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Activity className="w-4 h-4" />
                  Kelly Criterion Allocation Radar
                  <Badge className="text-xs bg-amber-900/40 text-amber-300 border-amber-700/40">Ecc 11:2</Badge>
                </CardTitle>
                <CardDescription>
                  Each spoke is a yield opportunity. Three overlaid layers show Kelly optimal allocation %,
                  conviction score (geometric mean of all 4 dimensions), and risk-adjusted yield.
                  "Invest in seven ventures, yes in eight" — Ecclesiastes 11:2.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  <MetricBadge label="Max Kelly Cap" value="35" unit="%" color="#8b5cf6" />
                  <MetricBadge label="Risk-Free Rate" value="4" unit="%" color="#f59e0b" />
                  <MetricBadge label="Positions Shown" value="6" color="#22c55e" />
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={KELLY_PROTOCOLS}>
                    <PolarGrid stroke="#7c3aed33" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar
                      name="Kelly Allocation %"
                      dataKey="kelly"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.25}
                      isAnimationActive
                      animationDuration={1200}
                    />
                    <Radar
                      name="Conviction Score"
                      dataKey="conviction"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.15}
                      isAnimationActive
                      animationDuration={1400}
                    />
                    <Radar
                      name="Risk-Adjusted Score"
                      dataKey="riskAdj"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.12}
                      isAnimationActive
                      animationDuration={1600}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #7c3aed44', fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 mt-3 text-center italic">
                  "Divide your portion to seven, or even to eight, for you do not know what misfortune may occur." — Ecclesiastes 11:2
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 5: BWSP Architecture ── */}
          <TabsContent value="bwsp">
            <Card className="bg-black/40 border-purple-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Network className="w-4 h-4" />
                  BWSP Sovereign Agent Architecture
                </CardTitle>
                <CardDescription>
                  Animated data flow through the Biblical Wisdom Synthesis Protocol. Particles flow
                  along each edge showing real-time query processing through RAG, TF-IDF intent
                  detection, authority-weighted resonance, and Bayesian confidence fusion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-4 gap-3 mb-6">
                  <MetricBadge label="Intent Classes" value="7" color="#8b5cf6" />
                  <MetricBadge label="Authority Books" value="20+" color="#f59e0b" />
                  <MetricBadge label="Max Authority" value="2.0" unit="×" color="#22c55e" />
                  <MetricBadge label="Confidence Weights" value="4" color="#a855f7" />
                </div>

                <div className="rounded-xl border border-purple-900/30 bg-black/40 p-4 overflow-hidden">
                  <BWSPArchitectureDiagram tick={tick} />
                </div>

                {/* Node legend */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
                  {BWSP_NODES.map((n) => (
                    <div key={n.id} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                      <span className="text-gray-400">{n.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center italic">
                  "Plans are established by seeking advice; so if you wage war, obtain guidance." — Proverbs 20:18
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 6: Bayesian Wisdom ── */}
          <TabsContent value="bayesian">
            <Card className="bg-black/40 border-purple-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Brain className="w-4 h-4" />
                  Bayesian Wisdom Belief Evolution
                  <Badge className="text-xs bg-blue-900/40 text-blue-300 border-blue-700/40">Proverbs 18:15</Badge>
                </CardTitle>
                <CardDescription>
                  Posterior mean (solid purple) and 95% credible interval (shaded) as new wisdom
                  observations arrive. The band narrows with each update — uncertainty decreasing as
                  evidence accumulates. Beta(α, β) conjugate prior with sequential updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-4 gap-3 mb-6">
                  <MetricBadge label="Initial Prior α" value="2" color="#8b5cf6" />
                  <MetricBadge label="Initial Prior β" value="2" color="#6d28d9" />
                  <MetricBadge label="Final Posterior Mean" value={`${BAYESIAN_DATA[BAYESIAN_DATA.length - 1].mean}`} color="#22c55e" />
                  <MetricBadge label="Observations" value={`${BAYESIAN_DATA.length - 1}`} color="#a855f7" />
                </div>

                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={BAYESIAN_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="bayesGradHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="bayesGradLow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#7c3aed22" />
                    <XAxis dataKey="obs" tickFormatter={(v) => `Obs ${v}`} stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}`} stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Wisdom Score', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #7c3aed44', fontSize: 12 }} formatter={(v: number) => `${v.toFixed(1)}`} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                    {/* 95% CI band — rendered as two Areas stacked */}
                    <Area
                      type="monotone"
                      dataKey="high"
                      name="95% CI High"
                      stroke="none"
                      fill="url(#bayesGradHigh)"
                      fillOpacity={1}
                      dot={false}
                      isAnimationActive
                      animationDuration={1600}
                      legendType="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="low"
                      name="95% CI Low"
                      stroke="none"
                      fill="url(#bayesGradLow)"
                      fillOpacity={0.6}
                      dot={false}
                      isAnimationActive
                      animationDuration={1600}
                      legendType="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="mean"
                      name="Posterior Mean"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#a855f7' }}
                      isAnimationActive
                      animationDuration={1800}
                    />
                    <Line
                      type="monotone"
                      dataKey="high"
                      name="95% CI Upper"
                      stroke="#6d28d9"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      dot={false}
                      isAnimationActive
                      animationDuration={1800}
                    />
                    <Line
                      type="monotone"
                      dataKey="low"
                      name="95% CI Lower"
                      stroke="#6d28d9"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      dot={false}
                      isAnimationActive
                      animationDuration={1800}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Observation list */}
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Observation history (wisdom scores 0–100):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {WISDOM_OBSERVATIONS.map((obs, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: obs >= 80 ? '#22c55e66' : obs >= 60 ? '#f59e0b66' : '#ef444466', color: obs >= 80 ? '#4ade80' : obs >= 60 ? '#fbbf24' : '#f87171' }}
                      >
                        {obs}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center italic">
                  "The heart of the discerning acquires knowledge, for the ears of the wise seek it out." — Proverbs 18:15
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-gray-600">
            All algorithms are original, pure-TypeScript implementations with no external numerical
            libraries — deterministic, server-side renderable, and biblically anchored.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TechGraphsPage;
