/**
 * strongs-concordance-seeder
 *
 * Seeds public.strongs_concordance with Strong's numbers and their definitions
 * from the Open Scriptures public-domain / CC-BY-SA digitisations of:
 *   - "A Concise Dictionary of the Words in the Hebrew Bible" (Strong, 1894)
 *   - "Dictionary of Greek Words" from Strong's Exhaustive Concordance (1890)
 *
 * Aramaic entries are detected by Strong's own "(Aramaic)" derivation marker so
 * the three original languages of Scripture are represented distinctly.
 *
 * Runs incrementally: each invocation seeds `limit` entries starting at `offset`
 * and returns `next_offset`, so the hourly schedule walks the whole concordance
 * without ever exceeding the edge runtime budget.
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

const SOURCES = {
  Hebrew:
    'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js',
  Greek:
    'https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js',
} as const;

interface StrongsEntry {
  lemma?: string;
  xlit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
}

interface Row {
  strong_number: string;
  original_word: string;
  transliteration: string | null;
  pronunciation: string | null;
  part_of_speech: string | null;
  definition: string;
  root_word: string | null;
  language: 'Hebrew' | 'Greek' | 'Aramaic';
}

/** Extracts the JSON object literal out of the Open Scriptures .js wrapper. */
function parseDictionary(js: string): Record<string, StrongsEntry> {
  const start = js.indexOf('{');
  const end = js.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('unrecognised dictionary format');
  return JSON.parse(js.slice(start, end + 1));
}

function cleanup(s: string | undefined | null): string | null {
  if (!s) return null;
  const t = s
    .replace(/\{|\}/g, '')
    .replace(/\[idiom\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[;,\s]+|[;,\s]+$/g, '');
  return t.length > 0 ? t : null;
}

/**
 * Strong's marks Biblical Aramaic entries with a leading "(Aramaic)" in the
 * derivation field. Honouring that keeps the Aramaic corpus honest instead of
 * mislabelling it as Hebrew.
 */
function resolveLanguage(base: 'Hebrew' | 'Greek', derivation?: string): Row['language'] {
  if (base === 'Hebrew' && derivation && /\(Aramaic\)/i.test(derivation)) return 'Aramaic';
  return base;
}

/** Derivation lines frequently name the root: "from H1234 (word)". */
function extractRoot(derivation?: string): string | null {
  if (!derivation) return null;
  const m = derivation.match(/\b([HG]\d{1,5})\b/);
  return m ? m[1] : null;
}

function toRow(num: string, e: StrongsEntry, base: 'Hebrew' | 'Greek'): Row | null {
  const lemma = cleanup(e.lemma);
  const strongsDef = cleanup(e.strongs_def);
  const kjvDef = cleanup(e.kjv_def);
  if (!lemma) return null;

  const definition = [
    strongsDef,
    kjvDef ? `KJV renderings: ${kjvDef}` : null,
  ]
    .filter(Boolean)
    .join(' — ');

  if (!definition) return null;

  return {
    strong_number: num,
    original_word: lemma,
    transliteration: cleanup(e.xlit),
    pronunciation: cleanup(e.pron),
    part_of_speech: null, // not supplied by Strong's dictionaries
    definition,
    root_word: extractRoot(e.derivation),
    language: resolveLanguage(base, e.derivation),
  };
}

async function loadRows(which: 'both' | 'hebrew' | 'greek'): Promise<Row[]> {
  const bases: Array<'Hebrew' | 'Greek'> =
    which === 'hebrew' ? ['Hebrew'] : which === 'greek' ? ['Greek'] : ['Hebrew', 'Greek'];

  const rows: Row[] = [];
  for (const base of bases) {
    const res = await fetch(SOURCES[base], {
      headers: { 'User-Agent': 'BibleFi-StrongsSeeder/1.0 (+https://biblefi.app)' },
    });
    if (!res.ok) throw new Error(`${base} dictionary fetch failed: ${res.status}`);
    const dict = parseDictionary(await res.text());
    for (const [num, entry] of Object.entries(dict)) {
      const row = toRow(num, entry, base);
      if (row) rows.push(row);
    }
  }

  // Stable ordering so offset-based paging is deterministic across runs.
  rows.sort((a, b) => {
    const pa = a.strong_number[0];
    const pb = b.strong_number[0];
    if (pa !== pb) return pa < pb ? -1 : 1;
    return Number(a.strong_number.slice(1)) - Number(b.strong_number.slice(1));
  });
  return rows;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ success: false, error: auth.error || 'Unauthorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    // PostgREST only exposes the `api` schema on this project.
    { db: { schema: 'api' } },
  );

  try {
    const body = await req.json().catch(() => ({}));
    const which: 'both' | 'hebrew' | 'greek' = body.language ?? 'both';
    const limit: number = Math.min(Number(body.limit ?? 3000), 8000);
    const failures: string[] = [];

    const all = await loadRows(which);

    // Auto-resume: without an explicit offset, continue where the table stopped.
    let offset: number = Number(body.offset ?? NaN);
    if (!Number.isFinite(offset)) {
      const { count } = await supabase
        .from('strongs_concordance')
        .select('*', { count: 'exact', head: true });
      offset = (count ?? 0) % Math.max(all.length, 1);
    }

    const slice = all.slice(offset, offset + limit);
    let upserted = 0;
    const coverage = { Hebrew: 0, Greek: 0, Aramaic: 0 };

    for (let i = 0; i < slice.length; i += 500) {
      const batch = slice.slice(i, i + 500);
      const { error } = await supabase
        .from('strongs_concordance')
        .upsert(batch, { onConflict: 'strong_number' });
      if (error) {
        console.error('[strongs-seeder] upsert error', error);
        failures.push(`batch ${offset + i}: ${error.message}`);
      } else {
        upserted += batch.length;
        for (const r of batch) coverage[r.language]++;
      }
    }

    const { count: total } = await supabase
      .from('strongs_concordance')
      .select('*', { count: 'exact', head: true });

    const nextOffset = offset + slice.length >= all.length ? 0 : offset + slice.length;

    return new Response(
      JSON.stringify({
        success: failures.length === 0 && upserted > 0,
        agent: 'strongs-concordance-seeder',
        source_entries_available: all.length,
        offset,
        limit,
        rows_upserted: upserted,
        language_coverage: coverage,
        table_total_rows: total ?? null,
        next_offset: nextOffset,
        complete: nextOffset === 0,
        failures,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[strongs-seeder] fatal', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
