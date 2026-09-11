/**
 * Church search memory.
 *
 * "Give instruction to a wise man, and he will be yet wiser" — Proverbs 9:9
 *
 * Remembers the churches a person searches for on this device so listed churches
 * always rise to the top of the results, and reports searches that found nothing
 * so the hourly international seeding agent can add them.
 */
import { supabaseApi } from '@/integrations/supabase/apiClient';

const QUERY_KEY = 'biblefi_recent_church_queries';
const CHURCH_KEY = 'biblefi_recent_church_ids';
const MAX_QUERIES = 12;
const MAX_CHURCHES = 25;

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(key: string, values: string[], max: number) {
  try {
    localStorage.setItem(key, JSON.stringify(values.slice(0, max)));
  } catch {
    /* storage unavailable (private mode) — memory is best-effort */
  }
}

export const churchSearchMemory = {
  /** Recent search terms, newest first. */
  getRecentQueries(): string[] {
    return readList(QUERY_KEY);
  },

  /** Church ids the person has searched for or opened, newest first. */
  getRememberedChurchIds(): string[] {
    return readList(CHURCH_KEY);
  },

  rememberQuery(query: string) {
    const term = query.trim();
    if (term.length < 3) return;
    const existing = readList(QUERY_KEY).filter(
      (q) => q.toLowerCase() !== term.toLowerCase(),
    );
    writeList(QUERY_KEY, [term, ...existing], MAX_QUERIES);
  },

  rememberChurch(churchId?: string | null) {
    if (!churchId) return;
    const existing = readList(CHURCH_KEY).filter((id) => id !== churchId);
    writeList(CHURCH_KEY, [churchId, ...existing], MAX_CHURCHES);
  },

  clear() {
    try {
      localStorage.removeItem(QUERY_KEY);
      localStorage.removeItem(CHURCH_KEY);
    } catch {
      /* ignore */
    }
  },

  /**
   * Sort remembered churches to the very top, keeping the incoming
   * relevance order for everything else.
   */
  pinRemembered<T extends { id?: string }>(rows: T[]): T[] {
    const remembered = readList(CHURCH_KEY);
    if (remembered.length === 0) return rows;
    const rank = new Map(remembered.map((id, index) => [id, index]));
    return [...rows].sort((a, b) => {
      const ra = a.id && rank.has(a.id) ? rank.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const rb = b.id && rank.has(b.id) ? rank.get(b.id)! : Number.MAX_SAFE_INTEGER;
      return ra - rb;
    });
  },

  /**
   * Tell the backend about this search. When nothing was found the term is
   * queued for the next hourly international church seeding run.
   */
  async reportSearch(query: string, found: boolean): Promise<void> {
    const term = query.trim();
    if (term.length < 3) return;
    try {
      await supabaseApi.rpc('record_church_search', {
        p_query: term,
        p_found: found,
      } as never);
    } catch (error) {
      console.warn('Could not record church search:', error);
    }
  },
};
