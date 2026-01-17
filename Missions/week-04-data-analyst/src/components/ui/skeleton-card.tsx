/**
 * SkeletonCard Component - Transfer Hub Design System
 * 
 * Loading skeleton that mimics KPI card layout from UI Spec section 3.2:
 * - Height: 120px (h-[120px]) to match KPI card dimensions
 * - Glassmorphism styling with backdrop-blur
 * - Animated shimmer effect for loading feedback
 * 
 * Features:
 * - Matches KPI card layout structure
 * - Smooth shimmer animation
 * - Glassmorphism effects
 * - Accessibility with loading announcements
 * 
 * Accessibility:
 * - aria-live="polite" for screen reader announcements
 * - aria-busy="true" to indicate loading state
 * - Proper semantic HTML structure
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: "kpi" | "default" | "custom"
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, height = "kpi", ...props }, ref) => {
    const heightClasses = {
      kpi: "h-[120px]",
      default: "h-32",
      custom: "",
    }

    return (
      <Card
        ref={ref}
        variant="glass"
        className={cn(
          heightClasses[height],
          "relative overflow-hidden",
          className
        )}
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading content"
        {...props}
      >
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 -translate-x-full animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        
        {/* Skeleton structure matching KPI card */}
        <div className="relative z-10 p-5 space-y-3">
          {/* Header skeleton */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              {/* Title skeleton */}
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              {/* Subtitle skeleton */}
              <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
            </div>
            {/* Badge skeleton */}
            <div className="h-5 w-12 bg-white/10 rounded-full animate-pulse" />
          </div>
          
          {/* Value skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    )
  }
)
SkeletonCard.displayName = "SkeletonCard"

export { SkeletonCard }
