/**
 * Transfer Sync API Route
 * 
 * Next.js API route for triggering transfer data synchronization
 * using Transfermarkt scraping for fresh transfer data.
 * 
 * Replaces API-Football with Transfermarkt scraping for new transfers
 * 
 * @version 2.0
 * @since 2026-01-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeTransfermarktTransfers } from '../../../../lib/transfermarkt-scraper';
import { seedTransfermarktData } from '../../../../lib/transfermarkt-seeder';
import { globalErrorLogger, withRetry } from '../../../../lib/error-handler';
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
  useTop10: z.boolean().optional().default(true),
  pageCount: z.number().min(1).max(10).optional().default(3),
  season: z.number().min(2020).max(2030).optional().default(2025),
  isDeadlineDay: z.boolean().optional().default(false),
  isManualOverride: z.boolean().optional().default(false),
  isCronTrigger: z.boolean().optional().default(false),
  manualToken: z.string().optional(),
});

export type SyncRequestPayload = z.infer<typeof SyncRequestSchema>;

/**
 * Sync response schema
 */
const SyncResponseSchema = z.object({
  success: z.boolean(),
  strategy: z.enum(['transfermarkt']),
  season: z.number(),
  result: z.object({
    strategy: z.enum(['transfermarkt']),
    totalProcessed: z.number(),
    successful: z.number(),
    failed: z.number(),
    duration: z.number(),
    pagesScraped: z.number(),
    transfersInserted: z.number(),
    transfersUpdated: z.number(),
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
  contextOverrides?: Partial<SyncContext>;
  skipManualRateLimit?: boolean;
}

/**
 * Detects if a request is from Vercel cron job based on Authorization header
 */
function isVercelCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn('⚠️ CRON_SECRET not configured');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function processSyncRequest(
  validatedBody: SyncRequestPayload,
  options: SyncProcessingOptions = {}
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const isCronTrigger = options.forceCron ?? validatedBody.isCronTrigger ?? false;
    const isManualRequest = !isCronTrigger;

    // Manual request authentication
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
    const useTop10 = validatedBody.useTop10 ?? true;
    let pageCount = validatedBody.pageCount ?? 3;
    let totalScrapedPages = 0;
    let totalNewTransfers = 0;
    let adaptiveScrapingRounds = 0;
    const MAX_ADAPTIVE_ROUNDS = 3; // Prevent infinite loops

    const context: SyncContext = {
      isDeadlineDay: options.contextOverrides?.isDeadlineDay ?? validatedBody.isDeadlineDay ?? false,
      isManualOverride: options.contextOverrides?.isManualOverride ?? validatedBody.isManualOverride ?? isManualRequest,
      isCronTrigger,
    };

    console.log(`🚀 Starting Transfermarkt sync: season=${season}, top10=${useTop10}, initialPages=${pageCount}, trigger=${isCronTrigger ? 'cron' : 'manual'}`);

    // Adaptive scraping loop
    do {
      adaptiveScrapingRounds++;
      console.log(`📄 Adaptive scraping round ${adaptiveScrapingRounds}: scraping ${pageCount} pages...`);

      // Execute Transfermarkt scraping with retry
      const scrapingResult = await withRetry(
        () => scrapeTransfermarktTransfers({
          useTop10,
          pageCount,
          startPage: totalScrapedPages + 1, // Continue from where we left off
        }),
        {
          maxAttempts: 3,
          initialDelay: 2000,
          backoffMultiplier: 2,
          maxDelay: 10000,
        },
        { season, endpoint: '/api/sync/transfers', context }
      );

      if (!scrapingResult.success || scrapingResult.transfers.length === 0) {
        console.log(`⚠️ No more transfers found or scraping failed. Stopping adaptive scraping.`);
        break;
      }

      console.log(`📊 Scraped ${scrapingResult.totalFound} transfers from ${scrapingResult.pagesScraped} pages`);
      totalScrapedPages += scrapingResult.pagesScraped;

      // Seed data to Supabase
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
      }

      const seedingResult = await withRetry(
        () => seedTransfermarktData(scrapingResult.transfers, supabaseUrl, supabaseServiceKey),
        {
          maxAttempts: 2,
          initialDelay: 1000,
          backoffMultiplier: 2,
          maxDelay: 5000,
        },
        { season, endpoint: '/api/sync/transfers', context }
      );

      if (!seedingResult.success) {
        throw new Error(`Database seeding failed: ${seedingResult.errors.join(', ')}`);
      }

      console.log(`🌱 Seeded ${seedingResult.transfersProcessed} transfers: ${seedingResult.transfersInserted} inserted, ${seedingResult.transfersUpdated} updated`);
      totalNewTransfers += seedingResult.transfersInserted;

      // Check if we should continue scraping (all transfers were new AND we haven't exceeded limits)
      if (seedingResult.allNewTransfers && adaptiveScrapingRounds < MAX_ADAPTIVE_ROUNDS && totalScrapedPages < 10) {
        console.log(`🔄 All transfers were new! Expanding to scrape ${pageCount} more pages...`);
        // Continue with same page count for next round
      } else {
        console.log(`✅ Stopping adaptive scraping. Reasons:`);
        if (!seedingResult.allNewTransfers) console.log(`  - Some existing transfers found`);
        if (adaptiveScrapingRounds >= MAX_ADAPTIVE_ROUNDS) console.log(`  - Max adaptive rounds reached`);
        if (totalScrapedPages >= 10) console.log(`  - Max pages limit reached`);
        break;
      }

    } while (true);

    console.log(`🎯 Adaptive scraping completed:`);
    console.log(`  - Total pages scraped: ${totalScrapedPages}`);
    console.log(`  - Total new transfers: ${totalNewTransfers}`);
    console.log(`  - Adaptive rounds: ${adaptiveScrapingRounds}`);

    // Return final aggregated results
    const response = {
      success: true,
      strategy: 'transfermarkt' as const,
      season,
      result: {
        strategy: 'transfermarkt' as const,
        totalProcessed: totalNewTransfers,
        successful: totalNewTransfers,
        failed: 0,
        duration: Date.now() - startTime,
        pagesScraped: totalScrapedPages,
        transfersInserted: totalNewTransfers,
        transfersUpdated: 0, // We'd need to track this across rounds if needed
        errors: [],
        adaptiveScrapingRounds,
      },
      timestamp: new Date().toISOString(),
      rateLimitStatus: {
        used: 0,
        limit: 3000,
        remaining: 3000,
        emergencyMode: false,
        cacheHits: 0,
        usagePercentage: 0,
      },
      context: {
        isDeadlineDay: context.isDeadlineDay,
        isManualOverride: context.isManualOverride,
        isCronTrigger,
      },
    };

    const validatedResponse = SyncResponseSchema.parse(response);
    return NextResponse.json(validatedResponse);

  } catch (error) {
    console.error('❌ Transfermarkt sync failed:', error);
    
    // Log the error
    globalErrorLogger.logError(error as Error, {
      endpoint: '/api/sync/transfers',
      method: 'POST',
      body: validatedBody,
      context: { isCronTrigger: options.forceCron ?? validatedBody.isCronTrigger ?? false }
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// ============================================================================
// HTTP HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check if this is a Vercel cron request
    if (isVercelCronRequest(request)) {
      console.log('🤖 Vercel cron job triggered');
      
      // Execute sync with cron context
      const result = await processSyncRequest(
        {
          useTop10: true,
          pageCount: 3,
          season: 2025,
          isDeadlineDay: false,
          isManualOverride: false,
          isCronTrigger: true,
        },
        { forceCron: true, skipManualRateLimit: true }
      );
      
      return result;
    }
    
    // Regular status endpoint (existing logic)
    return NextResponse.json({
      status: {
        rateLimit: {
          used: 0,
          limit: 3000,
          remaining: 3000,
          emergencyMode: false,
          cacheHits: 0,
          usagePercentage: 0,
        },
        leagueConfigs: [], // Not applicable for Transfermarkt
        recentErrors: [],
        errorStats: {
          total: 0,
          byCategory: {},
          bySeverity: {},
          recent24h: 0,
        },
        syncMetrics: {
          totalSyncs: 0,
          successfulSyncs: 0,
          failedSyncs: 0,
          averageDuration: 0,
          totalTransfersProcessed: 0,
          totalApiCallsUsed: 0,
          lastSyncTime: null,
          deadlineDaySyncs: 0,
          emergencyModeSyncs: 0,
          manualSyncs: 0,
          cronSyncs: 0,
        },
        recentSyncLogs: [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ GET endpoint failed:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedBody = SyncRequestSchema.parse(body);
    
    return await processSyncRequest(validatedBody);
  } catch (error) {
    console.error('❌ POST endpoint failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request body',
        details: error.issues,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
