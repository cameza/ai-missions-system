/**
 * KPI Card Component - Transfer Hub Dashboard
 * 
 * Implements UI Spec section 3 with Transfer Hub design tokens:
 * - Surface background: #12121A (glassmorphism effect)
 * - Surface border: #2A2A35 with hover highlight
 * - Typography: 30px/900 italic for values, 12px/700 uppercase for labels
 * - Glassmorphism: backdrop-blur-sm with opacity
 * 
 * Props:
 * - title: Card title (12px/700 uppercase tracking-wider text-gray-300)
 * - value: Main value display (30px/900 italic white)
 * - change?: Optional change metric with trend
 * - trend?: "up" | "down" | "neutral" for color coding
 * - icon?: Optional icon component
 * - badge?: Optional badge component
 * - loading: Show skeleton loading state
 * - error: Show error state with retry
 * - onRetry?: Optional retry callback
 * 
 * Features:
 * - Hover states with border highlight effects
 * - Loading skeleton with shimmer animation
 * - Error states with retry functionality
 * - Accessibility compliance (ARIA labels, keyboard navigation)
 * - Responsive design support
 * - Real-time data updates support
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardProps } from "./card"
import { Skeleton } from "./skeleton"
import { Button } from "./button"
import { Badge } from "./badge"

const kpiCardVariants = cva(
  // Base styles matching UI Spec §3
  "relative overflow-hidden transition-all duration-300 hover:border-[#8B5CF6]/50",
  {
    variants: {
      state: {
        default: "",
        loading: "pointer-events-none",
        error: "",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

export interface KPICardProps extends Omit<CardProps, "children"> {
  title: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  badge?: React.ReactNode
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  className?: string
}

const trendColors = {
  up: "text-[#00FF88]", // Green for positive
  down: "text-[#EF4444]", // Red for negative  
  neutral: "text-[#94A3B8]", // Gray for neutral
}

const formatChange = (change: number, trend: "up" | "down" | "neutral") => {
  // Handle floating point precision issues
  const roundedChange = Math.round(Math.abs(parseFloat(change.toFixed(10))))
  const sign = trend === "up" ? "+" : trend === "down" ? "-" : ""
  return `${sign}${roundedChange}%`
}

const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(({ 
    title, 
    value, 
    change, 
    trend = "neutral", 
    icon, 
    badge, 
    loading = false, 
    error = false, 
    onRetry,
    className,
    ...cardProps 
  }, ref) => {
    
    // Generate ARIA label for accessibility
    const ariaLabel = React.useMemo(() => {
      if (loading) return `${title} loading`
      if (error) return `${title} error`
      let label = `${title}: ${value}`
      if (change !== undefined && trend !== "neutral") {
        label += `, ${formatChange(change, trend)} from average`
      }
      return label
    }, [title, value, change, trend, loading, error])

    // Loading state
    if (loading) {
      return (
        <Card
          ref={ref}
          variant="glass"
          padding="default"
          className={cn(kpiCardVariants({ state: "loading" }), className)}
          role="region"
          aria-label={ariaLabel}
          {...cardProps}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" /> {/* Title skeleton */}
              {icon && <Skeleton className="h-4 w-4 rounded" />}
            </div>
            <Skeleton className="h-8 w-24" /> {/* Value skeleton */}
            {change !== undefined && (
              <Skeleton className="h-3 w-16" />
            )}
          </div>
        </Card>
      )
    }

    // Error state
    if (error) {
      return (
        <Card
          ref={ref}
          variant="glass"
          padding="default"
          className={cn(kpiCardVariants({ state: "error" }), className)}
          {...cardProps}
        >
          <div className="space-y-3" role="region" aria-label={`${title} error`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                {title}
              </h3>
              {icon}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-red-400">Failed to load data</p>
              {onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                  className="h-6 text-xs"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </Card>
      )
    }

    // Normal state
    
    const cardContent = (
      <div className="space-y-3">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
            {title}
          </h3>
          {icon}
        </div>

        {/* Main value display */}
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-black italic text-white leading-none">
            {value}
          </p>
          {badge}
        </div>

        {/* Change metric with trend indicator */}
        {change !== undefined && (
          <div className="flex items-center justify-between">
            <p 
              className={cn(
                "text-xs font-medium",
                trendColors[trend]
              )}
            >
              {formatChange(change || 0, trend)} vs avg
            </p>
          </div>
        )}
      </div>
    )
    
        
    return (
      <Card
        ref={ref}
        variant="glass"
        padding="default"
        className={cn(kpiCardVariants({ state: "default" }), className)}
        role="region"
        aria-label={ariaLabel}
        aria-live="polite"
        {...cardProps}
      >
        {cardContent}
      </Card>
    )
})

KPICard.displayName = "KPICard"

export { KPICard, kpiCardVariants, trendColors }
