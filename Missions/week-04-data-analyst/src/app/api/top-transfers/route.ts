import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { 
  successResponse, 
  errorResponse, 
  setCacheHeaders, 
  setRateLimitHeaders,
  APIError 
} from '@/lib/api/response';
import { validateQuery, TopTransfersQuerySchema, TopTransfersQueryParams } from '@/lib/api/validation';
import { applyRateLimit } from '@/lib/api/rate-limit';
import { createRequestHandler } from '@/lib/api/logger';

export const runtime = 'nodejs';

async function handleTopTransfers(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req, 'heavy');
    
    // Validate query parameters
    const params = new URL(req.url).searchParams;
    const query: TopTransfersQueryParams = validateQuery(TopTransfersQuerySchema, params);
    
    // Get Supabase client
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new APIError(500, 'Database connection failed');
    }

    // Build the query for top transfers by value
    let dbQuery = supabase
      .from('transfers')
      .select(`
        *,
        from_club:clubs!transfers_from_club_id_fkey (
          id,
          name,
          logo_url
        ),
        to_club:clubs!transfers_to_club_id_fkey (
          id,
          name,
          logo_url
        ),
        player:players (
          id,
          name,
          position,
          age
        )
      `)
      .not('transfer_value_usd', 'is', null)
      .order('transfer_value_usd', { ascending: false })
      .limit(query.limit);

    // Filter by window if specified
    if (query.window) {
      dbQuery = dbQuery.eq('window', query.window);
    }

    // Execute query
    const { data: transfers, error } = await dbQuery;

    if (error) {
      console.error('Database query error:', error);
      throw new APIError(500, 'Failed to fetch top transfers');
    }

    // Create response with caching and rate limit headers
    let response = successResponse(transfers || []);
    response = setCacheHeaders(response, 600, 900); // 10min fresh, 15min stale
    response = setRateLimitHeaders(response, rateLimitResult.limit, rateLimitResult.remaining, rateLimitResult.reset);

    return response;
  } catch (error) {
    console.error('Top transfers API error:', error);
    
    if (error instanceof APIError) {
      return errorResponse(error.status, error.message, error.details);
    }
    
    return errorResponse(500, 'Internal server error');
  }
}

export const GET = createRequestHandler(handleTopTransfers);
