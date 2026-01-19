/**
 * State Management Types
 * Based on Tech Spec Section 6.2 - Simplified State Management
 */

// Transfer Types
export type TransferType = 'Loan' | 'Permanent' | 'Free Transfer' | 'N/A';

// Transfer Filters Interface
export interface TransferFilters {
  leagues: string[];
  positions: string[];
  transferTypes: TransferType[];
  ageRange: [number, number];
  valueRange: [number, number];
  dateRange: [Date, Date] | null;
  status: 'all' | 'confirmed' | 'rumours';
}

// Sort Configuration
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// UI State Interface
export interface UIState {
  // UI Concerns Only
  sidebarOpen: boolean;
  activeTab: 'top' | 'latest' | 'insider';
  activeFilters: TransferFilters;
  searchQuery: string;
  sortConfig: SortConfig;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

// Transfer Entity Interface
export interface Transfer {
  id: string;
  playerId: number;
  playerFirstName: string;
  playerLastName: string;
  playerFullName: string;
  age?: number;
  position?: string;
  nationality?: string;
  
  fromClubId?: string;
  toClubId?: string;
  fromClubName: string;
  toClubName: string;
  
  leagueId?: string;
  leagueName: string;
  
  transferType: TransferType;
  transferValueUsd?: number;
  transferValueDisplay: string;
  transferDate: Date;
  
  window: string;
  apiTransferId: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Transfer Summary for Dashboard
export interface TransferSummary {
  todayTransfers: number;
  windowTotal: number;
  totalSpend: number;
  mostActiveTeam: {
    name: string;
    transfers: number;
  };
  transfersByLeague: Array<{
    league: string;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    transfers: number;
  }>;
}

// API Response Types
export type APIResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// Default Filters
export const DEFAULT_FILTERS: TransferFilters = {
  leagues: [],
  positions: [],
  transferTypes: [],
  ageRange: [16, 50],
  valueRange: [0, 500000000],
  dateRange: null,
  status: 'all',
};

// Default Sort Configuration
export const DEFAULT_SORT: SortConfig = {
  field: 'transferDate',
  direction: 'desc',
};
