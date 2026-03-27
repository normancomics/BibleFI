// BWSP – Context Assembler
// Fuses scriptures + DeFi knowledge + live market data into a prompt-ready context block

import type {
  BWSPContext,
  BWSPQuery,
  DefiKnowledgeResult,
  MarketContext,
  ScriptureResult,
} from './types';

export class BWSPContextAssembler {
  assemble(
    query: BWSPQuery,
    scriptures: ScriptureResult[],
    defiKnowledge: DefiKnowledgeResult[],
    marketContext: MarketContext,
  ): BWSPContext {
    return {
      query,
      scriptures,
      defiKnowledge,
      marketContext,
    };
  }

  toPromptContext(context: BWSPContext): string {
    const lines: string[] = [];

    lines.push('=== BIBLICAL WISDOM CONTEXT ===');
    context.scriptures.forEach((s, i) => {
      lines.push(
        `[Scripture ${i + 1}] ${s.reference}: "${s.text}"`,
        `  Principle: ${s.principle}`,
        `  DeFi Application: ${s.defiApplication}`,
      );
    });

    lines.push('');
    lines.push('=== DEFI KNOWLEDGE CONTEXT ===');
    context.defiKnowledge.forEach((d, i) => {
      lines.push(
        `[DeFi ${i + 1}] Topic: ${d.topic}`,
        `  Content: ${d.content}`,
      );
    });

    lines.push('');
    lines.push('=== LIVE MARKET CONTEXT ===');
    lines.push(
      `Fear & Greed Index: ${context.marketContext.fearGreedIndex} (${context.marketContext.fearGreedLabel})`,
      `Biblical Sentiment: ${context.marketContext.biblicalSentiment}`,
    );

    if (context.marketContext.topProtocols.length > 0) {
      lines.push('Top DeFi Protocols:');
      context.marketContext.topProtocols.slice(0, 3).forEach((p) => {
        lines.push(
          `  • ${p.name} — APY: ${p.apy.toFixed(2)}%, Chain: ${p.chain}, Risk: ${p.riskLevel}`,
        );
      });
    }

    lines.push('');
    lines.push('=== USER QUERY ===');
    lines.push(`Query: ${context.query.text}`);
    if (context.query.intent) {
      lines.push(`Intent: ${context.query.intent}`);
    }
    if (context.query.wisdomScore !== undefined) {
      lines.push(`User Wisdom Score: ${context.query.wisdomScore}`);
    }

    return lines.join('\n');
  }
}

export const bwspContextAssembler = new BWSPContextAssembler();
