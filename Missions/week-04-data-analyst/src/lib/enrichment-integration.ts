/**
 * Player Enrichment Integration
 * 
 * Integration layer for adding player data enrichment to existing sync pipeline
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { PlayerEnrichmentService, APIRateLimiter } from './player-enrichment-service';
import { EnrichmentPipeline, SupabaseDatabaseService } from './enrichment-pipeline';
import { CachedPlayerEnrichmentService } from './player-cache';

// Simple rate limiter for enrichment
class EnrichmentRateLimiter implements APIRateLimiter {
  private callsRemaining: number;
  private dailyLimit: number;
  
  constructor(dailyLimit: number = 3000) {
    this.dailyLimit = dailyLimit;
    this.callsRemaining = dailyLimit;
  }
  
  async throttledRequest<T>(fn: () => Promise<T>): Promise<T> {
    if (this.callsRemaining <= 0) {
      throw new Error('Rate limit exceeded for player enrichment');
    }
    
    this.callsRemaining--;
    return fn();
  }
  
  getRemainingCalls(): number {
    return this.callsRemaining;
  }
}

/**
 * Enrichment integration options
 */
export interface EnrichmentOptions {
  useCache?: boolean;
  season?: number;
  retryFailed?: boolean;
  maxRetries?: number;
  batchSize?: number;
}

/**
 * Enrichment integration result
 */
export interface EnrichmentIntegrationResult {
  success: boolean;
  totalProcessed: number;
  succeeded: number;
  failed: number;
  duration: number;
  cacheStats?: {
    size: number;
    hitRate: number;
    expiredCount: number;
  };
  errors?: string[];
}

/**
 * Player Enrichment Integration Class
 * 
 * Provides a simple interface to integrate player enrichment
 * with existing sync pipelines
 */
export class PlayerEnrichmentIntegration {
  private pipeline: EnrichmentPipeline;
  private cachedPlayerService?: CachedPlayerEnrichmentService;
  
  constructor(options: EnrichmentOptions = {}) {
    // Initialize services
    const rateLimiter = new EnrichmentRateLimiter(3000);
    const playerService = new PlayerEnrichmentService(
      process.env.API_FOOTBALL_KEY!,
      rateLimiter
    );
    
    const dbService = new SupabaseDatabaseService(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    // Use cached service if requested
    if (options.useCache) {
      this.cachedPlayerService = new CachedPlayerEnrichmentService(playerService, dbService);
      this.pipeline = new EnrichmentPipeline(this.cachedPlayerService, dbService);
    } else {
      this.pipeline = new EnrichmentPipeline(playerService, dbService);
    }
  }
  
  /**
   * Initialize the enrichment service (loads cache from database if enabled)
   */
  async initialize(): Promise<void> {
    if (this.cachedPlayerService) {
      await this.cachedPlayerService.initializeCache();
    }
  }
  
  /**
   * Run player enrichment for a specific season
   */
  async enrichPlayers(season: number, options: Partial<EnrichmentOptions> = {}): Promise<EnrichmentIntegrationResult> {
    const startTime = Date.now();
    
    try {
      // Combine constructor options with method options
      const mergedOptions = { ...options };
      
      // Run enrichment
      const progress = await this.pipeline.enrichTransfers(season);
      
      // Retry failed enrichments if requested
      if (options.retryFailed && progress.failed > 0) {
        const retryProgress = await this.pipeline.retryFailedTransfers(
          season,
          options.maxRetries || 3
        );
        
        // Combine results
        progress.succeeded += retryProgress.succeeded;
        progress.failed = retryProgress.failed;
      }
      
      // Persist cache if used
      if (this.cachedPlayerService) {
        await this.cachedPlayerService.persistCache();
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        totalProcessed: progress.processed,
        succeeded: progress.succeeded,
        failed: progress.failed,
        duration,
        cacheStats: this.cachedPlayerService ? this.cachedPlayerService.getCacheStats() : undefined,
        errors: progress.errors.map(e => e.error),
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        totalProcessed: 0,
        succeeded: 0,
        failed: 0,
        duration,
        errors: [errorMessage],
      };
    }
  }
  
  /**
   * Get enrichment statistics
   */
  async getStats(): Promise<{
    totalTransfers: number;
    enrichedTransfers: number;
    enrichmentRate: number;
    failedEnrichments: number;
    cacheStats?: {
      size: number;
      hitRate: number;
      expiredCount: number;
    };
  }> {
    const dbService = new SupabaseDatabaseService(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    const stats = await dbService.getEnrichmentStats();
    
    return {
      ...stats,
      enrichmentRate: Math.round(stats.enrichmentRate * 100), // Convert to percentage
      cacheStats: this.cachedPlayerService ? this.cachedPlayerService.getCacheStats() : undefined,
    };
  }
  
  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<number> {
    if (this.cachedPlayerService) {
      return this.cachedPlayerService.clearExpiredCache();
    }
    return 0;
  }
  
  /**
   * Clear all cache entries
   */
  clearCache(): void {
    if (this.cachedPlayerService) {
      this.cachedPlayerService.clearCache();
    }
  }
}

/**
 * Convenience function to create and run enrichment
 */
export async function runPlayerEnrichment(
  season: number,
  options: EnrichmentOptions = {}
): Promise<EnrichmentIntegrationResult> {
  const integration = new PlayerEnrichmentIntegration(options);
  await integration.initialize();
  return integration.enrichPlayers(season, options);
}

/**
 * Convenience function to get enrichment statistics
 */
export async function getEnrichmentStatistics(): Promise<{
  totalTransfers: number;
  enrichedTransfers: number;
  enrichmentRate: number;
  failedEnrichments: number;
}> {
  const integration = new PlayerEnrichmentIntegration();
  const stats = await integration.getStats();
  
  return {
    totalTransfers: stats.totalTransfers,
    enrichedTransfers: stats.enrichedTransfers,
    enrichmentRate: stats.enrichmentRate,
    failedEnrichments: stats.failedEnrichments,
  };
}

/**
 * Example usage in existing sync pipeline:
 * 
 * ```typescript
 * // After successful transfer sync
 * if (syncResult.success && syncResult.newTransfers > 0) {
 *   const enrichmentResult = await runPlayerEnrichment(season, {
 *     useCache: true,
 *     retryFailed: true,
 *     maxRetries: 2,
 *   });
 *   
 *   console.log('Enrichment completed:', enrichmentResult);
 * }
 * ```
 */
