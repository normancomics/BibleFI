/**
 * scripture-version-seeder
 *
 * Seeds public.bible_verses with KJV and WEB text for the
 * financial/stewardship verse set that powers BWSP.
 *
 * This seeder only fetches public-domain KJV and WEB text from bible-api.com.
 * It checks the database first and never calls API.Bible or uses a licensed
 * translation API key. Existing rows are not fetched or overwritten.
 *
 * "Bring ye all the tithes into the storehouse" — Malachi 3:10 (KJV)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { requireAgentAuth } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

/** Public-domain translations permitted for BWSP source material. */
const FREE_VERSIONS: Record<string, string> = {
  KJV: 'kjv',
  WEB: 'web',
};

/** Core financial / stewardship references seeded for every version. */
const REFERENCES: Array<{
  book: string;
  chapter: number;
  verse: number;
  testament: 'Old' | 'New';
  relevance: number;
  categories: string[];
}> = [
  { book: 'Malachi', chapter: 3, verse: 10, testament: 'Old', relevance: 10, categories: ['tithing', 'blessing'] },
  { book: 'Proverbs', chapter: 3, verse: 9, testament: 'Old', relevance: 10, categories: ['firstfruits', 'giving'] },
  { book: 'Proverbs', chapter: 22, verse: 7, testament: 'Old', relevance: 10, categories: ['debt'] },
  { book: 'Proverbs', chapter: 13, verse: 11, testament: 'Old', relevance: 9, categories: ['wealth', 'diligence'] },
  { book: 'Proverbs', chapter: 21, verse: 20, testament: 'Old', relevance: 9, categories: ['saving', 'stewardship'] },
  { book: 'Proverbs', chapter: 11, verse: 1, testament: 'Old', relevance: 8, categories: ['justice', 'honesty'] },
  { book: 'Deuteronomy', chapter: 8, verse: 18, testament: 'Old', relevance: 9, categories: ['wealth', 'provision'] },
  { book: 'Deuteronomy', chapter: 14, verse: 22, testament: 'Old', relevance: 10, categories: ['tithing'] },
  { book: 'Genesis', chapter: 41, verse: 35, testament: 'Old', relevance: 9, categories: ['saving', 'storehouse'] },
  { book: 'Ecclesiastes', chapter: 11, verse: 2, testament: 'Old', relevance: 9, categories: ['diversification', 'risk'] },
  { book: 'Psalms', chapter: 24, verse: 1, testament: 'Old', relevance: 7, categories: ['stewardship'] },
  { book: 'Matthew', chapter: 25, verse: 21, testament: 'New', relevance: 10, categories: ['talents', 'stewardship'] },
  { book: 'Matthew', chapter: 6, verse: 21, testament: 'New', relevance: 9, categories: ['treasure', 'heart'] },
  { book: 'Matthew', chapter: 22, verse: 21, testament: 'New', relevance: 9, categories: ['taxes'] },
  { book: 'Luke', chapter: 16, verse: 11, testament: 'New', relevance: 10, categories: ['faithfulness', 'mammon'] },
  { book: 'Luke', chapter: 14, verse: 28, testament: 'New', relevance: 9, categories: ['planning', 'cost'] },
  { book: '1 Timothy', chapter: 6, verse: 10, testament: 'New', relevance: 10, categories: ['greed', 'warning'] },
  { book: '2 Corinthians', chapter: 9, verse: 7, testament: 'New', relevance: 10, categories: ['giving', 'generosity'] },
  { book: '1 Corinthians', chapter: 4, verse: 2, testament: 'New', relevance: 10, categories: ['stewardship'] },
  { book: 'Romans', chapter: 13, verse: 8, testament: 'New', relevance: 9, categories: ['debt'] },
  { book: 'Hebrews', chapter: 13, verse: 5, testament: 'New', relevance: 8, categories: ['contentment'] },
  { book: 'James', chapter: 5, verse: 4, testament: 'New', relevance: 8, categories: ['wages', 'justice'] },
  // Ananias and Sapphira — greed, lying to the Holy Ghost about the price of land
  // (Acts 5:1-11). Seeded in full because BWSP cites it on honesty in reporting.
  { book: 'Acts', chapter: 5, verse: 1, testament: 'New', relevance: 10, categories: ['greed', 'honesty', 'giving'] },
  { book: 'Acts', chapter: 5, verse: 2, testament: 'New', relevance: 10, categories: ['greed', 'honesty', 'deceit'] },
  { book: 'Acts', chapter: 5, verse: 3, testament: 'New', relevance: 10, categories: ['honesty', 'deceit', 'warning'] },
  { book: 'Acts', chapter: 5, verse: 4, testament: 'New', relevance: 10, categories: ['honesty', 'stewardship', 'warning'] },
  { book: 'Acts', chapter: 5, verse: 5, testament: 'New', relevance: 9, categories: ['warning', 'judgment'] },
  { book: 'Acts', chapter: 5, verse: 6, testament: 'New', relevance: 7, categories: ['judgment'] },
  { book: 'Acts', chapter: 5, verse: 7, testament: 'New', relevance: 7, categories: ['deceit'] },
  { book: 'Acts', chapter: 5, verse: 8, testament: 'New', relevance: 9, categories: ['honesty', 'deceit', 'price'] },
  { book: 'Acts', chapter: 5, verse: 9, testament: 'New', relevance: 10, categories: ['conspiracy', 'testing-god', 'warning'] },
  { book: 'Acts', chapter: 5, verse: 10, testament: 'New', relevance: 9, categories: ['judgment'] },
  { book: 'Acts', chapter: 5, verse: 11, testament: 'New', relevance: 8, categories: ['fear-of-god', 'church'] },
];

const DEFI_KEYWORDS = ['tithe', 'yield', 'stewardship', 'stablecoin', 'stream'];

async function fetchVerse(
  ref: { book: string; chapter: number; verse: number },
  apiVersion: string,
  maxAttempts: number,
  onRequest: () => void,
): Promise<string | null> {
  const url =
    `https://bible-api.com/${encodeURIComponent(`${ref.book} ${ref.chapter}:${ref.verse}`)}` +
    `?translation=${apiVersion}`;
  // The free mirror rate-limits aggressively; back off instead of dropping the verse.
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      onRequest();
      const res = await fetch(url);
      if (res.status === 429 || res.status >= 500) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      if (!res.ok) return null;
      const data = await res.json();
      const text = (data?.text ?? '').replace(/\s+/g, ' ').trim();
      if (text.length > 0) return text;
      return null;
    } catch (err) {
      console.error('[scripture-version-seeder] fetch failed', url, err);
      await sleep(600 * (attempt + 1));
    }
  }
  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: auth.error ?? 'Unauthorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: missingKeys, error: missingKeysError } = await supabase
    .schema('api')
    .rpc('missing_bible_verse_keys', {
      p_refs: REFERENCES.map(({ book, chapter, verse }) => ({
        book_name: book,
        chapter,
        verse,
      })),
      p_versions: Object.keys(FREE_VERSIONS),
    });
  if (missingKeysError) {
    console.error('[scripture-version-seeder] cache lookup failed', missingKeysError);
    return new Response(JSON.stringify({ error: 'Could not check seeded scripture cache.' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const missing = new Set(
    (missingKeys ?? []).map((key: { book_name: string; chapter: number; verse: number; version: string }) =>
      `${key.book_name}|${key.chapter}|${key.verse}|${key.version}`,
    ),
  );
  const maxExternalRequests = 100;
  let externalRequests = 0;
  let skippedExisting = 0;
  let skippedRequestLimit = 0;

  const rows: Record<string, unknown>[] = [];
  const failures: string[] = [];

  for (const ref of REFERENCES) {
    for (const [label, apiVersion] of Object.entries(FREE_VERSIONS)) {
      const key = `${ref.book}|${ref.chapter}|${ref.verse}|${label}`;
      if (!missing.has(key)) {
        skippedExisting += 1;
        continue;
      }
      if (externalRequests >= maxExternalRequests) {
        skippedRequestLimit += 1;
        continue;
      }
      const text = await fetchVerse(
        ref,
        apiVersion,
        Math.min(2, maxExternalRequests - externalRequests),
        () => { externalRequests += 1; },
      );
      if (!text) {
        failures.push(`${ref.book} ${ref.chapter}:${ref.verse} (${label})`);
        continue;
      }
      rows.push({
        book_name: ref.book,
        chapter: ref.chapter,
        verse: ref.verse,
        text,
        version: label,
        testament: ref.testament,
        financial_relevance: ref.relevance,
        wisdom_category: ref.categories,
        defi_keywords: DEFI_KEYWORDS,
      });
    }
  }

  // PostgREST exposes only the `api` schema, so writes go through the
  // SECURITY DEFINER gateway api.upsert_bible_verses(jsonb).
  let upserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100).map((row) => {
      const { defi_keywords: _ignored, ...rest } = row as Record<string, unknown>;
      return rest;
    });
    const { data, error } = await supabase.schema('api').rpc('upsert_bible_verses', {
      p_rows: batch,
    });
    if (error) {
      console.error('[scripture-version-seeder] upsert error', error);
      failures.push(`upsert batch ${i}: ${error.message}`);
    } else {
      upserted += typeof data === 'number' ? data : batch.length;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      versions_seeded: Object.keys(FREE_VERSIONS),
      references: REFERENCES.length,
      rows_upserted: upserted,
      skipped_existing: skippedExisting,
      skipped_request_limit: skippedRequestLimit,
      external_requests,
      max_external_requests: maxExternalRequests,
      failures,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
