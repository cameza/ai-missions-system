import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../button'
import { Input } from '../input'
import { SearchInput } from '../search-input'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-white/10')

    rerender(<Button variant="gradient">Gradient</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12')
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    // Check that disabled styling is applied (opacity-50 is part of disabled:opacity-50)
    expect(button.className).toContain('disabled:opacity-50')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('disabled')
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('has proper focus indicators', () => {
    render(<Button>Focus Test</Button>)
    const button = screen.getByRole('button')
    
    // Verify focus-visible styles are present in className
    expect(button.className).toContain('focus-visible:ring-2')
    expect(button.className).toContain('focus-visible:ring-accent-green')
  })

  it('is keyboard accessible', () => {
    render(<Button>Keyboard Test</Button>)
    const button = screen.getByRole('button')
    
    // Verify button is keyboard accessible (native button element handles this)
    expect(button.tagName).toBe('BUTTON')
    expect(button).not.toHaveAttribute('tabindex', '-1')
  })
})

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('bg-[#12121A]')
  })

  it('shows error state', () => {
    render(<Input error placeholder="Error input" />)
    expect(screen.getByPlaceholderText('Error input')).toHaveClass('border-destructive')
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('has proper focus styles', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    // Verify focus-visible styles are present
    expect(input.className).toContain('focus-visible:ring-2')
    expect(input.className).toContain('focus-visible:ring-accent-green')
  })
})

describe('SearchInput Component', () => {
  it('renders with search icon', () => {
    render(<SearchInput placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    // Check for search icon (should be present but not visible to screen reader)
    const searchIcon = document.querySelector('.lucide-search')
    expect(searchIcon).toBeInTheDocument()
  })

  it('shows clear button when has value', () => {
    const handleClear = vi.fn()
    render(<SearchInput value="test" onClear={handleClear} />)
    
    const clearButton = screen.getByRole('button', { name: 'Clear search' })
    expect(clearButton).toBeInTheDocument()
    
    fireEvent.click(clearButton)
    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('hides clear button when no value', () => {
    render(<SearchInput value="" />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('can hide clear button completely', () => {
    render(<SearchInput value="test" showClearButton={false} />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(<SearchInput placeholder="Search..." />)
    const input = screen.getByPlaceholderText('Search...')
    
    fireEvent.keyDown(input, { key: 'Enter' })
    // Should not crash and should handle the key event
    expect(input).toBeInTheDocument()
  })

  it('has proper ARIA labels for accessibility', () => {
    const handleClear = vi.fn()
    render(<SearchInput value="test" onClear={handleClear} placeholder="Search..." />)
    
    // Check search input has proper role
    const searchInput = screen.getByPlaceholderText('Search...')
    expect(searchInput).toHaveAttribute('role', 'searchbox')
    
    // Check clear button has proper ARIA label
    const clearButton = screen.getByRole('button', { name: 'Clear search' })
    expect(clearButton).toHaveAttribute('aria-label', 'Clear search')
  })

  it('clear button has proper touch target size', () => {
    const handleClear = vi.fn()
    render(<SearchInput value="test" onClear={handleClear} />)
    
    const clearButton = screen.getByRole('button', { name: 'Clear search' })
    // Should have h-8 w-8 classes for 32px minimum touch target
    expect(clearButton).toHaveClass('h-8 w-8')
  })
})

describe('Component Integration', () => {
  it('components work together in a form', () => {
    const handleSubmit = vi.fn()
    render(
      <form onSubmit={handleSubmit}>
        <SearchInput name="search" placeholder="Search transfers..." />
        <Button type="submit">Search</Button>
      </form>
    )

    const searchInput = screen.getByPlaceholderText('Search transfers...')
    const submitButton = screen.getByRole('button', { name: 'Search' })

    fireEvent.change(searchInput, { target: { value: 'test query' } })
    fireEvent.click(submitButton)

    expect(searchInput).toHaveValue('test query')
  })
})
