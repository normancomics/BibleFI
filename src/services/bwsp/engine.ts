// BWSP – Engine
// Single entry point with TF-IDF intent detection + bwspEngine singleton

import { detectIntentWithConfidence } from './wisdomMath';
import { bwspSovereignAgent } from './sovereignAgent';
import type { BWSPQuery, BWSPQueryIntent, BWSPResponse } from './types';

// ---------------------------------------------------------------------------
// Legacy compatibility shim – kept for any code importing detectIntent directly
// ---------------------------------------------------------------------------

/** @deprecated Use detectIntentWithConfidence from wisdomMath instead */
export function detectIntent(queryText: string): BWSPQueryIntent {
  return detectIntentWithConfidence(queryText).primary;
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

    // TF-IDF based intent detection with confidence
    if (!query.intent) {
      const result = detectIntentWithConfidence(query.text);
      query.intent = result.primary;
      // Attach confidence metadata for the sovereign agent to use
      (query as BWSPQuery & { _intentConfidence?: number; _secondaryIntent?: BWSPQueryIntent | null })
        ._intentConfidence = result.primaryConfidence;
      (query as BWSPQuery & { _intentConfidence?: number; _secondaryIntent?: BWSPQueryIntent | null })
        ._secondaryIntent = result.secondary;
    }

    return bwspSovereignAgent.run(query);
  }
}

export const bwspEngine = new BWSPEngine();
