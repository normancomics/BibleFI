// BWSP – Autonomous Agent Orchestration Loop
// ReAct-style (Reason → Act → Observe → Reflect) self-correcting loop

import { bwspEngine } from './engine';
import type { BWSPQuery, BWSPResponse, BWSPLoopResult } from './types';

const DEFAULT_MAX_ITERATIONS = 4;
const CONFIDENCE_THRESHOLD = 0.75;

export class BWSPAgentLoop {
  async execute(
    query: BWSPQuery,
    maxIterations: number = DEFAULT_MAX_ITERATIONS,
  ): Promise<BWSPLoopResult> {
    let iterations = 0;
    let totalTokensUsed = 0;
    const reflectionNotes: string[] = [];
    let finalResponse: BWSPResponse | null = null;
    let currentQuery: BWSPQuery = { ...query };

    while (iterations < maxIterations) {
      iterations += 1;

      // ── Act ──────────────────────────────────────────────────────────────
      let response: BWSPResponse;
      try {
        response = await bwspEngine.query(currentQuery);
      } catch (err) {
        console.error('[BWSPAgentLoop] query error on iteration', iterations, err);
        reflectionNotes.push(`Iteration ${iterations}: query failed — ${String(err)}`);
        break;
      }

      totalTokensUsed += response.synthesis.tokenCount ?? 0;

      // ── Observe ───────────────────────────────────────────────────────────
      const confidence = response.synthesis.confidenceScore ?? 0;

      // ── Reason & Reflect ──────────────────────────────────────────────────
      if (confidence >= CONFIDENCE_THRESHOLD) {
        reflectionNotes.push(
          `Iteration ${iterations}: confidence ${confidence.toFixed(2)} ≥ threshold — accepting response.`,
        );
        finalResponse = response;
        break;
      }

      const note = `Iteration ${iterations}: confidence ${confidence.toFixed(2)} < ${CONFIDENCE_THRESHOLD} — expanding query for deeper retrieval.`;
      reflectionNotes.push(note);

      // ── Expand query for next iteration ──────────────────────────────────
      // Keep appended context brief to avoid exceeding LLM token limits
      const briefNote = `confidence ${confidence.toFixed(2)} — deeper context needed`;
      const baseText = query.text; // always expand from the original query text
      currentQuery = {
        ...currentQuery,
        text: `${baseText} [iteration ${iterations}: ${briefNote}]`,
      };

      finalResponse = response; // keep best so far
    }

    if (!finalResponse) {
      // Fallback: run once without loop guard
      try {
        finalResponse = await bwspEngine.query(query);
      } catch (err) {
        console.error('[BWSPAgentLoop] fallback query failed', err);
        throw new Error('BWSPAgentLoop: unable to produce a response');
      }
    }

    return {
      iterations,
      totalTokensUsed,
      reflectionNotes,
      finalResponse,
    };
  }
}

export const bwspAgentLoop = new BWSPAgentLoop();
