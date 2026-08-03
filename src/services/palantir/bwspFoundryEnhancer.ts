// BWSP Foundry Enhancer
//
// Augments the existing BWSP synthesis pipeline with Palantir Foundry AIP.
//
// Integration points
// ──────────────────
// 1. RETRIEVAL ENHANCEMENT
//    After the standard Supabase pgvector retrieval, this module calls
//    Foundry's semantic search on the Scripture ontology object type.
//    Results are merged and re-ranked using the BWSP authority-weight
//    table (Torah 1.20× … Wisdom 1.35×).
//
// 2. AIP SYNTHESIS
//    The merged scripture set is passed to the BWSPSynthesizeWisdom
//    Foundry Action which runs Claude / GPT-4o with the BWSP system
//    prompt stored in Foundry (D5 dataset).  This produces an
//    "enhanced" guidance string that augments (not replaces) the local
//    synthesizer output.
//
// 3. CONFIDENCE FUSION
//    The final confidence score blends the deterministic BWSP math
//    (resonanceScore, authorityWeightedResonance) with the Foundry AIP
//    model confidence using a tunable α weight.
//
// Usage (opt-in — falls back silently if Foundry is unconfigured)
// ──────────────────────────────────────────────────────────────
//   import { bwspFoundryEnhancer } from '@/services/palantir';
//   const enhanced = await bwspFoundryEnhancer.enhance(bwspResponse);

import type { BWSPQuery, BWSPResponse, BWSPSynthesis, ScriptureResult } from '../bwsp/types';
import { FoundryError, getFoundryClient } from './foundryClient';
import { BWSP_RETRIEVAL_CONTRACT } from './ontology';

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

/** Weight of the Foundry AIP confidence in the fused score (0 = ignore Foundry, 1 = trust only Foundry) */
const AIP_CONFIDENCE_WEIGHT = 0.35;

/** Minimum Foundry AIP confidence to apply enhancement (below this we keep the local result unchanged) */
const MIN_AIP_CONFIDENCE = 0.55;

/** Authority re-rank weights by canon group */
const AUTHORITY: Record<string, number> = {
  genesis: 1.20, exodus: 1.20, leviticus: 1.20, numbers: 1.20, deuteronomy: 1.20, // Torah
  proverbs: 1.35, ecclesiastes: 1.35, job: 1.25, psalms: 1.25,                    // Wisdom
  isaiah: 1.10, jeremiah: 1.10, malachi: 1.15,                                    // Prophets
  matthew: 1.30, mark: 1.25, luke: 1.30, john: 1.30,                              // Gospels
  romans: 1.20, '1 corinthians': 1.20, '2 corinthians': 1.20,                     // Epistles
  '1 timothy': 1.20, '2 timothy': 1.15, james: 1.25,
  revelation: 1.05,
};

function authorityOf(reference: string): number {
  const book = reference.toLowerCase().replace(/\s*\d+:\d+.*/, '').trim();
  return AUTHORITY[book] ?? 1.0;
}

// ────────────────────────────────────────────────────────────────────────────
// BWSPFoundryEnhancer
// ────────────────────────────────────────────────────────────────────────────

export class BWSPFoundryEnhancer {
  /**
   * Enhance a BWSP response with Foundry AIP.
   *
   * - Retrieves additional scriptures from Foundry vector index
   * - Merges and re-ranks the combined scripture set by authority weight
   * - Calls BWSPSynthesizeWisdom AIP action for enhanced guidance
   * - Fuses local and AIP confidence scores
   * - Falls back silently to the original response on any Foundry error
   */
  async enhance(response: BWSPResponse, query: BWSPQuery): Promise<BWSPResponse> {
    try {
      const client = getFoundryClient();

      // ── Step 1: Foundry semantic search ──────────────────────────────────
      const foundryScriptures = await client.semanticSearchScriptures(
        query.text,
        BWSP_RETRIEVAL_CONTRACT.SCRIPTURE_TOP_K,
        { tripleCheckStatus: 'passed' },
      );

      // ── Step 2: Merge with existing local results and re-rank ─────────────
      const localScriptures = [
        response.primaryScripture,
        ...response.supportingScriptures,
      ];

      const merged = this._mergeAndRerank(localScriptures, foundryScriptures);
      const [primary, ...supporting] = merged;

      // ── Step 3: Call BWSPSynthesizeWisdom AIP action ─────────────────────
      const aipResult = await client.bwspSynthesizeWisdom({
        queryText:     query.text,
        intent:        query.intent ?? 'general_wisdom',
        topK:          BWSP_RETRIEVAL_CONTRACT.SCRIPTURE_TOP_K,
        walletAddress: query.walletAddress,
        wisdomScore:   query.wisdomScore,
        riskTolerance: query.riskTolerance,
      });

      // Only apply AIP enhancement if confidence is high enough
      if (aipResult.aipConfidence < MIN_AIP_CONFIDENCE) {
        return response;
      }

      // ── Step 4: Fuse confidence scores ────────────────────────────────────
      const fusedConfidence = this._fuseConfidence(
        response.confidenceScore,
        aipResult.aipConfidence,
      );

      // ── Step 5: Build enhanced response ──────────────────────────────────
      const enhancedSynthesis: BWSPSynthesis = {
        ...response.synthesis,
        guidance:      this._mergeGuidance(response.synthesis.guidance, aipResult.enhancedGuidance),
        principle:     aipResult.enhancedPrinciple || response.synthesis.principle,
        primaryScripture: primary ?? response.primaryScripture,
        supportingScriptures: supporting.slice(0, 4),
        confidenceScore: fusedConfidence,
        synthesisMethod: 'hybrid',
        resonanceScore:  response.synthesis.resonanceScore,
        authorityWeightedResonance: this._computeAuthorityResonance(merged),
        wisdomDecayFactor:         response.synthesis.wisdomDecayFactor,
        titheBlessingMultiplier:   response.synthesis.titheBlessingMultiplier,
        tripleCheck:               response.synthesis.tripleCheck,
        protocol:                  `foundry:${aipResult.foundryModelVersion}`,
      };

      return {
        ...response,
        synthesis:         enhancedSynthesis,
        wisdomGuidance:    enhancedSynthesis.guidance,
        financialPrinciple: enhancedSynthesis.principle,
        primaryScripture:  enhancedSynthesis.primaryScripture,
        supportingScriptures: enhancedSynthesis.supportingScriptures,
        confidenceScore:   fusedConfidence,
        authorityWeightedConfidence: enhancedSynthesis.authorityWeightedResonance,
      };
    } catch (err) {
      if (err instanceof FoundryError) {
        console.warn('[BWSP Foundry] Enhancement unavailable, using local result:', err.message);
        return response;
      }
      // Unexpected error — re-throw
      throw err;
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _mergeAndRerank(
    local: ScriptureResult[],
    foundry: Array<{ reference: string; text: string; similarity: number; strongsNumbers: string[] }>,
  ): ScriptureResult[] {
    // Convert Foundry results to ScriptureResult shape
    const foundryConverted: ScriptureResult[] = foundry.map((f) => ({
      reference: f.reference,
      text: f.text,
      principle: '',
      defiApplication: '',
      category: '',
      similarity: f.similarity,
    }));

    // Deduplicate by reference (prefer Foundry copy for higher-quality text)
    const byRef = new Map<string, ScriptureResult>();
    for (const s of local)           byRef.set(s.reference, s);
    for (const s of foundryConverted) byRef.set(s.reference, { ...byRef.get(s.reference), ...s });

    // Re-rank by authority weight × similarity
    return [...byRef.values()].sort((a, b) => {
      const scoreA = (a.similarity ?? 0.5) * authorityOf(a.reference);
      const scoreB = (b.similarity ?? 0.5) * authorityOf(b.reference);
      return scoreB - scoreA;
    });
  }

  private _fuseConfidence(local: number, aip: number): number {
    const w = AIP_CONFIDENCE_WEIGHT;
    return Math.min(1, local * (1 - w) + aip * w);
  }

  private _mergeGuidance(local: string, aip: string): string {
    if (!aip || aip === local) return local;
    // Prefer AIP guidance if meaningfully longer and non-empty
    return aip.length > local.length * 0.8 ? aip : local;
  }

  private _computeAuthorityResonance(scriptures: ScriptureResult[]): number {
    if (scriptures.length === 0) return 0;
    const weighted = scriptures.map((s) => (s.similarity ?? 0.5) * authorityOf(s.reference));
    const totalWeight = scriptures.map((s) => authorityOf(s.reference)).reduce((a, b) => a + b, 0);
    return weighted.reduce((a, b) => a + b, 0) / totalWeight;
  }
}

export const bwspFoundryEnhancer = new BWSPFoundryEnhancer();
