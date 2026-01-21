/**
 * Use Optimistic Updates Hook
 * 
 * Provides optimistic update functionality for transfer-related operations.
 * Enables instant UI feedback with automatic rollback on errors.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';
import type { Transfer } from '@/types';

/**
 * Optimistic update options
 */
export interface OptimisticUpdateOptions {
  /** Whether to show optimistic UI updates */
  enabled?: boolean;
  /** Delay before showing optimistic update (ms) */
  delay?: number;
  /** Custom success callback */
  onSuccess?: (data: any, variables: any) => void;
  /** Custom error callback */
  onError?: (error: Error, variables: any) => void;
}

/**
 * Transfer update data
 */
export interface TransferUpdate {
  /** Transfer ID */
  id: string;
  /** Fields to update */
  updates: Partial<Transfer>;
}

/**
 * Transfer creation data
 */
export interface TransferCreate {
  /** Fields to create */
  data: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>;
  /** Temporary ID for optimistic update */
  tempId?: string;
}

/**
 * Hook for optimistic transfer updates
 * 
 * Provides instant UI feedback when updating transfer data
 * with automatic rollback if the API call fails.
 */
export function useOptimisticTransferUpdate(options: OptimisticUpdateOptions = {}) {
  const { 
    enabled = true, 
    delay = 0,
    onSuccess,
    onError,
  } = options;
  
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferUpdate: TransferUpdate) => {
      // Simulate API call - replace with actual API call
      const { id, updates } = transferUpdate;
      
      // This would be your actual API call
      // return transferAPI.updateTransfer(id, updates);
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, ...updates };
    },
    
    // Optimistic update before API call
    onMutate: async (newTransfer) => {
      if (!enabled) return;

      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.transfers.all });
      
      // Get all transfer list queries to update them individually
      const transferQueries = queryClient.getQueriesData({ 
        queryKey: queryKeys.transfers.lists() 
      });
      
      // Snapshot previous values for rollback
      const previousQueries = new Map();
      transferQueries.forEach(([queryKey, data]) => {
        previousQueries.set(queryKey, data);
      });
      
      // Optimistically update each matching query
      transferQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'data' in data) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old || !old.data) return old;
            
            return {
              ...old,
              data: old.data.map((transfer: Transfer) => 
                transfer.id === newTransfer.id 
                  ? { ...transfer, ...newTransfer.updates }
                  : transfer
              ),
            };
          });
        }
      });

      // Also update specific transfer detail if cached
      queryClient.setQueryData(
        queryKeys.transfers.detail(newTransfer.id),
        (old: Transfer | undefined) => {
          if (!old) return old;
          return { ...old, ...newTransfer.updates };
        }
      );
      
      return { previousQueries };
    },
    
    // Handle success
    onSuccess: (data, variables, context) => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.lists() });
      
      // Call custom success callback
      onSuccess?.(data, variables);
    },
    
    // Handle error - rollback optimistic update
    onError: (error, variables, context) => {
      // Rollback to previous state
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Call custom error callback
      onError?.(error as Error, variables);
    },
    
    // Always refetch after mutation completes
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
    },
  });
}

/**
 * Hook for optimistic transfer creation
 */
export function useOptimisticTransferCreate(options: OptimisticUpdateOptions = {}) {
  const { enabled = true, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferCreate: TransferCreate) => {
      // Simulate API call - replace with actual API call
      // return transferAPI.createTransfer(transferCreate.data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the tempId if provided, otherwise generate a new one
      const id = transferCreate.tempId || crypto.randomUUID();
      
      return {
        ...transferCreate.data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    
    onMutate: async (transferCreate) => {
      if (!enabled) return;

      await queryClient.cancelQueries({ queryKey: queryKeys.transfers.all });
      
      const previousQueries = new Map();
      const transferQueries = queryClient.getQueriesData({ 
        queryKey: queryKeys.transfers.lists() 
      });
      
      transferQueries.forEach(([queryKey, data]) => {
        previousQueries.set(queryKey, data);
      });
      
      // Generate deterministic temp ID if not provided
      const tempId = transferCreate.tempId || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Optimistically add new transfer
      transferQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'data' in data) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old || !old.data) return old;
            
            const optimisticTransfer: Transfer = {
              ...transferCreate.data,
              id: tempId,
              created_at: new Date(),
              updated_at: new Date(),
            };
            
            return {
              ...old,
              data: [optimisticTransfer, ...old.data],
              total: old.total + 1,
            };
          });
        }
      });
      
      return { previousQueries, tempId };
    },
    
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.lists() });
      onSuccess?.(data, variables);
    },
    
    onError: (error, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      onError?.(error as Error, variables);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
    },
  });
}

/**
 * Hook for optimistic transfer deletion
 */
export function useOptimisticTransferDelete(options: OptimisticUpdateOptions = {}) {
  const { enabled = true, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferId: string) => {
      // Simulate API call - replace with actual API call
      // return transferAPI.deleteTransfer(transferId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return transferId;
    },
    
    onMutate: async (transferId) => {
      if (!enabled) return;

      // Get all transfer list queries to update them individually
      const transferQueries = queryClient.getQueriesData({ 
        queryKey: queryKeys.transfers.lists() 
      });
      
      // Snapshot previous values for rollback
      const previousQueries = new Map();
      transferQueries.forEach(([queryKey, data]) => {
        previousQueries.set(queryKey, data);
      });
      
      // Optimistically remove transfer from each matching query
      transferQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'data' in data) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old || !old.data) return old;
            
            return {
              ...old,
              data: old.data.filter((transfer: Transfer) => transfer.id !== transferId),
              total: Math.max(0, old.total - 1),
            };
          });
        }
      });
      
      // Remove from detail cache if present
      queryClient.removeQueries({ queryKey: queryKeys.transfers.detail(transferId) });
      
      return { previousQueries };
    },
    
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.topTransfers.lists() });
      onSuccess?.(data, variables);
    },
    
    onError: (error, variables, context) => {
      if (context?.previousQueries?.has(queryKeys.transfers.lists())) {
        queryClient.setQueryData(queryKeys.transfers.lists(), context.previousQueries.get(queryKeys.transfers.lists()));
      }
      onError?.(error as Error, variables);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
    },
  });
}

/**
 * Hook for batch optimistic updates
 */
export function useOptimisticBatchUpdate(options: OptimisticUpdateOptions = {}) {
  const { enabled = true, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: TransferUpdate[]) => {
      // Simulate batch API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return updates.map(update => ({ id: update.id, ...update.updates }));
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
    },
    onError: (error, variables, context) => {
      // Log error for debugging
      console.error('Batch update failed:', error);
    }
  });
}

/**
 * Hook for optimistic toggle operations (like bookmark, like, etc.)
 */
export function useOptimisticToggle(
  transferId: string,
  field: keyof Transfer,
  options: OptimisticUpdateOptions = {}
) {
  const { enabled = true, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newValue: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: transferId, [field]: newValue };
    },
    
    onMutate: async (newValue) => {
      if (!enabled) return;

      await queryClient.cancelQueries({ queryKey: queryKeys.transfers.all });
      
      const previousTransfers = queryClient.getQueryData(queryKeys.transfers.lists());
      
      // Optimistically toggle the field
      queryClient.setQueryData(queryKeys.transfers.lists(), (old: any) => {
        if (!old || !old.data) return old;
        
        return {
          ...old,
          data: old.data.map((transfer: Transfer) =>
            transfer.id === transferId
              ? { ...transfer, [field]: newValue }
              : transfer
          ),
        };
      });
      
      // Update specific transfer detail
      queryClient.setQueryData(
        queryKeys.transfers.detail(transferId),
        (old: Transfer | undefined) => {
          if (!old) return old;
          return { ...old, [field]: newValue };
        }
      );
      
      return { previousTransfers };
    },
    
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables);
    },
    
    onError: (error, variables, context) => {
      if (context?.previousTransfers) {
        queryClient.setQueryData(queryKeys.transfers.lists(), context.previousTransfers);
      }
      onError?.(error as Error, variables);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.detail(transferId) });
    },
  });
}
