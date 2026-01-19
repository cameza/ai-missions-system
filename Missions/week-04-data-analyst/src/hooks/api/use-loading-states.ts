/**
 * Use Loading States Hook
 * 
 * Unified loading state management across multiple API queries.
 * Provides combined loading, error, and success states for better UX.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import { useQueries } from '@tanstack/react-query';
import { transferAPI } from '@/lib/api/transfer-api-service';
import { queryKeys } from '@/lib/api/query-keys';
import type { 
  TransfersQueryParams, 
  TopTransfersQueryParams, 
  TransfersResponse, 
  SummaryData, 
  TopTransfersResponse 
} from '@/types';

/**
 * Options for useLoadingStates hook
 */
export interface UseLoadingStatesOptions {
  /** Transfer filters and pagination parameters */
  transferFilters?: TransfersQueryParams;
  /** Top transfers parameters */
  topTransfersParams?: TopTransfersQueryParams;
  /** Whether transfers query should be enabled */
  transfersEnabled?: boolean;
  /** Whether summary query should be enabled */
  summaryEnabled?: boolean;
  /** Whether top transfers query should be enabled */
  topTransfersEnabled?: boolean;
}

/**
 * Combined loading states interface
 */
export interface LoadingStates {
  // Individual query states
  transfers: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
    data?: TransfersResponse;
  };
  summary: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
    data?: SummaryData;
  };
  topTransfers: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
    data?: TopTransfersResponse;
  };
  
  /** Combined states */
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  hasAnyData: boolean;
  hasAllData: boolean;
  
  /** Error aggregation */
  errors: Error[];
  hasErrors: boolean;
  firstError: Error | null;
  
  /** Data availability */
  hasTransfersData: boolean;
  hasSummaryData: boolean;
  hasTopTransfersData: boolean;
}

/**
 * Custom hook for unified loading state management
 * 
 * Combines multiple query states into a single interface for easier
 * loading state management in components that use multiple data sources.
 * 
 * Features:
 * - Combined loading states
 * - Error aggregation
 * - Data availability checks
 * - Individual query state access
 * - Optimized for dashboard and multi-data components
 * 
 * @param options - Hook configuration options
 * @returns Combined loading states and data
 */
export function useLoadingStates(options: UseLoadingStatesOptions = {}) {
  const {
    transferFilters = {},
    topTransfersParams = {},
    transfersEnabled = true,
    summaryEnabled = true,
    topTransfersEnabled = true,
  } = options;

  // Execute all queries in parallel with useQueries
  const results = useQueries({
    queries: [
      // Transfers query
      {
        queryKey: queryKeys.transfers.list(transferFilters),
        queryFn: () => transferAPI.fetchTransfers(transferFilters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: transfersEnabled,
      },
      
      // Summary query
      {
        queryKey: queryKeys.summary.all,
        queryFn: () => transferAPI.fetchSummary(),
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchInterval: 30 * 60 * 1000, // 30 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: summaryEnabled,
      },
      
      // Top transfers query
      {
        queryKey: queryKeys.topTransfers.list(topTransfersParams),
        queryFn: () => transferAPI.fetchTopTransfers(topTransfersParams),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        refetchInterval: 15 * 60 * 1000, // 15 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: topTransfersEnabled,
      },
    ],
  });

  // Extract individual query results
  const [transfersResult, summaryResult, topTransfersResult] = results;

  // Calculate combined states
  const isLoading = results.some(result => result.isLoading);
  const isError = results.some(result => result.isError);
  const isSuccess = results.every(result => result.isSuccess);
  const hasAnyData = results.some(result => result.data !== undefined);
  const hasAllData = results.every(result => result.data !== undefined);

  // Aggregate errors
  const errors = results
    .map(result => result.error)
    .filter((error): error is Error => error !== null);
  
  const hasErrors = errors.length > 0;
  const firstError = errors[0] || null;

  // Individual query states
  const transfers = {
    isLoading: transfersResult.isLoading,
    isError: transfersResult.isError,
    isSuccess: transfersResult.isSuccess,
    error: transfersResult.error,
    data: transfersResult.data,
  };

  const summary = {
    isLoading: summaryResult.isLoading,
    isError: summaryResult.isError,
    isSuccess: summaryResult.isSuccess,
    error: summaryResult.error,
    data: summaryResult.data,
  };

  const topTransfers = {
    isLoading: topTransfersResult.isLoading,
    isError: topTransfersResult.isError,
    isSuccess: topTransfersResult.isSuccess,
    error: topTransfersResult.error,
    data: topTransfersResult.data,
  };

  // Data availability checks
  const hasTransfersData = transfersResult.data !== undefined;
  const hasSummaryData = summaryResult.data !== undefined;
  const hasTopTransfersData = topTransfersResult.data !== undefined;

  return {
    // Individual query states
    transfers,
    summary,
    topTransfers,
    
    // Combined states
    isLoading,
    isError,
    isSuccess,
    hasAnyData,
    hasAllData,
    
    // Error aggregation
    errors,
    hasErrors,
    firstError,
    
    // Data availability
    hasTransfersData,
    hasSummaryData,
    hasTopTransfersData,
  };
}

/**
 * Hook for critical loading states
 * 
 * Focuses on the most critical data (summary) for faster perceived loading
 */
export function useCriticalLoadingStates(options: Omit<UseLoadingStatesOptions, 'transfersEnabled' | 'summaryEnabled' | 'topTransfersEnabled'> = {}) {
  return useLoadingStates({
    ...options,
    transfersEnabled: false, // Disable non-critical transfers initially
    summaryEnabled: true,    // Always enable summary
    topTransfersEnabled: false, // Disable top transfers initially
  });
}

/**
 * Hook for dashboard loading states
 * 
 * Optimized for dashboard components that need all data types
 */
export function useDashboardLoadingStates(options: UseLoadingStatesOptions = {}) {
  return useLoadingStates({
    ...options,
    transfersEnabled: true,
    summaryEnabled: true,
    topTransfersEnabled: true,
  });
}

/**
 * Hook for minimal loading states
 * 
 * Only loads summary data for minimal components
 */
export function useMinimalLoadingStates(options: Omit<UseLoadingStatesOptions, 'transfersEnabled' | 'summaryEnabled' | 'topTransfersEnabled'> = {}) {
  return useLoadingStates({
    ...options,
    transfersEnabled: false,
    summaryEnabled: true,
    topTransfersEnabled: false,
  });
}
