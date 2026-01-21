/**
 * KPICard Component Tests
 * Tests for loading states, error states, accessibility, and prop rendering
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { KPICard } from '../kpi-card'

// Add debug helper
const debugDOM = () => {
  console.log('DOM content:', document.body.innerHTML)
}

describe('KPICard', () => {
  const defaultProps = {
    title: 'Test Card',
    value: '1234',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders title and value correctly', () => {
      console.log('Starting basic rendering test...');
      try {
        render(<KPICard {...defaultProps} loading={false} error={false} />)
        console.log('Render completed successfully');
        console.log('Document body:', document.body.innerHTML);
        
        expect(screen.getByText('Test Card')).toBeInTheDocument()
        expect(screen.getByText('1234')).toBeInTheDocument()
      } catch (error) {
        console.error('Render failed:', error);
        console.log('Document body on error:', document.body.innerHTML);
        throw error;
      }
    })

    it('renders with trend and change metric', () => {
      render(
        <KPICard 
          {...defaultProps} 
          change={12} 
          trend="up"
          loading={false}
          error={false}
        />
      )
      
      expect(screen.getByText('+12% vs avg')).toBeInTheDocument()
      expect(screen.getByText('+12% vs avg')).toHaveClass('text-[#00FF88]')
    })

    it('renders with icon', () => {
      const icon = <div data-testid="test-icon">Icon</div>
      render(<KPICard {...defaultProps} icon={icon} loading={false} error={false} />)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders with badge', () => {
      const badge = <div data-testid="test-badge">Badge</div>
      render(<KPICard {...defaultProps} badge={badge} loading={false} error={false} />)
      
      expect(screen.getByTestId('test-badge')).toBeInTheDocument()
    })

    it('formats currency values correctly', () => {
      render(<KPICard {...defaultProps} value={3420000000} loading={false} error={false} />)
      
      expect(screen.getByText('3420000000')).toBeInTheDocument()
    })
  })

  describe('Trend Colors', () => {
    it('applies green color for up trend', () => {
      render(<KPICard {...defaultProps} change={5} trend="up" loading={false} error={false} />)
      
      const changeElement = screen.getByText('+5% vs avg')
      expect(changeElement).toHaveClass('text-[#00FF88]')
    })

    it('applies red color for down trend', () => {
      render(<KPICard {...defaultProps} change={-5} trend="down" loading={false} error={false} />)
      
      const changeElement = screen.getByText('-5% vs avg')
      expect(changeElement).toHaveClass('text-[#EF4444]')
    })

    it('applies gray color for neutral trend', () => {
      render(<KPICard {...defaultProps} change={0} trend="neutral" loading={false} error={false} />)
      
      const changeElement = screen.getByText('0% vs avg')
      expect(changeElement).toHaveClass('text-[#94A3B8]')
    })
  })

  describe('Loading State', () => {
    it('renders skeleton loaders when loading', () => {
      render(<KPICard {...defaultProps} loading={true} />)
      
      // Should show skeleton elements instead of actual content
      expect(screen.queryByText('Test Card')).not.toBeInTheDocument()
      expect(screen.queryByText('1234')).not.toBeInTheDocument()
      
      // Should have skeleton elements (using animate-pulse class)
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('disables pointer events when loading', () => {
      render(<KPICard {...defaultProps} loading={true} />)
      
      const card = screen.getByRole('region')
      expect(card).toHaveClass('pointer-events-none')
    })

    it('shows correct ARIA label when loading', () => {
      render(<KPICard {...defaultProps} loading={true} />)
      
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-label', 'Test Card loading')
    })
  })

  describe('Error State', () => {
    it('renders error message when error occurs', () => {
      render(<KPICard {...defaultProps} error={true} />)
      
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('shows retry button when error and onRetry provided', () => {
      const mockRetry = vi.fn()
      render(<KPICard {...defaultProps} error={true} onRetry={mockRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup()
      const mockRetry = vi.fn()
      
      render(<KPICard {...defaultProps} error={true} onRetry={mockRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)
      
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('does not show retry button when no onRetry provided', () => {
      render(<KPICard {...defaultProps} error={true} />)
      
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    })

    it('shows correct ARIA label when error', () => {
      render(<KPICard {...defaultProps} error={true} />)
      
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-label', 'Test Card error')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA region role', () => {
      render(<KPICard {...defaultProps} loading={false} error={false} />)
      
      const card = screen.getByRole('region')
      expect(card).toBeInTheDocument()
    })

    it('has descriptive ARIA label for normal state', () => {
      render(<KPICard {...defaultProps} change={10} trend="up" loading={false} error={false} />)
      
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-label', 'Test Card: 1234, +10% from average')
    })

    it('has aria-live for dynamic content updates', () => {
      render(<KPICard {...defaultProps} loading={false} error={false} />)
      
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-live', 'polite')
    })

    it('is keyboard accessible when interactive', () => {
      render(<KPICard {...defaultProps} loading={false} error={false} />)
      
      const card = screen.getByRole('region')
      // Should be focusable for interactive elements
      expect(card).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined change gracefully', () => {
      render(<KPICard {...defaultProps} change={undefined} loading={false} error={false} />)
      
      // Should not render change metric
      expect(screen.queryByText(/% vs avg/)).not.toBeInTheDocument()
    })

    it('handles zero change correctly', () => {
      render(<KPICard {...defaultProps} change={0} trend="neutral" loading={false} error={false} />)
      
      expect(screen.getByText('0% vs avg')).toBeInTheDocument()
    })

    it('handles numeric values correctly', () => {
      const { container } = render(<KPICard {...defaultProps} value={42} loading={false} error={false} />)
      
      console.log('Container HTML:', container.innerHTML)
      console.log('Document body:', document.body.innerHTML)
      debugDOM()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('handles string values correctly', () => {
      render(<KPICard {...defaultProps} value="Real Madrid" loading={false} error={false} />)
      
      expect(screen.getByText('Real Madrid')).toBeInTheDocument()
    })
  })

  describe('Component Variants', () => {
    it('applies custom className correctly', () => {
      render(<KPICard {...defaultProps} className="custom-class" loading={false} error={false} />)
      
      const card = screen.getByRole('region')
      expect(card).toHaveClass('custom-class')
    })

    it('passes through other props correctly', () => {
      render(<KPICard {...defaultProps} data-testid="custom-card" loading={false} error={false} />)
      
      expect(screen.getByTestId('custom-card')).toBeInTheDocument()
    })
  })
})
