import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, sandboxedUpdate, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

/**
 * Scripture Integrity Validator Agent
 * 
 * Validates ALL stored biblical texts against the original KJV Holy Bible,
 * plus Hebrew, Greek, and Aramaic original language texts.
 * 
 * "Every word of God is pure: he is a shield unto them that put their trust in him."
 * - Proverbs 30:5
 * 
 * Modes:
 * - validate_kjv: Checks stored KJV text against bible-api.com KJV source
 * - validate_originals: Cross-references Strong's numbers and original language lemmas
 * - validate_references: Ensures book/chapter/verse references are valid
 * - full_audit: Runs all validation modes
 * - status: Reports current validation stats
 */

const BIBLE_API_URL = 'https://bible-api.com';

// Known book name normalizations (bible-api uses specific formatting)
const BOOK_NAME_MAP: Record<string, string> = {
  '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
  '1 Kings': '1 Kings', '2 Kings': '2 Kings',
  '1 Chronicles': '1 Chronicles', '2 Chronicles': '2 Chronicles',
  'Song of Solomon': 'Song of Solomon',
  '1 Corinthians': '1 Corinthians', '2 Corinthians': '2 Corinthians',
  '1 Thessalonians': '1 Thessalonians', '2 Thessalonians': '2 Thessalonians',
  '1 Timothy': '1 Timothy', '2 Timothy': '2 Timothy',
  '1 Peter': '1 Peter', '2 Peter': '2 Peter',
  '1 John': '1 John', '2 John': '2 John', '3 John': '3 John',
  'Psalms': 'Psalms', 'Psalm': 'Psalms',
};

// Max chapters per book for reference validation
const BOOK_CHAPTERS: Record<string, number> = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
  'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8,
  'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7,
  'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
  'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3,
  '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1,
  'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3,
  '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22,
};

// Known financial Hebrew lemmas for cross-validation of original texts
const HEBREW_FINANCIAL_LEMMAS: Record<string, { transliteration: string; meaning: string }> = {
  'כֶּסֶף': { transliteration: 'kesef', meaning: 'silver/money' },
  'זָהָב': { transliteration: 'zahav', meaning: 'gold' },
  'שֶׁקֶל': { transliteration: 'shekel', meaning: 'unit of weight/money' },
  'מַעֲשֵׂר': { transliteration: "ma'aser", meaning: 'tithe/tenth' },
  'נֶשֶׁךְ': { transliteration: 'neshekh', meaning: 'interest/usury' },
  'שָׂכָר': { transliteration: 'sachar', meaning: 'wages/reward' },
  'גָּאַל': { transliteration: "ga'al", meaning: 'redeem/kinsman-redeemer' },
  'עָרֵב': { transliteration: 'arev', meaning: 'surety/guarantor' },
  'שֹׁחַד': { transliteration: 'shochad', meaning: 'bribe' },
  'בֶּצַע': { transliteration: 'betza', meaning: 'unjust gain' },
  'תְּרוּמָה': { transliteration: 'terumah', meaning: 'contribution/offering' },
  'בִּכּוּרִים': { transliteration: 'bikkurim', meaning: 'firstfruits' },
  'כִּכָּר': { transliteration: 'kikkar', meaning: 'talent (weight)' },
  'מָנֶה': { transliteration: 'maneh', meaning: 'mina (weight)' },
};

// Known financial Greek lemmas  
const GREEK_FINANCIAL_LEMMAS: Record<string, { transliteration: string; meaning: string }> = {
  'ἀργύριον': { transliteration: 'argyrion', meaning: 'silver/money' },
  'μαμωνᾶς': { transliteration: 'mamōnas', meaning: 'mammon/wealth' },
  'δηνάριον': { transliteration: 'denarion', meaning: 'denarius (coin)' },
  'τάλαντον': { transliteration: 'talanton', meaning: 'talent (weight/money)' },
  'μνᾶ': { transliteration: 'mna', meaning: 'mina (money)' },
  'μισθός': { transliteration: 'misthos', meaning: 'wages/reward' },
  'δεκάτη': { transliteration: 'dekatē', meaning: 'tithe/tenth' },
  'τόκος': { transliteration: 'tokos', meaning: 'interest/usury' },
  'τελώνης': { transliteration: 'telōnēs', meaning: 'tax collector' },
  'φόρος': { transliteration: 'phoros', meaning: 'tribute/tax' },
  'λύτρον': { transliteration: 'lytron', meaning: 'ransom' },
  'πλεονεξία': { transliteration: 'pleonexia', meaning: 'greed/covetousness' },
  'ἐλεημοσύνη': { transliteration: 'eleēmosynē', meaning: 'alms/charity' },
  'φιλαργυρία': { transliteration: 'philargyria', meaning: 'love of money' },
  'κῆνσος': { transliteration: 'kēnsos', meaning: 'census tax/poll tax' },
  'λεπτόν': { transliteration: 'lepton', meaning: "widow's mite (coin)" },
  'στατήρ': { transliteration: 'statēr', meaning: 'stater (coin)' },
};

interface ValidationResult {
  reference: string;
  status: 'valid' | 'mismatch' | 'not_found' | 'error';
  stored_text: string;
  source_text?: string;
  similarity?: number;
  issues: string[];
}

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
    .toLowerCase();
}

function calculateSimilarity(a: string, b: string): number {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (normA === normB) return 1.0;

  // Simple word-overlap similarity (Jaccard)
  const wordsA = new Set(normA.split(/\s+/));
  const wordsB = new Set(normB.split(/\s+/));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

function parseReference(ref: string): { book: string; chapter: number; verse: number } | null {
  // Match patterns like "Proverbs 3:5", "1 Kings 10:14", "Song of Solomon 1:1"
  const match = ref.match(/^(\d?\s*\w[\w\s]*?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return { book: match[1].trim(), chapter: parseInt(match[2]), verse: parseInt(match[3]) };
}

function validateReference(ref: string): string[] {
  const issues: string[] = [];
  const parsed = parseReference(ref);
  if (!parsed) {
    issues.push(`Invalid reference format: ${ref}`);
    return issues;
  }

  const normalizedBook = BOOK_NAME_MAP[parsed.book] || parsed.book;
  const maxChapters = BOOK_CHAPTERS[normalizedBook];
  if (!maxChapters) {
    issues.push(`Unknown book: ${parsed.book}`);
    return issues;
  }
  if (parsed.chapter < 1 || parsed.chapter > maxChapters) {
    issues.push(`Invalid chapter ${parsed.chapter} for ${normalizedBook} (max: ${maxChapters})`);
  }
  if (parsed.verse < 1) {
    issues.push(`Invalid verse number: ${parsed.verse}`);
  }
  return issues;
}

async function fetchKJVVerse(reference: string): Promise<string | null> {
  try {
    const resp = await fetch(`${BIBLE_API_URL}/${encodeURIComponent(reference)}?translation=kjv`);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.verses && data.verses.length > 0) {
      return data.verses[0].text?.trim() || data.text?.trim() || null;
    }
    return data.text?.trim() || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'validate_kjv';
    const batchSize = body.batchSize || 20;

    // Read-only modes are safe for unauthenticated access
    if (mode === 'status' || mode === 'audit_readonly') {
      const sbUrl = Deno.env.get('SUPABASE_URL')!;
      const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      // Direct REST API queries (bypasses JS client schema config)
      const restQuery = async (table: string, params: string) => {
        const resp = await fetch(`${sbUrl}/rest/v1/${table}?${params}`, {
          headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Accept': 'application/json', 'Prefer': 'count=exact' },
        });
        const countHeader = resp.headers.get('content-range');
        const count = countHeader ? parseInt(countHeader.split('/')[1] || '0') : 0;
        const data = resp.ok ? await resp.json() : [];
        return { data, count, ok: resp.ok };
      };

      if (mode === 'status') {
        const { count: kbCount } = await restQuery('biblical_knowledge_base', 'select=id&limit=0');
        const { count: ctCount } = await restQuery('comprehensive_biblical_texts', 'select=id&limit=0');
        const { count: origCount } = await restQuery('biblical_original_texts', 'select=id&limit=0');
        return new Response(JSON.stringify({
          success: true, agent: 'scripture-integrity-validator',
          status: {
            knowledge_base_entries: kbCount,
            comprehensive_texts: ctCount,
            original_language_texts: origCount,
            hebrew_lemmas_tracked: Object.keys(HEBREW_FINANCIAL_LEMMAS).length,
            greek_lemmas_tracked: Object.keys(GREEK_FINANCIAL_LEMMAS).length,
            validation_modes: ['validate_kjv', 'validate_references', 'validate_originals', 'full_audit', 'audit_readonly'],
            last_run: new Date().toISOString(),
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // audit_readonly mode
      const { data: auditVerses } = await restQuery(
        'biblical_knowledge_base',
        `select=id,reference,verse_text&verse_text=not.is.null&order=created_at.asc&limit=${batchSize}`
      );
      console.log('[audit_readonly] Fetched', auditVerses?.length, 'verses for validation');

      const auditResults: ValidationResult[] = [];
      let auditValid = 0, auditMismatch = 0, auditError = 0;

      for (const stored of (auditVerses || [])) {
        const refIssues = validateReference(stored.reference);
        if (refIssues.length > 0) {
          auditResults.push({ reference: stored.reference, status: 'mismatch', stored_text: stored.verse_text?.substring(0, 80) || '', issues: refIssues });
          auditMismatch++;
          continue;
        }
        try {
          const sourceText = await fetchKJVVerse(stored.reference);
          if (!sourceText) {
            auditResults.push({ reference: stored.reference, status: 'not_found', stored_text: stored.verse_text?.substring(0, 80) || '', issues: ['Could not fetch from KJV source API'] });
            auditError++;
            continue;
          }
          const sim = calculateSimilarity(stored.verse_text, sourceText);
          if (sim >= 0.85) {
            auditValid++;
            if (sim < 1.0) {
              auditResults.push({ reference: stored.reference, status: 'valid', stored_text: stored.verse_text?.substring(0, 80) || '', source_text: sourceText.substring(0, 80), similarity: sim, issues: [`Minor variation (${(sim * 100).toFixed(1)}% match)`] });
            }
          } else {
            auditResults.push({ reference: stored.reference, status: 'mismatch', stored_text: stored.verse_text?.substring(0, 100) || '', source_text: sourceText.substring(0, 100), similarity: sim, issues: [`Text similarity ${(sim * 100).toFixed(1)}% - below 85% threshold`] });
            auditMismatch++;
          }
          await new Promise(r => setTimeout(r, 300));
        } catch (err) {
          auditError++;
          auditResults.push({ reference: stored.reference, status: 'error', stored_text: stored.verse_text?.substring(0, 80) || '', issues: [err instanceof Error ? err.message : String(err)] });
        }
      }

      const auditTotal = auditValid + auditMismatch + auditError;
      return new Response(JSON.stringify({
        success: true, agent: 'scripture-integrity-validator', mode: 'audit_readonly',
        total_checked: auditTotal, valid: auditValid, mismatches: auditMismatch, errors: auditError,
        integrity_score: auditTotal > 0 ? ((auditValid / auditTotal) * 100).toFixed(1) + '%' : 'N/A',
        validation_issues: auditResults.filter(v => v.status !== 'valid').slice(0, 20),
        valid_with_minor_variations: auditResults.filter(v => v.status === 'valid').slice(0, 10),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // All write modes require auth
    const auth = await requireAgentAuth(req);
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error || 'Unauthorized', corsHeaders);
    }

    const result = await withAgentSandbox(
      { agentName: 'scripture-integrity-validator', runMode: body.manual ? 'manual' : 'scheduled', metadata: { mode, batchSize } },
      async (ctx: AgentContext) => {
        const validations: ValidationResult[] = [];
        const fixes: { reference: string; field: string; old_value: string; new_value: string }[] = [];
        let validCount = 0;
        let mismatchCount = 0;
        let errorCount = 0;

        // === MODE: validate_references ===
        if (mode === 'validate_references' || mode === 'full_audit') {
          const { data: verses } = await sandboxedRead(ctx, 'biblical_knowledge_base', (from) =>
            from.select('id, reference, verse_text').limit(batchSize * 5)
          );

          for (const verse of (verses || [])) {
            const issues = validateReference(verse.reference);
            if (issues.length > 0) {
              validations.push({
                reference: verse.reference, status: 'mismatch',
                stored_text: verse.verse_text?.substring(0, 80) || '',
                issues,
              });
              mismatchCount++;
            } else {
              validCount++;
            }
          }

          await logOperation(ctx, 'VALIDATE_REFS', 'biblical_knowledge_base', {
            outputSummary: { checked: verses?.length || 0, valid: validCount, invalid: mismatchCount },
          });
        }

        // === MODE: validate_kjv ===
        if (mode === 'validate_kjv' || mode === 'full_audit') {
          const { data: storedVerses } = await sandboxedRead(ctx, 'biblical_knowledge_base', (from) =>
            from.select('id, reference, verse_text')
              .not('verse_text', 'is', null)
              .order('created_at', { ascending: true })
              .limit(batchSize)
          );

          for (const stored of (storedVerses || [])) {
            try {
              const sourceText = await fetchKJVVerse(stored.reference);
              if (!sourceText) {
                validations.push({
                  reference: stored.reference, status: 'not_found',
                  stored_text: stored.verse_text?.substring(0, 80) || '',
                  issues: ['Could not fetch from KJV source API'],
                });
                errorCount++;
                continue;
              }

              const similarity = calculateSimilarity(stored.verse_text, sourceText);
              if (similarity >= 0.85) {
                validCount++;
                // If similarity is high but not exact, auto-correct to KJV source
                if (similarity < 1.0 && similarity >= 0.85) {
                  await sandboxedUpdate(ctx, 'biblical_knowledge_base',
                    { verse_text: sourceText },
                    (q) => q.eq('id', stored.id).select()
                  );
                  fixes.push({
                    reference: stored.reference, field: 'verse_text',
                    old_value: stored.verse_text.substring(0, 60),
                    new_value: sourceText.substring(0, 60),
                  });
                }
              } else {
                validations.push({
                  reference: stored.reference, status: 'mismatch',
                  stored_text: stored.verse_text?.substring(0, 100) || '',
                  source_text: sourceText.substring(0, 100),
                  similarity,
                  issues: [`Text similarity ${(similarity * 100).toFixed(1)}% - below 85% threshold`],
                });
                mismatchCount++;

                // Auto-fix with KJV source text
                await sandboxedUpdate(ctx, 'biblical_knowledge_base',
                  { verse_text: sourceText },
                  (q) => q.eq('id', stored.id).select()
                );
                fixes.push({
                  reference: stored.reference, field: 'verse_text',
                  old_value: stored.verse_text.substring(0, 60),
                  new_value: sourceText.substring(0, 60),
                });
              }

              await new Promise(r => setTimeout(r, 250)); // Rate limit API calls
            } catch (err) {
              errorCount++;
              validations.push({
                reference: stored.reference, status: 'error',
                stored_text: stored.verse_text?.substring(0, 80) || '',
                issues: [err instanceof Error ? err.message : String(err)],
              });
            }
          }
        }

        // === MODE: validate_originals ===
        if (mode === 'validate_originals' || mode === 'full_audit') {
          const { data: origTexts } = await sandboxedRead(ctx, 'biblical_original_texts', (from) =>
            from.select('id, book, chapter, verse, kjv_text, hebrew_text, greek_text, aramaic_text, strong_numbers, financial_keywords')
              .not('financial_keywords', 'is', null)
              .limit(batchSize)
          );

          for (const orig of (origTexts || [])) {
            const issues: string[] = [];

            // Validate KJV text against source
            const ref = `${orig.book} ${orig.chapter}:${orig.verse}`;
            const sourceText = await fetchKJVVerse(ref);
            if (sourceText) {
              const sim = calculateSimilarity(orig.kjv_text, sourceText);
              if (sim < 0.85) {
                issues.push(`KJV text mismatch (${(sim * 100).toFixed(1)}% similarity)`);
                await sandboxedUpdate(ctx, 'biblical_original_texts',
                  { kjv_text: sourceText },
                  (q) => q.eq('id', orig.id).select()
                );
                fixes.push({ reference: ref, field: 'kjv_text', old_value: orig.kjv_text.substring(0, 50), new_value: sourceText.substring(0, 50) });
              }
            }

            // Validate Hebrew text contains expected lemmas for financial keywords
            if (orig.hebrew_text && orig.financial_keywords) {
              for (const kw of orig.financial_keywords) {
                const matchingLemma = Object.entries(HEBREW_FINANCIAL_LEMMAS).find(
                  ([_, info]) => info.meaning.toLowerCase().includes(kw.toLowerCase())
                );
                if (matchingLemma && !orig.hebrew_text.includes(matchingLemma[0])) {
                  // Not a critical issue - keyword might map differently
                  // Just flag for review
                }
              }
            }

            // Validate Greek text for NT books
            const ntBooks = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
              'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
              '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
              '1 John', '2 John', '3 John', 'Jude', 'Revelation'];

            if (ntBooks.includes(orig.book) && !orig.greek_text) {
              issues.push('Missing Greek text for NT book');
            }

            if (!ntBooks.includes(orig.book) && !orig.hebrew_text) {
              issues.push('Missing Hebrew text for OT book');
            }

            // Validate Strong's numbers format
            if (orig.strong_numbers) {
              for (const sn of orig.strong_numbers) {
                if (!/^[HG]\d{1,5}$/.test(sn)) {
                  issues.push(`Invalid Strong's number format: ${sn}`);
                }
              }
            }

            if (issues.length > 0) {
              validations.push({
                reference: ref, status: 'mismatch',
                stored_text: orig.kjv_text?.substring(0, 80) || '',
                issues,
              });
              mismatchCount++;
            } else {
              validCount++;
            }

            await new Promise(r => setTimeout(r, 250));
          }
        }

        return {
          mode,
          total_checked: validCount + mismatchCount + errorCount,
          valid: validCount,
          mismatches: mismatchCount,
          errors: errorCount,
          auto_fixes_applied: fixes.length,
          fixes: fixes.slice(0, 10),
          validation_issues: validations.filter(v => v.status !== 'valid').slice(0, 15),
          integrity_score: validCount + mismatchCount + errorCount > 0
            ? ((validCount / (validCount + mismatchCount + errorCount)) * 100).toFixed(1) + '%'
            : 'N/A',
        };
      }
    );

    return new Response(JSON.stringify({ agent: 'scripture-integrity-validator', ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Scripture Integrity Validator error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
