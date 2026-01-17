/**
 * Card Component - Transfer Hub Design System
 * 
 * Implements UI Spec section 3.2 with Transfer Hub design tokens:
 * - Surface background: #12121A (CSS variable: --card)
 * - Surface border: #2A2A35 (CSS variable: --border)
 * - Primary accent: #8B5CF6 (CSS variable: --primary)
 * - Glassmorphism: backdrop-blur-sm with opacity
 * 
 * Card Variants:
 * - default: Static card with standard styling
 * - interactive: Hover effects with primary border highlight
 * - glass: Glassmorphism effect with backdrop blur
 * 
 * Padding Variants:
 * - none: No padding (p-0) - for custom layouts
 * - sm: Small padding (p-3) - for compact content
 * - default: Standard padding (p-5) - matches KPI spec (20px)
 * - lg: Large padding (p-6) - for spacious content
 * 
 * Features:
 * - Semantic HTML support via asChild prop
 * - Smooth color transitions (300ms)
 * - Focus management for interactive cards
 * - Glassmorphism effects for modern UI
 * 
 * Accessibility:
 * - Proper focus indicators
 * - Keyboard navigation support
 * - ARIA attributes support
 * - High contrast ratios
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  // Base styles
  "rounded-lg border border-[#2A2A35] bg-[#12121A] transition-colors duration-300",
  {
    variants: {
      variant: {
        default: "",
        interactive: "hover:border-[#8B5CF6]/50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/60 focus-visible:outline-none",
        glass: "bg-[#12121A]/80 backdrop-blur-sm",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    
    // Auto-add tabIndex for interactive cards if not already provided
    const interactiveProps = variant === "interactive" && !props.tabIndex 
      ? { tabIndex: 0 } 
      : {}
    
    // Generate the classes
    const computedClasses = cn(cardVariants({ variant, padding }), className)
    
    // Merge interactiveProps with other props
    const mergedProps = { ...interactiveProps, ...props }
    
    return (
      <Comp
        className={computedClasses}
        ref={ref}
        {...mergedProps}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
