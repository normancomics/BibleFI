import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// Comprehensive financial term taxonomy from BWSP custom knowledge
const FINANCIAL_TERMS = {
  money_wealth: ['money', 'silver', 'gold', 'bronze', 'treasure', 'wealth', 'riches', 'mammon', 'purse', 'treasury', 'storehouse', 'inheritance', 'portion', 'price', 'cost', 'wages', 'pay', 'hire', 'reward', 'bribe', 'gift', 'booty', 'plunder', 'spoil', 'ransom', 'dowry', 'alms', 'offering', 'sacrifice', 'firstfruits'],
  tithing: ['tithe', 'tithing', 'tenth', 'tithes', 'storehouse', 'firstfruit', 'firstfruits', 'offering', 'offerings', 'tribute', 'temple tax'],
  debt_lending: ['debt', 'debtor', 'creditor', 'lend', 'borrow', 'loan', 'usury', 'interest', 'pledge', 'surety', 'guarantee', 'collateral', 'bond', 'mortgage'],
  trade_commerce: ['buy', 'sell', 'purchase', 'trade', 'merchant', 'merchandise', 'goods', 'cargo', 'market', 'scales', 'weights', 'measures', 'balance', 'dishonest'],
  labor_work: ['work', 'labor', 'toil', 'diligent', 'sluggard', 'lazy', 'wages', 'hireling', 'servant', 'steward', 'stewardship', 'faithful', 'unfaithful'],
  taxes: ['tax', 'taxes', 'tribute', 'custom', 'toll', 'duty', 'caesar', 'render', 'census'],
  agriculture_finance: ['sow', 'reap', 'harvest', 'seed', 'vineyard', 'field', 'barn', 'storehouse', 'grain', 'wheat', 'famine', 'plenty'],
  ethics_finance: ['greed', 'covetous', 'avarice', 'love of money', 'oppression', 'extortion', 'theft', 'robbery', 'fraud', 'deceit', 'bribery', 'corruption', 'false balances', 'generosity', 'charity', 'justice', 'righteousness'],
  saving_investment: ['store', 'save', 'invest', 'talent', 'mina', 'increase', 'multiply', 'fruit', 'yield', 'return', 'profit', 'gain'],
  release_forgiveness: ['jubilee', 'sabbatical', 'release', 'forgive', 'cancel', 'remit', 'redeem', 'redemption', 'kinsman'],
  generational_wealth: ['inheritance', 'children', 'generation', 'legacy', 'portion', 'birthright', 'blessing', 'estate', 'heir', 'promise', 'land'],
  risk_management: ['prudent', 'wise', 'counsel', 'foresight', 'plan', 'prepare', 'count', 'cost', 'tower', 'diversify'],
  contentment: ['content', 'enough', 'sufficient', 'satisfied', 'peace', 'rest', 'provision', 'daily bread'],
  prosperity: ['prosper', 'abundance', 'overflow', 'bless', 'plenty', 'full', 'running over'],
};

const DEFI_CONCEPT_MAP: Record<string, string> = {
  tithe: 'Automated streaming payments (Superfluid)',
  tithing: 'Automated streaming payments (Superfluid)',
  interest: 'Lending/borrowing protocols (Aave, Compound)',
  usury: 'Interest rate governance and caps',
  talent: 'Yield farming and staking strategies',
  mina: 'Liquidity pool participation',
  harvest: 'Yield harvesting and compounding',
  sow: 'Liquidity provision / seeding pools',
  reap: 'Claiming rewards and yields',
  steward: 'Portfolio management and delegation',
  stewardship: 'DAO governance and treasury management',
  merchant: 'DEX trading and market making',
  scales: 'Oracle price feeds and fair pricing',
  jubilee: 'Debt forgiveness protocols / loan restructuring',
  storehouse: 'Vault strategies and reserves',
  treasure: 'Treasury management',
  faithful: 'Long-term staking and commitment',
  diversify: 'Multi-pool diversification (Ecclesiastes 11:2)',
  sluggard: 'Idle capital warning / yield optimization',
  debt: 'Leveraged positions and collateralized loans',
  redeem: 'Token buyback and redemption mechanisms',
};

// Bible API source for KJV text
const BIBLE_API_URL = 'https://bible-api.com';

interface VerseResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  financial_keywords: string[];
  topic_categories: string[];
  defi_relevance: string | null;
  financial_relevance: number;
}

function extractFinancialKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [_category, terms] of Object.entries(FINANCIAL_TERMS)) {
    for (const term of terms) {
      if (lower.includes(term) && !found.includes(term)) {
        found.push(term);
      }
    }
  }
  return found;
}

function categorizeVerse(keywords: string[]): string[] {
  const categories: string[] = [];
  for (const [category, terms] of Object.entries(FINANCIAL_TERMS)) {
    if (keywords.some(kw => terms.includes(kw))) {
      categories.push(category);
    }
  }
  return categories;
}

function getDefiRelevance(keywords: string[]): string | null {
  const relevances: string[] = [];
  for (const kw of keywords) {
    if (DEFI_CONCEPT_MAP[kw] && !relevances.includes(DEFI_CONCEPT_MAP[kw])) {
      relevances.push(DEFI_CONCEPT_MAP[kw]);
    }
  }
  return relevances.length > 0 ? relevances.join('; ') : null;
}

function calculateRelevance(keywords: string[], categories: string[]): number {
  return Math.min(keywords.length * 8 + categories.length * 12, 100);
}

// ALL 66 books for systematic full-Bible scanning
const ALL_BIBLE_BOOKS = [
  // OT
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // NT
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

// Key financial passages to scan (known high-value references)
const FINANCIAL_PASSAGES = [
  // Torah economic laws
  'Genesis 14:18-20', 'Genesis 41:33-36', 'Genesis 47:23-26',
  'Exodus 22:25-27', 'Exodus 23:10-11',
  'Leviticus 19:13', 'Leviticus 19:35-36', 'Leviticus 25:8-17', 'Leviticus 25:35-37', 'Leviticus 27:30-32',
  'Numbers 18:21-26',
  'Deuteronomy 8:17-18', 'Deuteronomy 14:22-29', 'Deuteronomy 15:1-11', 'Deuteronomy 23:19-20', 'Deuteronomy 24:14-15', 'Deuteronomy 25:13-16',
  // Wisdom literature
  'Proverbs 3:9-10', 'Proverbs 6:6-11', 'Proverbs 10:4-5', 'Proverbs 11:1', 'Proverbs 11:24-26', 'Proverbs 13:11', 'Proverbs 13:22',
  'Proverbs 14:23', 'Proverbs 14:31', 'Proverbs 15:27', 'Proverbs 16:11', 'Proverbs 19:17', 'Proverbs 20:10', 'Proverbs 21:5-6',
  'Proverbs 22:1-2', 'Proverbs 22:7', 'Proverbs 22:16', 'Proverbs 22:26-27', 'Proverbs 23:4-5', 'Proverbs 27:23-27', 'Proverbs 28:8', 'Proverbs 28:20', 'Proverbs 28:22',
  'Proverbs 30:8-9', 'Proverbs 31:10-31',
  'Ecclesiastes 2:18-26', 'Ecclesiastes 4:4-6', 'Ecclesiastes 5:10-20', 'Ecclesiastes 11:1-6',
  // Prophets
  'Isaiah 5:8', 'Isaiah 10:1-2', 'Isaiah 55:1-2',
  'Jeremiah 17:11', 'Jeremiah 22:13',
  'Ezekiel 18:8-9', 'Ezekiel 18:13', 'Ezekiel 22:12-13', 'Ezekiel 45:10-12',
  'Amos 2:6-8', 'Amos 5:11-12', 'Amos 8:4-6',
  'Micah 6:10-12',
  'Habakkuk 2:6-9',
  'Haggai 1:3-11', 'Haggai 2:8',
  'Zechariah 7:9-10',
  'Malachi 3:8-12',
  // Gospels
  'Matthew 6:19-24', 'Matthew 6:25-34', 'Matthew 17:24-27', 'Matthew 19:16-26', 'Matthew 20:1-16',
  'Matthew 22:15-22', 'Matthew 25:14-30',
  'Mark 10:17-31', 'Mark 12:13-17', 'Mark 12:41-44',
  'Luke 3:12-14', 'Luke 6:34-38', 'Luke 10:7', 'Luke 12:13-34', 'Luke 14:28-30',
  'Luke 16:1-15', 'Luke 18:18-30', 'Luke 19:1-10', 'Luke 19:11-27', 'Luke 20:20-26', 'Luke 21:1-4',
  // Epistles
  'Acts 2:44-47', 'Acts 4:32-37', 'Acts 5:1-11', 'Acts 20:35',
  'Romans 13:6-8',
  '1 Corinthians 9:7-14', '1 Corinthians 16:1-4',
  '2 Corinthians 8:1-15', '2 Corinthians 9:6-15',
  'Ephesians 4:28',
  'Philippians 4:11-13', 'Philippians 4:19',
  'Colossians 3:23-24',
  '1 Thessalonians 4:11-12',
  '2 Thessalonians 3:6-12',
  '1 Timothy 5:18', '1 Timothy 6:6-19',
  '2 Timothy 2:6',
  'Hebrews 7:1-10', 'Hebrews 13:5-6',
  'James 2:1-7', 'James 4:13-17', 'James 5:1-6',
  '1 Peter 5:2',
  '1 John 3:17-18',
  'Revelation 3:17-18', 'Revelation 18:11-19',
];

// Systematic chapter scanning for full Bible coverage
async function fetchFullChapter(book: string, chapter: number): Promise<any[] | null> {
  try {
    const resp = await fetch(`${BIBLE_API_URL}/${encodeURIComponent(`${book} ${chapter}`)}?translation=kjv`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.verses || [];
  } catch {
    return null;
  }
}

async function fetchVerse(reference: string): Promise<{ text: string; verses: any[] } | null> {
  try {
    const resp = await fetch(`${BIBLE_API_URL}/${encodeURIComponent(reference)}?translation=kjv`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return { text: data.text, verses: data.verses || [] };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Require admin or cron-secret authentication
  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error || 'Unauthorized', corsHeaders);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'scan';
    const batchSize = body.batchSize || 10;

    if (mode === 'status') {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { count: totalVerses } = await supabase.from('biblical_knowledge_base').select('*', { count: 'exact', head: true });
      const { count: financialVerses } = await supabase.from('comprehensive_biblical_texts').select('*', { count: 'exact', head: true });
      return new Response(JSON.stringify({
        success: true, agent: 'scripture-financial-scanner',
        status: { biblical_knowledge_entries: totalVerses || 0, comprehensive_texts: financialVerses || 0, total_passages_to_scan: FINANCIAL_PASSAGES.length, last_run: new Date().toISOString() }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Run in sandbox with full audit trail
    const result = await withAgentSandbox(
      { agentName: 'scripture-financial-scanner', runMode: body.manual ? 'manual' : 'scheduled', metadata: { batchSize, mode } },
      async (ctx: AgentContext) => {
        const results: VerseResult[] = [];
        const errors: string[] = [];
        const shuffled = [...FINANCIAL_PASSAGES].sort(() => Math.random() - 0.5);
        const batch = shuffled.slice(0, batchSize);

        for (const ref of batch) {
          try {
            const data = await fetchVerse(ref);
            if (!data) { errors.push(`Failed to fetch: ${ref}`); continue; }

            if (data.verses && data.verses.length > 0) {
              for (const v of data.verses) {
                const text = v.text?.trim();
                if (!text) continue;
                const keywords = extractFinancialKeywords(text);
                const categories = categorizeVerse(keywords);
                const defiRelevance = getDefiRelevance(keywords);
                const relevance = calculateRelevance(keywords, categories);
                if (keywords.length === 0) continue;

                const verseResult: VerseResult = {
                  book: v.book_name || ref.split(' ')[0],
                  chapter: v.chapter || parseInt(ref.split(':')[0]?.split(' ').pop() || '1'),
                  verse: v.verse || 1, text, financial_keywords: keywords,
                  topic_categories: categories, defi_relevance: defiRelevance, financial_relevance: relevance,
                };
                results.push(verseResult);

                // Sandboxed upsert into biblical_knowledge_base
                await sandboxedInsert(ctx, 'biblical_knowledge_base', {
                  reference: `${verseResult.book} ${verseResult.chapter}:${verseResult.verse}`,
                  verse_text: text, category: categories[0] || 'general_finance',
                  principle: `Financial wisdom: ${keywords.slice(0, 3).join(', ')}`,
                  application: defiRelevance || 'Biblical financial stewardship principle',
                  defi_relevance: defiRelevance, financial_keywords: keywords,
                }, { onConflict: 'reference' });

                // Sandboxed upsert into comprehensive_biblical_texts
                await sandboxedInsert(ctx, 'comprehensive_biblical_texts', {
                  book: verseResult.book, chapter: verseResult.chapter, verse: verseResult.verse,
                  kjv_text: text, financial_keywords: keywords, financial_relevance: relevance,
                }, { onConflict: 'book,chapter,verse' });
              }
            }
            await new Promise(r => setTimeout(r, 200));
          } catch (err) {
            errors.push(`Error processing ${ref}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }

        return {
          processed: batch.length, financial_verses_found: results.length,
          errors: errors.length, error_details: errors.slice(0, 5),
          sample_results: results.slice(0, 3).map(r => ({
            reference: `${r.book} ${r.chapter}:${r.verse}`, keywords: r.financial_keywords,
            defi_relevance: r.defi_relevance, relevance_score: r.financial_relevance,
          })),
        };
      }
    );

    return new Response(JSON.stringify({ agent: 'scripture-financial-scanner', ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Scripture Financial Scanner error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
