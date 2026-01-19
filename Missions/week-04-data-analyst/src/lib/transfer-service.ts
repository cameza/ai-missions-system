/**
 * Transfer Service - API-Football Integration
 * 
 * Implements the external API integration service for fetching transfer data
 * from API-Football with rate limiting and error handling.
 * 
 * Tech Spec §7.1: Service Foundations
 * 
 * @version 1.0
 * @since 2025-01-17
 */

import { z } from 'zod';
import { Transfer, TransferType, TransferWindow, PlayerPosition, determineTransferWindow, formatTransferValue } from '../types';

// ============================================================================
// API-FOOTBALL TYPES & SCHEMAS
// ============================================================================

/**
 * API-Football transfer response structure
 * Based on API-Football documentation for transfers endpoint
 */
export interface APIFootballTransfer {
  id: number;
  playerId: number;
  playerName: string;
  playerAge?: number;
  playerPosition?: string;
  playerNationality?: string;
  fromClub: {
    id: number;
    name: string;
    logo?: string;
  };
  toClub: {
    id: number;
    name: string;
    logo?: string;
  };
  league: {
    id: number;
    name: string;
    country?: string;
    logo?: string;
    flag?: string;
  };
  type: string;
  amount?: string;
  date: string;
}

/**
 * API-Football transfers response wrapper
 */
export interface APIFootballTransfersResponse {
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: APIFootballTransfer[];
}

/**
 * Transfer fetch parameters
 */
export interface FetchTransfersParams {
  /** Season year (e.g., 2025) */
  season: number;
  /** League IDs to fetch transfers for */
  leagueIds: number[];
  /** Page number for pagination (optional) */
  page?: number;
}

/**
 * Sync strategy types
 */
export type SyncStrategy = 'normal' | 'deadline_day' | 'emergency';

/**
 * Sync context for strategy selection
 */
export interface SyncContext {
  /** Current sync strategy */
  strategy: SyncStrategy;
  /** Whether this is manual override */
  isManualOverride?: boolean;
  /** Deadline day flag */
  isDeadlineDay?: boolean;
}

// ============================================================================
// ZOD SCHEMAS FOR API RESPONSES
// ============================================================================

/**
 * Zod schema for API-Football transfer validation
 */
export const APIFootballTransferSchema = z.object({
  id: z.number(),
  playerId: z.number(),
  playerName: z.string().min(1),
  playerAge: z.number().min(16).max(50).optional(),
  playerPosition: z.string().optional(),
  playerNationality: z.string().length(3).optional(),
  fromClub: z.object({
    id: z.number(),
    name: z.string().min(1),
    logo: z.string().url().optional(),
  }),
  toClub: z.object({
    id: z.number(),
    name: z.string().min(1),
    logo: z.string().url().optional(),
  }),
  league: z.object({
    id: z.number(),
    name: z.string().min(1),
    country: z.string().length(3).optional(),
    logo: z.string().url().optional(),
    flag: z.string().url().optional(),
  }),
  type: z.string(),
  amount: z.string().optional(),
  date: z.string(),
});

/**
 * Zod schema for API-Football transfers response
 */
export const APIFootballTransfersResponseSchema = z.object({
  results: z.number(),
  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),
  response: z.array(APIFootballTransferSchema),
});

// ============================================================================
// RATE LIMITER
// ============================================================================

/**
 * Rate limiter configuration
 */
interface RateLimiterConfig {
  /** Daily API call limit */
  dailyLimit: number;
  /** Emergency threshold (percentage) */
  emergencyThreshold: number;
  /** Current usage tracking */
  currentUsage: number;
  /** Last reset timestamp */
  lastReset: Date;
}

/**
 * API Rate Limiter implementation
 * Enforces API-Football rate limits with emergency mode
 */
export class APIRateLimiter {
  private config: RateLimiterConfig;
  private emergencyMode = false;
  private cacheHits = 0;

  constructor() {
    this.config = {
      dailyLimit: 3000,
      emergencyThreshold: 0.1, // 10%
      currentUsage: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Check if request can proceed
   */
  canMakeRequest(): { allowed: boolean; emergencyMode: boolean; remaining: number } {
    this.resetIfNeeded();
    
    const remaining = this.config.dailyLimit - this.config.currentUsage;
    const thresholdReached = remaining <= this.config.dailyLimit * this.config.emergencyThreshold;
    
    // Update emergency mode state
    if (thresholdReached && !this.emergencyMode) {
      this.emergencyMode = true;
      console.warn('🚨 API Rate Limit: Emergency mode activated');
    }

    return {
      allowed: remaining > 0,
      emergencyMode: this.emergencyMode,
      remaining,
    };
  }

  /**
   * Record API call usage
   */
  recordCall(): void {
    this.config.currentUsage++;
  }

  /**
   * Record cache hit (doesn't count against rate limit)
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Get current status
   */
  getStatus() {
    this.resetIfNeeded();
    return {
      used: this.config.currentUsage,
      limit: this.config.dailyLimit,
      remaining: this.config.dailyLimit - this.config.currentUsage,
      emergencyMode: this.emergencyMode,
      cacheHits: this.cacheHits,
      usagePercentage: (this.config.currentUsage / this.config.dailyLimit) * 100,
    };
  }

  /**
   * Reset daily counter if needed
   */
  private resetIfNeeded(): void {
    const now = new Date();
    const hoursSinceReset = (now.getTime() - this.config.lastReset.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 24) {
      this.config.currentUsage = 0;
      this.config.lastReset = now;
      this.emergencyMode = false;
      this.cacheHits = 0;
    }
  }
}

// ============================================================================
// TRANSFER SERVICE
// ============================================================================

/**
 * Transfer Service class
 * Handles API-Football integration with rate limiting and data transformation
 */
export class TransferService {
  private rateLimiter: APIRateLimiter;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.rateLimiter = new APIRateLimiter();
    this.baseUrl = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
    this.apiKey = process.env.API_FOOTBALL_KEY || '';

    if (!this.apiKey) {
      throw new Error('API_FOOTBALL_KEY environment variable is required');
    }
  }

  /**
   * Fetch transfers from API-Football
   */
  async fetchTransfers(params: FetchTransfersParams): Promise<APIFootballTransfersResponse> {
    const { season, leagueIds, page = 1 } = params;

    // Check rate limits
    const rateLimit = this.rateLimiter.canMakeRequest();
    if (!rateLimit.allowed) {
      throw new Error(`API rate limit exceeded. Remaining: ${rateLimit.remaining}`);
    }

    if (rateLimit.emergencyMode) {
      console.warn('🚨 Operating in emergency mode - use cached data when possible');
    }

    // Build API URL
    const url = new URL(`${this.baseUrl}/transfers`);
    url.searchParams.set('season', season.toString());
    
    // Add league IDs (API supports multiple leagues)
    if (leagueIds.length > 0) {
      url.searchParams.set('league', leagueIds.join(','));
    }
    
    url.searchParams.set('page', page.toString());

    try {
      // Make API request
      const response = await this.throttledRequest(url.toString());
      
      // Record usage
      this.rateLimiter.recordCall();
      
      // Validate response
      const validatedResponse = APIFootballTransfersResponseSchema.parse(response);
      
      return validatedResponse;
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform batch of API transfers to internal Transfer format
   */
  transformBatch(apiTransfers: (APIFootballTransfer | null | undefined)[]): Transfer[] {
    return apiTransfers
      .filter((transfer): transfer is APIFootballTransfer => transfer != null)
      .map(apiTransfer => this.transformSingle(apiTransfer))
      .filter(Boolean) as Transfer[];
  }

  /**
   * Transform single API transfer to internal format
   */
  private transformSingle(apiTransfer: APIFootballTransfer): Transfer | null {
    try {
      // Extract player name components
      const { firstName, lastName } = this.extractFirstName(apiTransfer.playerName);
      
      // Parse transfer date
      const transferDate = new Date(apiTransfer.date);
      if (isNaN(transferDate.getTime())) {
        console.warn(`Invalid transfer date: ${apiTransfer.date} for transfer ${apiTransfer.id}`);
        return null;
      }

      // Determine transfer type
      const transferType = this.mapTransferType(apiTransfer.type);
      
      // Parse transfer value
      const transferValueUsd = this.parseTransferValue(apiTransfer.amount);
      
      // Create transfer object
      const transfer: Transfer = {
        id: '', // Will be set by database
        playerId: apiTransfer.playerId,
        playerFirstName: firstName,
        playerLastName: lastName,
        playerFullName: apiTransfer.playerName,
        age: apiTransfer.playerAge,
        position: this.mapPosition(apiTransfer.playerPosition),
        nationality: apiTransfer.playerNationality,
        fromClubId: '', // Will be resolved by database service
        toClubId: '', // Will be resolved by database service
        fromClubName: apiTransfer.fromClub.name,
        toClubName: apiTransfer.toClub.name,
        leagueId: '', // Will be resolved by database service
        leagueName: apiTransfer.league.name,
        transferType,
        transferValueUsd,
        transferValueDisplay: formatTransferValue(transferValueUsd),
        status: 'done', // Default to done for API transfers
        transferDate,
        window: determineTransferWindow(transferDate),
        apiTransferId: apiTransfer.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return transfer;
    } catch (error) {
      console.error(`Failed to transform transfer ${apiTransfer?.id || 'unknown'}:`, error);
      return null;
    }
  }

  /**
   * Extract first and last name from full player name
   */
  extractFirstName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    
    if (parts.length === 2) {
      return { firstName: parts[0], lastName: parts[1] };
    }
    
    // For names with multiple parts, first part is first name, rest is last name
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  /**
   * Map API transfer type to internal TransferType
   */
  mapTransferType(apiType: string): TransferType {
    const normalizedType = apiType.toLowerCase().trim();
    
    if (normalizedType === 'loan') {
      return 'Loan';
    }
    
    if (normalizedType === 'free' || normalizedType === 'free transfer') {
      return 'Free Transfer';
    }
    
    if (normalizedType === 'n/a' || normalizedType === 'not applicable') {
      return 'N/A';
    }
    
    // Default to Permanent for any other type
    return 'Permanent';
  }

  /**
   * Map API position to internal PlayerPosition
   */
  private mapPosition(apiPosition?: string): PlayerPosition | undefined {
    if (!apiPosition) return undefined;
    
    const normalized = apiPosition.toLowerCase().trim();
    
    if (normalized.includes('goalkeeper') || normalized.includes('gk')) {
      return 'Goalkeeper';
    }
    
    if (normalized.includes('defender') || normalized.includes('back') || 
        normalized.includes('center') || normalized.includes('full')) {
      return 'Defender';
    }
    
    if (normalized.includes('midfielder') || normalized.includes('midfield') || 
        normalized.includes('mid')) {
      return 'Midfielder';
    }
    
    if (normalized.includes('attacker') || normalized.includes('forward') || 
        normalized.includes('striker') || normalized.includes('wing')) {
      return 'Attacker';
    }
    
    return undefined;
  }

  /**
   * Parse transfer value from API string to USD cents
   */
  private parseTransferValue(amount?: string): number | undefined {
    if (!amount || amount.toLowerCase() === 'free' || amount.toLowerCase() === 'n/a') {
      return undefined;
    }

    try {
      // Remove currency symbols and convert to number
      const cleanAmount = amount.replace(/[€£$]/g, '').replace(/,/g, '');
      
      // Handle different units
      if (cleanAmount.includes('M')) {
        const millions = parseFloat(cleanAmount.replace('M', ''));
        return Math.round(millions * 100000000); // Convert to cents
      }
      
      if (cleanAmount.includes('K')) {
        const thousands = parseFloat(cleanAmount.replace('K', ''));
        return Math.round(thousands * 100000); // Convert to cents
      }
      
      // Assume it's already in the right format
      const value = parseFloat(cleanAmount);
      return Math.round(value * 100); // Convert to cents
    } catch (error) {
      console.warn(`Failed to parse transfer value: ${amount}`);
      return undefined;
    }
  }

  /**
   * Throttled API request wrapper
   */
  private async throttledRequest(url: string): Promise<any> {
    // Add delay if in emergency mode
    if (this.rateLimiter.canMakeRequest().emergencyMode) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get rate limiter status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }

  /**
   * Determine sync strategy based on context
   */
  determineSyncStrategy(context: Partial<SyncContext> = {}): SyncStrategy {
    // Manual override takes precedence
    if (context.isManualOverride && context.strategy) {
      return context.strategy;
    }

    // Deadline day mode
    if (context.isDeadlineDay) {
      return 'deadline_day';
    }

    // Emergency mode from rate limiter
    if (this.rateLimiter.canMakeRequest().emergencyMode) {
      return 'emergency';
    }

    // Default to normal
    return 'normal';
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Create transfer service instance
 */
export function createTransferService(): TransferService {
  return new TransferService();
}

/**
 * Validate API-Football transfer data
 */
export function validateAPIFootballTransfer(data: unknown): data is APIFootballTransfer {
  return APIFootballTransferSchema.safeParse(data).success;
}

/**
 * Validate API-Football transfers response
 */
export function validateAPIFootballTransfersResponse(data: unknown): data is APIFootballTransfersResponse {
  return APIFootballTransfersResponseSchema.safeParse(data).success;
}
