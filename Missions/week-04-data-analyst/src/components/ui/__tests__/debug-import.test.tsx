/**
 * Debug Import Test
 * Test to verify if components can be imported and rendered
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Test basic import
import { KPICard } from '../kpi-card'

describe('Debug Import Test', () => {
  it('should import KPICard without errors', () => {
    console.log('KPICard imported:', KPICard)
    console.log('KPICard type:', typeof KPICard)
    console.log('KPICard keys:', Object.keys(KPICard))
    
    expect(KPICard).toBeDefined()
    // Check if it's a function or has a render method (for forwardRef)
    expect(typeof KPICard === 'function' || typeof KPICard.render === 'function').toBe(true)
  })

  it('should render a basic div without KPICard', () => {
    const TestComponent = () => <div data-testid="test-div">Test Content</div>
    
    const { container } = render(<TestComponent />)
    
    expect(screen.getByTestId('test-div')).toBeInTheDocument()
    expect(container.innerHTML).toContain('Test Content')
  })

  it('should render KPICard with minimal props', () => {
    // This should fail if KPICard has import issues
    const { container } = render(
      <KPICard title="Test" value="123" loading={false} error={false} />
    )
    
    console.log('Container HTML in debug test:', container.innerHTML)
    console.log('Document body in debug test:', document.body.innerHTML)
    
    // If we get here without throwing, the import worked
    expect(KPICard).toBeDefined()
  })
})
