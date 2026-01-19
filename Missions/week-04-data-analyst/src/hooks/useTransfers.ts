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

// Mock API function - replace with actual API call
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock data generation
  const mockTransfers: Transfer[] = Array.from({ length: 25 }, (_, index) => {
    const id = (pageParam - 1) * 25 + index + 1;
    const players = [
      { firstName: 'Lionel', lastName: 'Messi', nationality: 'AR', position: 'Attacker' as PlayerPosition },
      { firstName: 'Cristiano', lastName: 'Ronaldo', nationality: 'PT', position: 'Attacker' as PlayerPosition },
      { firstName: 'Kylian', lastName: 'Mbappé', nationality: 'FR', position: 'Attacker' as PlayerPosition },
      { firstName: 'Erling', lastName: 'Haaland', nationality: 'NO', position: 'Attacker' as PlayerPosition },
      { firstName: 'Kevin', lastName: 'De Bruyne', nationality: 'BE', position: 'Midfielder' as PlayerPosition },
    ];
    const clubs = [
      'Real Madrid', 'Barcelona', 'Manchester City', 'Manchester United', 
      'Liverpool', 'Chelsea', 'Arsenal', 'Bayern Munich', 'PSG', 'Juventus'
    ];
    const fees = ['€110.0M', '€85.5M', '€45.0M', 'FREE', 'UNDISCLOSED', '€22.5M'];
    const statuses: TransferStatus[] = ['done', 'pending', 'rumour'];
    
    const player = players[index % players.length];
    const fromClub = clubs[index % clubs.length];
    const toClub = clubs[(index + 1) % clubs.length];
    const fee = fees[index % fees.length];
    const status = statuses[index % statuses.length];

    return {
      id: `transfer-${id}`,
      playerId: id,
      playerFirstName: player.firstName,
      playerLastName: player.lastName,
      playerFullName: `${player.firstName} ${player.lastName}`,
      age: 25 + (index % 15),
      position: player.position,
      nationality: player.nationality,
      fromClubId: `club-${fromClub.toLowerCase().replace(' ', '-')}`,
      toClubId: `club-${toClub.toLowerCase().replace(' ', '-')}`,
      fromClubName: fromClub,
      toClubName: toClub,
      leagueId: 'league-champions-league',
      leagueName: 'Champions League',
      transferType: 'Permanent' as TransferType,
      transferValueUsd: fee === 'FREE' ? 0 : parseInt(fee.replace(/[€M.]/g, '')) * 1000000,
      transferValueDisplay: fee,
      status: status,
      transferDate: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)),
      window: '2025-winter',
      apiTransferId: id,
      createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)),
    };
  });

  // Apply search filter
  let filteredTransfers = mockTransfers;
  if (searchQuery) {
    filteredTransfers = mockTransfers.filter(transfer =>
      transfer.playerFullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply status filter (for soft launch, we'll simulate status)
  if (statusFilter === 'confirmed') {
    filteredTransfers = filteredTransfers.slice(0, Math.ceil(filteredTransfers.length * 0.7));
  }

  // Apply sorting
  filteredTransfers.sort((a, b) => {
    const aValue = a[sortBy as keyof Transfer];
    const bValue = b[sortBy as keyof Transfer];
    
    // Handle Date objects
    if (aValue instanceof Date && bValue instanceof Date) {
      const aTime = aValue.getTime();
      const bTime = bValue.getTime();
      return sortOrder === 'asc' ? (aTime > bTime ? 1 : -1) : (aTime < bTime ? 1 : -1);
    }
    
    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    }
    
    // Fallback comparison
    return sortOrder === 'asc' ? 
      (String(aValue) > String(bValue) ? 1 : -1) : 
      (String(aValue) < String(bValue) ? 1 : -1);
  });

  return {
    data: filteredTransfers,
    hasNextPage: pageParam < 10, // Limit to 10 pages for demo
    total: filteredTransfers.length + (pageParam - 1) * 25,
    page: pageParam,
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

export function useTransfers(): UseTransfersResult {
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
