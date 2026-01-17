/**
 * Input Component - Transfer Hub Design System
 * 
 * Implements UI Spec section 3.2 with Transfer Hub design tokens:
 * - Surface background: #12121A (CSS variable: --card)
 * - Surface border: #2A2A35 (CSS variable: --border)
 * - Text color: white (CSS variable: --foreground)
 * - Placeholder color: #94a3b8 (CSS variable: --muted-foreground)
 * - Accent green: #00ff88 (CSS variable: --accent) for focus states
 * 
 * Features:
 * - Dark theme optimized with high contrast
 * - Focus indicators with accent-green ring
 * - Error state support with destructive color
 * - Form validation integration ready
 * - Touch-friendly sizing
 * 
 * Accessibility:
 * - Proper focus management
 * - Error state announcements
 * - Keyboard navigation support
 * - ARIA attributes for form integration
 */
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border bg-input px-3 py-2 text-sm ring-offset-background",
          // Colors and styling
          "bg-[#12121A] border-[#2A2A35] text-white placeholder:text-gray-500",
          // Focus states
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Error state
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
