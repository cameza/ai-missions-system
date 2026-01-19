/**
 * Transfer Table Store
 * 
 * Manages UI state for the transfer table component.
 * Handles search, filtering, and pagination state.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Transfer filter types for soft launch
export type TransferStatusFilter = 'all' | 'confirmed';

// Transfer table store interface
export interface TransferStore {
  // UI State
  searchQuery: string;
  statusFilter: TransferStatusFilter;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: TransferStatusFilter) => void;
  setSorting: (field: string, order: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
}

// Default state
const defaultState = {
  searchQuery: '',
  statusFilter: 'all' as TransferStatusFilter,
  sortBy: 'transferDate',
  sortOrder: 'desc' as 'asc' | 'desc',
  currentPage: 1,
};

// Create the store
export const useTransferStore = create<TransferStore>()(
  devtools(
    (set, get) => ({
      ...defaultState,
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
      },
      
      setStatusFilter: (filter: TransferStatusFilter) => {
        set({ statusFilter: filter, currentPage: 1 });
      },
      
      setSorting: (field: string, order: 'asc' | 'desc') => {
        set({ sortBy: field, sortOrder: order, currentPage: 1 });
      },
      
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
      },
      
      resetFilters: () => {
        set(defaultState);
      },
    }),
    {
      name: 'transfer-store',
    }
  )
);
