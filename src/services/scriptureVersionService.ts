import { supabaseApi } from '@/integrations/supabase/apiClient';

export interface VersionedVerse {
  id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  testament: 'Old' | 'New' | string;
  financial_relevance: number | null;
  wisdom_category: string[] | null;
}

export const PUBLIC_DOMAIN_VERSIONS = ['KJV', 'WEB', 'ASV', 'BBE', 'YLT', 'DARBY'] as const;

/** Versions that require a paid/licensed API key and cannot be seeded freely. */
export const LICENSED_VERSIONS = ['NIV', 'ESV'] as const;

export async function fetchAvailableVersions(): Promise<string[]> {
  const { data, error } = await supabaseApi
    .from('bible_verses')
    .select('version')
    .limit(5000);
  if (error) throw error;
  const set = new Set<string>((data ?? []).map((r: { version: string }) => r.version));
  return Array.from(set).sort();
}

export async function fetchVersesByVersion(
  version: string,
  search = '',
): Promise<VersionedVerse[]> {
  let query = supabaseApi
    .from('bible_verses')
    .select(
      'id, book_name, chapter, verse, text, version, testament, financial_relevance, wisdom_category',
    )
    .eq('version', version)
    .order('financial_relevance', { ascending: false })
    .order('book_name', { ascending: true })
    .limit(300);

  const term = search.trim();
  if (term.length > 0) {
    const safe = term.replace(/[%,()]/g, '');
    query = query.or(`book_name.ilike.%${safe}%,text.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as VersionedVerse[];
}
