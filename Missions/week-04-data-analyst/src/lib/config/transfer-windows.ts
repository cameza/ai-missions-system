/**
 * Transfer Window Configuration
 * 
 * Defines transfer window rules per league and season.
 * Supports league-specific variations with fallback to default configuration.
 */

export interface TransferWindow {
  id: string; // e.g., "2025-winter", "2025-summer"
  name: string; // Display name
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed';
  leagues: string[]; // League IDs this window applies to
}

export interface LeagueWindowConfig {
  leagueId: string;
  leagueName: string;
  winterWindow: {
    startMonth: number; // 1-12
    startDay: number;
    endMonth: number;
    endDay: number;
  };
  summerWindow: {
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
  };
}

// League-specific transfer window configurations
export const LEAGUE_WINDOWS: LeagueWindowConfig[] = [
  {
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    winterWindow: { startMonth: 1, startDay: 1, endMonth: 2, endDay: 1 },
    summerWindow: { startMonth: 6, startDay: 10, endMonth: 9, endDay: 1 },
  },
  {
    leagueId: 'la-liga',
    leagueName: 'La Liga',
    winterWindow: { startMonth: 1, startDay: 1, endMonth: 2, endDay: 1 },
    summerWindow: { startMonth: 7, startDay: 1, endMonth: 9, endDay: 2 },
  },
  {
    leagueId: 'serie-a',
    leagueName: 'Serie A',
    winterWindow: { startMonth: 1, startDay: 2, endMonth: 2, endDay: 1 },
    summerWindow: { startMonth: 7, startDay: 1, endMonth: 9, endDay: 1 },
  },
  {
    leagueId: 'bundesliga',
    leagueName: 'Bundesliga',
    winterWindow: { startMonth: 1, startDay: 1, endMonth: 2, endDay: 1 },
    summerWindow: { startMonth: 7, startDay: 1, endMonth: 9, endDay: 1 },
  },
  {
    leagueId: 'ligue-1',
    leagueName: 'Ligue 1',
    winterWindow: { startMonth: 1, startDay: 1, endMonth: 2, endDay: 1 },
    summerWindow: { startMonth: 6, startDay: 10, endMonth: 9, endDay: 2 },
  },
];

// Default fallback configuration for leagues without specific rules
export const DEFAULT_WINDOW_CONFIG: LeagueWindowConfig = {
  leagueId: 'default',
  leagueName: 'Default',
  winterWindow: { startMonth: 1, startDay: 1, endMonth: 2, endDay: 1 },
  summerWindow: { startMonth: 6, startDay: 1, endMonth: 9, endDay: 1 },
};

// Helper function to get league configuration
export function getLeagueWindowConfig(leagueId?: string): LeagueWindowConfig {
  return LEAGUE_WINDOWS.find(w => w.leagueId === leagueId) || DEFAULT_WINDOW_CONFIG;
}

// Helper function to get all supported league IDs
export function getSupportedLeagueIds(): string[] {
  return LEAGUE_WINDOWS.map(w => w.leagueId);
}
