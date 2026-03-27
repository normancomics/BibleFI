// BWSP – Sovereign Agent
// Orchestrates the 5-step MCP-style agent loop, each step logged as an AgentStep

import { fetchBaseDeFiTVL, getMarketSentiment } from '@/services/liveMarketDataService';
import { bwspContextAssembler } from './contextAssembler';
import { bwspRetriever } from './retriever';
import { bwspSynthesizer } from './synthesizer';
import type {
  AgentStep,
  BWSPContext,
  BWSPQuery,
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
      };
      step5 = failStep(step5, String(err));
    }
    steps.push(step5);

    // -----------------------------------------------------------------------
    // Build final response
    // -----------------------------------------------------------------------
    const processingTimeMs = Date.now() - startTime;

    return {
      query,
      context,
      synthesis,
      agentSteps: steps,
      processingTimeMs,
      timestamp: new Date().toISOString(),
      // Convenience fields
      wisdomGuidance: synthesis.guidance,
      financialPrinciple: synthesis.principle,
      actionableInsight: synthesis.action,
      primaryScripture: synthesis.primaryScripture,
      supportingScriptures: synthesis.supportingScriptures,
      confidenceScore: synthesis.confidenceScore,
    };
  }
}

export const bwspSovereignAgent = new BWSPSovereignAgent();
