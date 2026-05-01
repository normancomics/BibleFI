// BWSP – Sovereign Agent
// Orchestrates the 5-step MCP-style agent loop, each step logged as an AgentStep

import { fetchBaseDeFiTVL, getMarketSentiment } from '@/services/liveMarketDataService';
import { bwspContextAssembler } from './contextAssembler';
import { bwspRetriever } from './retriever';
import { bwspSynthesizer } from './synthesizer';
import {
  compositeConfidence,
  detectIntentWithConfidence,
  marketSentimentAlignment,
  scriptureResonanceScore,
  titheConsistencyBlessing,
  wisdomDecay,
} from './wisdomMath';
import type {
  AgentStep,
  BWSPContext,
  BWSPQuery,
  BWSPQueryIntent,
  BWSPResponse,
  BWSPSynthesis,
  MarketContext,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startStep(number: number, name: string): AgentStep {
  return {
    stepNumber: number,
    name,
    status: 'running',
    startedAt: new Date().toISOString(),
  };
}

function completeStep(step: AgentStep, output?: string): AgentStep {
  const completedAt = new Date().toISOString();
  return {
    ...step,
    status: 'completed',
    completedAt,
    durationMs: new Date(completedAt).getTime() - new Date(step.startedAt).getTime(),
    output,
  };
}

function failStep(step: AgentStep, error: string): AgentStep {
  const completedAt = new Date().toISOString();
  return {
    ...step,
    status: 'failed',
    completedAt,
    durationMs: new Date(completedAt).getTime() - new Date(step.startedAt).getTime(),
    error,
  };
}

function buildFallbackMarketContext(): MarketContext {
  return {
    fearGreedIndex: 50,
    fearGreedLabel: 'Neutral',
    biblicalSentiment:
      '"The plans of the diligent lead to profit" (Proverbs 21:5). Exercise measured wisdom.',
    topProtocols: [],
    lastUpdated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// BWSPSovereignAgent
// ---------------------------------------------------------------------------

export class BWSPSovereignAgent {
  async run(query: BWSPQuery): Promise<BWSPResponse> {
    const startTime = Date.now();
    const steps: AgentStep[] = [];

    // -----------------------------------------------------------------------
    // Step 1 – Retrieve scriptures
    // -----------------------------------------------------------------------
    let step1 = startStep(1, 'Retrieve Biblical Scriptures');
    let scriptures = await bwspRetriever.retrieveScriptures(query.text).catch(() => []);
    if (scriptures.length > 0) {
      step1 = completeStep(step1, `Retrieved ${scriptures.length} scripture(s)`);
    } else {
      step1 = failStep(step1, 'Scripture retrieval returned empty; using offline data');
      scriptures = await bwspRetriever.retrieveScriptures(query.text);
    }
    steps.push(step1);

    // -----------------------------------------------------------------------
    // Step 2 – Retrieve DeFi knowledge
    // -----------------------------------------------------------------------
    let step2 = startStep(2, 'Retrieve DeFi Knowledge');
    const defiKnowledge = await bwspRetriever.retrieveDefiKnowledge(query.text).catch(() => []);
    step2 = completeStep(step2, `Retrieved ${defiKnowledge.length} DeFi knowledge item(s)`);
    steps.push(step2);

    // -----------------------------------------------------------------------
    // Step 3 – Fetch live market data
    // -----------------------------------------------------------------------
    let step3 = startStep(3, 'Fetch Live Market Data');
    let marketContext: MarketContext;
    try {
      const [protocols, sentiment] = await Promise.all([fetchBaseDeFiTVL(), getMarketSentiment()]);
      marketContext = {
        fearGreedIndex: sentiment.fearGreedIndex,
        fearGreedLabel: sentiment.label,
        biblicalSentiment: sentiment.biblicalWisdom,
        topProtocols: protocols.map((p) => ({
          name: p.name,
          tvl: p.tvl,
          apy: p.apy,
          chain: p.chain,
          riskLevel: p.riskLevel,
          biblicalAlignment: p.biblicalAlignment,
        })),
        lastUpdated: new Date().toISOString(),
      };
      step3 = completeStep(
        step3,
        `FGI=${sentiment.fearGreedIndex} | ${protocols.length} protocol(s)`,
      );
    } catch (err) {
      marketContext = buildFallbackMarketContext();
      step3 = failStep(step3, `Market data unavailable – using fallback. ${String(err)}`);
    }
    steps.push(step3);

    // -----------------------------------------------------------------------
    // Step 4 – Assemble context
    // -----------------------------------------------------------------------
    let step4 = startStep(4, 'Assemble BWSP Context');
    const context: BWSPContext = bwspContextAssembler.assemble(
      query,
      scriptures,
      defiKnowledge,
      marketContext,
    );
    const promptContext = bwspContextAssembler.toPromptContext(context);
    step4 = completeStep(step4, 'Context assembled successfully');
    steps.push(step4);

    // -----------------------------------------------------------------------
    // Step 5 – Synthesize wisdom
    // -----------------------------------------------------------------------
    let step5 = startStep(5, 'Synthesize Biblical Wisdom');
    let synthesis: BWSPSynthesis;
    try {
      synthesis = await bwspSynthesizer.synthesize(context, promptContext);
      step5 = completeStep(
        step5,
        `Synthesis complete via ${synthesis.synthesisMethod} (confidence: ${synthesis.confidenceScore.toFixed(2)})`,
      );
    } catch (err) {
      synthesis = {
        guidance: 'Wisdom is found in diligent seeking (Proverbs 2:4). Please retry your query.',
        principle: 'Seek wisdom as silver and hidden treasure.',
        action: 'Re-submit your query or check network connectivity.',
        primaryScripture: scriptures[0] ?? {
          reference: 'Proverbs 2:4',
          text: 'If you seek her as silver and search for her as hidden treasure...',
          principle: 'Persistent, earnest seeking yields wisdom.',
          defiApplication: 'Research protocols thoroughly before committing capital.',
          category: 'wisdom',
        },
        supportingScriptures: scriptures.slice(1, 4),
        confidenceScore: 0.5,
        synthesisMethod: 'offline_fallback',
        protocol: 'BWSP-v1.0',
        resonanceScore: 0,
        wisdomDecayFactor: 1,
        titheBlessingMultiplier: 1,
      };
      step5 = failStep(step5, String(err));
    }
    steps.push(step5);

    // -----------------------------------------------------------------------
    // Build final response
    // -----------------------------------------------------------------------
    const processingTimeMs = Date.now() - startTime;

    // ── Advanced BWSP math metrics ───────────────────────────────────────
    // Decay projection: estimate score after DECAY_PROJECTION_DAYS of inactivity
    const DECAY_PROJECTION_DAYS = 30;
    // Tithe streak: 0 consecutive months until BWSPCore/BWSPWisdomRegistry
    // feeds the real streak value via extended query context (future integration point)
    const TITHE_STREAK_MONTHS_FALLBACK = 0;
    const intentResult = detectIntentWithConfidence(query.text);
    const primaryScriptureText = synthesis.primaryScripture?.text ?? '';
    const resonance = scriptureResonanceScore(query.text, primaryScriptureText);
    const sentimentAlign = marketSentimentAlignment(
      marketContext.fearGreedIndex,
      query.intent ?? 'general_wisdom',
    );
    const compositeConf = compositeConfidence(
      intentResult.primaryConfidence,
      resonance,
      sentimentAlign.adjustment,
      query.wisdomScore ?? 0,
    );
    // Wisdom decay: show what the score decays to after DECAY_PROJECTION_DAYS
    const decayFactor = query.wisdomScore
      ? wisdomDecay(query.wisdomScore, DECAY_PROJECTION_DAYS) / Math.max(1, query.wisdomScore)
      : 1;
    const titheBlessingMultiplier = titheConsistencyBlessing(TITHE_STREAK_MONTHS_FALLBACK);

    // Patch synthesis with advanced metrics (take the higher of edge-fn confidence or composite)
    const enrichedSynthesis: BWSPSynthesis = {
      ...synthesis,
      confidenceScore: Math.max(synthesis.confidenceScore, compositeConf),
      resonanceScore: resonance,
      wisdomDecayFactor: decayFactor,
      titheBlessingMultiplier,
    };

    return {
      query,
      context,
      synthesis: enrichedSynthesis,
      agentSteps: steps,
      processingTimeMs,
      timestamp: new Date().toISOString(),
      // Convenience fields
      wisdomGuidance: enrichedSynthesis.guidance,
      financialPrinciple: enrichedSynthesis.principle,
      actionableInsight: enrichedSynthesis.action,
      primaryScripture: enrichedSynthesis.primaryScripture,
      supportingScriptures: enrichedSynthesis.supportingScriptures,
      confidenceScore: enrichedSynthesis.confidenceScore,
      // Intent analysis
      intentConfidence: intentResult.primaryConfidence,
      secondaryIntent: intentResult.secondary,
    };
  }
}

export const bwspSovereignAgent = new BWSPSovereignAgent();
