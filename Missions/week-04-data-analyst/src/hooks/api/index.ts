/**
 * API Hooks - Index
 * 
 * Central exports for all API-related React hooks.
 * Provides a clean interface for consuming API functionality in components.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

// Core Data Hooks
export { useTransfers, useInfiniteTransfers } from './use-transfers';
export { 
  useSummary, 
  useRealTimeSummary, 
  useStaticSummary 
} from './use-summary';
export { 
  useTopTransfers, 
  useTopTransfersByWindow, 
  useLimitedTopTransfers,
  useRealTimeTopTransfers 
} from './use-top-transfers';

// Loading States
export { 
  useLoadingStates, 
  useCriticalLoadingStates, 
  useDashboardLoadingStates, 
  useMinimalLoadingStates,
  type LoadingStates,
  type UseLoadingStatesOptions 
} from './use-loading-states';

// Optimistic Updates
export { 
  useOptimisticTransferUpdate,
  useOptimisticTransferCreate,
  useOptimisticTransferDelete,
  useOptimisticBatchUpdate,
  useOptimisticToggle
} from './use-optimistic-updates';

// Request Cancellation
export { 
  useCancellableQuery,
  useCancellableInfiniteQuery,
  useRequestCancellation,
  withCancellation,
  useDebouncedCancellableQuery 
} from './use-cancellable-query';

// Re-export types for convenience
export type { 
  UseTransfersOptions 
} from './use-transfers';

export type { 
  UseSummaryOptions 
} from './use-summary';

export type { 
  UseTopTransfersOptions 
} from './use-top-transfers';

export type { 
  OptimisticUpdateOptions,
  TransferUpdate 
} from './use-optimistic-updates';
