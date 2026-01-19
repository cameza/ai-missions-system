import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { 
  successResponse, 
  errorResponse, 
  setCacheHeaders, 
  setRateLimitHeaders,
  APIError 
} from '@/lib/api/response';
import { validateQuery, TransfersQuerySchema, TransfersQueryParams } from '@/lib/api/validation';
import { applyRateLimit } from '@/lib/api/rate-limit';
import { createRequestHandler } from '@/lib/api/logger';

export const runtime = 'nodejs';

async function handleTransfers(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req, 'api');
    
    // Validate query parameters
    const params = new URL(req.url).searchParams;
    const query: TransfersQueryParams = validateQuery(TransfersQuerySchema, params);
    
    // Get Supabase client
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new APIError(500, 'Database connection failed');
    }

    // Build the base query
    let dbQuery = supabase
      .from('transfers')
      .select(`
        *,
        from_club:clubs!transfers_from_club_id_fkey (
          id,
          name,
          logo_url,
          league_id
        ),
        to_club:clubs!transfers_to_club_id_fkey (
          id,
          name,
          logo_url,
          league_id
        ),
        player:players (
          id,
          name,
          position,
          age,
          nationality
        )
      `, { count: 'exact' });

    // Apply filters
    if (query.leagues && query.leagues.length > 0) {
      dbQuery = dbQuery.or(`from_club.league_id.in.(${query.leagues.join(',')}),to_club.league_id.in.(${query.leagues.join(',')})`);
    }

    if (query.positions && query.positions.length > 0) {
      dbQuery = dbQuery.in('player.position', query.positions);
    }

    if (query.transferTypes && query.transferTypes.length > 0) {
      dbQuery = dbQuery.in('transfer_type', query.transferTypes);
    }

    if (query.minValue !== undefined) {
      dbQuery = dbQuery.gte('transfer_value_usd', query.minValue);
    }

    if (query.maxValue !== undefined) {
      dbQuery = dbQuery.lte('transfer_value_usd', query.maxValue);
    }

    if (query.startDate) {
      dbQuery = dbQuery.gte('transfer_date', query.startDate);
    }

    if (query.endDate) {
      dbQuery = dbQuery.lte('transfer_date', query.endDate);
    }

    if (query.search) {
      dbQuery = dbQuery.ilike('player.name', `%${query.search}%`);
    }

    if (query.status !== 'all') {
      dbQuery = dbQuery.eq('status', query.status);
    }

    // Apply sorting
    const sortColumn = query.sortBy === 'player_name' ? 'player.name' : query.sortBy;
    dbQuery = dbQuery.order(sortColumn, { ascending: query.sortOrder === 'asc' });

    // Apply pagination
    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery.range(offset, offset + query.limit - 1);

    // Execute query
    const { data: transfers, error, count } = await dbQuery;

    if (error) {
      console.error('Database query error:', error);
      throw new APIError(500, 'Failed to fetch transfers');
    }

    // Build pagination metadata
    const total = count || 0;
    const hasMore = offset + query.limit < total;
    const pagination = {
      page: query.page,
      limit: query.limit,
      total,
      hasMore,
    };

    // Create response with caching and rate limit headers
    let response = successResponse(transfers || [], { pagination });
    response = setCacheHeaders(response, 300, 600); // 5min fresh, 10min stale
    response = setRateLimitHeaders(response, rateLimitResult.limit, rateLimitResult.remaining, rateLimitResult.reset);

    return response;
  } catch (error) {
    console.error('Transfers API error:', error);
    
    if (error instanceof APIError) {
      return errorResponse(error.status, error.message, error.details);
    }
    
    return errorResponse(500, 'Internal server error');
  }
}

export const GET = createRequestHandler(handleTransfers);
