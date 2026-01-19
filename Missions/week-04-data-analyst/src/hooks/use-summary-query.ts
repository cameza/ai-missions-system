/**
 * useSummaryQuery Hook - Transfer Hub Dashboard
 * 
 * Implements Tech Spec §6 data fetching for dashboard KPI cards:
 * - Consumes /api/summary endpoint
 * - 15m staleTime, 30m refetch interval
 * - Returns structured data for all four KPI cards
 * - Handles loading and error states
 * 
 * Data Structure:
 * - todayCount: Number of transfers today
 * - windowTotal: Total transfers in current window
 * - totalSpend: Total spend in currency
 * - mostActiveTeam: Team with most transfers
 * - averageDailyTransfers: For comparison calculations
 */
'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys, queryConfig } from '@/lib/query-client'

export interface SummaryData {
  todayCount: number
  windowTotal: number
  totalSpend: number
  mostActiveTeam: {
    name: string
    transfers: number
    logo?: string
  }
  averageDailyTransfers: number
  windowType?: 'MID-SEASON' | 'SUMMER' | 'WINTER'
  isRecordHigh?: boolean
}

// Mock API function - replace with actual API call
const fetchSummary = async (): Promise<SummaryData> => {
  // Call the real API endpoint
  const response = await fetch('/api/summary')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch summary: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Hook for fetching dashboard summary data
 * Returns data formatted for KPI cards with proper TypeScript types
 */
export const useSummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.summary,
    queryFn: fetchSummary,
    ...queryConfig.summary,
    enabled: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for manual refresh of summary data
 */
export const useRefreshSummary = () => {
  const queryClient = useQueryClient()
  
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.summary })
  }
  
  return refresh
}
