/**
 * scripture-version-seeder
 *
 * Seeds public.bible_verses with multiple Bible translations for the
 * financial/stewardship verse set that powers BWSP.
 *
 * IMPORTANT (licensing): NIV is copyrighted and is NOT available from free,
 * unauthenticated sources such as bible-api.com or BibleGateway (which has no
 * public API). Crossway's ESV API does NOT permit commercial use, so it has been
 * removed from BibleFi. This seeder therefore ingests only freely redistributable
 * translations. Licensed NIV text requires a direct Biblica/API.Bible Pro
 * licence (API_BIBLE_KEY); when that secret exists the version is fetched too,
 * otherwise it is skipped and reported as such.
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

/** Freely redistributable translations served by bible-api.com */
const FREE_VERSIONS: Record<string, string> = {
  KJV: 'kjv',
  WEB: 'web',
  ASV: 'asv',
  BBE: 'bbe',
  YLT: 'ylt',
  DARBY: 'darby',
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
];

const DEFI_KEYWORDS = ['tithe', 'yield', 'stewardship', 'stablecoin', 'stream'];

/** Licensed translations fetched from API.Bible (needs a Pro/commercial licence). */
const LICENSED_VERSION_LABELS = ['NIV'] as const;

/** USFM book codes required by API.Bible verse IDs. */
const USFM: Record<string, string> = {
  Genesis: 'GEN',
  Deuteronomy: 'DEU',
  Psalms: 'PSA',
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  Malachi: 'MAL',
  Matthew: 'MAT',
  Luke: 'LUK',
  Romans: 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  '1 Timothy': '1TI',
  Hebrews: 'HEB',
  James: 'JAS',
};

const API_BIBLE_BASE = 'https://api.scripture.api.bible/v1';

/** Resolve API.Bible bibleIds for the licensed labels we want, by abbreviation. */
async function resolveApiBibleIds(key: string): Promise<Record<string, string>> {
  const res = await fetch(`${API_BIBLE_BASE}/bibles?language=eng`, {
    headers: { 'api-key': key },
  });
  if (!res.ok) {
    console.error('[scripture-version-seeder] API.Bible list failed', res.status);
    return {};
  }
  const json = await res.json();
  const bibles: Array<{ id: string; abbreviation?: string; abbreviationLocal?: string }> =
    json?.data ?? [];
  const out: Record<string, string> = {};
  for (const label of LICENSED_VERSION_LABELS) {
    const match = bibles.find(
      (b) =>
        (b.abbreviation ?? '').toUpperCase() === label ||
        (b.abbreviationLocal ?? '').toUpperCase() === label,
    );
    if (match) out[label] = match.id;
  }
  return out;
}

async function fetchApiBibleVerse(
  key: string,
  bibleId: string,
  ref: { book: string; chapter: number; verse: number },
): Promise<string | null> {
  const usfm = USFM[ref.book];
  if (!usfm) return null;
  const verseId = `${usfm}.${ref.chapter}.${ref.verse}`;
  const url =
    `${API_BIBLE_BASE}/bibles/${bibleId}/verses/${verseId}` +
    `?content-type=text&include-notes=false&include-titles=false&include-verse-numbers=false`;
  try {
    const res = await fetch(url, { headers: { 'api-key': key } });
    if (!res.ok) return null;
    const json = await res.json();
    const text = String(json?.data?.content ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    return text.length > 0 ? text : null;
  } catch (err) {
    console.error('[scripture-version-seeder] API.Bible verse failed', verseId, err);
    return null;
  }
}

async function fetchVerse(
  ref: { book: string; chapter: number; verse: number },
  apiVersion: string,
): Promise<string | null> {
  const url =
    `https://bible-api.com/${encodeURIComponent(`${ref.book} ${ref.chapter}:${ref.verse}`)}` +
    `?translation=${apiVersion}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const text = (data?.text ?? '').replace(/\s+/g, ' ').trim();
    return text.length > 0 ? text : null;
  } catch (err) {
    console.error('[scripture-version-seeder] fetch failed', url, err);
    return null;
  }
}


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

  const apiBibleKey = Deno.env.get('API_BIBLE_KEY');
  const skipped: string[] = [];

  let licensedIds: Record<string, string> = {};
  if (apiBibleKey) {
    licensedIds = await resolveApiBibleIds(apiBibleKey);
    for (const label of LICENSED_VERSION_LABELS) {
      if (!licensedIds[label]) {
        skipped.push(`${label} (not available on this API.Bible key/licence)`);
      }
    }
  } else {
    skipped.push('NIV (no free source; set API_BIBLE_KEY with a Pro/commercial licence)');
  }

  const rows: Record<string, unknown>[] = [];
  const failures: string[] = [];

  for (const ref of REFERENCES) {
    for (const [label, apiVersion] of Object.entries(FREE_VERSIONS)) {
      const text = await fetchVerse(ref, apiVersion);
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

    // Licensed translations (e.g. NIV) via API.Bible Pro — only when the key exists.
    if (apiBibleKey) {
      for (const [label, bibleId] of Object.entries(licensedIds)) {
        const text = await fetchApiBibleVerse(apiBibleKey, bibleId, ref);
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
  }

  let upserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase
      .from('bible_verses')
      .upsert(batch, { onConflict: 'book_name,chapter,verse,version' });
    if (error) {
      console.error('[scripture-version-seeder] upsert error', error);
      failures.push(`upsert batch ${i}: ${error.message}`);
    } else {
      upserted += batch.length;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      versions_seeded: Object.keys(FREE_VERSIONS),
      references: REFERENCES.length,
      rows_upserted: upserted,
      skipped_versions: skipped,
      failures,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
