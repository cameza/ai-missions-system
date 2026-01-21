/**
 * Sync Orchestrator - Transactional Data Pipeline
 * 
 * Implements the transactional sync orchestrator for transfer data
 * with priority strategies and rollback capability.
 * 
 * Tech Spec §7.2: Database Service Integration
 * Tech Spec §7.3: Rate Limiting & Priority Strategy
 * 
 * @version 1.0
 * @since 2025-01-17
 */

import { z } from 'zod';
import { Transfer, TransferSchema, DatabaseTransfer } from '../types';
import { TransferService, SyncStrategy, FetchTransfersParams } from './transfer-service';
import { getTeamIdsByLeague } from './config/team-mapping';

// ============================================================================
// SYNC CONFIGURATION & TYPES
// ============================================================================

/**
 * League configuration for sync strategies
 */
export interface LeagueConfig {
  /** API-Football league ID */
  apiLeagueId: number;
  /** League name */
  name: string;
  /** League priority tier */
  tier: number;
  /** Include in normal sync */
  includeInNormal: boolean;
  /** Include in deadline day sync */
  includeInDeadlineDay: boolean;
  /** Include in emergency sync */
  includeInEmergency: boolean;
}

/**
 * Sync result statistics
 */
export interface SyncResult {
  /** Strategy used */
  strategy: SyncStrategy;
  /** Total transfers processed */
  totalProcessed: number;
  /** Successfully synced transfers */
  successful: number;
  /** Failed transfers */
  failed: number;
  /** Duration in milliseconds */
  duration: number;
  /** Leagues processed */
  leaguesProcessed: number;
  /** API calls used */
  apiCallsUsed: number;
  /** Error messages */
  errors: string[];
}

/**
 * Sync log entry
 */
export interface SyncLog {
  /** Log ID */
  id: string;
  /** Sync timestamp */
  timestamp: Date;
  /** Strategy used */
  strategy: SyncStrategy;
  /** Result statistics */
  result: SyncResult;
  /** Success flag */
  success: boolean;
}

// ============================================================================
// LEAGUE CONFIGURATIONS
// ============================================================================

/**
 * Default league configurations based on tech spec
 */
export const DEFAULT_LEAGUE_CONFIGS: LeagueConfig[] = [
  // Tier 1 - Top 5 European Leagues
  { apiLeagueId: 39, name: 'Premier League', tier: 1, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: true },
  { apiLeagueId: 140, name: 'La Liga', tier: 1, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: true },
  { apiLeagueId: 135, name: 'Serie A', tier: 1, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: true },
  { apiLeagueId: 78, name: 'Bundesliga', tier: 1, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: true },
  { apiLeagueId: 61, name: 'Ligue 1', tier: 1, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: true },
  
  // Tier 2 - Major European Leagues
  { apiLeagueId: 94, name: 'Eredivisie', tier: 2, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: false },
  { apiLeagueId: 106, name: 'Primeira Liga', tier: 2, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: false },
  { apiLeagueId: 60, name: 'Serie A', tier: 2, includeInNormal: true, includeInDeadlineDay: true, includeInEmergency: false },
  
  // Tier 3 - Other Notable Leagues
  { apiLeagueId: 2, name: 'Champions League', tier: 3, includeInNormal: false, includeInDeadlineDay: true, includeInEmergency: false },
  { apiLeagueId: 3, name: 'Europa League', tier: 3, includeInNormal: false, includeInDeadlineDay: true, includeInEmergency: false },
];

// ============================================================================
// DATABASE SERVICE (MOCK FOR NOW)
// ============================================================================

/**
 * Database service interface
 * Will be replaced with actual Supabase integration
 */
export interface DatabaseService {
  /** Begin transaction */
  beginTransaction(): Promise<Transaction>;
  /** Get existing transfer by API ID */
  getTransferByApiId(apiTransferId: number): Promise<DatabaseTransfer | null>;
  /** Create transfer */
  createTransfer(transfer: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transfer>;
  /** Update transfer */
  updateTransfer(id: string, updates: Partial<Transfer>): Promise<Transfer>;
  /** Get or create club */
  getOrCreateClub(apiClubId: number, name: string): Promise<{ id: string }>;
  /** Get or create league */
  getOrCreateLeague(apiLeagueId: number, name: string): Promise<{ id: string }>;
  /** Record sync log */
  recordSyncLog(log: Omit<SyncLog, 'id'>): Promise<SyncLog>;
}

/**
 * Transaction interface
 */
export interface Transaction {
  /** Commit transaction */
  commit(): Promise<void>;
  /** Rollback transaction */
  rollback(): Promise<void>;
}

/**
 * Mock database service for development
 * Replace with actual Supabase implementation
 */
export class MockDatabaseService implements DatabaseService {
  private transfers: Map<string, Transfer> = new Map();
  private clubs: Map<number, { id: string }> = new Map();
  private leagues: Map<number, { id: string }> = new Map();
  private syncLogs: SyncLog[] = [];

  async beginTransaction(): Promise<Transaction> {
    return new MockTransaction();
  }

  async getTransferByApiId(apiTransferId: number): Promise<DatabaseTransfer | null> {
    for (const transfer of this.transfers.values()) {
      if (transfer.apiTransferId === apiTransferId) {
        return this.transferToDatabase(transfer);
      }
    }
    return null;
  }

  async createTransfer(transferData: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transfer> {
    const transfer: Transfer = {
      ...transferData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.transfers.set(transfer.id, transfer);
    return transfer;
  }

  async updateTransfer(id: string, updates: Partial<Transfer>): Promise<Transfer> {
    const existing = this.transfers.get(id);
    if (!existing) {
      throw new Error(`Transfer not found: ${id}`);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.transfers.set(id, updated);
    return updated;
  }

  async getOrCreateClub(apiClubId: number, name: string): Promise<{ id: string }> {
    if (!this.clubs.has(apiClubId)) {
      this.clubs.set(apiClubId, { id: crypto.randomUUID() });
    }
    return this.clubs.get(apiClubId)!;
  }

  async getOrCreateLeague(apiLeagueId: number, name: string): Promise<{ id: string }> {
    if (!this.leagues.has(apiLeagueId)) {
      this.leagues.set(apiLeagueId, { id: crypto.randomUUID() });
    }
    return this.leagues.get(apiLeagueId)!;
  }

  async recordSyncLog(log: Omit<SyncLog, 'id'>): Promise<SyncLog> {
    const syncLog: SyncLog = {
      ...log,
      id: crypto.randomUUID(),
    };
    
    this.syncLogs.push(syncLog);
    return syncLog;
  }

  private transferToDatabase(transfer: Transfer): DatabaseTransfer {
    return {
      ...transfer,
      created_at: transfer.createdAt.toISOString(),
      updated_at: transfer.updatedAt.toISOString(),
    };
  }
}

/**
 * Mock transaction implementation
 */
export class MockTransaction implements Transaction {
  async commit(): Promise<void> {
    // Mock commit
  }

  async rollback(): Promise<void> {
    // Mock rollback
  }
}

// ============================================================================
// SYNC ORCHESTRATOR
// ============================================================================

/**
 * Sync Orchestrator class
 * Manages transactional transfer data synchronization
 */
export class SyncOrchestrator {
  private transferService: TransferService;
  private databaseService: DatabaseService;
  private leagueConfigs: LeagueConfig[];

  constructor(
    databaseService: DatabaseService = new MockDatabaseService(),
    leagueConfigs: LeagueConfig[] = DEFAULT_LEAGUE_CONFIGS
  ) {
    this.transferService = new TransferService();
    this.databaseService = databaseService;
    this.leagueConfigs = leagueConfigs;
  }

  /**
   * Execute sync with specified strategy
   */
  async executeSync(strategy: SyncStrategy, season: number = 2025): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      strategy,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      duration: 0,
      leaguesProcessed: 0,
      apiCallsUsed: 0,
      errors: [],
    };

    // Get leagues for this strategy
    const leagues = this.getLeaguesForStrategy(strategy);
    result.leaguesProcessed = leagues.length;

    console.log(`🚀 Starting sync with strategy: ${strategy}`);
    console.log(`📊 Processing ${leagues.length} leagues`);

    try {
      // Begin transaction
      const transaction = await this.databaseService.beginTransaction();

      try {
        // Process each league
        for (const league of leagues) {
          try {
            await this.processLeague(league, season, transaction, result);
          } catch (error) {
            const errorMsg = `Failed to process league ${league.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            result.errors.push(errorMsg);
            result.failed++;
            console.error(errorMsg);
          }
        }

        // Commit transaction
        await transaction.commit();
        
        console.log(`✅ Sync completed successfully`);
        console.log(`📈 Processed ${result.successful} transfers, ${result.failed} failed`);
        
      } catch (error) {
        // Rollback on any error
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      const errorMsg = `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
      
      // Reset counters on failure
      result.successful = 0;
      result.failed = result.totalProcessed;
    }

    // Calculate duration
    result.duration = Date.now() - startTime;

    // Get API usage
    const rateLimitStatus = this.transferService.getRateLimitStatus();
    result.apiCallsUsed = rateLimitStatus.used;

    // Record sync log
    await this.recordSyncLog(result);

    return result;
  }

  /**
   * Process individual league
   */
  private async processLeague(
    league: LeagueConfig,
    season: number,
    transaction: Transaction,
    result: SyncResult
  ): Promise<void> {
    console.log(`🔄 Processing ${league.name} (ID: ${league.apiLeagueId})`);

    // Fetch transfers from API
    const apiResponse = await this.transferService.fetchTransfers({
      season,
      teamIds: this.getTeamIdsForLeague(league.apiLeagueId),
    });

    result.totalProcessed += apiResponse.response.length;

    // Transform and validate transfers
    const transfers = this.transferService.transformBatch(apiResponse.response);
    
    for (const transfer of transfers) {
      try {
        await this.processTransfer(transfer, transaction);
        result.successful++;
      } catch (error) {
        const errorMsg = `Failed to process transfer ${transfer.apiTransferId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        result.failed++;
      }
    }

    console.log(`✅ ${league.name}: ${transfers.length} transfers processed`);
  }

  /**
   * Process individual transfer
   */
  private async processTransfer(transfer: Transfer, transaction: Transaction): Promise<void> {
    // Validate transfer data
    const validationResult = TransferSchema.safeParse(transfer);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    // Check if transfer already exists
    const existing = await this.databaseService.getTransferByApiId(transfer.apiTransferId);
    
    if (existing) {
      // Update existing transfer
      await this.databaseService.updateTransfer(existing.id, transfer);
    } else {
      // Create new transfer
      await this.databaseService.createTransfer(transfer);
    }
  }

  /**
   * Get team IDs for a specific league
   */
  private getTeamIdsForLeague(leagueId: number): number[] {
    // Map league ID to internal league slug and get team IDs
    const leagueSlugMap: Record<number, string> = {
      39: 'premier-league',
      140: 'la-liga', 
      135: 'serie-a',
      78: 'bundesliga',
      61: 'ligue-1',
      94: 'eredivisie',
      106: 'primeira-liga',
      60: 'serie-a', // Portuguese Serie A
    };
    
    const leagueSlug = leagueSlugMap[leagueId];
    if (!leagueSlug) {
      console.warn(`No team mapping found for league ID: ${leagueId}`);
      return [];
    }
    
    return getTeamIdsByLeague(leagueSlug);
  }

  /**
   * Get leagues for specific strategy
   */
  private getLeaguesForStrategy(strategy: SyncStrategy): LeagueConfig[] {
    switch (strategy) {
      case 'normal':
        return this.leagueConfigs.filter(league => league.includeInNormal);
      case 'deadline_day':
        return this.leagueConfigs.filter(league => league.includeInDeadlineDay);
      case 'emergency':
        return this.leagueConfigs.filter(league => league.includeInEmergency);
      default:
        return [];
    }
  }

  /**
   * Record sync log
   */
  private async recordSyncLog(result: SyncResult): Promise<void> {
    const log: Omit<SyncLog, 'id'> = {
      timestamp: new Date(),
      strategy: result.strategy,
      result,
      success: result.failed === 0,
    };

    await this.databaseService.recordSyncLog(log);
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      rateLimit: this.transferService.getRateLimitStatus(),
      leagueConfigs: this.leagueConfigs.map(league => ({
        apiLeagueId: league.apiLeagueId,
        name: league.name,
        tier: league.tier,
      })),
    };
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Create sync orchestrator instance
 */
export function createSyncOrchestrator(
  databaseService?: DatabaseService,
  leagueConfigs?: LeagueConfig[]
): SyncOrchestrator {
  return new SyncOrchestrator(databaseService, leagueConfigs);
}

/**
 * Execute sync with automatic strategy selection
 */
export async function executeSyncWithAutoStrategy(
  season: number = 2025,
  context?: { isDeadlineDay?: boolean; isManualOverride?: boolean; strategy?: SyncStrategy }
): Promise<SyncResult> {
  const orchestrator = createSyncOrchestrator();
  
  // Determine strategy
  let strategy: SyncStrategy;
  
  if (context?.isManualOverride && context.strategy) {
    strategy = context.strategy;
  } else if (context?.isDeadlineDay) {
    strategy = 'deadline_day';
  } else {
    // Use transfer service to determine strategy based on rate limits
    strategy = orchestrator['transferService'].determineSyncStrategy(context);
  }
  
  return orchestrator.executeSync(strategy, season);
}
