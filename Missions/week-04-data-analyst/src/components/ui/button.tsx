/**
 * Button Component - Transfer Hub Design System
 * 
 * Implements UI Spec section 3.1 with Transfer Hub design tokens:
 * - Primary color: #8B5CF6 (CSS variable: --primary)
 * - Surface color: #12121A (CSS variable: --card) 
 * - Accent green: #00ff88 (CSS variable: --accent)
 * - Typography: Chakra Petch, italic uppercase, 14px/700
 * - Focus indicators: 2px ring accent-green
 * 
 * Variants:
 * - Primary: Main action button with purple background and glow effect
 * - Secondary: Alternative action with blue background
 * - Ghost: Subtle button with transparent background, white on hover
 * - Gradient: Premium button with purple-to-indigo gradient
 * 
 * Sizes:
 * - sm: 32px height (h-8) - for compact layouts
 * - default: 40px height (h-10) - standard size
 * - lg: 48px height (h-12) - for prominent actions
 * 
 * Accessibility:
 * - Keyboard navigation (Enter, Space keys)
 * - Focus visible indicators with accent-green ring
 * - ARIA attributes support
 * - Touch-friendly sizing (minimum 32px)
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles
  "font-chakra italic uppercase font-bold tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(139,92,246,0.3)] active:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
        ghost: "hover:bg-white/10 text-white hover:text-white active:bg-white/20 active:text-white/90",
        gradient: "bg-gradient-to-r from-primary to-indigo-600 text-white border-0 hover:from-primary/90 hover:to-indigo-500 active:from-primary/80 active:to-indigo-400",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
