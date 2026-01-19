/**
 * Zustand Store - UI State Only
 * Based on Tech Spec Section 6.2 - Simplified State Management
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UIState, TransferFilters, SortConfig, DEFAULT_FILTERS, DEFAULT_SORT } from '@/types/state';

interface UIStore extends UIState {
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: 'top' | 'latest' | 'insider') => void;
  setFilters: (filters: Partial<TransferFilters>) => void;
  setFilter: (key: keyof TransferFilters, value: any) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (sort: SortConfig) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial State
      sidebarOpen: false,
      activeTab: 'top',
      activeFilters: { ...DEFAULT_FILTERS }, // Clone to avoid shared references
      searchQuery: '',
      sortConfig: { ...DEFAULT_SORT }, // Clone to avoid shared references
      currentPage: 1,
      loading: false,
      error: null,

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      setActiveTab: (tab: 'top' | 'latest' | 'insider') => set({ activeTab: tab }),

      setFilters: (filters: Partial<TransferFilters>) => 
        set((state) => ({ 
          activeFilters: { ...state.activeFilters, ...filters },
          currentPage: 1 // Reset to first page when filters change
        })),

      setFilter: (key: keyof TransferFilters, value: any) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, [key]: value },
          currentPage: 1 // Reset to first page when filter changes
        })),

      clearFilters: () => set({ 
        activeFilters: { ...DEFAULT_FILTERS }, // Clone to avoid shared references
        currentPage: 1 // Reset to first page when filters are cleared
      }),

      setSearchQuery: (query: string) => set({ 
        searchQuery: query,
        currentPage: 1 // Reset to first page when search changes
      }),

      setSortConfig: (sort: SortConfig) => set({ 
        sortConfig: sort,
        currentPage: 1 // Reset to first page when sort changes
      }),

      setCurrentPage: (page: number) => set({ currentPage: page }),

      setLoading: (loading: boolean) => set({ loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () => set({
        sidebarOpen: false,
        activeTab: 'top',
        activeFilters: { ...DEFAULT_FILTERS }, // Clone to avoid shared references
        searchQuery: '',
        sortConfig: { ...DEFAULT_SORT }, // Clone to avoid shared references
        currentPage: 1,
        loading: false,
        error: null,
      }),
    }),
    {
      name: 'transfer-hub-ui-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage in browser environment
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback for server-side
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist specific fields to avoid persisting loading/error states
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activeTab: state.activeTab,
        activeFilters: state.activeFilters,
        searchQuery: state.searchQuery,
        sortConfig: state.sortConfig,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useSidebarState = () => useUIStore((state) => state.sidebarOpen);
export const useActiveTab = () => useUIStore((state) => state.activeTab);
export const useActiveFilters = () => useUIStore((state) => state.activeFilters);
export const useSearchQuery = () => useUIStore((state) => state.searchQuery);
export const useSortConfig = () => useUIStore((state) => state.sortConfig);
export const useCurrentPage = () => useUIStore((state) => state.currentPage);
export const useLoadingState = () => useUIStore((state) => state.loading);
export const useErrorState = () => useUIStore((state) => state.error);
