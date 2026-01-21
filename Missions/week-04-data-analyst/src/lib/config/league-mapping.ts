/**
 * API League ID to Internal League ID Mapping
 * 
 * Maps API-Football numeric league IDs to internal slug IDs used
 * in window detection and configuration.
 */

// API-Football league IDs → Internal league slug IDs
export const API_LEAGUE_MAPPING: Record<number, string> = {
  // Premier League
  39: 'premier-league',
  
  // La Liga
  140: 'la-liga',
  
  // Serie A
  135: 'serie-a',
  
  // Bundesliga
  78: 'bundesliga',
  
  // Ligue 1
  61: 'ligue-1',
  
  // Add more mappings as needed
};

/**
 * Maps API league ID to internal league slug ID
 * 
 * @param apiLeagueId - Numeric API-Football league ID
 * @returns Internal league slug ID or undefined if not found
 */
export function mapApiLeagueId(apiLeagueId: number): string | undefined {
  return API_LEAGUE_MAPPING[apiLeagueId];
}

/**
 * Gets all supported API league IDs
 * 
 * @returns Array of supported API league IDs
 */
export function getSupportedApiLeagueIds(): number[] {
  return Object.keys(API_LEAGUE_MAPPING).map(Number);
}

/**
 * Checks if an API league ID is supported
 * 
 * @param apiLeagueId - Numeric API-Football league ID
 * @returns True if supported, false otherwise
 */
export function isSupportedApiLeague(apiLeagueId: number): boolean {
  return apiLeagueId in API_LEAGUE_MAPPING;
}
