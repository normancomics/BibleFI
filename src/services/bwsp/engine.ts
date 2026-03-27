// BWSP – Engine
// Single entry point with auto-intent detection + bwspEngine singleton

import { bwspSovereignAgent } from './sovereignAgent';
import type { BWSPQuery, BWSPQueryIntent, BWSPResponse } from './types';

// ---------------------------------------------------------------------------
// Intent detection – keyword-based classifier (7 categories)
// ---------------------------------------------------------------------------

const INTENT_SIGNALS: Record<BWSPQueryIntent, string[]> = {
  yield_advice: [
    'yield', 'apy', 'return', 'earn', 'harvest', 'multiply', 'compound', 'interest',
    'liquidity pool', 'staking', 'farm', 'farming', 'profit',
  ],
  risk_assessment: [
    'risk', 'safe', 'dangerous', 'impermanent loss', 'hack', 'rug', 'audit', 'secure',
    'protect', 'guard', 'caution', 'volatile', 'exposure',
  ],
  tithe_guidance: [
    'tithe', 'tithing', 'offering', 'firstfruits', 'give', 'giving', 'tenth', '10%',
    'donate', 'charity', 'ministry', 'church',
  ],
  stewardship_principle: [
    'steward', 'stewardship', 'manage', 'faithful', 'responsible', 'talent', 'parable',
    'entrusted', 'budget', 'allocation', 'diversif',
  ],
  defi_action: [
    'swap', 'bridge', 'deposit', 'withdraw', 'approve', 'stake', 'unstake', 'claim',
    'wrap', 'unwrap', 'lend', 'borrow', 'how do i', 'how to',
  ],
  tax_wisdom: [
    'tax', 'taxes', 'irs', 'report', 'capital gain', 'cost basis', 'taxable',
    'crypto tax', 'render', 'caesar',
  ],
  general_wisdom: [],
};

export function detectIntent(queryText: string): BWSPQueryIntent {
  const lower = queryText.toLowerCase();
  let bestIntent: BWSPQueryIntent = 'general_wisdom';
  let bestScore = 0;

  for (const [intent, signals] of Object.entries(INTENT_SIGNALS) as [BWSPQueryIntent, string[]][]) {
    if (intent === 'general_wisdom') continue;
    const score = signals.filter((s) => lower.includes(s)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

// ---------------------------------------------------------------------------
// BWSPEngine
// ---------------------------------------------------------------------------

export class BWSPEngine {
  async query(input: BWSPQuery | string): Promise<BWSPResponse> {
    const query: BWSPQuery =
      typeof input === 'string'
        ? { text: input }
        : input;

    // Auto-detect intent if not supplied
    if (!query.intent) {
      query.intent = detectIntent(query.text);
    }

    return bwspSovereignAgent.run(query);
  }
}

export const bwspEngine = new BWSPEngine();
