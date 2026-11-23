// BWSP – Synthesizer
// Calls the enhanced-biblical-advisor Supabase edge function with offline fallback synthesis

import { supabase } from '@/integrations/supabase/client';
import { hasSupabaseSession } from './session';
import type { BWSPContext, BWSPSynthesis, ScriptureResult } from './types';

function buildOfflineSynthesis(): BWSPSynthesis {
  return {
    answerable: false,
    guidance: 'A sourced answer could not be generated. Sign in and retry when reviewed sources and the advisor are available.',
    principle: '',
    action: '',
    defiSuggestions: 'No DeFi suggestion is provided without a reviewed official source.',
    primaryScripture: {
      reference: '',
      text: '',
      principle: '',
      defiApplication: '',
      category: '',
    },
    supportingScriptures: [],
    sourceCitations: [],
    disclaimer: 'Educational information only, not financial, investment, tax, or legal advice. Scripture interpretation is not authoritative.',
    riskNotice: 'DeFi involves substantial risks, including loss of funds, smart-contract vulnerabilities, liquidation, liquidity limits, and changing market conditions.',
    confidenceScore: 0,
    synthesisMethod: 'offline_fallback',
    protocol: 'BWSP-v1.0',
    resonanceScore: 0,
    authorityWeightedResonance: 0,
    wisdomDecayFactor: 1,
    titheBlessingMultiplier: 1,
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
      // Signed-out visitors cannot call the protected agent.
      if (!(await hasSupabaseSession())) return buildOfflineSynthesis();

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

      const citations = Array.isArray(data.citations) ? data.citations : [];
      const scriptureCitations = citations.filter(
        (citation: { type?: string }) => citation.type === 'scripture',
      );
      const primaryCitation = scriptureCitations[0];
      const primaryScripture: ScriptureResult = primaryCitation
        ? {
            reference: primaryCitation.reference,
            text: primaryCitation.text ?? '',
            principle: '',
            defiApplication: '',
            category: 'reviewed',
            translation: primaryCitation.translation,
          }
        : { reference: '', text: '', principle: '', defiApplication: '', category: '' };

      return {
        answerable: data.answerable === true,
        guidance: data.guidance ?? '',
        principle: data.principle ?? '',
        action: data.action ?? '',
        defiSuggestions: data.defiSuggestions ?? '',
        primaryScripture,
        supportingScriptures: scriptureCitations.slice(1).map(
          (citation: { reference: string; text?: string; translation?: 'KJV' | 'WEB' }) => ({
            reference: citation.reference,
            text: citation.text ?? '',
            principle: '',
            defiApplication: '',
            category: 'reviewed',
            translation: citation.translation,
          }),
        ),
        sourceCitations: citations,
        disclaimer: data.disclaimer ?? '',
        riskNotice: data.riskNotice ?? '',
        confidenceScore: data.confidenceScore ?? 0,
        synthesisMethod: (data.synthesisMethod as BWSPSynthesis['synthesisMethod']) ?? 'rag_vector',
        protocol: data.protocol ?? 'BWSP-v1.0',
        tokenCount: data.tokenCount,
        // Advanced metrics — computed by sovereignAgent after this returns
        resonanceScore: 0,
        authorityWeightedResonance: 0,
        wisdomDecayFactor: 1,
        titheBlessingMultiplier: 1,
      };
    } catch {
      return buildOfflineSynthesis();
    }
  }
}

export const bwspSynthesizer = new BWSPSynthesizer();
