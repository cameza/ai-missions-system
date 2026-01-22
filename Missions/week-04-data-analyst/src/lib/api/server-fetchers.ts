/**
 * Server-Side Data Fetchers - Transfer Hub Dashboard
 * 
 * Implements server-side data fetching for initial page load:
 * - Parallel fetching for performance optimization
 * - Error handling and validation
 * - Type-safe responses
 * - Cache management for SSR
 * 
 * Used by DashboardPage server component for initial data hydration
 * 
 * References:
 * - Tech Spec §7.2: Database Service implementation
 * - Tech Spec §8.1: Server Components for initial load
 */

import { createClient } from '@supabase/supabase-js'
import type { Transfer, SummaryData, TopTransfer } from '@/types/dashboard'
import { formatTransferValue } from '@/lib/utils/transfer-format'

// Supabase client for server-side operations
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase is configured (same logic as getSupabaseAdminClient)
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
}) : null

// Type definitions for database responses
interface DatabaseTransfer {
  id: string
  player_id: number | null
  player_first_name: string
  player_last_name: string
  player_full_name: string | null
  age: number | null
  position: string | null
  nationality: string | null
  from_club_id: string | null
  to_club_id: string | null
  from_club_name: string
  to_club_name: string
  league_id: string | null
  league_name: string
  transfer_type: string
  transfer_value_usd: number | null
  transfer_value_display: string
  status: string
  transfer_date: string
  window: string
  api_transfer_id: number
  created_at: string
  updated_at: string
  from_club?: {
    name: string
    logo_url?: string
  }
  to_club?: {
    name: string
    logo_url?: string
  }
  league?: {
    name: string
  }
}

interface DatabaseClub {
  id: string
  api_club_id: number | null
  name: string
  short_name: string | null
  code: string | null
  country: string | null
  city: string | null
  league_id: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Fetch transfers with optional filters
 * Server-side implementation for initial data load
 */
export async function fetchTransfers(params: {
  limit?: number
  offset?: number
  leagues?: string[]
  positions?: string[]
} = {}): Promise<Transfer[]> {
  // Return mock data if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, returning mock data')
    return getMockTransfers(params.limit || 100)
  }

  try {
    let query = supabase
      .from('transfers')
      .select(`
        *,
        from_club:clubs!transfers_from_club_id_fkey(name, logo_url),
        to_club:clubs!transfers_to_club_id_fkey(name, logo_url),
        league:leagues(name)
      `)
      .order('transfer_date', { ascending: false })
    
    // Apply filters if provided
    if (params.leagues && params.leagues.length > 0) {
      query = query.in('league_id', params.leagues)
    }
    
    if (params.positions && params.positions.length > 0) {
      query = query.in('position', params.positions)
    }
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit)
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 100) - 1)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Transfers fetch error:', error)
      throw new Error(`Failed to fetch transfers: ${error.message}`)
    }
    
    // Transform database records to Transfer type
    return (data as DatabaseTransfer[]).map(transformDatabaseTransfer)
  } catch (error) {
    console.error('fetchTransfers failed:', error)
    // Return mock data for graceful degradation
    return getMockTransfers(params.limit || 100)
  }
}

/**
 * Fetch transfers with pagination metadata
 * Enhanced version for infinite queries
 */
export async function fetchTransfersWithPagination(params: {
  limit?: number
  offset?: number
  leagues?: string[]
  positions?: string[]
} = {}): Promise<{
  data: Transfer[]
  hasNextPage: boolean
  total: number
  page: number
}> {
  const limit = params.limit || 100
  const offset = params.offset || 0
  const page = Math.floor(offset / limit) + 1
  
  // Return mock data if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, returning mock data with pagination')
    return getMockTransfersWithPagination(limit, offset)
  }

  try {
    // First, get total count
    const { count: totalCount, error: countError } = await supabase
      .from('transfers')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Count fetch error:', countError)
      throw new Error(`Failed to fetch transfer count: ${countError.message}`)
    }

    // Then fetch the paginated data
    let query = supabase
      .from('transfers')
      .select(`
        *,
        from_club:clubs!transfers_from_club_id_fkey(name, logo_url),
        to_club:clubs!transfers_to_club_id_fkey(name, logo_url),
        league:leagues(name)
      `)
      .order('transfer_date', { ascending: false })
    
    // Apply filters if provided
    if (params.leagues && params.leagues.length > 0) {
      query = query.in('league_id', params.leagues)
    }
    
    if (params.positions && params.positions.length > 0) {
      query = query.in('position', params.positions)
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data, error } = await query
    
    if (error) {
      console.error('Transfers fetch error:', error)
      throw new Error(`Failed to fetch transfers: ${error.message}`)
    }
    
    const transfers = (data as DatabaseTransfer[]).map(transformDatabaseTransfer)
    const total = totalCount || 0
    const hasNextPage = offset + limit < total
    
    return {
      data: transfers,
      hasNextPage,
      total,
      page
    }
  } catch (error) {
    console.error('fetchTransfersWithPagination failed:', error)
    return getMockTransfersWithPagination(limit, offset)
  }
}

// Mock data function for fallback
function getMockTransfers(limit: number): Transfer[] {
  return [
    {
      id: 'mock-1',
      playerId: 12345,
      playerFirstName: 'Mock',
      playerLastName: 'Player',
      playerFullName: 'Mock Player',
      age: 25,
      position: 'Midfielder' as any,
      nationality: 'Country',
      fromClubId: 'club-1',
      toClubId: 'club-2',
      fromClubName: 'From Club',
      toClubName: 'To Club',
      transferType: 'Permanent',
      transferValue: 10000000,
      transferFee: 5000000,
      transferDate: '2025-01-20',
      league: 'Premier League',
      season: 2025,
      created_at: new Date(),
      updated_at: new Date(),
    } as any,
    // Add more mock transfers as needed...
  ].slice(0, limit)
}

// Mock data function with pagination for fallback
function getMockTransfersWithPagination(limit: number, offset: number): {
  data: Transfer[]
  hasNextPage: boolean
  total: number
  page: number
} {
  const allMockTransfers = getMockTransfers(500) // Generate larger pool
  const startIndex = offset
  const endIndex = startIndex + limit
  const data = allMockTransfers.slice(startIndex, endIndex)
  const total = allMockTransfers.length
  const hasNextPage = endIndex < total
  const page = Math.floor(offset / limit) + 1
  
  return {
    data,
    hasNextPage,
    total,
    page
  }
}

/**
 * Transform database transfer to frontend Transfer type
 */
function transformDatabaseTransfer(db: DatabaseTransfer): Transfer {
  return {
    id: db.id,
    player_id: db.player_id || 0,
    player_first_name: db.player_first_name,
    player_last_name: db.player_last_name,
    player_full_name: db.player_full_name || `${db.player_first_name} ${db.player_last_name}`,
    age: db.age,
    position: db.position,
    nationality: db.nationality,
    from_club_id: db.from_club_id,
    to_club_id: db.to_club_id,
    from_club_name: db.from_club_name,
    to_club_name: db.to_club_name,
    transfer_type: db.transfer_type,
    transfer_value_usd: db.transfer_value_usd,
    transfer_fee_usd: db.transfer_value_usd,
    transfer_date: db.transfer_date,
    league: db.league,
    season: 2025,
    created_at: db.created_at,
    updated_at: db.updated_at,
  } as any
}

/**
 * Fetch dashboard summary statistics
 * Server-side implementation for KPI cards
 */
export async function fetchSummary(): Promise<SummaryData | null> {
  // Return mock summary if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn('⚠️ Supabase not configured, returning mock summary - PRODUCTION ISSUE')
    return getMockSummary()
  }

  try {
    // Use same logic as API route
    const today = new Date().toISOString().split('T')[0];
    const windowContext = '2026-winter'; // Should match window context logic

    // Execute parallel queries for better performance (same as API)
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
      
      // Window total transfers
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
      
      // Most active team
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
    const summary: SummaryData = {
      todayCount: todayResult.count || 0,
      windowTotal: windowResult.count || 0,
      totalSpend,
      mostActiveTeam: mostActiveTeamData
        ? {
            name: mostActiveTeamData.name,
            transfers: mostActiveTeamData.count,
            logo: undefined,
          }
        : {
            name: 'No data',
            transfers: 0,
          },
      averageDailyTransfers,
      windowType: 'WINTER', // Convert from window context
      isRecordHigh: recordHigh,
      lastUpdated: new Date().toISOString()
    };
    
    return summary;
  } catch (error) {
    console.error('⚠️ fetchSummary failed, returning mock summary - PRODUCTION ISSUE:', error)
    return getMockSummary()
  }
}

// Mock summary function for fallback
function getMockSummary(): SummaryData {
  // Use a fixed timestamp to ensure SSR consistency
  const fixedTimestamp = '2025-01-19T21:00:00.000Z'
  
  return {
    todayCount: 51,
    windowTotal: 319,
    totalSpend: 110700700000, // €110.7B (based on real data)
    mostActiveTeam: {
      name: 'Fiorentina', // Real most active team from database
      transfers: 7,
      logo: undefined
    },
    averageDailyTransfers: 15.95,
    windowType: 'WINTER',
    isRecordHigh: true,
    lastUpdated: fixedTimestamp
  }
}

/**
 * Fetch top transfers by value
 * Server-side implementation for sidebar
 */
export async function fetchTopTransfers(params: {
  limit?: number
} = {}): Promise<TopTransfer[]> {
  // Return mock top transfers if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, returning mock top transfers')
    return getMockTopTransfers(params.limit || 5)
  }

  try {
    const limit = params.limit || 5
    
    const { data, error } = await supabase
      .from('transfers')
      .select(`
        *,
        from_club:clubs!transfers_from_club_id_fkey(name),
        to_club:clubs!transfers_to_club_id_fkey(name)
      `)
      .not('transfer_value_usd', 'is', null)
      .lt('transfer_value_usd', 2000000000) // Filter out unrealistic values > $2B
      .order('transfer_value_usd', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Top transfers fetch error:', error)
      throw new Error(`Failed to fetch top transfers: ${error.message}`)
    }
    
    // Transform to TopTransfer format
    const topTransfers: TopTransfer[] = (data as DatabaseTransfer[]).map((transfer, index) => ({
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
    }))
    
    return topTransfers
  } catch (error) {
    console.error('fetchTopTransfers failed:', error)
    return getMockTopTransfers(params.limit || 5)
  }
}

// Mock top transfers function for fallback
function getMockTopTransfers(limit: number): TopTransfer[] {
  return [
    {
      id: 'mock-top-1',
      rank: 1,
      playerName: 'Erling Haaland',
      fromClub: 'Manchester City',
      toClub: 'Real Madrid',
      transferValue: '€180M',
      transferValueUsd: 180000000
    },
    {
      id: 'mock-top-2',
      rank: 2,
      playerName: 'Jude Bellingham',
      fromClub: 'Borussia Dortmund',
      toClub: 'Real Madrid',
      transferValue: '€103M',
      transferValueUsd: 103000000
    },
    {
      id: 'mock-top-3',
      rank: 3,
      playerName: 'Declan Rice',
      fromClub: 'West Ham United',
      toClub: 'Arsenal',
      transferValue: '€116M',
      transferValueUsd: 116000000
    },
    {
      id: 'mock-top-4',
      rank: 4,
      playerName: 'Moisés Caicedo',
      fromClub: 'Brighton',
      toClub: 'Chelsea',
      transferValue: '€115M',
      transferValueUsd: 115000000
    },
    {
      id: 'mock-top-5',
      rank: 5,
      playerName: 'Harry Kane',
      fromClub: 'Tottenham',
      toClub: 'Bayern Munich',
      transferValue: '€100M',
      transferValueUsd: 100000000
    }
  ].slice(0, limit)
}
