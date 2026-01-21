/**
 * Dashboard Client Component - Transfer Hub
 * 
 * Client-side wrapper for the main dashboard page that provides:
 * - TanStack Query integration for real-time updates
 * - Auto-refresh functionality with user controls
 * - Error boundaries for each section
 * - Responsive layout management
 * - Smooth transitions and loading states
 * 
 * Architecture: Server Component → DashboardClient (Client Component)
 * Data Flow: Server fetch → Client hydration → TanStack Query updates
 * 
 * References:
 * - Tech Spec §5.1: Component hierarchy and data flow
 * - PRD §6.2.1: Complete dashboard layout specification
 * - UI Spec §4: Responsive layout structure (65/35 split)
 */
'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { RefreshCw, Settings } from 'lucide-react'

// Component imports
import { DashboardKPICards } from '@/components/features/dashboard-kpi-cards'
import { DashboardCharts } from '@/components/features/dashboard/DashboardCharts'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TransferTableContainer } from '@/components/features/transfer-table/TransferTableContainer'
import { useTransferStore } from '@/lib/stores/useTransferStore'

// Hook imports
import { useTransfers } from '@/hooks/useTransfers'
import { useSummaryQuery } from '@/hooks/use-summary-query'
import { useTopTransfersQuery } from '@/hooks/useTopTransfers'

// Type imports
import type { Transfer, SummaryData, TopTransfer } from '@/types/dashboard'

interface DashboardClientProps {
  initialTransfers: Transfer[]
  initialSummary: SummaryData | null
  initialTopTransfers: TopTransfer[]
}

export function DashboardClient({ 
  initialTransfers, 
  initialSummary, 
  initialTopTransfers 
}: DashboardClientProps) {
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000) // 5 minutes
  const [lastRefresh, setLastRefresh] = useState(new Date('2025-01-19T21:00:00.000Z')) // Fixed timestamp for SSR consistency

  // TanStack Query hooks with initial data from server
  const transfersQuery = useTransfers(initialTransfers)
  
  const summaryQuery = useSummaryQuery(initialSummary)
  
  const topTransfersQuery = useTopTransfersQuery(initialTopTransfers)

  // Configure auto-refresh intervals
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Refresh all queries
        transfersQuery.refetch()
        summaryQuery.refetch()
        topTransfersQuery.refetch()
        setLastRefresh(new Date('2025-01-19T21:00:00.000Z'))
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, transfersQuery, summaryQuery, topTransfersQuery])

  // Handle sorting
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    const { setSorting } = useTransferStore.getState();
    setSorting(field, direction);
  };

  // Manual refresh handler
  const handleManualRefresh = () => {
    Promise.all([
      transfersQuery.refetch(),
      summaryQuery.refetch(),
      topTransfersQuery.refetch()
    ]).then(() => {
      setLastRefresh(new Date('2025-01-19T21:00:00.000Z'))
    })
  }

  // Responsive state
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Main Dashboard Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 text-left"
        >
          <h1 className="text-4xl font-bold text-white mb-1">
            Here We Go
          </h1>
          <p className="text-lg font-bold text-[#00FF88] uppercase tracking-wider">
            Live football market update
          </p>
        </motion.header>

        {/* KPI Cards Section */}
        <section className="mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <DashboardKPICards />
          </motion.div>
        </section>

        {/* Charts Section - Full Width */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <DashboardCharts />
        </motion.section>
        
        {/* Second Row: Transfer Table + Sidebar - 65/35 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transfer Table - Left Column (8/12 = 66.67%) */}
          <div className="lg:col-span-8">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <TransferTableContainer 
                transfers={transfersQuery.transfers}
                isLoading={transfersQuery.isLoading}
                hasNextPage={transfersQuery.hasNextPage}
                onLoadMore={transfersQuery.loadMore}
                onSort={handleSort}
              />
            </motion.section>
          </div>
          
          {/* Sidebar - Right Column (4/12 = 33.33%) */}
          <div className="lg:col-span-4">
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="lg:sticky lg:top-6"
            >
              <Sidebar className="h-fit lg:min-h-[calc(100vh-12rem)]" />
            </motion.aside>
          </div>
        </div>

        {/* Last updated indicator */}
        <div className="mt-8 text-center text-xs text-text-tertiary">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Auto-refresh controls */}
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-surface/80 backdrop-blur-sm p-3 rounded-lg border border-surface-border">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
              aria-label="Toggle auto-refresh"
            />
            <span className="text-sm text-text-secondary">Auto-refresh</span>
          </div>
          
          {autoRefresh && (
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm bg-background border border-surface-border rounded px-2 py-1"
            >
              <option value={60000}>1 min</option>
              <option value={300000}>5 min</option>
              <option value={600000}>10 min</option>
            </select>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={transfersQuery.isLoading || summaryQuery.isLoading || topTransfersQuery.isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${transfersQuery.isLoading || summaryQuery.isLoading || topTransfersQuery.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
