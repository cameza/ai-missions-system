/**
 * Dashboard Types - Transfer Hub
 * 
 * Type definitions specific to dashboard components and data structures.
 * Re-exports common types from main types file for dashboard-specific imports.
 */

// Re-export core types needed for dashboard
export type { Transfer, Club, League } from './index'

// Re-export SummaryData from index with proper typing
export interface SummaryData {
  todayCount: number
  windowTotal: number
  totalSpend: number
  mostActiveTeam: {
    name: string
    transfers: number
    logo?: string
  }
  averageDailyTransfers: number
  windowType: 'SUMMER' | 'WINTER' | 'MID-SEASON'
  isRecordHigh: boolean
  lastUpdated: string
}

/**
 * Top Transfer interface for sidebar component
 * Used for displaying ranked transfer listings
 */
export interface TopTransfer {
  id: string
  rank: number
  playerName: string
  fromClub: string
  toClub: string
  transferValue: string
  transferValueUsd: number
}

/**
 * Dashboard data interface for server-side fetching
 * Combined data structure for initial page load
 */
export interface DashboardData {
  transfers: Transfer[]
  summary: SummaryData | null
  topTransfers: TopTransfer[]
}

/**
 * Dashboard layout configuration
 * Responsive breakpoint definitions
 */
export interface DashboardLayoutConfig {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  sidebarCollapsed: boolean
}

/**
 * Auto-refresh configuration
 */
export interface AutoRefreshConfig {
  enabled: boolean
  interval: number // in milliseconds
  lastRefresh: Date
}
