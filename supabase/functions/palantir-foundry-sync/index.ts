// palantir-foundry-sync — Supabase Edge Function
//
// Scheduled bidirectional sync between BibleFI Supabase tables and
// Palantir Foundry ontology objects.
//
// Called by pg_cron jobs registered in the migration:
//   20260802_palantir_foundry_integration.sql
//
// Modes (passed in request body):
//   "full"     — push all databases + pull ML scores (default, used by daily cron)
//   "push"     — push only (incremental, uses last_synced_at from foundry_sync_config)
//   "pull"     — pull ML-enhanced scores from Foundry into Supabase only
//   "status"   — return sync config and last run stats (no auth required)
//
// Auth: x-cron-secret header (same CRON_SECRET used by all other agents)
//       OR Authorization: ******

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// ── Palantir Foundry client (Deno-native, no npm imports) ───────────────────

class FoundryDenoCient {
  private baseUrl: string;
  private token: string;
  private ontRid: string;

  constructor() {
    const stack  = Deno.env.get('PALANTIR_STACK') ?? '';
    this.token   = Deno.env.get('PALANTIR_TOKEN') ?? '';
    this.ontRid  = Deno.env.get('PALANTIR_ONT_RID') ?? '';
    this.baseUrl = Deno.env.get('PALANTIR_BASE_URL') ?? `https://${stack}`;

    if (!stack || !this.token || !this.ontRid) {
      throw new Error('PALANTIR_STACK, PALANTIR_TOKEN, PALANTIR_ONT_RID must all be set');
    }
  }

  private authHeader() {
    return { 'Authorization': 'Bearer ' + this.token, 'Content-Type': 'application/json' };
  }

  async batchUpsert(objectType: string, objects: Record<string, unknown>[]): Promise<void> {
    if (objects.length === 0) return;
    const BATCH = 500;
    for (let i = 0; i < objects.length; i += BATCH) {
      const slice = objects.slice(i, i + BATCH);
      const res = await fetch(
        `${this.baseUrl}/api/v2/ontologies/${this.ontRid}/objects/${objectType}/batchApplyObjectEdits`,
        {
          method: 'POST',
          headers: this.authHeader(),
          body: JSON.stringify({
            edits: slice.map((o) => ({ type: 'modifyObject', primaryKey: o['primaryKey'], properties: o })),
          }),
        },
      );
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`[Foundry] batchUpsert ${objectType} failed ${res.status}: ${body.slice(0, 300)}`);
      }
    }
  }

  async searchObjects(objectType: string, where: Record<string, unknown> = {}, pageSize = 500) {
    const res = await fetch(
      `${this.baseUrl}/api/v2/ontologies/${this.ontRid}/objects/${objectType}/search`,
      {
        method: 'POST',
        headers: this.authHeader(),
        body: JSON.stringify({ where, pageSize }),
      },
    );
    if (!res.ok) return { data: [] };
    return res.json();
  }
}

// ── djb2 hex hash — mirrors TypeScript service and Solidity verseHash ───────

function djb2Hex(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h) ^ text.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ────────────────────────────────────────────────────────────────────────────
// Handler
// ────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const cronSecret      = Deno.env.get('CRON_SECRET');

  // ── Auth ─────────────────────────────────────────────────────────────────
  const xCronSecret = req.headers.get('x-cron-secret');
  const bearer      = req.headers.get('authorization')?.replace('Bearer ', '');

  const isStatusRequest = req.url.includes('?mode=status') ||
    (await req.clone().json().catch(() => ({}))).mode === 'status';

  if (!isStatusRequest) {
    const valid = (cronSecret && xCronSecret === cronSecret) ||
                  (bearer === serviceRoleKey);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let body: { mode?: string; since?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }
  const mode = body.mode ?? 'full';

  // Status mode — no Foundry calls needed
  if (mode === 'status') {
    const { data: cfg } = await supabase
      .from('foundry_sync_config')
      .select('database_name, last_synced_at, rows_synced, errors_last_run')
      .order('database_name');
    return new Response(JSON.stringify({ status: 'ok', syncConfig: cfg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Foundry client ────────────────────────────────────────────────────────
  let foundry: FoundryDenoCient;
  try {
    foundry = new FoundryDenoCient();
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Foundry client initialization failed', hint: 'Set PALANTIR_* env vars in Supabase secrets' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: Record<string, unknown> = {};

  // ── Determine incremental watermark ──────────────────────────────────────
  const getSince = async (db: string): Promise<string | undefined> => {
    if (body.since) return body.since;
    const { data } = await supabase
      .from('foundry_sync_config')
      .select('last_synced_at')
      .eq('database_name', db)
      .single();
    return data?.last_synced_at ?? undefined;
  };

  const updateSyncConfig = async (db: string, rowsSynced: number, errors: string[]) => {
    await supabase.from('foundry_sync_config').upsert({
      database_name:    db,
      last_synced_at:   new Date().toISOString(),
      rows_synced:      rowsSynced,
      errors_last_run:  errors.length > 0 ? errors.slice(0, 10) : null,
    }, { onConflict: 'database_name' });
  };

  // ── PUSH: Biblical Wisdom ─────────────────────────────────────────────────
  if (mode === 'full' || mode === 'push') {
    const since = await getSince('biblical_wisdom');
    let qb = supabase
      .from('biblical_knowledge_base')
      .select('reference, verse_text, category, principle, application, defi_relevance, financial_keywords, created_at')
      .limit(500);
    if (since) qb = qb.gt('created_at', since);
    const { data: scriptures } = await qb;

    const scriptureObjects = (scriptures ?? []).map((row: Record<string, unknown>) => ({
      objectType:        'biblefi.Scripture',
      primaryKey:        row['reference'],
      reference:         row['reference'],
      kjvText:           row['verse_text'],
      strongsNumbers:    [],
      financialCategory: row['category'] ?? 'stewardship_and_wisdom',
      principle:         row['principle'] ?? '',
      defiApplication:   row['defi_relevance'] ?? row['application'] ?? '',
      financialKeywords: row['financial_keywords'] ?? [],
      verseHash:         djb2Hex(String(row['verse_text'] ?? row['reference'])),
      tripleCheckStatus: 'pending',
      createdAt:         row['created_at'] ?? new Date().toISOString(),
    }));

    await foundry.batchUpsert('biblefi.Scripture', scriptureObjects);
    const errors: string[] = [];
    await updateSyncConfig('biblical_wisdom', scriptureObjects.length, errors);
    results['biblical_wisdom'] = { pushed: scriptureObjects.length };
  }

  // ── PUSH: DeFi Opportunities ──────────────────────────────────────────────
  if (mode === 'full' || mode === 'push') {
    const since = await getSince('defi_opportunities');
    let qb = supabase
      .from('defi_knowledge_base')
      .select('topic, content, protocol, category, created_at')
      .limit(500);
    if (since) qb = qb.gt('created_at', since);
    const { data: defi } = await qb;

    const defiObjects = (defi ?? []).map((row: Record<string, unknown>) => ({
      objectType: 'biblefi.DeFiPrinciple',
      primaryKey: `${row['protocol'] ?? 'general'}:${row['topic'] ?? row['category']}`,
      protocol:   row['protocol'] ?? 'general',
      topic:      row['topic'] ?? row['category'] ?? 'general',
      content:    row['content'] ?? '',
      chain:      'base',
      category:   row['category'] ?? 'general',
      createdAt:  row['created_at'] ?? new Date().toISOString(),
    }));

    await foundry.batchUpsert('biblefi.DeFiPrinciple', defiObjects);
    await updateSyncConfig('defi_opportunities', defiObjects.length, []);
    results['defi_opportunities'] = { pushed: defiObjects.length };
  }

  // ── PUSH: BWTYA Scores ─────────────────────────────────────────────────────
  if (mode === 'full' || mode === 'push') {
    const since = await getSince('bwtya_scores');
    let qb = supabase
      .from('bwtya_opportunity_scores')
      .select('protocol, pool_name, chain, apy, tvl_usd, bwtya_score, biblical_alignment_score, stewardship_grade, scored_at')
      .limit(500);
    if (since) qb = qb.gt('scored_at', since);
    const { data: scores } = await qb;

    const scoreObjects = (scores ?? []).map((row: Record<string, unknown>) => ({
      objectType:             'biblefi.BWTYAScore',
      primaryKey:             `${row['protocol']}:${row['pool_name']}:${row['chain']}`,
      protocol:               row['protocol'],
      poolName:               row['pool_name'],
      chain:                  row['chain'],
      apy:                    row['apy'] ?? 0,
      tvlUsd:                 row['tvl_usd'] ?? 0,
      bwtyaScore:             row['bwtya_score'],
      biblicalAlignmentScore: row['biblical_alignment_score'] ?? 0,
      stewardshipGrade:       row['stewardship_grade'],
      scoredAt:               row['scored_at'] ?? new Date().toISOString(),
    }));

    await foundry.batchUpsert('biblefi.BWTYAScore', scoreObjects);
    await updateSyncConfig('bwtya_scores', scoreObjects.length, []);
    results['bwtya_scores'] = { pushed: scoreObjects.length };
  }

  // ── PUSH: Church Directory (masked) ───────────────────────────────────────
  if (mode === 'full' || mode === 'push') {
    const since = await getSince('church_directory');
    let qb = supabase
      .from('global_churches')
      .select('id, name, denomination, city, country, accepts_crypto, crypto_networks, verified, updated_at')
      .limit(500);
    if (since) qb = qb.gt('updated_at', since);
    const { data: churches } = await qb;

    const churchObjects = (churches ?? []).map((row: Record<string, unknown>) => ({
      objectType:    'biblefi.Church',
      primaryKey:    row['id'],
      name:          row['name'],
      denomination:  row['denomination'] ?? null,
      city:          row['city'],
      country:       row['country'],
      acceptsCrypto: !!row['accepts_crypto'],
      cryptoNetworks: row['crypto_networks'] ?? [],
      verified:      !!row['verified'],
    }));

    await foundry.batchUpsert('biblefi.Church', churchObjects);
    await updateSyncConfig('church_directory', churchObjects.length, []);
    results['church_directory'] = { pushed: churchObjects.length };
  }

  // ── PULL: ML-enhanced scores from Foundry → Supabase ─────────────────────
  if (mode === 'full' || mode === 'pull') {
    const page = await foundry.searchObjects(
      'biblefi.BWTYAScore',
      { mlEnhancedScore: { $exists: true } },
      500,
    );
    let updated = 0;
    for (const obj of (page.data ?? [])) {
      if (!obj.mlEnhancedScore) continue;
      const [protocol, poolName, chain] = (obj.primaryKey as string).split(':');
      await supabase
        .from('bwtya_opportunity_scores')
        .update({
          ml_enhanced_score: obj.mlEnhancedScore,
          ml_confidence:     obj.mlConfidence ?? null,
          ml_synced_at:      new Date().toISOString(),
        })
        .eq('protocol', protocol)
        .eq('pool_name', poolName)
        .eq('chain', chain ?? 'base');
      updated++;
    }
    results['ml_pull'] = { updated };
  }

  // ── Log to foundry_action_log ─────────────────────────────────────────────
  await supabase.from('foundry_action_log').insert({
    action_type: `sync_${mode}`,
    triggered_by: 'cron',
    results: results,
    status: 'success',
    executed_at: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ ok: true, mode, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
