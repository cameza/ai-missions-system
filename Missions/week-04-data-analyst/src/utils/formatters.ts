/**
 * Number Formatting Utilities - Transfer Hub Dashboard
 * 
 * Provides consistent number formatting across the application:
 * - formatNumber: Comma-separated integers (e.g., "1,284")
 * - formatCurrency: Abbreviated currency (e.g., "€3.42B", "€180M")
 * - formatPercentage: Comparison metrics (e.g., "+12% vs avg")
 * 
 * Features:
 * - Handles large numbers with abbreviations (K, M, B)
 * - Proper currency symbol placement
 * - Consistent decimal places for readability
 * - TypeScript type safety
 */

/**
 * Format a number with comma separators
 * @param value - Number to format
 * @returns Formatted string with commas (e.g., "1,284")
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return '0'
  
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  })
}

/**
 * Format currency with abbreviations for large amounts
 * @param value - Number to format
 * @param currency - Currency symbol (default: "€")
 * @returns Formatted currency string (e.g., "€3.42B", "€180M", "€1.2K")
 */
export function formatCurrency(value: number | string, currency: string = '€'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return `${currency}0`
  
  if (num >= 1_000_000_000) {
    // Billions
    const billions = num / 1_000_000_000
    return `${currency}${billions.toFixed(2)}B`
  } else if (num >= 1_000_000) {
    // Millions
    const millions = num / 1_000_000
    return `${currency}${millions.toFixed(0)}M`
  } else if (num >= 1_000) {
    // Thousands
    const thousands = num / 1_000
    return `${currency}${thousands.toFixed(1)}K`
  } else {
    // Less than 1000
    return `${currency}${num.toFixed(0)}`
  }
}

/**
 * Format percentage change with sign
 * @param value - Percentage value
 * @param baseline - Optional baseline for comparison
 * @param showSign - Whether to show + sign for positive values (default: true)
 * @returns Formatted percentage string (e.g., "+12%", "-5%", "0%")
 */
export function formatPercentage(
  value: number | string, 
  baseline?: number,
  showSign: boolean = true
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return '0%'
  
  let percentage = num
  
  // Calculate percentage from baseline if provided
  if (baseline !== undefined && baseline !== 0) {
    percentage = ((num - baseline) / baseline) * 100
  }
  
  const formatted = Math.abs(percentage).toFixed(0)
  const sign = percentage > 0 && showSign ? '+' : percentage < 0 ? '-' : ''
  
  return `${sign}${formatted}%`
}

/**
 * Determine trend direction from percentage change
 * @param change - Percentage change value
 * @param threshold - Minimum threshold to consider as change (default: 0.1)
 * @returns Trend direction: "up", "down", or "neutral"
 */
export function getTrendDirection(change: number | string, threshold: number = 0.1): "up" | "down" | "neutral" {
  const num = typeof change === 'string' ? parseFloat(change) : change
  
  if (isNaN(num)) return "neutral"
  
  if (num > threshold) return "up"
  if (num < -threshold) return "down"
  return "neutral"
}

/**
 * Format a comparison metric with trend
 * @param current - Current value
 * @param average - Average/baseline value
 * @returns Object with formatted change and trend direction
 */
export function formatComparisonMetric(
  current: number | string, 
  average: number | string
): { change: string; trend: "up" | "down" | "neutral"; rawChange: number } {
  const curr = typeof current === 'string' ? parseFloat(current) : current
  const avg = typeof average === 'string' ? parseFloat(average) : average
  
  if (isNaN(curr) || isNaN(avg) || avg === 0) {
    return { change: '0%', trend: 'neutral', rawChange: 0 }
  }
  
  const rawChange = ((curr - avg) / avg) * 100
  const trend = getTrendDirection(rawChange)
  const change = formatPercentage(rawChange, undefined, true)
  
  return { change, trend, rawChange }
}

// Type definitions for better type safety
export type TrendDirection = "up" | "down" | "neutral"
export type FormattedValue = string | number

export interface ComparisonMetric {
  change: string
  trend: TrendDirection
  rawChange: number
}
