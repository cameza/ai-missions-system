/**
 * Test Manual Refresh Functionality
 * Verifies that useRefreshTransfers targets the correct cache keys
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRefreshTransfers } from '@/hooks/use-transfers';
import { useUIStore } from '@/lib/store';
import { queryKeys } from '@/lib/query-client';

describe('Manual Refresh Functionality', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: React.ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    
    // Reset store state
    useUIStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should invalidate the correct filter-aware cache key', () => {
    const { result } = renderHook(() => useRefreshTransfers(), { wrapper });
    
    // Set up some filters in the store
    act(() => {
      useUIStore.getState().setFilter('leagues', ['premier-league']);
      useUIStore.getState().setSearchQuery('Messi');
      useUIStore.getState().setCurrentPage(2);
    });
    
    // Mock the invalidateQueries method to track calls
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    
    // Call the refresh function
    act(() => {
      result.current();
    });
    
    // Verify invalidateQueries was called with the correct filter-aware key
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.transfersWithFilters({
        filters: expect.objectContaining({ leagues: ['premier-league'] }),
        sort: expect.any(Object),
        page: 2,
        search: 'Messi'
      })
    });
    
    // Verify other queries are also invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.summary });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.topTransfers });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.latestDeals });
    
    invalidateSpy.mockRestore();
  });

  it('should use current store state for cache invalidation', () => {
    const { result } = renderHook(() => useRefreshTransfers(), { wrapper });
    
    // Set up different filters
    act(() => {
      useUIStore.getState().setFilters({
        leagues: ['la-liga', 'serie-a'],
        positions: ['forward'],
        transferTypes: ['Permanent'],
        ageRange: [20, 30],
        valueRange: [1000000, 50000000],
        dateRange: null,
        status: 'confirmed'
      });
      useUIStore.getState().setSortConfig({ field: 'transferValue', direction: 'desc' });
      useUIStore.getState().setCurrentPage(3);
      useUIStore.getState().setSearchQuery('Ronaldo');
    });
    
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    
    act(() => {
      result.current();
    });
    
    // Verify the complex filter state is used correctly
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.transfersWithFilters({
        filters: expect.objectContaining({
          leagues: ['la-liga', 'serie-a'],
          positions: ['forward'],
          transferTypes: ['Permanent'],
          ageRange: [20, 30],
          valueRange: [1000000, 50000000],
          dateRange: null,
          status: 'confirmed'
        }),
        sort: { field: 'transferValue', direction: 'desc' },
        page: 1, // Page resets to 1 when filters change (expected behavior)
        search: 'Ronaldo'
      })
    });
    
    invalidateSpy.mockRestore();
  });

  it('should work with default filters when no filters are set', () => {
    const { result } = renderHook(() => useRefreshTransfers(), { wrapper });
    
    // Don't set any filters - use defaults
    
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    
    act(() => {
      result.current();
    });
    
    // Should work with default state
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.transfersWithFilters({
        filters: expect.any(Object), // Default filters
        sort: expect.any(Object), // Default sort
        page: 1, // Default page
        search: '' // Default search
      })
    });
    
    invalidateSpy.mockRestore();
  });

  it('should update cache key when filters change', () => {
    const { result, rerender } = renderHook(() => useRefreshTransfers(), { wrapper });
    
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    
    // Initial refresh with default state
    act(() => {
      result.current();
    });
    
    const firstCall = invalidateSpy.mock.calls[0];
    
    // Change filters
    act(() => {
      useUIStore.getState().setFilter('leagues', ['bundesliga']);
    });
    
    // Refresh again
    act(() => {
      result.current();
    });
    
    const secondCall = invalidateSpy.mock.calls[1];
    
    // Should have different query keys due to different filters
    expect(firstCall[0]?.queryKey).not.toEqual(secondCall[0]?.queryKey);
    
    invalidateSpy.mockRestore();
  });
});
