
/**
 * Extract city and state from a location string like "City, State"
 */
export function extractLocationParts(location: string): { city: string, state: string } {
  const parts = location.split(',').map(part => part.trim());
  return {
    city: parts[0] || '',
    state: parts[1] || ''
  };
}
