// BWSP – Synthesizer
// Calls the enhanced-biblical-advisor Supabase edge function with offline fallback synthesis

import { supabase } from '@/integrations/supabase/client';
import type { BWSPContext, BWSPSynthesis, ScriptureResult } from './types';

// ---------------------------------------------------------------------------
// Offline fallback synthesis by intent
// ---------------------------------------------------------------------------

interface FallbackSynthesis {
  guidance: string;
  principle: string;
  action: string;
}

const OFFLINE_BY_INTENT: Record<string, FallbackSynthesis> = {
  yield_advice: {
    guidance:
      'Scripture calls us to be faithful stewards of the talents we receive (Matthew 25:14-30). ' +
      'Seek protocols with a proven track record, transparent smart contracts, and sustainable APY — ' +
      'not those promising overnight wealth (Proverbs 28:22).',
    principle: 'Faithful stewardship multiplies; reckless speculation diminishes.',
    action:
      'Allocate capital across 2–3 audited, low-risk protocols. Reserve 10% as a tithe before compounding rewards.',
  },
  risk_assessment: {
    guidance:
      'Prudence guards against sudden loss (Proverbs 27:12). Evaluate every DeFi position ' +
      'by its audit history, team transparency, and TVL stability before committing.',
    principle: 'The prudent sees danger and hides; the simple pass on and are punished.',
    action:
      'Review smart-contract audits, check protocol insurance options, and never invest more than you can lose.',
  },
  tithe_guidance: {
    guidance:
      '"Honour the LORD with your wealth, with the firstfruits of all your crops" (Proverbs 3:9). ' +
      'On-chain tithing allows you to route a biblical 10% automatically to your chosen ministry wallet.',
    principle: 'The firstfruits belong to the Lord; the rest flows with His blessing.',
    action:
      'Configure a Superfluid stream or wallet split to send 10% of each yield harvest to your church or charity wallet.',
  },
  stewardship_principle: {
    guidance:
      'Good stewardship means growing what you have been given for the Master\'s return (Luke 19:13). ' +
      'Diversify across asset classes, maintain liquidity, and document every position.',
    principle: 'Stewards are accountable for both growth and preservation of entrusted resources.',
    action: 'Build a diversified portfolio: liquid stablecoins, yield-bearing positions, and an emergency reserve.',
  },
  defi_action: {
    guidance:
      'Before taking any DeFi action, count the cost (Luke 14:28). Simulate the transaction, ' +
      'review the contract address on-chain, and ensure you understand the fee structure.',
    principle: 'Wisdom begins with understanding all terms and conditions before signing.',
    action:
      'Use a block explorer to verify the contract, simulate with a small test amount, then proceed with your full position.',
  },
  tax_wisdom: {
    guidance:
      '"Render to Caesar what is Caesar\'s" (Matthew 22:21). Track every on-chain transaction ' +
      'with its USD value at time of receipt for accurate tax reporting.',
    principle: 'Integrity in taxation reflects our broader commitment to honesty before God and man.',
    action:
      'Export transaction history monthly, record cost-basis for each token lot, and consult a crypto-literate CPA annually.',
  },
  general_wisdom: {
    guidance:
      '"The plans of the diligent lead to profit as surely as haste leads to poverty" (Proverbs 21:5). ' +
      'Approach every financial decision with prayer, research, and counsel.',
    principle: 'Wisdom, patience, and diligence are the foundations of lasting financial health.',
    action: 'Set a weekly financial review cadence: check positions, tithe allocation, and wisdom score progress.',
  },
};

function buildOfflineSynthesis(context: BWSPContext): BWSPSynthesis {
  const intent = context.query.intent ?? 'general_wisdom';
  const fallback = OFFLINE_BY_INTENT[intent] ?? OFFLINE_BY_INTENT.general_wisdom;

  const primaryScripture: ScriptureResult = context.scriptures[0] ?? {
    reference: 'Proverbs 3:9',
    text: 'Honour the LORD with your wealth, with the firstfruits of all your crops.',
    principle: 'Prioritise giving to God from your first and best.',
    defiApplication: 'Allocate tithe from yield before compounding.',
    category: 'stewardship',
  };

  return {
    guidance: fallback.guidance,
    principle: fallback.principle,
    action: fallback.action,
    primaryScripture,
    supportingScriptures: context.scriptures.slice(1, 4),
    confidenceScore: 0.72,
    synthesisMethod: 'offline_fallback',
    protocol: 'BWSP-v1.0',
  };
}

// ---------------------------------------------------------------------------
// BWSPSynthesizer
// ---------------------------------------------------------------------------

export class BWSPSynthesizer {
  async synthesize(
    context: BWSPContext,
    promptContext: string,
  ): Promise<BWSPSynthesis> {
    try {
      const { data, error } = await supabase.functions.invoke('bwsp-sovereign-agent', {
        body: {
          query: context.query.text,
          intent: context.query.intent,
          context: promptContext,
          wisdomScore: context.query.wisdomScore,
          walletAddress: context.query.walletAddress,
        },
      });

      if (error || !data) throw new Error('Edge function failed');

      return {
        guidance: data.guidance ?? '',
        principle: data.principle ?? '',
        action: data.action ?? '',
        primaryScripture: context.scriptures[0] ?? {
          reference: data.primaryScripture ?? 'Proverbs 3:9',
          text: '',
          principle: '',
          defiApplication: '',
          category: '',
        },
        supportingScriptures: context.scriptures.slice(1, 4),
        confidenceScore: data.confidenceScore ?? 0.8,
        synthesisMethod: (data.synthesisMethod as BWSPSynthesis['synthesisMethod']) ?? 'rag_vector',
        protocol: data.protocol ?? 'BWSP-v1.0',
        tokenCount: data.tokenCount,
      };
    } catch {
      return buildOfflineSynthesis(context);
    }
  }
}

export const bwspSynthesizer = new BWSPSynthesizer();
