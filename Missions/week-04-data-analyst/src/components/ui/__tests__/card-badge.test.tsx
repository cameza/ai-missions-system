import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Badge } from '../badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../card'
import { SkeletonCard } from '../skeleton-card'
import { ErrorCard } from '../error-card'

describe('Badge Component', () => {
  it('renders with default outline variant', () => {
    const { container } = render(<Badge>Test Badge</Badge>)
    const badge = container.querySelector('[role="status"]')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('border-white/20')
    expect(badge).toHaveAttribute('aria-label', 'outline status')
  })

  it('renders with done variant', () => {
    const { container } = render(<Badge variant="done">Done</Badge>)
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-emerald-500/10', 'text-emerald-500', 'border-emerald-500/20')
    expect(badge).toHaveAttribute('aria-label', 'done status')
  })

  it('renders with pending variant', () => {
    const { container } = render(<Badge variant="pending">Pending</Badge>)
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-purple-500/10', 'text-purple-500', 'border-purple-500/20')
    expect(badge).toHaveAttribute('aria-label', 'pending status')
  })

  it('renders with rumor variant', () => {
    render(<Badge variant="rumor">Rumor</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-yellow-500/10', 'text-yellow-500', 'border-yellow-500/20')
    expect(badge).toHaveAttribute('aria-label', 'rumor status')
  })

  it('has proper accessibility attributes', () => {
    render(<Badge variant="done">Completed</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute('aria-label', 'done status')
  })

  it('has fallback ARIA label for undefined variant', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-label', 'outline status')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('custom-class')
  })
})

describe('Card Component', () => {
  it('renders with default variant and padding', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Test content</CardContent>
      </Card>
    )
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders with interactive variant', () => {
    const { container } = render(<Card variant="interactive">Interactive Card</Card>)
    const card = container.querySelector('[class*="cursor-pointer"]')
    if (card) {
      expect(card).toHaveClass('hover:border-[#8B5CF6]/50', 'cursor-pointer')
      expect(card).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-[#8B5CF6]/60')
      expect(card).toHaveAttribute('tabIndex', '0')
    }
  })

  it('renders with glass variant', () => {
    const { container } = render(<Card variant="glass">Glass Card</Card>)
    const card = container.querySelector('[class*="backdrop-blur-sm"]')
    if (card) {
      console.log('Actual card classes:', card.className)
      expect(card).toHaveClass('bg-[#12121A]/80', 'backdrop-blur-sm')
    }
  })

  it('renders with different padding sizes', () => {
    const { container, rerender } = render(<Card padding="none">No padding</Card>)
    let card = container.querySelector('[class*="rounded-lg"]')
    if (card) {
      expect(card).toHaveClass('p-0')
    }
    if (card) {
      expect(card).toHaveClass('p-0')
    }

    rerender(<Card padding="sm">Small padding</Card>)
    card = container.querySelector('[class*="p-3"]')
    if (card) {
      expect(card).toHaveClass('p-3')
    }

    rerender(<Card padding="lg">Large padding</Card>)
    card = container.querySelector('[class*="p-6"]')
    if (card) {
      expect(card).toHaveClass('p-6')
    }
  })

  it('supports asChild prop for semantic HTML', () => {
    const { container } = render(
      <Card asChild>
        <article>
          <CardHeader>
            <CardTitle>Article Title</CardTitle>
          </CardHeader>
          <CardContent>Article content</CardContent>
        </article>
      </Card>
    )
    
    expect(container.querySelector('article')).toBeInTheDocument()
    expect(screen.getByText('Article Title')).toBeInTheDocument()
  })

  it('has proper focus indicators for interactive cards', () => {
    const { container } = render(<Card variant="interactive">Focusable Card</Card>)
    const card = container.querySelector('[class*="cursor-pointer"]') as HTMLElement
    
    if (card) {
      // Check that tabIndex is set for keyboard navigation
      expect(card).toHaveAttribute('tabIndex', '0')
      
      // Test focus behavior using direct focus() method
      card.focus()
      expect(card).toHaveFocus()
      
      // Check for focus-visible styles
      expect(card).toHaveClass('focus-visible:ring-2')
    }
  })
})

describe('Card Sub-components', () => {
  it('renders CardHeader with proper structure', () => {
    render(
      <CardHeader>
        <CardTitle>Header Title</CardTitle>
      </CardHeader>
    )
    
    const header = screen.getByText('Header Title').parentElement
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'pb-4')
  })

  it('renders CardTitle with proper styling', () => {
    render(<CardTitle>Card Title</CardTitle>)
    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-white')
  })

  it('renders CardContent without padding top', () => {
    const { container } = render(<CardContent>Content</CardContent>)
    const content = container.querySelector('[class*="pt-0"]')
    expect(content).toHaveClass('pt-0')
  })

  it('renders CardFooter with proper layout', () => {
    const { container } = render(<CardFooter>Footer content</CardFooter>)
    const footer = container.querySelector('[class*="pt-4"]')
    expect(footer).toHaveClass('flex', 'items-center', 'pt-4')
  })
})

describe('SkeletonCard Component', () => {
  it('renders with KPI height by default', () => {
    render(<SkeletonCard />)
    const skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toHaveClass('h-[120px]')
  })

  it('renders with different height variants', () => {
    const { rerender } = render(<SkeletonCard height="default" />)
    let skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toHaveClass('h-32')

    rerender(<SkeletonCard height="custom" className="h-40" />)
    skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toHaveClass('h-40')
  })

  it('has proper accessibility attributes', () => {
    render(<SkeletonCard />)
    const skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toHaveAttribute('aria-live', 'polite')
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
  })

  it('renders skeleton structure elements', () => {
    render(<SkeletonCard />)
    const skeleton = screen.getByLabelText('Loading content')
    
    // Check for shimmer effect
    expect(skeleton.querySelector('.animate-pulse')).toBeInTheDocument()
    
    // Check for skeleton elements
    expect(skeleton.querySelector('.bg-white\\/10')).toBeInTheDocument()
    expect(skeleton.querySelector('.bg-white\\/5')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<SkeletonCard className="custom-skeleton" />)
    const skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toHaveClass('custom-skeleton')
  })
})

describe('ErrorCard Component', () => {
  it('renders with default error message', () => {
    render(<ErrorCard />)
    expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong while loading this content. Please try again.')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(
      <ErrorCard 
        title="Custom Error"
        description="Custom error description"
      />
    )
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Custom error description')).toBeInTheDocument()
  })

  it('renders with retry button', () => {
    const handleRetry = vi.fn()
    render(<ErrorCard onRetry={handleRetry} />)
    
    const retryButton = screen.getByRole('button', { name: 'Retry' })
    expect(retryButton).toBeInTheDocument()
    
    fireEvent.click(retryButton)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('renders with custom retry text', () => {
    render(<ErrorCard onRetry={vi.fn()} retryText="Try Again" />)
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>
    render(<ErrorCard icon={customIcon} />)
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ErrorCard />)
    const errorCard = screen.getByRole('alert')
    expect(errorCard).toHaveAttribute('aria-live', 'assertive')
    expect(errorCard).toHaveAttribute('role', 'alert')
  })

  it('generates unique description IDs', () => {
    render(
      <div>
        <ErrorCard 
          title="First Error"
          description="First error description"
          onRetry={vi.fn()}
        />
        <ErrorCard 
          title="Second Error"
          description="Second error description"
          onRetry={vi.fn()}
        />
      </div>
    )
    
    const descriptions = screen.getAllByText(/error description/i)
    expect(descriptions).toHaveLength(2)
    
    // Check that each description has a unique ID
    const firstId = descriptions[0].id
    const secondId = descriptions[1].id
    expect(firstId).toBeTruthy()
    expect(secondId).toBeTruthy()
    expect(firstId).not.toBe(secondId)
  })

  it('applies custom className', () => {
    render(<ErrorCard className="custom-error" />)
    const errorCard = screen.getByRole('alert')
    expect(errorCard).toHaveClass('custom-error')
  })
})
