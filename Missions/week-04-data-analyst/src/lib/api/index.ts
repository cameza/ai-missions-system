/**
 * API Service Layer - Index
 * 
 * Central exports for the Transfer Hub API service layer.
 * Provides a clean interface for consuming API functionality.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

// Core API Service
export { TransferAPIService, TransferAPIError, transferAPI } from './transfer-api-service';

// Query Keys Factory
export { 
  queryKeys, 
  isTransfersQueryKey, 
  isSummaryQueryKey, 
  isTopTransfersQueryKey,
  getQueryKeyType,
  createTransfersQueryKey,
  createTopTransfersQueryKey,
  getAllTransferQueryKeys,
  getTransferQueryKeys,
  type QueryKey 
} from './query-keys';

// Cache Invalidation
export { 
  TransferCacheManager,
  invalidateTransferCache,
  invalidateSpecificTransfer,
  invalidateAfterSync,
  invalidateAfterUserAction,
  performCacheMaintenance,
  createCacheManager,
  type InvalidationStrategy,
  type CacheInvalidationOptions 
} from './cache-invalidation';

// Re-export for convenience
export type { 
  TransfersQueryParams,
  TransfersResponse,
  TopTransfersQueryParams,
  TopTransfersResponse,
  TopTransfer,
  SummaryData,
  APIError
} from '@/types';
