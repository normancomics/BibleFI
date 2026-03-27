// BWSP – Wisdom Score Tracker
// Upserts wallet-level wisdom scores into Supabase and maps to Stewardship Levels

import { createClient } from '@supabase/supabase-js';
import type { BWSPQuery, BWSPResponse, BWSPQueryIntent, WisdomScore, StewardshipLevel } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function toStewardshipLevel(totalQueries: number): StewardshipLevel {
  if (totalQueries >= 100) return 'Solomon';
  if (totalQueries >= 50) return 'Elder';
  if (totalQueries >= 20) return 'Steward';
  if (totalQueries >= 5) return 'Apprentice';
  return 'Novice';
}

export class WisdomScoreTracker {
  async trackQuery(
    walletAddress: string,
    query: BWSPQuery,
    response: BWSPResponse,
  ): Promise<void> {
    if (!walletAddress) return;

    try {
      // Fetch current record (if any)
      const { data: existing } = await supabase
        .from('wisdom_scores')
        .select('total_queries, avg_confidence_score, dominant_intent')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      const prevQueries: number = existing?.total_queries ?? 0;
      const prevAvg: number = existing?.avg_confidence_score ?? 0;
      const confidence = response.synthesis.confidenceScore ?? 0;

      const newTotal = prevQueries + 1;
      const newAvg = (prevAvg * prevQueries + confidence) / newTotal;

      // Dominant intent tracking: naïve — update if current query intent differs only if confidence is high
      const currentIntent: BWSPQueryIntent = query.intent ?? 'general_wisdom';
      const dominantIntent: BWSPQueryIntent =
        existing?.dominant_intent ?? currentIntent;

      const stewardshipLevel = toStewardshipLevel(newTotal);

      const { error } = await supabase.from('wisdom_scores').upsert(
        {
          wallet_address: walletAddress,
          total_queries: newTotal,
          avg_confidence_score: parseFloat(newAvg.toFixed(4)),
          dominant_intent: dominantIntent,
          stewardship_level: stewardshipLevel,
          last_query_at: new Date().toISOString(),
        },
        { onConflict: 'wallet_address' },
      );

      if (error) {
        console.error('[WisdomScoreTracker] upsert error', error);
      }
    } catch (err) {
      console.error('[WisdomScoreTracker] trackQuery error', err);
    }
  }

  async getScore(walletAddress: string): Promise<WisdomScore | null> {
    if (!walletAddress) return null;

    try {
      const { data, error } = await supabase
        .from('wisdom_scores')
        .select(
          'wallet_address, total_queries, avg_confidence_score, dominant_intent, stewardship_level, last_query_at',
        )
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (error) {
        console.error('[WisdomScoreTracker] getScore error', error);
        return null;
      }

      if (!data) return null;

      return {
        walletAddress: data.wallet_address as string,
        totalQueries: (data.total_queries as number) ?? 0,
        avgConfidenceScore: (data.avg_confidence_score as number) ?? 0,
        dominantIntent: (data.dominant_intent as BWSPQueryIntent) ?? 'general_wisdom',
        stewardshipLevel: (data.stewardship_level as StewardshipLevel) ?? toStewardshipLevel((data.total_queries as number) ?? 0),
        lastQueryAt: (data.last_query_at as string) ?? null,
      };
    } catch (err) {
      console.error('[WisdomScoreTracker] getScore error', err);
      return null;
    }
  }
}

export const wisdomScoreTracker = new WisdomScoreTracker();
