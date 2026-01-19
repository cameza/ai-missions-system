/**
 * Cache Invalidation Strategies
 * 
 * Intelligent cache invalidation utilities for TanStack Query.
 * Provides centralized cache management with different strategies.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import type { Transfer } from '@/types';

/**
 * Cache invalidation strategies
 */
export type InvalidationStrategy = 
  | 'aggressive'    // Invalidate everything
  | 'conservative'  // Only invalidate what's necessary
  | 'selective'     // Invalidate specific related queries
  | 'timed';        // Invalidate based on time patterns

/**
 * Cache invalidation options
 */
export interface CacheInvalidationOptions {
  /** Strategy to use for invalidation */
  strategy?: InvalidationStrategy;
  /** Whether to refetch after invalidation */
  refetch?: boolean;
  /** Custom delay before invalidation (ms) */
  delay?: number;
  /** Whether to cancel ongoing queries */
  cancelOngoing?: boolean;
}

/**
 * Transfer-related cache invalidation utilities
 */
export class TransferCacheManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate all transfer-related queries
   * 
   * @param options - Invalidation options
   */
  invalidateAllTransfers(options: CacheInvalidationOptions = {}) {
    const { strategy = 'conservative', refetch = true, delay = 0, cancelOngoing = false } = options;

    const invalidate = () => {
      // Cancel ongoing queries if requested
      if (cancelOngoing) {
        this.queryClient.cancelQueries({ queryKey: queryKeys.transfers.all });
        this.queryClient.cancelQueries({ queryKey: queryKeys.summary.all });
        this.queryClient.cancelQueries({ queryKey: queryKeys.topTransfers.all });
      }

      // Invalidate based on strategy
      switch (strategy) {
        case 'aggressive':
          this.invalidateAggressively();
          break;
        case 'conservative':
          this.invalidateConservatively();
          break;
        case 'selective':
          this.invalidateSelectively();
          break;
        case 'timed':
          this.invalidateTimed();
          break;
      }

      // Refetch if requested
      if (refetch) {
        this.refetchAll();
      }
    };

    if (delay > 0) {
      setTimeout(invalidate, delay);
    } else {
      invalidate();
    }
  }

  /**
   * Aggressive invalidation - clears transfer-related queries
   */
  private invalidateAggressively() {
    this.queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
    this.queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
    this.queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.all });
    
    // Remove transfer-related queries instead of clearing all cache
    this.queryClient.removeQueries({ queryKey: queryKeys.transfers.all });
    this.queryClient.removeQueries({ queryKey: queryKeys.summary.all });
    this.queryClient.removeQueries({ queryKey: queryKeys.topTransfers.all });
  }

  /**
   * Conservative invalidation - only what's necessary
   */
  private invalidateConservatively() {
    // Invalidate lists (they contain aggregated data)
    this.queryClient.invalidateQueries({ queryKey: queryKeys.transfers.lists() });
    this.queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
    this.queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.lists() });
    
    // Keep individual transfer details cached
  }

  /**
   * Selective invalidation - specific related queries
   */
  private invalidateSelectively() {
    // Only invalidate summary and top transfers (derived from transfers)
    this.queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
    this.queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.lists() });
    
    // Keep transfer lists cached (they might still be valid)
  }

  /**
   * Timed invalidation - based on data age
   */
  private invalidateTimed() {
    // Check cache age and invalidate if too old
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    // Get all transfer-related queries
    const cache = this.queryClient.getQueryCache().getAll();
    
    cache.forEach(query => {
      if (this.isTransferRelatedQuery(query.queryKey)) {
        const dataUpdatedAt = query.state.dataUpdatedAt;
        if (dataUpdatedAt && (now - dataUpdatedAt) > maxAge) {
          this.queryClient.invalidateQueries({ queryKey: query.queryKey });
        }
      }
    });
  }

  /**
   * Check if query key is transfer-related
   */
  private isTransferRelatedQuery(queryKey: readonly unknown[]): boolean {
    return Array.isArray(queryKey) && 
           (queryKey[0] === 'transfers' || 
            queryKey[0] === 'summary' || 
            queryKey[0] === 'top-transfers');
  }

  /**
   * Invalidate specific transfer
   * 
   * @param transferId - Transfer ID to invalidate
   */
  invalidateSpecificTransfer(transferId: string) {
    // Invalidate specific transfer detail
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.transfers.detail(transferId) 
    });
    
    // Invalidate lists that might contain this transfer
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.transfers.lists() 
    });
    
    // Invalidate derived data
    this.queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
    this.queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.lists() });
  }

  /**
   * Invalidate transfers by filters
   * 
   * @param filters - Filters to match
   */
  invalidateTransfersByFilters(filters: Record<string, any>) {
    // Get all transfer list queries
    const cache = this.queryClient.getQueryCache().getAll();
    
    cache.forEach(query => {
      if (this.isTransferListQuery(query.queryKey)) {
        // Check if filters match (simplified)
        const queryFilters = (query.queryKey[2] as Record<string, any>) || {};
        const hasMatchingFilters = Object.keys(filters).some(key => 
          queryFilters[key] === filters[key]
        );
        
        if (hasMatchingFilters) {
          this.queryClient.invalidateQueries({ queryKey: query.queryKey });
        }
      }
    });
  }

  /**
   * Check if query key is a transfer list query
   */
  private isTransferListQuery(queryKey: readonly unknown[]): boolean {
    return Array.isArray(queryKey) && 
           queryKey[0] === 'transfers' && 
           queryKey[1] === 'list';
  }

  /**
   * Refetch all transfer-related queries
   */
  refetchAll() {
    this.queryClient.refetchQueries({ queryKey: queryKeys.transfers.all });
    this.queryClient.refetchQueries({ queryKey: queryKeys.summary.all });
    this.queryClient.refetchQueries({ queryKey: queryKeys.topTransfers.all });
  }

  /**
   * Prefetch commonly accessed data
   */
  async prefetchCommonData() {
    // Prefetch summary (most commonly accessed)
    await this.queryClient.prefetchQuery({
      queryKey: queryKeys.summary.all,
      staleTime: 15 * 60 * 1000, // 15 minutes
    });

    // Prefetch top transfers
    await this.queryClient.prefetchQuery({
      queryKey: queryKeys.topTransfers.list({ limit: 5 }),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  }

  /**
   * Clear old cache entries
   */
  clearOldCache(maxAge: number = 30 * 60 * 1000) { // 30 minutes default
    const now = Date.now();
    const cache = this.queryClient.getQueryCache().getAll();
    
    cache.forEach(query => {
      const dataUpdatedAt = query.state.dataUpdatedAt;
      if (dataUpdatedAt && (now - dataUpdatedAt) > maxAge) {
        this.queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const cache = this.queryClient.getQueryCache().getAll();
    
    const transferQueries = cache.filter(query => this.isTransferRelatedQuery(query.queryKey as readonly unknown[]));
    
    return {
      totalQueries: cache.length,
      transferQueries: transferQueries.length,
      oldestQuery: Math.min(...transferQueries.map(q => q.state.dataUpdatedAt || 0)),
      newestQuery: Math.max(...transferQueries.map(q => q.state.dataUpdatedAt || 0)),
      averageAge: transferQueries.length > 0 
        ? transferQueries.reduce((sum, q) => sum + (Date.now() - (q.state.dataUpdatedAt || 0)), 0) / transferQueries.length
        : 0,
    };
  }
}

/**
 * Global cache invalidation functions
 */

/**
 * Invalidate transfer cache after data updates
 */
export function invalidateTransferCache(queryClient: QueryClient, options?: CacheInvalidationOptions) {
  const manager = new TransferCacheManager(queryClient);
  manager.invalidateAllTransfers(options);
}

/**
 * Invalidate specific transfer
 */
export function invalidateSpecificTransfer(queryClient: QueryClient, transferId: string) {
  const manager = new TransferCacheManager(queryClient);
  manager.invalidateSpecificTransfer(transferId);
}

/**
 * Invalidate after sync operation
 */
export function invalidateAfterSync(queryClient: QueryClient) {
  invalidateTransferCache(queryClient, {
    strategy: 'aggressive',
    refetch: true,
    delay: 1000, // Small delay to allow sync to complete
  });
}

/**
 * Invalidate after user action (like bookmark, like, etc.)
 */
export function invalidateAfterUserAction(queryClient: QueryClient, transferId: string) {
  invalidateSpecificTransfer(queryClient, transferId);
}

/**
 * Periodic cache maintenance
 */
export function performCacheMaintenance(queryClient: QueryClient) {
  const manager = new TransferCacheManager(queryClient);
  
  // Clear old cache
  manager.clearOldCache();
  
  // Prefetch common data
  manager.prefetchCommonData();
}

/**
 * Create cache manager instance
 */
export function createCacheManager(queryClient: QueryClient) {
  return new TransferCacheManager(queryClient);
}
