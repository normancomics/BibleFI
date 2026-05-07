/**
 * AttestationProvider — abstraction over the source of theological attestations.
 *
 * Today: backed by Supabase `theological_attestations` table (DB provider).
 * Tomorrow: swap to on-chain ERC-8004 registry without touching callers.
 */
import { supabase } from '@/integrations/supabase/client';

export type AttestationClass = 'A_theological' | 'B_ministry' | 'C_creator';

export interface Attestation {
  id: string;
  attesterName: string;
  attesterAddress: string;
  class: AttestationClass;
  poolName: string;
  strategyId: string;
  scriptureReference: string;
  rationale: string;
  weight: number;
  attestationHash: string;
  validUntil: string | null;
  revoked: boolean;
}

export interface AttestationProvider {
  getActive(poolName: string, strategyId: string, cls?: AttestationClass): Promise<Attestation | null>;
}

class SupabaseAttestationProvider implements AttestationProvider {
  async getActive(
    poolName: string,
    strategyId: string,
    cls: AttestationClass = 'A_theological',
  ): Promise<Attestation | null> {
    const { data, error } = await supabase
      .from('theological_attestations')
      .select('*')
      .eq('pool_name', poolName)
      .eq('strategy_id', strategyId)
      .eq('attestation_class', cls)
      .eq('revoked', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      attesterName: data.attester_name,
      attesterAddress: data.attester_address,
      class: data.attestation_class as AttestationClass,
      poolName: data.pool_name,
      strategyId: data.strategy_id,
      scriptureReference: data.scripture_reference,
      rationale: data.rationale,
      weight: Number(data.weight),
      attestationHash: data.attestation_hash,
      validUntil: data.valid_until,
      revoked: data.revoked,
    };
  }
}

export const attestationProvider: AttestationProvider = new SupabaseAttestationProvider();