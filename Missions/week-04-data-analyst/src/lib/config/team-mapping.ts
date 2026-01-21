/**
 * API Team ID to Internal Team Mapping
 * 
 * Maps API-Football numeric team IDs to internal team information
 * for transfer data fetching by team instead of league.
 */

// Major teams by league with their API-Football IDs
export const API_TEAM_MAPPING: Record<number, { name: string; league: string; leagueId: number }> = {
  // Premier League
  33: { name: 'Manchester United', league: 'premier-league', leagueId: 39 },
  40: { name: 'Liverpool', league: 'premier-league', leagueId: 39 },
  42: { name: 'Arsenal', league: 'premier-league', leagueId: 39 },
  50: { name: 'Manchester City', league: 'premier-league', leagueId: 39 },
  49: { name: 'Chelsea', league: 'premier-league', leagueId: 39 },
  
  // La Liga
  541: { name: 'Real Madrid', league: 'la-liga', leagueId: 140 },
  529: { name: 'Barcelona', league: 'la-liga', leagueId: 140 },
  535: { name: 'Atletico Madrid', league: 'la-liga', leagueId: 140 },
  726: { name: 'Valencia', league: 'la-liga', leagueId: 140 },
  540: { name: 'Sevilla', league: 'la-liga', leagueId: 140 },
  
  // Serie A
  489: { name: 'Juventus', league: 'serie-a', leagueId: 135 },
  492: { name: 'AC Milan', league: 'serie-a', leagueId: 135 },
  496: { name: 'Inter Milan', league: 'serie-a', leagueId: 135 },
  500: { name: 'Napoli', league: 'serie-a', leagueId: 135 },
  505: { name: 'AS Roma', league: 'serie-a', leagueId: 135 },
  
  // Bundesliga
  157: { name: 'Bayern Munich', league: 'bundesliga', leagueId: 78 },
  165: { name: 'Borussia Dortmund', league: 'bundesliga', leagueId: 78 },
  168: { name: 'RB Leipzig', league: 'bundesliga', leagueId: 78 },
  173: { name: 'Bayer Leverkusen', league: 'bundesliga', leagueId: 78 },
  178: { name: 'Eintracht Frankfurt', league: 'bundesliga', leagueId: 78 },
  
  // Ligue 1
  85: { name: 'PSG', league: 'ligue-1', leagueId: 61 },
  80: { name: 'Lyon', league: 'ligue-1', leagueId: 61 },
  58: { name: 'Marseille', league: 'ligue-1', leagueId: 61 },
  77: { name: 'Monaco', league: 'ligue-1', leagueId: 61 },
  91: { name: 'Lille', league: 'ligue-1', leagueId: 61 },
};

/**
 * Gets team IDs for a specific league
 * 
 * @param leagueSlug - Internal league slug (e.g., 'premier-league')
 * @returns Array of team IDs for that league
 */
export function getTeamIdsByLeague(leagueSlug: string): number[] {
  return Object.entries(API_TEAM_MAPPING)
    .filter(([_, team]) => team.league === leagueSlug)
    .map(([teamId, _]) => parseInt(teamId));
}

/**
 * Gets all supported team IDs
 * 
 * @returns Array of all supported team IDs
 */
export function getSupportedApiTeamIds(): number[] {
  return Object.keys(API_TEAM_MAPPING).map(Number);
}

/**
 * Checks if a team ID is supported
 * 
 * @param teamId - Numeric API-Football team ID
 * @returns True if supported, false otherwise
 */
export function isSupportedApiTeam(teamId: number): boolean {
  return teamId in API_TEAM_MAPPING;
}

/**
 * Gets team information by API ID
 * 
 * @param teamId - Numeric API-Football team ID
 * @returns Team information or undefined if not found
 */
export function getTeamInfo(teamId: number) {
  return API_TEAM_MAPPING[teamId];
}
