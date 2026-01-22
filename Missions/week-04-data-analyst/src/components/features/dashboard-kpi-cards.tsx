/**
 * Dashboard KPI Cards Component - Transfer Hub
 * 
 * Implements the four KPI cards for the dashboard overview:
 * - Today's Transfers: Count with comparison metric
 * - Window Total: Total transfers with context label
 * - Total Spend: Currency amount with record indicator
 * - Most Active Team: Team name with logo
 * 
 * Features:
 * - Real-time data updates via TanStack Query
 * - Comparison metrics with color coding
 * - Loading skeleton states
 * - Error states with retry functionality
 * - Accessibility compliance
 * - Responsive design
 */
'use client'

import React from 'react'
import Image from 'next/image'
import { KPICard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { useSummaryQuery, useRefreshSummary } from '@/hooks/use-summary-query'
import { formatNumber, formatCurrency, formatComparisonMetric } from '@/utils/formatters'

/**
 * Component that renders all four KPI cards for the dashboard
 * Uses the useSummaryQuery hook for data fetching
 */
export const DashboardKPICards: React.FC = () => {
  const { 
    data: summary, 
    isLoading, 
    error, 
    refetch 
  } = useSummaryQuery()
  
  const refresh = useRefreshSummary()

  // Handle retry functionality
  const handleRetry = () => {
    refetch()
  }

  // Calculate comparison metric for Today's Transfers
  const todayComparison = React.useMemo(() => {
    if (!summary) return null
    return formatComparisonMetric(
      summary.todayCount, 
      summary.averageDailyTransfers
    )
  }, [summary])

  return (
    <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory -mx-6 px-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 sm:mx-0 sm:px-0 hide-scrollbar">
      {/* Today's Transfers Card */}
      <div className="min-w-[85vw] snap-center sm:min-w-0 h-full flex flex-col">
        <KPICard
          title="Today's Transfers"
          value={summary?.todayCount ?? 0}
          change={todayComparison?.rawChange}
          trend={todayComparison?.trend}
          loading={isLoading}
          error={!!error}
          onRetry={handleRetry}
          className="h-full flex-1"
        />
      </div>

      {/* Window Total Card */}
      <div className="min-w-[85vw] snap-center sm:min-w-0 h-full flex flex-col">
        <KPICard
          title="Window Total"
          value={summary ? formatNumber(summary.windowTotal) : 0}
          badge={
            summary?.windowType && (
              <Badge variant="pending" className="text-xs">
                {summary.windowType}
              </Badge>
            )
          }
          loading={isLoading}
          error={!!error}
          onRetry={handleRetry}
          className="h-full flex-1"
        />
      </div>

      {/* Total Spend Card */}
      <div className="min-w-[85vw] snap-center sm:min-w-0 h-full flex flex-col">
        <KPICard
          title="Total Spend"
          value={summary ? formatCurrency(summary.totalSpend) : '€0'}
          badge={
            summary?.isRecordHigh && (
              <Badge className="bg-green-600 text-white text-xs">
                RECORD HIGH
              </Badge>
            )
          }
          loading={isLoading}
          error={!!error}
          onRetry={handleRetry}
          className="h-full flex-1"
        />
      </div>

      {/* Most Active Team Card */}
      <div className="min-w-[85vw] snap-center sm:min-w-0 h-full flex flex-col">
        <KPICard
          title="Most Active Team"
          value={summary?.mostActiveTeam?.name ?? 'No data'}
          badge={
            summary?.mostActiveTeam && (
              <Badge variant="outline" className="text-xs">
                {summary.mostActiveTeam.transfers} transfers
              </Badge>
            )
          }
          icon={
            summary?.mostActiveTeam?.logo && (
              <div className="relative h-4 w-4">
                <Image
                  src={summary.mostActiveTeam.logo}
                  alt={`${summary.mostActiveTeam.name} logo`}
                  fill
                  className="object-contain"
                  sizes="16px"
                />
              </div>
            )
          }
          loading={isLoading}
          error={!!error}
          onRetry={handleRetry}
          className="h-full flex-1"
        />
      </div>
    </div>
  )
}

export default DashboardKPICards
