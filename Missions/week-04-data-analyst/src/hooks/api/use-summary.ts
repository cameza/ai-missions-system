/**
 * Use Summary Hook
 * 
 * Custom React hook for fetching and managing dashboard summary data
 * using TanStack Query. Provides caching, retry logic, and error handling.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transferAPI } from '@/lib/api/transfer-api-service';
import { queryKeys } from '@/lib/api/query-keys';
import type { SummaryData } from '@/types';

/**
 * Options for useSummary hook
 */
export interface UseSummaryOptions {
  /** Whether the query should be enabled */
  enabled?: boolean;
  /** Custom stale time in milliseconds */
  staleTime?: number;
  /** Custom cache time in milliseconds */
  gcTime?: number;
  /** Custom refetch interval in milliseconds */
  refetchInterval?: number;
}

/**
 * Custom hook for fetching dashboard summary data
 * 
 * Features:
 * - Longer caching for summary data (changes less frequently)
 * - Background refetching for real-time updates
 * - Retry logic with exponential backoff
 * - Request deduplication
 * - Type-safe error handling
 * - Optimized for dashboard KPI cards
 * 
 * @param options - Hook configuration options
 * @returns Query result with summary data and loading states
 */
export function useSummary(options: UseSummaryOptions = {}) {
  const { 
    enabled = true, 
    staleTime = 15 * 60 * 1000, // 15 minutes
    gcTime = 30 * 60 * 1000, // 30 minutes
    refetchInterval = 30 * 60 * 1000, // 30 minutes
  } = options;

  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: queryKeys.summary.all,
    queryFn: () => transferAPI.fetchSummary(),
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 4, // Extended for proper exponential backoff (1s, 2s, 4s, 8s)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    enabled,
    
    // Select and transform data for optimal performance
    select: (data: SummaryData) => {
      // Ensure all required fields have fallback values
      return {
        todayCount: data.todayCount || 0,
        windowTotal: data.windowTotal || 0,
        totalSpend: data.totalSpend || 0,
        mostActiveTeam: data.mostActiveTeam || {
          name: 'No data',
          transfers: 0,
          logo: undefined,
        },
        averageDailyTransfers: data.averageDailyTransfers || 0,
        windowType: data.windowType || 'MID-SEASON',
        isRecordHigh: data.isRecordHigh || false,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    },
  });

  // Force refresh summary data
  const refreshSummary = () => {
    return result.refetch();
  };

  // Invalidate summary cache
  const invalidateSummary = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
  };

  // Check if data is stale (older than 5 minutes)
  const isDataStale = () => {
    if (!result.data?.lastUpdated) return true;
    
    const lastUpdated = new Date(result.data.lastUpdated);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return lastUpdated < fiveMinutesAgo;
  };

  return {
    ...result,
    // Additional utility functions
    refreshSummary,
    invalidateSummary,
    isDataStale,
    
    // Computed states
    hasTransfersToday: (result.data?.todayCount || 0) > 0,
    hasHighActivity: (result.data?.windowTotal || 0) > 100,
    hasSignificantSpend: (result.data?.totalSpend || 0) > 100000000, // > €1M
    
    // Formatted values for display
    formattedTotalSpend: result.data ? formatCurrency(result.data.totalSpend) : '€0',
    formattedTodayCount: result.data?.todayCount?.toString() || '0',
    formattedWindowTotal: result.data?.windowTotal?.toString() || '0',
    formattedAverageDaily: result.data?.averageDailyTransfers?.toFixed(1) || '0.0',
  };
}

/**
 * Format currency for display
 * Converts USD cents to formatted display string
 */
function formatCurrency(amountInCents: number): string {
  if (!amountInCents || amountInCents === 0) {
    return '€0';
  }
  
  const amountInEuros = amountInCents / 100; // Convert cents to euros
  
  if (amountInEuros >= 1000000000) {
    return `€${(amountInEuros / 1000000000).toFixed(1)}B`;
  } else if (amountInEuros >= 1000000) {
    return `€${(amountInEuros / 1000000).toFixed(1)}M`;
  } else if (amountInEuros >= 1000) {
    return `€${(amountInEuros / 1000).toFixed(1)}K`;
  } else {
    return `€${amountInEuros.toFixed(0)}`;
  }
}

/**
 * Hook for summary with real-time updates
 * 
 * Provides more frequent updates for real-time dashboard scenarios
 * like during transfer deadline day.
 */
export function useRealTimeSummary(options: Omit<UseSummaryOptions, 'refetchInterval'> = {}) {
  return useSummary({
    ...options,
    refetchInterval: 60 * 1000, // 1 minute for real-time updates
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
  });
}

/**
 * Hook for summary with minimal updates
 * 
 * Provides less frequent updates for better performance
 * when real-time data is not critical.
 */
export function useStaticSummary(options: Omit<UseSummaryOptions, 'refetchInterval'> = {}) {
  return useSummary({
    ...options,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
  });
}
