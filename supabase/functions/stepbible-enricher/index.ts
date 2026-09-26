import {
  withAgentSandbox,
  sandboxedRead,
  sandboxedUpdate,
  logOperation,
  type AgentContext,
} from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';
import {
  parseStepBible,
  detectFormat,
  resolveBookName,
  languageColumn,
  type StepBibleVerse,
} from '../_shared/stepbible-parser.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT = 'stepbible-enricher';

/**
 * STEPBible source files (CC BY 4.0), keyed by short name.
 *
 * Note the upstream inconsistency: the Hebrew files end "CC BY.txt" (space)
 * while the Greek files end "CC-BY.txt" (hyphen). A single URL template does
 * not work, so each path is listed verbatim and the set is a closed allowlist —
 * the file name is caller-supplied and must never become an open fetch.
 */
const BASE = 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Translators%20Amalgamated%20OT%2BNT';
const SOURCES: Readonly<Record<string, string>> = Object.freeze({
  'TAHOT Gen-Deu': `${BASE}/TAHOT%20Gen-Deu%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
  'TAHOT Jos-Est': `${BASE}/TAHOT%20Jos-Est%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
  'TAHOT Job-Sng': `${BASE}/TAHOT%20Job-Sng%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
  'TAHOT Isa-Mal': `${BASE}/TAHOT%20Isa-Mal%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
  'TAGNT Mat-Jhn': `${BASE}/TAGNT%20Mat-Jhn%20-%20Translators%20Amalgamated%20Greek%20NT%20-%20STEPBible.org%20CC-BY.txt`,
  'TAGNT Act-Rev': `${BASE}/TAGNT%20Act-Rev%20-%20Translators%20Amalgamated%20Greek%20NT%20-%20STEPBible.org%20CC-BY.txt`,
});

interface EnrichStats {
  verses_parsed: number;
  verses_matched: number;
  verses_updated: number;
  verses_absent: number;
  unmapped_books: string[];
}

/**
 * Enrich existing rows only.
 *
 * `comprehensive_biblical_texts.kjv_text` is NOT NULL, so this agent cannot
 * create verses — it adds original-language text, Strong's numbers and
 * word-level data to verses another loader already seeded. Verses with no
 * matching row are counted and reported rather than inserted, so a coverage
 * gap shows up as a number instead of a constraint violation.
 */
async function enrichVerses(
  ctx: AgentContext,
  verses: StepBibleVerse[],
  column: 'hebrew_text' | 'greek_text',
  limit: number,
  dryRun: boolean,
): Promise<EnrichStats> {
  const stats: EnrichStats = {
    verses_parsed: verses.length,
    verses_matched: 0,
    verses_updated: 0,
    verses_absent: 0,
    unmapped_books: [],
  };
  const unmapped = new Set<string>();

  for (const v of verses.slice(0, limit)) {
    const book = resolveBookName(v.book);
    if (!book) {
      // Surfaced, not skipped silently: an unmapped code means every verse in
      // that book would be dropped, which must not look like a clean run.
      unmapped.add(v.book);
      continue;
    }

    const { data: existing } = await sandboxedRead(ctx, 'comprehensive_biblical_texts', (from) =>
      from.select('id').eq('book', book).eq('chapter', v.chapter).eq('verse', v.verse).limit(1),
    );

    if (!existing || existing.length === 0) {
      stats.verses_absent++;
      continue;
    }
    stats.verses_matched++;
    if (dryRun) continue;

    const { error } = await sandboxedUpdate(
      ctx,
      'comprehensive_biblical_texts',
      {
        [column]: v.text,
        strong_numbers: v.strongNumbers,
        original_words: v.words,
        updated_at: new Date().toISOString(),
      },
      (from) => from.eq('book', book).eq('chapter', v.chapter).eq('verse', v.verse),
    );
    if (!error) stats.verses_updated++;
  }

  stats.unmapped_books = [...unmapped];
  return stats;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || 'Authentication required', corsHeaders);
  }

  try {
    const body = await req.json().catch(() => ({}));

    if (body.mode === 'sources') {
      return new Response(
        JSON.stringify({ success: true, agent: AGENT, sources: Object.keys(SOURCES) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const file: string = body.file ?? 'TAHOT Gen-Deu';
    const url = SOURCES[file];
    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Unknown source "${file}"`,
          available: Object.keys(SOURCES),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const limit = Math.min(Number(body.limit) || 500, 5000);
    const dryRun = body.dryRun === true;

    const result = await withAgentSandbox(
      {
        // Literal, not the AGENT constant: scripts/verify-agents.mjs matches
        // /agentName\s*:\s*['"]([^'"]+)['"]/ statically and cannot resolve
        // identifiers, so hoisting this into a variable silently drops the
        // function from the permission-registration check.
        agentName: 'stepbible-enricher',
        runMode: body.runMode ?? 'manual',
        metadata: { file, limit, dryRun },
      },
      async (ctx) => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`STEPBible fetch failed: ${res.status} ${res.statusText}`);
        }
        const text = await res.text();

        const format = detectFormat(text);
        const verses = parseStepBible(text, format);
        const column = languageColumn(format);

        const stats = await enrichVerses(ctx, verses, column, limit, dryRun);

        await logOperation(ctx, dryRun ? 'READ' : 'UPDATE', 'comprehensive_biblical_texts', {
          recordsAffected: stats.verses_updated,
          inputSummary: { file, format, column, limit, dryRun },
          outputSummary: stats as unknown as Record<string, unknown>,
          errorMessage: stats.unmapped_books.length
            ? `Unmapped book codes: ${stats.unmapped_books.join(', ')}`
            : undefined,
        });

        return { file, format, column, dry_run: dryRun, ...stats };
      },
    );

    return new Response(JSON.stringify({ agent: AGENT, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('STEPBible Enricher error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
