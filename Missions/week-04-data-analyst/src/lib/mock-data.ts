/**
 * Mock Data for Development & Testing
 * 
 * Provides realistic mock data for API-Football responses and
 * development scenarios without hitting actual APIs.
 * 
 * @version 1.0
 * @since 2025-01-17
 */

import { APIFootballTransfer, APIFootballTransfersResponse } from './transfer-service';

// ============================================================================
// MOCK API-FOOTBALL TRANSFERS
// ============================================================================

/**
 * Mock API-Football transfer data
 */
export const MOCK_API_TRANSFERS: APIFootballTransfer[] = [
  {
    id: 1001,
    playerId: 5001,
    playerName: 'Erling Haaland',
    playerAge: 24,
    playerPosition: 'Attacker',
    playerNationality: 'NOR',
    fromClub: {
      id: 50,
      name: 'Borussia Dortmund',
      logo: 'https://media.api-sports.io/football/teams/50.png',
    },
    toClub: {
      id: 42,
      name: 'Manchester City',
      logo: 'https://media.api-sports.io/football/teams/42.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'ENG',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    },
    type: 'Permanent',
    amount: '60M',
    date: '2025-01-15',
  },
  {
    id: 1002,
    playerId: 5002,
    playerName: 'Jude Bellingham',
    playerAge: 20,
    playerPosition: 'Midfielder',
    playerNationality: 'ENG',
    fromClub: {
      id: 541,
      name: 'Borussia Dortmund',
      logo: 'https://media.api-sports.io/football/teams/541.png',
    },
    toClub: {
      id: 541,
      name: 'Real Madrid',
      logo: 'https://media.api-sports.io/football/teams/541.png',
    },
    league: {
      id: 140,
      name: 'La Liga',
      country: 'ESP',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
      flag: 'https://media.api-sports.io/flags/es.svg',
    },
    type: 'Permanent',
    amount: '100M',
    date: '2025-01-10',
  },
  {
    id: 1003,
    playerId: 5003,
    playerName: 'Victor Osimhen',
    playerAge: 25,
    playerPosition: 'Attacker',
    playerNationality: 'NGA',
    fromClub: {
      id: 487,
      name: 'Napoli',
      logo: 'https://media.api-sports.io/football/teams/487.png',
    },
    toClub: {
      id: 492,
      name: 'Chelsea',
      logo: 'https://media.api-sports.io/football/teams/492.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'ENG',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    },
    type: 'Loan',
    amount: '10M',
    date: '2025-01-20',
  },
  {
    id: 1004,
    playerId: 5004,
    playerName: 'Alphonso Davies',
    playerAge: 23,
    playerPosition: 'Defender',
    playerNationality: 'CAN',
    fromClub: {
      id: 157,
      name: 'Bayern Munich',
      logo: 'https://media.api-sports.io/football/teams/157.png',
    },
    toClub: {
      id: 529,
      name: 'Real Madrid',
      logo: 'https://media.api-sports.io/football/teams/529.png',
    },
    league: {
      id: 140,
      name: 'La Liga',
      country: 'ESP',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
      flag: 'https://media.api-sports.io/flags/es.svg',
    },
    type: 'Permanent',
    amount: '80M',
    date: '2025-01-25',
  },
  {
    id: 1005,
    playerId: 5005,
    playerName: 'Khvicha Kvaratskhelia',
    playerAge: 22,
    playerPosition: 'Attacker',
    playerNationality: 'GEO',
    fromClub: {
      id: 487,
      name: 'Napoli',
      logo: 'https://media.api-sports.io/football/teams/487.png',
    },
    toClub: {
      id: 85,
      name: 'Paris Saint Germain',
      logo: 'https://media.api-sports.io/football/teams/85.png',
    },
    league: {
      id: 61,
      name: 'Ligue 1',
      country: 'FRA',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
      flag: 'https://media.api-sports.io/flags/fr.svg',
    },
    type: 'Permanent',
    amount: '70M',
    date: '2025-01-18',
  },
  {
    id: 1006,
    playerId: 5006,
    playerName: 'Marcus Rashford',
    playerAge: 26,
    playerPosition: 'Attacker',
    playerNationality: 'ENG',
    fromClub: {
      id: 33,
      name: 'Manchester United',
      logo: 'https://media.api-sports.io/football/teams/33.png',
    },
    toClub: {
      id: 45,
      name: 'Arsenal',
      logo: 'https://media.api-sports.io/football/teams/45.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'ENG',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    },
    type: 'Free Transfer',
    amount: 'free',
    date: '2025-01-22',
  },
  {
    id: 1007,
    playerId: 5007,
    playerName: 'Federico Chiesa',
    playerAge: 26,
    playerPosition: 'Attacker',
    playerNationality: 'ITA',
    fromClub: {
      id: 492,
      name: 'Juventus',
      logo: 'https://media.api-sports.io/football/teams/492.png',
    },
    toClub: {
      id: 506,
      name: 'Liverpool',
      logo: 'https://media.api-sports.io/football/teams/506.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'ENG',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    },
    type: 'Permanent',
    amount: '45M',
    date: '2025-01-12',
  },
  {
    id: 1008,
    playerId: 5008,
    playerName: 'Mike Maignan',
    playerAge: 28,
    playerPosition: 'Goalkeeper',
    playerNationality: 'FRA',
    fromClub: {
      id: 489,
      name: 'AC Milan',
      logo: 'https://media.api-sports.io/football/teams/489.png',
    },
    toClub: {
      id: 109,
      name: 'Chelsea',
      logo: 'https://media.api-sports.io/football/teams/109.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'ENG',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    },
    type: 'Permanent',
    amount: '35M',
    date: '2025-01-08',
  },
  {
    id: 1009,
    playerId: 5009,
    playerName: 'Jamal Musiala',
    playerAge: 20,
    playerPosition: 'Midfielder',
    playerNationality: 'GER',
    fromClub: {
      id: 157,
      name: 'Bayern Munich',
      logo: 'https://media.api-sports.io/football/teams/157.png',
    },
    toClub: {
      id: 542,
      name: 'Manchester City',
      logo: 'https://media.api-sports.io/football/teams/542.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'ENG',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    },
    type: 'Permanent',
    amount: '120M',
    date: '2025-01-30',
  },
  {
    id: 1010,
    playerId: 5010,
    playerName: 'Pedro Porro',
    playerAge: 24,
    playerPosition: 'Defender',
    playerNationality: 'ESP',
    fromClub: {
      id: 71,
      name: 'Sporting CP',
      logo: 'https://media.api-sports.io/football/teams/71.png',
    },
    toClub: {
      id: 63,
      name: 'Tottenham',
      logo: 'https://media.api-sports.io/football/teams/63.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'ENG',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    },
    type: 'Permanent',
    amount: '40M',
    date: '2025-01-05',
  },
];

// ============================================================================
// MOCK API RESPONSES
// ============================================================================

/**
 * Mock API response for transfers
 */
export const MOCK_API_RESPONSE: APIFootballTransfersResponse = {
  results: MOCK_API_TRANSFERS.length,
  paging: {
    current: 1,
    total: 1,
  },
  response: MOCK_API_TRANSFERS,
};

/**
 * Mock API response with pagination
 */
export function createMockPaginatedResponse(
  transfers: APIFootballTransfer[],
  page: number = 1,
  pageSize: number = 10
): APIFootballTransfersResponse {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransfers = transfers.slice(startIndex, endIndex);

  return {
    results: transfers.length,
    paging: {
      current: page,
      total: Math.ceil(transfers.length / pageSize),
    },
    response: paginatedTransfers,
  };
}

// ============================================================================
// MOCK ERROR RESPONSES
// ============================================================================

/**
 * Mock rate limit error response
 */
export const MOCK_RATE_LIMIT_ERROR = {
  success: false,
  error: 'API rate limit exceeded. Remaining: 0',
  code: 'RATE_LIMIT_EXCEEDED',
};

/**
 * Mock authentication error response
 */
export const MOCK_AUTH_ERROR = {
  success: false,
  error: 'Invalid API key',
  code: 'UNAUTHORIZED',
};

/**
 * Mock network error response
 */
export const MOCK_NETWORK_ERROR = {
  success: false,
  error: 'Network timeout',
  code: 'NETWORK_ERROR',
};

/**
 * Mock validation error response
 */
export const MOCK_VALIDATION_ERROR = {
  success: false,
  error: 'Invalid transfer data format',
  code: 'VALIDATION_ERROR',
};

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate random mock transfer
 */
export function generateMockTransfer(overrides: Partial<APIFootballTransfer> = {}): APIFootballTransfer {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
  const nationalities = ['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'POR', 'NED', 'BEL'];
  const transferTypes = ['Permanent', 'Loan', 'Free Transfer'];
  const amounts = ['10M', '15M', '20M', '25M', '30M', '35M', '40M', '45M', '50M', 'free'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;

  return {
    id: Math.floor(Math.random() * 10000) + 1000,
    playerId: Math.floor(Math.random() * 10000) + 5000,
    playerName: fullName,
    playerAge: Math.floor(Math.random() * 15) + 18, // 18-32
    playerPosition: positions[Math.floor(Math.random() * positions.length)],
    playerNationality: nationalities[Math.floor(Math.random() * nationalities.length)],
    fromClub: {
      id: Math.floor(Math.random() * 1000) + 1,
      name: `Club ${Math.floor(Math.random() * 100) + 1}`,
    },
    toClub: {
      id: Math.floor(Math.random() * 1000) + 1,
      name: `Club ${Math.floor(Math.random() * 100) + 1}`,
    },
    league: {
      id: Math.floor(Math.random() * 100) + 1,
      name: `League ${Math.floor(Math.random() * 10) + 1}`,
      country: nationalities[Math.floor(Math.random() * nationalities.length)],
    },
    type: transferTypes[Math.floor(Math.random() * transferTypes.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    date: new Date(2025, 0, Math.floor(Math.random() * 31) + 1).toISOString().split('T')[0],
    ...overrides,
  };
}

/**
 * Generate multiple mock transfers
 */
export function generateMockTransfers(count: number, overrides?: Partial<APIFootballTransfer>): APIFootballTransfer[] {
  return Array.from({ length: count }, () => generateMockTransfer(overrides));
}

/**
 * Generate mock transfers for specific league
 */
export function generateMockTransfersForLeague(
  leagueId: number,
  leagueName: string,
  count: number = 10
): APIFootballTransfer[] {
  return Array.from({ length: count }, () => 
    generateMockTransfer({
      league: {
        id: leagueId,
        name: leagueName,
        country: 'ENG',
      },
    })
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get mock transfers by league
 */
export function getMockTransfersByLeague(leagueId: number): APIFootballTransfer[] {
  return MOCK_API_TRANSFERS.filter(transfer => transfer.league.id === leagueId);
}

/**
 * Get mock transfers by player position
 */
export function getMockTransfersByPosition(position: string): APIFootballTransfer[] {
  return MOCK_API_TRANSFERS.filter(transfer => 
    transfer.playerPosition?.toLowerCase() === position.toLowerCase()
  );
}

/**
 * Get mock transfers by transfer type
 */
export function getMockTransfersByType(type: string): APIFootballTransfer[] {
  return MOCK_API_TRANSFERS.filter(transfer => 
    transfer.type.toLowerCase() === type.toLowerCase()
  );
}

/**
 * Get mock transfers by date range
 */
export function getMockTransfersByDateRange(startDate: string, endDate: string): APIFootballTransfer[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return MOCK_API_TRANSFERS.filter(transfer => {
    const transferDate = new Date(transfer.date);
    return transferDate >= start && transferDate <= end;
  });
}

/**
 * Calculate mock transfer statistics
 */
export function calculateMockStats() {
  const stats = {
    total: MOCK_API_TRANSFERS.length,
    byType: {} as Record<string, number>,
    byPosition: {} as Record<string, number>,
    byLeague: {} as Record<string, number>,
    totalValue: 0,
    averageValue: 0,
  };

  for (const transfer of MOCK_API_TRANSFERS) {
    // Count by type
    stats.byType[transfer.type] = (stats.byType[transfer.type] || 0) + 1;
    
    // Count by position
    if (transfer.playerPosition) {
      stats.byPosition[transfer.playerPosition] = (stats.byPosition[transfer.playerPosition] || 0) + 1;
    }
    
    // Count by league
    stats.byLeague[transfer.league.name] = (stats.byLeague[transfer.league.name] || 0) + 1;
    
    // Calculate total value
    if (transfer.amount && transfer.amount !== 'free') {
      const value = parseFloat(transfer.amount.replace('M', ''));
      stats.totalValue += value;
    }
  }

  stats.averageValue = stats.totalValue / MOCK_API_TRANSFERS.length;

  return stats;
}
