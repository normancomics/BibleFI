# Bible.fi Tech Stack

## Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling with custom design system
- **Framer Motion** - Animations
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon system

## Backend & Infrastructure
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with pgvector extension
  - Edge Functions (Deno runtime)
  - Row-Level Security (RLS)
  - Real-time subscriptions
- **Lovable Cloud** - Deployment & hosting

## Blockchain & Web3
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **Ethers.js** - Smart contract interactions
- **Coinbase Wallet SDK** - Wallet integration
- **RainbowKit** - Wallet connection UI
- **Base Chain** - Primary L2 network
- **Superfluid Protocol** - Streaming payments
- **0x Protocol** - DEX aggregation
- **ODOS** - DEX routing
- **KyberSwap** - Token swaps
- **Uniswap** - Liquidity pools

## AI & Data Processing
- **OpenAI GPT** - AI advisor (via edge functions)
- **Anthropic Claude** - Alternative AI model
- **pgvector** - Vector embeddings storage
- **OpenAI Embeddings** - Text-to-vector conversion

## Farcaster Integration
- **Farcaster Auth Kit** - Authentication
- **Neynar API** - Farcaster data
- **Farcaster Frames** - Mini-app protocol

## Data Sources & APIs
- **CoinGecko** - Token prices
- **DeFiLlama** - Protocol TVL & metrics
- **Daimo** - USDC payments
- **0x API** - Swap quotes
- **ODOS API** - Multi-DEX routing
- **ParaSwap** - DEX aggregation
- **Relay** - Cross-chain bridge

## Payment Processing
- **Crypto payments** - Native Base chain
- **Fiat on-ramp** - Stripe integration (planned)
- **Superfluid streams** - Continuous tithing
- **Daimo USDC** - Gasless transfers

## Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Bun** - Fast package manager
- **Git** - Version control
- **GitHub Pages** - Static deployment option

## Design System
- **Custom Pixel Art** - Biblical characters
- **Retro Arcade Aesthetic** - Sound effects & animations
- **Shadcn UI** - Component library foundation
- **Radix UI** - Accessible primitives
- **HSL Color System** - Semantic design tokens

## Security
- **Crypto-JS** - Encryption utilities
- **Node-Forge** - Cryptographic operations
- **RLS Policies** - Database-level security
- **Input validation** - XSS/injection prevention
- **Quantum-resistant patterns** - Future-proofing

## Database Schema
- **biblical_knowledge_base** - Vector search for scriptures
- **comprehensive_biblical_texts** - Multi-language verses
- **defi_knowledge_base** - Protocol data
- **churches** - Global church database
- **superfluid_streams** - Tithing streams
- **wisdom_scores** - User progress tracking
- **tax_compliance_records** - IRS reporting

## Edge Functions (Deno)
- **biblical-advisor** - AI wisdom engine
- **enhanced-biblical-advisor** - Advanced RAG
- **generate-embeddings** - Vector creation
- **wisdom-score-calculator** - Scoring algorithm
- **farcaster-api** - Social integration
- **frame-handler** - Frame rendering

## RAG-AGI Pipeline Architecture
### Data Ingestion
1. Scripture crawlers (Hebrew, Greek, Aramaic, KJV)
2. Commentary crawlers (theology & finance)
3. DeFi protocol crawlers (on-chain data)
4. Event listeners (Superfluid, Daimo)
5. Community signal crawlers (Farcaster, Discord)

### Processing
- Embedding generation (OpenAI)
- Vector storage (pgvector)
- Semantic search
- Context assembly

### Retrieval
- Multi-source knowledge synthesis
- Biblical fidelity + DeFi insight
- Real-time price/TVL data
- User intent analysis

### Generation
- Contextual advice
- Scripture references
- DeFi strategy recommendations
- Risk assessments
