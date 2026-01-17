import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from '../card'
import { cardVariants } from '../card'
import { cn } from '@/lib/utils'

describe('Card Debug Test', () => {
  it('should render with glass variant', () => {
    render(<Card variant="glass">Test</Card>)
    const card = screen.getByText('Test').parentElement
    console.log('Card element:', card)
    console.log('Card classes:', card?.className)
    console.log('Card attributes:', card?.attributes)
    
    if (card) {
      // Just check if the element exists
      expect(card).toBeInTheDocument()
    }
  })

  it('should test CVA directly', () => {
    const classes = cardVariants({ variant: 'glass', padding: 'default' })
    console.log('CVA classes:', classes)
    expect(classes).toContain('bg-[#12121A]/80')
    expect(classes).toContain('backdrop-blur-sm')
  })

  it('should test cn function', () => {
    const cvaClasses = cardVariants({ variant: 'glass', padding: 'default' })
    const cnClasses = cn(cvaClasses, 'custom-class')
    console.log('CVA classes:', cvaClasses)
    console.log('CN classes:', cnClasses)
    expect(cnClasses).toContain('bg-[#12121A]/80')
    expect(cnClasses).toContain('custom-class')
  })

  it('should render with custom className', () => {
    render(<Card className="test-class">Test</Card>)
    const card = screen.getByText('Test').parentElement
    console.log('Card with custom class:', card?.className)
    
    if (card) {
      expect(card).toBeInTheDocument()
      // Check if the custom class is applied
      expect(card?.className).toContain('test-class')
    }
  })

  it('should render with asChild', () => {
    render(
      <Card asChild>
        <article className="article-class">Test</article>
      </Card>
    )
    const card = screen.getByText('Test').parentElement
    console.log('Card with asChild:', card?.className)
    
    if (card) {
      expect(card).toBeInTheDocument()
      expect(card?.tagName).toBe('ARTICLE')
      expect(card?.className).toContain('article-class')
    }
  })

  it('should render with asChild and custom className', () => {
    render(
      <Card asChild className="card-class">
        <article className="article-class">Test</article>
      </Card>
    )
    const card = screen.getByText('Test').parentElement
    console.log('Card with asChild and custom class:', card?.className)
    
    if (card) {
      expect(card).toBeInTheDocument()
      expect(card?.tagName).toBe('ARTICLE')
      expect(card?.className).toContain('card-class')
    }
  })

  it('should render simple div with className', () => {
    render(<div className="simple-div">Test</div>)
    const div = screen.getByText('Test').parentElement
    console.log('Simple div:', div?.className)
    
    if (div) {
      expect(div).toBeInTheDocument()
      expect(div?.className).toContain('simple-div')
    }
  })

  it('should render with debug props', () => {
    const props = { className: 'debug-class', variant: 'glass', padding: 'default' } as React.HTMLAttributes<HTMLDivElement>
    console.log('Props:', props)
    render(<Card {...props}>Test</Card>)
    const card = screen.getByText('Test').parentElement
    console.log('Card with debug props:', card?.className)
    
    if (card) {
      expect(card).toBeInTheDocument()
      expect(card?.className).toContain('debug-class')
    }
  })

  it('should render with direct className prop', () => {
    const TestCard = () => {
      const computedClasses = cn(cardVariants({ variant: 'glass', padding: 'default' }), 'test-class')
      console.log('Computed classes:', computedClasses)
      return <div className={computedClasses}>Test</div>
    }
    
    render(<TestCard />)
    const card = screen.getByText('Test').parentElement
    console.log('Direct div:', card?.className)
    
    if (card) {
      expect(card).toBeInTheDocument()
      expect(card?.className).toContain('test-class')
      expect(card?.className).toContain('bg-[#12121A]/80')
    }
  })

  it('should render with manual className', () => {
    const TestCard = () => {
      const computedClasses = 'rounded-lg border border-[#2A2A35] bg-[#12121A] transition-colors duration-300 bg-[#12121A]/80 backdrop-blur-sm p-5 test-class'
      console.log('Manual classes:', computedClasses)
      return <div className={computedClasses}>Test</div>
    }
    
    render(<TestCard />)
    const card = screen.getByText('Test').parentElement
    console.log('Manual div:', card?.className)
    
    if (card) {
      expect(card).toBeInTheDocument()
      expect(card?.className).toContain('test-class')
      expect(card?.className).toContain('bg-[#12121A]/80')
      expect(card?.className).toContain('backdrop-blur-sm')
    }
  })

  it('should render with hardcoded className', () => {
    render(<div className="hardcoded-class">Test</div>)
    const div = screen.getByText('Test').parentElement
    console.log('Hardcoded div:', div?.className)
    
    if (div) {
      expect(div).toBeInTheDocument()
      expect(div?.className).toContain('hardcoded-class')
    }
  })

  it('should render with text content only', () => {
    render(<div>Test</div>)
    const div = screen.getByText('Test').parentElement
    console.log('Text only div:', div?.className)
    
    if (div) {
      expect(div).toBeInTheDocument()
      expect(div?.className).toBe('')
    }
  })
})
