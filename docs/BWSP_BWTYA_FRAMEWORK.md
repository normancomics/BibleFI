# BWSP + BWTYA Framework

## Biblical-Wisdom-Synthesis-Protocol & Biblical-Wisdom-To-Yield-Algorithm

> "The plans of the diligent lead to profit as surely as haste leads to poverty." — Proverbs 21:5

---

## What is BWSP?

**BWSP (Biblical-Wisdom-Synthesis-Protocol)** is a RAG (Retrieval-Augmented Generation) AGI-MCP
Sovereign Agent Framework that combines:

- **pgvector semantic search** over a biblical knowledge base
- **DeFi protocol knowledge retrieval**
- **Live on-chain market data** (Fear & Greed Index, TVL, APY)
- **LLM synthesis** (gpt-4o-mini) to produce scripture-grounded financial guidance

BWSP is fully **offline-first**: every network call has a deterministic local fallback so the
BibleFI Farcaster mini-app works even without internet connectivity.

---

## What is BWTYA?

**BWTYA (Biblical-Wisdom-To-Yield-Algorithm)** is a pure-TypeScript scoring and strategy engine
that evaluates DeFi yield opportunities through four biblical dimensions and maps them to three
named stewardship strategies.

---

## 5-Step Agent Flow

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│               BWSPSovereignAgent.run()                  │
│                                                         │
│  Step 1 ─ Retrieve Biblical Scriptures                  │
│           BWSPRetriever → pgvector match_biblical_knowledge RPC
│           → offline keyword fallback (comprehensiveFinancialScriptures)
│                                                         │
│  Step 2 ─ Retrieve DeFi Knowledge                       │
│           BWSPRetriever → pgvector match_defi_knowledge RPC
│           → offline hardcoded DeFi fundamentals         │
│                                                         │
│  Step 3 ─ Fetch Live Market Data                        │
│           fetchBaseDeFiTVL() + getMarketSentiment()     │
│           → offline neutral-market fallback             │
│                                                         │
│  Step 4 ─ Assemble BWSP Context                         │
│           BWSPContextAssembler.assemble() + toPromptContext()
│                                                         │
│  Step 5 ─ Synthesize Biblical Wisdom                    │
│           BWSPSynthesizer → bwsp-sovereign-agent edge fn│
│           → 7-category offline synthesis fallback       │
└─────────────────────────────────────────────────────────┘
    │
    ▼
BWSPResponse (guidance, principle, action, scriptures, steps)
    │
    ▼ (optional)
BWTYAAlgorithm.run() → score → rank → map strategies → tithe calc
    │
    ▼
BWTYAResult (strategies, titheAmount, yieldAfterTithe, projectedApy)
```

---

## BWTYA Scoring Dimensions

| Dimension | Scripture | Max Points | What is Measured |
|-----------|-----------|-----------|------------------|
| Fruit-bearing | John 15:16 | 30 | APY sustainability + TVL depth |
| Faithful Stewardship | Matthew 25:14 | 25 | Risk score + audit + verification |
| Biblical Alignment | Proverbs 3:9 | 25 | Protocol description keywords |
| Transparency | Luke 16:10 | 20 | Transparent + audited + verified flags |
| **Total** | | **100** | |

### Stewardship Grades

| Score | Grade | Description |
|-------|-------|-------------|
| 85–100 | A | Excellent alignment with biblical stewardship principles |
| 70–84 | B | Good protocol with minor areas for improvement |
| 55–69 | C | Acceptable, but proceed with prayer and caution |
| 40–54 | D | Below standard — significant biblical concerns |
| 0–39 | F | Not recommended — fails core stewardship criteria |

---

## Three Named Strategies

| Strategy | Scripture | Risk Profile | Min Wisdom Score | Description |
|----------|-----------|--------------|-----------------|-------------|
| Joseph's Storehouse | Genesis 41:35 | Conservative | 0 | Store up in good years; preserve capital above all |
| Talents Multiplied | Matthew 25:29 | Moderate | 30 | Balanced growth via diligent stewardship |
| Solomon's Portfolio | Ecclesiastes 11:2 | Advanced | 70 | Diversified across 5 positions for Kingdom returns |

All strategies include a **10% tithe reserve** before projecting net yield.

---

## Hook Usage

```tsx
import { useBWSP } from '@/hooks/useBWSP';
import type { YieldOpportunity } from '@/services/bwtya/types';

function MyComponent() {
  const { bwspResponse, bwtyaResult, isLoading, error, runWisdomQuery, reset } = useBWSP();

  const opportunities: YieldOpportunity[] = [
    {
      protocol: 'Aave',
      poolName: 'USDC Lending',
      tokenSymbol: 'USDC',
      chain: 'Base',
      apy: 4.8,
      tvlUsd: 2_500_000_000,
      riskScore: 15,
      category: 'lending',
      biblicalAlignment: 'transparent, audited, faithful stewardship',
      isVerified: true,
      audited: true,
      transparent: true,
    },
  ];

  const handleQuery = () => {
    runWisdomQuery(
      {
        text: 'What yield strategy aligns with biblical stewardship?',
        walletAddress: '0xABC...',
        wisdomScore: 45,
        availableCapital: 5000,
      },
      opportunities,
    );
  };

  if (isLoading) return <p>Seeking wisdom...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <button onClick={handleQuery}>Ask BWSP</button>
      {bwspResponse && <p>{bwspResponse.wisdomGuidance}</p>}
      {bwtyaResult && <p>Strategy: {bwtyaResult.recommendedStrategy.name}</p>}
    </div>
  );
}
```

---

## BWSPWisdomPanel Component

Drop-in UI panel:

```tsx
import { BWSPWisdomPanel } from '@/components/bwsp';

<BWSPWisdomPanel
  walletAddress="0xABC..."
  wisdomScore={45}
  capitalUsd={5000}
  availableOpportunities={myOpportunities} // optional; uses demo data if omitted
/>
```

---

## Edge Function API Reference

### `POST /functions/v1/bwsp-sovereign-agent`

**Request Body:**
```json
{
  "query": "string (required, max 1000 chars)",
  "intent": "yield_advice | risk_assessment | tithe_guidance | stewardship_principle | defi_action | tax_wisdom | general_wisdom",
  "context": "string (optional pre-assembled context)",
  "wisdomScore": 0,
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "guidance": "2-3 sentence biblical wisdom answer",
  "principle": "One-sentence core financial principle",
  "action": "One concrete actionable step",
  "primaryScripture": "Proverbs 3:9",
  "supportingScriptures": ["Matthew 25:14", "Luke 16:10"],
  "confidenceScore": 0.85,
  "tokenCount": 312,
  "synthesisMethod": "rag_vector",
  "protocol": "BWSP-v1.0"
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `OPENAI_API_KEY` | Edge fn only | OpenAI API key for gpt-4o-mini + embeddings |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge fn only | Service role key for DB writes |

The client-side framework (`BWSPEngine`, `BWSPSovereignAgent`) uses the public anon key.
The edge function uses the service role key for logging.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `bwsp_query_log` | Audit log of every BWSP query with wallet, intent, confidence |
| `bwtya_opportunity_scores` | Cached BWTYA scores for DeFi opportunities |
| `biblical_knowledge_base` | Scripture embeddings (existing, extended by this feature) |
| `defi_knowledge_base` | DeFi protocol embeddings (new) |

---

## Extension Guide — Adding New MCP Tools

To add a new "tool" to the sovereign agent:

1. **Add a step** in `sovereignAgent.ts` between existing steps.
2. **Create a new retriever method** if it needs external data.
3. **Update `BWSPContext`** in `types.ts` to include the new data.
4. **Update `toPromptContext()`** in `contextAssembler.ts` to include it in the LLM prompt.
5. **Add a new intent** in `engine.ts` `INTENT_SIGNALS` if queries need routing.
6. **Add an offline fallback** in `synthesizer.ts` `OFFLINE_BY_INTENT` for the new intent.

### Adding a New BWTYA Scoring Dimension

1. Add a new scorer function in `scorer.ts` returning `{ score: number; flags: string[] }`.
2. Add the field to `ScoredOpportunity` in `bwtya/types.ts`.
3. Add it to the `BWTYAScorer.score()` method's total.
4. Document the biblical anchor.
