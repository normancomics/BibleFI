/**
 * Church NFT badges — reads the badge NFT held by a church's own published
 * Base wallet, via the server-side OpenSea proxy (the key never reaches the
 * browser).
 *
 * "Let your light so shine before men" — Matthew 5:16 (KJV)
 */
import { supabase } from '@/integrations/supabase/client';

export interface ChurchNftBadge {
  address: string;
  name: string | null;
  collection: string | null;
  image_url: string | null;
  opensea_url: string | null;
  contract: string | null;
  token_id: string | null;
  nft_count: number;
}

const cache = new Map<string, ChurchNftBadge | null>();

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Fetch badges for a set of church giving wallets. Returns a map keyed by the
 * lowercased address. Failures resolve to an empty map — a missing badge must
 * never block giving.
 */
export async function fetchChurchNftBadges(
  addresses: string[],
): Promise<Record<string, ChurchNftBadge | null>> {
  const wanted = Array.from(
    new Set(
      addresses
        .filter((a) => typeof a === 'string' && ADDRESS_RE.test(a.trim()))
        .map((a) => a.trim().toLowerCase()),
    ),
  );

  const out: Record<string, ChurchNftBadge | null> = {};
  const missing: string[] = [];

  for (const address of wanted) {
    if (cache.has(address)) out[address] = cache.get(address) ?? null;
    else missing.push(address);
  }

  if (missing.length === 0) return out;

  try {
    const { data, error } = await supabase.functions.invoke('opensea-church-badge', {
      body: { addresses: missing.slice(0, 12) },
    });
    if (error) throw error;

    const badges = (data?.badges ?? {}) as Record<string, ChurchNftBadge | null>;
    for (const address of missing) {
      const badge = badges[address] ?? null;
      cache.set(address, badge);
      out[address] = badge;
    }
  } catch (e) {
    console.warn('[churchNftBadges] badge lookup unavailable:', e);
  }

  return out;
}

export function cachedChurchNftBadge(address?: string | null): ChurchNftBadge | null {
  if (!address || !ADDRESS_RE.test(address.trim())) return null;
  return cache.get(address.trim().toLowerCase()) ?? null;
}
