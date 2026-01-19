/**
 * State Management Tests
 * Comprehensive testing for Zustand store and TanStack Query hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from '@/lib/store';
import { useTransfers, useTransferSummary, useTopTransfers } from '@/hooks/use-transfers';
import { storageService } from '@/lib/storage';
import { DEFAULT_FILTERS, DEFAULT_SORT } from '@/types/state';

// Mock storage service
vi.mock('@/lib/storage', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}));

// Mock API functions
vi.mock('@/hooks/use-transfers', async () => {
  const actual = await vi.importActual('@/hooks/use-transfers');
  return {
    ...actual,
    fetchTransfers: vi.fn(),
    fetchTransferSummary: vi.fn(),
    fetchTopTransfers: vi.fn(),
  };
});

describe('UI Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();
      
      expect(state.sidebarOpen).toBe(false);
      expect(state.activeTab).toBe('top');
      expect(state.activeFilters).toEqual(DEFAULT_FILTERS);
      expect(state.searchQuery).toBe('');
      expect(state.sortConfig).toEqual(DEFAULT_SORT);
      expect(state.currentPage).toBe(1);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar state', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.sidebarOpen).toBe(false);
      
      act(() => {
        result.current.toggleSidebar();
      });
      
      expect(result.current.sidebarOpen).toBe(true);
      
      act(() => {
        result.current.toggleSidebar();
      });
      
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('should set sidebar state explicitly', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSidebarOpen(true);
      });
      
      expect(result.current.sidebarOpen).toBe(true);
      
      act(() => {
        result.current.setSidebarOpen(false);
      });
      
      expect(result.current.sidebarOpen).toBe(false);
    });
  });

  describe('Tab Management', () => {
    it('should set active tab', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.activeTab).toBe('top');
      
      act(() => {
        result.current.setActiveTab('latest');
      });
      
      expect(result.current.activeTab).toBe('latest');
      
      act(() => {
        result.current.setActiveTab('insider');
      });
      
      expect(result.current.activeTab).toBe('insider');
    });
  });

  describe('Filter Management', () => {
    it('should set individual filter', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setFilter('leagues', ['premier-league']);
      });
      
      expect(result.current.activeFilters.leagues).toEqual(['premier-league']);
      expect(result.current.currentPage).toBe(1); // Should reset page
    });

    it('should set multiple filters', () => {
      const { result } = renderHook(() => useUIStore());
      
      const newFilters = {
        leagues: ['premier-league', 'la-liga'],
        positions: ['forward', 'midfielder'],
      };
      
      act(() => {
        result.current.setFilters(newFilters);
      });
      
      expect(result.current.activeFilters.leagues).toEqual(['premier-league', 'la-liga']);
      expect(result.current.activeFilters.positions).toEqual(['forward', 'midfielder']);
      expect(result.current.currentPage).toBe(1); // Should reset page
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setFilters({
          leagues: ['premier-league'],
          positions: ['forward'],
        });
      });
      
      expect(result.current.activeFilters.leagues).toEqual(['premier-league']);
      
      act(() => {
        result.current.clearFilters();
      });
      
      expect(result.current.activeFilters).toEqual(DEFAULT_FILTERS);
      expect(result.current.currentPage).toBe(1); // Should reset page
    });
  });

  describe('Search Management', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSearchQuery('Lionel Messi');
      });
      
      expect(result.current.searchQuery).toBe('Lionel Messi');
      expect(result.current.currentPage).toBe(1); // Should reset page
    });
  });

  describe('Sort Management', () => {
    it('should set sort configuration', () => {
      const { result } = renderHook(() => useUIStore());
      
      const newSort = { field: 'transferValue', direction: 'asc' as const };
      
      act(() => {
        result.current.setSortConfig(newSort);
      });
      
      expect(result.current.sortConfig).toEqual(newSort);
      expect(result.current.currentPage).toBe(1); // Should reset page
    });
  });

  describe('Pagination Management', () => {
    it('should set current page', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setCurrentPage(3);
      });
      
      expect(result.current.currentPage).toBe(3);
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.loading).toBe(false);
    });

    it('should set and clear error state', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setError('Something went wrong');
      });
      
      expect(result.current.error).toBe('Something went wrong');
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useUIStore());
      
      // Change some state
      act(() => {
        result.current.setSidebarOpen(true);
        result.current.setActiveTab('latest');
        result.current.setSearchQuery('test');
        result.current.setLoading(true);
        result.current.setError('error');
      });
      
      // Verify state changed
      expect(result.current.sidebarOpen).toBe(true);
      expect(result.current.activeTab).toBe('latest');
      expect(result.current.searchQuery).toBe('test');
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe('error');
      
      // Reset state
      act(() => {
        result.current.reset();
      });
      
      // Verify reset to initial state
      expect(result.current.sidebarOpen).toBe(false);
      expect(result.current.activeTab).toBe('top');
      expect(result.current.activeFilters).toEqual(DEFAULT_FILTERS);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.sortConfig).toEqual(DEFAULT_SORT);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save and retrieve data', () => {
    const testData = { key: 'value' };
    
    (storageService.set as any).mockImplementation(() => {});
    (storageService.get as any).mockReturnValue(testData);
    
    storageService.set('test-key', testData);
    const result = storageService.get('test-key');
    
    expect(result).toEqual(testData);
    expect(storageService.set).toHaveBeenCalledWith('test-key', testData);
    expect(storageService.get).toHaveBeenCalledWith('test-key');
  });

  it('should handle missing data gracefully', () => {
    (storageService.get as any).mockReturnValue(null);
    
    const result = storageService.get('non-existent-key');
    
    expect(result).toBe(null);
  });
});

describe('Query Hooks', () => {
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
  });

  describe('useTransfers Hook', () => {
    it('should initialize with correct query key', () => {
      const { result } = renderHook(() => useTransfers(), { wrapper });
      
      expect(result.current).toBeDefined();
      // Query key should include filters, sort, page, and search
      expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toContain('transfers');
    });

    it('should respond to filter changes', () => {
      const { result, rerender } = renderHook(() => useTransfers(), { wrapper });
      
      const initialQueryKey = queryClient.getQueryCache().getAll()[0]?.queryKey;
      
      // Change filters through store
      act(() => {
        useUIStore.getState().setFilter('leagues', ['premier-league']);
      });
      
      rerender();
      
      const newQueryKey = queryClient.getQueryCache().getAll()[0]?.queryKey;
      expect(newQueryKey).not.toEqual(initialQueryKey);
    });
  });

  describe('useTransferSummary Hook', () => {
    it('should initialize with correct query key', () => {
      const { result } = renderHook(() => useTransferSummary(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toContain('summary');
    });
  });

  describe('useTopTransfers Hook', () => {
    it('should initialize with correct query key', () => {
      const { result } = renderHook(() => useTopTransfers(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toContain('top-transfers');
    });
  });
});

describe('State Integration', () => {
  beforeEach(() => {
    useUIStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should maintain state consistency across interactions', () => {
    const { result } = renderHook(() => useUIStore());
    
    // Simulate typical user interaction flow
    act(() => {
      result.current.setSidebarOpen(true);
      result.current.setActiveTab('latest');
      result.current.setSearchQuery('Messi');
      result.current.setFilter('leagues', ['la-liga']);
      result.current.setCurrentPage(2);
    });
    
    expect(result.current.sidebarOpen).toBe(true);
    expect(result.current.activeTab).toBe('latest');
    expect(result.current.searchQuery).toBe('Messi');
    expect(result.current.activeFilters.leagues).toEqual(['la-liga']);
    expect(result.current.currentPage).toBe(2);
    
    // Clear filters should reset page but keep other state
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.activeFilters).toEqual(DEFAULT_FILTERS);
    expect(result.current.currentPage).toBe(1); // Reset
    expect(result.current.sidebarOpen).toBe(true); // Unchanged
    expect(result.current.activeTab).toBe('latest'); // Unchanged
    expect(result.current.searchQuery).toBe('Messi'); // Unchanged
  });

  it('should handle error states correctly', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.setError('Network error');
      result.current.setLoading(false);
    });
    
    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBe(null);
  });
});
