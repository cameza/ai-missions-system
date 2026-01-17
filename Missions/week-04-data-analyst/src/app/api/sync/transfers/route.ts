/**
 * Transfer Sync API Route
 * 
 * Next.js API route for triggering transfer data synchronization
 * with different strategies and monitoring.
 * 
 * Tech Spec §7.5: API Endpoints
 * 
 * @version 1.0
 * @since 2025-01-17
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SyncOrchestrator, createSyncOrchestrator } from '../../../../lib/sync-orchestrator';
import { SyncStrategy } from '../../../../lib/transfer-service';
import { globalErrorLogger, withRetry } from '../../../../lib/error-handler';
import { getSyncStrategy, isDeadlineDay, getNextSyncInterval } from '../../../../lib/scheduling';
import { syncLogger, logSyncOperation } from '../../../../lib/sync-logger';
import { revalidatePath } from 'next/cache';
import { acquireManualSyncSlot } from '../../../../lib/manual-sync-rate-limit';

// ============================================================================
// API TYPES & SCHEMAS
// ============================================================================

/**
 * Sync request body schema
 */
const SyncRequestSchema = z.object({
  strategy: z.enum(['normal', 'deadline_day', 'emergency']).optional(),
  season: z.number().min(2020).max(2030).optional(),
  isDeadlineDay: z.boolean().optional(),
  isManualOverride: z.boolean().optional(),
  isCronTrigger: z.boolean().optional(),
  manualToken: z.string().optional(),
});

export type SyncRequestPayload = z.infer<typeof SyncRequestSchema>;

/**
 * Sync response schema
 */
const SyncResponseSchema = z.object({
  success: z.boolean(),
  strategy: z.enum(['normal', 'deadline_day', 'emergency']),
  season: z.number(),
  result: z.object({
    strategy: z.enum(['normal', 'deadline_day', 'emergency']),
    totalProcessed: z.number(),
    successful: z.number(),
    failed: z.number(),
    duration: z.number(),
    leaguesProcessed: z.number(),
    apiCallsUsed: z.number(),
    errors: z.array(z.string()),
  }),
  timestamp: z.string(),
  rateLimitStatus: z.object({
    used: z.number(),
    limit: z.number(),
    remaining: z.number(),
    emergencyMode: z.boolean(),
    cacheHits: z.number(),
    usagePercentage: z.number(),
  }),
});

// ============================================================================
// API HANDLER
// ============================================================================

type SyncContext = {
  isDeadlineDay: boolean;
  isManualOverride: boolean;
  isCronTrigger: boolean;
};

interface SyncProcessingOptions {
  forceCron?: boolean;
  forceStrategy?: SyncStrategy;
  contextOverrides?: Partial<SyncContext>;
  skipManualRateLimit?: boolean;
}

export async function processSyncRequest(
  validatedBody: SyncRequestPayload,
  options: SyncProcessingOptions = {}
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const isCronTrigger = options.forceCron ?? validatedBody.isCronTrigger ?? false;
    const isManualRequest = !isCronTrigger;

    if (isManualRequest) {
      const expectedToken = process.env.MANUAL_SYNC_TOKEN;
      const providedToken = validatedBody.manualToken;

      if (!providedToken) {
        return NextResponse.json({
          success: false,
          error: 'Manual sync token is required for authenticated triggers.',
          timestamp: new Date().toISOString(),
        }, { status: 400 });
      }

      if (expectedToken && providedToken !== expectedToken) {
        return NextResponse.json({
          success: false,
          error: 'Invalid manual sync token',
          timestamp: new Date().toISOString(),
        }, { status: 401 });
      }

      if (!options.skipManualRateLimit) {
        const rateLimitResult = await acquireManualSyncSlot(providedToken);
        if (!rateLimitResult.allowed) {
          return NextResponse.json({
            success: false,
            error:
              rateLimitResult.reason ||
              'Manual sync rate limit exceeded. Please wait at least 1 hour between manual syncs.',
            nextAllowedAt: rateLimitResult.nextAllowedAt?.toISOString() ?? null,
            source: rateLimitResult.source,
            timestamp: new Date().toISOString(),
          }, { status: 429 });
        }
      }
    }

    const season = validatedBody.season || 2025;

    let strategy: SyncStrategy;
    if (options.forceStrategy) {
      strategy = options.forceStrategy;
    } else if (validatedBody.strategy) {
      strategy = validatedBody.strategy;
    } else {
      strategy = getSyncStrategy();
    }

    const context: SyncContext = {
      isDeadlineDay: options.contextOverrides?.isDeadlineDay ?? validatedBody.isDeadlineDay ?? isDeadlineDay(),
      isManualOverride: options.contextOverrides?.isManualOverride ?? validatedBody.isManualOverride ?? isManualRequest,
      isCronTrigger,
    };

    console.log(`🚀 Starting transfer sync: strategy=${strategy}, season=${season}, trigger=${isCronTrigger ? 'cron' : 'manual'}`);

    const orchestrator = createSyncOrchestrator();
    const result = await withRetry(
      () => orchestrator.executeSync(strategy, season),
      {
        maxAttempts: 2,
        initialDelay: 5000,
        backoffMultiplier: 2,
        maxDelay: 30000,
      },
      { strategy, season, endpoint: '/api/sync/transfers', context }
    );

    const rateLimitStatus = orchestrator.getSyncStatus().rateLimit;

    if (result.failed === 0) {
      try {
        revalidatePath('/');
        console.log('🔄 Cache invalidated after successful sync');
      } catch (cacheError) {
        console.warn('⚠️ Cache invalidation failed:', cacheError);
      }
    }

    logSyncOperation(
      strategy,
      season,
      isCronTrigger ? 'cron' : 'manual',
      context,
      result,
      rateLimitStatus
    );

    const response = {
      success: result.failed === 0,
      strategy: result.strategy,
      season,
      result,
      timestamp: new Date().toISOString(),
      rateLimitStatus,
      context: {
        isDeadlineDay: context.isDeadlineDay,
        isManualOverride: context.isManualOverride,
        isCronTrigger,
        nextSyncInterval: isCronTrigger ? null : getNextSyncInterval(),
      },
    };

    const validatedResponse = SyncResponseSchema.parse(response);

    console.log(`✅ Sync completed: ${result.successful} successful, ${result.failed} failed`);
    console.log(`⏱️ Duration: ${result.duration}ms`);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    const loggedError = await globalErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      {
        endpoint: '/api/sync/transfers',
        method: 'POST',
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: false,
      error: loggedError.message,
      category: loggedError.category,
      severity: loggedError.severity,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  } finally {
    const duration = Date.now() - startTime;
    console.log(`📊 API request completed in ${duration}ms`);
  }
}

/**
 * POST /api/sync/transfers
 * 
 * Trigger transfer data synchronization
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedBody = SyncRequestSchema.parse(body);
    return await processSyncRequest(validatedBody);
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : 500;
    const loggedError = await globalErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      {
        endpoint: '/api/sync/transfers',
        method: 'POST',
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: false,
      error: loggedError.message,
      category: loggedError.category,
      severity: loggedError.severity,
      timestamp: new Date().toISOString(),
    }, { status });
  }
}

/**
 * GET /api/sync/transfers
 * 
 * Get sync status and configuration
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Create sync orchestrator
    const orchestrator = createSyncOrchestrator();
    
    // Get current status
    const status = orchestrator.getSyncStatus();
    
    // Get recent errors
    const recentErrors = globalErrorLogger.getRecentErrors(5);
    
    // Get error statistics
    const errorStats = globalErrorLogger.getErrorStats();
    
    // Get sync metrics
    const syncMetrics = syncLogger.getMetrics();
    
    // Get recent sync logs
    const recentSyncLogs = syncLogger.getRecentLogs(5);

    return NextResponse.json({
      status,
      recentErrors: recentErrors.map(error => ({
        id: error.id,
        message: error.message,
        category: error.category,
        severity: error.severity,
        timestamp: error.timestamp,
      })),
      errorStats,
      syncMetrics,
      recentSyncLogs,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const loggedError = await globalErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)), 
      {
        endpoint: '/api/sync/transfers',
        method: 'GET',
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: false,
      error: loggedError.message,
      category: loggedError.category,
      severity: loggedError.severity,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate API key from request headers
 */
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedApiKey = process.env.SYNC_API_KEY;
  
  // Skip validation if no key is configured (development)
  if (!expectedApiKey) {
    return true;
  }
  
  return apiKey === expectedApiKey;
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Log API request
 */
function logAPIRequest(
  method: string,
  ip: string,
  userAgent?: string,
  body?: any
): void {
  console.log(`📡 API Request: ${method} /api/sync/transfers`);
  console.log(`🌐 IP: ${ip}`);
  if (userAgent) {
    console.log(`🖥️ User-Agent: ${userAgent}`);
  }
  if (body) {
    console.log(`📦 Body:`, JSON.stringify(body, null, 2));
  }
}
