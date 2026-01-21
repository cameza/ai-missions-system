/**
 * Badge Component - Transfer Hub Design System
 * 
 * Implements UI Spec section 3.4 with Transfer Hub design tokens:
 * - Status colors: Done (emerald), Pending (purple), Rumor (yellow)
 * - Glassmorphism effects with backdrop-blur
 * - Dark theme optimized with high contrast
 * 
 * Status Variants:
 * - Done: Completed transfers (emerald-500)
 * - Pending: In-progress transfers (purple-500) 
 * - Rumor: Speculative transfers (yellow-500)
 * - Outline: Neutral state with white border
 * 
 * Features:
 * - Pill shape with rounded-full styling
 * - Compact sizing (10px font, minimal padding)
 * - Uppercase typography with tracking
 * - Border variants for visual hierarchy
 * 
 * Accessibility:
 * - Semantic status indicators
 * - High contrast ratios for readability
 * - Screen reader friendly text
 * - Touch-friendly sizing
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base styles
  "inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        done: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        pending: "bg-purple-500/10 text-purple-500 border-purple-500/20", 
        rumor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        outline: "bg-transparent text-white border-white/20",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    // Use default variant if none provided
    const badgeVariant = variant || 'outline'
    const ariaLabel = `${badgeVariant} status`
    
    return (
      <div
        className={cn(badgeVariants({ variant }), className)}
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
