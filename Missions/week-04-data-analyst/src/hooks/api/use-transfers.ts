/**
 * Use Transfers Hook
 * 
 * Custom React hook for fetching and managing transfer data using TanStack Query.
 * Provides caching, retry logic, and error handling for transfer listings.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { transferAPI } from '@/lib/api/transfer-api-service';
import { queryKeys } from '@/lib/api/query-keys';
import type { 
  TransfersQueryParams, 
  TransfersResponse,
  Transfer 
} from '@/types';

/**
 * Options for useTransfers hook
 */
export interface UseTransfersOptions {
  /** Transfer filters and pagination parameters */
  filters?: TransfersQueryParams;
  /** Whether to query should be enabled */
  enabled?: boolean;
  /** Custom stale time in milliseconds */
  staleTime?: number;
  /** Custom garbage collection time in milliseconds */
  gcTime?: number;
  /** Number of items per page */
  limit?: number;
  /** Custom refetch interval in milliseconds */
  refetchInterval?: number;
}

/**
 * Custom hook for fetching transfers with TanStack Query
 * 
 * Features:
 * - Automatic caching with configurable stale time
 * - Background refetching
 * - Retry logic with exponential backoff
 * - Request deduplication
 * - Type-safe error handling
 * - Optimized for large datasets with pagination
 * 
 * @param options - Hook configuration options
 * @returns Query result with transfers data and loading states
 */
export function useTransfers(options: UseTransfersOptions = {}) {
  const { 
    filters = {}, 
    enabled = true, 
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
    refetchInterval = 10 * 60 * 1000, // 10 minutes
  } = options;

  const queryClient = useQueryClient();

  // Create query key with filters
  const queryKey = queryKeys.transfers.list(filters);

  const result = useQuery({
    queryKey,
    queryFn: () => transferAPI.fetchTransfers(filters),
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 4, // Extended for proper exponential backoff (1s, 2s, 4s, 8s)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    enabled,
    
    // Select and transform data for optimal performance
    select: (data: TransfersResponse) => {
      // Apply client-side pagination safety
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      
      return {
        ...data,
        data: data.data.slice(offset, offset + limit),
        hasMore: data.total > offset + limit,
      };
    },
  });

  // Prefetch next page for better UX
  const prefetchNextPage = async () => {
    if (!result.data?.hasMore) return;

    const nextFilters = {
      ...filters,
      offset: (filters.offset || 0) + (filters.limit || 100),
    };

    await queryClient.prefetchQuery({
      queryKey: queryKeys.transfers.list(nextFilters),
      queryFn: () => transferAPI.fetchTransfers(nextFilters),
      staleTime,
      gcTime,
    });
  };

  // Invalidate transfers cache (useful for data updates)
  const invalidateTransfers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
  };

  // Refetch transfers data
  const refetchTransfers = () => {
    return result.refetch();
  };

  return {
    ...result,
    // Additional utility functions
    prefetchNextPage,
    invalidateTransfers,
    refetchTransfers,
    
    // Computed states
    isEmpty: result.data?.data.length === 0,
    hasData: (result.data?.data.length || 0) > 0,
    currentPage: Math.floor((filters.offset || 0) / (filters.limit || 100)) + 1,
    totalPages: Math.ceil((result.data?.total || 0) / (filters.limit || 100)),
  };
}

/**
 * Hook for infinite scroll transfers
 * 
 * Provides infinite scroll functionality for transfer listings
 * with automatic loading of more pages as user scrolls.
 */
export function useInfiniteTransfers(options: Omit<UseTransfersOptions, 'offset'> = {}) {
  const { filters = {}, enabled = true } = options;
  const limit = filters.limit || 50;
  const queryClient = useQueryClient();

  const result = useInfiniteQuery({
    queryKey: ['transfers', 'list', { ...filters, infinite: true }],
    queryFn: ({ pageParam = 0 }) => 
      transferAPI.fetchTransfers({ ...filters, limit, offset: pageParam }),
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (!lastPage?.hasMore) return undefined;
      return lastPage.data.length; // Use actual data length as next offset
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled,
    
    // For infinite scroll, we accumulate all pages
    select: (data: any) => data,
  });

  const loadMore = async () => {
    if (!result.data?.hasMore) return;

    const currentData = result.data;
    const nextOffset = currentData.data.length;
    
    try {
      const nextPage = await transferAPI.fetchTransfers({
        ...filters,
        limit,
        offset: nextOffset,
      });

      // Update cache with accumulated data
      queryClient.setQueryData(
        queryKeys.transfers.list({ ...filters, offset: 0 }),
        {
          ...currentData,
          data: [...currentData.data, ...nextPage.data],
          hasMore: nextPage.hasMore,
          total: nextPage.total,
        }
      );
    } catch (error) {
      console.error('Failed to load more transfers:', error);
    }
  };

  return {
    ...result,
    // Flatten pages for easier consumption
    allTransfers: result.data?.pages.flatMap((page: any) => page.data),
    hasMore: result.data?.hasMore,
    loadMore: result.fetchNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
  };
}
