/**
 * Query Keys Factory
 * 
 * Centralized query key management for TanStack Query cache invalidation
 * and deduplication. Provides type-safe query keys and easy cache management.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import type { TransfersQueryParams, TopTransfersQueryParams } from '@/types';

/**
 * Query Keys Factory
 * 
 * Provides hierarchical, type-safe query keys for all API endpoints.
 * Enables precise cache invalidation and prevents key collisions.
 */
export const queryKeys = {
  // Transfers
  transfers: {
    all: ['transfers'] as const,
    lists: () => [...queryKeys.transfers.all, 'list'] as const,
    list: (filters: TransfersQueryParams) => 
      [...queryKeys.transfers.lists(), filters] as const,
    details: () => [...queryKeys.transfers.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.transfers.details(), id] as const,
  },
  
  // Summary
  summary: {
    all: ['summary'] as const,
  },
  
  // Top Transfers
  topTransfers: {
    all: ['top-transfers'] as const,
    lists: () => [...queryKeys.topTransfers.all, 'list'] as const,
    list: (params?: TopTransfersQueryParams) => 
      [...queryKeys.topTransfers.lists(), params] as const,
  },
  
  // Health Check
  health: {
    all: ['health'] as const,
  },
  
  // API Version
  version: {
    all: ['version'] as const,
  },
} as const;

/**
 * Query Key Types
 * 
 * TypeScript types for query keys to enable type-safe usage
 * in custom hooks and cache management utilities.
 */
export type QueryKey = typeof queryKeys;

/**
 * Query Key Helpers
 * 
 * Utility functions for working with query keys
 */

/**
 * Check if a query key belongs to transfers
 */
export function isTransfersQueryKey(key: readonly unknown[]): key is readonly ['transfers', ...any[]] {
  return Array.isArray(key) && key[0] === 'transfers';
}

/**
 * Check if a query key belongs to summary
 */
export function isSummaryQueryKey(key: readonly unknown[]): key is readonly ['summary'] {
  return Array.isArray(key) && key[0] === 'summary';
}

/**
 * Check if a query key belongs to top transfers
 */
export function isTopTransfersQueryKey(key: readonly unknown[]): key is readonly ['top-transfers', ...any[]] {
  return Array.isArray(key) && key[0] === 'top-transfers';
}

/**
 * Extract entity type from query key
 */
export function getQueryKeyType(key: unknown[]): 'transfers' | 'summary' | 'top-transfers' | 'health' | 'version' | 'unknown' {
  if (!Array.isArray(key) || key.length === 0) {
    return 'unknown';
  }
  
  const firstKey = key[0] as string;
  
  switch (firstKey) {
    case 'transfers':
      return 'transfers';
    case 'summary':
      return 'summary';
    case 'top-transfers':
      return 'top-transfers';
    case 'health':
      return 'health';
    case 'version':
      return 'version';
    default:
      return 'unknown';
  }
}

/**
 * Create a dynamic query key for transfers with filters
 * Ensures consistent key generation across the application
 */
export function createTransfersQueryKey(filters: TransfersQueryParams) {
  // Remove undefined values to ensure consistent keys
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );
  
  return queryKeys.transfers.list(cleanFilters);
}

/**
 * Create a dynamic query key for top transfers with params
 */
export function createTopTransfersQueryKey(params?: TopTransfersQueryParams) {
  if (!params || Object.keys(params).length === 0) {
    return queryKeys.topTransfers.all;
  }
  
  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
  );
  
  return queryKeys.topTransfers.list(cleanParams);
}

/**
 * Get all transfer-related query keys for cache invalidation
 */
export function getAllTransferQueryKeys() {
  return [
    queryKeys.transfers.all,
    queryKeys.summary.all,
    queryKeys.topTransfers.all,
  ];
}

/**
 * Get query keys for a specific transfer
 */
export function getTransferQueryKeys(transferId: string) {
  return {
    detail: queryKeys.transfers.detail(transferId),
    lists: queryKeys.transfers.lists(),
  };
}
