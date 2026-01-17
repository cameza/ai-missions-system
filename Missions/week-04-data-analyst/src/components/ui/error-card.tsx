/**
 * ErrorCard Component - Transfer Hub Design System
 * 
 * Error state card following UI Spec section 3.2 with destructive styling:
 * - Uses destructive color tokens for error indication
 * - Glassmorphism effects with backdrop-blur
 * - Clear error messaging and retry actions
 * 
 * Features:
 * - Error icon and title for clear visual indication
 * - Optional error description for context
 * - Retry button for recovery actions
 * - Glassmorphism effects consistent with design system
 * - Accessibility with proper ARIA error announcements
 * 
 * Accessibility:
 * - aria-live="assertive" for immediate screen reader announcement
 * - Unique description IDs for proper aria-describedby association
 * - Focus management for retry action
 * - High contrast error indicators
 */
import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "./card"
import { Button } from "./button"

interface ErrorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  onRetry?: () => void
  retryText?: string
  icon?: React.ReactNode
}

const ErrorCard = React.forwardRef<HTMLDivElement, ErrorCardProps>(
  ({ 
    className, 
    title = "Error Loading Data", 
    description = "Something went wrong while loading this content. Please try again.",
    onRetry,
    retryText = "Retry",
    icon,
    ...props 
  }, ref) => {
    const descriptionId = React.useId()
    const defaultIcon = <AlertTriangle className="h-5 w-5 text-destructive" />
    
    return (
      <Card
        ref={ref}
        variant="glass"
        className={cn(
          "border-destructive/20 bg-destructive/5",
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="p-5 space-y-4">
          {/* Error header */}
          <div className="flex items-start gap-3">
            {icon || defaultIcon}
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-semibold text-destructive">
                {title}
              </h3>
              {description && (
                <p 
                  id={descriptionId}
                  className="text-sm text-muted-foreground"
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Retry action */}
          {onRetry && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
                aria-describedby={description ? descriptionId : undefined}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryText}
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }
)
ErrorCard.displayName = "ErrorCard"

export { ErrorCard }
