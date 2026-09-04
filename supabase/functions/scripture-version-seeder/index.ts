/**
 * scripture-version-seeder
 *
 * Seeds public.bible_verses with multiple Bible translations for the
 * financial/stewardship verse set that powers BWSP.
 *
 * IMPORTANT (licensing): NIV and ESV are copyrighted and are NOT available from
 * free, unauthenticated sources such as bible-api.com or BibleGateway (which has
 * no public API). This seeder therefore ingests only freely redistributable
 * translations. Licensed NIV/ESV text requires api.bible (API_BIBLE_KEY) or the
 * Crossway ESV API (ESV_API_KEY); when those secrets exist the corresponding
 * versions are fetched too, otherwise they are skipped and reported as such.
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

/** Crossway ESV API — only used when ESV_API_KEY is configured (licensed). */
async function fetchEsv(ref: { book: string; chapter: number; verse: number }, key: string) {
  const url =
    `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(`${ref.book} ${ref.chapter}:${ref.verse}`)}` +
    `&include-headings=false&include-footnotes=false&include-verse-numbers=false&include-passage-references=false`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Token ${key}` } });
    if (!res.ok) return null;
    const data = await res.json();
    const text = (data?.passages?.[0] ?? '').replace(/\s+/g, ' ').trim();
    return text.length > 0 ? text : null;
  } catch {
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

  const esvKey = Deno.env.get('ESV_API_KEY');
  const skipped: string[] = [];
  if (!esvKey) skipped.push('ESV (needs ESV_API_KEY — copyrighted)');
  skipped.push('NIV (no free source; needs licensed api.bible access)');

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

    if (esvKey) {
      const text = await fetchEsv(ref, esvKey);
      if (text) {
        rows.push({
          book_name: ref.book,
          chapter: ref.chapter,
          verse: ref.verse,
          text,
          version: 'ESV',
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
      versions_seeded: Object.keys(FREE_VERSIONS).concat(esvKey ? ['ESV'] : []),
      references: REFERENCES.length,
      rows_upserted: upserted,
      skipped_versions: skipped,
      failures,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
