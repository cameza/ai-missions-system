import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { 
  successResponse, 
  errorResponse, 
  setCacheHeaders, 
  setRateLimitHeaders,
  APIError 
} from '@/lib/api/response';
import { applyRateLimit } from '@/lib/api/rate-limit';
import { createRequestHandler } from '@/lib/api/logger';
import { formatTransferValue } from '@/lib/utils/transfer-format';

export const runtime = 'nodejs';

async function handleLatestDeals(req: NextRequest) {
  try {
    // Apply rate limiting (same pattern as top-transfers)
    const rateLimitResult = await applyRateLimit(req, 'heavy');
    
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new APIError(500, 'Database connection failed');
    }

    // Query: Most recent 5 transfers by transfer_date DESC
    const { data: transfers, error } = await supabase
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
      .order('transfer_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Database query error:', error);
      throw new APIError(500, 'Failed to fetch latest deals');
    }

    // Transform to LatestDeal format
    const latestDeals = (transfers || []).map((transfer: any, index: number) => ({
      id: transfer.id,
      rank: index + 1,
      playerName: `${transfer.player_first_name} ${transfer.player_last_name}`,
      fromClub: transfer.from_club?.name || transfer.from_club_name || 'Unknown',
      toClub: transfer.to_club?.name || transfer.to_club_name || 'Unknown',
      transferValue: transfer.transfer_value_display || formatTransferValue(transfer.transfer_value_usd),
      transferDate: transfer.transfer_date
    }));

    const responseData = {
      data: latestDeals,
      timestamp: new Date().toISOString()
    };

    let response = successResponse(responseData);
    response = setCacheHeaders(response, 300, 300); // 5min fresh, 5min stale (max 10min total)
    response = setRateLimitHeaders(response, rateLimitResult.limit, rateLimitResult.remaining, rateLimitResult.reset);

    return response;
  } catch (error) {
    console.error('Latest deals API error:', error);
    
    if (error instanceof APIError) {
      return errorResponse(error.status, error.message, error.details);
    }
    
    return errorResponse(500, 'Internal server error');
  }
}

export const GET = createRequestHandler(handleLatestDeals);
