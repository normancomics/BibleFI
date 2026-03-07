import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended financial term taxonomy for deep scripture mining
const DEEP_FINANCIAL_TERMS: Record<string, string[]> = {
  stewardship: ['steward', 'stewardship', 'faithful', 'unfaithful', 'entrust', 'account', 'manager', 'overseer', 'master', 'servant', 'watchman'],
  generational_wealth: ['inheritance', 'children', 'generation', 'legacy', 'portion', 'birthright', 'blessing', 'estate', 'heir', 'promise', 'land', 'seed'],
  debt_freedom: ['debt', 'debtor', 'owe', 'borrow', 'lend', 'usury', 'interest', 'pledge', 'surety', 'bond', 'free', 'liberty', 'jubilee', 'release', 'forgive'],
  wise_investing: ['talent', 'mina', 'multiply', 'increase', 'gain', 'profit', 'return', 'yield', 'fruit', 'sow', 'reap', 'harvest', 'plant', 'grow', 'build'],
  contentment: ['content', 'enough', 'sufficient', 'satisfied', 'peace', 'rest', 'provision', 'daily bread', 'manna'],
  giving: ['give', 'tithe', 'offering', 'alms', 'charity', 'generous', 'liberal', 'cheerful', 'firstfruits', 'sacrifice', 'contribute'],
  warning: ['greed', 'covet', 'love of money', 'rich', 'fool', 'vanity', 'moth', 'rust', 'thief', 'deceit', 'unjust', 'oppression', 'bribe'],
  planning: ['plan', 'prepare', 'count the cost', 'tower', 'wise', 'prudent', 'counsel', 'foresight', 'ant', 'sluggard', 'diligent'],
  prosperity: ['prosper', 'abundance', 'overflow', 'bless', 'wealth', 'riches', 'treasure', 'storehouse', 'barn', 'plenty'],
  justice: ['justice', 'righteousness', 'fair', 'equity', 'honest', 'scales', 'measure', 'weight', 'balance', 'widow', 'orphan', 'poor', 'needy', 'oppressed'],
};

// DeFi concept deep mapping
const DEFI_DEEP_MAP: Record<string, { concept: string; protocol_example: string; risk_note: string }> = {
  stewardship: { concept: 'DAO governance & treasury management', protocol_example: 'Nouns DAO, BibleFi Governance', risk_note: 'Governance attacks, proposal spam' },
  generational_wealth: { concept: 'Long-term staking, vesting schedules, trust vaults', protocol_example: 'Superfluid streams, time-locked vaults', risk_note: 'Smart contract risk over long periods' },
  debt_freedom: { concept: 'Collateralized lending, flash loan arbitrage for debt payoff', protocol_example: 'Aave V3, Morpho Blue', risk_note: 'Liquidation risk, interest rate volatility' },
  wise_investing: { concept: 'Yield farming, LP provision, auto-compounding', protocol_example: 'Aerodrome, Uniswap V3, Beefy', risk_note: 'Impermanent loss, smart contract exploits' },
  contentment: { concept: 'Stablecoin yields, conservative vaults', protocol_example: 'Moonwell USDC, Compound V3', risk_note: 'Stablecoin depeg risk' },
  giving: { concept: 'Superfluid streaming, automated tithing, charity pools', protocol_example: 'Superfluid, BibleFi TitheStream', risk_note: 'Gas costs, stream management' },
  warning: { concept: 'Risk management, position limits, stop-losses', protocol_example: 'DeFi Saver, circuit breakers', risk_note: 'Overleveraging, rug pulls' },
  planning: { concept: 'Portfolio rebalancing, DCA strategies', protocol_example: 'Mean Finance, DCA protocols', risk_note: 'Market timing, gas optimization' },
  prosperity: { concept: 'Multi-strategy yield optimization', protocol_example: 'Yearn, BWTYA pools', risk_note: 'Strategy complexity, cascading failures' },
  justice: { concept: 'Fair launch tokens, transparent governance, audited contracts', protocol_example: 'Base ecosystem verified contracts', risk_note: 'Regulatory uncertainty' },
};

// Books to systematically scan (entire Bible coverage)
const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

const BIBLE_API_URL = 'https://bible-api.com';

interface ExpandedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  financial_keywords: string[];
  wisdom_categories: string[];
  defi_applications: { concept: string; protocol_example: string; risk_note: string }[];
  financial_relevance: number;
  practical_application: string;
}

function extractDeepKeywords(text: string): { keywords: string[]; categories: string[] } {
  const lower = text.toLowerCase();
  const keywords: string[] = [];
  const categories: string[] = [];

  for (const [category, terms] of Object.entries(DEEP_FINANCIAL_TERMS)) {
    let found = false;
    for (const term of terms) {
      if (lower.includes(term) && !keywords.includes(term)) {
        keywords.push(term);
        found = true;
      }
    }
    if (found) categories.push(category);
  }
  return { keywords, categories };
}

function buildPracticalApplication(categories: string[], text: string): string {
  const apps: string[] = [];
  for (const cat of categories) {
    const mapping = DEFI_DEEP_MAP[cat];
    if (mapping) {
      apps.push(`${cat}: ${mapping.concept}`);
    }
  }
  if (apps.length === 0) return 'General Biblical financial stewardship principle';
  return apps.join('. ');
}

async function fetchChapterVerses(book: string, chapter: number): Promise<any[] | null> {
  try {
    const ref = `${book} ${chapter}`;
    const resp = await fetch(`${BIBLE_API_URL}/${encodeURIComponent(ref)}?translation=kjv`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.verses || [];
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'expand'; // 'expand' | 'status' | 'crossref'

    if (mode === 'status') {
      const { count: knowledgeCount } = await supabase
        .from('biblical_knowledge_base')
        .select('*', { count: 'exact', head: true });
      const { count: crossrefCount } = await supabase
        .from('biblical_financial_crossref')
        .select('*', { count: 'exact', head: true });
      const { count: comprehensiveCount } = await supabase
        .from('comprehensive_biblical_texts')
        .select('*', { count: 'exact', head: true });

      return new Response(JSON.stringify({
        success: true,
        agent: 'biblical-wisdom-expander',
        status: {
          knowledge_base_entries: knowledgeCount || 0,
          crossref_entries: crossrefCount || 0,
          comprehensive_texts: comprehensiveCount || 0,
          total_books: BIBLE_BOOKS.length,
          deep_categories: Object.keys(DEEP_FINANCIAL_TERMS).length,
          last_run: new Date().toISOString(),
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'crossref') {
      // Build cross-references between biblical terms and DeFi concepts
      const { data: verses } = await supabase
        .from('biblical_knowledge_base')
        .select('id, reference, verse_text, financial_keywords, defi_relevance')
        .not('financial_keywords', 'is', null)
        .limit(50);

      let crossrefsCreated = 0;
      for (const verse of (verses || [])) {
        const keywords = verse.financial_keywords || [];
        for (const kw of keywords) {
          for (const [category, terms] of Object.entries(DEEP_FINANCIAL_TERMS)) {
            if (terms.includes(kw)) {
              const mapping = DEFI_DEEP_MAP[category];
              if (!mapping) continue;

              await supabase.from('biblical_financial_crossref').upsert({
                biblical_verse_id: verse.id,
                biblical_term: kw,
                financial_term: category,
                defi_concept: mapping.concept,
                relationship_type: 'wisdom_application',
                explanation: `${kw} in ${verse.reference} maps to ${mapping.concept}`,
                practical_application: `Protocol: ${mapping.protocol_example}`,
                risk_consideration: mapping.risk_note,
              }, { onConflict: 'id' });
              crossrefsCreated++;
            }
          }
        }
        await new Promise(r => setTimeout(r, 50));
      }

      return new Response(JSON.stringify({
        success: true,
        agent: 'biblical-wisdom-expander',
        mode: 'crossref',
        crossrefs_created: crossrefsCreated,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Expand mode: scan random chapters for financial wisdom
    const booksToScan = body.books || [];
    const chaptersPerBook = body.chapters_per_book || 3;
    const results: ExpandedVerse[] = [];
    const errors: string[] = [];

    // Pick random books if not specified
    let targetBooks: string[];
    if (booksToScan.length > 0) {
      targetBooks = booksToScan;
    } else {
      const shuffled = [...BIBLE_BOOKS].sort(() => Math.random() - 0.5);
      targetBooks = shuffled.slice(0, 3); // 3 random books per run
    }

    for (const book of targetBooks) {
      // Scan random chapters (1-50 range, API will return error for non-existent)
      const chapters = Array.from({ length: chaptersPerBook }, () => Math.floor(Math.random() * 40) + 1);

      for (const chapter of chapters) {
        try {
          const verses = await fetchChapterVerses(book, chapter);
          if (!verses || verses.length === 0) continue;

          for (const v of verses) {
            const text = v.text?.trim();
            if (!text || text.length < 20) continue;

            const { keywords, categories } = extractDeepKeywords(text);
            if (keywords.length === 0) continue;

            const defiApps = categories
              .map(c => DEFI_DEEP_MAP[c])
              .filter(Boolean);

            const relevance = Math.min(keywords.length * 10 + categories.length * 15, 100);
            const practicalApp = buildPracticalApplication(categories, text);

            const expanded: ExpandedVerse = {
              book: v.book_name || book,
              chapter: v.chapter || chapter,
              verse: v.verse || 1,
              text,
              financial_keywords: keywords,
              wisdom_categories: categories,
              defi_applications: defiApps,
              financial_relevance: relevance,
              practical_application: practicalApp,
            };
            results.push(expanded);

            // Upsert into knowledge base
            const ref = `${expanded.book} ${expanded.chapter}:${expanded.verse}`;
            await supabase.from('biblical_knowledge_base').upsert({
              reference: ref,
              verse_text: text,
              category: categories[0] || 'general_finance',
              principle: `Financial wisdom: ${keywords.slice(0, 5).join(', ')}`,
              application: practicalApp,
              defi_relevance: defiApps.length > 0 ? defiApps.map(d => d.concept).join('; ') : null,
              financial_keywords: keywords,
            }, { onConflict: 'reference' });

            // Also upsert comprehensive text
            await supabase.from('comprehensive_biblical_texts').upsert({
              book: expanded.book,
              chapter: expanded.chapter,
              verse: expanded.verse,
              kjv_text: text,
              financial_keywords: keywords,
              financial_relevance: relevance,
            }, { onConflict: 'book,chapter,verse' });
          }

          await new Promise(r => setTimeout(r, 300));
        } catch (err) {
          errors.push(`${book} ${chapter}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    console.log(`📖 Biblical Wisdom Expander: Scanned ${targetBooks.join(', ')}, found ${results.length} financial verses, ${errors.length} errors`);

    return new Response(JSON.stringify({
      success: true,
      agent: 'biblical-wisdom-expander',
      mode: 'expand',
      books_scanned: targetBooks,
      financial_verses_found: results.length,
      errors: errors.length,
      sample_results: results.slice(0, 5).map(r => ({
        reference: `${r.book} ${r.chapter}:${r.verse}`,
        keywords: r.financial_keywords,
        categories: r.wisdom_categories,
        defi_apps: r.defi_applications.map(d => d.concept),
        relevance: r.financial_relevance,
      })),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Biblical Wisdom Expander error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
