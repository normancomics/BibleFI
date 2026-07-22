import type { SpandexScoredQuote } from './types';

export interface BiblicalRoutePolicyConfig {
  maxRiskScore: number;
  maxWarningFlags: number;
  requireAudited: boolean;
  requireVerified: boolean;
  requireTransparent: boolean;
  blockedKeywords: string[];
}

export interface BiblicalRoutePolicyEvaluation {
  pass: boolean;
  reasons: string[];
}

const DEFAULT_POLICY: BiblicalRoutePolicyConfig = {
  maxRiskScore: 35,
  maxWarningFlags: 2,
  requireAudited: true,
  requireVerified: true,
  requireTransparent: true,
  blockedKeywords: ['gambling', 'casino', 'ponzi', 'rug', 'memecoin', 'highly speculative'],
};

export function evaluateBiblicalRoutePolicy(
  quote: SpandexScoredQuote,
  override?: Partial<BiblicalRoutePolicyConfig>,
): BiblicalRoutePolicyEvaluation {
  const policy = { ...DEFAULT_POLICY, ...override };
  const reasons: string[] = [];

  if (quote.opportunity.riskScore > policy.maxRiskScore) {
    reasons.push(`Risk score ${quote.opportunity.riskScore} exceeds cap ${policy.maxRiskScore}`);
  }
  if (policy.requireAudited && !quote.opportunity.audited) {
    reasons.push('Route is unaudited');
  }
  if (policy.requireVerified && !quote.opportunity.isVerified) {
    reasons.push('Route is unverified');
  }
  if (policy.requireTransparent && !quote.opportunity.transparent) {
    reasons.push('Route lacks transparency evidence');
  }
  if (quote.scored.warningFlags.length > policy.maxWarningFlags) {
    reasons.push(
      `Warning flags (${quote.scored.warningFlags.length}) exceed allowed ${policy.maxWarningFlags}`,
    );
  }

  const text = `${quote.opportunity.biblicalAlignment} ${quote.opportunity.category}`.toLowerCase();
  const matchedKeyword = policy.blockedKeywords.find((kw) => text.includes(kw));
  if (matchedKeyword) {
    reasons.push(`Blocked by policy keyword: ${matchedKeyword}`);
  }

  return { pass: reasons.length === 0, reasons };
}

