// BWSP – Retriever
// Semantic search via Supabase pgvector RPCs with offline fallback

import { supabase } from '@/integrations/supabase/client';
import { comprehensiveFinancialScriptures } from '@/data/comprehensiveFinancialScriptures';
import type { ScriptureResult, DefiKnowledgeResult } from './types';

// ---------------------------------------------------------------------------
// Offline keyword fallback helpers
// ---------------------------------------------------------------------------

const YIELD_KEYWORDS = ['yield', 'return', 'profit', 'invest', 'earn', 'harvest', 'multiply'];
const TITHE_KEYWORDS = ['tithe', 'offering', 'give', 'firstfruit', 'tenth', 'donate'];
const RISK_KEYWORDS = ['risk', 'danger', 'loss', 'caution', 'prudent', 'guard', 'protect'];
const STEWARDSHIP_KEYWORDS = ['steward', 'manage', 'faithful', 'trust', 'responsible', 'talent'];

function keywordScore(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k)).length;
}

function offlineScriptureSearch(queryText: string, limit = 5): ScriptureResult[] {
  const lower = queryText.toLowerCase();
  const allKeywords = [...YIELD_KEYWORDS, ...TITHE_KEYWORDS, ...RISK_KEYWORDS, ...STEWARDSHIP_KEYWORDS];

  const scored = comprehensiveFinancialScriptures
    .map((s) => {
      const combined = `${s.kjvText} ${s.principle} ${s.defiApplication} ${s.category} ${(s.financialKeywords ?? []).join(' ')}`;
      const score =
        keywordScore(lower, allKeywords) +
        keywordScore(combined.toLowerCase(), lower.split(' ').filter((w) => w.length > 3));
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ s }) => ({
    reference: s.reference,
    text: s.kjvText,
    principle: s.principle,
    defiApplication: s.defiApplication,
    category: s.category,
    similarity: undefined,
  }));
}

// ---------------------------------------------------------------------------
// BWSPRetriever
// ---------------------------------------------------------------------------

export class BWSPRetriever {
  async retrieveScriptures(queryText: string, limit = 5): Promise<ScriptureResult[]> {
    try {
      // Generate embedding via Supabase edge function
      const embedResponse = await supabase.functions.invoke('generate-embeddings', {
        body: { text: queryText },
      });

      if (embedResponse.error || !embedResponse.data?.embedding) {
        throw new Error('Embedding generation failed');
      }

      const embedding: number[] = embedResponse.data.embedding;

      const { data, error } = await supabase.rpc('match_biblical_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: limit,
      });

      if (error || !data || (data as unknown[]).length === 0) {
        throw new Error('No pgvector results');
      }

      return (data as Array<{
        reference: string;
        verse_text: string;
        principle: string;
        application: string;
        category: string;
        similarity: number;
      }>).map((row) => ({
        reference: row.reference,
        text: row.verse_text,
        principle: row.principle ?? '',
        defiApplication: row.application ?? '',
        category: row.category ?? '',
        similarity: row.similarity,
      }));
    } catch {
      // Offline keyword fallback
      return offlineScriptureSearch(queryText, limit);
    }
  }

  async retrieveDefiKnowledge(queryText: string, limit = 5): Promise<DefiKnowledgeResult[]> {
    try {
      const embedResponse = await supabase.functions.invoke('generate-embeddings', {
        body: { text: queryText },
      });

      if (embedResponse.error || !embedResponse.data?.embedding) {
        throw new Error('Embedding generation failed');
      }

      const embedding: number[] = embedResponse.data.embedding;

      const { data, error } = await supabase.rpc('match_defi_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: limit,
      });

      if (error || !data || (data as unknown[]).length === 0) {
        throw new Error('No DeFi knowledge results');
      }

      return (data as Array<{
        topic: string;
        content: string;
        protocol: string;
        similarity: number;
      }>).map((row) => ({
        topic: row.topic ?? '',
        content: row.content ?? '',
        protocol: row.protocol,
        similarity: row.similarity,
      }));
    } catch {
      // Deterministic offline fallback
      return [
        {
          topic: 'Yield Farming Fundamentals',
          content:
            'Yield farming involves providing liquidity to DeFi protocols in exchange for rewards. ' +
            'Key metrics: APY (Annual Percentage Yield), TVL (Total Value Locked), and smart-contract audit status.',
          protocol: 'general',
        },
        {
          topic: 'Liquidity Pool Risks',
          content:
            'Impermanent loss occurs when token prices diverge after depositing into an AMM liquidity pool. ' +
            'Biblical wisdom: count the cost before committing (Luke 14:28).',
          protocol: 'general',
        },
        {
          topic: 'Staking & Tithe Alignment',
          content:
            'Staking rewards can be tithed as firstfruits (Proverbs 3:9). ' +
            'Setting aside 10% of staking income before compounding honours biblical stewardship principles.',
          protocol: 'general',
        },
      ];
    }
  }
}

export const bwspRetriever = new BWSPRetriever();
