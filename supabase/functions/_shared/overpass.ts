/**
 * Shared Overpass (OpenStreetMap) client for the church-seeding sovereign agents.
 *
 * overpass-api.de answers 406 Not Acceptable to any request without a
 * User-Agent, which silently stalled all church discovery. We identify
 * ourselves and fall back through public mirrors.
 *
 * "Go ye therefore, and teach all nations" — Matthew 28:19 (KJV).
 */

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

export const OSM_USER_AGENT = 'BibleFi-ChurchSeeder/1.0 (+https://biblefi.app; churches@biblefi.app)';

export const OSM_HEADERS: Record<string, string> = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': OSM_USER_AGENT,
  Accept: 'application/json',
};

export interface OverpassResult {
  elements: Array<Record<string, unknown>>;
  endpoint: string | null;
  error: string | null;
}

/** POST an Overpass QL query, trying each mirror until one answers. */
export async function overpassQuery(query: string, timeoutMs = 20000): Promise<OverpassResult> {
  let lastError = 'no endpoint attempted';

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: OSM_HEADERS,
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      if (!res.ok) {
        lastError = `${endpoint} -> ${res.status}`;
        continue;
      }
      const json = await res.json();
      return { elements: json.elements ?? [], endpoint, error: null };
    } catch (err) {
      lastError = `${endpoint} -> ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      clearTimeout(timer);
    }
  }

  return { elements: [], endpoint: null, error: lastError };
}
