/**
 * TanStack Query Configuration
 * Based on Tech Spec Section 6.2 - Server State Management
 */

import { QueryClient } from '@tanstack/react-query';

// Create Query Client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Garbage collect after 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus (reduces unnecessary requests)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Enable background refetching
      refetchOnMount: true,
      // Error boundary handling
      throwOnError: false,
      // Prevent infinite retries
      retryOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Don't throw errors by default
      throwOnError: false,
    },
  },
});

// Query Keys - Centralized for consistency and cache management
export const queryKeys = {
  // Transfers
  transfers: ['transfers'],
  transfersWithFilters: (filters: {
    search?: string;
    leagues?: string[];
    positions?: string[];
    transferTypes?: ('Loan' | 'Permanent' | 'Free Transfer' | 'N/A')[];
    ageRange?: [number, number];
    valueRange?: [number, number];
    dateRange?: [Date, Date] | null;
    status?: 'all' | 'confirmed' | 'rumours';
  }) => ['transfers', 'filters', filters],
  transferDetail: (id: string) => ['transfers', 'detail', id],
  
  // Summary
  summary: ['summary'],
  
  // Top Transfers
  topTransfers: ['top-transfers'],
  
  // Latest Deals
  latestDeals: ['latest-deals'],
  
  // Clubs
  clubs: ['clubs'],
  clubDetail: (id: string) => ['clubs', 'detail', id],
  
  // Leagues
  leagues: ['leagues'],
  leagueDetail: (id: string) => ['leagues', 'detail', id],
  
  // Sync Status
  syncStatus: ['sync-status'],
} as const;

// Query Configuration Objects
export const queryConfig = {
  // Transfers Query
  transfers: {
    staleTime: 2 * 60 * 1000, // 2 minutes for transfers
    refetchInterval: 10 * 60 * 1000, // 10 minutes background refetch
    select: (data: any[]) => data?.slice(0, 100), // Pagination limit
  },
  
  // Summary Query
  summary: {
    staleTime: 15 * 60 * 1000, // 15 minutes for summary
    refetchInterval: 30 * 60 * 1000, // 30 minutes background refetch
  },
  
  // Top Transfers Query
  topTransfers: {
    staleTime: 10 * 60 * 1000, // 10 minutes for top transfers
    refetchInterval: 15 * 60 * 1000, // 15 minutes background refetch
  },
  
  // Latest Deals Query
  latestDeals: {
    staleTime: 5 * 60 * 1000, // 5 minutes for latest deals
    refetchInterval: 5 * 60 * 1000, // 5 minutes background refetch
  },
  
  // Clubs Query
  clubs: {
    staleTime: 60 * 60 * 1000, // 1 hour for clubs (rarely change)
    refetchInterval: 24 * 60 * 60 * 1000, // 24 hours background refetch
  },
  
  // Leagues Query
  leagues: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours for leagues (very rarely change)
    refetchInterval: 7 * 24 * 60 * 60 * 1000, // 7 days background refetch
  },
  
  // Sync Status Query
  syncStatus: {
    staleTime: 30 * 1000, // 30 seconds for sync status
    refetchInterval: 60 * 1000, // 1 minute background refetch
  },
} as const;
