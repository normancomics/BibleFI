# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Bible.fi — a "Biblical DeFi" web app on Base chain, built as a Farcaster mini-app. React SPA frontend + Supabase backend (Postgres/pgvector + Deno edge functions) + Solidity contracts + Noir ZK circuits. Originally scaffolded with Lovable (see `.lovable/`, `lovable-tagger`).

## Commands

```bash
npm run dev            # Vite dev server on port 8080
npm run build          # Production build
npm run build:dev      # Build in development mode
npm run lint           # ESLint over the whole repo
npm run preview        # Preview the production build
npm run verify:agents  # Check edge-function agent sandbox/auth/permission wiring
```

There is no test framework configured — `lint`, `build`, and `verify:agents` are the verification tools available.

Both `bun.lock`/`bun.lockb` and `package-lock.json` exist; either package manager works.

## Frontend architecture

- **Entry chain**: `src/main.tsx` — `src/polyfills.ts` MUST stay the first import (Buffer/global shims that ethers/wagmi need in the browser; `vite.config.ts` also defines `global` and `process.env`). Provider nesting is QueryClient → Farcaster AuthKit → Wagmi → BrowserRouter → Sound → WalletErrorBoundary → Wallet, then `App.tsx` adds ThemeProvider (dark default) and two Security providers.
- **Routing**: all routes are declared flatly in `src/App.tsx` (react-router). New pages go in `src/pages/` and get a route there. Note some pages in `src/pages/` are not routed.
- **Path alias**: `@/` → `src/`.
- **UI**: shadcn/ui components in `src/components/ui/` (Radix + Tailwind, `components.json` config). Design language is retro pixel-art/arcade with HSL semantic tokens in Tailwind config.
- **Layer split**:
  - `src/integrations/` — one directory per external API/protocol client (supabase, coingecko, defillama, uniswap, 0x, odos, kyberswap, superfluid, farcaster, etc.)
  - `src/services/` — domain logic (biblical wisdom/advisor, church database, crawlers, payments, ZK proofs) that composes integrations
  - `src/config/` — wagmi/chain setup (`wagmi.ts`, `rpc.ts`), deployment and domain config
  - `src/farcaster/` — mini-app auth, frames, connectors
- **Web3**: wagmi + viem, plus ethers for contract interactions. Base is the primary chain. Wallet state lives in `src/contexts/WalletContext.tsx`.

## Supabase backend

- Client and generated DB types: `src/integrations/supabase/` (env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` in `.env`).
- Edge functions (Deno): `supabase/functions/<name>/`; SQL migrations: `supabase/migrations/`. Per-function JWT settings live in `supabase/config.toml` — add an entry when creating a function.
- **Agent sandbox pattern**: edge functions acting as autonomous "agents" wrap handlers with `withAgentSandbox` and `requireAgentAuth` from `supabase/functions/_shared/`, and each `agentName` must be registered in the `agent_ops.agent_permissions` migrations. `npm run verify:agents` enforces this — run it after touching agent functions or those migrations.
- RAG pipeline: crawlers/services generate content → `generate-embeddings` function → pgvector tables (`biblical_knowledge_base`, etc.) → advisor functions (`biblical-advisor`, `enhanced-biblical-advisor`) do semantic retrieval.

## Contracts & circuits

- Solidity sources are split across `contracts/` (BWSP/BWTYA protocol, BibleFiUSD, Superfluid, Spandex advisory) and `src/contracts/` (tokens, tithe/wisdom verifiers, governance).
- Deployment: Hardhat scripts in `scripts/contracts/` (own `hardhat.config.ts`) and Foundry-style `.s.sol` scripts in `script/`. Neither toolchain is installed as a repo dependency — deployment is handled outside the normal npm workflow (see `BASE_DEPLOYMENT_GUIDE.md`).
- Noir ZK circuits in `circuits/` (`private_tithe.nr`, `wisdom_threshold.nr`), consumed in the frontend via `@noir-lang/noir_js` (`src/services/zkProofService.ts`).

## Reference docs

Root-level markdown files document intent: `PROJECT_OVERVIEW.md` (features/vision), `TECH_STACK.md` (full stack + DB schema overview), `docs/BWSP_BWTYA_FRAMEWORK.md` (agent framework), plus deployment guides (`BASE_DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_CHECKLIST.md`).
