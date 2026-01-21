import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { 
  successResponse, 
  errorResponse, 
  setCacheHeaders, 
  setRateLimitHeaders,
  APIError 
} from '@/lib/api/response';
import { validateQuery, SummaryQuerySchema, SummaryQueryParams } from '@/lib/api/validation';
import { applyRateLimit } from '@/lib/api/rate-limit';
import { createRequestHandler } from '@/lib/api/logger';
import { resolveWindowContext } from '@/lib/utils/window-context';

export const runtime = 'nodejs';

interface SummaryResponse {
  todayCount: number;
  windowTotal: number;
  totalSpend: number;
  mostActiveTeam: {
    name: string;
    transfers: number;
    logo?: string;
  } | null;
  averageDailyTransfers: number;
  isRecordHigh: boolean;
  windowType: string;
}

async function handleSummary(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req, 'api');
    
    // Validate query parameters
    const params = new URL(req.url).searchParams;
    const query: SummaryQueryParams = validateQuery(SummaryQuerySchema, params);
    
    // Get Supabase client
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new APIError(500, 'Database connection failed');
    }

    // Get current date and window context
    const today = new Date().toISOString().split('T')[0];
    const windowContext = await resolveWindowContext(supabase);

    // Execute parallel queries for better performance
    const [
      todayResult,
      windowResult,
      spendResult,
      mostActiveResult,
      averageResult
    ] = await Promise.all([
      // Today's transfers
      supabase
        .from('transfers')
        .select('id', { count: 'exact' })
        .eq('transfer_date', today),
      
      // Window total transfers (assuming current window)
      supabase
        .from('transfers')
        .select('id', { count: 'exact' })
        .eq('window', windowContext),
      
      // Total spend
      supabase
        .from('transfers')
        .select('transfer_value_usd')
        .eq('window', windowContext)
        .not('transfer_value_usd', 'is', null),
      
      // Most active team - use denormalized club names (always populated)
      supabase
        .from('transfers')
        .select('from_club_name, to_club_name')
        .eq('window', windowContext)
        .limit(1000),
      
      // Average daily transfers (last 30 days)
      supabase
        .from('transfers')
        .select('transfer_date', { count: 'exact' })
        .gte('transfer_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ]);

    // Handle any database errors
    if (todayResult.error) throw todayResult.error;
    if (windowResult.error) throw windowResult.error;
    if (spendResult.error) throw spendResult.error;
    if (mostActiveResult.error) throw mostActiveResult.error;
    if (averageResult.error) throw averageResult.error;

    // Calculate total spend
    const totalSpend = spendResult.data?.reduce((sum: number, transfer: any) => 
      sum + (transfer.transfer_value_usd || 0), 0) || 0;

    // Calculate average daily transfers with proper rounding
    const uniqueDays = new Set(averageResult.data?.map((t: any) => t.transfer_date)).size || 1;
    const averageDailyTransfers = Math.round(((averageResult.count || 0) / uniqueDays) * 100) / 100;

    // Check if this is a record high (simple threshold for demo)
    const recordHigh = totalSpend > 3000000000; // $3B threshold

    // Calculate most active team using denormalized club names
    const teamCounts = new Map<string, { name: string; count: number }>();
    
    mostActiveResult.data?.forEach((transfer: any) => {
      // Count from club transfers (exclude "Without Club")
      if (transfer.from_club_name && transfer.from_club_name !== 'Without Club') {
        const clubName = transfer.from_club_name;
        const existing = teamCounts.get(clubName) || { name: clubName, count: 0 };
        existing.count++;
        teamCounts.set(clubName, existing);
      }
      
      // Count to club transfers (exclude "Without Club")
      if (transfer.to_club_name && transfer.to_club_name !== 'Without Club') {
        const clubName = transfer.to_club_name;
        const existing = teamCounts.get(clubName) || { name: clubName, count: 0 };
        existing.count++;
        teamCounts.set(clubName, existing);
      }
    });

    // Find most active team
    const mostActiveTeamArray = Array.from(teamCounts.values());
    const mostActiveTeamData = mostActiveTeamArray.length > 0 
      ? mostActiveTeamArray.sort((a, b) => b.count - a.count)[0]
      : null;

    // Build response data
    const summaryData: SummaryResponse = {
      todayCount: todayResult.count || 0,
      windowTotal: windowResult.count || 0,
      totalSpend,
      mostActiveTeam: mostActiveTeamData
        ? {
            name: mostActiveTeamData.name,
            transfers: mostActiveTeamData.count,
            logo: undefined,
          }
        : null,
      averageDailyTransfers,
      isRecordHigh: recordHigh,
      windowType: windowContext
    };

    // Create response with caching and rate limit headers
    let response = successResponse(summaryData);
    response = setCacheHeaders(response, 900, 1800); // 15min fresh, 30min stale
    response = setRateLimitHeaders(response, rateLimitResult.limit, rateLimitResult.remaining, rateLimitResult.reset);

    return response;
  } catch (error) {
    console.error('Summary API error:', error);
    
    if (error instanceof APIError) {
      return errorResponse(error.status, error.message, error.details);
    }
    
    return errorResponse(500, 'Internal server error');
  }
}

export const GET = createRequestHandler(handleSummary);
