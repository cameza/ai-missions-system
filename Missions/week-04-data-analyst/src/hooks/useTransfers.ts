"use client"

/**
 * Use Transfers Hook
 * 
 * Custom hook for fetching transfer data using TanStack Query.
 * Implements infinite scrolling with pagination and filtering.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { Transfer, TransferStatus, PlayerPosition, TransferType } from '@/types';
import { useTransferStore } from '@/lib/stores/useTransferStore';

// API response interface for paginated transfers
interface TransfersResponse {
  data: Transfer[];
  hasNextPage: boolean;
  total: number;
  page: number;
}

// Real API function
const fetchTransfers = async ({
  pageParam = 1,
  searchQuery = '',
  statusFilter = 'all',
  sortBy = 'transferDate',
  sortOrder = 'desc',
}: {
  pageParam?: number;
  searchQuery?: string;
  statusFilter?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<TransfersResponse> => {
  // Map frontend column keys to valid API sort columns
  const mapSortColumn = (column: string): string => {
    switch (column) {
      case 'transferDate':
        return 'transfer_date';
      case 'playerFullName':
        return 'player_name';
      case 'transferValueDisplay':
        return 'transfer_value';
      case 'fromClubName':
        return 'from_club_name';
      case 'toClubName':
        return 'to_club_name';
      default:
        return 'transfer_date';
    }
  };

  // Build query params
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: '25',
    sortBy: mapSortColumn(sortBy),
    sortOrder,
    status: statusFilter,
  });
  if (searchQuery) {
    params.append('search', searchQuery);
  }
  
  // Call real API
  const response = await fetch(`/api/transfers?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch transfers');
  }
  const json = await response.json();
  
  return {
    data: json.data || [],
    hasNextPage: json.pagination?.hasMore || false,
    total: json.pagination?.total || 0,
    page: json.pagination?.page || pageParam,
  };
};

// Hook interface
interface UseTransfersResult {
  transfers: Transfer[];
  hasNextPage: boolean;
  total: number;
  loadMore: () => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export function useTransfers(initialData?: Transfer[]): UseTransfersResult {
  const { searchQuery, statusFilter, sortBy, sortOrder } = useTransferStore();

  const query = useInfiniteQuery<TransfersResponse, Error>({
    queryKey: ['transfers', searchQuery, statusFilter, sortBy, sortOrder],
    queryFn: ({ pageParam = 1 }) =>
      fetchTransfers({
        pageParam: pageParam as number,
        searchQuery,
        statusFilter,
        sortBy,
        sortOrder,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 0, // Always refetch when state changes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array
  const transfers = query.data?.pages.flatMap(page => page.data) || [];
  const hasNextPage = query.data?.pages[query.data.pages.length - 1]?.hasNextPage || false;
  const total = query.data?.pages[0]?.total || 0;

  const loadMore = () => {
    if (hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

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
  };
}
