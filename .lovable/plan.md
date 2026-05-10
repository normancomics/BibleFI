# BibleFi → Palantir Foundry / AIP Import & Chunking Plan

## 1. Deliverables (written to `/mnt/documents/`)

1. `BibleFi_Palantir_AIP_Knowledge_Dossier.md` — already generated (27 KB, 16 sections). Re-export as a `presentation-artifact` so you can download it directly.
2. `BibleFi_Palantir_Import_Manifest.json` — machine-readable manifest AIP TaskManager can read on ingest (source URI, chunker config, ontology mappings, ACLs, refresh cadence).
3. `BibleFi_Palantir_Chunking_Plan.md` — human-readable chunking + ontology spec (this plan, formalized).
4. `BibleFi_Palantir_AIP_TaskManager_Tasks.yaml` — pre-baked task graph for the AIP TaskManager (ingest → chunk → embed → ontology-map → eval → publish).

No project source code is modified — these are pure artifacts.

## 2. Source set to ingest into Foundry

| # | Dataset (Foundry name) | Source path(s) | Format | Refresh |
|---|------------------------|----------------|--------|---------|
| D1 | `biblefi.knowledge.dossier` | `BibleFi_Palantir_AIP_Knowledge_Dossier.md` | Markdown | Manual / on release |
| D2 | `biblefi.scriptures.comprehensive` | `src/data/comprehensiveFinancialScriptures.ts`, `src/lib/biblicalFinanceScriptures.ts`, `src/data/comprehensiveBibleVerses.ts` | TS → JSONL | Hourly |
| D3 | `biblefi.scriptures.multilang` | Supabase `comprehensive_biblical_texts` (KJV, ESV, Hebrew, Greek, Aramaic + Strong's) | Postgres CDC | Hourly |
| D4 | `biblefi.defi.knowledge` | Supabase `defi_knowledge_base`, `src/services/liveMarketDataService.ts` outputs | Postgres + JSON | 30 min |
| D5 | `biblefi.bwsp.spec` | `docs/BWSP_BWTYA_FRAMEWORK.md`, `src/services/bwsp/**`, `src/services/bwtya/**` | Markdown + TS | On commit |
| D6 | `biblefi.contracts` | `contracts/*.sol`, `src/contracts/*.sol` | Solidity | On commit |
| D7 | `biblefi.agents.runtime` | Supabase `agent_ops.*`, `bwsp_query_log`, `bwtya_opportunity_scores` | Postgres CDC | 15 min |
| D8 | `biblefi.churches` | Supabase `churches` (masked public view) | Postgres | Hourly |

## 3. Chunking strategy (per dataset)

Markdown / docs (D1, D5):
- Chunker: `markdown_header_aware`
- `chunk_size = 1200 tokens`, `overlap = 150`, split on `H2`/`H3`, keep frontmatter + nearest header in metadata.

Scripture rows (D2, D3) — *one verse = one chunk* (no token splitting):
- Chunk = `{reference, kjv_text, esv_text, hebrew?, greek?, aramaic?, strongs[], principle, defi_application, category}`
- Hard rule: never split a verse across chunks. This protects BWSP triple-check (authenticity/context/no-cherry-picking).

DeFi knowledge (D4):
- Chunker: `semantic_paragraph`, `chunk_size = 800`, `overlap = 100`, group by `protocol` + `topic`.

Solidity (D6):
- Chunker: `code_symbol_aware` (one chunk per `contract` / `function` / `modifier`), keep NatSpec + scripture comment in metadata.

Agent telemetry (D7):
- Chunker: `event_window` (1h windows), aggregate by agent name; emit summary chunk + raw JSON sidecar.

Churches (D8):
- Chunker: `row_per_chunk`, fields concatenated in canonical order; geo metadata preserved.

Embeddings: `text-embedding-3-large` (3072-d) for prose; for Solidity also store `code-search-ada-002` as secondary index. pgvector cosine on retrieval.

## 4. Ontology mapping (Foundry objects)

```text
KnowledgeChunk ──belongs_to──▶ KnowledgeDocument ──belongs_to──▶ KnowledgeDataset
Scripture      ──cited_by────▶ KnowledgeChunk
Scripture      ──supports────▶ DeFiPrinciple
DeFiPrinciple  ──realized_by─▶ Strategy (Joseph | Talents | Solomon)
Strategy       ──executed_by─▶ ContractFunction (BWTYACore.sol)
AgentRun       ──produced────▶ KnowledgeChunk | Score | Decision
Church         ──validated_by▶ AgentRun
```

Required properties on `KnowledgeChunk`: `id, dataset, doc_id, header_path, text, tokens, embedding, source_uri, sha256, scripture_refs[], strongs[], protocol_refs[], confidence, created_at`.

## 5. AIP TaskManager pipeline

```text
[1] ingest        → pull D1–D8 into Foundry raw layer
[2] normalize     → schema, language detection, dedupe by sha256
[3] chunk         → apply per-dataset chunker (section 3)
[4] embed         → text-embedding-3-large; write to pgvector + Foundry vector index
[5] ontology_map  → upsert objects + edges (section 4)
[6] triple_check  → BWSP authenticity / context / no-cherry-picking eval (LLM-as-judge, blocks publish on fail)
[7] eval          → golden-set retrieval recall@10 ≥ 0.85; scripture-fidelity ≥ 0.95
[8] publish       → promote to `biblefi.prod.*`; emit BWSP_/BWTYA_ event
[9] schedule      → cron per dataset cadence (section 2)
```

Guardrails enforced as TaskManager preconditions: row-level ACL = `biblefi-readers`; PII (church contacts) routed through masked view only; Sabbath mode = jobs run, human approval gates auto-skipped.

## 6. Retrieval contract for BWSP/BWTYA at runtime

- BWSP query → parallel retrieve `top_k=8` from `Scripture` + `top_k=8` from `DeFiPrinciple` + live `MarketContext`.
- Re-rank by authority weight (canonical book weight × Strong's match × cosine).
- Pass to synthesizer with hard cap 3500 prompt tokens; require ≥1 primary scripture + ≥2 supporting before answering.

## 7. What I'll do on approval

1. Re-emit the dossier `<lov-artifact>` link.
2. Generate the three new artifact files listed in §1 and emit them as artifacts.
3. Stop. (No code edits, no migrations.)
