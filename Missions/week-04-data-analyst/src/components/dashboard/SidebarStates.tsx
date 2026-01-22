"use client"

import { SkeletonCard } from "@/components/ui/skeleton-card"
import { AlertCircle, TrendingUp, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Loading State Component
export function SidebarLoadingState() {
  return (
    <div className="space-y-1" role="status" aria-label="Loading top transfers">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-surface-border/60">
          {/* Rank Skeleton */}
          <SkeletonCard className="w-8 h-6" />
          
          {/* Content Skeleton */}
          <div className="flex-1 space-y-2">
            <SkeletonCard className="h-4 w-32" />
            <SkeletonCard className="h-3 w-24" />
          </div>
          
          {/* Value Skeleton */}
          <SkeletonCard className="w-12 h-4" />
        </div>
      ))}
    </div>
  )
}

// Empty State Component
export function SidebarEmptyState() {
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 text-center"
      role="status"
      aria-label="No transfers available"
    >
      <TrendingUp className="h-8 w-8 text-text-tertiary mb-3" />
      <p className="text-text-secondary text-sm font-medium">
        No transfers available
      </p>
      <p className="text-text-tertiary text-xs mt-1">
        Check back later for the latest deals
      </p>
    </div>
  )
}

// Error State Component
export function SidebarErrorState({ onRetry, tabName = "transfers" }: { onRetry: () => void; tabName?: string }) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 text-center"
      role="status"
      aria-label={`Failed to load ${tabName}`}
    >
      <AlertCircle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-text-secondary text-sm font-medium">
        Failed to load {tabName}
      </p>
      <p className="text-text-tertiary text-xs mt-1 mb-4">
        Please try again later
      </p>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onRetry}
        className="text-xs"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  )
}
