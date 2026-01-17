import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Simple Test', () => {
  it('should render div with className', () => {
    render(<div className="test-class">Test</div>)
    const div = screen.getByText('Test')
    console.log('Simple test div:', div?.className)
    console.log('Simple test div outerHTML:', div?.outerHTML)
    
    expect(div).toBeInTheDocument()
    expect(div).toHaveClass('test-class')
  })

  it('should render div with attributes', () => {
    render(<div data-testid="test-div">Test</div>)
    const div = screen.getByTestId('test-div')
    console.log('Test div attributes:', div?.attributes)
    
    expect(div).toBeInTheDocument()
    expect(div?.getAttribute('data-testid')).toBe('test-div')
  })
})
