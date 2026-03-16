import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

/**
 * Sync Knowledge Base Sub-Agent
 * 
 * Continuously discovers verses in comprehensive_biblical_texts that are missing
 * from biblical_knowledge_base and syncs them with proper categorization.
 * 
 * "The entrance of thy words giveth light; it giveth understanding unto the simple."
 * - Psalm 119:130
 * 
 * Modes:
 * - sync: Find and insert missing verses into biblical_knowledge_base
 * - status: Report sync stats
 * - enrich: Update existing knowledge base entries with better categorization
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Category mapping based on financial keywords
const CATEGORY_MAP: Record<string, string[]> = {
  'tithing': ['tithe', 'tenth', 'firstfruits', 'offering', 'give', 'giving', 'generous', 'generosity'],
  'stewardship': ['steward', 'faithful', 'manage', 'trust', 'entrust', 'talent', 'servant', 'master'],
  'debt_management': ['debt', 'borrow', 'lend', 'surety', 'owe', 'creditor', 'pledge', 'interest', 'usury'],
  'wealth_building': ['rich', 'wealth', 'prosper', 'increase', 'multiply', 'profit', 'gain', 'diligent', 'labor', 'work'],
  'savings_investment': ['save', 'store', 'treasure', 'invest', 'seed', 'sow', 'reap', 'harvest', 'barn', 'reserve'],
  'contentment': ['content', 'enough', 'satisfy', 'peace', 'godliness', 'sufficiency'],
  'divine_provision': ['provide', 'provision', 'supply', 'need', 'daily bread', 'manna', 'glory'],
  'tax_compliance': ['tax', 'tribute', 'caesar', 'render', 'customs', 'duty'],
  'justice_ethics': ['just', 'justice', 'fair', 'honest', 'scales', 'measure', 'oppression', 'bribe', 'fraud'],
  'wisdom_planning': ['wisdom', 'wise', 'plan', 'counsel', 'prudent', 'understanding', 'knowledge', 'instruction'],
  'poverty_charity': ['poor', 'needy', 'charity', 'alms', 'widow', 'orphan', 'compassion', 'mercy'],
  'divine_ownership': ['earth', 'LORD', 'mine', 'ownership', 'sovereign', 'silver', 'gold', 'fullness'],
};

function categorizeVerse(kjvText: string, keywords: string[]): string {
  const text = kjvText.toLowerCase();
  const allTerms = [...keywords.map(k => k.toLowerCase()), ...text.split(/\s+/)];
  
  let bestCategory = 'stewardship'; // default
  let bestScore = 0;
  
  for (const [category, terms] of Object.entries(CATEGORY_MAP)) {
    let score = 0;
    for (const term of terms) {
      if (allTerms.some(t => t.includes(term))) score++;
      if (text.includes(term)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

function generatePrinciple(category: string, kjvText: string): string {
  const principles: Record<string, string> = {
    'tithing': 'Honor God with the first portion of your increase as an act of faith and obedience',
    'stewardship': 'Manage resources faithfully as a trustee of God\'s provisions',
    'debt_management': 'Exercise wisdom in financial obligations; avoid entangling commitments',
    'wealth_building': 'Diligent and honest labor produces sustainable increase',
    'savings_investment': 'Store wisely for future needs while trusting God for daily provision',
    'contentment': 'True wealth comes from godliness with contentment, not accumulation',
    'divine_provision': 'God provides for every genuine need according to His boundless resources',
    'tax_compliance': 'Fulfill civic financial obligations as an expression of good citizenship',
    'justice_ethics': 'Conduct all financial dealings with honesty, fairness, and integrity',
    'wisdom_planning': 'Seek divine wisdom before making financial decisions',
    'poverty_charity': 'Care for the vulnerable as an expression of God\'s character',
    'divine_ownership': 'Recognize that all wealth belongs to God; we are stewards, not owners',
  };
  return principles[category] || 'Apply biblical wisdom to financial stewardship';
}

function generateApplication(category: string): string {
  const apps: Record<string, string> = {
    'tithing': 'Set up automated tithe streams via Superfluid to ensure consistent firstfruits giving',
    'stewardship': 'Use BibleFi dashboard to track and optimize your stewardship portfolio',
    'debt_management': 'Review lending/borrowing positions through the biblical debt-freedom lens',
    'wealth_building': 'Invest in faith-aligned DeFi pools that reward diligent, patient participation',
    'savings_investment': 'Stake stablecoins in low-risk pools as a modern digital storehouse',
    'contentment': 'Set financial goals based on needs, not greed; use wisdom score as guide',
    'divine_provision': 'Trust in God\'s provision while being a responsible steward of resources',
    'tax_compliance': 'Use the Render Unto Caesar tax module for compliant crypto reporting',
    'justice_ethics': 'Only use verified, audited DeFi protocols; avoid exploitative opportunities',
    'wisdom_planning': 'Consult the Biblical Advisor AI before making significant financial moves',
    'poverty_charity': 'Allocate a portion of DeFi yields to charitable giving via Veil.cash for privacy',
    'divine_ownership': 'Remember all gains come from God; tithe from profits as acknowledgment',
  };
  return apps[category] || 'Apply this principle through BibleFi\'s guided financial tools';
}

function generateDefiRelevance(category: string): string {
  const relevance: Record<string, string> = {
    'tithing': 'Superfluid streaming enables per-second automated tithing with near-zero fees',
    'stewardship': 'DeFi protocols reward faithful management with transparent, auditable yields',
    'debt_management': 'Lending protocols (Aave, Compound) require careful leverage management',
    'wealth_building': 'Yield farming and liquidity provision create sustainable digital income streams',
    'savings_investment': 'Stablecoin staking provides low-risk returns exceeding traditional savings',
    'contentment': 'Avoid FOMO-driven trading; stick to wisdom-scored investment strategies',
    'divine_provision': 'Base chain\'s low fees ensure more of your giving reaches its destination',
    'tax_compliance': 'On-chain transparency simplifies tax documentation and IRS compliance',
    'justice_ethics': 'Smart contract audits and transparent governance prevent financial manipulation',
    'wisdom_planning': 'BWSP Oracle evaluates investments against biblical principles before execution',
    'poverty_charity': 'ZK-private donations via Veil.cash honor Matthew 6:3 anonymous giving',
    'divine_ownership': 'Blockchain immutability reflects God\'s unchanging financial principles',
  };
  return relevance[category] || 'Connects biblical financial wisdom to modern DeFi infrastructure';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') || 'sync';

    if (mode === 'status') {
      const { count: compCount } = await supabase
        .from('comprehensive_biblical_texts')
        .select('*', { count: 'exact', head: true });
      
      const { count: kbCount } = await supabase
        .from('biblical_knowledge_base')
        .select('*', { count: 'exact', head: true });

      return new Response(JSON.stringify({
        comprehensive_texts: compCount,
        knowledge_base: kbCount,
        status: 'ready',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'sync') {
      // Fetch all comprehensive texts
      const { data: compTexts, error: compErr } = await supabase
        .from('comprehensive_biblical_texts')
        .select('book, chapter, verse, kjv_text, hebrew_text, greek_text, strong_numbers, financial_keywords')
        .order('book')
        .order('chapter')
        .order('verse');

      if (compErr) throw compErr;

      // Fetch all existing knowledge base references
      const { data: kbEntries, error: kbErr } = await supabase
        .from('biblical_knowledge_base')
        .select('reference');

      if (kbErr) throw kbErr;

      const existingRefs = new Set((kbEntries || []).map(e => e.reference));
      
      const missing: any[] = [];
      const synced: string[] = [];
      const errors: string[] = [];

      for (const verse of (compTexts || [])) {
        const ref = `${verse.book} ${verse.chapter}:${verse.verse}`;
        
        // Check if already exists (exact or partial match)
        const exists = [...existingRefs].some(r => r.startsWith(ref) || ref.startsWith(r.split('-')[0]));
        if (exists) continue;

        const keywords = verse.financial_keywords || [];
        const category = categorizeVerse(verse.kjv_text, keywords);
        
        const entry = {
          reference: ref,
          verse_text: verse.kjv_text,
          category,
          principle: generatePrinciple(category, verse.kjv_text),
          application: generateApplication(category),
          defi_relevance: generateDefiRelevance(category),
          financial_keywords: keywords,
        };

        missing.push(entry);
      }

      // Insert missing entries
      if (missing.length > 0) {
        for (const entry of missing) {
          const { error: insertErr } = await supabase
            .from('biblical_knowledge_base')
            .insert(entry);

          if (insertErr) {
            errors.push(`${entry.reference}: ${insertErr.message}`);
          } else {
            synced.push(entry.reference);
          }
        }
      }

      return new Response(JSON.stringify({
        mode: 'sync',
        found_missing: missing.length,
        synced: synced.length,
        synced_refs: synced,
        errors,
        message: missing.length === 0 
          ? '✅ All comprehensive texts are already in the knowledge base!' 
          : `✅ Synced ${synced.length}/${missing.length} verses to biblical_knowledge_base`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'enrich') {
      // Enrich existing entries that have empty principle/application/defi_relevance
      const { data: entries, error } = await supabase
        .from('biblical_knowledge_base')
        .select('id, reference, verse_text, category, principle, application, defi_relevance, financial_keywords')
        .or('principle.is.null,application.is.null,defi_relevance.is.null');

      if (error) throw error;

      let enriched = 0;
      const enrichErrors: string[] = [];

      for (const entry of (entries || [])) {
        const keywords = entry.financial_keywords || [];
        const category = entry.category || categorizeVerse(entry.verse_text, keywords);
        
        const updates: Record<string, string> = {};
        if (!entry.principle) updates.principle = generatePrinciple(category, entry.verse_text);
        if (!entry.application) updates.application = generateApplication(category);
        if (!entry.defi_relevance) updates.defi_relevance = generateDefiRelevance(category);
        if (!entry.category || entry.category === 'stewardship') {
          const newCat = categorizeVerse(entry.verse_text, keywords);
          if (newCat !== 'stewardship' || !entry.category) updates.category = newCat;
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateErr } = await supabase
            .from('biblical_knowledge_base')
            .update(updates)
            .eq('id', entry.id);

          if (updateErr) {
            enrichErrors.push(`${entry.reference}: ${updateErr.message}`);
          } else {
            enriched++;
          }
        }
      }

      return new Response(JSON.stringify({
        mode: 'enrich',
        candidates: (entries || []).length,
        enriched,
        errors: enrichErrors,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid mode. Use: sync, status, enrich' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
