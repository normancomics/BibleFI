import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, AlertCircle, Clock, Rocket, Shield, Code, FileText, DollarSign, Users, Zap } from "lucide-react";
import PixelButton from "@/components/PixelButton";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: "complete" | "in-progress" | "blocked" | "not-started";
  priority: "critical" | "high" | "medium" | "low";
  estimatedDays: number;
  estimatedCost?: string;
  dependencies?: string[];
  owner: string;
  steps: string[];
  resources?: string[];
}

const LaunchActionPlanPage = () => {
  const phases: Record<string, ActionItem[]> = {
    "Phase 1: Smart Contracts (Week 1-2)": [
      {
        id: "sc-1",
        title: "Deploy $BIBLE Token Contract",
        description: "Deploy the main BibleToken.sol to Base mainnet with treasury configuration",
        status: "not-started",
        priority: "critical",
        estimatedDays: 3,
        estimatedCost: "$50-100 gas",
        owner: "Smart Contract Developer",
        steps: [
          "Review and finalize BibleToken.sol contract code",
          "Set up Base mainnet wallet with sufficient ETH",
          "Configure treasury wallet address",
          "Deploy contract via Hardhat/Remix",
          "Verify contract on BaseScan",
          "Test all core functions (transfer, wisdom scoring)",
          "Configure initial tokenomics parameters"
        ],
        resources: [
          "src/contracts/BibleToken.sol",
          "src/contracts/BibleTokenLaunch.sol",
          "Base RPC: https://mainnet.base.org"
        ]
      },
      {
        id: "sc-2",
        title: "Deploy Wisdom Rewards Pool",
        description: "Deploy WisdomRewardsPool.sol and connect to $BIBLE token",
        status: "not-started",
        priority: "critical",
        estimatedDays: 2,
        estimatedCost: "$30-60 gas",
        dependencies: ["sc-1"],
        owner: "Smart Contract Developer",
        steps: [
          "Deploy WisdomRewardsPool.sol with $BIBLE token address",
          "Configure reward multipliers (staking, farming, wisdom)",
          "Fund pool with initial $BIBLE rewards (10% of supply)",
          "Verify contract on BaseScan",
          "Test reward calculation and claiming",
          "Set up approved staking/farming pools"
        ],
        resources: [
          "src/contracts/WisdomRewardsPool.sol"
        ]
      },
      {
        id: "sc-3",
        title: "Deploy Staking Contract",
        description: "Deploy staking contract for $BIBLE token",
        status: "not-started",
        priority: "critical",
        estimatedDays: 2,
        estimatedCost: "$40-80 gas",
        dependencies: ["sc-1", "sc-2"],
        owner: "Smart Contract Developer",
        steps: [
          "Deploy BiblicalStaking.sol contract",
          "Connect to $BIBLE token and rewards pool",
          "Configure staking parameters (lock periods, APY)",
          "Verify contract on BaseScan",
          "Test staking, unstaking, and reward claiming",
          "Register with WisdomRewardsPool"
        ],
        resources: []
      },
      {
        id: "sc-4",
        title: "Create Uniswap V3 Liquidity Pool",
        description: "Create $BIBLE/WETH pool on Uniswap V3",
        status: "not-started",
        priority: "critical",
        estimatedDays: 1,
        estimatedCost: "$100-200 gas + liquidity",
        dependencies: ["sc-1"],
        owner: "Treasury Manager",
        steps: [
          "Prepare initial liquidity (ETH and $BIBLE tokens)",
          "Create pool via Uniswap V3 Factory (0.3% fee tier)",
          "Initialize pool at desired price point",
          "Add initial liquidity position",
          "Set price range for concentrated liquidity",
          "Monitor initial trading activity"
        ],
        resources: [
          "Uniswap V3 Factory: 0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
          "WETH: 0x4200000000000000000000000000000000000006"
        ]
      },
      {
        id: "sc-5",
        title: "Configure Multi-Sig Treasury",
        description: "Set up Gnosis Safe for treasury management",
        status: "not-started",
        priority: "high",
        estimatedDays: 1,
        estimatedCost: "$20-40 gas",
        dependencies: ["sc-1"],
        owner: "Treasury Manager",
        steps: [
          "Deploy Gnosis Safe multi-sig wallet on Base",
          "Add 3-5 authorized signers",
          "Set threshold (e.g., 3 of 5 signatures required)",
          "Transfer treasury control to multi-sig",
          "Test transaction signing process",
          "Document recovery procedures"
        ],
        resources: [
          "Gnosis Safe: https://app.safe.global/welcome"
        ]
      }
    ],
    "Phase 2: Security & Audits (Week 2-3)": [
      {
        id: "sec-1",
        title: "Smart Contract Security Audit",
        description: "Professional audit of all smart contracts",
        status: "not-started",
        priority: "critical",
        estimatedDays: 7,
        estimatedCost: "$5,000-15,000",
        dependencies: ["sc-1", "sc-2", "sc-3"],
        owner: "Security Team",
        steps: [
          "Select reputable audit firm (OpenZeppelin, CertiK, Trail of Bits)",
          "Submit contracts for audit",
          "Review audit findings",
          "Fix critical and high-severity issues",
          "Re-submit for verification",
          "Publish audit report publicly"
        ],
        resources: [
          "OpenZeppelin: https://openzeppelin.com/security-audits",
          "CertiK: https://www.certik.com",
          "Trail of Bits: https://www.trailofbits.com"
        ]
      },
      {
        id: "sec-2",
        title: "Penetration Testing",
        description: "Full application penetration test",
        status: "not-started",
        priority: "high",
        estimatedDays: 5,
        estimatedCost: "$3,000-8,000",
        owner: "Security Team",
        steps: [
          "Hire penetration testing firm",
          "Define scope (frontend, backend, smart contracts)",
          "Conduct testing in staging environment",
          "Review vulnerability report",
          "Patch all critical and high-risk vulnerabilities",
          "Re-test to verify fixes"
        ],
        resources: []
      },
      {
        id: "sec-3",
        title: "Bug Bounty Program",
        description: "Launch public bug bounty on Immunefi",
        status: "not-started",
        priority: "medium",
        estimatedDays: 2,
        estimatedCost: "$10,000 reserve",
        dependencies: ["sec-1"],
        owner: "Security Team",
        steps: [
          "Create Immunefi account",
          "Define bug bounty scope and rules",
          "Set reward tiers ($100-$10,000)",
          "Fund bounty pool",
          "Launch program",
          "Monitor and respond to submissions"
        ],
        resources: [
          "Immunefi: https://immunefi.com"
        ]
      },
      {
        id: "sec-4",
        title: "Payment Security Review",
        description: "Security review of Stripe, Daimo, and bank integrations",
        status: "not-started",
        priority: "high",
        estimatedDays: 3,
        owner: "Security Team",
        steps: [
          "Review Stripe integration for PCI compliance",
          "Audit Daimo payment flows",
          "Test bank transfer security",
          "Verify encryption of sensitive data",
          "Check for SQL injection vulnerabilities",
          "Implement rate limiting on payment endpoints"
        ],
        resources: []
      }
    ],
    "Phase 3: Farcaster & Wallet Integration (Week 2-3)": [
      {
        id: "fc-1",
        title: "Farcaster Frame Production Setup",
        description: "Deploy production Farcaster Frame with proper metadata",
        status: "in-progress",
        priority: "critical",
        estimatedDays: 3,
        owner: "Frontend Developer",
        steps: [
          "Generate frame preview images (1200x630px OG images)",
          "Configure frame.html with proper meta tags",
          "Deploy frame to production domain",
          "Validate with Farcaster Frame Validator",
          "Test frame buttons and actions",
          "Implement analytics tracking",
          "Submit to Warpcast for indexing"
        ],
        resources: [
          "public/frame.html",
          "Frame Validator: https://warpcast.com/~/developers/frames"
        ]
      },
      {
        id: "fc-2",
        title: "Wallet Integration Testing",
        description: "Test all wallet connectors on Base mainnet",
        status: "not-started",
        priority: "critical",
        estimatedDays: 2,
        owner: "Frontend Developer",
        steps: [
          "Test Coinbase Wallet connection on Base",
          "Test Rainbow Wallet connection",
          "Test WalletConnect with various wallets",
          "Test Farcaster Wallet (when available)",
          "Verify network switching to Base",
          "Test transaction signing",
          "Handle edge cases (disconnection, network errors)"
        ],
        resources: [
          "src/components/wallet/ProductionWalletConnect.tsx"
        ]
      },
      {
        id: "fc-3",
        title: "Base Chain RPC Optimization",
        description: "Configure production RPC endpoints with fallbacks",
        status: "not-started",
        priority: "high",
        estimatedDays: 1,
        owner: "DevOps Engineer",
        steps: [
          "Set up Alchemy RPC endpoint for Base",
          "Configure QuickNode as fallback",
          "Add public Base RPC as tertiary fallback",
          "Implement automatic RPC switching on failure",
          "Monitor RPC performance",
          "Set up alerts for RPC downtime"
        ],
        resources: [
          "src/config/rpc.ts",
          "Alchemy: https://alchemy.com",
          "QuickNode: https://quicknode.com"
        ]
      }
    ],
    "Phase 4: Payment Processing (Week 3-4)": [
      {
        id: "pay-1",
        title: "Stripe Production Setup",
        description: "Configure Stripe for live payments",
        status: "not-started",
        priority: "critical",
        estimatedDays: 2,
        estimatedCost: "2.9% + $0.30 per transaction",
        owner: "Backend Developer",
        steps: [
          "Create Stripe production account",
          "Complete business verification",
          "Configure payment methods (card, ACH)",
          "Set up webhook endpoints",
          "Test payment flows in production",
          "Configure tax collection (if required)",
          "Set up subscription billing for recurring tithes"
        ],
        resources: [
          "Stripe Dashboard: https://dashboard.stripe.com"
        ]
      },
      {
        id: "pay-2",
        title: "Daimo Integration Testing",
        description: "Test Daimo USDC payments on Base mainnet",
        status: "not-started",
        priority: "high",
        estimatedDays: 2,
        owner: "Backend Developer",
        steps: [
          "Set up Daimo API credentials",
          "Configure USDC payment requests",
          "Test payment links and QR codes",
          "Implement payment confirmation webhooks",
          "Test edge cases (failed payments, refunds)",
          "Set up monitoring and alerts"
        ],
        resources: [
          "src/integrations/daimo/enhancedClient.ts",
          "Daimo Docs: https://daimo.com/docs"
        ]
      },
      {
        id: "pay-3",
        title: "Bank Transfer Integration",
        description: "Set up ACH/Wire transfer processing",
        status: "not-started",
        priority: "medium",
        estimatedDays: 3,
        owner: "Backend Developer",
        steps: [
          "Partner with payment processor (Plaid, Dwolla)",
          "Configure bank account verification",
          "Set up ACH debit/credit",
          "Implement transfer status tracking",
          "Handle failed transfers",
          "Set up reconciliation process"
        ],
        resources: []
      }
    ],
    "Phase 5: Legal & Compliance (Week 3-5)": [
      {
        id: "legal-1",
        title: "LLC Formation & Registration",
        description: "Establish legal entity for BibleFi",
        status: "not-started",
        priority: "critical",
        estimatedDays: 7,
        estimatedCost: "$500-2,000",
        owner: "Legal Counsel",
        steps: [
          "Choose jurisdiction (Delaware, Wyoming recommended for crypto)",
          "File Articles of Organization",
          "Obtain EIN from IRS",
          "Register for state taxes",
          "Set up business bank account",
          "Draft operating agreement",
          "Register for business licenses"
        ],
        resources: [
          "Delaware Division of Corporations: https://corp.delaware.gov"
        ]
      },
      {
        id: "legal-2",
        title: "KYC/AML Implementation",
        description: "Implement Know Your Customer and Anti-Money Laundering compliance",
        status: "not-started",
        priority: "critical",
        estimatedDays: 5,
        estimatedCost: "$1,000-5,000",
        owner: "Compliance Officer",
        steps: [
          "Select KYC provider (Persona, Onfido, Jumio)",
          "Integrate KYC verification flow",
          "Define risk thresholds and limits",
          "Implement transaction monitoring",
          "Set up suspicious activity reporting",
          "Train team on compliance procedures",
          "Document compliance policies"
        ],
        resources: [
          "Persona: https://withpersona.com",
          "FinCEN Guidelines: https://fincen.gov"
        ]
      },
      {
        id: "legal-3",
        title: "Securities Law Review",
        description: "Ensure $BIBLE token is not classified as a security",
        status: "not-started",
        priority: "critical",
        estimatedDays: 5,
        estimatedCost: "$5,000-15,000",
        owner: "Legal Counsel",
        steps: [
          "Hire crypto-specialized attorney",
          "Conduct Howey Test analysis",
          "Review token utility and distribution",
          "Document decentralization measures",
          "Prepare legal opinion letter",
          "File any required disclosures",
          "Implement geographic restrictions if needed"
        ],
        resources: []
      },
      {
        id: "legal-4",
        title: "International Compliance",
        description: "Research and comply with international crypto regulations",
        status: "not-started",
        priority: "high",
        estimatedDays: 7,
        owner: "Legal Counsel",
        steps: [
          "Research MiCA regulations (EU)",
          "Review UK FCA requirements",
          "Check Asian jurisdictions (Singapore, Japan)",
          "Implement geo-blocking if necessary",
          "Update Terms of Service for international users",
          "Set up compliance monitoring",
          "Document international compliance strategy"
        ],
        resources: []
      },
      {
        id: "legal-5",
        title: "Tax Reporting Framework",
        description: "Set up cryptocurrency tax reporting system",
        status: "not-started",
        priority: "high",
        estimatedDays: 3,
        estimatedCost: "$2,000-5,000",
        owner: "Tax Advisor",
        steps: [
          "Select tax reporting software (CoinTracker, TaxBit)",
          "Integrate with transaction data",
          "Configure 1099-MISC generation for rewards",
          "Set up user tax dashboard",
          "Document tax calculation methodology",
          "Prepare for IRS reporting requirements",
          "Create user tax guides"
        ],
        resources: [
          "src/components/taxes/TaxOptimizationCenter.tsx"
        ]
      }
    ],
    "Phase 6: Performance & Testing (Week 4-5)": [
      {
        id: "perf-1",
        title: "Load Testing",
        description: "Test application under high user load",
        status: "not-started",
        priority: "high",
        estimatedDays: 3,
        owner: "DevOps Engineer",
        steps: [
          "Set up load testing tools (K6, Artillery)",
          "Define load test scenarios (1K, 10K, 100K users)",
          "Run load tests on staging",
          "Identify bottlenecks",
          "Optimize database queries",
          "Implement caching strategies",
          "Re-test after optimizations"
        ],
        resources: []
      },
      {
        id: "perf-2",
        title: "CDN & Asset Optimization",
        description: "Configure CDN and optimize static assets",
        status: "not-started",
        priority: "medium",
        estimatedDays: 2,
        owner: "DevOps Engineer",
        steps: [
          "Set up Cloudflare CDN",
          "Configure edge caching rules",
          "Optimize images (WebP, lazy loading)",
          "Minify JavaScript and CSS",
          "Implement code splitting",
          "Enable compression (Brotli, gzip)",
          "Test page load times globally"
        ],
        resources: []
      },
      {
        id: "perf-3",
        title: "Database Query Optimization",
        description: "Optimize Supabase queries for production scale",
        status: "not-started",
        priority: "high",
        estimatedDays: 2,
        owner: "Backend Developer",
        steps: [
          "Analyze slow queries",
          "Add database indexes",
          "Implement query result caching",
          "Optimize RLS policies",
          "Set up read replicas if needed",
          "Monitor query performance",
          "Document optimization best practices"
        ],
        resources: []
      },
      {
        id: "perf-4",
        title: "Mobile Optimization",
        description: "Optimize for iOS and Android browsers",
        status: "in-progress",
        priority: "high",
        estimatedDays: 3,
        owner: "Frontend Developer",
        steps: [
          "Test on iOS Safari (iPhone, iPad)",
          "Test on Android Chrome",
          "Optimize touch interactions",
          "Test wallet connections on mobile",
          "Optimize for different screen sizes",
          "Fix any mobile-specific bugs",
          "Test sound system on mobile"
        ],
        resources: []
      }
    ],
    "Phase 7: Pre-Launch (Week 5-6)": [
      {
        id: "launch-1",
        title: "Marketing Website",
        description: "Create landing page and marketing materials",
        status: "not-started",
        priority: "medium",
        estimatedDays: 5,
        owner: "Marketing Team",
        steps: [
          "Design landing page",
          "Write compelling copy",
          "Create explainer video",
          "Set up email capture",
          "Implement SEO optimization",
          "Set up analytics (Google Analytics, Mixpanel)",
          "Launch waitlist campaign"
        ],
        resources: []
      },
      {
        id: "launch-2",
        title: "Community Building",
        description: "Build initial user community",
        status: "not-started",
        priority: "medium",
        estimatedDays: 14,
        owner: "Community Manager",
        steps: [
          "Launch Discord server",
          "Create Telegram group",
          "Build Twitter/X presence",
          "Engage with Farcaster community",
          "Partner with Christian crypto communities",
          "Create educational content",
          "Run beta testing program"
        ],
        resources: []
      },
      {
        id: "launch-3",
        title: "Documentation & Support",
        description: "Create comprehensive user documentation",
        status: "in-progress",
        priority: "medium",
        estimatedDays: 4,
        owner: "Technical Writer",
        steps: [
          "Write user guides",
          "Create video tutorials",
          "Document FAQ",
          "Set up support ticketing system",
          "Train support team",
          "Create troubleshooting guides",
          "Publish API documentation"
        ],
        resources: [
          "docs/bible-fi-vision-article.md",
          "PROJECT_OVERVIEW.md"
        ]
      },
      {
        id: "launch-4",
        title: "Final Security Review",
        description: "Comprehensive security check before launch",
        status: "not-started",
        priority: "critical",
        estimatedDays: 2,
        dependencies: ["sec-1", "sec-2"],
        owner: "Security Team",
        steps: [
          "Review all audit findings are resolved",
          "Verify all secrets are properly secured",
          "Check RLS policies are enabled",
          "Test authentication flows",
          "Verify rate limiting is active",
          "Review monitoring and alerting",
          "Conduct final penetration test"
        ],
        resources: []
      },
      {
        id: "launch-5",
        title: "Launch Checklist & Monitoring",
        description: "Final launch preparation and monitoring setup",
        status: "not-started",
        priority: "critical",
        estimatedDays: 1,
        owner: "DevOps Engineer",
        steps: [
          "Complete launch checklist",
          "Set up 24/7 monitoring",
          "Prepare rollback procedures",
          "Brief support team",
          "Schedule launch announcement",
          "Prepare incident response plan",
          "Final smoke tests in production"
        ],
        resources: [
          "DEPLOYMENT_CHECKLIST.md",
          "src/components/deployment/LaunchReadinessCenter.tsx"
        ]
      }
    ]
  };

  const getStatusIcon = (status: ActionItem["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case "blocked":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: ActionItem["priority"]) => {
    const colors = {
      critical: "bg-red-500/20 text-red-500 border-red-500/50",
      high: "bg-orange-500/20 text-orange-500 border-orange-500/50",
      medium: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      low: "bg-gray-500/20 text-gray-500 border-gray-500/50"
    };
    return <Badge variant="outline" className={colors[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const calculatePhaseProgress = (items: ActionItem[]) => {
    const total = items.length;
    const completed = items.filter(i => i.status === "complete").length;
    const inProgress = items.filter(i => i.status === "in-progress").length;
    return {
      percentage: ((completed + inProgress * 0.5) / total) * 100,
      completed,
      inProgress,
      total
    };
  };

  const allItems = Object.values(phases).flat();
  const overallProgress = calculatePhaseProgress(allItems);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                BibleFi Launch Action Plan
              </h1>
              <p className="text-muted-foreground mt-1">Detailed roadmap to production launch</p>
            </div>
          </div>

          {/* Overall Progress */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Overall Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {overallProgress.completed} complete, {overallProgress.inProgress} in progress, {overallProgress.total - overallProgress.completed - overallProgress.inProgress} remaining
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(overallProgress.percentage)}%
                </div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={overallProgress.percentage} className="h-3" />
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium">Critical</p>
            </div>
            <p className="text-2xl font-bold">{allItems.filter(i => i.priority === "critical").length}</p>
          </Card>
          <Card className="p-4 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium">High Priority</p>
            </div>
            <p className="text-2xl font-bold">{allItems.filter(i => i.priority === "high").length}</p>
          </Card>
          <Card className="p-4 border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium">Est. Days</p>
            </div>
            <p className="text-2xl font-bold">{allItems.reduce((acc, i) => acc + i.estimatedDays, 0)}</p>
          </Card>
          <Card className="p-4 border-green-500/30 bg-green-500/5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium">Budget Range</p>
            </div>
            <p className="text-lg font-bold">$15K-50K</p>
          </Card>
        </div>

        {/* Phases */}
        <Tabs defaultValue="phase-1" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.keys(phases).map((phase, idx) => {
              const progress = calculatePhaseProgress(phases[phase]);
              return (
                <TabsTrigger key={phase} value={`phase-${idx + 1}`} className="flex flex-col items-center gap-1 h-auto py-3">
                  <span className="text-xs font-medium">Phase {idx + 1}</span>
                  <Progress value={progress.percentage} className="h-1 w-full" />
                  <span className="text-xs text-muted-foreground">{Math.round(progress.percentage)}%</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(phases).map(([phaseName, items], phaseIdx) => (
            <TabsContent key={phaseName} value={`phase-${phaseIdx + 1}`} className="space-y-6">
              <Card className="p-6 border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10">
                <h2 className="text-2xl font-bold mb-2">{phaseName}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{items.length} tasks</span>
                  <span>•</span>
                  <span>{items.reduce((acc, i) => acc + i.estimatedDays, 0)} estimated days</span>
                </div>
              </Card>

              {items.map((item) => (
                <Card key={item.id} className="p-6 hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getStatusIcon(item.status)}</div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {getPriorityBadge(item.priority)}
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.estimatedDays}d
                            </Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{item.owner}</span>
                          </div>
                          {item.estimatedCost && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-muted-foreground">{item.estimatedCost}</span>
                            </div>
                          )}
                          {item.dependencies && item.dependencies.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <span className="text-muted-foreground">
                                Depends on: {item.dependencies.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Action Steps
                        </h4>
                        <ul className="space-y-2">
                          {item.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-primary font-mono shrink-0">{idx + 1}.</span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources */}
                      {item.resources && item.resources.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Resources
                          </h4>
                          <ul className="space-y-1">
                            {item.resources.map((resource, idx) => (
                              <li key={idx} className="text-sm text-primary font-mono">
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Launch Timeline */}
        <Card className="p-6 mt-8 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Projected Launch Timeline
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-background/50 rounded-lg border border-green-500/30">
              <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <h3 className="font-bold text-xl mb-2">Optimistic</h3>
              <p className="text-3xl font-bold text-green-500 mb-2">4-5 weeks</p>
              <p className="text-sm text-muted-foreground">
                If all audits pass quickly, no major issues found, and team works in parallel
              </p>
            </div>
            
            <div className="text-center p-6 bg-background/50 rounded-lg border border-blue-500/30">
              <Rocket className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <h3 className="font-bold text-xl mb-2">Recommended</h3>
              <p className="text-3xl font-bold text-blue-500 mb-2">6-8 weeks</p>
              <p className="text-sm text-muted-foreground">
                Realistic timeline with buffer for audits, testing, and resolving issues
              </p>
            </div>
            
            <div className="text-center p-6 bg-background/50 rounded-lg border border-orange-500/30">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-500" />
              <h3 className="font-bold text-xl mb-2">Conservative</h3>
              <p className="text-3xl font-bold text-orange-500 mb-2">10-12 weeks</p>
              <p className="text-sm text-muted-foreground">
                If significant audit findings, legal complexities, or team bandwidth issues arise
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <h4 className="font-bold mb-2">Next Immediate Actions (This Week)</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Deploy $BIBLE token to Base mainnet testnet first for final testing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Contact 2-3 audit firms for quotes and availability</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Consult with crypto attorney on legal structure and compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Complete Farcaster Frame production deployment</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          <PixelButton onClick={() => window.location.href = '/deployment'}>
            View Deployment Status
          </PixelButton>
          <PixelButton onClick={() => window.location.href = '/system-check'}>
            Run System Health Check
          </PixelButton>
          <PixelButton onClick={() => window.open('https://docs.lovable.dev', '_blank')}>
            Documentation
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default LaunchActionPlanPage;