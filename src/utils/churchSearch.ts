/**
 * Calculates a relevance score (0–100) for how closely a church matches a
 * free-text search query, based on how the name and location fields match.
 *
 * Scoring tiers (higher = more relevant):
 *   100 – name exactly equals query
 *    90 – name starts with query
 *    70 – any individual word in the name starts with query
 *    50 – name contains query anywhere
 *    40 – city or state/province exactly equals query
 *    30 – city or state/province starts with query
 *    20 – city, state/province, or country contains query
 *     0 – no textual match
 *
 * When used as a comparator, ties are broken alphabetically by name, then city.
 */
export function churchRelevanceScore(
  name: string,
  city: string,
  stateProv: string | null | undefined,
  country: string,
  query: string,
): number {
  if (!query.trim()) return 0;
  const q = query.trim().toLowerCase();
  const n = (name || '').toLowerCase();
  const c = (city || '').toLowerCase();
  const s = (stateProv || '').toLowerCase();
  const co = (country || '').toLowerCase();

  // Name tiers — scored highest because the user is most likely searching by name
  if (n === q) return 100;
  if (n.startsWith(q)) return 90;
  if (n.split(/\s+/).some((word) => word.startsWith(q))) return 70;
  if (n.includes(q)) return 50;

  // Location tiers
  if (c === q || s === q) return 40;
  if (c.startsWith(q) || s.startsWith(q)) return 30;
  if (c.includes(q) || s.includes(q) || co.includes(q)) return 20;

  return 0;
}
