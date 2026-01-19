/**
 * Custom Hooks for Transfer Data
 * Based on Tech Spec Section 6.2 - Server State Management
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/lib/store';
import { queryKeys, queryConfig } from '@/lib/query-client';
import { Transfer, TransferFilters, APIResponse } from '@/types/state';

// Mock API functions - replace with actual API calls
const fetchTransfers = async (filters: TransferFilters): Promise<Transfer[]> => {
  // This would be replaced with actual API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [];
};

const fetchTransferSummary = async (): Promise<any> => {
  // This would be replaced with actual API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    todayTransfers: 12,
    windowTotal: 1247,
    totalSpend: 3420000000,
    mostActiveTeam: { name: 'Real Madrid', transfers: 8 },
    transfersByLeague: [
      { league: 'Premier League', count: 342 },
      { league: 'La Liga', count: 278 },
      { league: 'Serie A', count: 234 },
      { league: 'Bundesliga', count: 189 },
      { league: 'Ligue 1', count: 204 },
    ],
    dailyActivity: [
      { date: '2025-01-14', transfers: 8 },
      { date: '2025-01-15', transfers: 12 },
      { date: '2025-01-16', transfers: 15 },
      { date: '2025-01-17', transfers: 9 },
      { date: '2025-01-18', transfers: 11 },
    ],
  };
};

const fetchTopTransfers = async (): Promise<Transfer[]> => {
  // This would be replaced with actual API call
  await new Promise(resolve => setTimeout(resolve, 600));
  return [];
};

const fetchLatestDeals = async (): Promise<Transfer[]> => {
  // This would be replaced with actual API call
  await new Promise(resolve => setTimeout(resolve, 600));
  return [];
};

/**
 * Hook for fetching transfers with filters
 */
export const useTransfers = () => {
  const activeFilters = useUIStore((state) => state.activeFilters);
  const sortConfig = useUIStore((state) => state.sortConfig);
  const currentPage = useUIStore((state) => state.currentPage);
  const searchQuery = useUIStore((state) => state.searchQuery);

  return useQuery({
    queryKey: queryKeys.transfersWithFilters({ 
      ...activeFilters,
      search: searchQuery 
    }),
    queryFn: () => fetchTransfers(activeFilters),
    ...queryConfig.transfers,
    enabled: true,
  });
};

/**
 * Hook for fetching transfer summary for dashboard
 */
export const useTransferSummary = () => {
  return useQuery({
    queryKey: queryKeys.summary,
    queryFn: fetchTransferSummary,
    ...queryConfig.summary,
    enabled: true,
  });
};

/**
 * Hook for fetching top transfers
 */
export const useTopTransfers = () => {
  return useQuery({
    queryKey: queryKeys.topTransfers,
    queryFn: fetchTopTransfers,
    ...queryConfig.topTransfers,
    enabled: true,
  });
};

/**
 * Hook for fetching latest deals
 */
export const useLatestDeals = () => {
  return useQuery({
    queryKey: queryKeys.latestDeals,
    queryFn: fetchLatestDeals,
    ...queryConfig.latestDeals,
    enabled: true,
  });
};

/**
 * Hook for transfer detail
 */
export const useTransferDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.transferDetail(id),
    queryFn: async (): Promise<Transfer> => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      throw new Error('Transfer not found');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

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
    mutationFn: async (transfer: Partial<Transfer>) => {
      // This would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return transfer;
    },
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
  const queryClient = useQueryClient();
  
  const prefetchTransferDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.transferDetail(id),
      queryFn: async (): Promise<Transfer> => {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 500));
        throw new Error('Transfer not found');
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  return { prefetchTransferDetail };
};
