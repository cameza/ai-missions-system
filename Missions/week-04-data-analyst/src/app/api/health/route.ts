/**
 * Health Check API Endpoint
 * 
 * Validates system readiness for transfer data synchronization.
 * Checks database connectivity, API-Football availability, and environment configuration.
 * 
 * Tech Spec §10.4: Monitoring & Observability
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: CheckStatus;
    apiFootball: CheckStatus;
    environment: CheckStatus;
  };
  details: {
    version: string;
    uptime: number;
    environment: string;
  };
}

interface CheckStatus {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
}

// ============================================================================
// HEALTH CHECK HANDLERS
// ============================================================================

/**
 * Check Supabase database connectivity
 */
async function checkDatabase(): Promise<CheckStatus> {
  const startTime = Date.now();
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'fail',
        message: 'Supabase credentials not configured',
        responseTime: Date.now() - startTime,
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        },
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple query to test connection
    const { data, error } = await supabase
      .from('transfers')
      .select('id')
      .limit(1);

    if (error) {
      return {
        status: 'fail',
        message: `Database query failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        details: {
          errorCode: error.code,
          errorHint: error.hint,
        },
      };
    }

    return {
      status: 'pass',
      message: 'Database connection successful',
      responseTime: Date.now() - startTime,
      details: {
        connected: true,
      },
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Check API-Football availability
 */
async function checkAPIFootball(): Promise<CheckStatus> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    const baseUrl = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';

    if (!apiKey) {
      return {
        status: 'fail',
        message: 'API-Football key not configured',
        responseTime: Date.now() - startTime,
        details: {
          hasKey: false,
        },
      };
    }

    // Test API connectivity with status endpoint
    const response = await fetch(`${baseUrl}/status`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'fail',
        message: `API-Football returned ${response.status}: ${response.statusText}`,
        responseTime,
        details: {
          statusCode: response.status,
          statusText: response.statusText,
        },
      };
    }

    const data = await response.json();

    // Check rate limit status from response headers or body
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitLimit = response.headers.get('x-ratelimit-limit');

    return {
      status: 'pass',
      message: 'API-Football connection successful',
      responseTime,
      details: {
        connected: true,
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
        rateLimitLimit: rateLimitLimit ? parseInt(rateLimitLimit) : undefined,
        account: data?.response?.account || 'unknown',
      },
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `API-Football check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
      details: {
        errorType: error instanceof Error ? error.name : 'Unknown',
      },
    };
  }
}

/**
 * Check environment configuration
 */
function checkEnvironment(): CheckStatus {
  const requiredVars = [
    'API_FOOTBALL_KEY',
    'API_FOOTBALL_BASE_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const optionalVars = [
    'SYNC_API_KEY',
    'MANUAL_SYNC_TOKEN',
    'SLACK_WEBHOOK_URL',
    'ERROR_WEBHOOK_URL',
  ];

  const missing: string[] = [];
  const present: string[] = [];
  const optional: string[] = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      optional.push(varName);
    }
  });

  if (missing.length > 0) {
    return {
      status: 'fail',
      message: `Missing required environment variables: ${missing.join(', ')}`,
      details: {
        missing,
        present,
        optional,
      },
    };
  }

  return {
    status: 'pass',
    message: 'All required environment variables configured',
    details: {
      required: present.length,
      optional: optional.length,
      optionalConfigured: optional,
    },
  };
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks: HealthCheckResult['checks']): HealthCheckResult['status'] {
  const statuses = [checks.database.status, checks.apiFootball.status, checks.environment.status];

  if (statuses.includes('fail')) {
    return 'unhealthy';
  }

  if (statuses.includes('warn')) {
    return 'degraded';
  }

  return 'healthy';
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * GET /api/health
 * 
 * Returns comprehensive health check status
 * 
 * Responses:
 * - 200: System healthy or degraded
 * - 503: System unhealthy
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Run all checks in parallel
    const [databaseCheck, apiFootballCheck, environmentCheck] = await Promise.all([
      checkDatabase(),
      checkAPIFootball(),
      checkEnvironment(),
    ]);

    const checks = {
      database: databaseCheck,
      apiFootball: apiFootballCheck,
      environment: environmentCheck,
    };

    const overallStatus = determineOverallStatus(checks);

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      details: {
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      },
    };

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    return NextResponse.json(result, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'fail',
          message: 'Health check error',
        },
        apiFootball: {
          status: 'fail',
          message: 'Health check error',
        },
        environment: {
          status: 'fail',
          message: 'Health check error',
        },
      },
      details: {
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      },
    };

    return NextResponse.json(errorResult, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } finally {
    const duration = Date.now() - startTime;
    console.log(`🏥 Health check completed in ${duration}ms`);
  }
}
