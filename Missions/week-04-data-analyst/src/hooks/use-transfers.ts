/**
 * Custom Hooks for Transfer Data
 * Based on Tech Spec Section 6.2 - Server State Management
 */

'use client'

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUIStore } from '@/lib/store'
import { queryKeys, queryConfig } from '@/lib/query-client'
import { transferAPI } from '@/lib/api/transfer-api-service'
import type { Transfer, TransferFilters } from '@/types/state'

const PAGE_SIZE = 25

const mapSortField = (field: string): 'transfer_date' | 'transfer_value' | 'player_name' => {
  switch (field) {
    case 'transferValue':
      return 'transfer_value'
    case 'playerName':
      return 'player_name'
    default:
      return 'transfer_date'
  }
}

const buildTransferParams = (
  page: number,
  searchQuery: string,
  statusFilter: string,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filters: TransferFilters
) => ({
  page,
  limit: PAGE_SIZE,
  search: searchQuery || undefined,
  status: statusFilter === 'all' ? 'all' : 'confirmed',
  sortBy: mapSortField(sortBy),
  sortOrder,
  leagues: filters.leagues.length ? filters.leagues : undefined,
  positions: filters.positions.length ? filters.positions : undefined,
  transferTypes: filters.transferTypes.length ? filters.transferTypes : undefined,
  minValue: filters.valueRange ? filters.valueRange[0] : undefined,
  maxValue: filters.valueRange ? filters.valueRange[1] : undefined,
  startDate: filters.dateRange ? filters.dateRange[0]?.toISOString() : undefined,
  endDate: filters.dateRange ? filters.dateRange[1]?.toISOString() : undefined,
})

/**
 * Hook for fetching transfers with filters
 */
export const useTransfers = () => {
  const activeFilters = useUIStore((state) => state.activeFilters)
  const sortConfig = useUIStore((state) => state.sortConfig)
  const searchQuery = useUIStore((state) => state.searchQuery)

  const query = useInfiniteQuery({
    queryKey: [
      ...queryKeys.transfersWithFilters({
        ...activeFilters,
        search: searchQuery,
      }),
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = buildTransferParams(
        pageParam as number,
        searchQuery,
        activeFilters.status,
        sortConfig.field,
        sortConfig.direction,
        activeFilters
      )
      const response = await transferAPI.fetchTransfers(params)
      return {
        data: response.data,
        hasNextPage: response.hasMore ?? (response.data.length === params.limit),
        total: response.total,
        page: response.page,
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage?.hasNextPage ? (lastPage.page ?? 1) + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const transfers = query.data?.pages.flatMap((page) => page.data) ?? []
  const hasNextPage = Boolean(query.hasNextPage)
  const total = query.data?.pages[0]?.total ?? 0

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage()
    }
  }

  return {
    transfers,
    hasNextPage,
    total,
    loadMore,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
  }
}

/**
 * Hook for fetching transfer summary for dashboard
 */
export const useTransferSummary = () => {
  return useQuery({
    queryKey: queryKeys.summary,
    queryFn: () => transferAPI.fetchSummary(),
    ...queryConfig.summary,
    enabled: true,
  })
}

/**
 * Hook for fetching top transfers
 */
export const useTopTransfers = (limit = 5) => {
  return useQuery({
    queryKey: [...queryKeys.topTransfers, { limit }],
    queryFn: async () => {
      const response = await transferAPI.fetchTopTransfers({ limit })
      return response.data
    },
    ...queryConfig.topTransfers,
    enabled: true,
  })
}

/**
 * Hook for fetching latest deals
 */
export const useLatestDeals = () => {
  return useQuery({
    queryKey: queryKeys.latestDeals,
    queryFn: async () => {
      const response = await transferAPI.fetchTransfers({
        limit: 10,
        sortBy: 'transfer_date',
        sortOrder: 'desc',
        status: 'all',
      })
      return response.data
    },
    ...queryConfig.latestDeals,
    enabled: true,
  })
}

/**
 * Hook for transfer detail
 */
export const useTransferDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.transferDetail(id),
    queryFn: () => transferAPI.fetchTransferById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook for optimistic updates
 */
export const useOptimisticTransfer = () => {
  const queryClient = useQueryClient();
  const activeFilters = useUIStore((state) => state.activeFilters);
  const sortConfig = useUIStore((state) => state.sortConfig);
  const currentPage = useUIStore((state) => state.currentPage);
  const searchQuery = useUIStore((state) => state.searchQuery);
  
  const updateTransfer = useMutation({
    mutationFn: async (transfer: Partial<Transfer>) => transfer,
    onMutate: async (newTransfer) => {
      // Cancel any outgoing refetches for the current filters
      const currentQueryKey = queryKeys.transfersWithFilters({ 
        ...activeFilters,
        search: searchQuery 
      });
      
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      
      // Snapshot the previous value
      const previousTransfers = queryClient.getQueryData(currentQueryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData(currentQueryKey, (old: Transfer[] = []) => 
        old.map(transfer => 
          transfer.id === newTransfer.id ? { ...transfer, ...newTransfer } : transfer
        )
      );
      
      // Return a context object with the snapshotted value
      return { previousTransfers, queryKey: currentQueryKey };
    },
    onError: (err, newTransfer, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTransfers && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousTransfers);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      const currentQueryKey = queryKeys.transfersWithFilters({ 
        ...activeFilters,
        search: searchQuery 
      });
      queryClient.invalidateQueries({ queryKey: currentQueryKey });
    },
  });
  
  return updateTransfer;
};

/**
 * Hook for refreshing all transfer-related queries
 */
export const useRefreshTransfers = () => {
  const queryClient = useQueryClient();
  const activeFilters = useUIStore((state) => state.activeFilters);
  const sortConfig = useUIStore((state) => state.sortConfig);
  const currentPage = useUIStore((state) => state.currentPage);
  const searchQuery = useUIStore((state) => state.searchQuery);
  
  const refresh = () => {
    // Build the same filter-aware key used by useTransfers
    const currentQueryKey = queryKeys.transfersWithFilters({ 
      ...activeFilters,
      search: searchQuery 
    });
    
    // Invalidate the correct cache entry
    queryClient.invalidateQueries({ queryKey: currentQueryKey });
    
    // Also invalidate summary and top transfers for complete refresh
    queryClient.invalidateQueries({ queryKey: queryKeys.summary });
    queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers });
    queryClient.invalidateQueries({ queryKey: queryKeys.latestDeals });
  };
  
  return refresh;
};

/**
 * Hook for prefetching data
 */
export const usePrefetchTransfers = () => {
  const queryClient = useQueryClient()

  const prefetchTransferDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.transferDetail(id),
      queryFn: () => transferAPI.fetchTransferById(id),
      staleTime: 5 * 60 * 1000,
    })
  }

  return { prefetchTransferDetail }
}
