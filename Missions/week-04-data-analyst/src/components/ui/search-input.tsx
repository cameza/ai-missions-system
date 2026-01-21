/**
 * SearchInput Component - Transfer Hub Design System
 * 
 * Extends Input component with search-specific features:
 * - Search icon from Lucide React (24px, positioned absolutely)
 * - Clear button with 32px minimum touch target (h-8 w-8)
 * - Integrated search and clear functionality
 * 
 * Design tokens from UI Spec section 3.2:
 * - Uses same Surface background (#12121A) and border (#2A2A35)
 * - Accent green (#00ff88) for focus states
 * - Proper spacing for icon integration
 * 
 * Features:
 * - Conditional clear button (only shows when has value)
 * - Configurable clear button visibility
 * - Proper ARIA labels for accessibility
 * - Touch-friendly clear button (32px minimum)
 * - Icon positioning with proper padding
 * 
 * Accessibility:
 * - Search icon is decorative (not announced to screen readers)
 * - Clear button has proper ARIA label
 * - Keyboard navigation support
 * - Focus management
 */
import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "./input"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  showClearButton?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      onClear,
      showClearButton = true,
      value,
      placeholder = "Search transfers, players, teams...",
      ...props
    },
    ref
  ) => {
    const hasValue = value && value.toString().length > 0

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          ref={ref}
          className={cn(
            "pl-10",
            showClearButton && hasValue && "pr-10",
            className
          )}
          value={value}
          role="searchbox"
          placeholder={placeholder}
          {...props}
        />
        {showClearButton && hasValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
            onClick={onClear}
            type="button"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
