/**
 * Typed API-Football Client
 * 
 * Provides a type-safe wrapper around the API-Football API endpoints
 * with built-in rate limiting and error handling.
 */

import { APIRateLimiter } from './rate-limiter';

// API-Football response types based on documentation
export interface LeagueResponse {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
    coverage: {
      fixtures: {
        events: boolean;
        lineups: boolean;
        statistics_fixtures: boolean;
        statistics_players: boolean;
      };
      standings: boolean;
      players: boolean;
      top_scorers: boolean;
      top_assists: boolean;
      top_cards: boolean;
      injuries: boolean;
      predictions: boolean;
      odds: boolean;
    };
  }>;
}

export interface TeamResponse {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface TransferResponse {
  transfer: {
    id: number;
    date: string;
    type: string; // "In" or "Out"
    teams: {
      in: {
        id: number;
        name: string;
        logo: string;
      };
      out: {
        id: number;
        name: string;
        logo: string;
      };
    };
    player: {
      id: number;
      name: string;
      firstname: string;
      lastname: string;
      age: number;
      birth: {
        date: string;
        place: string;
        country: string;
      };
      nationality: string;
      height: string;
      weight: string;
      injured: boolean;
      photo: string;
    };
  };
}

export class APIFootballClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly rateLimiter: APIRateLimiter;

  constructor() {
    this.baseUrl = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
    this.apiKey = process.env.API_FOOTBALL_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('API_FOOTBALL_KEY environment variable is required');
    }

    // Conservative rate limiting: 5 requests per second
    this.rateLimiter = new APIRateLimiter(5, 1000);
  }

  /**
   * Fetch league information
   */
  async getLeague(leagueId: number): Promise<LeagueResponse> {
    await this.rateLimiter.waitForNextRequest();
    
    const response = await this.fetchWithRetry(`/leagues?id=${leagueId}`);
    const data = await response.json();
    
    if (!data.response || data.response.length === 0) {
      throw new Error(`No league found with ID: ${leagueId}`);
    }
    
    return data.response[0];
  }

  /**
   * Fetch teams for a specific league and season
   */
  async getTeams(leagueId: number, season: number = 2024): Promise<TeamResponse[]> {
    await this.rateLimiter.waitForNextRequest();
    
    const response = await this.fetchWithRetry(`/teams?league=${leagueId}&season=${season}`);
    const data = await response.json();
    
    if (!data.response) {
      throw new Error(`No teams found for league ${leagueId}, season ${season}`);
    }
    
    return data.response;
  }

  /**
   * Fetch transfers for a specific league and season
   */
  async getTransfers(leagueId: number, season: number = 2024): Promise<TransferResponse[]> {
    await this.rateLimiter.waitForNextRequest();
    
    const response = await this.fetchWithRetry(`/transfers?league=${leagueId}&season=${season}`);
    const data = await response.json();
    
    if (!data.response) {
      console.warn(`No transfers found for league ${leagueId}, season ${season}`);
      return [];
    }
    
    return data.response;
  }

  /**
   * Get current rate limiter statistics
   */
  getRateLimitStats() {
    return this.rateLimiter.getStats();
  }

  private async fetchWithRetry(endpoint: string, maxRetries: number = 3): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'x-apisports-key': this.apiKey,
      'Content-Type': 'application/json'
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, { headers });
        
        if (response.ok) {
          return response;
        }

        if (response.status === 429) {
          console.log(`[APIFootball] Rate limited. Attempt ${attempt}/${maxRetries}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000 * attempt)); // Exponential backoff
            continue;
          }
        }

        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.error(`[APIFootball] Request attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts`);
  }
}
