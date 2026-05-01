// BWSP – Wisdom Math
//
// Advanced mathematical functions for the Biblical-Wisdom-Synthesis-Protocol.
// These algorithms power the quantitative confidence layer that sits beneath
// the LLM synthesis: even when the vector DB or edge function is unavailable,
// the system can still produce a mathematically-grounded confidence estimate.
//
// Functions
// ─────────
// • TF-IDF Intent Confidence Matrix – replaces simple keyword counting
// • Scripture Resonance Score       – cosine-like overlap between query & scripture
// • Wisdom Decay Function           – exponential decay for inactive users
// • Tithe Consistency Blessing      – compound blessing curve (consecutive months)
// • Market Sentiment Alignment      – maps Fear & Greed Index to biblical response

import type { BWSPQueryIntent } from './types';

// ---------------------------------------------------------------------------
// 1. TF-IDF Intent Confidence Matrix
// ---------------------------------------------------------------------------

/**
 * Signal vocabulary for each intent with term-frequency weights.
 * Each word/phrase maps to a weight (1.0 = normal, > 1.0 = high-signal).
 */
const INTENT_VOCABULARY: Record<BWSPQueryIntent, Record<string, number>> = {
  yield_advice: {
    yield: 1.5, apy: 2.0, return: 1.2, earn: 1.3, harvest: 1.8,
    multiply: 1.5, compound: 1.8, interest: 1.2, 'liquidity pool': 1.6,
    staking: 1.4, farm: 1.6, farming: 1.7, profit: 1.3, rewards: 1.4,
    'annual percentage': 2.0, 'yield farming': 2.0,
  },
  risk_assessment: {
    risk: 1.8, safe: 1.4, dangerous: 1.6, 'impermanent loss': 2.0,
    hack: 1.9, rug: 2.0, audit: 1.7, secure: 1.5, protect: 1.4,
    guard: 1.4, caution: 1.5, volatile: 1.6, exposure: 1.3,
    vulnerability: 1.8, exploit: 2.0, rugpull: 2.0,
  },
  tithe_guidance: {
    tithe: 2.0, tithing: 2.0, offering: 1.8, firstfruits: 2.0,
    give: 1.3, giving: 1.4, tenth: 1.8, '10%': 1.5, donate: 1.4,
    charity: 1.4, ministry: 1.6, church: 1.5, firstfruit: 2.0,
    'first fruits': 2.0, malachi: 1.7,
  },
  stewardship_principle: {
    steward: 1.8, stewardship: 2.0, manage: 1.3, faithful: 1.6,
    responsible: 1.4, talent: 1.5, parable: 1.7, entrusted: 1.6,
    budget: 1.3, allocation: 1.4, diversif: 1.5, portfolio: 1.4,
    'matthew 25': 2.0, 'luke 19': 1.8,
  },
  defi_action: {
    swap: 1.8, bridge: 1.5, deposit: 1.6, withdraw: 1.6, approve: 1.5,
    stake: 1.5, unstake: 1.5, claim: 1.4, wrap: 1.4, unwrap: 1.4,
    lend: 1.6, borrow: 1.6, 'how do i': 1.7, 'how to': 1.5,
    transaction: 1.3, gas: 1.3, slippage: 1.6,
  },
  tax_wisdom: {
    tax: 2.0, taxes: 2.0, irs: 2.0, report: 1.5, 'capital gain': 1.9,
    'cost basis': 1.9, taxable: 1.8, 'crypto tax': 2.0, render: 1.4,
    caesar: 1.7, 'tax loss': 1.8, 'tax harvest': 1.8, fifo: 1.7,
  },
  general_wisdom: {
    wisdom: 1.5, guide: 1.2, help: 1.0, advice: 1.2, counsel: 1.4,
    proverbs: 1.5, scripture: 1.5, bible: 1.5, biblical: 1.5,
    pray: 1.3, prayer: 1.3, god: 1.3, lord: 1.3, faith: 1.3,
  },
};

/**
 * Inverse document frequency weights: terms appearing in many intents are
 * down-weighted (they carry less discriminating signal).
 */
function computeIDF(term: string): number {
  let documentCount = 0;
  const intents = Object.values(INTENT_VOCABULARY);
  for (const vocab of intents) {
    if (Object.keys(vocab).some((k) => k.includes(term) || term.includes(k))) {
      documentCount++;
    }
  }
  // Smooth IDF: log( (N+1) / (df+1) ) + 1
  return Math.log((intents.length + 1) / (documentCount + 1)) + 1;
}

/**
 * Compute a TF-IDF weighted confidence score for each intent given a query.
 *
 * For each intent, we accumulate:
 *   score_i = Σ_{matching terms} TF_weight × IDF × termFreq(query, term)
 *
 * where termFreq counts how many times the term appears in the query (with
 * sublinear scaling: 1 + ln(count) to dampen repetition).
 *
 * Returns a map from intent → normalised confidence [0, 1].
 */
export function intentConfidenceMatrix(queryText: string): Map<BWSPQueryIntent, number> {
  const lower = queryText.toLowerCase();
  const rawScores = new Map<BWSPQueryIntent, number>();
  let maxScore = 0;

  for (const [intent, vocab] of Object.entries(INTENT_VOCABULARY) as [BWSPQueryIntent, Record<string, number>][]) {
    let score = 0;

    for (const [term, tfWeight] of Object.entries(vocab)) {
      // Count occurrences (simple)
      let count = 0;
      let pos = lower.indexOf(term);
      while (pos !== -1) {
        count++;
        pos = lower.indexOf(term, pos + 1);
      }
      if (count === 0) continue;

      // Sublinear TF
      const tf = 1 + Math.log(count);
      const idf = computeIDF(term);
      score += tf * idf * tfWeight;
    }

    rawScores.set(intent, score);
    if (score > maxScore) maxScore = score;
  }

  // Normalise to [0, 1]
  const result = new Map<BWSPQueryIntent, number>();
  for (const [intent, score] of rawScores) {
    result.set(intent, maxScore > 0 ? score / maxScore : 0);
  }
  return result;
}

/**
 * Return the best intent and its confidence, plus a secondary intent when
 * the query is genuinely ambiguous (top two within 15 % of each other).
 */
export interface IntentResult {
  primary: BWSPQueryIntent;
  primaryConfidence: number;
  secondary: BWSPQueryIntent | null;
  secondaryConfidence: number;
}

export function detectIntentWithConfidence(queryText: string): IntentResult {
  const matrix = intentConfidenceMatrix(queryText);

  const sorted = [...matrix.entries()].sort((a, b) => b[1] - a[1]);
  const [topIntent, topScore] = sorted[0] ?? ['general_wisdom' as BWSPQueryIntent, 0];
  const [secIntent, secScore] = sorted[1] ?? ['general_wisdom' as BWSPQueryIntent, 0];

  const ambiguous = topScore > 0 && (topScore - secScore) / topScore <= 0.15;

  return {
    primary: topIntent,
    primaryConfidence: topScore,
    secondary: ambiguous ? secIntent : null,
    secondaryConfidence: ambiguous ? secScore : 0,
  };
}

// ---------------------------------------------------------------------------
// 2. Scripture Resonance Score
// ---------------------------------------------------------------------------

/**
 * An offline approximation of cosine similarity between a query and a
 * scripture verse.  We represent each text as a frequency vector over a
 * shared financial keyword vocabulary, then compute:
 *
 *   resonance = dot(q, s) / (|q| · |s|)
 *
 * Result ∈ [0, 1].
 */
const RESONANCE_VOCABULARY = [
  'yield', 'apy', 'return', 'earn', 'harvest', 'compound', 'interest',
  'risk', 'safe', 'audit', 'tithe', 'offering', 'firstfruits', 'give',
  'faithful', 'steward', 'talent', 'multiply', 'diversif', 'wisdom',
  'store', 'grain', 'treasure', 'wealth', 'rich', 'poor', 'diligent',
  'loss', 'gain', 'profit', 'invest', 'capital', 'principal',
];

function textVector(text: string): number[] {
  const lower = text.toLowerCase();
  return RESONANCE_VOCABULARY.map((term) => {
    let count = 0;
    let pos = lower.indexOf(term);
    while (pos !== -1) { count++; pos = lower.indexOf(term, pos + 1); }
    return count > 0 ? 1 + Math.log(count) : 0;
  });
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
}

function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

export function scriptureResonanceScore(queryText: string, scriptureText: string): number {
  const qVec = textVector(queryText);
  const sVec = textVector(scriptureText);
  const mag = magnitude(qVec) * magnitude(sVec);
  if (mag === 0) return 0;
  return Math.min(1, Math.max(0, dotProduct(qVec, sVec) / mag));
}

// ---------------------------------------------------------------------------
// 3. Wisdom Decay Function
// ---------------------------------------------------------------------------

/**
 * A user's wisdom score decays exponentially if they have not been active in
 * BibleFI (no DeFi queries, no tithe events).  This mirrors the parable of
 * the unproductive servant — wisdom not exercised diminishes over time.
 *
 *   W(t) = W₀ · e^(-λ·t)    where  λ = DECAY_LAMBDA  and  t = days inactive
 *
 * DECAY_LAMBDA = 0.005 → half-life ≈ 139 days (wisdom halves after ~4.5 months).
 * FLOOR = 0.4  → even fully inactive users retain 40 % of their wisdom base.
 */
const DECAY_LAMBDA = 0.005;
const WISDOM_FLOOR = 0.4;

export function wisdomDecay(currentScore: number, daysInactive: number): number {
  if (daysInactive <= 0) return currentScore;
  const factor = Math.max(WISDOM_FLOOR, Math.exp(-DECAY_LAMBDA * daysInactive));
  return Math.round(currentScore * factor);
}

// ---------------------------------------------------------------------------
// 4. Tithe Consistency Blessing
// ---------------------------------------------------------------------------

/**
 * Consecutive months of faithful tithing earn an exponential blessing
 * multiplier on BWTYA scores, reflecting Malachi 3:10's promise of
 * overflowing blessing for consistent givers.
 *
 *   blessing(m) = 1 + MAX_BONUS · (1 - e^(-m / TAU))
 *
 * TAU = 6 months: blessing ramps up over the first 6 months, then plateaus.
 * MAX_BONUS = 0.5 → maximum 1.5× multiplier after sustained tithing.
 */
const BLESSING_TAU = 6;    // months for half the bonus to accrue
const BLESSING_MAX = 0.5;  // max additional multiplier above 1.0

export function titheConsistencyBlessing(consecutiveMonths: number): number {
  if (consecutiveMonths <= 0) return 1.0;
  return 1.0 + BLESSING_MAX * (1 - Math.exp(-consecutiveMonths / BLESSING_TAU));
}

// ---------------------------------------------------------------------------
// 5. Market Sentiment Alignment
// ---------------------------------------------------------------------------

/**
 * Maps the Crypto Fear & Greed Index (0–100) to a biblical response weight
 * that adjusts BWSP guidance tone.
 *
 * The biblical principle: "The prudent sees danger and takes refuge, but the
 * simple keep going and pay the penalty" (Proverbs 27:12).
 *
 *   FGI 0–25   (Extreme Fear)   → contrarian: "times of abundance await"
 *   FGI 26–45  (Fear)           → cautious optimism: "test carefully"
 *   FGI 46–55  (Neutral)        → measured stewardship
 *   FGI 56–75  (Greed)          → caution: "pride goes before destruction"
 *   FGI 76–100 (Extreme Greed)  → strong warning: "haste makes poverty"
 *
 * Returns a sentiment adjustment ∈ [-0.3, +0.3] to apply to confidence scores.
 * Positive = market supports the query's bullish intent; negative = caution warranted.
 */
export interface SentimentAlignment {
  adjustment: number;
  tone: 'optimistic' | 'cautious' | 'neutral' | 'warning' | 'alarm';
  biblicalGuidance: string;
}

export function marketSentimentAlignment(fearGreedIndex: number, intent: BWSPQueryIntent): SentimentAlignment {
  const fgi = Math.max(0, Math.min(100, fearGreedIndex));

  if (fgi <= 25) {
    const adj = intent === 'yield_advice' ? 0.2 : 0.05;
    return {
      adjustment: adj,
      tone: 'optimistic',
      biblicalGuidance:
        '"The plans of the diligent lead to profit" (Proverbs 21:5). ' +
        'Market fear creates opportunity for the patient, biblical steward.',
    };
  }
  if (fgi <= 45) {
    return {
      adjustment: 0,
      tone: 'cautious',
      biblicalGuidance:
        '"The prudent sees danger and takes refuge" (Proverbs 27:12). ' +
        'Proceed carefully; test each position with small amounts first.',
    };
  }
  if (fgi <= 55) {
    return {
      adjustment: 0,
      tone: 'neutral',
      biblicalGuidance:
        '"Be sure you know the condition of your flocks" (Proverbs 27:23). ' +
        'Market conditions are balanced; diligent research is the guide.',
    };
  }
  if (fgi <= 75) {
    const adj = intent === 'yield_advice' ? -0.1 : 0;
    return {
      adjustment: adj,
      tone: 'warning',
      biblicalGuidance:
        '"Pride goes before destruction" (Proverbs 16:18). ' +
        'Greed is rising in the market; favour capital preservation over yield-chasing.',
    };
  }
  // Extreme Greed
  const adj = intent === 'yield_advice' ? -0.25 : -0.1;
  return {
    adjustment: adj,
    tone: 'alarm',
    biblicalGuidance:
      '"Whoever hastens to be rich will not go unpunished" (Proverbs 28:20). ' +
      'Extreme market greed historically precedes sharp corrections — protect principal first.',
  };
}

// ---------------------------------------------------------------------------
// 6. Composite BWSP Confidence Score
// ---------------------------------------------------------------------------

/**
 * Fuses multiple signals into a single normalised BWSP confidence score
 * [0, 1] for a given synthesis result.
 *
 * Weights:
 *   40 % – intent confidence (how well the query matched its intent)
 *   30 % – scripture resonance (how relevant the retrieved scripture is)
 *   20 % – market alignment (does market context support the guidance?)
 *   10 % – wisdom score factor (experienced users get slightly higher base confidence)
 */
export function compositeConfidence(
  intentConfidence: number,
  resonance: number,
  sentimentAdjustment: number,
  wisdomScore: number,
): number {
  const intentWeight = 0.40 * intentConfidence;
  const resonanceWeight = 0.30 * resonance;
  const marketWeight = 0.20 * Math.max(0, 0.5 + sentimentAdjustment);
  const wisdomWeight = 0.10 * Math.min(1, wisdomScore / 100);

  return Math.min(1, Math.max(0, intentWeight + resonanceWeight + marketWeight + wisdomWeight));
}

// ---------------------------------------------------------------------------
// 7. Bayesian Wisdom Belief Updater  (Proverbs 18:15)
// ---------------------------------------------------------------------------

/**
 * A user's wisdom score is uncertain — any single observation (a query, a
 * tithe, a BWTYA session) provides noisy evidence about their true underlying
 * wisdom level.  The Bayesian framework treats the wisdom score as a Beta-
 * distributed random variable:
 *
 *   Prior:      WisdomLevel ~ Beta(α₀, β₀)
 *   Likelihood: P(observation | WisdomLevel) = WisdomLevel^obs × (1-WisdomLevel)^(1-obs)
 *   Posterior:  Beta(α₀ + obs, β₀ + 1 - obs)   (conjugate update)
 *
 * We normalise the 0–100 wisdom score to [0, 1] before applying the update,
 * then convert the posterior mean back to the 0–100 scale.
 *
 * Parameters
 * ──────────
 *   α₀  – prior "successes" (starts at 2 for new users — mild optimism)
 *   β₀  – prior "failures"  (starts at 2 — symmetric uncertainty)
 *
 * Each new wisdom observation nudges α and β, producing a posterior that
 * converges toward the true wisdom level as evidence accumulates — exactly
 * as a growing steward is shaped by increasingly rich experience.
 *
 * "The heart of the discerning acquires knowledge,
 *  for the ears of the wise seek it out." — Proverbs 18:15
 */
export interface BayesianWisdomBelief {
  /** Beta distribution α parameter (accumulated "successes") */
  alpha: number;
  /** Beta distribution β parameter (accumulated "failures") */
  beta: number;
  /** Posterior mean wisdom score (0–100) */
  posteriorMean: number;
  /** 95 % credible interval lower bound (0–100) */
  credibleLow: number;
  /** 95 % credible interval upper bound (0–100) */
  credibleHigh: number;
  /** Uncertainty: half-width of credible interval in score points */
  uncertainty: number;
}

/**
 * Initialise a prior belief for a user.
 *
 * @param priorWisdomScore  Starting wisdom score (0–100), or 50 for unknown users
 * @param certainty         How strongly to weight the prior (1 = weak, 10 = strong)
 */
export function initWisdomBelief(
  priorWisdomScore: number,
  certainty = 2,
): BayesianWisdomBelief {
  const mu = Math.max(0.01, Math.min(0.99, priorWisdomScore / 100));
  // Parameterise Beta(α, β) from mean μ and strength:
  //   α = μ × certainty,  β = (1-μ) × certainty
  const alpha = mu * certainty;
  const beta_ = (1 - mu) * certainty;
  return buildBelief(alpha, beta_);
}

/**
 * Update a wisdom belief with a new observation.
 *
 * @param belief          Current Bayesian belief
 * @param observedScore   New wisdom score observation (0–100)
 * @param weight          Observation weight (1 = single data point; higher = stronger evidence)
 */
export function updateWisdomBelief(
  belief: BayesianWisdomBelief,
  observedScore: number,
  weight = 1,
): BayesianWisdomBelief {
  const obs = Math.max(0.001, Math.min(0.999, observedScore / 100));
  // Beta conjugate update:
  //   α' = α + obs × weight
  //   β' = β + (1 - obs) × weight
  const newAlpha = belief.alpha + obs * weight;
  const newBeta  = belief.beta  + (1 - obs) * weight;
  return buildBelief(newAlpha, newBeta);
}

/**
 * Build the summary statistics for a Beta(α, β) distribution.
 *
 * Posterior mean:  E[X] = α / (α + β)
 * Posterior variance: Var[X] = αβ / ((α+β)²(α+β+1))
 *
 * 95 % credible interval approximation using:
 *   mode ± 1.96 × std_dev   (valid when α,β > 1)
 */
function buildBelief(alpha: number, beta_: number): BayesianWisdomBelief {
  const ab = alpha + beta_;
  const mean = alpha / ab;
  const variance = (alpha * beta_) / (ab * ab * (ab + 1));
  const std = Math.sqrt(variance);

  const low  = Math.max(0, mean - 1.96 * std);
  const high = Math.min(1, mean + 1.96 * std);

  return {
    alpha,
    beta: beta_,
    posteriorMean: Math.round(mean * 100),
    credibleLow: Math.round(low * 100),
    credibleHigh: Math.round(high * 100),
    uncertainty: Math.round((high - low) * 50), // half-width in score points
  };
}

// ---------------------------------------------------------------------------
// 8. Authority-Weighted Scripture Resonance  (2 Timothy 3:16)
// ---------------------------------------------------------------------------

/**
 * Different biblical books carry different authority weights for financial
 * and wisdom guidance.  An answer drawn from Proverbs (the quintessential
 * biblical finance manual) should be trusted more than one from a genealogy.
 *
 * The authority weight multiplies the raw cosine-resonance score, boosting
 * guidance confidence when the most authoritative financial scriptures are cited.
 *
 * "All scripture is God-breathed and is useful for teaching, rebuking,
 *  correcting and training in righteousness." — 2 Timothy 3:16
 * (All scripture has authority; these weights reflect *domain relevance*.)
 *
 * Weight scale: 1.0 = baseline, 2.0 = strongest financial authority.
 */
const BOOK_AUTHORITY_WEIGHTS: Record<string, number> = {
  // Wisdom & financial instruction (highest)
  proverbs: 2.0,
  ecclesiastes: 1.9,
  'song of solomon': 1.1,
  job: 1.3,
  psalms: 1.2,

  // New Testament financial parables (very high)
  matthew: 1.8,  // Parable of the Talents
  luke: 1.7,     // Parable of the Minas, Prodigal Son
  james: 1.6,    // Warning about wealth

  // Prophetic financial instruction
  malachi: 1.8,  // Tithing (Malachi 3:10)
  haggai: 1.5,   // Financial priorities
  zechariah: 1.3,

  // Torah economic law
  deuteronomy: 1.6, // Economic Sabbath, gleaning laws
  leviticus: 1.5,   // Jubilee, debt
  numbers: 1.2,

  // Historical wisdom
  genesis: 1.4,  // Joseph's economic plan (Gen 41)
  '1 kings': 1.4, // Solomon's wealth
  '2 chronicles': 1.3,

  // New Testament doctrine
  '1 timothy': 1.4, // "love of money is a root of all evil"
  '2 corinthians': 1.5, // Generous giving
  philippians: 1.3,
  hebrews: 1.2,
  romans: 1.2,

  // Default for unlisted books
  _default: 1.0,
};

/**
 * Extract the book name from a scripture reference string.
 * Handles formats like "Proverbs 3:9", "1 Kings 3:12", "Ecclesiastes 11:2".
 */
function extractBookName(reference: string): string {
  // Pattern breakdown:
  //   (\d+\s+)?    – optional leading book number (e.g. "1 " in "1 Kings")
  //   ([A-Za-z\s]+?)  – book name words (non-greedy to stop before chapter)
  //   (?:\s+\d+[:]\d+|$)  – chapter:verse anchor or end-of-string
  const match = reference.match(/^(\d+\s+)?([A-Za-z\s]+?)(?:\s+\d+[:]\d+|$)/);
  return match ? match[0].replace(/\s*\d+[:]\d+.*$/, '').toLowerCase().trim() : '_default';
}

/**
 * Returns the canonical authority weight for a scripture reference.
 */
export function getBookAuthorityWeight(scriptureReference: string): number {
  const bookName = extractBookName(scriptureReference);
  // Check for partial match (e.g. "matthew" in "matthew 25:14")
  for (const [book, weight] of Object.entries(BOOK_AUTHORITY_WEIGHTS)) {
    if (book !== '_default' && bookName.includes(book)) {
      return weight;
    }
  }
  return BOOK_AUTHORITY_WEIGHTS['_default'];
}

/**
 * Authority-weighted scripture resonance: raw cosine resonance × book authority.
 *
 * Result is re-normalised to [0, 1] so it remains a valid probability-like score.
 * A Proverbs verse with 0.7 raw resonance scores: 0.7 × 2.0 / 2.0 = 0.7 (unchanged max)
 * A genealogy verse with 0.7 raw resonance scores: 0.7 × 1.0 / 2.0 = 0.35
 *
 * MAX_AUTHORITY = 2.0 (Proverbs, the highest-authority financial book).
 */
const MAX_AUTHORITY = 2.0;

export function authorityWeightedResonance(
  rawResonance: number,
  scriptureReference: string,
): number {
  const authority = getBookAuthorityWeight(scriptureReference);
  return Math.min(1, Math.max(0, (rawResonance * authority) / MAX_AUTHORITY));
}

