/**
 * useSummaryQuery Hook Tests
 * Tests for data fetching, loading states, error handling, and refresh functionality
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSummaryQuery, useRefreshSummary } from '../use-summary-query'
import { queryKeys } from '@/lib/query-client'

// Mock the query client module
vi.mock('@/lib/query-client', () => ({
  queryKeys: {
    summary: ['summary']
  },
  queryConfig: {
    summary: {
      staleTime: 15 * 60 * 1000, // 15 minutes
      refetchInterval: 30 * 60 * 1000, // 30 minutes
    }
  }
}))

// Mock fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useSummaryQuery', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  })

  describe('Data Fetching', () => {
    it('fetches summary data successfully', async () => {
      const mockData = {
        todayCount: 12,
        windowTotal: 1247,
        totalSpend: 3420000000,
        mostActiveTeam: {
          name: 'Real Madrid',
          transfers: 8,
          logo: '/teams/real-madrid.png'
        },
        averageDailyTransfers: 10.7,
        windowType: 'MID-SEASON',
        isRecordHigh: true
      }

      // Mock the fetchSummary function by mocking the API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      const { result } = renderHook(() => useSummaryQuery(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
    })

    it('handles loading state correctly', () => {
      mockFetch.mockImplementationOnce(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useSummaryQuery(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeNull()
    })

    it('handles error state correctly', async () => {
      const mockError = new Error('Network error')
      mockFetch.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useSummaryQuery(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })

    it('retries on failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ todayCount: 12 })
        })

      const { result } = renderHook(() => useSummaryQuery(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      }, { timeout: 5000 })

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Data Structure', () => {
    it('returns data with correct structure', async () => {
      const mockData = {
        todayCount: 15,
        windowTotal: 1500,
        totalSpend: 5000000000,
        mostActiveTeam: {
          name: 'Barcelona',
          transfers: 12,
          logo: '/teams/barcelona.png'
        },
        averageDailyTransfers: 11.2,
        windowType: 'SUMMER',
        isRecordHigh: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      const { result } = renderHook(() => useSummaryQuery(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const data = result.current.data
      expect(data).toHaveProperty('todayCount')
      expect(data).toHaveProperty('windowTotal')
      expect(data).toHaveProperty('totalSpend')
      expect(data).toHaveProperty('mostActiveTeam')
      expect(data).toHaveProperty('averageDailyTransfers')
      expect(data).toHaveProperty('windowType')
      expect(data).toHaveProperty('isRecordHigh')

      // Check nested structure
      expect(data?.mostActiveTeam).toHaveProperty('name')
      expect(data?.mostActiveTeam).toHaveProperty('transfers')
      expect(data?.mostActiveTeam).toHaveProperty('logo')
    })
  })
})

describe('useRefreshSummary', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  })

  it('invalidates summary query when called', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    
    const { result } = renderHook(() => useRefreshSummary(), { wrapper })
    
    result.current()
    
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['summary']
    })
  })

  it('returns a function', () => {
    const { result } = renderHook(() => useRefreshSummary(), { wrapper })
    
    expect(typeof result.current).toBe('function')
  })
})

describe('Integration', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  })

  it('works together with refresh functionality', async () => {
    let callCount = 0
    const mockData = {
      todayCount: 12,
      windowTotal: 1247,
      totalSpend: 3420000000,
      mostActiveTeam: {
        name: 'Real Madrid',
        transfers: 8,
        logo: '/teams/real-madrid.png'
      },
      averageDailyTransfers: 10.7,
      windowType: 'MID-SEASON',
      isRecordHigh: true
    }

    mockFetch.mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: async () => ({ ...mockData, todayCount: callCount * 12 })
      })
    })

    const { result: dataResult } = renderHook(() => useSummaryQuery(), { wrapper })
    const { result: refreshResult } = renderHook(() => useRefreshSummary(), { wrapper })

    // Initial load
    await waitFor(() => {
      expect(dataResult.current.isSuccess).toBe(true)
    })
    expect(dataResult.current.data?.todayCount).toBe(12)

    // Refresh data
    refreshResult.current()

    await waitFor(() => {
      expect(dataResult.current.data?.todayCount).toBe(24)
    })

    expect(callCount).toBe(2)
  })
})
