import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Comprehensive financial scripture references organized by category
const FINANCIAL_SCRIPTURE_CATEGORIES: Record<string, { verses: { book: string; chapter: number; verse: number; kjv: string; principle: string; defiRelevance: string; keywords: string[] }[] }> = {
  'tithing_and_giving': {
    verses: [
      { book: 'Malachi', chapter: 3, verse: 10, kjv: 'Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.', principle: 'Faithful tithing unlocks divine provision', defiRelevance: 'Automated yield streams via Superfluid for consistent tithing', keywords: ['tithe', 'storehouse', 'blessing', 'provision'] },
      { book: 'Genesis', chapter: 14, verse: 20, kjv: 'And blessed be the most high God, which hath delivered thine enemies into thy hand. And he gave him tithes of all.', principle: 'Tithing predates Mosaic law — Abraham tithed to Melchizedek', defiRelevance: 'First-fruits allocation protocol for staking rewards', keywords: ['tithe', 'firstfruits', 'Melchizedek', 'offering'] },
      { book: 'Proverbs', chapter: 3, verse: 9, kjv: 'Honour the LORD with thy substance, and with the firstfruits of all thine increase:', principle: 'Honor God first with your wealth', defiRelevance: 'Auto-allocate yield farming returns to tithe before reinvestment', keywords: ['firstfruits', 'increase', 'honour', 'substance'] },
      { book: '2 Corinthians', chapter: 9, verse: 7, kjv: 'Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.', principle: 'Giving should be voluntary and joyful', defiRelevance: 'User-set giving ratios, no forced percentages', keywords: ['give', 'cheerful', 'purpose', 'heart'] },
      { book: 'Luke', chapter: 6, verse: 38, kjv: 'Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over, shall men give into your bosom. For with the same measure that ye mete withal it shall be measured to you again.', principle: 'Generosity returns multiplied', defiRelevance: 'Compound yield mechanics mirror spiritual return principle', keywords: ['give', 'measure', 'return', 'generosity'] },
    ]
  },
  'debt_and_borrowing': {
    verses: [
      { book: 'Proverbs', chapter: 22, verse: 7, kjv: 'The rich ruleth over the poor, and the borrower is servant to the lender.', principle: 'Debt creates bondage — avoid excessive leverage', defiRelevance: 'Conservative LTV ratios in lending protocols', keywords: ['debt', 'borrower', 'lender', 'servant', 'leverage'] },
      { book: 'Romans', chapter: 13, verse: 8, kjv: 'Owe no man any thing, but to love one another: for he that loveth another hath fulfilled the law.', principle: 'Strive to be debt-free', defiRelevance: 'Prioritize debt repayment in DeFi strategies', keywords: ['owe', 'debt', 'love', 'fulfill'] },
      { book: 'Deuteronomy', chapter: 15, verse: 1, kjv: 'At the end of every seven years thou shalt make a release.', principle: 'Sabbatical debt release — jubilee economics', defiRelevance: 'Time-locked debt forgiveness smart contracts', keywords: ['release', 'sabbatical', 'jubilee', 'seven'] },
      { book: 'Nehemiah', chapter: 5, verse: 10, kjv: 'I likewise, and my brethren, and my servants, might exact of them money and corn: I pray you, let us leave off this usury.', principle: 'Exploitative interest is condemned', defiRelevance: 'Fair lending rates, anti-predatory protocol design', keywords: ['usury', 'interest', 'lending', 'fair'] },
      { book: 'Psalm', chapter: 37, verse: 21, kjv: 'The wicked borroweth, and payeth not again: but the righteous sheweth mercy, and giveth.', principle: 'Honor your financial commitments', defiRelevance: 'Smart contract enforcement of repayment obligations', keywords: ['borrow', 'repay', 'mercy', 'righteous'] },
    ]
  },
  'saving_and_investment': {
    verses: [
      { book: 'Genesis', chapter: 41, verse: 36, kjv: 'And that food shall be for store to the land against the seven years of famine, which shall be in the land of Egypt; that the land perish not through the famine.', principle: 'Joseph\'s 7-year savings strategy — build reserves', defiRelevance: 'Stablecoin reserves and yield farming for future needs', keywords: ['store', 'famine', 'reserve', 'savings', 'Joseph'] },
      { book: 'Proverbs', chapter: 21, verse: 5, kjv: 'The thoughts of the diligent tend only to plenteousness; but of every one that is hasty only to want.', principle: 'Diligent planning leads to abundance', defiRelevance: 'Dollar-cost averaging and systematic investment', keywords: ['diligent', 'planning', 'abundance', 'hasty'] },
      { book: 'Proverbs', chapter: 13, verse: 11, kjv: 'Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.', principle: 'Build wealth gradually through honest work', defiRelevance: 'Sustainable yield over speculative moonshots', keywords: ['wealth', 'labour', 'increase', 'vanity'] },
      { book: 'Ecclesiastes', chapter: 11, verse: 2, kjv: 'Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.', principle: 'Diversify your investments', defiRelevance: 'Multi-pool, multi-chain diversification strategy', keywords: ['diversify', 'portion', 'seven', 'eight', 'risk'] },
      { book: 'Matthew', chapter: 25, verse: 27, kjv: 'Thou oughtest therefore to have put my money to the exchangers, and then at my coming I should have received mine own with usury.', principle: 'Idle capital is condemned — invest wisely', defiRelevance: 'Put capital to productive use in yield-generating protocols', keywords: ['talent', 'invest', 'exchange', 'return', 'stewardship'] },
    ]
  },
  'taxes_and_governance': {
    verses: [
      { book: 'Matthew', chapter: 22, verse: 21, kjv: 'Render therefore unto Caesar the things which are Caesar\'s; and unto God the things that are God\'s.', principle: 'Pay taxes faithfully', defiRelevance: 'Tax compliance tracking for crypto donations and DeFi gains', keywords: ['tax', 'Caesar', 'render', 'compliance'] },
      { book: 'Romans', chapter: 13, verse: 7, kjv: 'Render therefore to all their dues: tribute to whom tribute is due; custom to whom custom; fear to whom fear; honour to whom honour.', principle: 'Honor all financial obligations including taxes', defiRelevance: 'Automated tax documentation and IRS compliance', keywords: ['tribute', 'custom', 'dues', 'tax'] },
    ]
  },
  'stewardship_and_wisdom': {
    verses: [
      { book: '1 Corinthians', chapter: 4, verse: 2, kjv: 'Moreover it is required in stewards, that a man be found faithful.', principle: 'Faithful stewardship of all resources', defiRelevance: 'Core protocol principle — manage assets faithfully', keywords: ['steward', 'faithful', 'required', 'management'] },
      { book: 'Proverbs', chapter: 27, verse: 23, kjv: 'Be thou diligent to know the state of thy flocks, and look well to thy herds.', principle: 'Monitor your portfolio actively', defiRelevance: 'Dashboard monitoring of DeFi positions and yields', keywords: ['diligent', 'know', 'flocks', 'portfolio', 'monitor'] },
      { book: 'Proverbs', chapter: 24, verse: 27, kjv: 'Prepare thy work without, and make it fit for thyself in the field; and afterwards build thine house.', principle: 'Build income before luxuries', defiRelevance: 'Prioritize yield generation before speculative trades', keywords: ['prepare', 'work', 'build', 'order', 'priority'] },
      { book: 'Luke', chapter: 14, verse: 28, kjv: 'For which of you, intending to build a tower, sitteth not down first, and counteth the cost, whether he have sufficient to finish it?', principle: 'Count the cost before investing', defiRelevance: 'Risk assessment before entering any DeFi position', keywords: ['cost', 'count', 'plan', 'risk', 'assessment'] },
      { book: 'Proverbs', chapter: 15, verse: 22, kjv: 'Without counsel purposes are disappointed: but in the multitude of counsellors they are established.', principle: 'Seek wise counsel for financial decisions', defiRelevance: 'Community governance and wisdom scoring', keywords: ['counsel', 'wisdom', 'advisors', 'community'] },
    ]
  },
  'contentment_and_ethics': {
    verses: [
      { book: '1 Timothy', chapter: 6, verse: 10, kjv: 'For the love of money is the root of all evil: which while some coveted after, they have erred from the faith, and pierced themselves through with many sorrows.', principle: 'Money is a tool, not an idol', defiRelevance: 'Anti-greed guardrails in protocol design', keywords: ['money', 'love', 'evil', 'covet', 'greed'] },
      { book: 'Hebrews', chapter: 13, verse: 5, kjv: 'Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee.', principle: 'Practice contentment', defiRelevance: 'Avoid FOMO-driven speculation', keywords: ['content', 'covetousness', 'sufficiency'] },
      { book: 'Proverbs', chapter: 11, verse: 1, kjv: 'A false balance is abomination to the LORD: but a just weight is his delight.', principle: 'Honest business practices', defiRelevance: 'Fair pricing, transparent fees, no hidden costs', keywords: ['balance', 'honest', 'just', 'weight', 'fair'] },
      { book: 'Leviticus', chapter: 19, verse: 35, kjv: 'Ye shall do no unrighteousness in judgment, in meteyard, in weight, or in measure.', principle: 'Fair measures in all transactions', defiRelevance: 'Oracle integrity and manipulation resistance', keywords: ['measure', 'weight', 'fair', 'justice'] },
    ]
  },
  'generosity_and_charity': {
    verses: [
      { book: 'Acts', chapter: 20, verse: 35, kjv: 'I have shewed you all things, how that so labouring ye ought to support the weak, and to remember the words of the Lord Jesus, how he said, It is more blessed to give than to receive.', principle: 'Giving is more blessed than receiving', defiRelevance: 'Charity pool mechanics with community voting', keywords: ['give', 'receive', 'blessed', 'support', 'charity'] },
      { book: 'Proverbs', chapter: 19, verse: 17, kjv: 'He that hath pity upon the poor lendeth unto the LORD; and that which he hath given will he pay him again.', principle: 'Caring for the poor is lending to God', defiRelevance: 'Charity pool yields directed to community needs', keywords: ['poor', 'lend', 'charity', 'mercy', 'LORD'] },
      { book: 'James', chapter: 2, verse: 15, kjv: 'If a brother or sister be naked, and destitute of daily food,', principle: 'Faith without charitable works is dead', defiRelevance: 'Tangible impact tracking for charitable giving', keywords: ['charity', 'works', 'faith', 'destitute'] },
    ]
  },
};

interface AggregatorResult {
  categoriesProcessed: number;
  versesAdded: number;
  crossRefsCreated: number;
  duplicatesSkipped: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'api' } });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'seed';
    const category = body.category;

    console.log(`📖 Biblical Wisdom Aggregator started — mode: ${mode}, category: ${category || 'all'}`);

    const result: AggregatorResult = {
      categoriesProcessed: 0,
      versesAdded: 0,
      crossRefsCreated: 0,
      duplicatesSkipped: 0,
      errors: [],
    };

    if (mode === 'seed' || mode === 'full') {
      await seedBiblicalWisdom(supabase, result, category);
    }

    if (mode === 'crossref' || mode === 'full') {
      await createFinancialCrossReferences(supabase, result);
    }

    console.log(`✅ Biblical Wisdom Aggregator complete:`, JSON.stringify(result));

    return new Response(JSON.stringify({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const err = error as Error;
    console.error('❌ Biblical Wisdom Aggregator error:', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function seedBiblicalWisdom(
  supabase: ReturnType<typeof createClient>,
  result: AggregatorResult,
  targetCategory?: string
) {
  const categories = targetCategory
    ? { [targetCategory]: FINANCIAL_SCRIPTURE_CATEGORIES[targetCategory] }
    : FINANCIAL_SCRIPTURE_CATEGORIES;

  for (const [categoryName, categoryData] of Object.entries(categories)) {
    if (!categoryData) continue;

    console.log(`📜 Processing category: ${categoryName} (${categoryData.verses.length} verses)`);
    result.categoriesProcessed++;

    for (const verse of categoryData.verses) {
      try {
        // Check if this verse already exists in biblical_knowledge_base
        const { data: existing } = await supabase
          .from('biblical_knowledge_base')
          .select('id')
          .eq('reference', `${verse.book} ${verse.chapter}:${verse.verse}`)
          .limit(1);

        if (existing && existing.length > 0) {
          result.duplicatesSkipped++;
          continue;
        }

        // Insert into biblical_knowledge_base
        const { error: kbError } = await supabase
          .from('biblical_knowledge_base')
          .insert({
            verse_text: verse.kjv,
            reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
            category: categoryName,
            principle: verse.principle,
            application: verse.defiRelevance,
            defi_relevance: verse.defiRelevance,
            financial_keywords: verse.keywords,
          });

        if (kbError) {
          result.errors.push(`KB insert failed for ${verse.book} ${verse.chapter}:${verse.verse}: ${kbError.message}`);
          continue;
        }

        // Also insert into comprehensive_biblical_texts if not already there
        const { data: existingText } = await supabase
          .from('comprehensive_biblical_texts')
          .select('id')
          .eq('book', verse.book)
          .eq('chapter', verse.chapter)
          .eq('verse', verse.verse)
          .limit(1);

        if (!existingText || existingText.length === 0) {
          await supabase
            .from('comprehensive_biblical_texts')
            .insert({
              book: verse.book,
              chapter: verse.chapter,
              verse: verse.verse,
              kjv_text: verse.kjv,
              financial_keywords: verse.keywords,
              financial_relevance: 8,
            });
        }

        result.versesAdded++;
      } catch (err) {
        result.errors.push(`Error processing ${verse.book} ${verse.chapter}:${verse.verse}: ${(err as Error).message}`);
      }
    }
  }
}

async function createFinancialCrossReferences(
  supabase: ReturnType<typeof createClient>,
  result: AggregatorResult
) {
  console.log('🔗 Creating biblical-financial cross-references...');

  // Define DeFi concept mappings
  const crossRefMappings = [
    { biblicalTerm: 'Tithing (Ma\'aser)', financialTerm: 'Automated Yield Allocation', defiConcept: 'Superfluid streaming payments', relationship: 'direct_application', explanation: 'Just as the biblical tithe was a systematic 10% allocation, Superfluid enables automated continuous streaming of funds to churches.' },
    { biblicalTerm: 'Joseph\'s Reserve Strategy', financialTerm: 'Stablecoin Reserves', defiConcept: 'Yield farming with stablecoins', relationship: 'strategic_parallel', explanation: 'Joseph stored grain during 7 years of plenty for 7 years of famine — parallels building stablecoin reserves during bull markets.' },
    { biblicalTerm: 'Parable of Talents', financialTerm: 'Active Portfolio Management', defiConcept: 'Multi-pool yield optimization', relationship: 'direct_application', explanation: 'The master condemned the servant who buried his talent — idle capital should be put to productive, faithful use.' },
    { biblicalTerm: 'Jubilee Debt Release', financialTerm: 'Debt Forgiveness Protocols', defiConcept: 'Time-locked debt contracts', relationship: 'structural_parallel', explanation: 'The biblical Jubilee reset debts every 50 years. Smart contracts can encode time-based debt relief mechanisms.' },
    { biblicalTerm: 'Render Unto Caesar', financialTerm: 'Tax Compliance', defiConcept: 'On-chain tax documentation', relationship: 'direct_application', explanation: 'Jesus affirmed tax obligations. BibleFi automates tax tracking for crypto donations and DeFi gains.' },
    { biblicalTerm: 'False Balances (Proverbs 11:1)', financialTerm: 'Oracle Integrity', defiConcept: 'Chainlink price feeds', relationship: 'ethical_parallel', explanation: 'Just as false weights were abomination, price oracle manipulation is unethical. Use verified oracle feeds.' },
    { biblicalTerm: 'Diversification (Eccl 11:2)', financialTerm: 'Portfolio Diversification', defiConcept: 'Multi-chain deployment', relationship: 'direct_application', explanation: 'Divide your portion to seven or eight — diversify across pools, chains, and asset classes.' },
    { biblicalTerm: 'Usury Prohibition (Neh 5:10)', financialTerm: 'Fair Interest Rates', defiConcept: 'Interest rate caps in lending', relationship: 'ethical_guardrail', explanation: 'Biblical prohibition on usury against the poor informs fair lending rate design in DeFi protocols.' },
  ];

  for (const mapping of crossRefMappings) {
    try {
      // Check for existing cross-reference
      const { data: existing } = await supabase
        .from('biblical_financial_crossref')
        .select('id')
        .eq('biblical_term', mapping.biblicalTerm)
        .eq('financial_term', mapping.financialTerm)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const { error } = await supabase
        .from('biblical_financial_crossref')
        .insert({
          biblical_term: mapping.biblicalTerm,
          financial_term: mapping.financialTerm,
          defi_concept: mapping.defiConcept,
          relationship_type: mapping.relationship,
          explanation: mapping.explanation,
          practical_application: `Apply ${mapping.biblicalTerm} principles through ${mapping.defiConcept} in the BibleFi protocol.`,
        });

      if (error) {
        result.errors.push(`CrossRef insert failed: ${error.message}`);
      } else {
        result.crossRefsCreated++;
      }
    } catch (err) {
      result.errors.push(`CrossRef error: ${(err as Error).message}`);
    }
  }
}
