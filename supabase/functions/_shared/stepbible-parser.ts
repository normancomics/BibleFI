/**
 * Parser for STEPBible "Translators Amalgamated" data files (CC BY 4.0).
 *
 * Source: https://github.com/STEPBible/STEPBible-Data
 *   TAHOT — Hebrew/Aramaic Old Testament (4 files, Gen-Deu / Jos-Est / Job-Sng / Isa-Mal)
 *   TAGNT — Greek New Testament        (2 files, Mat-Jhn / Act-Rev)
 *
 * IMPORTANT: the two corpora do NOT share a column layout. Parsing Greek with
 * the Hebrew layout silently yields empty Strong's numbers, puts the English
 * gloss in the transliteration field, and leaves manuscript sigla in the
 * grammar field — so the format is detected rather than assumed.
 *
 *   TAHOT: ref | Hebrew | Translit | Translation | dStrongs | Grammar | ...
 *          e.g.  בְּ/רֵאשִׁ֖ית | be./re.Shit | in/ beginning | H9003/{H7225G} | HR/Ncfsa
 *
 *   TAGNT: ref | "Greek (Translit)" | Translation | Strongs=Morph | lemma=gloss | witnesses | ...
 *          e.g.  Βίβλος (Biblos) | [The] book | G0976=N-NSF | βίβλος=book | NA28+NA27+...
 *
 * Both files carry a licence preamble and `#`-prefixed per-verse summary rows;
 * only the per-word table is authoritative, so everything else is skipped.
 */

export type StepBibleFormat = 'TAHOT' | 'TAGNT';

export interface StepBibleWord {
  index: number;
  original: string;
  transliteration: string;
  translation: string;
  strongs: string[];
  grammar: string;
  root?: string;
}

export interface StepBibleVerse {
  book: string;
  chapter: number;
  verse: number;
  /** Words joined with a space, markup separators removed, NFC-normalised. */
  text: string;
  words: StepBibleWord[];
  /** Deduped, lexical Strong's numbers only (see isLexicalStrong). */
  strongNumbers: string[];
}

/**
 * STEPBible uses H9000+ for grammatical particles Tyndale added (prefixes,
 * suffixes, object markers). Those are not lexicon entries and would pollute
 * strongs_concordance, so callers filter on this.
 */
export function isLexicalStrong(code: string): boolean {
  const m = /^([HG])(\d+)/.exec(code);
  if (!m) return false;
  const n = Number(m[2]);
  return n > 0 && n < 9000;
}

/** Pull Strong's codes out of a cell such as "H9003/{H7225G}" or "G0976=N-NSF". */
export function parseStrongs(cell: string): string[] {
  if (!cell) return [];
  const head = cell.split('=')[0];
  return [...head.matchAll(/[HG]\d{1,4}[A-Za-z]?/g)].map((m) => m[0]);
}

const REF_RE = /^([1-3]?[A-Za-z]{2,4})\.(\d+)\.(\d+)#(\d+)/;

/** Split a TAGNT cell like "Βίβλος (Biblos)" into word and transliteration. */
function splitGreekCell(cell: string): { original: string; translit: string } {
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(cell.trim());
  if (!m) return { original: cell.trim(), translit: '' };
  return { original: m[1].trim(), translit: m[2].trim() };
}

/**
 * Detect which corpus a file body belongs to.
 *
 * The discriminator is column 4: TAGNT packs "Strongs=Morphology" there
 * (G0976=N-NSF), whereas in TAHOT column 4 is the plain English translation.
 */
export function detectFormat(content: string): StepBibleFormat {
  let greek = 0;
  let seen = 0;
  for (const raw of content.split(/\r?\n/)) {
    if (!raw || raw.startsWith('#')) continue;
    const cols = raw.split('\t');
    if (!REF_RE.test(cols[0] ?? '')) continue;
    seen++;
    if (/^[HG]\d{1,4}[A-Za-z]?=/.test((cols[3] ?? '').trim())) greek++;
    if (seen >= 40) break;
  }
  return seen > 0 && greek > seen / 2 ? 'TAGNT' : 'TAHOT';
}

/**
 * Parse one TAHOT/TAGNT file body into verses.
 *
 * Tolerant by design: the licence preamble, blank lines, repeated column
 * headers and `#`-prefixed summary rows are skipped rather than treated as
 * errors, because upstream interleaves them per book.
 */
export function parseStepBible(
  content: string,
  format: StepBibleFormat = detectFormat(content),
): StepBibleVerse[] {
  const verses = new Map<string, StepBibleVerse>();

  for (const raw of content.split(/\r?\n/)) {
    if (!raw || raw.startsWith('#')) continue;
    const cols = raw.split('\t');
    const ref = REF_RE.exec(cols[0] ?? '');
    if (!ref) continue;

    const [, book, chapterStr, verseStr, idxStr] = ref;
    const chapter = Number(chapterStr);
    const verse = Number(verseStr);
    const key = `${book}.${chapter}.${verse}`;

    let entry = verses.get(key);
    if (!entry) {
      entry = { book, chapter, verse, text: '', words: [], strongNumbers: [] };
      verses.set(key, entry);
    }

    let word: StepBibleWord;
    if (format === 'TAGNT') {
      const { original, translit } = splitGreekCell(cols[1] ?? '');
      const cell4 = (cols[3] ?? '').trim();
      word = {
        index: Number(idxStr),
        original: original.normalize('NFC'),
        transliteration: translit,
        translation: (cols[2] ?? '').trim(),
        strongs: parseStrongs(cell4),
        grammar: cell4.includes('=') ? cell4.slice(cell4.indexOf('=') + 1) : '',
        root: (cols[4] ?? '').split('=')[0].trim() || undefined,
      };
    } else {
      word = {
        index: Number(idxStr),
        original: (cols[1] ?? '').trim().normalize('NFC'),
        transliteration: (cols[2] ?? '').trim(),
        translation: (cols[3] ?? '').trim(),
        strongs: parseStrongs(cols[4] ?? ''),
        grammar: (cols[5] ?? '').trim(),
        root: (cols[8] ?? '').trim() || undefined,
      };
    }
    entry.words.push(word);
  }

  for (const v of verses.values()) {
    v.words.sort((a, b) => a.index - b.index);
    // Per the upstream column docs: "/" separates prefixes and suffixes from
    // the root word, and a backslash separates punctuation. Both are markup,
    // not text — leaving the backslash in corrupts every verse-final sof pasuq.
    // Source text is not NFC-normalised, so normalise to keep equality, dedup
    // and embedding stable downstream.
    v.text = v.words
      .map((w) => w.original.replace(/[\\/]/g, ''))
      .join(' ')
      .normalize('NFC')
      .trim();
    v.strongNumbers = [
      ...new Set(v.words.flatMap((w) => w.strongs).filter(isLexicalStrong)),
    ];
  }

  return [...verses.values()];
}

/**
 * STEPBible 3-letter book codes → the full book names stored in
 * `public.comprehensive_biblical_texts.book`.
 *
 * This mapping is load-bearing: STEPBible emits "Gen" while the table stores
 * "Genesis", so without it every enrichment UPDATE matches zero rows and the
 * job reports success while doing nothing. Callers must treat an unmapped code
 * as an error worth surfacing, not as a row to skip quietly.
 */
export const STEPBIBLE_BOOKS: Readonly<Record<string, string>> = Object.freeze({
  // Old Testament (TAHOT)
  Gen: 'Genesis', Exo: 'Exodus', Lev: 'Leviticus', Num: 'Numbers', Deu: 'Deuteronomy',
  Jos: 'Joshua', Jdg: 'Judges', Rut: 'Ruth',
  '1Sa': '1 Samuel', '2Sa': '2 Samuel', '1Ki': '1 Kings', '2Ki': '2 Kings',
  '1Ch': '1 Chronicles', '2Ch': '2 Chronicles',
  Ezr: 'Ezra', Neh: 'Nehemiah', Est: 'Esther', Job: 'Job', Psa: 'Psalms',
  Pro: 'Proverbs', Ecc: 'Ecclesiastes', Sng: 'Song of Solomon',
  Isa: 'Isaiah', Jer: 'Jeremiah', Lam: 'Lamentations', Ezk: 'Ezekiel', Dan: 'Daniel',
  Hos: 'Hosea', Jol: 'Joel', Amo: 'Amos', Oba: 'Obadiah', Jon: 'Jonah',
  Mic: 'Micah', Nam: 'Nahum', Hab: 'Habakkuk', Zep: 'Zephaniah',
  Hag: 'Haggai', Zec: 'Zechariah', Mal: 'Malachi',
  // New Testament (TAGNT)
  Mat: 'Matthew', Mrk: 'Mark', Luk: 'Luke', Jhn: 'John', Act: 'Acts',
  Rom: 'Romans', '1Co': '1 Corinthians', '2Co': '2 Corinthians',
  Gal: 'Galatians', Eph: 'Ephesians', Php: 'Philippians', Col: 'Colossians',
  '1Th': '1 Thessalonians', '2Th': '2 Thessalonians',
  '1Ti': '1 Timothy', '2Ti': '2 Timothy', Tit: 'Titus', Phm: 'Philemon',
  Heb: 'Hebrews', Jas: 'James', '1Pe': '1 Peter', '2Pe': '2 Peter',
  '1Jn': '1 John', '2Jn': '2 John', '3Jn': '3 John', Jud: 'Jude', Rev: 'Revelation',
});

/** Resolve a STEPBible book code to its stored name, or null if unmapped. */
export function resolveBookName(code: string): string | null {
  return STEPBIBLE_BOOKS[code] ?? null;
}

/** Which language column a corpus writes into. */
export function languageColumn(format: StepBibleFormat): 'hebrew_text' | 'greek_text' {
  return format === 'TAGNT' ? 'greek_text' : 'hebrew_text';
}
