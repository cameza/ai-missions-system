/**
 * API Route: /api/summary
 * 
 * Provides dashboard summary data for KPI cards:
 * - Today's transfer count with comparison to average
 * - Window total transfers with context
 * - Total spend with record indicator
 * - Most active team with transfer count
 * 
 * Data Source: Supabase database with optimized queries
 * Response Format: JSON with SummaryData interface
 * 
 * Performance:
 * - Cached for 15 minutes (staleTime)
 * - Refetch every 30 minutes (background)
 * - Optimized database queries with indexes
 */

import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase client only when environment variables are available
const getSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are not configured')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Cache headers for performance optimization
const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800', // 15min cache, 30min stale
  'CDN-Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
}

export async function GET(request: NextRequest) {
  try {
    // Get Supabase client
    const supabase = getSupabaseClient()
    
    // Get current date for filtering
    const today = new Date().toISOString().split('T')[0]
    
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
        .eq('date', today),
      
      // Window total transfers
      supabase
        .from('transfers')
        .select('id', { count: 'exact' })
        .eq('window_type', 'CURRENT'),
      
      // Total spend
      supabase
        .from('transfers')
        .select('fee')
        .eq('window_type', 'CURRENT')
        .not('fee', 'is', null),
      
      // Most active team - simplified query without group
      supabase
        .from('transfers')
        .select('team_name, team_logo')
        .eq('window_type', 'CURRENT')
        .not('team_name', 'is', null)
        .limit(100), // Get all transfers and count in application
      
      // Average daily transfers (last 7 days)
      supabase
        .from('transfers')
        .select('date', { count: 'exact' })
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ])

    // Handle any database errors
    if (todayResult.error) throw todayResult.error
    if (windowResult.error) throw windowResult.error
    if (spendResult.error) throw spendResult.error
    if (mostActiveResult.error) throw mostActiveResult.error
    if (averageResult.error) throw averageResult.error

    // Calculate total spend
    const totalSpend = spendResult.data?.reduce((sum: number, transfer: any) => sum + (transfer.fee || 0), 0) || 0

    // Calculate average daily transfers
    const uniqueDays = new Set(averageResult.data?.map((t: any) => t.date)).size || 1
    const averageDailyTransfers = (averageResult.count || 0) / uniqueDays

    // Determine window type (could be dynamic based on date)
    const currentMonth = new Date().getMonth()
    const windowType = currentMonth >= 6 && currentMonth <= 8 ? 'SUMMER' : 
                      currentMonth >= 12 || currentMonth <= 1 ? 'WINTER' : 'MID-SEASON'

    // Check if this is a record high (compare with historical data)
    const isRecordHigh = totalSpend > 3000000000 // €3B threshold for demo

    // Get most active team data - count transfers by team
    const teamTransfers = mostActiveResult.data?.reduce((acc: any, transfer: any) => {
      const teamName = transfer.team_name || 'Unknown'
      if (!acc[teamName]) {
        acc[teamName] = { name: teamName, logo: transfer.team_logo, count: 0 }
      }
      acc[teamName].count++
      return acc
    }, {})

    const mostActiveTeamData = Object.values(teamTransfers || {}).sort((a: any, b: any) => b.count - a.count)[0] || {
      name: 'No data',
      logo: null,
      count: 0
    }

    // Build response data
    const summaryData = {
      todayCount: todayResult.count || 0,
      windowTotal: windowResult.count || 0,
      totalSpend,
      mostActiveTeam: {
        name: (mostActiveTeamData as any).name || 'No data',
        transfers: (mostActiveTeamData as any).count || 0,
        logo: (mostActiveTeamData as any).logo
      },
      averageDailyTransfers: Math.round(averageDailyTransfers * 10) / 10, // Round to 1 decimal
      windowType,
      isRecordHigh,
      lastUpdated: new Date().toISOString()
    }

    // Return cached response
    return NextResponse.json(summaryData, {
      status: 200,
      headers: cacheHeaders
    })

  } catch (error) {
    console.error('Error fetching summary data:', error)
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch summary data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
