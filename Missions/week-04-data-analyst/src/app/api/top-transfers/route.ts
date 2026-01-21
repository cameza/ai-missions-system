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
import { formatTransferValue } from '@/lib/utils/transfer-format';

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
        )
      `)
      .not('transfer_value_usd', 'is', null)
      .lt('transfer_value_usd', 50000000000) // Filter out unrealistic values > €500M (stored in cents)
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

    // Add debug logging
    console.log('Top transfers query result:', {
      count: transfers?.length,
      topTransfer: transfers?.[0],
      error
    });

    // Transform database records to TopTransfer format
    const topTransfers = (transfers || []).map((transfer: any, index: number) => ({
      id: transfer.id,
      rank: index + 1,
      playerName: `${transfer.player_first_name} ${transfer.player_last_name}`,
      fromClub: transfer.from_club?.name || transfer.from_club_name || 'Unknown',
      toClub: transfer.to_club?.name || transfer.to_club_name || 'Unknown',
      transferValue: transfer.transfer_value_display || formatTransferValue(transfer.transfer_value_usd),
      transferValueUsd: transfer.transfer_value_usd || 0,
      transferDate: (() => {
        const dateStr = transfer.transfer_date;
        const [year, month, day] = dateStr.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        return localDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
      })()
    }));

    // Get total count in window for metadata
    const { count: totalInWindow } = await supabase
      .from('transfers')
      .select('*', { count: 'exact', head: true })
      .not('transfer_value_usd', 'is', null)
      .lt('transfer_value_usd', 50000000000); // Match main query filter (< €500M)

    // Create response with proper TopTransfersResponse structure
    const responseData = {
      data: topTransfers,
      window: query.window || 'current',
      totalInWindow: totalInWindow || 0
    };

    // Create response with caching and rate limit headers
    let response = successResponse(responseData);
    response = setCacheHeaders(response, 60, 120); // 1min fresh, 2min stale - reduced for debugging
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
