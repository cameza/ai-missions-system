import { NextRequest, NextResponse } from 'next/server';
import { PlayerEnrichmentService, APIRateLimiter } from '@/lib/player-enrichment-service';
import { EnrichmentPipeline, SupabaseDatabaseService } from '@/lib/enrichment-pipeline';
import { CachedPlayerEnrichmentService } from '@/lib/player-cache';

// Rate limiter implementation (simplified version)
class SimpleAPIRateLimiter implements APIRateLimiter {
  private callsRemaining: number;
  private resetTime: Date;
  private emergencyMode: boolean = false;
  private dailyLimit: number;
  
  constructor(dailyLimit: number) {
    this.dailyLimit = dailyLimit;
    this.callsRemaining = dailyLimit;
    this.resetTime = this.getNextReset();
  }
  
  async throttledRequest<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we need to reset the counter
    this.checkAndResetCounter();
    
    // Check if we need to enter emergency mode
    if (this.callsRemaining <= this.dailyLimit * 0.1) { // 10% buffer
      this.emergencyMode = true;
    }
    
    if (this.emergencyMode) {
      return this.getCachedOrEmergencyData(fn);
    }
    
    this.callsRemaining--;
    return fn();
  }
  
  private checkAndResetCounter(): void {
    const now = new Date();
    if (now >= this.resetTime) {
      console.log('Resetting rate limiter counter');
      this.callsRemaining = this.dailyLimit;
      this.resetTime = this.getNextReset();
      this.emergencyMode = false;
    }
  }
  
  private async getCachedOrEmergencyData<T>(fn: () => Promise<T>): Promise<T> {
    // Return cached data or throw for non-critical operations
    throw new Error('Rate limit exceeded - using cached data');
  }
  
  private getNextReset(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
  
  getRemainingCalls(): number {
    this.checkAndResetCounter();
    return this.callsRemaining;
  }
  
  getResetTime(): Date {
    return this.resetTime;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { season, resumeFromId, useCache = true } = body;
    
    // Validate input
    if (!season || typeof season !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Season is required and must be a number',
      }, { status: 400 });
    }
    
    console.log(`Starting player enrichment for season ${season}`);
    
    // Initialize services
    const rateLimiter = new SimpleAPIRateLimiter(3000); // 3000 calls per day limit
    const playerService = new PlayerEnrichmentService(
      process.env.API_FOOTBALL_KEY!,
      rateLimiter
    );
    
    const dbService = new SupabaseDatabaseService(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    // Initialize enrichment pipeline
    let pipeline: EnrichmentPipeline;
    let playerServiceWithCache: any;
    
    if (useCache) {
      // Use cached enrichment service
      playerServiceWithCache = new CachedPlayerEnrichmentService(playerService, dbService);
      await playerServiceWithCache.initializeCache();
      pipeline = new EnrichmentPipeline(playerServiceWithCache, dbService);
    } else {
      // Use direct enrichment service
      pipeline = new EnrichmentPipeline(playerService, dbService);
    }
    
    // Run enrichment
    const progress = await pipeline.enrichTransfers(season, resumeFromId);
    
    // Persist cache if used
    if (useCache && playerServiceWithCache) {
      await playerServiceWithCache.persistCache();
    }
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      progress: {
        ...progress,
        duration: duration,
        startTime: progress.startTime.toISOString(),
      },
      cacheStats: useCache && playerServiceWithCache ? playerServiceWithCache.getCacheStats() : null,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Player enrichment failed:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      duration,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Get enrichment statistics
  try {
    const { searchParams } = new URL(request.url);
    const includeFailed = searchParams.get('includeFailed') === 'true';
    
    const dbService = new SupabaseDatabaseService(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    const stats = await dbService.getEnrichmentStats();
    
    let failedEnrichments: any[] = [];
    if (includeFailed) {
      // Get recent failed enrichments (last 50)
      const failed = await dbService.getFailedEnrichments(3);
      failedEnrichments = failed.slice(0, 50).map(log => ({
        transferId: log.transfer_id,
        playerId: log.player_id,
        error: log.error,
        timestamp: log.timestamp.toISOString(),
        retryCount: log.retry_count,
      }));
    }
    
    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        enrichmentRate: Math.round(stats.enrichmentRate * 100), // Convert to percentage
      },
      failedEnrichments: failedEnrichments,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Failed to get enrichment stats:', error);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Retry failed enrichments
export async function PATCH(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { season, maxRetries = 3 } = body;
    
    if (!season || typeof season !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Season is required and must be a number',
      }, { status: 400 });
    }
    
    console.log(`Retrying failed player enrichments for season ${season}`);
    
    // Initialize services
    const rateLimiter = new SimpleAPIRateLimiter(3000);
    const playerService = new PlayerEnrichmentService(
      process.env.API_FOOTBALL_KEY!,
      rateLimiter
    );
    
    const dbService = new SupabaseDatabaseService(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    const pipeline = new EnrichmentPipeline(playerService, dbService);
    
    // Retry failed enrichments
    const progress = await pipeline.retryFailedTransfers(season, maxRetries);
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      progress: {
        ...progress,
        duration: duration,
        startTime: progress.startTime.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Retry enrichment failed:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      duration,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
