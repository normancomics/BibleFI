// Palantir Foundry Bidirectional Sync Service
//
// Pushes BibleFI data to Foundry ontology objects and pulls
// Foundry AIP enrichments back into Supabase.
//
// Sync directions
// ───────────────
// PUSH (Supabase → Foundry):
//   • biblical_knowledge_base     → Scripture objects
//   • defi_knowledge_base         → DeFiPrinciple objects
//   • bwtya_opportunity_scores    → BWTYAScore objects
//   • bwsp_query_log              → AgentRun objects
//   • global_churches (masked)    → Church objects
//   • On-chain BWSP events        → ContractAnchor objects
//
// PULL (Foundry → Supabase):
//   • ML-enhanced BWTYAScore.mlEnhancedScore → bwtya_opportunity_scores.ml_enhanced_score
//   • Cross-reference links → biblical_financial_crossref
//
// This service is designed to be called from:
//   a) The palantir-foundry-sync Supabase edge function (scheduled)
//   b) Directly from client code for on-demand syncs

import { supabase } from '@/integrations/supabase/client';
import { getFoundryClient } from './foundryClient';
import { FOUNDRY_OBJECT_TYPES, FOUNDRY_LINK_TYPES } from './types';
import type {
  FoundryScriptureObject,
  FoundryDeFiPrincipleObject,
  FoundryBWTYAScoreObject,
  FoundryAgentRunObject,
  FoundryChurchObject,
  FoundrySyncManifest,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

/** Maximum rows pushed per sync call (prevents timeout on large tables) */
const SYNC_BATCH_SIZE = 500;

// ────────────────────────────────────────────────────────────────────────────
// FoundrySyncService
// ────────────────────────────────────────────────────────────────────────────

export class FoundrySyncService {

  // ── PUSH: biblical_knowledge_base → Scripture objects ──────────────────

  async pushScriptures(since?: string): Promise<FoundrySyncManifest> {
    const manifest: FoundrySyncManifest = {
      database: 'biblical_wisdom',
      objectType: FOUNDRY_OBJECT_TYPES.SCRIPTURE,
      lastSyncedAt: new Date().toISOString(),
      rowsSynced: 0,
      errors: [],
    };

    try {
      let query = supabase
        .from('biblical_knowledge_base')
        .select('reference, verse_text, category, principle, application, defi_relevance, financial_keywords, created_at')
        .limit(SYNC_BATCH_SIZE);
      if (since) query = query.gt('created_at', since);

      const { data, error } = await query;
      if (error) throw error;

      const objects: FoundryScriptureObject[] = (data ?? []).map((row) => ({
        objectType:        FOUNDRY_OBJECT_TYPES.SCRIPTURE,
        primaryKey:        row.reference,
        reference:         row.reference,
        kjvText:           row.verse_text,
        strongsNumbers:    [],
        financialCategory: row.category ?? 'stewardship_and_wisdom',
        principle:         row.principle ?? '',
        defiApplication:   row.defi_relevance ?? row.application ?? '',
        financialKeywords: row.financial_keywords ?? [],
        verseHash:         this._djb2Hex(row.verse_text ?? row.reference),
        tripleCheckStatus: 'pending' as const,
        createdAt:         row.created_at ?? new Date().toISOString(),
      }));

      const client = getFoundryClient();
      await client.batchUpsertObjects(FOUNDRY_OBJECT_TYPES.SCRIPTURE, objects);
      manifest.rowsSynced = objects.length;
    } catch (err) {
      manifest.errors.push(String(err));
    }

    return manifest;
  }

  // ── PUSH: defi_knowledge_base → DeFiPrinciple objects ──────────────────

  async pushDeFiPrinciples(since?: string): Promise<FoundrySyncManifest> {
    const manifest: FoundrySyncManifest = {
      database: 'defi_opportunities',
      objectType: FOUNDRY_OBJECT_TYPES.DEFI_PRINCIPLE,
      lastSyncedAt: new Date().toISOString(),
      rowsSynced: 0,
      errors: [],
    };

    try {
      let query = supabase
        .from('defi_knowledge_base')
        .select('topic, content, protocol, category, chain, created_at')
        .limit(SYNC_BATCH_SIZE);
      if (since) query = query.gt('created_at', since);

      const { data, error } = await query;
      if (error) throw error;

      const objects: FoundryDeFiPrincipleObject[] = (data ?? []).map((row) => ({
        objectType: FOUNDRY_OBJECT_TYPES.DEFI_PRINCIPLE,
        primaryKey: `${row.protocol ?? 'general'}:${row.topic ?? row.category ?? 'general'}`,
        protocol:   row.protocol ?? 'general',
        topic:      row.topic ?? row.category ?? 'general',
        content:    row.content ?? '',
        chain:      row.chain ?? 'base',
        category:   row.category ?? 'general',
        createdAt:  row.created_at ?? new Date().toISOString(),
      }));

      const client = getFoundryClient();
      await client.batchUpsertObjects(FOUNDRY_OBJECT_TYPES.DEFI_PRINCIPLE, objects);
      manifest.rowsSynced = objects.length;
    } catch (err) {
      manifest.errors.push(String(err));
    }

    return manifest;
  }

  // ── PUSH: bwtya_opportunity_scores → BWTYAScore objects ─────────────────

  async pushBWTYAScores(since?: string): Promise<FoundrySyncManifest> {
    const manifest: FoundrySyncManifest = {
      database: 'defi_opportunities',
      objectType: FOUNDRY_OBJECT_TYPES.BWTYA_SCORE,
      lastSyncedAt: new Date().toISOString(),
      rowsSynced: 0,
      errors: [],
    };

    try {
      let query = supabase
        .from('bwtya_opportunity_scores')
        .select('protocol, pool_name, token_symbol, chain, apy, tvl_usd, risk_score, bwtya_score, biblical_alignment_score, stewardship_grade, scored_at')
        .limit(SYNC_BATCH_SIZE);
      if (since) query = query.gt('scored_at', since);

      const { data, error } = await query;
      if (error) throw error;

      const objects: FoundryBWTYAScoreObject[] = (data ?? []).map((row) => ({
        objectType:              FOUNDRY_OBJECT_TYPES.BWTYA_SCORE,
        primaryKey:              `${row.protocol}:${row.pool_name}:${row.chain}`,
        protocol:                row.protocol,
        poolName:                row.pool_name,
        chain:                   row.chain,
        apy:                     row.apy ?? 0,
        tvlUsd:                  row.tvl_usd ?? 0,
        bwtyaScore:              row.bwtya_score,
        convictionScore:         0,  // populated by AIP action
        fruitBearingScore:       0,
        faithfulnessScore:       0,
        biblicalAlignmentScore:  row.biblical_alignment_score ?? 0,
        transparencyScore:       0,
        riskAdjustedYield:       0,
        kellyWeight:             0,
        stewardshipGrade:        row.stewardship_grade,
        scoredAt:                row.scored_at ?? new Date().toISOString(),
      }));

      const client = getFoundryClient();
      await client.batchUpsertObjects(FOUNDRY_OBJECT_TYPES.BWTYA_SCORE, objects);
      manifest.rowsSynced = objects.length;
    } catch (err) {
      manifest.errors.push(String(err));
    }

    return manifest;
  }

  // ── PUSH: bwsp_query_log → AgentRun objects ──────────────────────────────

  async pushAgentRuns(since?: string): Promise<FoundrySyncManifest> {
    const manifest: FoundrySyncManifest = {
      database: 'agent_runs',
      objectType: FOUNDRY_OBJECT_TYPES.AGENT_RUN,
      lastSyncedAt: new Date().toISOString(),
      rowsSynced: 0,
      errors: [],
    };

    try {
      let query = supabase
        .from('bwsp_query_log')
        .select('id, wallet_address, query, intent, synthesis_method, confidence_score, processing_time_ms, primary_scripture_ref, bwtya_strategy_id, bwtya_projected_apy, created_at')
        .limit(SYNC_BATCH_SIZE);
      if (since) query = query.gt('created_at', since);

      const { data, error } = await query;
      if (error) throw error;

      const objects: FoundryAgentRunObject[] = (data ?? []).map((row) => ({
        objectType:                   FOUNDRY_OBJECT_TYPES.AGENT_RUN,
        primaryKey:                   row.id,
        agentName:                    'bwsp-sovereign-agent',
        walletAddress:                row.wallet_address ?? undefined,
        queryText:                    row.query,
        intent:                       row.intent,
        synthesisMethod:              row.synthesis_method,
        confidenceScore:              row.confidence_score ?? 0,
        authorityWeightedConfidence:  0,
        resonanceScore:               0,
        primaryScriptureRef:          row.primary_scripture_ref ?? '',
        processingTimeMs:             row.processing_time_ms ?? 0,
        bwtyaStrategyId:              row.bwtya_strategy_id ?? undefined,
        bwtyaProjectedApy:            row.bwtya_projected_apy ?? undefined,
        tripleCheckPassed:            false,
        createdAt:                    row.created_at ?? new Date().toISOString(),
      }));

      const client = getFoundryClient();
      await client.batchUpsertObjects(FOUNDRY_OBJECT_TYPES.AGENT_RUN, objects);
      manifest.rowsSynced = objects.length;
    } catch (err) {
      manifest.errors.push(String(err));
    }

    return manifest;
  }

  // ── PUSH: global_churches → Church objects (masked PII) ─────────────────

  async pushChurches(since?: string): Promise<FoundrySyncManifest> {
    const manifest: FoundrySyncManifest = {
      database: 'church_directory',
      objectType: FOUNDRY_OBJECT_TYPES.CHURCH,
      lastSyncedAt: new Date().toISOString(),
      rowsSynced: 0,
      errors: [],
    };

    try {
      let query = supabase
        .from('global_churches')
        .select('id, name, denomination, city, country, accepts_crypto, crypto_networks, verified, updated_at')
        .limit(SYNC_BATCH_SIZE);
      if (since) query = query.gt('updated_at', since);

      const { data, error } = await query;
      if (error) throw error;

      const objects: FoundryChurchObject[] = (data ?? []).map((row) => ({
        objectType:    FOUNDRY_OBJECT_TYPES.CHURCH,
        primaryKey:    row.id,
        name:          row.name,
        denomination:  row.denomination ?? undefined,
        city:          row.city,
        country:       row.country,
        acceptsCrypto: !!row.accepts_crypto,
        cryptoNetworks: row.crypto_networks ?? [],
        verified:      !!row.verified,
        // address, phone, email intentionally excluded (PII)
      }));

      const client = getFoundryClient();
      await client.batchUpsertObjects(FOUNDRY_OBJECT_TYPES.CHURCH, objects);
      manifest.rowsSynced = objects.length;
    } catch (err) {
      manifest.errors.push(String(err));
    }

    return manifest;
  }

  // ── PULL: Foundry ML scores → bwtya_opportunity_scores ──────────────────

  async pullMlEnhancedScores(): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    try {
      const client = getFoundryClient();
      let pageToken: string | undefined;

      do {
        const page = await client.searchObjects<{
          primaryKey: string;
          mlEnhancedScore?: number;
          mlConfidence?: number;
        }>(FOUNDRY_OBJECT_TYPES.BWTYA_SCORE, {
          where: { mlEnhancedScore: { $exists: true } },
          pageSize: 500,
          pageToken,
        });

        for (const obj of page.data) {
          if (!obj.mlEnhancedScore) continue;
          const [protocol, poolName, chain] = obj.primaryKey.split(':');
          const { error } = await supabase
            .from('bwtya_opportunity_scores')
            .update({
              ml_enhanced_score:  obj.mlEnhancedScore,
              ml_confidence:      obj.mlConfidence ?? null,
              ml_synced_at:       new Date().toISOString(),
            })
            .eq('protocol', protocol)
            .eq('pool_name', poolName)
            .eq('chain', chain ?? 'base');
          if (error) errors.push(`${obj.primaryKey}: ${error.message}`);
          else updated++;
        }

        pageToken = page.nextPageToken;
      } while (pageToken);
    } catch (err) {
      errors.push(String(err));
    }

    return { updated, errors };
  }

  // ── Full bidirectional sync (called by edge function) ────────────────────

  async runFullSync(options: {
    since?: string;
    push?: { scriptures?: boolean; defi?: boolean; bwtya?: boolean; agents?: boolean; churches?: boolean };
    pull?: { mlScores?: boolean };
  } = {}): Promise<{ manifests: FoundrySyncManifest[]; pullResults: Record<string, unknown> }> {
    const push = options.push ?? { scriptures: true, defi: true, bwtya: true, agents: true, churches: true };
    const pull = options.pull ?? { mlScores: true };

    const manifests: FoundrySyncManifest[] = [];
    const pullResults: Record<string, unknown> = {};

    if (push.scriptures)  manifests.push(await this.pushScriptures(options.since));
    if (push.defi)        manifests.push(await this.pushDeFiPrinciples(options.since));
    if (push.bwtya)       manifests.push(await this.pushBWTYAScores(options.since));
    if (push.agents)      manifests.push(await this.pushAgentRuns(options.since));
    if (push.churches)    manifests.push(await this.pushChurches(options.since));

    if (pull.mlScores) {
      pullResults.mlScores = await this.pullMlEnhancedScores();
    }

    return { manifests, pullResults };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /** djb2-style hex hash — mirrors BWSPWisdomRegistry/BibleFiBWSP.sol verseHash */
  private _djb2Hex(text: string): string {
    let h = 5381;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) + h) ^ text.charCodeAt(i);
      h = h >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }
}

export const foundrySyncService = new FoundrySyncService();
