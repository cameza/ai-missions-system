/**
 * Number Formatting Utilities Tests
 * Tests for formatNumber, formatCurrency, formatPercentage, and formatComparisonMetric
 */

import { describe, it, expect } from 'vitest'
import { 
  formatNumber, 
  formatCurrency, 
  formatPercentage, 
  getTrendDirection,
  formatComparisonMetric 
} from '../formatters'

describe('formatNumber', () => {
  it('formats numbers with comma separators', () => {
    expect(formatNumber(1234)).toBe('1,234')
    expect(formatNumber(1000000)).toBe('1,000,000')
    expect(formatNumber(0)).toBe('0')
  })

  it('handles string inputs', () => {
    expect(formatNumber('1234')).toBe('1,234')
    expect(formatNumber('1000000')).toBe('1,000,000')
  })

  it('handles invalid inputs', () => {
    expect(formatNumber(NaN)).toBe('0')
    expect(formatNumber('invalid')).toBe('0')
  })
})

describe('formatCurrency', () => {
  it('formats large numbers with abbreviations', () => {
    expect(formatCurrency(3420000000)).toBe('€3.42B')
    expect(formatCurrency(180000000)).toBe('€180M')
    expect(formatCurrency(1200)).toBe('€1.2K')
    expect(formatCurrency(500)).toBe('€500')
  })

  it('handles custom currency symbols', () => {
    expect(formatCurrency(1000000, '$')).toBe('$1M')
    expect(formatCurrency(1000000, '£')).toBe('£1M')
  })

  it('handles string inputs', () => {
    expect(formatCurrency('3420000000')).toBe('€3.42B')
    expect(formatCurrency('180000000')).toBe('€180M')
  })

  it('handles invalid inputs', () => {
    expect(formatCurrency(NaN)).toBe('€0')
    expect(formatCurrency('invalid')).toBe('€0')
  })

  it('handles edge cases', () => {
    expect(formatCurrency(999)).toBe('€999')
    expect(formatCurrency(1000)).toBe('€1.0K')
    expect(formatCurrency(999999)).toBe('€999999')
    expect(formatCurrency(1000000)).toBe('€1M')
  })
})

describe('formatPercentage', () => {
  it('formats percentages with signs', () => {
    expect(formatPercentage(12)).toBe('+12%')
    expect(formatPercentage(-5)).toBe('-5%')
    expect(formatPercentage(0)).toBe('0%')
  })

  it('calculates percentage from baseline', () => {
    expect(formatPercentage(12, 10)).toBe('+20%')
    expect(formatPercentage(8, 10)).toBe('-20%')
    expect(formatPercentage(10, 10)).toBe('0%')
  })

  it('handles sign control', () => {
    expect(formatPercentage(12, undefined, false)).toBe('12%')
    expect(formatPercentage(-5, undefined, false)).toBe('5%')
    expect(formatPercentage(0, undefined, false)).toBe('0%')
  })

  it('handles string inputs', () => {
    expect(formatPercentage('12')).toBe('+12%')
    expect(formatPercentage('-5')).toBe('-5%')
  })

  it('handles invalid inputs', () => {
    expect(formatPercentage(NaN)).toBe('0%')
    expect(formatPercentage('invalid')).toBe('0%')
  })

  it('handles zero baseline', () => {
    expect(formatPercentage(12, 0)).toBe('+12%')
  })
})

describe('getTrendDirection', () => {
  it('determines trend direction correctly', () => {
    expect(getTrendDirection(5)).toBe('up')
    expect(getTrendDirection(-5)).toBe('down')
    expect(getTrendDirection(0)).toBe('neutral')
    expect(getTrendDirection(0.05)).toBe('neutral')
  })

  it('respects threshold parameter', () => {
    expect(getTrendDirection(0.2, 0.1)).toBe('up')
    expect(getTrendDirection(-0.2, 0.1)).toBe('down')
    expect(getTrendDirection(0.05, 0.1)).toBe('neutral')
  })

  it('handles string inputs', () => {
    expect(getTrendDirection('5')).toBe('up')
    expect(getTrendDirection('-5')).toBe('down')
    expect(getTrendDirection('0')).toBe('neutral')
  })

  it('handles invalid inputs', () => {
    expect(getTrendDirection(NaN)).toBe('neutral')
    expect(getTrendDirection('invalid')).toBe('neutral')
  })
})

describe('formatComparisonMetric', () => {
  it('calculates comparison metrics correctly', () => {
    const result = formatComparisonMetric(12, 10)
    
    expect(result.change).toBe('+20%')
    expect(result.trend).toBe('up')
    expect(result.rawChange).toBe(20)
  })

  it('handles negative changes', () => {
    const result = formatComparisonMetric(8, 10)
    
    expect(result.change).toBe('-20%')
    expect(result.trend).toBe('down')
    expect(result.rawChange).toBe(-20)
  })

  it('handles no change', () => {
    const result = formatComparisonMetric(10, 10)
    
    expect(result.change).toBe('0%')
    expect(result.trend).toBe('neutral')
    expect(result.rawChange).toBe(0)
  })

  it('handles string inputs', () => {
    const result = formatComparisonMetric('12', '10')
    
    expect(result.change).toBe('+20%')
    expect(result.trend).toBe('up')
    expect(result.rawChange).toBe(20)
  })

  it('handles invalid inputs', () => {
    const result = formatComparisonMetric(NaN, 10)
    
    expect(result.change).toBe('0%')
    expect(result.trend).toBe('neutral')
    expect(result.rawChange).toBe(0)
  })

  it('handles zero baseline', () => {
    const result = formatComparisonMetric(12, 0)
    
    expect(result.change).toBe('0%')
    expect(result.trend).toBe('neutral')
    expect(result.rawChange).toBe(0)
  })

  it('handles edge cases with small numbers', () => {
    const result1 = formatComparisonMetric(10.7, 10.5)
    expect(result1.trend).toBe('up')
    
    const result2 = formatComparisonMetric(10.3, 10.5)
    expect(result2.trend).toBe('down')
  })
})

describe('Integration Tests', () => {
  it('works together for dashboard use cases', () => {
    // Today's transfers: 12 vs average 10.7
    const todayComparison = formatComparisonMetric(12, 10.7)
    expect(todayComparison.change).toBe('+12%')
    expect(todayComparison.trend).toBe('up')
    
    // Window total formatting
    expect(formatNumber(1247)).toBe('1,247')
    
    // Total spend formatting
    expect(formatCurrency(3420000000)).toBe('€3.42B')
    
    // Most active team (no comparison needed)
    expect(formatNumber(8)).toBe('8')
  })
})
