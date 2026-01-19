/**
 * Use Top Transfers Hook
 * 
 * Custom React hook for fetching and managing top transfer data
 * using TanStack Query. Provides caching, retry logic, and error handling.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transferAPI } from '@/lib/api/transfer-api-service';
import { queryKeys } from '@/lib/api/query-keys';
import type { TopTransfersQueryParams, TopTransfersResponse, TopTransfer } from '@/types';

/**
 * Options for useTopTransfers hook
 */
export interface UseTopTransfersOptions {
  /** Query parameters for top transfers */
  params?: TopTransfersQueryParams;
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
 * Custom hook for fetching top transfers data
 * 
 * Features:
 * - Configurable caching for top transfers data
 * - Background refetching for updates
 * - Retry logic with exponential backoff
 * - Request deduplication
 * - Type-safe error handling
 * - Optimized for leaderboards and rankings
 * 
 * @param options - Hook configuration options
 * @returns Query result with top transfers data and loading states
 */
export function useTopTransfers(options: UseTopTransfersOptions = {}) {
  const { 
    params = {}, 
    enabled = true, 
    staleTime = 10 * 60 * 1000, // 10 minutes
    gcTime = 15 * 60 * 1000, // 15 minutes
    refetchInterval = 15 * 60 * 1000, // 15 minutes
  } = options;

  const queryClient = useQueryClient();

  // Create query key with params
  const queryKey = queryKeys.topTransfers.list(params);

  const result = useQuery({
    queryKey,
    queryFn: () => transferAPI.fetchTopTransfers(params),
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 4, // Extended for proper exponential backoff (1s, 2s, 4s, 8s)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    enabled,
    
    // Select and transform data for optimal performance
    select: (data: TopTransfersResponse) => {
      // Ensure data is properly sorted by value (highest first)
      const sortedData = [...data.data].sort((a, b) => (b.transferValueUsd || 0) - (a.transferValueUsd || 0));
      
      return {
        ...data,
        data: sortedData.map((transfer, index) => ({
          ...transfer,
          rank: index + 1, // Ensure correct ranking
        })),
        totalInWindow: data.totalInWindow || data.data.length,
      };
    },
  });

  // Force refresh top transfers data
  const refreshTopTransfers = () => {
    return result.refetch();
  };

  // Invalidate top transfers cache
  const invalidateTopTransfers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.all });
  };

  // Get top transfer by rank
  const getTopTransferByRank = (rank: number): TopTransfer | undefined => {
    return result.data?.data.find(transfer => transfer.rank === rank);
  };

  // Get transfers above certain value
  const getTransfersAboveValue = (valueUsd: number): TopTransfer[] => {
    return result.data?.data.filter(transfer => 
      (transfer.transferValueUsd || 0) >= valueUsd
    ) || [];
  };

  return {
    ...result,
    // Additional utility functions
    refreshTopTransfers,
    invalidateTopTransfers,
    getTopTransferByRank,
    getTransfersAboveValue,
    
    // Computed states
    hasData: (result.data?.data.length || 0) > 0,
    topTransfer: result.data?.data[0], // Highest value transfer
    totalValue: result.data?.data.reduce((sum, transfer) => sum + (transfer.transferValueUsd || 0), 0) || 0,
    averageValue: result.data?.data.length ? 
      (result.data.data.reduce((sum, transfer) => sum + (transfer.transferValueUsd || 0), 0) / result.data.data.length) : 0,
    
    // Formatted values for display
    formattedTotalValue: formatTransferValue(result.data?.data.reduce((sum, transfer) => sum + (transfer.transferValueUsd || 0), 0) || 0),
    formattedAverageValue: formatTransferValue(Math.round(
      (result.data?.data.reduce((sum, transfer) => sum + (transfer.transferValueUsd || 0), 0) || 0) / 
      (result.data?.data.length || 1)
    )),
  };
}

/**
 * Hook for top transfers by specific window
 * 
 * Provides filtered top transfers for a specific transfer window
 */
export function useTopTransfersByWindow(window: string, options: Omit<UseTopTransfersOptions, 'params'> = {}) {
  return useTopTransfers({
    ...options,
    params: {
      window,
    },
  });
}

/**
 * Hook for limited top transfers
 * 
 * Returns a limited number of top transfers for UI components
 * that only need a few results (e.g., top 3, top 5)
 */
export function useLimitedTopTransfers(limit: number = 5, options: Omit<UseTopTransfersOptions, 'params'> = {}) {
  const result = useTopTransfers({
    ...options,
    params: {
      limit,
    },
  });

  return {
    ...result,
    // Ensure we only return the requested number of results
    data: result.data ? {
      ...result.data,
      data: result.data.data.slice(0, limit),
    } : undefined,
  };
}

/**
 * Format transfer value for display
 * Converts USD cents to formatted display string
 */
function formatTransferValue(valueUsd?: number): string {
  if (!valueUsd || valueUsd === 0) {
    return 'FREE';
  }
  
  const millions = valueUsd / 1000000; // Convert cents to millions
  
  if (millions >= 1000) {
    return `€${(millions / 1000).toFixed(1)}B`;
  } else {
    return `€${millions.toFixed(1)}M`;
  }
}

/**
 * Hook for top transfers with real-time updates
 * 
 * Provides more frequent updates for real-time scenarios
 * like during transfer deadline day.
 */
export function useRealTimeTopTransfers(options: UseTopTransfersOptions = {}) {
  return useTopTransfers({
    ...options,
    refetchInterval: 5 * 60 * 1000, // 5 minutes for real-time updates
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
  });
}
