/**
 * original-language-seeder
 *
 * Seeds public.biblical_original_texts with the ORIGINAL language witnesses for
 * BibleFi's financial/stewardship verse set:
 *   - Hebrew  (Masoretic, via Sefaria API — CC-BY / public domain base text)
 *   - Aramaic (Daniel 2-7, Ezra 4-7 — the Aramaic portions of the Tanakh,
 *              returned by Sefaria in the same Hebrew-script field)
 *   - Greek   (SBLGNT / MorphGNT, with morphology parsing codes)
 *   - KJV     (public domain, via bible-api.com) as the alignment anchor
 *
 * Strong's numbers are NOT provided by MorphGNT/Sefaria; they are left null here
 * and populated by the strongs_concordance pipeline.
 *
 * "Every word of God is pure" — Proverbs 30:5 (KJV)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { requireAgentAuth } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

type Testament = 'OT' | 'NT';

interface Ref {
  book: string;
  chapter: number;
  verse: number;
  testament: Testament;
}

/** Core financial / stewardship references (aligned with scripture-version-seeder). */
const REFERENCES: Ref[] = [
  { book: 'Genesis', chapter: 14, verse: 20, testament: 'OT' },
  { book: 'Genesis', chapter: 41, verse: 35, testament: 'OT' },
  { book: 'Exodus', chapter: 22, verse: 25, testament: 'OT' },
  { book: 'Leviticus', chapter: 19, verse: 35, testament: 'OT' },
  { book: 'Leviticus', chapter: 25, verse: 10, testament: 'OT' },
  { book: 'Leviticus', chapter: 27, verse: 30, testament: 'OT' },
  { book: 'Numbers', chapter: 18, verse: 21, testament: 'OT' },
  { book: 'Deuteronomy', chapter: 8, verse: 18, testament: 'OT' },
  { book: 'Deuteronomy', chapter: 14, verse: 22, testament: 'OT' },
  { book: 'Deuteronomy', chapter: 15, verse: 1, testament: 'OT' },
  { book: 'Psalms', chapter: 24, verse: 1, testament: 'OT' },
  { book: 'Proverbs', chapter: 3, verse: 9, testament: 'OT' },
  { book: 'Proverbs', chapter: 11, verse: 1, testament: 'OT' },
  { book: 'Proverbs', chapter: 13, verse: 11, testament: 'OT' },
  { book: 'Proverbs', chapter: 21, verse: 20, testament: 'OT' },
  { book: 'Proverbs', chapter: 22, verse: 7, testament: 'OT' },
  { book: 'Ecclesiastes', chapter: 11, verse: 2, testament: 'OT' },
  { book: 'Malachi', chapter: 3, verse: 10, testament: 'OT' },
  { book: 'Haggai', chapter: 2, verse: 8, testament: 'OT' },
  // Aramaic portions
  { book: 'Daniel', chapter: 2, verse: 21, testament: 'OT' },
  { book: 'Daniel', chapter: 4, verse: 27, testament: 'OT' },
  { book: 'Ezra', chapter: 6, verse: 8, testament: 'OT' },
  { book: 'Ezra', chapter: 7, verse: 24, testament: 'OT' },
  // Greek NT
  { book: 'Matthew', chapter: 6, verse: 21, testament: 'NT' },
  { book: 'Matthew', chapter: 22, verse: 21, testament: 'NT' },
  { book: 'Matthew', chapter: 25, verse: 21, testament: 'NT' },
  { book: 'Luke', chapter: 14, verse: 28, testament: 'NT' },
  { book: 'Luke', chapter: 16, verse: 11, testament: 'NT' },
  { book: 'Romans', chapter: 13, verse: 8, testament: 'NT' },
  { book: '1 Corinthians', chapter: 4, verse: 2, testament: 'NT' },
  { book: '2 Corinthians', chapter: 9, verse: 7, testament: 'NT' },
  { book: '1 Timothy', chapter: 6, verse: 10, testament: 'NT' },
  { book: 'Hebrews', chapter: 13, verse: 5, testament: 'NT' },
  { book: 'Hebrews', chapter: 7, verse: 2, testament: 'NT' },
  { book: 'James', chapter: 5, verse: 4, testament: 'NT' },
];

/** Verses whose original language is Aramaic rather than Hebrew. */
function isAramaic(ref: Ref): boolean {
  if (ref.book === 'Daniel') return ref.chapter >= 2 && ref.chapter <= 7;
  if (ref.book === 'Ezra') return ref.chapter >= 4 && ref.chapter <= 7;
  return false;
}

/** Sefaria uses a few different book titles. */
const SEFARIA_TITLES: Record<string, string> = {
  'Song of Solomon': 'Song of Songs',
  Psalms: 'Psalms',
};

/** MorphGNT (SBLGNT) file slugs, in canonical NT order. */
const MORPHGNT_FILES: Record<string, string> = {
  Matthew: '61-Mt', Mark: '62-Mk', Luke: '63-Lk', John: '64-Jn', Acts: '65-Ac',
  Romans: '66-Ro', '1 Corinthians': '67-1Co', '2 Corinthians': '68-2Co',
  Galatians: '69-Ga', Ephesians: '70-Eph', Philippians: '71-Php',
  Colossians: '72-Col', '1 Thessalonians': '73-1Th', '2 Thessalonians': '74-2Th',
  '1 Timothy': '75-1Ti', '2 Timothy': '76-2Ti', Titus: '77-Tit', Philemon: '78-Phm',
  Hebrews: '79-Heb', James: '80-Jas', '1 Peter': '81-1Pe', '2 Peter': '82-2Pe',
  '1 John': '83-1Jn', '2 John': '84-2Jn', '3 John': '85-3Jn', Jude: '86-Jd',
  Revelation: '87-Re',
};

const FINANCIAL_KEYWORDS = [
  'money', 'gold', 'silver', 'talent', 'treasure', 'wealth', 'riches', 'debt',
  'lend', 'borrow', 'interest', 'usury', 'tithe', 'offering', 'tax', 'tribute',
  'wage', 'labour', 'labor', 'steward', 'increase', 'harvest', 'store',
];
const DEFI_KEYWORDS = ['tithe', 'yield', 'stewardship', 'stablecoin', 'stream'];

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * KJV anchor text. Pulled per-book from a public-domain KJV JSON corpus and
 * cached, so we never hit bible-api.com's per-request rate limit mid-run.
 */
const kjvBookCache = new Map<string, Map<string, string>>();

async function loadKjvBook(book: string): Promise<Map<string, string> | null> {
  if (kjvBookCache.has(book)) return kjvBookCache.get(book)!;
  const slug = book.replace(/ /g, '');
  const url = `https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/${slug}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[original-language-seeder] kjv status', res.status, url);
      return null;
    }
    const data = await res.json();
    const map = new Map<string, string>();
    for (const ch of data?.chapters ?? []) {
      for (const v of ch?.verses ?? []) {
        map.set(`${parseInt(ch.chapter, 10)}:${parseInt(v.verse, 10)}`, String(v.text ?? '').trim());
      }
    }
    kjvBookCache.set(book, map);
    return map;
  } catch (err) {
    console.error('[original-language-seeder] kjv failed', url, err);
    return null;
  }
}

async function fetchKjv(ref: Ref): Promise<string | null> {
  const map = await loadKjvBook(ref.book);
  const text = map?.get(`${ref.chapter}:${ref.verse}`);
  return text && text.length > 0 ? text : null;
}


/** Hebrew / Aramaic from Sefaria. */
async function fetchSefaria(ref: Ref): Promise<string | null> {
  const title = (SEFARIA_TITLES[ref.book] ?? ref.book).replace(/ /g, '_');
  // Sefaria rejects requests without a User-Agent from datacenter IPs, so send one.
  const headers = {
    'User-Agent': 'BibleFi-OriginalLanguageSeeder/1.0 (+https://biblefi.org)',
    Accept: 'application/json',
  };
  const candidates = [
    `https://www.sefaria.org/api/texts/${encodeURIComponent(title)}.${ref.chapter}.${ref.verse}?context=0`,
    `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(`${title} ${ref.chapter}:${ref.verse}`)}`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error('[original-language-seeder] sefaria status', res.status, url);
        continue;
      }
      const data = await res.json();
      // v1 shape: { he: string | string[] }; v3 shape: { versions: [{ text }] }
      const raw = data?.he ??
        data?.versions?.find((v: { text?: unknown }) => v?.text)?.text ??
        null;
      const joined = Array.isArray(raw) ? raw.flat(3).join(' ') : raw;
      const text = stripTags(String(joined ?? ''));
      if (text.length > 0) return text;
    } catch (err) {
      console.error('[original-language-seeder] sefaria failed', url, err);
    }
  }
  return null;
}


interface GreekVerse {
  text: string;
  words: Array<{ word: string; lemma: string; normalized: string; morph: string; pos: string }>;
}

const greekBookCache = new Map<string, Map<string, GreekVerse>>();

/** Parse a MorphGNT book file into a chapter:verse -> Greek text + morphology map. */
async function loadGreekBook(book: string): Promise<Map<string, GreekVerse> | null> {
  if (greekBookCache.has(book)) return greekBookCache.get(book)!;
  const slug = MORPHGNT_FILES[book];
  if (!slug) return null;
  const url = `https://raw.githubusercontent.com/morphgnt/sblgnt/master/${slug}-morphgnt.txt`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = await res.text();
    const map = new Map<string, GreekVerse>();
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      // BCV  POS  parsing  text  word  normalized  lemma
      const parts = line.trim().split(/\s+/);
      if (parts.length < 7) continue;
      const [bcv, pos, morph, , wordForm, normalized, lemma] = parts;
      const chapter = parseInt(bcv.slice(2, 4), 10);
      const verse = parseInt(bcv.slice(4, 6), 10);
      const key = `${chapter}:${verse}`;
      const entry = map.get(key) ?? { text: '', words: [] };
      entry.words.push({ word: wordForm, lemma, normalized, morph, pos });
      entry.text = entry.text ? `${entry.text} ${wordForm}` : wordForm;
      map.set(key, entry);
    }
    greekBookCache.set(book, map);
    return map;
  } catch (err) {
    console.error('[original-language-seeder] morphgnt failed', url, err);
    return null;
  }
}

function keywordsFor(text: string): string[] {
  const lower = text.toLowerCase();
  return FINANCIAL_KEYWORDS.filter((k) => lower.includes(k));
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

  // PostgREST only exposes the `api` schema on this project, so write through
  // the api.biblical_original_texts view rather than the public table directly.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { db: { schema: 'api' } },
  );

  const body = await req.json().catch(() => ({}));
  const limit: number = typeof body.limit === 'number' ? body.limit : REFERENCES.length;
  const targets = REFERENCES.slice(0, Math.max(1, Math.min(limit, REFERENCES.length)));

  const rows: Record<string, unknown>[] = [];
  const failures: string[] = [];
  const counts = { hebrew: 0, aramaic: 0, greek: 0 };

  for (const ref of targets) {
    const label = `${ref.book} ${ref.chapter}:${ref.verse}`;
    const kjv = await fetchKjv(ref);
    if (!kjv) {
      failures.push(`${label}: KJV anchor unavailable`);
      continue;
    }

    let hebrew: string | null = null;
    let aramaic: string | null = null;
    let greek: string | null = null;
    let originalWords: unknown = null;
    let morphology: unknown = null;

    if (ref.testament === 'OT') {
      const semitic = await fetchSefaria(ref);
      if (!semitic) {
        failures.push(`${label}: original Hebrew/Aramaic unavailable`);
      } else if (isAramaic(ref)) {
        aramaic = semitic;
        counts.aramaic++;
      } else {
        hebrew = semitic;
        counts.hebrew++;
      }
    } else {
      const bookMap = await loadGreekBook(ref.book);
      const entry = bookMap?.get(`${ref.chapter}:${ref.verse}`);
      if (!entry) {
        failures.push(`${label}: Greek (SBLGNT) unavailable`);
      } else {
        greek = entry.text;
        originalWords = entry.words.map((w) => ({
          word: w.word,
          lemma: w.lemma,
          normalized: w.normalized,
          language: 'greek',
        }));
        morphology = entry.words.map((w) => ({
          word: w.word,
          part_of_speech: w.pos,
          parsing: w.morph,
        }));
        counts.greek++;
      }
    }

    if (!hebrew && !aramaic && !greek) continue;

    const keywords = keywordsFor(kjv);
    rows.push({
      book: ref.book,
      chapter: ref.chapter,
      verse: ref.verse,
      kjv_text: kjv,
      hebrew_text: hebrew,
      aramaic_text: aramaic,
      greek_text: greek,
      original_words: originalWords,
      morphology,
      financial_keywords: keywords,
      defi_keywords: DEFI_KEYWORDS,
      financial_relevance: Math.min(keywords.length * 15, 100),
    });

    await new Promise((r) => setTimeout(r, 150));
  }

  let upserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from('biblical_original_texts')
      .upsert(batch, { onConflict: 'book,chapter,verse' });
    if (error) {
      console.error('[original-language-seeder] upsert error', error);
      failures.push(`upsert batch ${i}: ${error.message}`);
    } else {
      upserted += batch.length;
    }
  }

  const { count } = await supabase
    .from('biblical_original_texts')
    .select('*', { count: 'exact', head: true });

  return new Response(
    JSON.stringify({
      success: failures.length === 0 || upserted > 0,
      references_attempted: targets.length,
      rows_upserted: upserted,
      language_coverage: counts,
      table_total_rows: count ?? null,
      strongs_note: 'Strong\'s numbers are populated separately by the concordance pipeline',
      failures,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
