/**
 * Use Cancellable Query Hook
 * 
 * Provides request cancellation functionality for TanStack Query.
 * Automatically cancels in-flight requests on component unmount.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import { useCallback, useRef, useEffect } from "react"
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import type { QueryKey, QueryFunction, UseQueryOptions } from "@tanstack/react-query"

/**
 * Options for useCancellableQuery
 */
export interface UseCancellableQueryOptions<TData> 
  extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  /** Whether to enable cancellation */
  enableCancellation?: boolean;
  /** Custom abort signal handler */
  onAbort?: (reason: string) => void;
}

/**
 * Custom hook for cancellable queries
 * 
 * Automatically cancels in-flight requests when component unmounts
 * or when dependencies change. Prevents memory leaks and unnecessary
 * network requests.
 * 
 * @param queryKey - TanStack Query key
 * @param queryFn - Query function that accepts AbortSignal
 * @param options - Query options
 * @returns Query result
 */
export function useCancellableQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: UseCancellableQueryOptions<TData> = {}
) {
  const { 
    enableCancellation = true, 
    onAbort,
    ...queryOptions 
  } = options;
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function to cancel ongoing request
  const cancelRequest = useCallback((reason: string = 'Component unmounted') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(reason);
      onAbort?.(reason);
      abortControllerRef.current = null;
    }
  }, [onAbort]);

  // Create query function with abort signal
  const cancellableQueryFn: QueryFunction<TData> = async (context) => {
    // Cancel previous request if still running
    cancelRequest('New request started');
    
    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Call original query function with signal
      const result = await queryFn({
        ...context,
        signal: abortController.signal,
      });
      
      // Clear controller on success
      abortControllerRef.current = null;
      return result;
    } catch (error) {
      // Clear controller on error
      abortControllerRef.current = null;
      
      // Re-throw abort errors as specific type
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      
      throw error;
    }
  };

  // Setup cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableCancellation) {
        cancelRequest('Component unmounted');
      }
    };
  }, [enableCancellation, onAbort, cancelRequest]);

  return useQuery({
    queryKey,
    queryFn: enableCancellation ? cancellableQueryFn : queryFn,
    ...queryOptions,
  });
}

/**
 * Hook for cancellable infinite queries
 */
export function useCancellableInfiniteQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: UseCancellableQueryOptions<TData> = {}
) {
  const { 
    enableCancellation = true, 
    onAbort,
    ...queryOptions 
  } = options;
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelRequest = useCallback((reason: string = 'Component unmounted') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(reason);
      onAbort?.(reason);
      abortControllerRef.current = null;
    }
  }, [onAbort]);

  const cancellableQueryFn: QueryFunction<TData> = async (context) => {
    cancelRequest('New infinite query page started');
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      const result = await queryFn({
        ...context,
        signal: abortController.signal,
      });
      
      abortControllerRef.current = null;
      return result;
    } catch (error) {
      abortControllerRef.current = null;
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Infinite query page was cancelled');
      }
      
      throw error;
    }
  };

  useEffect(() => {
    return () => {
      if (enableCancellation) {
        cancelRequest('Component unmounted');
      }
    };
  }, [enableCancellation, onAbort, cancelRequest]);

  return useQuery({
    queryKey,
    queryFn: enableCancellation ? cancellableQueryFn : queryFn,
    ...queryOptions,
  });
}

/**
 * Hook for manual request cancellation
 */
export function useRequestCancellation() {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const cancelRequest = useCallback((key: string, reason?: string) => {
    const controller = abortControllersRef.current.get(key);
    if (controller) {
      controller.abort(reason || 'Manually cancelled');
      abortControllersRef.current.delete(key);
      return true;
    }
    return false;
  }, []);

  const cancelAllRequests = useCallback((reason?: string) => {
    const cancelled = Array.from(abortControllersRef.current.keys()).map(key => 
      cancelRequest(key, reason || 'All requests cancelled')
    );
    return cancelled.every(Boolean);
  }, [cancelRequest]);

  const registerRequest = (key: string, controller: AbortController) => {
    // Cancel existing request with same key
    cancelRequest(key, 'New request registered');
    
    // Register new controller
    abortControllersRef.current.set(key, controller);
    
    // Return cleanup function
    return () => cancelRequest(key, 'Request completed');
  };

  const getActiveRequests = () => Array.from(abortControllersRef.current.keys());

  const hasActiveRequests = () => abortControllersRef.current.size > 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllRequests('Component unmounted');
    };
  }, [cancelAllRequests]);

  return {
    cancelRequest,
    cancelAllRequests,
    registerRequest,
    getActiveRequests,
    hasActiveRequests,
  };
}

/**
 * Higher-order query function that adds cancellation support
 */
export function withCancellation<TData>(
  queryFn: QueryFunction<TData>
): QueryFunction<TData> {
  return async (context) => {
    const { signal } = context;
    
    // Check if already aborted
    if (signal?.aborted) {
      throw new Error('Request was cancelled before start');
    }
    
    // Create promise that rejects on abort
    const abortPromise = new Promise<never>((_, reject) => {
      if (signal) {
        signal.addEventListener('abort', () => {
          reject(new Error('Request was cancelled'));
        }, { once: true });
      }
    });
    
    // Race between actual query and abort
    return Promise.race([
      queryFn(context),
      abortPromise,
    ]);
  };
}

/**
 * Hook for debounced cancellable queries
 */
export function useDebouncedCancellableQuery<TData>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  delay: number = 300,
  options: UseCancellableQueryOptions<TData> = {}
) {
  const { enableCancellation = true, ...queryOptions } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelDebouncedRequest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Debounced request cancelled');
      abortControllerRef.current = null;
    }
  };

  const debouncedQueryFn: QueryFunction<TData> = async (context) => {
    return new Promise((resolve, reject) => {
      cancelDebouncedRequest();
      
      timeoutRef.current = setTimeout(async () => {
        try {
          const abortController = new AbortController();
          abortControllerRef.current = abortController;
          
          const result = await queryFn({
            ...context,
            signal: abortController.signal,
          });
          
          abortControllerRef.current = null;
          resolve(result);
        } catch (error) {
          abortControllerRef.current = null;
          reject(error);
        }
      }, delay);
    });
  };

  useEffect(() => {
    return () => {
      cancelDebouncedRequest();
    };
  }, []);

  return useQuery({
    queryKey,
    queryFn: enableCancellation ? debouncedQueryFn : queryFn,
    ...queryOptions,
  });
}
