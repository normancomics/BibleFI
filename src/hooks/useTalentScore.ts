import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TalentCredential {
  name: string;
  slug: string;
  category: string;
  points: number;
  max_score: number;
  readable_value: string;
  uom: string;
  description: string;
  data_issuer_name: string;
  last_calculated_at: string | null;
}

export interface TalentScoreData {
  found: boolean;
  talent_score: number;
  rank_position: number | null;
  builder_tier: 'Novice' | 'Apprentice' | 'Journeyman' | 'Master' | 'Grandmaster';
  multiplier: number;
  description: string;
  last_calculated_at: string | null;
  credentials_count: number;
  credentials: TalentCredential[];
  message?: string;
}

export function useTalentScore() {
  const [data, setData] = useState<TalentScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('talent-score', {
        body: { wallet_address: walletAddress },
      });

      if (fnError) throw new Error(fnError.message);
      setData(result as TalentScoreData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch builder score');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchScore };
}
