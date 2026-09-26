#!/usr/bin/env node --experimental-strip-types
/**
 * Tests for the STEPBible parser.
 *
 *   npm run test:stepbible
 *
 * Runs against committed fixtures (scripts/fixtures/stepbible/) rather than
 * live downloads, so it works in environments without outbound egress.
 *
 * The assertions are anchored on defects found while building the parser
 * against the real files; each fails against a naive implementation:
 *   - Greek and Hebrew do NOT share a column layout. Parsing TAGNT with the
 *     TAHOT layout yields empty Strong's numbers and puts the English gloss
 *     in the transliteration field.
 *   - Upstream marks morpheme boundaries with "/" and punctuation with a
 *     backslash. Leaving the backslash in corrupts every verse-final sof pasuq.
 *   - Source text is not NFC-normalised, so naive string equality fails.
 *   - H9000+ codes are Tyndale grammatical particles, not lexicon entries.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  parseStepBible,
  parseStrongs,
  isLexicalStrong,
  detectFormat,
  STEPBIBLE_BOOKS,
  resolveBookName,
  languageColumn,
} from '../supabase/functions/_shared/stepbible-parser.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (n: string) => readFileSync(join(here, 'fixtures', 'stepbible', n), 'utf8');

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, detail = '') => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? '✓' : '✗'} ${label}${detail ? '  ' + detail : ''}`);
};

console.log('Strong\'s helpers');
ok('parses Hebrew "H9003/{H7225G}"',
   JSON.stringify(parseStrongs('H9003/{H7225G}')) === '["H9003","H7225G"]');
ok('parses Greek "G0976=N-NSF" (stops at =)',
   JSON.stringify(parseStrongs('G0976=N-NSF')) === '["G0976"]',
   JSON.stringify(parseStrongs('G0976=N-NSF')));
ok('empty cell yields []', parseStrongs('').length === 0);
ok('H9003 is not lexical (Tyndale particle)', !isLexicalStrong('H9003'));
ok('H7225G is lexical', isLexicalStrong('H7225G'));
ok('G0976 is lexical', isLexicalStrong('G0976'));

const tahot = fixture('tahot-sample.txt');
const tagnt = fixture('tagnt-sample.txt');

console.log('\nFormat detection (regression: Greek silently misparsed as Hebrew)');
ok('TAHOT detected', detectFormat(tahot) === 'TAHOT', detectFormat(tahot));
ok('TAGNT detected', detectFormat(tagnt) === 'TAGNT', detectFormat(tagnt));

console.log('\nHebrew OT — Genesis 1:1');
const heb = parseStepBible(tahot);
const g11 = heb.find(v => v.book === 'Gen' && v.chapter === 1 && v.verse === 1);
ok('Gen 1:1 parsed', !!g11);
if (g11) {
  ok('7 words', g11.words.length === 7, `got ${g11.words.length}`);
  ok('transliteration column correct', g11.words[0].transliteration === 'be./re.Shit', g11.words[0].transliteration);
  ok('translation column correct', g11.words[0].translation === 'in/ beginning', g11.words[0].translation);
  ok('grammar column correct', g11.words[0].grammar === 'HR/Ncfsa', g11.words[0].grammar);
  ok('no markup separators left in text', !/[\\/]/.test(g11.text), JSON.stringify(g11.text.slice(-6)));
  ok('ends with sof pasuq', g11.text.endsWith('׃'));
  ok('NFC-normalised', g11.text === g11.text.normalize('NFC'));
  ok('H9003 particle filtered out', !g11.strongNumbers.includes('H9003'));
  ok('H7225G lexical entry kept', g11.strongNumbers.includes('H7225G'));
}

console.log('\nGreek NT — Matthew 1:1');
const grk = parseStepBible(tagnt);
const m11 = grk.find(v => v.book === 'Mat' && v.chapter === 1 && v.verse === 1);
ok('Mat 1:1 parsed', !!m11);
if (m11) {
  const w = m11.words[0];
  ok('Greek word split from transliteration', w.original === 'Βίβλος', JSON.stringify(w.original));
  ok('transliteration extracted from parens', w.transliteration === 'Biblos', JSON.stringify(w.transliteration));
  ok('translation is English, not a Strong\'s code', w.translation === '[The] book', JSON.stringify(w.translation));
  ok('Strong\'s recovered (was EMPTY before the fix)', w.strongs.includes('G0976'), JSON.stringify(w.strongs));
  ok('morphology split off the Strong\'s cell', w.grammar === 'N-NSF', JSON.stringify(w.grammar));
  ok('no transliteration leaked into verse text', !m11.text.includes('('), JSON.stringify(m11.text.slice(0, 40)));
  ok('verse has Strong\'s numbers', m11.strongNumbers.length > 0, `${m11.strongNumbers.length}`);
}

console.log('\nInvariants across both corpora');
for (const [name, set] of [['TAHOT', heb], ['TAGNT', grk]] as const) {
  ok(`${name}: no wordless verses`, set.every(v => v.words.length > 0));
  ok(`${name}: word indices ascending`, set.every(v => v.words.every((w, i) => i === 0 || w.index > v.words[i - 1].index)));
  ok(`${name}: no licence preamble parsed as a verse`, !set.some(v => /licence|STEPBible|Tyndale/i.test(v.book)));
  ok(`${name}: strongNumbers deduped`, set.every(v => new Set(v.strongNumbers).size === v.strongNumbers.length));
  ok(`${name}: no H9xxx/G9xxx particles`, !set.some(v => v.strongNumbers.some(s => /^[HG]9\d{3}/.test(s))));
  ok(`${name}: all text NFC`, set.every(v => v.text === v.text.normalize('NFC')));
}

console.log('\nBook-code mapping (regression: unmapped codes match zero rows)');
ok('66 books mapped', Object.keys(STEPBIBLE_BOOKS).length === 66, `${Object.keys(STEPBIBLE_BOOKS).length}`);
ok('Gen -> Genesis', resolveBookName('Gen') === 'Genesis');
ok('Mat -> Matthew', resolveBookName('Mat') === 'Matthew');
ok('1Co -> 1 Corinthians', resolveBookName('1Co') === '1 Corinthians');
ok('unknown code -> null (surfaced, not skipped)', resolveBookName('Xyz') === null);
ok('every book code in BOTH fixtures resolves',
   [...heb, ...grk].every(v => resolveBookName(v.book) !== null),
   [...new Set([...heb, ...grk].map(v => v.book))].join(','));
ok('no duplicate full names', new Set(Object.values(STEPBIBLE_BOOKS)).size === 66);
ok('TAHOT writes hebrew_text', languageColumn('TAHOT') === 'hebrew_text');
ok('TAGNT writes greek_text', languageColumn('TAGNT') === 'greek_text');

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
